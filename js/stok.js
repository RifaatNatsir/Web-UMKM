const KEY_STOK    = "stok";
const elFormStok  = $id("formStok");
const elBodyStok  = $id("tbodyStok");
const btnExportStok   = document.getElementById("btnExportStok");
const inputImportStok = document.getElementById("inputImportStok");
const elSearchStok = document.getElementById("searchStok");
let stokSearchText = "";

// ====== helper storage ======
function getAllStok() {
  return $store.ensure(KEY_STOK, []);
}
function saveAllStok(list) {
  $store.write(KEY_STOK, list);
}

// ====== render tabel stok ======
function renderStok() {
  let data = getAllStok();

  // 🔍 filter berdasarkan teks pencarian
  if (stokSearchText) {
    const q = stokSearchText.toLowerCase();
    data = data.filter(s => (s.nama || "").toLowerCase().includes(q));
  }

  if (!elBodyStok) return;

  if (!data.length) {
    elBodyStok.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted">
          Belum ada data stok.
        </td>
      </tr>
    `;
    return;
  }

  elBodyStok.innerHTML = data.map(s => {
    const menipis = s.jumlah <= s.batas;
    const statusBadge = menipis
      ? '<span class="badge bg-danger">Menipis</span>'
      : '<span class="badge bg-success">Aman</span>';

    return `
      <tr>
        <td>${s.nama || "-"}</td>
        <td>${$fmt.rupiah(s.harga || 0)}</td>
        <td>${s.jumlah ?? 0}</td>
        <td>${s.batas ?? 0}</td>
        <td>${statusBadge}</td>
        <td>
          <button class="btn btn-sm btn-warning me-1" data-act="edit" data-id="${s.id}">Edit</button>
          <button class="btn btn-sm btn-danger" data-act="del" data-id="${s.id}">Hapus</button>
        </td>
      </tr>
    `;
  }).join("");
}

// ====== submit form: tambah / update ======
elFormStok?.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(elFormStok);

  const nama   = (fd.get("nama")   || "").trim();
  const harga  = Number(fd.get("harga")  || 0);
  const jumlah = Number(fd.get("jumlah") || 0);
  const batas  = Number(fd.get("batas")  || 0);

  if (!nama || harga <= 0) {
    return Swal.fire("Validasi", "Nama dan harga harus diisi dengan benar.", "warning");
  }

  const data = getAllStok();
  const item = {
    id: $uuid(),
    nama,
    harga: isNaN(harga)  ? 0 : harga,
    jumlah: isNaN(jumlah)? 0 : jumlah,
    batas: isNaN(batas)  ? 0 : batas
  };

  data.push(item);
  saveAllStok(data);
  elFormStok.reset();
  Swal.fire({
    toast: true,            
    position: 'top',         
    icon: 'success',
    title: "Tersimpan",
    text:"Data stok berhasil disimpan.",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    background: '#fff',  
    color: '#000', 
  });
  renderStok();
});

// ====== klik aksi edit / hapus ======
elBodyStok?.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const { id, act } = btn.dataset;
  const data = getAllStok();

  if (act === "del") {
    Swal.fire({
      title: "Hapus produk?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus"
    }).then(r => {
      if (!r.isConfirmed) return;
      saveAllStok(data.filter(x => x.id !== id));
      Swal.fire("Terhapus", "Data stok telah dihapus.", "success");
      renderStok();
    });
  }

  if (act === "edit") {
    const item = data.find(x => x.id === id);
    if (!item) return;

    // isi ke form
    elFormStok.querySelector('[name="nama"]').value   = item.nama || "";
    elFormStok.querySelector('[name="harga"]').value  = item.harga ?? 0;
    elFormStok.querySelector('[name="jumlah"]').value = item.jumlah ?? 0;
    elFormStok.querySelector('[name="batas"]').value  = item.batas ?? 0;

    // hapus dulu dari list, submit nanti jadi entri baru (simple edit)
    saveAllStok(data.filter(x => x.id !== id));
    renderStok();
  }
});

// ====== EXPORT / IMPORT EXCEL (.xlsx) ======

// Export stok -> .xlsx
function exportStokToXLSX() {
  const data = getAllStok();
  if (!data.length) {
    Swal.fire("Tidak ada data", "Stok masih kosong, tidak bisa diekspor.", "info");
    return;
  }

  const rows = data.map(s => ({
    nama:   s.nama   || "",
    harga:  s.harga  || 0,
    jumlah: s.jumlah || 0,
    batas:  s.batas  || 0
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Stok");

  const today = $fmt.ymd(new Date()).replace(/-/g, "");
  XLSX.writeFile(wb, `stok-umkm-${today}.xlsx`);

  Swal.fire("Berhasil", "Data stok diekspor ke Excel.", "success");
}

// Import .xlsx -> stok
function importStokFromXLSX(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    let wb;
    try {
      wb = XLSX.read(data, { type: "array" });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "File Excel tidak dapat dibaca.", "error");
      return;
    }

    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

    const imported = rows.map(r => {
      const nama   = (r.nama || r.Nama || "").toString().trim();
      const harga  = Number(r.harga  ?? r.Harga  ?? 0);
      const jumlah = Number(r.jumlah ?? r.Jumlah ?? 0);
      const batas  = Number(r.batas  ?? r.Batas  ?? 0);
      if (!nama) return null;
      return {
        id: $uuid(),
        nama,
        harga:  isNaN(harga)  ? 0 : harga,
        jumlah: isNaN(jumlah) ? 0 : jumlah,
        batas:  isNaN(batas)  ? 0 : batas
      };
    }).filter(Boolean);

    if (!imported.length) {
      Swal.fire("Tidak ada data", "Tidak ada baris stok yang valid di file Excel.", "info");
      return;
    }

    Swal.fire({
      title: "Ganti semua data stok?",
      html: `Sebanyak <b>${imported.length}</b> baris stok akan menggantikan data stok yang ada.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, ganti",
      cancelButtonText: "Batal"
    }).then(res => {
      if (!res.isConfirmed) return;
      saveAllStok(imported);
      renderStok();
      Swal.fire("Berhasil", "Data stok berhasil diimport dari Excel.", "success");
    });
  };

  reader.onerror = () => {
    Swal.fire("Error", "Terjadi kesalahan saat membaca file.", "error");
  };

  reader.readAsArrayBuffer(file);
}

btnExportStok?.addEventListener("click", (e) => {
  e.preventDefault();
  exportStokToXLSX();
});

inputImportStok?.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  importStokFromXLSX(file);
  e.target.value = ""; // reset supaya bisa pilih file yang sama lagi
});

// ====== sidebar behaviour ======
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.querySelector('.sidebar');

menuBtn?.addEventListener('click', e => {
  e.stopPropagation();
  sidebar.classList.toggle('open');
  document.body.classList.toggle('menu-open');
});

document.addEventListener('click', e => {
  if (!e.target.closest('.sidebar') && !e.target.closest('#menuBtn') && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    document.body.classList.remove('menu-open');
  }
});

// Tandai menu aktif
const currentPage = location.pathname.split('/').pop();
document.querySelectorAll('.sidebar a').forEach(a => {
  if (a.getAttribute('href') === currentPage) {
    a.classList.add('active');
  }
});

// 🔍 event search stok
elSearchStok?.addEventListener("input", (e) => {
  stokSearchText = e.target.value || "";
  renderStok();
});

// render awal
renderStok();