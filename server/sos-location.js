
import supabase from "./db-client.js";

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
      const token = String(req.query.token || "");

      if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)
      ) {
        return res.status(400).json({
          error: "Invalid tracking link"
        });
      }

      const { data: alert, error } = await supabase
        .from("sos_alerts")
        .select(
          "id,status,last_location_at,resolved_at"
        )
        .eq("tracking_token", token)
        .maybeSingle();

      if (error) throw error;

      if (!alert) {
        return res.status(404).json({
          error: "Tracking link not found"
        });
      }

      if (alert.status !== "active") {
        return res.status(200).json({
          status: "resolved",
          resolved_at: alert.resolved_at
        });
      }

      const { data: point, error: pointError } =
        await supabase
          .from("sos_locations")
          .select(
            "latitude,longitude,accuracy,created_at"
          )
          .eq("alert_id", alert.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

      if (pointError) throw pointError;

      return res.status(200).json({
        status: "active",
        point,
        last_location_at: alert.last_location_at
      });
    }

    if (req.method === "POST") {
      const {
        alert_id,
        user_id,
        lat,
        lng,
        accuracy
      } = req.body || {};

      if (
        !alert_id ||
        !user_id ||
        !validCoordinate(lat, 90) ||
        !validCoordinate(lng, 180)
      ) {
        return res.status(400).json({
          error: "Invalid GPS update"
        });
      }

      const { data: alert, error } = await supabase
        .from("sos_alerts")
        .select("id")
        .eq("id", alert_id)
        .eq("user_id", user_id)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;

      if (!alert) {
        return res.status(404).json({
          error: "Active SOS not found"
        });
      }

      const now = new Date().toISOString();

      const { error: insertError } = await supabase
        .from("sos_locations")
        .insert({
          alert_id: alert.id,
          latitude: Number(lat),
          longitude: Number(lng),
          accuracy:
            accuracy !== null &&
            accuracy !== undefined &&
            Number.isFinite(Number(accuracy))
              ? Number(accuracy)
              : null,
          created_at: now
        });

      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from("sos_alerts")
        .update({
          lat: String(lat),
          lng: String(lng),
          last_location_at: now
        })
        .eq("id", alert.id)
        .eq("status", "active");

      if (updateError) throw updateError;

      return res.status(200).json({
        ok: true,
        updated_at: now
      });
    }

    return res.status(405).json({
      error: "Method not allowed"
    });
  } catch (error) {
    console.error("SOS location:", error);

    return res.status(500).json({
      error: "Location request failed"
    });
  }
}