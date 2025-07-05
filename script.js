// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdfJaCT_URd6SBiG-5uXpo7MCZEPw4mDc",
  authDomain: "store-velz.firebaseapp.com",
  databaseURL: "https://store-velz-default-rtdb.firebaseio.com",
  projectId: "store-velz",
  storageBucket: "store-velz.firebasestorage.app",
  messagingSenderId: "807858653644",
  appId: "1:807858653644:web:6fee8495df4ecf400cb569",
  measurementId: "G-BJN6PGNWTQ",
}

// Global Variables
let currentTransactionId = null
let paymentCheckInterval = null

// DOM Elements
const paymentModal = document.getElementById("paymentModal")
const modalTitle = document.getElementById("modalTitle")
const paymentLoading = document.getElementById("paymentLoading")
const qrContent = document.getElementById("qrContent")
const qrCodeImage = document.getElementById("qrCodeImage")
const transactionIdText = document.getElementById("transactionIdText")
const transactionIdDisplay = document.getElementById("transactionIdDisplay")
const paymentStatusText = document.getElementById("paymentStatusText")
const paymentStatusResult = document.getElementById("paymentStatusResult")
const finalContent = document.getElementById("finalContent")
const accessLink = document.getElementById("accessLink")
const finalTransactionIdDisplay = document.getElementById("finalTransactionIdDisplay")
const cancelPaymentButton = document.getElementById("cancelPaymentButton")

// Check Status Modal Elements
const checkStatusModal = document.getElementById("checkStatusModal")
const inputTransactionIdCheck = document.getElementById("inputTransactionIdCheck")
const checkedStatusResultModal = document.getElementById("checkedStatusResultModal")

// Initialize animations on page load
document.addEventListener("DOMContentLoaded", () => {
  // Add staggered animation delays to product cards
  const productCards = document.querySelectorAll(".product-card")
  productCards.forEach((card, index) => {
    card.style.setProperty("--delay", `${(index + 1) * 0.1}s`)
  })

  // Add intersection observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = "running"
      }
    })
  }, observerOptions)

  // Observe animated elements
  document.querySelectorAll(".animate-fade-in, .animate-slide-up").forEach((el) => {
    el.style.animationPlayState = "paused"
    observer.observe(el)
  })
})

// Modal Functions
function openModal() {
  paymentModal.style.display = "flex"
  document.body.style.overflow = "hidden"
}

function closeModal() {
  paymentModal.style.display = "none"
  document.body.style.overflow = "auto"
  clearInterval(paymentCheckInterval)
  resetModal()
}

function resetModal() {
  modalTitle.innerText = "Proses Pembayaran QRIS"
  paymentLoading.style.display = "block"
  qrContent.style.display = "none"
  qrCodeImage.src = ""
  transactionIdText.style.display = "none"
  transactionIdDisplay.innerText = ""
  paymentStatusText.style.display = "none"
  paymentStatusResult.innerText = "Menunggu..."
  finalContent.style.display = "none"
  accessLink.href = "#"
  accessLink.innerText = ""
  finalTransactionIdDisplay.innerText = ""
  cancelPaymentButton.style.display = "none"
}

// Product Purchase Function
async function beliProduk(productName, price) {
  resetModal()
  openModal()
  modalTitle.innerText = `Pembelian: ${productName}`

  try {
    const response = await fetch("process_payment.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `product_name=${encodeURIComponent(productName)}&price=${price}`,
    })

    const data = await response.json()

    if (data.status === "success") {
      // Hide loading and show QR content with animation
      paymentLoading.style.display = "none"
      qrContent.style.display = "block"
      qrContent.style.animation = "slideUp 0.5s ease-out"

      qrCodeImage.src = data.qr_image_url
      transactionIdText.style.display = "block"
      transactionIdDisplay.innerText = data.atlantic_transaction_id
      paymentStatusText.style.display = "block"
      paymentStatusResult.innerText = "Menunggu Pembayaran..."
      currentTransactionId = data.atlantic_transaction_id

      cancelPaymentButton.style.display = "block"

      // Start payment status checking
      paymentCheckInterval = setInterval(checkPaymentStatusLoop, 3000)
    } else {
      showError("Gagal membuat QRIS: " + data.message)
      console.error("Error creating QRIS:", data.message)
    }
  } catch (error) {
    showError("Terjadi kesalahan: " + error.message)
    console.error("Fetch error:", error)
  }
}

// Payment Status Check Loop
async function checkPaymentStatusLoop() {
  if (!currentTransactionId) {
    clearInterval(paymentCheckInterval)
    return
  }

  try {
    const response = await fetch("check_payment.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `transaction_id=${currentTransactionId}`,
    })

    const data = await response.json()

    if (data.status === "success") {
      paymentStatusResult.innerText = data.payment_status

      if (data.payment_status === "success") {
        clearInterval(paymentCheckInterval)
        showSuccess(data.access_link)
      } else if (["expired", "failed", "canceled"].includes(data.payment_status)) {
        clearInterval(paymentCheckInterval)
        showError(`Pembayaran ${data.payment_status}. Silakan coba lagi.`)
      }
    } else {
      console.error("Error checking status:", data.message)
      paymentStatusResult.innerText = "Gagal cek status."
    }
  } catch (error) {
    console.error("Fetch error during status check:", error)
    paymentStatusResult.innerText = "Error saat cek status."
  }
}

// Show Success State
function showSuccess(accessLinkUrl) {
  modalTitle.innerText = "Pembayaran Berhasil!"
  qrContent.style.display = "none"
  finalContent.style.display = "block"
  finalContent.style.animation = "slideUp 0.5s ease-out"

  accessLink.href = accessLinkUrl
  accessLink.innerText = accessLinkUrl
  finalTransactionIdDisplay.innerText = currentTransactionId
  cancelPaymentButton.style.display = "none"
}

// Show Error State
function showError(message) {
  paymentLoading.innerHTML = `
        <div style="color: #e53e3e; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
            <p>${message}</p>
        </div>
    `
  cancelPaymentButton.style.display = "none"
}

// Cancel Payment
function cancelPayment() {
  if (confirm("Anda yakin ingin membatalkan pembayaran ini?")) {
    clearInterval(paymentCheckInterval)
    closeModal()
    currentTransactionId = null

    // Show notification
    showNotification("Pembayaran dibatalkan", "info")
  }
}

// Check Status Modal Functions
function openCheckStatusModal() {
  checkStatusModal.style.display = "flex"
  document.body.style.overflow = "hidden"
  inputTransactionIdCheck.value = ""
  checkedStatusResultModal.innerHTML = ""
}

function closeCheckStatusModal() {
  checkStatusModal.style.display = "none"
  document.body.style.overflow = "auto"
}

// Check Payment Status from Modal
async function checkPaymentStatusFromModal() {
  const inputId = inputTransactionIdCheck.value.trim()

  if (!inputId) {
    checkedStatusResultModal.innerHTML = `
            <div style="color: #e53e3e; padding: 16px; background: #fed7d7; border-radius: 8px;">
                <p>Mohon masukkan ID Transaksi.</p>
            </div>
        `
    return
  }

  checkedStatusResultModal.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div class="loading-spinner" style="margin: 0 auto 16px;"></div>
            <p>Mengecek status...</p>
        </div>
    `

  try {
    const response = await fetch("check_payment.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `transaction_id=${inputId}`,
    })

    const data = await response.json()

    if (data.status === "success") {
      let statusColor = "#718096"
      if (data.payment_status === "success") statusColor = "#38a169"
      else if (data.payment_status === "failed") statusColor = "#e53e3e"

      let resultHtml = `
                <div style="background: #f7fafc; border-radius: 12px; padding: 20px;">
                    <div style="margin-bottom: 16px;">
                        <p style="color: #4a5568; margin-bottom: 4px;">ID Transaksi:</p>
                        <p style="font-weight: 600; word-break: break-all;">${inputId}</p>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <p style="color: #4a5568; margin-bottom: 4px;">Status Pembayaran:</p>
                        <p style="font-weight: 600; color: ${statusColor}; text-transform: capitalize;">${data.payment_status}</p>
                    </div>
            `

      if (data.payment_status === "success") {
        resultHtml += `
                    <div style="margin-top: 20px; padding: 16px; background: #c6f6d5; border-radius: 8px;">
                        <p style="color: #2d3748; margin-bottom: 12px; font-weight: 500;">Link Akses Anda:</p>
                        <a href="${data.access_link}" target="_blank" class="btn-success" style="text-decoration: none;">
                            <span>Akses Sekarang</span>
                            <span class="btn-arrow">→</span>
                        </a>
                    </div>
                `
      } else {
        resultHtml += `
                    <div style="margin-top: 16px; padding: 16px; background: #fed7d7; border-radius: 8px;">
                        <p style="color: #2d3748;">Jika belum membayar, silakan coba buat transaksi baru.</p>
                    </div>
                `
      }

      resultHtml += "</div>"
      checkedStatusResultModal.innerHTML = resultHtml
    } else {
      checkedStatusResultModal.innerHTML = `
                <div style="color: #e53e3e; padding: 16px; background: #fed7d7; border-radius: 8px;">
                    <p>Error: ${data.message}</p>
                </div>
            `
    }
  } catch (error) {
    checkedStatusResultModal.innerHTML = `
            <div style="color: #e53e3e; padding: 16px; background: #fed7d7; border-radius: 8px;">
                <p>Terjadi kesalahan saat memeriksa status: ${error.message}</p>
            </div>
        `
    console.error("Fetch error for manual status check:", error)
  }
}

// Notification System
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "success" ? "#48bb78" : type === "error" ? "#e53e3e" : "#4299e1"};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideUp 0.3s ease-out;
        max-width: 300px;
        font-weight: 500;
    `
  notification.textContent = message

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = "fadeOut 0.3s ease-out forwards"
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 3000)
}

// Close modals when clicking outside
window.addEventListener("click", (event) => {
  if (event.target === paymentModal) {
    closeModal()
  }
  if (event.target === checkStatusModal) {
    closeCheckStatusModal()
  }
})

// Keyboard shortcuts
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (paymentModal.style.display === "flex") {
      closeModal()
    }
    if (checkStatusModal.style.display === "flex") {
      closeCheckStatusModal()
    }
  }
})
