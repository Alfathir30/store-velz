const fetch = require("node-fetch")

const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL || "https://store-velz-default-rtdb.firebaseio.com"
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8111172635:AAG6nTMKB-Mj4aZDEHn4ldC6sjB-FH8-zQs"

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  }

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" }
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ status: "error", message: "Method not allowed" }),
    }
  }

  try {
    const update = JSON.parse(event.body)

    // Handle callback queries (button clicks)
    if (update.callback_query) {
      const callbackData = update.callback_query.data
      const chatId = update.callback_query.message.chat.id
      const messageId = update.callback_query.message.message_id

      if (
        callbackData.startsWith("complete_") ||
        callbackData.startsWith("process_") ||
        callbackData.startsWith("cancel_")
      ) {
        const [action, transactionId] = callbackData.split("_")

        let serviceStatus = ""
        let statusText = ""

        switch (action) {
          case "complete":
            serviceStatus = "completed"
            statusText = "✅ SELESAI"
            break
          case "process":
            serviceStatus = "processing"
            statusText = "⚙️ SEDANG DIPROSES"
            break
          case "cancel":
            serviceStatus = "cancelled"
            statusText = "❌ DIBATALKAN"
            break
        }

        // Update status in Firebase
        const firebaseUrl = `${FIREBASE_DATABASE_URL}/transactions/${transactionId}.json`
        const firebaseResponse = await fetch(firebaseUrl)
        const transactionData = await firebaseResponse.json()

        if (transactionData) {
          transactionData.service_status = serviceStatus
          transactionData.updated_at = new Date().toISOString()

          await fetch(firebaseUrl, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(transactionData),
          })

          // Update the message
          const updatedMessage = `
🛒 *PESANAN DIUPDATE*

📋 *Detail Pesanan:*
• ID: \`${transactionId}\`
• Produk: ${transactionData.product_name}
• Harga: Rp ${transactionData.price.toLocaleString()}

👤 *Data Customer:*
• Nama: ${transactionData.customer_name}
• Kontak: ${transactionData.customer_contact}
${transactionData.account_info ? `• Akun Target: ${transactionData.account_info}` : ""}

📊 *Status:* ${statusText}
⏰ *Diupdate:* ${new Date().toLocaleString("id-ID")}
          `

          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: chatId,
              message_id: messageId,
              text: updatedMessage,
              parse_mode: "Markdown",
            }),
          })

          // Answer callback query
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              callback_query_id: update.callback_query.id,
              text: `Status berhasil diubah ke: ${statusText}`,
              show_alert: false,
            }),
          })
        }
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: "success" }),
    }
  } catch (error) {
    console.error("Error in telegram-webhook:", error)
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
