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

    console.log("Checking webhook info...")

    // Get webhook info
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`)
    const data = await response.json()

    console.log("Webhook info response:", data)

    if (data.ok) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: "success",
          message: "Webhook info retrieved",
          webhook_info: {
            url: data.result.url,
            has_custom_certificate: data.result.has_custom_certificate,
            pending_update_count: data.result.pending_update_count,
            last_error_date: data.result.last_error_date,
            last_error_message: data.result.last_error_message,
            max_connections: data.result.max_connections,
            allowed_updates: data.result.allowed_updates,
          },
        }),
      }
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          status: "error",
          message: "Failed to get webhook info",
          telegram_response: data,
        }),
      }
    }
  } catch (error) {
    console.error("Error checking webhook:", error)
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
