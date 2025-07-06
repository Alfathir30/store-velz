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
    console.log("Telegram webhook received:", event.body)
    const update = JSON.parse(event.body)

    // Handle callback queries (button clicks)
    if (update.callback_query) {
      const callbackData = update.callback_query.data
      const chatId = update.callback_query.message.chat.id
      const messageId = update.callback_query.message.message_id
      const userId = update.callback_query.from.id
      const userName = update.callback_query.from.first_name || "Admin"

      console.log("Button clicked:", callbackData, "by user:", userName)

      if (
        callbackData.startsWith("complete_") ||
        callbackData.startsWith("process_") ||
        callbackData.startsWith("cancel_")
      ) {
        const [action, transactionId] = callbackData.split("_")

        let serviceStatus = ""
        let statusText = ""
        let statusEmoji = ""

        switch (action) {
          case "complete":
            serviceStatus = "completed"
            statusText = "SELESAI"
            statusEmoji = "✅"
            break
          case "process":
            serviceStatus = "processing"
            statusText = "SEDANG DIPROSES"
            statusEmoji = "⚙️"
            break
          case "cancel":
            serviceStatus = "cancelled"
            statusText = "DIBATALKAN"
            statusEmoji = "❌"
            break
        }

        // Update status in Firebase
        const firebaseUrl = `${FIREBASE_DATABASE_URL}/transactions/${transactionId}.json`
        const firebaseResponse = await fetch(firebaseUrl)
        const transactionData = await firebaseResponse.json()

        if (transactionData) {
          transactionData.service_status = serviceStatus
          transactionData.updated_at = new Date().toISOString()
          transactionData.updated_by = userName
          transactionData.updated_by_id = userId

          await fetch(firebaseUrl, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(transactionData),
          })

          // Create updated message
          const updatedMessage = `
${statusEmoji} *PESANAN ${statusText}*

📋 *Detail Pesanan:*
• ID: \`${transactionId}\`
• Produk: ${transactionData.product_name}
• Harga: Rp ${transactionData.price.toLocaleString("id-ID")}

👤 *Data Customer:*
• Nama: ${transactionData.customer_name || "Tidak ada"}
• Kontak: ${transactionData.customer_contact || "Tidak ada"}
${transactionData.account_info ? `• Akun Target: ${transactionData.account_info}` : ""}

📊 *Status Update:*
• Status: *${statusText}*
• Diupdate oleh: ${userName}
• Waktu: ${new Date().toLocaleString("id-ID")}

${
  serviceStatus === "completed"
    ? `
🎉 *Pesanan telah selesai!*
${transactionData.expected_link ? `📎 Link produk: ${transactionData.expected_link}` : ""}
`
    : serviceStatus === "processing"
      ? `
⚙️ *Pesanan sedang dikerjakan...*
Customer akan mendapat update segera.
`
      : serviceStatus === "cancelled"
        ? `
❌ *Pesanan dibatalkan*
Silakan hubungi customer untuk penjelasan.
`
        : ""
}
          `

          // Update the message (remove buttons after action)
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

          // Answer callback query with confirmation
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              callback_query_id: update.callback_query.id,
              text: `✅ Status berhasil diubah ke: ${statusText}`,
              show_alert: false,
            }),
          })

          console.log(`Status updated successfully: ${transactionId} -> ${serviceStatus}`)
        } else {
          // Transaction not found
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              callback_query_id: update.callback_query.id,
              text: "❌ Transaksi tidak ditemukan!",
              show_alert: true,
            }),
          })
        }
      }

      if (callbackData.startsWith("copy_username_") || callbackData.startsWith("copy_contact_")) {
        const [action, , transactionId] = callbackData.split("_")

        // Get transaction data
        const firebaseUrl = `${FIREBASE_DATABASE_URL}/transactions/${transactionId}.json`
        const firebaseResponse = await fetch(firebaseUrl)
        const transactionData = await firebaseResponse.json()

        if (transactionData) {
          let textToCopy = ""
          let responseText = ""

          if (action === "copy" && callbackData.includes("username")) {
            textToCopy = transactionData.account_info || "Tidak ada username"
            responseText = `📋 Username disalin: ${textToCopy}`
          } else if (action === "copy" && callbackData.includes("contact")) {
            textToCopy = transactionData.customer_contact || "Tidak ada kontak"
            responseText = `📞 Kontak disalin: ${textToCopy}`
          }

          // Send the text as a new message for easy copying
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: `\`${textToCopy}\``,
              parse_mode: "Markdown",
              reply_to_message_id: messageId,
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
              text: responseText,
              show_alert: false,
            }),
          })
        } else {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              callback_query_id: update.callback_query.id,
              text: "❌ Data transaksi tidak ditemukan!",
              show_alert: true,
            }),
          })
        }
      }
    }

    // Handle regular messages (optional)
    if (update.message) {
      const chatId = update.message.chat.id
      const messageText = update.message.text

      // Simple command handling
      if (messageText === "/start") {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: `
🤖 *Digital Store Bot*

Halo! Bot ini akan mengirimkan notifikasi pesanan otomatis.

✅ Bot sudah aktif dan siap menerima notifikasi pesanan.
📱 Tombol kontrol akan muncul saat ada pesanan baru.

Terima kasih telah menggunakan layanan kami!
            `,
            parse_mode: "Markdown",
          }),
        })
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
