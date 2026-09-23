
import { randomBytes } from "node:crypto";
import supabase from "./db-client.js";

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
        .from("sos_contacts")
        .select(
          "id,name,phone,relation,telegram_connected_at"
        )
        .eq("user_id", userId)
        .order("id");

      if (error) throw error;

      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const { user_id, name, phone, relation } = req.body || {};

      if (
        !user_id ||
        !name?.trim() ||
        !/^[6-9]\d{9}$/.test(String(phone))
      ) {
        return res.status(400).json({
          error: "Valid name and 10-digit mobile number required"
        });
      }

      const { data, error } = await supabase
        .from("sos_contacts")
        .insert({
          user_id,
          name: name.trim(),
          phone: String(phone),
          relation: relation || ""
        })
        .select(
          "id,name,phone,relation,telegram_connected_at"
        )
        .single();

      if (error) throw error;

      return res.status(201).json(data);
    }

    if (req.method === "PATCH") {
      const { id, user_id } = req.body || {};

      if (!id || !user_id) {
        return res.status(400).json({
          error: "Contact ID and user ID required"
        });
      }

      const { data: contact, error: lookupError } =
        await supabase
          .from("sos_contacts")
          .select("id")
          .eq("id", id)
          .eq("user_id", user_id)
          .maybeSingle();

      if (lookupError) throw lookupError;

      if (!contact) {
        return res.status(404).json({
          error: "Contact not found"
        });
      }

      const botUsername =
        process.env.TELEGRAM_BOT_USERNAME?.replace(/^@/, "");

      if (!botUsername) {
        return res.status(500).json({
          error: "TELEGRAM_BOT_USERNAME missing"
        });
      }

      const code = randomBytes(18).toString("hex");

      const expiresAt = new Date(
        Date.now() + 30 * 60 * 1000
      ).toISOString();

      const { error } = await supabase
        .from("sos_contacts")
        .update({
          telegram_link_code: code,
          telegram_link_expires_at: expiresAt,
        })
        .eq("id", id)
        .eq("user_id", user_id);

      if (error) throw error;

      return res.status(200).json({
        link: `https://t.me/${botUsername}?start=${code}`,
        expires_at: expiresAt
      });
    }

    if (req.method === "DELETE") {
      const { id, user_id } = req.query;

      if (!id || !user_id) {
        return res.status(400).json({
          error: "Contact ID and user ID required"
        });
      }

      const { error } = await supabase
        .from("sos_contacts")
        .delete()
        .eq("id", id)
        .eq("user_id", user_id);

      if (error) throw error;

      return res.status(200).json({
        ok: true
      });
    }

    return res.status(405).json({
      error: "Method not allowed"
    });
  } catch (error) {
    console.error("SOS contacts:", error);

    return res.status(500).json({
      error: "Emergency contact request failed"
    });
  }
}