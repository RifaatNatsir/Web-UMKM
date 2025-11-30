// utangpiutang.js
const KEY_UP   = "utangpiutang";
const elFormUP = $id("formUP");
const elBodyUP = $id("tbodyUP");

// Elemen filter
const fStatus  = document.getElementById("filterStatus");
const fJenis   = document.getElementById("filterJenis");
const fTempo   = document.getElementById("filterTempo");
const btnFilt  = document.getElementById("btnFilterUP");

// Ambil semua data mentah
function getUPAll() {
  return $store.ensure(KEY_UP, []);
}

// Terapkan filter sesuai UI
function getUPFiltered() {
  let data = getUPAll();

  const vStatus = fStatus?.value || "Semua"; // "Semua" / "Belum Lunas" / "Lunas"
  const vJenis  = fJenis?.value || "";       // "" / "utang" / "piutang"
  const vTempo  = fTempo?.value || "";       // "YYYY-MM-DD" atau ""

  if (vStatus !== "Semua") {
    data = data.filter(x => x.status === vStatus);
  }

  if (vJenis) {
    data = data.filter(x => (x.jenis || "").toLowerCase() === vJenis.toLowerCase());
  }

  if (vTempo) {
    data = data.filter(x => (x.jatuhTempo || "") <= vTempo);
  }

  // sort: yang paling dekat tempo di atas
  data.sort((a, b) => (a.jatuhTempo || "").localeCompare(b.jatuhTempo || ""));
  return data;
}

function renderUP(list) {
  const data = list || getUPFiltered();
  if (!elBodyUP) return;

  if (!data.length) {
    elBodyUP.innerHTML = `
      <tr>
        <td colspan="8" class="text-center text-muted">
          Belum ada data yang cocok dengan filter.
        </td>
      </tr>
    `;
    return;
  }

  elBodyUP.innerHTML = data.map(u => `
    <tr>
      <td>${u.nama || "-"}</td>
      <td>${u.jenis === "piutang" ? "piutang" : "utang"}</td>
      <td>${$fmt.rupiah(u.nominal || 0)}</td>
      <td>${u.tanggal || "-"}</td>
      <td>${u.jatuhTempo || "-"}</td>
      <td>
        ${u.status === "Lunas"
          ? '<span class="badge bg-success">Lunas</span>'
          : '<span class="badge bg-warning text-dark">Belum Lunas</span>'
        }
      </td>
      <td>${u.bukti ? `<a href="${u.bukti}" target="_blank">Lihat</a>` : "-"}</td>
      <td>
        ${u.status !== "Lunas"
          ? `<button class="btn btn-sm btn-success me-1" data-act="lunas" data-id="${u.id}">Tandai Lunas</button>`
          : ""
        }
        <button class="btn btn-sm btn-danger" data-act="del" data-id="${u.id}">Hapus</button>
      </td>
    </tr>
  `).join("");
}

// Submit form: tambah utang/piutang baru
elFormUP?.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(elFormUP);

  const item = {
    id: $uuid(),
    nama: (fd.get("nama") || "").trim(),
    jenis: (fd.get("jenis") || "utang").toLowerCase(), // utang / piutang
    nominal: Number(fd.get("nominal") || 0),
    tanggal: fd.get("tanggal") || $fmt.ymd(new Date()),
    jatuhTempo: fd.get("jatuhTempo") || $fmt.ymd(new Date()),
    status: fd.get("status") || "Belum Lunas",
    catatan: (fd.get("catatan") || "").trim(),
    // untuk demo: hanya simpan nama file jika ada
    bukti: (fd.get("bukti") && fd.get("bukti").name) || null
  };

  if (!item.nama || item.nominal <= 0) {
    return Swal.fire(
      "Data belum lengkap",
      "Nama dan nominal harus diisi dengan benar.",
      "warning"
    );
  }

  const data = getUPAll();
  data.push(item);
  $store.write(KEY_UP, data);
  elFormUP.reset();
  Swal.fire("Tersimpan", "Catatan utang/piutang disimpan.", "success");
  renderUP();
});

// Klik pada tombol Lunas / Hapus
elBodyUP?.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const { id, act } = btn.dataset;
  const data = getUPAll();

  if (act === "lunas") {
    $store.write(KEY_UP, data.map(x =>
      x.id === id ? { ...x, status: "Lunas" } : x
    ));
    Swal.fire("Berhasil", "Status diubah menjadi Lunas.", "success");
    renderUP();
  }

  if (act === "del") {
    Swal.fire({
      title: "Hapus catatan?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus"
    }).then(r => {
      if (!r.isConfirmed) return;
      $store.write(KEY_UP, data.filter(x => x.id !== id));
      Swal.fire("Terhapus", "Data telah dihapus.", "success");
      renderUP();
    });
  }
});

// FILTER: tombol & perubahan input
function applyUPFilter() {
  renderUP();
}

btnFilt?.addEventListener("click", (e) => {
  e.preventDefault();
  applyUPFilter();
});

[fStatus, fJenis, fTempo].forEach(el => {
  el?.addEventListener("change", applyUPFilter);
});

// Render awal
renderUP();

// === script sidebar kamu tetap ===
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