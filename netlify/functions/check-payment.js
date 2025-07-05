const fetch = require("node-fetch")

// Environment variables
const ATLANTIC_API_KEY =
  process.env.ATLANTIC_API_KEY ||
  "atIjCYZqOkNwQf379v0gmmdSpzfJUvHBMW93oQ9dxBqCjilCzvbqGhrn11BRVo3bkceD9adBMXHpt6tC3oWisS3j710deVVbctk1"
const ATLANTIC_API_URL = "https://atlantich2h.com"
const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL || "https://store-velz-default-rtdb.firebaseio.com"

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

      const accessLink = transactionData?.expected_link || "#"
      const productName = transactionData?.product_name || "Produk Tidak Dikenal"

      // Update status in Firebase if different
      if (transactionData && transactionData.payment_status !== paymentStatus) {
        transactionData.payment_status = paymentStatus
        transactionData.updated_at = new Date().toISOString()

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
          product_name: productName,
          access_link: accessLink,
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
