<?php
// This file is now replaced by netlify/functions/transfer-ewallet.js
// Keep this file for reference or delete it after migration
?>
<!DOCTYPE html>
<html>
<head>
  <title>Transfer ke E-Wallet - Netlify Version</title>
</head>
<body>
  <h2>Transfer ke E-Wallet</h2>
  <p><strong>Note:</strong> This form now uses Netlify Functions instead of PHP.</p>
  <form action="/.netlify/functions/transfer-ewallet" method="post">
    <label for="wallet">Pilih E-Wallet:</label>
    <select name="kode_bank" required>
      <option value="dana">DANA</option>
      <option value="gopay">GoPay</option>
      <option value="ovo">OVO</option>
      <option value="shopeepay">ShopeePay</option>
      <option value="linkaja">LinkAja</option>
    </select>
    <br><br>

    <label for="nomor">Nomor HP E-Wallet:</label>
    <input type="text" name="nomor_akun" placeholder="08xxxxxxxxxx" required>
    <br><br>

    <label for="nama">Nama Pemilik:</label>
    <input type="text" name="nama_pemilik" required>
    <br><br>

    <label for="nominal">Nominal (Rp):</label>
    <input type="number" name="nominal" min="10000" required>
    <br><br>

    <label for="email">Email Penerima (opsional):</label>
    <input type="email" name="email">
    <br><br>

    <label for="note">Catatan (opsional):</label>
    <input type="text" name="note">
    <br><br>

    <button type="submit">Kirim Sekarang</button>
  </form>
</body>
</html>
