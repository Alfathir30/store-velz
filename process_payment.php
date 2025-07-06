<?php
// process_payment.php

// Pastikan TIDAK ADA SPASI, BARIS KOSONG, atau KARAKTER APAPUN di atas baris ini!
header('Content-Type: application/json');

// --- PENTING! GANTI 'YOUR_ATLANTIC_API_KEY_HERE' dengan API KEY ASLI LO ---
define('ATLANTIC_API_KEY', 'atIjCYZqOkNwQf379v0gmmdSpzfJUvHBMW93oQ9dxBqCjilCzvbqGhrn11BRVo3bkceD9adBMXHpt6tC3oWisS3j710deVVbctk1'); 
define('ATLANTIC_API_URL', 'https://atlantich2h.com');

// --- FIREBASE REALTIME DATABASE CONFIG ---
// Ganti dengan URL Database lo dari firebaseConfig.databaseURL
define('FIREBASE_DATABASE_URL', 'https://store-velz-default-rtdb.firebaseio.com'); 

// --- DAFTAR PRODUK DAN LINK RAHASIA (INI DISIMPAN DI SISI SERVER, AMAN!) ---
// GANTI SEMUA LINK INI DENGAN LINK PRODUK ASLI DAN RAHASIA LO!
$secretProductLinks = [
    'Belajar Coding'      => 'https://chat.whatsapp.com/L1nkK3l4sC0d1ngRahasia',
    'Ebook JavaScript'    => 'https://t.me/L1nk3b00kJSRahasia',
    'Akses Grup Telegram' => 'https://t.me/L1nkGr0upT3l3gr4mRahasia',
    'Mentoring 1-on-1'    => 'https://wa.me/6281234567890?text=Halo%20saya%20mau%20mentoring%201-on-1-Rahasia',
    // Tambahkan produk lain di sini jika ada, pastikan nama produk sama persis
];

$productName = $_POST['product_name'] ?? 'Unknown Product';
$price = (int)($_POST['price'] ?? 0);

// Ambil link rahasia berdasarkan nama produk dari array di atas
// Jika nama produk tidak ditemukan di array, defaultnya jadi string kosong
$expectedLink = $secretProductLinks[$productName] ?? ''; 

if (empty($expectedLink)) {
    echo json_encode(['status' => 'error', 'message' => 'Produk tidak ditemukan atau link akses tidak terdefinisi di server.']);
    exit();
}

$reffId = 'WEBSTORE-' . uniqid(); // ID unik dari sistem kita

// 1. Buat Deposit di Atlantic Pedia
$postDataAtlantic = http_build_query([
    'api_key' => ATLANTIC_API_KEY,
    'reff_id' => $reffId,
    'nominal' => $price,
    'type' => 'ewallet',
    'metode' => 'qrisfast' // Ini yang bikin auto-konfirmasi (semoga!)
]);

$chAtlantic = curl_init();
curl_setopt($chAtlantic, CURLOPT_URL, ATLANTIC_API_URL . '/deposit/create');
curl_setopt($chAtlantic, CURLOPT_POST, 1);
curl_setopt($chAtlantic, CURLOPT_POSTFIELDS, $postDataAtlantic);
curl_setopt($chAtlantic, CURLOPT_RETURNTRANSFER, true);
curl_setopt($chAtlantic, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);

$responseAtlantic = curl_exec($chAtlantic);
$errorAtlantic = curl_error($chAtlantic);
curl_close($chAtlantic);

if ($responseAtlantic === false) {
    echo json_encode(['status' => 'error', 'message' => 'Curl error Atlantic Pedia: ' . $errorAtlantic]);
    exit();
}

$apiResponseAtlantic = json_decode($responseAtlantic, true);

if (isset($apiResponseAtlantic['status']) && $apiResponseAtlantic['status'] === true) {
    $atlanticId = $apiResponseAtlantic['data']['id']; // ID transaksi dari Atlantic
    $qrImage = $apiResponseAtlantic['data']['qr_image']; // URL gambar QRIS
    
    // 2. Simpan Data Transaksi ke Firebase Realtime Database
    $transactionData = [
        'reff_id' => $reffId,
        'product_name' => $productName,
        'price' => $price,
        'atlantic_id' => $atlanticId,
        'qr_image_url' => $qrImage,
        'expected_link' => $expectedLink, // <-- LINK AMAN DARI SISI SERVER, DISIMPAN DI FIREBASE
        'payment_status' => 'pending', // Status awal
        'created_at' => date('Y-m-d H:i:s')
    ];

    // Path di Firebase: /transactions/{atlantic_id}
    $firebaseNodeUrl = FIREBASE_DATABASE_URL . '/transactions/' . $atlanticId . '.json';
    
    $chFirebase = curl_init($firebaseNodeUrl);
    curl_setopt($chFirebase, CURLOPT_CUSTOMREQUEST, "PUT"); // PUT untuk membuat/overwrite data
    curl_setopt($chFirebase, CURLOPT_POSTFIELDS, json_encode($transactionData));
    curl_setopt($chFirebase, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($chFirebase, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Content-Length: ' . strlen(json_encode($transactionData))
    ]);

    $responseFirebase = curl_exec($chFirebase);
    $errorFirebase = curl_error($chFirebase);
    curl_close($chFirebase);

    if ($responseFirebase === false) {
        // Log error Firebase, tapi tetap kirim sukses kalau Atlantic Pedia berhasil
        error_log("Firebase save error: " . $errorFirebase);
        // Bisa tambahkan logic untuk handle kegagalan simpan ke Firebase
        // Namun, untuk contoh ini, kita tetap anggap Atlantic Pedia sukses
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'QRIS berhasil dibuat dan data disimpan ke Firebase',
        'qr_image_url' => $qrImage,
        'atlantic_transaction_id' => $atlanticId,
        'reff_id' => $reffId 
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => $apiResponseAtlantic['message'] ?? 'Gagal membuat transaksi QRIS di Atlantic Pedia',
        'api_response' => $apiResponseAtlantic
    ]);
}
?>
