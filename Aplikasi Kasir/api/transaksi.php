<?php
require_once "../config/koneksi.php";
$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    $sql = "SELECT t.id_transaksi, t.tanggal, t.total, t.bayar, t.kembalian,
                   GROUP_CONCAT(CONCAT(p.nama_produk, ' x', d.jumlah) SEPARATOR ', ') AS rincian
            FROM transaksi t
            LEFT JOIN detail_transaksi d ON d.id_transaksi=t.id_transaksi
            LEFT JOIN produk p ON p.id_produk=d.id_produk
            GROUP BY t.id_transaksi
            ORDER BY t.id_transaksi DESC";
    $result = $conn->query($sql);
    $data = [];
    while ($row = $result->fetch_assoc()) {
        foreach (["id_transaksi","total","bayar","kembalian"] as $key) $row[$key] = (int)$row[$key];
        $data[] = $row;
    }
    $today = date("Y-m-d");
    $stmt = $conn->prepare("SELECT COALESCE(SUM(total),0) AS total, COUNT(*) AS jumlah FROM transaksi WHERE DATE(tanggal)=?");
    $stmt->bind_param("s", $today);
    $stmt->execute();
    $summary = $stmt->get_result()->fetch_assoc();
    response(["success"=>true,"data"=>$data,"summary"=>["penjualan"=>(int)$summary["total"],"jumlah"=>(int)$summary["jumlah"]]]);
}

if ($method === "POST") {
    $input = json_decode(file_get_contents("php://input"), true) ?? [];
    $items = $input["items"] ?? [];
    $bayar = (int)($input["bayar"] ?? 0);
    if (!is_array($items) || count($items) === 0) response(["success"=>false,"message"=>"Keranjang kosong."], 422);

    $conn->begin_transaction();
    try {
        $total = 0;
        $validItems = [];
        foreach ($items as $item) {
            $id = (int)($item["id_produk"] ?? 0);
            $jumlah = (int)($item["jumlah"] ?? 0);
            if ($id < 1 || $jumlah < 1) throw new Exception("Item transaksi tidak valid.");
            $stmt = $conn->prepare("SELECT harga, stok FROM produk WHERE id_produk=? FOR UPDATE");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $product = $stmt->get_result()->fetch_assoc();
            if (!$product) throw new Exception("Produk tidak ditemukan.");
            if ((int)$product["stok"] < $jumlah) throw new Exception("Stok produk tidak mencukupi.");
            $harga = (int)$product["harga"];
            $total += $harga * $jumlah;
            $validItems[] = ["id"=>$id,"jumlah"=>$jumlah,"harga"=>$harga];
        }
        if ($bayar < $total) throw new Exception("Uang pembayaran belum mencukupi.");
        $kembalian = $bayar - $total;
        $stmt = $conn->prepare("INSERT INTO transaksi (total, bayar, kembalian) VALUES (?, ?, ?)");
        $stmt->bind_param("iii", $total, $bayar, $kembalian);
        if (!$stmt->execute()) throw new Exception("Gagal menyimpan transaksi.");
        $transaksiId = $conn->insert_id;

        $detail = $conn->prepare("INSERT INTO detail_transaksi (id_transaksi, id_produk, jumlah, harga_satuan, subtotal) VALUES (?, ?, ?, ?, ?)");
        $updateStock = $conn->prepare("UPDATE produk SET stok=stok-? WHERE id_produk=?");
        foreach ($validItems as $item) {
            $subtotal = $item["harga"] * $item["jumlah"];
            $detail->bind_param("iiiii", $transaksiId, $item["id"], $item["jumlah"], $item["harga"], $subtotal);
            if (!$detail->execute()) throw new Exception("Gagal menyimpan detail transaksi.");
            $updateStock->bind_param("ii", $item["jumlah"], $item["id"]);
            if (!$updateStock->execute()) throw new Exception("Gagal memperbarui stok.");
        }
        $conn->commit();
        response(["success"=>true,"message"=>"Transaksi berhasil disimpan.","id_transaksi"=>$transaksiId,"total"=>$total,"bayar"=>$bayar,"kembalian"=>$kembalian]);
    } catch (Exception $e) {
        $conn->rollback();
        response(["success"=>false,"message"=>$e->getMessage()], 400);
    }
}
response(["success"=>false,"message"=>"Metode tidak didukung."], 405);
