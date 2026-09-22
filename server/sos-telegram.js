
export async function sendTelegram(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN missing");
  }

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true
      })
    }
  );

  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(result.description || "Telegram message failed");
  }

  return result.result;
}

export function baseUrl() {
  const url = process.env.PUBLIC_SITE_URL;

  if (!url) {
    throw new Error("PUBLIC_SITE_URL missing");
  }

  return url.replace(/\/$/, "");
}