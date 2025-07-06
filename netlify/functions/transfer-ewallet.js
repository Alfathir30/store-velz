const fetch = require("node-fetch")

// Environment variables
const ATLANTIC_API_KEY =
  process.env.ATLANTIC_API_KEY ||
  "atIjCYZqOkNwQf379v0gmmdSpzfJUvHBMW93oQ9dxBqCjilCzvbqGhrn11BRVo3bkceD9adBMXHpt6tC3oWisS3j710deVVbctk1"
const ATLANTIC_API_URL = "https://atlantich2h.com"

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
    const kodeBank = params.get("kode_bank") || ""
    const nomorAkun = params.get("nomor_akun") || ""
    const namaPemilik = params.get("nama_pemilik") || ""
    const nominal = Number.parseInt(params.get("nominal") || "0")
    const email = params.get("email") || ""
    const note = params.get("note") || ""

    if (!kodeBank || !nomorAkun || !namaPemilik || nominal < 10000) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          status: "error",
          message: "Data tidak lengkap atau nominal kurang dari Rp 10.000",
        }),
      }
    }

    // Create transfer request to Atlantic Pedia
    const transferResponse = await fetch(ATLANTIC_API_URL + "/transfer/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        api_key: ATLANTIC_API_KEY,
        kode_bank: kodeBank,
        nomor_akun: nomorAkun,
        nama_pemilik: namaPemilik,
        nominal: nominal.toString(),
        email: email,
        note: note,
      }),
    })

    const transferData = await transferResponse.json()

    if (transferData.status === true) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: "success",
          message: "Transfer berhasil diproses",
          data: transferData.data,
        }),
      }
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          status: "error",
          message: transferData.message || "Gagal memproses transfer",
          api_response: transferData,
        }),
      }
    }
  } catch (error) {
    console.error("Error in transfer-ewallet:", error)
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
