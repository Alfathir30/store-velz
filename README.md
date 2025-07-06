# 🛒 Digital Store - Sistem Toko Digital dengan QRIS

Sistem toko digital modern dengan pembayaran QRIS otomatis, notifikasi Telegram, dan manajemen pesanan real-time.

## 🚀 Fitur Utama

- ✅ **Pembayaran QRIS Otomatis** - Integrasi dengan Atlantic Pedia
- ✅ **Notifikasi Telegram** - Alert real-time untuk admin
- ✅ **Multi Kategori Produk** - E-book, APK Premium, Bug WhatsApp, Followers, APK Hack
- ✅ **Form Dinamis** - Form berbeda sesuai jenis produk
- ✅ **Database Real-time** - Firebase untuk penyimpanan data
- ✅ **Status Tracking** - Pelacakan status pesanan
- ✅ **Responsive Design** - Mobile-friendly interface

## 📋 Daftar Isi

- [Setup Awal](#setup-awal)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Menambah Produk Baru](#menambah-produk-baru)
- [Edit Produk Existing](#edit-produk-existing)
- [Mengatur Harga](#mengatur-harga)
- [Setup Telegram Bot](#setup-telegram-bot)
- [Kustomisasi Tampilan](#kustomisasi-tampilan)
- [Troubleshooting](#troubleshooting)

## 🔧 Setup Awal

### 1. Deploy ke Netlify

\`\`\`bash
# Clone repository
git clone <your-repo-url>
cd digital-store

# Deploy ke Netlify
# Drag & drop folder ke netlify.com atau gunakan Netlify CLI
\`\`\`

### 2. Setup Environment Variables

Buka **Netlify Dashboard → Site Settings → Environment Variables** dan tambahkan:

\`\`\`env
# Atlantic Pedia API (Wajib)
ATLANTIC_API_KEY=your_atlantic_api_key_here

# Firebase Database (Wajib)
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com

# Telegram Bot (Opsional tapi direkomendasikan)
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHI...
TELEGRAM_CHAT_ID=your_chat_id

# Link Produk Rahasia (Sesuaikan dengan produk Anda)
LINK_EBOOK_JS=https://drive.google.com/file/d/your-ebook-js-link
LINK_APK_SPOTIFY=https://drive.google.com/file/d/your-spotify-apk-link
# ... dst
\`\`\`

## 🛍️ Menambah Produk Baru

### 1. Edit Database Produk

Buka file \`script.js\` dan cari bagian \`productDatabase\`:

\`\`\`javascript
const productDatabase = {
  // Kategori yang sudah ada
  ebook: [...],
  apk: [...],
  
  // Tambah kategori baru (opsional)
  "kategori-baru": [
    {
      id: "produk-baru-1", // ID unik
      name: "Nama Produk Baru",
      description: "Deskripsi produk yang menarik",
      price: 50000, // Harga dalam Rupiah
      features: [
        "Fitur 1",
        "Fitur 2", 
        "Fitur 3"
      ],
      icon: "🎯", // Emoji icon
      badge: "Terbaru", // Badge opsional
      type: "digital" // Jenis produk
    }
  ]
}
\`\`\`

### 2. Tambah Link Rahasia Produk

Di file \`netlify/functions/process-payment.js\`:

\`\`\`javascript
const secretProductLinks = {
  // Link yang sudah ada
  "Ebook JavaScript Complete": process.env.LINK_EBOOK_JS || "default-link",
  
  // Tambah link baru
  "Nama Produk Baru": process.env.LINK_PRODUK_BARU || "https://link-rahasia-anda.com"
}
\`\`\`

### 3. Tambah Environment Variable

Di Netlify Dashboard, tambahkan:
\`\`\`
LINK_PRODUK_BARU=https://link-rahasia-produk-anda.com
\`\`\`

### 4. Update Tab Kategori (Jika Perlu)

Di file \`index.html\`, tambah tab kategori baru:

\`\`\`html
<button class="category-tab" data-category="kategori-baru" onclick="filterProducts('kategori-baru')">
    <span class="tab-icon">🎯</span>
    Kategori Baru
</button>
\`\`\`

## ✏️ Edit Produk Existing

### Mengubah Harga
\`\`\`javascript
{
  id: "apk-spotify",
  name: "Spotify Premium APK",
  price: 30000, // Ubah dari 25000 ke 30000
  // ... field lainnya
}
\`\`\`

### Mengubah Deskripsi
\`\`\`javascript
{
  id: "ebook-js",
  name: "Ebook JavaScript Complete",
  description: "Deskripsi baru yang lebih menarik", // Edit di sini
  // ... field lainnya
}
\`\`\`

### Mengubah Fitur
\`\`\`javascript
{
  id: "apk-netflix",
  features: [
    "4K Quality",
    "All Content", 
    "Multiple Profiles",
    "Download Feature",
    "Fitur Baru!" // Tambah fitur baru
  ]
}
\`\`\`

## 💰 Mengatur Harga Khusus

### Harga Followers (Per 1000)
Di \`script.js\`, cari fungsi \`calculatePrice()\`:

\`\`\`javascript
const rates = {
  instagram: 38, // Rp 38 per follower = Rp 38.000 per 1K
  tiktok: 28,    // Rp 28 per follower = Rp 28.000 per 1K  
  twitter: 20    // Rp 20 per follower = Rp 20.000 per 1K
}
\`\`\`

### Harga Minimum
Di \`netlify/functions/process-payment.js\`:

\`\`\`javascript
// Validasi harga minimum
if (price < 500) { // Ubah 500 ke nilai minimum yang diinginkan
  return {
    statusCode: 400,
    headers,
    body: JSON.stringify({
      status: "error",
      message: "Nominal pembayaran minimal Rp 500"
    })
  }
}
\`\`\`

## 🤖 Setup Telegram Bot

### 1. Buat Bot Baru
1. Chat **@BotFather** di Telegram
2. Kirim \`/newbot\`
3. Ikuti instruksi untuk nama bot
4. Simpan **token** yang diberikan

### 2. Dapatkan Chat ID
1. Tambahkan bot ke grup/channel ATAU chat pribadi dengan bot
2. Kirim pesan ke bot
3. Buka: \`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates\`
4. Cari \`"chat":{"id":\` dalam response

### 3. Setup Webhook
Buka \`https://your-site.netlify.app/setup-webhook.html\` dan klik **Setup Webhook**

### 4. Test Bot
Buka \`https://your-site.netlify.app/tesbot.html\` untuk test semua fungsi bot

## 🎨 Kustomisasi Tampilan

### Mengubah Warna Tema
Di file \`style.css\`, edit CSS variables:

\`\`\`css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}
\`\`\`

### Mengubah Logo
Di file \`index.html\`:

\`\`\`html
<div class="logo">
    <span class="logo-icon">🛒</span> <!-- Ubah emoji ini -->
    Digital Store <!-- Ubah nama ini -->
</div>
\`\`\`

### Mengubah Hero Section
\`\`\`html
<h1 class="hero-title">Produk Digital Premium</h1> <!-- Edit judul -->
<p class="hero-description">
    Tingkatkan skill dan bisnis Anda <!-- Edit deskripsi -->
</p>
\`\`\`

## 🔧 Form Khusus Produk

### APK Premium (Email + Password)
Produk dengan ID yang mengandung \`apk-\` (tapi bukan \`virus\`) akan menampilkan form:
- Email untuk akun premium
- Password untuk akun premium

### APK Hack/Surxrat (Metode Pengiriman)
Produk dengan ID yang mengandung \`virus\` atau ID \`surxrat\` akan menampilkan form:
- Metode pengiriman (Email/WhatsApp/Telegram)
- Kontak pengiriman

### Followers/Bug (Username Target)
Produk dengan \`type: "followers"\` atau ID yang mengandung \`bug\` akan menampilkan form:
- Username/Link akun target

## 📊 Monitoring & Analytics

### Cek Status Pesanan
- Customer: Gunakan tombol "Cek Status Pesanan" di website
- Admin: Buka \`https://your-site.netlify.app/db.html\`

### Logs Netlify
1. Buka Netlify Dashboard
2. Pilih site Anda
3. Klik **Functions** tab
4. Klik function yang ingin dilihat logsnya

### Firebase Database
Buka Firebase Console untuk melihat semua transaksi real-time

## 🐛 Troubleshooting

### Pembayaran Gagal
1. **Cek Atlantic API Key** - Pastikan valid dan aktif
2. **Cek nominal minimum** - Minimal Rp 500
3. **Cek koneksi internet** customer

### Telegram Bot Tidak Merespon
1. **Cek Bot Token** - Pastikan benar dan bot aktif
2. **Cek Chat ID** - Pastikan bot sudah di-add ke grup/chat
3. **Setup Webhook** - Gunakan \`/setup-webhook.html\`
4. **Test Bot** - Gunakan \`/tesbot.html\`

### Produk Tidak Muncul
1. **Cek syntax JavaScript** - Pastikan tidak ada error di console
2. **Cek ID produk** - Pastikan unik dan tidak duplikat
3. **Refresh cache** - Hard refresh browser (Ctrl+F5)

### Database Error
1. **Cek Firebase URL** - Pastikan format benar
2. **Cek permissions** - Database harus public read/write untuk testing
3. **Cek network** - Pastikan tidak ada firewall blocking

## 📝 Struktur File

\`\`\`
digital-store/
├── index.html              # Halaman utama
├── script.js              # Logic utama & database produk
├── style.css              # Styling & tema
├── Payment.html           # Form pembayaran sederhana
├── db.html               # Admin panel cek transaksi
├── setup-webhook.html    # Setup Telegram webhook
├── tesbot.html          # Test Telegram bot
├── netlify.toml         # Konfigurasi Netlify
├── netlify/functions/   # Serverless functions
│   ├── process-payment.js    # Proses pembayaran
│   ├── check-payment.js      # Cek status pembayaran
│   ├── telegram-webhook.js   # Handle Telegram webhook
│   └── ...                   # Functions lainnya
└── README.md            # Dokumentasi ini
\`\`\`

## 🔐 Keamanan

### Link Produk Rahasia
- Simpan di environment variables, JANGAN di kode
- Gunakan link yang sulit ditebak
- Pertimbangkan menggunakan link dengan expiry

### API Keys
- Jangan commit API key ke Git
- Gunakan environment variables
- Rotate key secara berkala

### Database
- Untuk production, gunakan Firebase rules yang ketat
- Jangan expose sensitive data di client-side

## 📞 Support

Jika ada masalah:
1. Cek bagian [Troubleshooting](#troubleshooting) dulu
2. Lihat logs di Netlify Functions
3. Test dengan \`/tesbot.html\` untuk masalah Telegram
4. Cek Firebase Console untuk masalah database

## 🚀 Tips Optimasi

### Performance
- Compress gambar produk
- Minify CSS/JS untuk production
- Gunakan CDN untuk assets

### SEO
- Tambah meta tags di \`<head>\`
- Gunakan semantic HTML
- Tambah structured data

### Conversion
- A/B test harga dan copy
- Tambah testimonial customer
- Buat urgency dengan limited time offers

---

**Happy Selling! 🎉**

*Dibuat dengan ❤️ untuk memudahkan bisnis digital Anda*
