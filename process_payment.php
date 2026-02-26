<?php
// ===============================
// PROCESS PAYMENT - QRIS ATLANTIC
// ===============================

// Jangan ada spasi/baris kosong sebelum ini!
header('Content-Type: application/json');

// ====== CONFIG ======
define('ATLANTIC_API_KEY', 'API_KEY_KAMU_DISINI'); 
define('ATLANTIC_API_URL', 'https://atlantich2h.com');

// ====== VALIDASI INPUT ======
$productName = $_POST['product_name'] ?? '';
$price = isset($_POST['price']) ? (int)$_POST['price'] : 0;

if (empty($productName) || $price <= 0) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Produk atau harga tidak valid.'
    ]);
    exit();
}

// ====== BUAT REFF ID UNIK ======
$reffId = 'WEBSTORE-' . uniqid();

// ====== DATA UNTUK ATLANTIC ======
$postDataAtlantic = http_build_query([
    'api_key' => ATLANTIC_API_KEY,
    'reff_id' => $reffId,
    'nominal' => $price,
    'type' => 'ewallet',
    'method' => 'qris' // PENTING: pakai "method" bukan "metode"
]);

// ====== CURL REQUEST ======
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, ATLANTIC_API_URL . '/deposit/create');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postDataAtlantic);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded'
]);

$response = curl_exec($ch);
$error = curl_error($ch);
curl_close($ch);

// ====== HANDLE CURL ERROR ======
if ($response === false) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Curl error: ' . $error
    ]);
    exit();
}

// ====== DECODE RESPONSE ======
$apiResponse = json_decode($response, true);

// ====== DEBUG (kalau mau lihat response asli, uncomment)
// echo $response; exit();

if (isset($apiResponse['status']) && $apiResponse['status'] === true) {
    
    echo json_encode([
        'status' => 'success',
        'qr_image_url' => $apiResponse['data']['qr_image'],
        'qr_string' => $apiResponse['data']['qr_string'],
        'reff_id' => $reffId,
        'expired_at' => $apiResponse['data']['expired_at']
    ]);

} else {

    echo json_encode([
        'status' => 'error',
        'message' => $apiResponse['message'] ?? 'Gagal membuat QRIS',
        'full_response' => $apiResponse
    ]);
}
?>
