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

      // Update payment status in Firebase if different
      if (transactionData.payment_status !== paymentStatus) {
        transactionData.payment_status = paymentStatus
        transactionData.updated_at = new Date().toISOString()

        // Auto-update service status based on payment status
        if (paymentStatus === "success" && serviceStatus === "waiting_payment") {
          transactionData.service_status = "processing"
        }

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
