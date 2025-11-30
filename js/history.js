// Riwayat transaksi + filter

const KEY_TRX_HIS = "transaksi";

const elSearch   = document.getElementById("hisSearch");
const elFrom     = document.getElementById("hisFrom");
const elTo       = document.getElementById("hisTo");
const elType     = document.getElementById("hisType");
const elKategori = document.getElementById("hisKategori");
const elBtn      = document.getElementById("btnHisFilter");
const elBody     = document.getElementById("tbodyHistory");

// Ambil semua transaksi dari localStorage via helper $store
function getTransaksiAll() {
  return $store.ensure(KEY_TRX_HIS, []);
}

// Isi dropdown kategori berdasarkan data transaksi unik
function initKategoriOptions() {
  if (!elKategori) return;
  const data = getTransaksiAll();
  const set = new Set();
  data.forEach(t => {
    if (t.kategori) set.add(t.kategori);
  });

  // hapus semua selain opsi pertama
  elKategori.innerHTML = `<option value="">Semua Kategori</option>`;
  [...set].sort().forEach(k => {
    elKategori.innerHTML += `<option value="${k}">${k}</option>`;
  });
}

// Render tabel history
function renderHistory(rows) {
  if (!elBody) return;

  if (!rows.length) {
    elBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted">
          Tidak ada data yang cocok dengan filter.
        </td>
      </tr>
    `;
    return;
  }

  elBody.innerHTML = rows.map(t => `
    <tr>
      <td>${$fmt.ymd(t.tanggal)}</td>
      <td>${(t.keterangan || "-")}</td>
      <td>${(t.kategori || "-")}</td>
      <td class="${t.jenis === "pemasukan" ? "text-success" : "text-danger"}">
        ${t.jenis === "pemasukan" ? "Pemasukan" : "Pengeluaran"}
      </td>
      <td>${$fmt.rupiah(t.nominal || 0)}</td>
    </tr>
  `).join("");
}

// Terapkan filter ke data transaksi
function applyFilter() {
  const all = getTransaksiAll();

  const qText = (elSearch?.value || "").toLowerCase();
  const dFrom = elFrom?.value || "";
  const dTo   = elTo?.value || "";
  const tipe  = elType?.value || "";
  const kat   = elKategori?.value || "";

  let filtered = all;

  // Filter teks (keterangan + kategori + kontak)
  if (qText) {
    filtered = filtered.filter(t => {
      const src = [
        t.keterangan || "",
        t.kategori || "",
        t.kontak || ""
      ].join(" ").toLowerCase();
      return src.includes(qText);
    });
  }

  // Filter tanggal dari
  if (dFrom) {
    filtered = filtered.filter(t => {
      return (t.tanggal || "") >= dFrom;
    });
  }

  // Filter tanggal sampai
  if (dTo) {
    filtered = filtered.filter(t => {
      return (t.tanggal || "") <= dTo;
    });
  }

  // Filter tipe
  if (tipe) {
    filtered = filtered.filter(t => t.jenis === tipe);
  }

  // Filter kategori
  if (kat) {
    filtered = filtered.filter(t => t.kategori === kat);
  }

  // Sort terbaru di atas (opsional)
  filtered.sort((a, b) => {
    if (a.tanggal === b.tanggal) {
      return (b.id || "").localeCompare(a.id || "");
    }
    return (b.tanggal || "").localeCompare(a.tanggal || "");
  });

  renderHistory(filtered);
}

// Event: tombol "Terapkan Filter"
elBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  applyFilter();
});

// Event live: ketik/cari langsung update
[elSearch, elFrom, elTo, elType, elKategori].forEach(el => {
  el?.addEventListener("change", applyFilter);
  el?.addEventListener("input", () => {
    // untuk search text, biar realtime
    if (el === elSearch) applyFilter();
  });
});

// Inisialisasi awal
(function initHistory() {
  initKategoriOptions();
  applyFilter();
})();

const menuBtn = document.getElementById('menuBtn');
const sidebar = document.querySelector('.sidebar');

// Toggle sidebar di mobile
menuBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  sidebar.classList.toggle('open');
});

// Tutup sidebar saat klik area luar
document.addEventListener('click', (e) => {
  if (!e.target.closest('.sidebar') && !e.target.closest('#menuBtn') && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
  }
});

// Tandai menu aktif
const currentPage = location.pathname.split('/').pop();
document.querySelectorAll('.sidebar a').forEach(a => {
  if (a.getAttribute('href') === currentPage) {
    a.classList.add('active');
  }
});