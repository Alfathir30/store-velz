<?php
// check_payment.php
header('Content-Type: application/json');

// --- PENTING! GANTI 'YOUR_ATLANTIC_API_KEY_HERE' dengan API KEY ASLI LO ---
define('ATLANTIC_API_KEY', 'atIjCYZqOkNwQf379v0gmmdSpzfJUvHBMW93oQ9dxBqCjilCzvbqGhrn11BRVo3bkceD9adBMXHpt6tC3oWisS3j710deVVbctk1'); 
define('ATLANTIC_API_URL', 'https://atlantich2h.com');

// --- FIREBASE REALTIME DATABASE CONFIG ---
// Ganti dengan URL Database lo dari firebaseConfig.databaseURL
define('FIREBASE_DATABASE_URL', 'https://store-velz-default-rtdb.firebaseio.com'); 

$transactionId = $_POST['transaction_id'] ?? '';

if (empty($transactionId)) {
    echo json_encode(['status' => 'error', 'message' => 'Transaction ID is required.']);
    exit();
}

// 1. Cek Status Pembayaran ke Atlantic Pedia
$postDataAtlantic = http_build_query([
    'api_key' => ATLANTIC_API_KEY,
    'id' => $transactionId
]);

$chAtlantic = curl_init();
curl_setopt($chAtlantic, CURLOPT_URL, ATLANTIC_API_URL . '/deposit/status');
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
    $paymentStatus = $apiResponseAtlantic['data']['status'];

    // 2. Ambil data transaksi dari Firebase
    $firebaseNodeUrl = FIREBASE_DATABASE_URL . '/transactions/' . $transactionId . '.json';
    $chFirebaseGet = curl_init($firebaseNodeUrl);
    curl_setopt($chFirebaseGet, CURLOPT_RETURNTRANSFER, true);
    $responseFirebaseGet = curl_exec($chFirebaseGet);
    curl_close($chFirebaseGet);
    $transactionDataFirebase = json_decode($responseFirebaseGet, true);

    $accessLink = $transactionDataFirebase['expected_link'] ?? '#'; // Default link jika tidak ditemukan
    $productName = $transactionDataFirebase['product_name'] ?? 'Produk Tidak Dikenal';

    // Update status di Firebase jika berbeda
    if (isset($transactionDataFirebase['payment_status']) && $transactionDataFirebase['payment_status'] !== $paymentStatus) {
        $transactionDataFirebase['payment_status'] = $paymentStatus;
        $transactionDataFirebase['updated_at'] = date('Y-m-d H:i:s');

        $chFirebasePut = curl_init($firebaseNodeUrl);
        curl_setopt($chFirebasePut, CURLOPT_CUSTOMREQUEST, "PUT");
        curl_setopt($chFirebasePut, CURLOPT_POSTFIELDS, json_encode($transactionDataFirebase));
        curl_setopt($chFirebasePut, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($chFirebasePut, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Content-Length: ' . strlen(json_encode($transactionDataFirebase))
        ]);
        curl_exec($chFirebasePut);
        curl_close($chFirebasePut);
    }
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Status retrieved',
        'payment_status' => $paymentStatus,
        'product_name' => $productName,
        'access_link' => $accessLink // Mengirim link akses jika status sukses
    ]);

} else {
    echo json_encode([
        'status' => 'error',
        'message' => $apiResponseAtlantic['message'] ?? 'Gagal cek status transaksi di Atlantic Pedia',
        'api_response' => $apiResponseAtlantic
    ]);
}
?>