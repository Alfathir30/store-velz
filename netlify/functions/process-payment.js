const fetch = require("node-fetch")

// Environment variables - set these in Netlify dashboard
const ATLANTIC_API_KEY =
  process.env.ATLANTIC_API_KEY ||
  "atIjCYZqOkNwQf379v0gmmdSpzfJUvHBMW93oQ9dxBqCjilCzvbqGhrn11BRVo3bkceD9adBMXHpt6tC3oWisS3j710deVVbctk1"
const ATLANTIC_API_URL = "https://atlantich2h.com"
const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL || "https://store-velz-default-rtdb.firebaseio.com"

// Secret product links - store these as environment variables in production
const secretProductLinks = {
  "Belajar Coding": process.env.LINK_BELAJAR_CODING || "https://chat.whatsapp.com/L1nkK3l4sC0d1ngRahasia",
  "Ebook JavaScript": process.env.LINK_EBOOK_JS || "https://t.me/L1nk3b00kJSRahasia",
  "Akses Grup Telegram": process.env.LINK_GRUP_TELEGRAM || "https://t.me/L1nkGr0upT3l3gr4mRahasia",
  "Mentoring 1-on-1":
    process.env.LINK_MENTORING || "https://wa.me/6281234567890?text=Halo%20saya%20mau%20mentoring%201-on-1-Rahasia",
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

    // Get secret link for product
    const expectedLink = secretProductLinks[productName] || ""

    if (!expectedLink) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          status: "error",
          message: "Produk tidak ditemukan atau link akses tidak terdefinisi di server.",
        }),
      }
    }

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
        atlantic_id: atlanticId,
        qr_image_url: qrImage,
        expected_link: expectedLink,
        payment_status: "pending",
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

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: "success",
          message: "QRIS berhasil dibuat dan data disimpan ke Firebase",
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
