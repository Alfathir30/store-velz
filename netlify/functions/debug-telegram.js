const fetch = require("node-fetch")

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ""
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || ""

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
    const debugInfo = {
      environment: {
        botToken: TELEGRAM_BOT_TOKEN ? "SET" : "NOT SET",
        chatId: TELEGRAM_CHAT_ID ? "SET" : "NOT SET",
        netlifyUrl: event.headers.host,
        webhookUrl: `https://${event.headers.host}/.netlify/functions/telegram-webhook`,
      },
      botInfo: null,
      webhookInfo: null,
      chatInfo: null,
      updates: null,
      errors: [],
    }

    if (!TELEGRAM_BOT_TOKEN) {
      debugInfo.errors.push("TELEGRAM_BOT_TOKEN not set")
    } else {
      // Get bot info
      try {
        const botResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`)
        const botData = await botResponse.json()
        debugInfo.botInfo = botData
      } catch (error) {
        debugInfo.errors.push(`Bot info error: ${error.message}`)
      }

      // Get webhook info
      try {
        const webhookResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`)
        const webhookData = await webhookResponse.json()
        debugInfo.webhookInfo = webhookData
      } catch (error) {
        debugInfo.errors.push(`Webhook info error: ${error.message}`)
      }

      // Get recent updates
      try {
        const updatesResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?limit=5`)
        const updatesData = await updatesResponse.json()
        debugInfo.updates = updatesData
      } catch (error) {
        debugInfo.errors.push(`Updates error: ${error.message}`)
      }

      // Get chat info if chat ID is set
      if (TELEGRAM_CHAT_ID) {
        try {
          const chatResponse = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChat?chat_id=${TELEGRAM_CHAT_ID}`,
          )
          const chatData = await chatResponse.json()
          debugInfo.chatInfo = chatData
        } catch (error) {
          debugInfo.errors.push(`Chat info error: ${error.message}`)
        }
      } else {
        debugInfo.errors.push("TELEGRAM_CHAT_ID not set")
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: "success",
        debug_info: debugInfo,
      }),
    }
  } catch (error) {
    console.error("Error getting debug info:", error)
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
