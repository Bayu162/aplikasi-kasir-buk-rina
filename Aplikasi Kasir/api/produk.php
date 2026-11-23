<?php
require_once "../config/koneksi.php";
$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    $result = $conn->query("SELECT id_produk, nama_produk, harga, stok FROM produk ORDER BY nama_produk ASC");
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $row["id_produk"] = (int)$row["id_produk"];
        $row["harga"] = (int)$row["harga"];
        $row["stok"] = (int)$row["stok"];
        $data[] = $row;
    }
    response(["success" => true, "data" => $data]);
}

$input = json_decode(file_get_contents("php://input"), true) ?? [];

if ($method === "POST") {
    $nama = trim($input["nama_produk"] ?? "");
    $harga = (int)($input["harga"] ?? 0);
    $stok = (int)($input["stok"] ?? 0);
    if ($nama === "" || $harga < 1 || $stok < 0) response(["success"=>false,"message"=>"Data produk tidak valid."], 422);
    $stmt = $conn->prepare("INSERT INTO produk (nama_produk, harga, stok) VALUES (?, ?, ?)");
    $stmt->bind_param("sii", $nama, $harga, $stok);
    if (!$stmt->execute()) response(["success"=>false,"message"=>"Gagal menambah produk."], 500);
    response(["success"=>true,"message"=>"Produk berhasil ditambahkan."]);
}

if ($method === "PUT") {
    $id = (int)($input["id_produk"] ?? 0);
    $nama = trim($input["nama_produk"] ?? "");
    $harga = (int)($input["harga"] ?? 0);
    $stok = (int)($input["stok"] ?? 0);
    if ($id < 1 || $nama === "" || $harga < 1 || $stok < 0) response(["success"=>false,"message"=>"Data produk tidak valid."], 422);
    $stmt = $conn->prepare("UPDATE produk SET nama_produk=?, harga=?, stok=? WHERE id_produk=?");
    $stmt->bind_param("siii", $nama, $harga, $stok, $id);
    $stmt->execute();
    response(["success"=>true,"message"=>"Produk berhasil diperbarui."]);
}

if ($method === "DELETE") {
    $id = (int)($input["id_produk"] ?? 0);
    if ($id < 1) response(["success"=>false,"message"=>"ID produk tidak valid."], 422);
    $stmt = $conn->prepare("DELETE FROM produk WHERE id_produk=?");
    $stmt->bind_param("i", $id);
    if (!$stmt->execute()) response(["success"=>false,"message"=>"Produk tidak dapat dihapus. Periksa transaksi terkait."], 409);
    response(["success"=>true,"message"=>"Produk berhasil dihapus."]);
}
response(["success"=>false,"message"=>"Metode tidak didukung."], 405);
