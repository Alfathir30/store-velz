const fetch = require("node-fetch")

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ""

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Content-Type": "application/json",
  }

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" }
  }

  try {
    if (!TELEGRAM_BOT_TOKEN) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          status: "error",
          message: "TELEGRAM_BOT_TOKEN not set",
        }),
      }
    }

    // Get the site URL from Netlify context
    const siteUrl = `https://${event.headers.host}`
    const webhookUrl = `${siteUrl}/.netlify/functions/telegram-webhook`

    console.log("Setting up webhook:", webhookUrl)

    // Set webhook
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message", "callback_query"],
      }),
    })

    const data = await response.json()
    console.log("Webhook setup response:", data)

    if (data.ok) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: "success",
          message: "Webhook berhasil di-setup",
          webhook_url: webhookUrl,
          telegram_response: data,
        }),
      }
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          status: "error",
          message: "Gagal setup webhook",
          telegram_response: data,
        }),
      }
    }
  } catch (error) {
    console.error("Error setting up webhook:", error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: "error",
        message: "Internal server error: " + error.message,
      }),
    }
  }
}
