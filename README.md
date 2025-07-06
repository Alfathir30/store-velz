# Digital Store - Enhanced Version

Sistem toko digital lengkap dengan kategori produk, integrasi Telegram bot, dan tracking status pesanan.

## Fitur Utama

### 🛍️ Kategori Produk
- **Semua**: Menampilkan semua produk
- **E-Book**: Koleksi ebook programming
- **APK Premium**: Aplikasi premium
- **Jasa Bug**: Layanan exploit bug
- **Suntik Followers**: Layanan tambah followers

### 📊 Kalkulator Followers
- Pilihan platform: Instagram, TikTok, Twitter
- Slider interaktif untuk jumlah followers
- Kalkulasi harga otomatis
- Harga berbeda per platform

### 🔄 Status Tracking
- **Pembayaran**: pending → success
- **Layanan**: waiting_payment → processing → completed
- Real-time status update
- Progress tracker visual

### 🤖 Integrasi Telegram Bot
- Notifikasi pesanan baru otomatis
- Tombol kontrol status (Proses/Selesai/Batal)
- Update status langsung dari Telegram
- Detail lengkap setiap pesanan

## Setup Instructions

### 1. Environment Variables
Set these environment variables in your Netlify dashboard:

\`\`\`
# Atlantic Pedia API
ATLANTIC_API_KEY=your_atlantic_api_key

# Firebase
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Product Links (Secret)
LINK_EBOOK_JS=https://drive.google.com/file/d/your-secret-link
LINK_EBOOK_PYTHON=https://drive.google.com/file/d/your-secret-link
LINK_EBOOK_REACT=https://drive.google.com/file/d/your-secret-link
LINK_APK_SPOTIFY=https://drive.google.com/file/d/your-secret-link
LINK_APK_NETFLIX=https://drive.google.com/file/d/your-secret-link
LINK_APK_CANVA=https://drive.google.com/file/d/your-secret-link
LINK_BUG_SHOPEE=https://t.me/your-secret-channel
LINK_BUG_DANA=https://t.me/your-secret-channel
LINK_BUG_GOJEK=https://t.me/your-secret-channel
\`\`\`

### 2. Deploy to Netlify

#### Option A: GitHub Integration
1. Push this code to a GitHub repository
2. Connect your GitHub repo to Netlify
3. Set the build settings:
   - Build command: `npm install`
   - Publish directory: `.`
   - Functions directory: `netlify/functions`

#### Option B: Netlify CLI
\`\`\`bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
\`\`\`

### 3. Local Development
\`\`\`bash
# Install dependencies
npm install

# Install Netlify CLI if not already installed
npm install -g netlify-cli

# Start local development server
netlify dev
\`\`\`

## Setup Telegram Bot

### 1. Buat Bot Baru
\`\`\`
1. Chat @BotFather di Telegram
2. Kirim /newbot
3. Ikuti instruksi untuk nama bot
4. Simpan token yang diberikan
\`\`\`

### 2. Setup Webhook
\`\`\`bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-netlify-site.netlify.app/.netlify/functions/telegram-webhook"}'
\`\`\`

### 3. Dapatkan Chat ID
\`\`\`
1. Tambahkan bot ke grup/channel
2. Kirim pesan ke bot
3. Buka: https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
4. Cari "chat":{"id": dalam response
\`\`\`

## File Structure
\`\`\`
├── index.html              # Main landing page
├── Payment.html           # Payment form
├── db.html               # Transaction checker
├── tf.html               # Transfer form
├── style.css             # Styles
├── script.js             # Frontend JavaScript
├── netlify.toml          # Netlify configuration
├── package.json          # Node.js dependencies
└── netlify/functions/    # Serverless functions
    ├── process-payment.js
    ├── check-payment.js
    ├── transfer-ewallet.js
    └── telegram-webhook.js
\`\`\`

## Struktur Database Firebase

\`\`\`json
{
  "transactions": {
    "AT123456": {
      "reff_id": "WEBSTORE-1234567890-abc123",
      "product_name": "Instagram Followers - 5,000",
      "price": 75000,
      "customer_name": "John Doe",
      "customer_contact": "08123456789",
      "account_info": "@johndoe",
      "customer_notes": "Butuh cepat",
      "product_type": "followers",
      "platform": "instagram",
      "amount": "5000",
      "atlantic_id": "AT123456",
      "qr_image_url": "https://...",
      "expected_link": "https://...",
      "payment_status": "success",
      "service_status": "completed",
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T11:00:00.000Z"
    }
  }
}
\`\`\`

## API Endpoints

### Process Payment
\`\`\`
POST /.netlify/functions/process-payment
Content-Type: application/x-www-form-urlencoded

product_name=Instagram Followers - 1,000
price=15000
customer_name=John Doe
customer_contact=08123456789
account_info=@johndoe
customer_notes=Butuh cepat
product_type=followers
platform=instagram
amount=1000
\`\`\`

### Check Payment Status
\`\`\`
POST /.netlify/functions/check-payment
Content-Type: application/x-www-form-urlencoded

transaction_id=AT123456
\`\`\`

### Telegram Webhook
\`\`\`
POST /.netlify/functions/telegram-webhook
Content-Type: application/json

{
  "callback_query": {
    "data": "complete_AT123456",
    "message": {...}
  }
}
\`\`\`

## Deployment

### 1. Netlify CLI
\`\`\`bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
\`\`\`

### 2. GitHub Integration
1. Push ke GitHub repository
2. Connect ke Netlify
3. Set environment variables
4. Deploy otomatis

## Harga Followers

| Platform  | Harga per 1K |
|-----------|--------------|
| Instagram | Rp 15.000    |
| TikTok    | Rp 12.000    |
| Twitter   | Rp 20.000    |

## Status Flow

\`\`\`
Payment: pending → success → (failed/expired/canceled)
Service: waiting_payment → processing → completed → (cancelled)
\`\`\`

## Security Notes
- All sensitive data (API keys, secret links) are stored as environment variables
- CORS is properly configured for cross-origin requests
- Input validation is implemented in all functions

## Troubleshooting

### Bot Telegram Tidak Merespon
1. Cek TELEGRAM_BOT_TOKEN benar
2. Pastikan webhook sudah di-set
3. Cek TELEGRAM_CHAT_ID valid

### Status Tidak Update
1. Cek Firebase permissions
2. Pastikan webhook Telegram aktif
3. Cek function logs di Netlify

### Pembayaran Gagal
1. Cek ATLANTIC_API_KEY valid
2. Pastikan nominal minimum terpenuhi
3. Cek koneksi ke Atlantic API

## Support

Untuk bantuan lebih lanjut, hubungi developer atau cek logs di:
- Netlify Functions logs
- Firebase console
- Telegram bot logs

Sekarang sistem sudah lengkap dengan semua fitur yang diminta! Sistem ini memiliki:

1. ✅ **5 Kategori produk** dengan minimal 3 produk per kategori
2. ✅ **Kalkulator followers** dengan prediksi harga otomatis
3. ✅ **Form detail customer** sebelum pembayaran
4. ✅ **Status tracking** dari pembayaran sampai pengerjaan
5. ✅ **Integrasi Telegram bot** untuk notifikasi dan kontrol status
6. ✅ **Database Firebase** untuk menyimpan semua data
7. ✅ **Responsive design** yang modern dan user-friendly
