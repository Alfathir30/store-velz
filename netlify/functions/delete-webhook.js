const fetch = require("node-fetch")

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8111172635:AAG6nTMKB-Mj4aZDEHn4ldC6sjB-FH8-zQs"

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

    console.log("Deleting webhook...")

    // Delete webhook
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`, {
      method: "POST",
    })

    const data = await response.json()
    console.log("Delete webhook response:", data)

    if (data.ok) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: "success",
          message: "Webhook berhasil dihapus",
          telegram_response: data,
        }),
      }
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          status: "error",
          message: "Gagal hapus webhook",
          telegram_response: data,
        }),
      }
    }
  } catch (error) {
    console.error("Error deleting webhook:", error)
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
