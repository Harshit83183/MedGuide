
import supabase from "./db-client.js";
import { sendTelegram, baseUrl } from "./sos-telegram.js";

const validCoordinate = (value, limit) =>
  value !== null &&
  value !== undefined &&
  value !== "" &&
  Number.isFinite(Number(value)) &&
  Math.abs(Number(value)) <= limit;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  try {
    if (req.method === "GET") {
      const userId = String(req.query.user_id || "");

      if (!userId) {
        return res.status(400).json({
          error: "User ID required"
        });
      }

      const { data, error } = await supabase
        .from("sos_alerts")
        .select(
          "id,status,note,created_at,last_location_at,tracking_token"
        )
        .eq("user_id", userId)
        .order("id", { ascending: false })
        .limit(30);

      if (error) throw error;

      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const { user_id, user_name, lat, lng, note } =
        req.body || {};

      if (
        !user_id ||
        !validCoordinate(lat, 90) ||
        !validCoordinate(lng, 180)
      ) {
        return res.status(400).json({
          error: "Valid user and GPS location required"
        });
      }

      const { data: contacts, error: contactError } =
        await supabase
          .from("sos_contacts")
          .select("id,name,telegram_chat_id")
          .eq("user_id", user_id)
          .not("telegram_chat_id", "is", null);

      if (contactError) throw contactError;

      if (!contacts?.length) {
        return res.status(400).json({
          error: "Connect at least one Telegram contact first"
        });
      }

      const { data: existing, error: existingError } =
        await supabase
          .from("sos_alerts")
          .select("id")
          .eq("user_id", user_id)
          .eq("status", "active")
          .limit(1);

      if (existingError) throw existingError;

      if (existing?.length) {
        return res.status(409).json({
          error: "An SOS is already active"
        });
      }

      const now = new Date().toISOString();

      const { data: alert, error: createError } =
        await supabase
          .from("sos_alerts")
          .insert({
            user_id,
            lat: String(lat),
            lng: String(lng),
            address_text: "Live GPS",
            note: String(note || "").slice(0, 300),
            status: "active",
            last_location_at: now
          })
          .select("id,status,tracking_token")
          .single();

      if (createError) throw createError;

      const { error: locationError } = await supabase
        .from("sos_locations")
        .insert({
          alert_id: alert.id,
          latitude: Number(lat),
          longitude: Number(lng),
          created_at: now
        });

      if (locationError) {
        console.error("Initial GPS save failed:", locationError);
      }

      const trackingUrl =
        `${baseUrl()}/sos-track.html?token=` +
        encodeURIComponent(alert.tracking_token);

      const message = [
        "🚨 MEDGUIDE EMERGENCY SOS",
        "",
        `${String(user_name || "Your contact").slice(0, 100)} needs help.`,
        note ? `Message: ${String(note).slice(0, 300)}` : "",
        "",
        `Live location: ${trackingUrl}`,
        "",
        "If this is an immediate emergency, call local emergency services."
      ].filter(Boolean).join("\n");

      const delivery = await Promise.all(
        contacts.map(async contact => {
          try {
            await sendTelegram(
              contact.telegram_chat_id,
              message
            );

            return {
              name: contact.name,
              sent: true
            };
          } catch (error) {
            console.error(
              "Telegram alert failed:",
              contact.id,
              error
            );

            return {
              name: contact.name,
              sent: false
            };
          }
        })
      );

      return res.status(201).json({
        id: alert.id,
        status: alert.status,
        tracking_url: trackingUrl,
        delivery
      });
    }

    if (req.method === "PUT") {
      const { id, user_id } = req.body || {};

      if (!id || !user_id) {
        return res.status(400).json({
          error: "Alert ID and user ID required"
        });
      }

      const { data: alert, error } = await supabase
        .from("sos_alerts")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString()
        })
        .eq("id", id)
        .eq("user_id", user_id)
        .eq("status", "active")
        .select("id")
        .maybeSingle();

      if (error) throw error;

      if (!alert) {
        return res.status(404).json({
          error: "Active SOS not found"
        });
      }

      const { data: contacts, error: contactError } =
        await supabase
          .from("sos_contacts")
          .select("telegram_chat_id")
          .eq("user_id", user_id)
          .not("telegram_chat_id", "is", null);

      if (contactError) {
        console.error("Contact lookup:", contactError);
      }

      const delivery = await Promise.all(
        (contacts || []).map(async contact => {
          try {
            await sendTelegram(
              contact.telegram_chat_id,
              "✅ MedGuide SOS resolved. The person has marked themselves safe. Live tracking has stopped."
            );
            return true;
          } catch {
            return false;
          }
        })
      );

      return res.status(200).json({
        ok: true,
        delivered: delivery.filter(Boolean).length
      });
    }

    return res.status(405).json({
      error: "Method not allowed"
    });
  } catch (error) {
    console.error("SOS alerts error:", error);

    return res.status(500).json({
      error: "SOS request failed. Call emergency services if urgent."
    });
  }
}