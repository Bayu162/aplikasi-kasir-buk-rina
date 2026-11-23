CREATE DATABASE IF NOT EXISTS kasir_bu_rina
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kasir_bu_rina;

CREATE TABLE IF NOT EXISTS produk (
    id_produk INT AUTO_INCREMENT PRIMARY KEY,
    nama_produk VARCHAR(100) NOT NULL,
    harga INT NOT NULL,
    stok INT NOT NULL DEFAULT 0,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transaksi (
    id_transaksi INT AUTO_INCREMENT PRIMARY KEY,
    tanggal DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total INT NOT NULL,
    bayar INT NOT NULL,
    kembalian INT NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS detail_transaksi (
    id_detail INT AUTO_INCREMENT PRIMARY KEY,
    id_transaksi INT NOT NULL,
    id_produk INT NOT NULL,
    jumlah INT NOT NULL,
    harga_satuan INT NOT NULL,
    subtotal INT NOT NULL,
    CONSTRAINT fk_detail_transaksi
      FOREIGN KEY (id_transaksi) REFERENCES transaksi(id_transaksi)
      ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_detail_produk
      FOREIGN KEY (id_produk) REFERENCES produk(id_produk)
      ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Contoh produk awal. Hapus bagian INSERT jika tidak ingin data contoh.
INSERT INTO produk (nama_produk, harga, stok) VALUES
('Nasi Goreng', 12000, 20),
('Mie Goreng', 10000, 20),
('Es Teh', 4000, 30),
('Air Mineral', 3000, 25),
('Kopi', 5000, 20),
('Roti', 6000, 15);
