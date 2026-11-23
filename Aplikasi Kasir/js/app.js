const API_PRODUK = "api/produk.php";
const API_TRANSAKSI = "api/transaksi.php";
let produk = [];
let keranjang = [];
let riwayat = [];

const rupiah = angka => "Rp" + Number(angka || 0).toLocaleString("id-ID");
const byId = id => document.getElementById(id);

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const result = await response.json();
  if (!response.ok || result.success === false) throw new Error(result.message || "Terjadi kesalahan.");
  return result;
}

async function muatProduk() {
  const result = await request(API_PRODUK);
  produk = result.data;
  tampilProduk();
  tampilTabelProduk();
  byId("jumlahProduk").textContent = produk.length;
}
async function muatRiwayat() {
  const result = await request(API_TRANSAKSI);
  riwayat = result.data;
  byId("penjualanHariIni").textContent = rupiah(result.summary.penjualan);
  byId("jumlahTransaksi").textContent = result.summary.jumlah;
  tampilRiwayat();
}
function tampilProduk() {
  const kata = byId("cariProduk").value.toLowerCase();
  const hasil = produk.filter(p => p.nama_produk.toLowerCase().includes(kata));
  byId("daftarProduk").innerHTML = hasil.length ? hasil.map(p => `
    <article class="product">
      <strong>${aman(p.nama_produk)}</strong>
      <span class="price">${rupiah(p.harga)}</span>
      <span class="stock">Stok: ${p.stok}</span>
      <button class="btn btn-primary" onclick="tambahKeranjang(${p.id_produk})" ${p.stok < 1 ? "disabled" : ""}>+ Tambah</button>
    </article>`).join("") : '<p class="empty">Produk tidak ditemukan.</p>';
}
function tambahKeranjang(id) {
  const p = produk.find(x => x.id_produk === id);
  if (!p || p.stok < 1) return;
  const item = keranjang.find(x => x.id_produk === id);
  if (item) {
    if (item.jumlah >= p.stok) return alert("Jumlah melebihi stok.");
    item.jumlah++;
  } else keranjang.push({ id_produk: p.id_produk, nama_produk: p.nama_produk, harga: p.harga, jumlah: 1, stok: p.stok });
  tampilKeranjang();
}
function ubahJumlah(id, perubahan) {
  const item = keranjang.find(x => x.id_produk === id);
  if (!item) return;
  const p = produk.find(x => x.id_produk === id);
  const jumlahBaru = item.jumlah + perubahan;
  if (jumlahBaru > item.stok) return alert("Jumlah melebihi stok.");
  if (jumlahBaru < 1) keranjang = keranjang.filter(x => x.id_produk !== id);
  else item.jumlah = jumlahBaru;
  tampilKeranjang();
}
function hitungTotal() { return keranjang.reduce((sum, item) => sum + item.harga * item.jumlah, 0); }
function tampilKeranjang() {
  byId("keranjang").innerHTML = keranjang.length ? `<div class="table-wrap"><table><thead><tr><th>Produk</th><th>Jumlah</th><th>Subtotal</th></tr></thead><tbody>
    ${keranjang.map(i => `<tr><td>${aman(i.nama_produk)}<br><small>${rupiah(i.harga)}</small></td>
    <td><div class="qty"><button class="btn-light" onclick="ubahJumlah(${i.id_produk},-1)">−</button>${i.jumlah}<button class="btn-light" onclick="ubahJumlah(${i.id_produk},1)">+</button></div></td>
    <td>${rupiah(i.harga * i.jumlah)}</td></tr>`).join("")}</tbody></table></div>` : '<p class="empty">Belum ada produk dipilih.</p>';
  byId("total").textContent = rupiah(hitungTotal());
  hitungKembalian();
  byId("btnBayar").disabled = !keranjang.length;
}
function hitungKembalian() {
  const bayar = Number(byId("uangBayar").value) || 0;
  byId("kembalian").textContent = rupiah(Math.max(0, bayar - hitungTotal()));
}
async function simpanTransaksi() {
  if (!keranjang.length) return alert("Keranjang masih kosong.");
  const bayar = Number(byId("uangBayar").value) || 0;
  if (bayar < hitungTotal()) return alert("Uang pembayaran belum mencukupi.");
  try {
    const result = await request(API_TRANSAKSI, {
      method: "POST",
      body: JSON.stringify({ bayar, items: keranjang.map(i => ({ id_produk: i.id_produk, jumlah: i.jumlah })) })
    });
    alert(`${result.message}\nTotal: ${rupiah(result.total)}\nKembalian: ${rupiah(result.kembalian)}`);
    keranjang = [];
    byId("uangBayar").value = "";
    tampilKeranjang();
    await muatProduk();
    await muatRiwayat();
  } catch (error) { alert(error.message); }
}
function tampilTabelProduk() {
  byId("tabelProduk").innerHTML = produk.length ? `<table><thead><tr><th>Nama Produk</th><th>Harga</th><th>Stok</th><th>Aksi</th></tr></thead><tbody>
    ${produk.map(p => `<tr><td>${aman(p.nama_produk)}</td><td>${rupiah(p.harga)}</td><td>${p.stok}</td><td><div class="actions">
    <button class="btn-light" onclick="editProduk(${p.id_produk})">Edit</button>
    <button class="danger" onclick="hapusProduk(${p.id_produk})">Hapus</button></div></td></tr>`).join("")}</tbody></table>` : '<p class="empty">Belum ada produk.</p>';
}
function resetFormProduk() {
  byId("formProduk").reset(); byId("idProduk").value = "";
  byId("judulFormProduk").textContent = "Tambah Produk";
  byId("btnSimpanProduk").textContent = "Simpan Produk";
  byId("btnBatalEdit").classList.add("hidden");
}
function editProduk(id) {
  const p = produk.find(x => x.id_produk === id); if (!p) return;
  byId("idProduk").value = p.id_produk; byId("namaProduk").value = p.nama_produk;
  byId("hargaProduk").value = p.harga; byId("stokProduk").value = p.stok;
  byId("judulFormProduk").textContent = "Edit Produk";
  byId("btnSimpanProduk").textContent = "Perbarui Produk";
  byId("btnBatalEdit").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
async function hapusProduk(id) {
  if (!confirm("Yakin ingin menghapus produk ini?")) return;
  try {
    await request(API_PRODUK, { method: "DELETE", body: JSON.stringify({ id_produk: id }) });
    await muatProduk();
  } catch (error) { alert(error.message); }
}
function tampilRiwayat() {
  byId("tabelRiwayat").innerHTML = riwayat.length ? `<table><thead><tr><th>No.</th><th>Tanggal</th><th>Rincian</th><th>Total</th><th>Bayar</th><th>Kembalian</th></tr></thead><tbody>
    ${riwayat.map((t, i) => `<tr><td>${i + 1}</td><td>${aman(t.tanggal)}</td><td>${aman(t.rincian || "-")}</td><td>${rupiah(t.total)}</td><td>${rupiah(t.bayar)}</td><td>${rupiah(t.kembalian)}</td></tr>`).join("")}</tbody></table>` : '<p class="empty">Belum ada transaksi.</p>';
}
function aman(teks) {
  return String(teks).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}
document.querySelectorAll(".tab").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b === button));
  document.querySelectorAll(".page").forEach(p => p.classList.toggle("hidden", p.id !== "page-" + button.dataset.page));
}));
byId("cariProduk").addEventListener("input", tampilProduk);
byId("uangBayar").addEventListener("input", hitungKembalian);
byId("btnBayar").addEventListener("click", simpanTransaksi);
byId("btnKosongkan").addEventListener("click", () => { keranjang = []; byId("uangBayar").value = ""; tampilKeranjang(); });
byId("btnBatalEdit").addEventListener("click", resetFormProduk);
byId("formProduk").addEventListener("submit", async e => {
  e.preventDefault();
  const id = Number(byId("idProduk").value);
  const data = {
    nama_produk: byId("namaProduk").value.trim(),
    harga: Number(byId("hargaProduk").value),
    stok: Number(byId("stokProduk").value)
  };
  try {
    await request(API_PRODUK, { method: id ? "PUT" : "POST", body: JSON.stringify(id ? { ...data, id_produk: id } : data) });
    resetFormProduk(); await muatProduk();
  } catch (error) { alert(error.message); }
});
async function mulai() {
  byId("tanggal").textContent = new Date().toLocaleDateString("id-ID", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
  tampilKeranjang();
  try { await muatProduk(); await muatRiwayat(); }
  catch (error) { alert("Tidak dapat terhubung ke server. Pastikan Apache dan MySQL XAMPP aktif, database sudah diimpor, dan aplikasi dibuka melalui http://localhost/kasir_bu_rina/ ."); console.error(error); }
}
mulai();
