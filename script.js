// Product Database
const productDatabase = {
  ebook: [
    {
      id: "ebook-js",
      name: "Ebook JavaScript Complete",
      description: "Panduan lengkap JavaScript dari dasar hingga advanced dengan 300+ halaman",
      price: 75000,
      features: ["300+ Halaman", "Code Examples", "Bonus Cheatsheet", "Update Gratis"],
      icon: "📚",
      badge: "Populer",
    },
    {
      id: "ebook-python",
      name: "Ebook Python for Beginners",
      description: "Belajar Python dari nol hingga bisa membuat aplikasi web dan data science",
      price: 85000,
      features: ["250+ Halaman", "Project Examples", "Data Science Guide", "Web Development"],
      icon: "🐍",
      badge: "",
    },
    {
      id: "ebook-react",
      name: "Ebook React & Next.js",
      description: "Master React dan Next.js untuk membuat aplikasi web modern",
      price: 95000,
      features: ["400+ Halaman", "Real Projects", "Deployment Guide", "Best Practices"],
      icon: "⚛️",
      badge: "Terbaru",
    },
  ],
  apk: [
    {
      id: "apk-spotify",
      name: "Spotify Premium APK",
      description: "Spotify Premium dengan fitur lengkap tanpa iklan dan download unlimited",
      price: 25000,
      features: ["No Ads", "Unlimited Download", "High Quality Audio", "Offline Mode"],
      icon: "🎵",
      badge: "Premium",
    },
    {
      id: "apk-netflix",
      name: "Netflix Premium APK",
      description: "Netflix Premium dengan akses semua konten dan kualitas 4K",
      price: 35000,
      features: ["4K Quality", "All Content", "Multiple Profiles", "Download Feature"],
      icon: "🎬",
      badge: "Premium",
    },
    {
      id: "apk-canva",
      name: "Canva Pro APK",
      description: "Canva Pro dengan template premium dan fitur design advanced",
      price: 30000,
      features: ["Premium Templates", "Background Remover", "Brand Kit", "Unlimited Storage"],
      icon: "🎨",
      badge: "Pro",
    },
  ],
  "jasa-bug": [
    {
      id: "bug-shopee",
      name: "Bug Shopee Coins",
      description: "Exploit bug untuk mendapatkan Shopee Coins gratis dengan aman",
      price: 50000,
      features: ["Safe Method", "Step by Step", "Video Tutorial", "24/7 Support"],
      icon: "🛒",
      badge: "Hot",
    },
    {
      id: "bug-dana",
      name: "Bug Dana Cashback",
      description: "Metode bug untuk mendapatkan cashback Dana dengan teknik terbaru",
      price: 75000,
      features: ["Latest Method", "High Success Rate", "Detailed Guide", "Backup Methods"],
      icon: "💰",
      badge: "Eksklusif",
    },
    {
      id: "bug-gojek",
      name: "Bug Gojek Voucher",
      description: "Cara mendapatkan voucher Gojek gratis melalui bug aplikasi",
      price: 100,
      features: ["Multiple Vouchers", "Easy Steps", "Video Guide", "Success Guarantee"],
      icon: "🏍️",
      badge: "Terbaru",
    },
  ],
  "suntik-followers": [
    {
      id: "followers-ig",
      name: "Instagram Followers",
      description: "Tambah followers Instagram real dan aktif dengan kualitas terbaik",
      price: 38, // per follower (Rp 380 per 10 followers)
      features: ["Real Followers", "No Drop", "Fast Delivery", "Lifetime Guarantee"],
      icon: "📸",
      badge: "Real",
      type: "followers",
    },
    {
      id: "followers-tiktok",
      name: "TikTok Followers",
      description: "Boost followers TikTok dengan akun real dan engagement tinggi",
      price: 28, // per follower (Rp 280 per 10 followers)
      features: ["High Quality", "Fast Process", "No Ban Risk", "24/7 Support"],
      icon: "🎵",
      badge: "Fast",
      type: "followers",
    },
    {
      id: "followers-twitter",
      name: "Twitter Followers",
      description: "Increase Twitter followers dengan akun berkualitas dan aktif",
      price: 20, // per follower
      features: ["Premium Quality", "Organic Growth", "Safe Method", "Refill Guarantee"],
      icon: "🐦",
      badge: "Premium",
      type: "followers",
    },
  ],
}

// Global Variables
let currentTransactionId = null
let paymentCheckInterval = null
let currentCategory = "semua"
let selectedProduct = null

// DOM Elements
const productGrid = document.getElementById("productGrid")
const sectionTitle = document.getElementById("sectionTitle")
const followersCalculator = document.getElementById("followersCalculator")
const purchaseModal = document.getElementById("purchaseModal")
const paymentModal = document.getElementById("paymentModal")
const checkStatusModal = document.getElementById("checkStatusModal")

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  loadProducts("semua")
  initializeAnimations()
  // Initialize calculator with default values
  calculatePrice()
})

// Category Functions
function filterProducts(category) {
  currentCategory = category

  // Update active tab
  document.querySelectorAll(".category-tab").forEach((tab) => {
    tab.classList.remove("active")
  })
  document.querySelector(`[data-category="${category}"]`).classList.add("active")

  // Show/hide followers calculator
  if (category === "suntik-followers") {
    followersCalculator.style.display = "block"
    sectionTitle.textContent = "Layanan Suntik Followers"
    // Recalculate when showing calculator
    setTimeout(() => calculatePrice(), 100)
  } else {
    followersCalculator.style.display = "none"
    sectionTitle.textContent =
      category === "semua"
        ? "Semua Produk Terbaik"
        : category === "ebook"
          ? "E-Book Premium"
          : category === "apk"
            ? "APK Premium"
            : category === "jasa-bug"
              ? "Jasa Bug Terpercaya"
              : "Produk Terbaik"
  }

  loadProducts(category)
}

function loadProducts(category) {
  let products = []

  if (category === "semua") {
    // Combine all products
    Object.values(productDatabase).forEach((categoryProducts) => {
      products = products.concat(categoryProducts)
    })
  } else {
    products = productDatabase[category] || []
  }

  renderProducts(products)
}

function renderProducts(products) {
  productGrid.innerHTML = ""

  products.forEach((product, index) => {
    const productCard = createProductCard(product, index)
    productGrid.appendChild(productCard)
  })
}

function createProductCard(product, index) {
  const card = document.createElement("div")
  card.className = "product-card animate-slide-up"
  card.style.setProperty("--delay", `${(index + 1) * 0.1}s`)

  const priceDisplay =
    product.type === "followers" ? `Rp ${product.price.toLocaleString()}/1K` : `Rp ${product.price.toLocaleString()}`

  card.innerHTML = `
    <div class="product-header">
      <div class="product-icon">${product.icon}</div>
      ${product.badge ? `<div class="product-badge ${product.badge.toLowerCase()}">${product.badge}</div>` : ""}
    </div>
    <h3>${product.name}</h3>
    <p class="product-description">${product.description}</p>
    <div class="product-features">
      ${product.features.map((feature) => `<span>✓ ${feature}</span>`).join("")}
    </div>
    <div class="product-price">
      <span class="price-label">Harga</span>
      <span class="price-value">${priceDisplay}</span>
    </div>
    <button class="btn-primary" onclick="selectProduct('${product.id}')">
      <span>Beli Sekarang</span>
      <span class="btn-arrow">→</span>
    </button>
  `

  return card
}

// Followers Calculator - FIXED VERSION
function calculatePrice() {
  const platformSelect = document.getElementById("platformSelect")
  const followersAmountInput = document.getElementById("followersAmount")
  const calculatedPriceElement = document.getElementById("calculatedPrice")
  const selectedPlatformElement = document.getElementById("selectedPlatform")
  const selectedAmountElement = document.getElementById("selectedAmount")

  // Check if elements exist
  if (
    !platformSelect ||
    !followersAmountInput ||
    !calculatedPriceElement ||
    !selectedPlatformElement ||
    !selectedAmountElement
  ) {
    console.log("Calculator elements not found")
    return
  }

  const platform = platformSelect.value
  let amount = Number.parseInt(followersAmountInput.value) || 10

  console.log("Platform:", platform, "Amount:", amount) // Debug log

  // Enforce minimum 10 and round to nearest 10
  if (amount < 10) {
    amount = 10
    followersAmountInput.value = 10
  }

  // Round to nearest 10
  amount = Math.round(amount / 10) * 10
  followersAmountInput.value = amount

  // Price rates per follower
  const rates = {
    instagram: 38, // Rp 380 per 10 followers = Rp 38 per follower
    tiktok: 28, // Rp 280 per 10 followers = Rp 28 per follower
    twitter: 20, // Rp 200 per 10 followers = Rp 20 per follower
  }

  const pricePerFollower = rates[platform] || 38
  const totalPrice = amount * pricePerFollower

  console.log("Price per follower:", pricePerFollower, "Total price:", totalPrice) // Debug log

  // Update display elements
  calculatedPriceElement.textContent = `Rp ${totalPrice.toLocaleString()}`

  // Platform name mapping
  const platformNames = {
    instagram: "Instagram",
    tiktok: "TikTok",
    twitter: "Twitter",
  }

  selectedPlatformElement.textContent = platformNames[platform] || "Instagram"
  selectedAmountElement.textContent = `${amount.toLocaleString()} followers`

  console.log("Updated display - Platform:", platformNames[platform], "Amount:", amount, "Price:", totalPrice) // Debug log
}

function buyFollowers() {
  const platform = document.getElementById("platformSelect").value
  const amount = Number.parseInt(document.getElementById("followersAmount").value) || 10

  const rates = {
    instagram: 38, // Rp 38 per follower
    tiktok: 28, // Rp 28 per follower
    twitter: 20, // Rp 20 per follower
  }

  const pricePerFollower = rates[platform] || 38
  const totalPrice = amount * pricePerFollower

  const platformNames = {
    instagram: "Instagram",
    tiktok: "TikTok",
    twitter: "Twitter",
  }

  selectedProduct = {
    id: `followers-${platform}`,
    name: `${platformNames[platform]} Followers - ${amount.toLocaleString()}`,
    price: totalPrice,
    type: "followers",
    platform: platform,
    amount: amount,
  }

  openPurchaseModal()
}

// Product Selection
function selectProduct(productId) {
  // Find product in database
  let product = null
  Object.values(productDatabase).forEach((categoryProducts) => {
    const found = categoryProducts.find((p) => p.id === productId)
    if (found) product = found
  })

  if (product) {
    selectedProduct = product
    openPurchaseModal()
  }
}

// Purchase Modal Functions
function openPurchaseModal() {
  if (!selectedProduct) return

  document.getElementById("selectedProductName").textContent = selectedProduct.name
  document.getElementById("selectedProductPrice").textContent = `Rp ${selectedProduct.price.toLocaleString()}`

  // Show account info field for certain products
  const accountInfoGroup = document.getElementById("accountInfoGroup")
  if (selectedProduct.type === "followers" || selectedProduct.id.includes("bug")) {
    accountInfoGroup.style.display = "block"
  } else {
    accountInfoGroup.style.display = "none"
  }

  purchaseModal.style.display = "flex"
  document.body.style.overflow = "hidden"
}

function closePurchaseModal() {
  purchaseModal.style.display = "none"
  document.body.style.overflow = "auto"
  clearPurchaseForm()
}

function clearPurchaseForm() {
  document.getElementById("customerName").value = ""
  document.getElementById("customerContact").value = ""
  document.getElementById("accountInfo").value = ""
  document.getElementById("customerNotes").value = ""
}

// Process Purchase
async function processPurchase() {
  const customerName = document.getElementById("customerName").value.trim()
  const customerContact = document.getElementById("customerContact").value.trim()
  const accountInfo = document.getElementById("accountInfo").value.trim()
  const customerNotes = document.getElementById("customerNotes").value.trim()

  if (!customerName || !customerContact) {
    alert("Mohon lengkapi nama dan kontak!")
    return
  }

  if ((selectedProduct.type === "followers" || selectedProduct.id.includes("bug")) && !accountInfo) {
    alert("Mohon masukkan username/link akun target!")
    return
  }

  closePurchaseModal()
  openPaymentModal()

  try {
    const response = await fetch("/.netlify/functions/process-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        product_name: selectedProduct.name,
        price: selectedProduct.price,
        customer_name: customerName,
        customer_contact: customerContact,
        account_info: accountInfo,
        customer_notes: customerNotes,
        product_type: selectedProduct.type || "digital",
        platform: selectedProduct.platform || "",
        amount: selectedProduct.amount || "",
      }),
    })

    const data = await response.json()

    if (data.status === "success") {
      showQRCode(data)
    } else {
      showError("Gagal membuat QRIS: " + data.message)
    }
  } catch (error) {
    showError("Terjadi kesalahan: " + error.message)
  }
}

// Payment Modal Functions
function openPaymentModal() {
  resetModal()
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
  document.getElementById("modalTitle").innerText = "Proses Pembayaran QRIS"
  document.getElementById("paymentLoading").style.display = "block"
  document.getElementById("qrContent").style.display = "none"
  document.getElementById("finalContent").style.display = "none"
}

function showQRCode(data) {
  document.getElementById("paymentLoading").style.display = "none"
  document.getElementById("qrContent").style.display = "block"

  document.getElementById("qrCodeImage").src = data.qr_image_url
  document.getElementById("transactionIdText").style.display = "block"
  document.getElementById("transactionIdDisplay").innerText = data.atlantic_transaction_id
  document.getElementById("paymentStatusText").style.display = "block"
  document.getElementById("serviceStatusText").style.display = "block"
  document.getElementById("cancelPaymentButton").style.display = "block"

  currentTransactionId = data.atlantic_transaction_id

  // Start checking payment status
  paymentCheckInterval = setInterval(checkPaymentStatusLoop, 3000)
}

async function checkPaymentStatusLoop() {
  if (!currentTransactionId) return

  try {
    const response = await fetch("/.netlify/functions/check-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `transaction_id=${currentTransactionId}`,
    })

    const data = await response.json()

    if (data.status === "success") {
      document.getElementById("paymentStatusResult").innerText = data.payment_status
      document.getElementById("serviceStatusResult").innerText = data.service_status || "Menunggu pembayaran"

      if (data.payment_status === "success") {
        clearInterval(paymentCheckInterval)
        showSuccess()
      }
    }
  } catch (error) {
    console.error("Error checking status:", error)
  }
}

function showSuccess() {
  document.getElementById("modalTitle").innerText = "Pembayaran Berhasil!"
  document.getElementById("qrContent").style.display = "none"
  document.getElementById("finalContent").style.display = "block"
  document.getElementById("finalTransactionIdDisplay").innerText = currentTransactionId
}

function showError(message) {
  document.getElementById("paymentLoading").innerHTML = `
    <div style="color: #e53e3e; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
      <p>${message}</p>
    </div>
  `
}

function cancelPayment() {
  if (confirm("Anda yakin ingin membatalkan pembayaran ini?")) {
    clearInterval(paymentCheckInterval)
    closeModal()
    currentTransactionId = null
  }
}

// Check Status Functions
function openCheckStatusModal() {
  checkStatusModal.style.display = "flex"
  document.body.style.overflow = "hidden"
}

function closeCheckStatusModal() {
  checkStatusModal.style.display = "none"
  document.body.style.overflow = "auto"
}

async function checkOrderStatus() {
  const transactionId = document.getElementById("inputTransactionIdCheck").value.trim()

  if (!transactionId) {
    alert("Mohon masukkan ID Transaksi!")
    return
  }

  try {
    const response = await fetch("/.netlify/functions/check-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `transaction_id=${transactionId}`,
    })

    const data = await response.json()
    displayOrderStatus(data)
  } catch (error) {
    console.error("Error:", error)
  }
}

function displayOrderStatus(data) {
  const resultDiv = document.getElementById("orderStatusResult")

  if (data.status === "success") {
    resultDiv.innerHTML = `
      <div class="order-status-card">
        <h3>Status Pesanan</h3>
        <div class="status-info">
          <p><strong>Produk:</strong> ${data.product_name}</p>
          <p><strong>Status Pembayaran:</strong> <span class="status-${data.payment_status}">${data.payment_status}</span></p>
          <p><strong>Status Layanan:</strong> <span class="status-${data.service_status || "pending"}">${data.service_status || "Menunggu"}</span></p>
        </div>
        
        <div class="progress-tracker">
          <div class="progress-step ${data.payment_status === "success" ? "completed" : "pending"}">
            <span class="step-icon">💳</span>
            <span>Pembayaran</span>
          </div>
          <div class="progress-step ${data.service_status === "processing" ? "active" : data.service_status === "completed" ? "completed" : "pending"}">
            <span class="step-icon">⚙️</span>
            <span>Diproses</span>
          </div>
          <div class="progress-step ${data.service_status === "completed" ? "completed" : "pending"}">
            <span class="step-icon">✅</span>
            <span>Selesai</span>
          </div>
        </div>
        
        ${
          data.service_status === "completed" && data.access_link
            ? `<div class="access-link">
            <a href="${data.access_link}" target="_blank" class="btn-success">Akses Produk</a>
          </div>`
            : ""
        }
      </div>
    `
  } else {
    resultDiv.innerHTML = `
      <div class="error-message">
        <p>Transaksi tidak ditemukan atau terjadi kesalahan.</p>
      </div>
    `
  }
}

// Initialize animations
function initializeAnimations() {
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

  document.querySelectorAll(".animate-fade-in, .animate-slide-up").forEach((el) => {
    el.style.animationPlayState = "paused"
    observer.observe(el)
  })
}

// Close modals when clicking outside
window.addEventListener("click", (event) => {
  if (event.target === purchaseModal) closePurchaseModal()
  if (event.target === paymentModal) closeModal()
  if (event.target === checkStatusModal) closeCheckStatusModal()
})

// Keyboard shortcuts
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (purchaseModal.style.display === "flex") closePurchaseModal()
    if (paymentModal.style.display === "flex") closeModal()
    if (checkStatusModal.style.display === "flex") closeCheckStatusModal()
  }
})
