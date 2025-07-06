const fetch = require("node-fetch")

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8111172635:AAG6nTMKB-Mj4aZDEHn4ldC6sjB-FH8-zQs"
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "1937864089"

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

    const testTransactionId = "TEST" + Date.now()

    const message = `
🧪 *TEST BUTTON MESSAGE*

📋 *Detail Test:*
• ID: \`${testTransactionId}\`
• Produk: Test Instagram Followers - 100
• Harga: Rp 3.800

👤 *Data Customer:*
• Nama: Test Customer
• Kontak: 08123456789
• Akun Target: @testuser

⏰ *Waktu:* ${new Date().toLocaleString("id-ID")}
💳 *Status:* LUNAS ✅

🔧 *Klik tombol di bawah untuk test webhook:*
    `

    const keyboard = {
      inline_keyboard: [
        [
          { text: "⚙️ Test Proses", callback_data: `process_${testTransactionId}` },
          { text: "✅ Test Selesai", callback_data: `complete_${testTransactionId}` },
        ],
        [{ text: "❌ Test Batal", callback_data: `cancel_${testTransactionId}` }],
      ],
    }

    console.log("Sending test button message...")

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      }),
    })

    const responseData = await response.json()
    console.log("Test button response:", responseData)

    if (responseData.ok) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: "success",
          message: "Test button message sent successfully",
          message_id: responseData.result.message_id,
          test_transaction_id: testTransactionId,
        }),
      }
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          status: "error",
          message: "Failed to send test button message",
          telegram_response: responseData,
        }),
      }
    }
  } catch (error) {
    console.error("Error sending test button:", error)
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
