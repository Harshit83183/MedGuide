
import supabase from "./db-client.js";
import { sendTelegram } from "./sos-telegram.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "POST only"
    });
  }

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (
    !secret ||
    req.headers["x-telegram-bot-api-secret-token"] !== secret
  ) {
    return res.status(403).json({
      error: "Forbidden"
    });
  }

  const chatId = req.body?.message?.chat?.id;
  const message = String(req.body?.message?.text || "");

  const code = /^\/start ([a-f0-9]{36})$/.exec(message)?.[1];

  if (!chatId || !code) {
    return res.status(200).json({
      ok: true
    });
  }

  try {
    const { data: contact, error } = await supabase
      .from("sos_contacts")
      .select("id,telegram_link_expires_at")
      .eq("telegram_link_code", code)
      .maybeSingle();

    if (error) throw error;

    if (
      !contact ||
      !contact.telegram_link_expires_at ||
      new Date(contact.telegram_link_expires_at).getTime() <
        Date.now()
    ) {
      await sendTelegram(
        chatId,
        "This MedGuide invitation is invalid or expired. Please request a new link."
      );

      return res.status(200).json({
        ok: true
      });
    }

    const { error: updateError } = await supabase
      .from("sos_contacts")
      .update({
        telegram_chat_id: String(chatId),
        telegram_connected_at: new Date().toISOString(),
        telegram_link_code: null,
        telegram_link_expires_at: null
      })
      .eq("id", contact.id)
      .eq("telegram_link_code", code);

    if (updateError) throw updateError;

    await sendTelegram(
      chatId,
      "You are now connected as a MedGuide emergency contact. You will receive SOS alerts and live-location links here."
    );

    return res.status(200).json({
      ok: true
    });
  } catch (error) {
    console.error("Telegram webhook:", error);

    return res.status(500).json({
      error: "Webhook processing failed"
    });
  }
}