KASIR BU RINA - PETUNJUK INSTALASI

Kebutuhan:
- XAMPP (Apache dan MySQL)
- Browser (Chrome/Firefox)
- phpMyAdmin

LANGKAH:
1. Ekstrak folder kasir_bu_rina ke C:\xampp\htdocs\
2. Buka XAMPP, jalankan Apache dan MySQL.
3. Buka http://localhost/phpmyadmin
4. Pilih menu Import, pilih database/kasir_bu_rina.sql, lalu klik Import/Go.
   Alternatif: buka tab SQL dan jalankan isi file SQL tersebut.
5. Pastikan config/koneksi.php memakai:
   host=localhost, user=root, password kosong, database=kasir_bu_rina.
   Sesuaikan jika MySQL Anda memakai password.
6. Buka http://localhost/kasir_bu_rina/

FITUR:
- Menampilkan dan mencari produk
- Tambah, edit, hapus produk
- Keranjang dan hitung total
- Pembayaran dan kembalian
- Stok berkurang otomatis setelah transaksi
- Riwayat transaksi
- Ringkasan penjualan hari ini

CATATAN:
- Jangan buka index.html dengan klik dua kali. PHP dan database perlu dijalankan
  melalui Apache, yaitu alamat localhost.
- Ini versi pembelajaran lokal. Belum dilengkapi login pengguna, pembatasan hak
  akses, backup, dan konfigurasi keamanan untuk server publik.
