const fetch = require("node-fetch")

// Environment variables - set these in Netlify dashboard
const ATLANTIC_API_KEY =
  process.env.ATLANTIC_API_KEY ||
  "atIjCYZqOkNwQf379v0gmmdSpzfJUvHBMW93oQ9dxBqCjilCzvbqGhrn11BRVo3bkceD9adBMXHpt6tC3oWisS3j710deVVbctk1"
const ATLANTIC_API_URL = "https://atlantich2h.com"
const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL || "https://store-velz-default-rtdb.firebaseio.com"
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8111172635:AAG6nTMKB-Mj4aZDEHn4ldC6sjB-FH8-zQs"
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "1937864089"

// Secret product links - store these as environment variables in production
const secretProductLinks = {
  "Ebook JavaScript Complete": process.env.LINK_EBOOK_JS || "https://drive.google.com/file/d/ebook-js-secret",
  "Ebook Python for Beginners": process.env.LINK_EBOOK_PYTHON || "https://drive.google.com/file/d/ebook-python-secret",
  "Ebook React & Next.js": process.env.LINK_EBOOK_REACT || "https://drive.google.com/file/d/ebook-react-secret",
  "Spotify Premium APK": process.env.LINK_APK_SPOTIFY || "https://drive.google.com/file/d/spotify-apk-secret",
  "Netflix Premium APK": process.env.LINK_APK_NETFLIX || "https://drive.google.com/file/d/netflix-apk-secret",
  "Canva Pro APK": process.env.LINK_APK_CANVA || "https://drive.google.com/file/d/canva-apk-secret",
  "Bug Shopee Coins": process.env.LINK_BUG_SHOPEE || "https://t.me/bug-shopee-secret",
  "Bug Dana Cashback": process.env.LINK_BUG_DANA || "https://t.me/bug-dana-secret",
  "Bug Gojek Voucher": process.env.LINK_BUG_GOJEK || "https://t.me/bug-gojek-secret",
}

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
    const productName = params.get("product_name") || "Unknown Product"
    const price = Number.parseInt(params.get("price") || "0")
    const customerName = params.get("customer_name") || ""
    const customerContact = params.get("customer_contact") || ""
    const accountInfo = params.get("account_info") || ""
    const customerNotes = params.get("customer_notes") || ""
    const productType = params.get("product_type") || "digital"
    const platform = params.get("platform") || ""
    const amount = params.get("amount") || ""

    // Get secret link for product (for digital products)
    const expectedLink = secretProductLinks[productName] || ""

    const reffId = "WEBSTORE-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9)

    // Create deposit at Atlantic Pedia
    const atlanticResponse = await fetch(ATLANTIC_API_URL + "/deposit/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        api_key: ATLANTIC_API_KEY,
        reff_id: reffId,
        nominal: price.toString(),
        type: "ewallet",
        metode: "qrisfast",
      }),
    })

    const atlanticData = await atlanticResponse.json()

    if (atlanticData.status === true) {
      const atlanticId = atlanticData.data.id
      const qrImage = atlanticData.data.qr_image

      // Save transaction data to Firebase
      const transactionData = {
        reff_id: reffId,
        product_name: productName,
        price: price,
        customer_name: customerName,
        customer_contact: customerContact,
        account_info: accountInfo,
        customer_notes: customerNotes,
        product_type: productType,
        platform: platform,
        amount: amount,
        atlantic_id: atlanticId,
        qr_image_url: qrImage,
        expected_link: expectedLink,
        payment_status: "pending",
        service_status: "waiting_payment",
        created_at: new Date().toISOString(),
      }

      const firebaseUrl = `${FIREBASE_DATABASE_URL}/transactions/${atlanticId}.json`

      await fetch(firebaseUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      })

      // Send notification to Telegram
      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        await sendTelegramNotification(atlanticId, transactionData)
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: "success",
          message: "QRIS berhasil dibuat dan data disimpan",
          qr_image_url: qrImage,
          atlantic_transaction_id: atlanticId,
          reff_id: reffId,
        }),
      }
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          status: "error",
          message: atlanticData.message || "Gagal membuat transaksi QRIS di Atlantic Pedia",
          api_response: atlanticData,
        }),
      }
    }
  } catch (error) {
    console.error("Error in process-payment:", error)
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

async function sendTelegramNotification(transactionId, orderData) {
  try {
    const message = `
🛒 *PESANAN BARU*

📋 *Detail Pesanan:*
• ID: \`${transactionId}\`
• Produk: ${orderData.product_name}
• Harga: Rp ${orderData.price.toLocaleString()}

👤 *Data Customer:*
• Nama: ${orderData.customer_name}
• Kontak: ${orderData.customer_contact}
${orderData.account_info ? `• Akun Target: ${orderData.account_info}` : ""}
${orderData.customer_notes ? `• Catatan: ${orderData.customer_notes}` : ""}

⏰ *Waktu:* ${new Date(orderData.created_at).toLocaleString("id-ID")}
💳 *Status:* Menunggu Pembayaran

${
  orderData.product_type === "followers"
    ? `
📊 *Detail Layanan:*
• Platform: ${orderData.platform}
• Jumlah: ${orderData.amount} followers
`
    : ""
}
    `

    const keyboard = {
      inline_keyboard: [
        [
          { text: "✅ Selesai", callback_data: `complete_${transactionId}` },
          { text: "⚙️ Proses", callback_data: `process_${transactionId}` },
        ],
        [{ text: "❌ Batal", callback_data: `cancel_${transactionId}` }],
      ],
    }

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
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
  } catch (error) {
    console.error("Error sending Telegram notification:", error)
  }
}
