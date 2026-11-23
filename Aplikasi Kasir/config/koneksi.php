<?php
// Sesuaikan konfigurasi ini dengan MySQL di komputer masing-masing.
$host = "localhost";
$user = "root";
$password = "";
$database = "kasir_bu_rina";

$conn = new mysqli($host, $user, $password, $database);
if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(["success" => false, "message" => "Koneksi database gagal."]));
}
$conn->set_charset("utf8mb4");

function response($data, $status = 200) {
    http_response_code($status);
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode($data);
    exit;
}
