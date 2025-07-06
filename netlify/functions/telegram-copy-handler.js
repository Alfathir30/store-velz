const fetch = require("node-fetch")

const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL || "https://store-velz-default-rtdb.firebaseio.com"
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8111172635:AAG6nTMKB-Mj4aZDEHn4ldC6sjB-FH8-zQs"

// Function to handle copy operations
async function handleCopyCallback(callbackData, chatId, messageId, callbackQueryId) {
  try {
    const [action, type, transactionId] = callbackData.split("_")

    console.log("Copy callback:", { action, type, transactionId })

    // Get transaction data from Firebase
    const firebaseUrl = `${FIREBASE_DATABASE_URL}/transactions/${transactionId}.json`
    const firebaseResponse = await fetch(firebaseUrl)
    const transactionData = await firebaseResponse.json()

    if (!transactionData) {
      await answerCallbackQuery(callbackQueryId, "❌ Data transaksi tidak ditemukan!", true)
      return false
    }

    let textToCopy = ""
    let responseText = ""
    let copyLabel = ""

    if (type === "username") {
      textToCopy = transactionData.account_info || "Tidak ada username"
      responseText = `📋 Username berhasil disalin!`
      copyLabel = "Username Target"
    } else if (type === "contact") {
      textToCopy = transactionData.customer_contact || "Tidak ada kontak"
      responseText = `📞 Kontak berhasil disalin!`
      copyLabel = "Kontak Customer"
    }

    // Send the text as a separate message for easy copying
    const copyMessage = `
📋 *${copyLabel}:*
\`${textToCopy}\`

_Tap dan tahan teks di atas untuk copy_
    `

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: copyMessage,
        parse_mode: "Markdown",
        reply_to_message_id: messageId,
      }),
    })

    // Answer callback query with success message
    await answerCallbackQuery(callbackQueryId, responseText, false)

    return true
  } catch (error) {
    console.error("Error handling copy callback:", error)
    await answerCallbackQuery(callbackQueryId, "❌ Terjadi kesalahan saat copy!", true)
    return false
  }
}

// Helper function to answer callback queries
async function answerCallbackQuery(callbackQueryId, text, showAlert = false) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text,
        show_alert: showAlert,
      }),
    })
  } catch (error) {
    console.error("Error answering callback query:", error)
  }
}

module.exports = { handleCopyCallback }
