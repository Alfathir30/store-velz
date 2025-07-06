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
    console.log("Testing Telegram bot...")
    console.log("Bot Token:", TELEGRAM_BOT_TOKEN ? "SET" : "NOT SET")
    console.log("Chat ID:", TELEGRAM_CHAT_ID ? "SET" : "NOT SET")

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          status: "error",
          message: "Telegram credentials not set",
          details: {
            botToken: TELEGRAM_BOT_TOKEN ? "SET" : "NOT SET",
            chatId: TELEGRAM_CHAT_ID ? "SET" : "NOT SET",
          },
        }),
      }
    }

    // Test 1: Get bot info
    const botInfoResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`)
    const botInfo = await botInfoResponse.json()

    console.log("Bot info response:", botInfo)

    if (!botInfo.ok) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          status: "error",
          message: "Invalid bot token",
          details: botInfo,
        }),
      }
    }

    // Test 2: Send test message
    const testMessage = `
🤖 *TEST MESSAGE*

✅ Bot berhasil terhubung!
🕐 Waktu: ${new Date().toLocaleString("id-ID")}
🔧 Function: test-telegram
📱 Bot: @${botInfo.result.username}

Jika Anda menerima pesan ini, berarti integrasi Telegram sudah bekerja dengan baik.
    `

    const sendMessageResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: testMessage,
        parse_mode: "Markdown",
      }),
    })

    const sendMessageResult = await sendMessageResponse.json()
    console.log("Send message response:", sendMessageResult)

    if (!sendMessageResult.ok) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          status: "error",
          message: "Failed to send test message",
          details: sendMessageResult,
        }),
      }
    }

    // Test 3: Get chat info
    const chatInfoResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChat?chat_id=${TELEGRAM_CHAT_ID}`,
    )
    const chatInfo = await chatInfoResponse.json()

    console.log("Chat info response:", chatInfo)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: "success",
        message: "Telegram bot test completed successfully",
        results: {
          botInfo: {
            username: botInfo.result.username,
            firstName: botInfo.result.first_name,
            canJoinGroups: botInfo.result.can_join_groups,
            canReadAllGroupMessages: botInfo.result.can_read_all_group_messages,
          },
          chatInfo: chatInfo.ok
            ? {
                type: chatInfo.result.type,
                title: chatInfo.result.title || chatInfo.result.first_name,
                id: chatInfo.result.id,
              }
            : "Chat info not available",
          testMessageSent: sendMessageResult.ok,
          messageId: sendMessageResult.result?.message_id,
        },
      }),
    }
  } catch (error) {
    console.error("Error testing Telegram:", error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: "error",
        message: "Internal server error: " + error.message,
        stack: error.stack,
      }),
    }
  }
}
