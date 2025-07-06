const fetch = require("node-fetch")

// Environment variables
const ATLANTIC_API_KEY =
  process.env.ATLANTIC_API_KEY ||
  "atIjCYZqOkNwQf379v0gmmdSpzfJUvHBMW93oQ9dxBqCjilCzvbqGhrn11BRVo3bkceD9adBMXHpt6tC3oWisS3j710deVVbctk1"
const ATLANTIC_API_URL = "https://atlantich2h.com"
const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL || "https://store-velz-default-rtdb.firebaseio.com"
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8111172635:AAG6nTMKB-Mj4aZDEHn4ldC6sjB-FH8-zQs"
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "1937864089"

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  }

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    }
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ status: "error", message: "Method not allowed" }),
    }
  }

  try {
    // Parse form data
    const params = new URLSearchParams(event.body)
    const transactionId = params.get("transaction_id") || ""

    if (!transactionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ status: "error", message: "Transaction ID is required." }),
      }
    }

    // Check payment status at Atlantic Pedia
    const atlanticResponse = await fetch(ATLANTIC_API_URL + "/deposit/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        api_key: ATLANTIC_API_KEY,
        id: transactionId,
      }),
    })

    const atlanticData = await atlanticResponse.json()

    if (atlanticData.status === true) {
      const paymentStatus = atlanticData.data.status

      // Get transaction data from Firebase
      const firebaseUrl = `${FIREBASE_DATABASE_URL}/transactions/${transactionId}.json`
      const firebaseResponse = await fetch(firebaseUrl)
      const transactionData = await firebaseResponse.json()

      if (!transactionData) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ status: "error", message: "Transaction not found in database" }),
        }
      }

      const accessLink = transactionData.expected_link || "#"
      const productName = transactionData.product_name || "Produk Tidak Dikenal"
      const serviceStatus = transactionData.service_status || "waiting_payment"
      const previousPaymentStatus = transactionData.payment_status || "pending"
      const telegramNotified = transactionData.telegram_notified || false

      // Update payment status in Firebase if different
      if (previousPaymentStatus !== paymentStatus) {
        transactionData.payment_status = paymentStatus
        transactionData.updated_at = new Date().toISOString()

        // Auto-update service status based on payment status
        if (paymentStatus === "success" && serviceStatus === "waiting_payment") {
          transactionData.service_status = "processing"
        }

        // Send Telegram notification ONLY when payment becomes successful and not notified yet
        if (paymentStatus === "success" && !telegramNotified) {
          console.log("Payment successful, sending Telegram notification...")
          const notificationSent = await sendTelegramNotification(transactionId, transactionData)
          transactionData.telegram_notified = notificationSent
          transactionData.telegram_notified_at = new Date().toISOString()
        }

        // Update Firebase with new data
        await fetch(firebaseUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transactionData),
        })
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: "success",
          message: "Status retrieved",
          payment_status: paymentStatus,
          service_status: transactionData.service_status,
          product_name: productName,
          customer_name: transactionData.customer_name,
          customer_contact: transactionData.customer_contact,
          account_info: transactionData.account_info,
          customer_notes: transactionData.customer_notes,
          access_link: transactionData.service_status === "completed" ? accessLink : "#",
          created_at: transactionData.created_at,
          telegram_notified: transactionData.telegram_notified,
        }),
      }
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          status: "error",
          message: atlanticData.message || "Gagal cek status transaksi di Atlantic Pedia",
          api_response: atlanticData,
        }),
      }
    }
  } catch (error) {
    console.error("Error in check-payment:", error)
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

// Telegram notification function
async function sendTelegramNotification(transactionId, orderData) {
  try {
    console.log("Sending Telegram notification for completed payment...", {
      transactionId,
      botToken: TELEGRAM_BOT_TOKEN ? "SET" : "NOT SET",
      chatId: TELEGRAM_CHAT_ID,
    })

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.log("Telegram credentials not set, skipping notification")
      return false
    }

    const message = `
🎉 *PEMBAYARAN BERHASIL!*

📋 *Detail Pesanan:*
• ID: \`${transactionId}\`
• Produk: ${orderData.product_name}
• Harga: Rp ${orderData.price.toLocaleString("id-ID")}

👤 *Data Customer:*
• Nama: ${orderData.customer_name || "Tidak ada"}
• Kontak: ${orderData.customer_contact || "Tidak ada"}
${orderData.account_info ? `• Akun Target: ${orderData.account_info}` : ""}
${orderData.customer_notes ? `• Catatan: ${orderData.customer_notes}` : ""}

⏰ *Waktu Bayar:* ${new Date().toLocaleString("id-ID")}
💳 *Status:* LUNAS ✅

${
  orderData.product_type === "followers"
    ? `
📊 *Detail Layanan:*
• Platform: ${orderData.platform}
• Jumlah: ${orderData.amount} followers

⚠️ *Segera proses pesanan ini!*
`
    : `
⚠️ *Segera kirim produk ke customer!*
`
}
    `

    const keyboard = {
      inline_keyboard: [
        [
          { text: "⚙️ Mulai Proses", callback_data: `process_${transactionId}` },
          { text: "✅ Selesai", callback_data: `complete_${transactionId}` },
        ],
        [
          { text: "📋 Copy Username", callback_data: `copy_username_${transactionId}` },
          { text: "📞 Copy Kontak", callback_data: `copy_contact_${transactionId}` },
        ],
        [{ text: "❌ Ada Masalah", callback_data: `cancel_${transactionId}` }],
      ],
    }

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

    const response = await fetch(telegramUrl, {
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
    console.log("Telegram API response:", responseData)

    if (!response.ok) {
      console.error("Telegram API error:", responseData)
      return false
    }

    console.log("Telegram notification sent successfully")
    return true
  } catch (error) {
    console.error("Error sending Telegram notification:", error)
    return false
  }
}

