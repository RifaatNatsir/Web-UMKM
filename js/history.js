// === KONFIGURASI KEY STORAGE ===
const KEY_TRX_HIS = "transaksi";
const KEY_UTANG_REAL = "utangpiutang"; // <--- SUDAH DISESUAIKAN DENGAN KODE ANDA

// Elemen DOM
const elSearch   = document.getElementById("hisSearch");
const elFrom     = document.getElementById("hisFrom");
const elTo       = document.getElementById("hisTo");
const elType     = document.getElementById("hisType");
const elKategori = document.getElementById("hisKategori");
const elBody     = document.getElementById("tbodyHistory");

// --- 1. FUNGSI PENGGABUNG DATA ---
function getAllData() {
  // A. Ambil Data Transaksi (Pastikan $store ada, atau pakai localStorage manual)
  // Jika error '$store is not defined', ganti baris ini dgn: JSON.parse(localStorage.getItem(KEY_TRX_HIS)) || []
  const trx = typeof $store !== 'undefined' ? $store.ensure(KEY_TRX_HIS, []) : (JSON.parse(localStorage.getItem(KEY_TRX_HIS)) || []);
  
  // B. Ambil Data Utang Piutang (Sesuai Key Anda)
  const rawUtang = JSON.parse(localStorage.getItem(KEY_UTANG_REAL)) || [];

  // C. Konversi Data Utang agar cocok dengan tabel History
  const utangMapped = rawUtang.map(u => ({
    id: u.id,
    tanggal: u.tanggal,
    // Gabung Nama + Catatan + Status Lunas
    keterangan: `${u.nama} (${u.catatan || '-'}) [${u.status}]`, 
    kategori: 'Pinjaman', // Kategori kita set manual
    jenis: u.jenis,       // 'utang' atau 'piutang'
    nominal: Number(u.nominal || 0)
  }));

  // D. Gabungkan Array
  return [...trx, ...utangMapped];
}

// Isi dropdown kategori
function initKategoriOptions() {
  if (!elKategori) return;
  const data = getAllData();
  const set = new Set();
  data.forEach(t => { if (t.kategori) set.add(t.kategori); });

  elKategori.innerHTML = `<option value="">Semua Kategori</option>`;
  [...set].sort().forEach(k => {
    elKategori.innerHTML += `<option value="${k}">${k}</option>`;
  });
}

// --- 2. UPDATE TAMPILAN (Warna-warni) ---
function renderHistory(rows) {
  if (!elBody) return;

  if (!rows.length) {
    elBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Tidak ada data.</td></tr>`;
    return;
  }

  elBody.innerHTML = rows.map(t => {
    // Tentukan Warna Badge
    let textClass = "text-dark";
    let label = t.jenis;

    // Normalisasi huruf kecil/besar
    const jenis = (t.jenis || "").toLowerCase();

    if (jenis === 'pemasukan') {
      textClass = "text-success"; label = "Pemasukan";
    } else if (jenis === 'pengeluaran') {
      textClass = "text-danger"; label = "Pengeluaran";
    } else if (jenis === 'utang') {
      textClass = "text-warning fw-bold"; label = "Utang"; // Kuning
    } else if (jenis === 'piutang') {
      textClass = "text-primary fw-bold"; label = "Piutang"; // Biru
    }

    // Format Rupiah (Pakai $fmt jika ada, atau manual)
    const nominalRp = typeof $fmt !== 'undefined' ? $fmt.rupiah(t.nominal) : "Rp " + t.nominal.toLocaleString('id-ID');
    const tglIndo   = typeof $fmt !== 'undefined' ? $fmt.ymd(t.tanggal) : t.tanggal;

    return `
    <tr>
      <td>${tglIndo}</td>
      <td>${t.keterangan || "-"}</td>
      <td>${t.kategori || "-"}</td>
      <td class="${textClass}">${label}</td>
      <td>${nominalRp}</td>
    </tr>
    `;
  }).join("");
}

// --- 3. LOGIKA FILTER UTAMA ---
function applyFilter() {
  let filtered = getAllData();

  const qText = (elSearch?.value || "").toLowerCase();
  const dFrom = elFrom?.value || "";
  const dTo   = elTo?.value || "";
  const tipe  = (elType?.value || "").toLowerCase();
  const kat   = elKategori?.value || "";

  // 1. Filter Teks
  if (qText) {
    filtered = filtered.filter(t => {
      // Cari di keterangan atau kategori
      const str = (t.keterangan + " " + t.kategori).toLowerCase();
      return str.includes(qText);
    });
  }

  // 2. Filter Tanggal
  if (dFrom) filtered = filtered.filter(t => t.tanggal >= dFrom);
  if (dTo)   filtered = filtered.filter(t => t.tanggal <= dTo);

  // 3. Filter Tipe
  if (tipe) filtered = filtered.filter(t => (t.jenis||"").toLowerCase() === tipe);

  // 4. Filter Kategori
  if (kat) filtered = filtered.filter(t => t.kategori === kat);

  // 5. Urutkan (Terbaru di atas)
  filtered.sort((a, b) => {
    if (a.tanggal === b.tanggal) return 0;
    return a.tanggal > b.tanggal ? -1 : 1;
  });

  renderHistory(filtered);
}

// Event Listeners (Live Filter)
[elSearch, elFrom, elTo, elType, elKategori].forEach(el => {
  if (el) {
    el.addEventListener("change", applyFilter);
    el.addEventListener("keyup", applyFilter); // Biar ngetik langsung update
  }
});

// Jalankan saat file dimuat
document.addEventListener("DOMContentLoaded", () => {
    initKategoriOptions();
    applyFilter();
});

// === SIDEBAR (JANGAN DIHAPUS) ===
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.querySelector('.sidebar');
menuBtn?.addEventListener('click', (e) => { e.stopPropagation(); sidebar.classList.toggle('open'); });
document.addEventListener('click', (e) => {
  if (!e.target.closest('.sidebar') && !e.target.closest('#menuBtn') && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
  }
});
const currentPage = location.pathname.split('/').pop();
document.querySelectorAll('.sidebar a').forEach(a => {
  if (a.getAttribute('href') === currentPage) a.classList.add('active');
});