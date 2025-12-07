const KEY_TRX = "transaksi";

const elForm = $id("formTransaksi");
const elBody = $id("tbodyTransaksi");

// ELEMAN FILTER
const fMonth   = document.getElementById("filterMonth");
const fKategori= document.getElementById("filterKategori");
const fJenis   = document.getElementById("filterJenis");
const btnFilter= document.getElementById("btnFilterTrx");

// render tabel
function renderTransaksi(source) {
  const data = source || $store.ensure(KEY_TRX, []);
  if (!elBody) return;

  if (!data.length) {
    elBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted">
          Belum ada transaksi.
        </td>
      </tr>
    `;
    return;
  }

  elBody.innerHTML = data.map(t => `
    <tr>
      <td>${t.tanggal}</td>
      <td class="${t.jenis==='pemasukan'?'text-success':'text-danger'}">
        ${t.jenis}
      </td>
      <td>${t.kategori||"-"}</td>
      <td>${$fmt.rupiah(t.nominal)}</td>
      <td>${t.kontak||"-"}</td>
      <td>${t.keterangan||"-"}</td>
      <td>
        <button class="btn btn-sm btn-warning" data-act="edit" data-id="${t.id}">Edit</button>
        <button class="btn btn-sm btn-danger" data-act="del" data-id="${t.id}">Hapus</button>
      </td>
    </tr>
  `).join("");
}

// Terapkan filter berdasarkan input
function applyTransaksiFilter() {
  const all = $store.ensure(KEY_TRX, []);

  const monthVal = fMonth?.value || "";           // format "YYYY-MM"
  const keyText  = (fKategori?.value || "").toLowerCase().trim();
  const jenisVal = fJenis?.value || "";           // "" / "pemasukan" / "pengeluaran"

  let rows = all;

  // Filter bulan (periode)
  if (monthVal) {
    rows = rows.filter(t => (t.tanggal || "").startsWith(monthVal));
  }

  // Filter kategori (Dropdown Spesifik)
  if (keyText) {
    rows = rows.filter(t => (t.kategori || "").toLowerCase() === keyText);
  }

  // Filter jenis
  if (jenisVal) {
    rows = rows.filter(t => t.jenis === jenisVal);
  }

  renderTransaksi(rows);
}

elForm?.addEventListener("submit", (e)=>{
  e.preventDefault();
  const fd = new FormData(elForm);
  const item = {
    id: $uuid(),
    tanggal: fd.get("tanggal") || $fmt.ymd(new Date()),
    jenis: fd.get("jenis") || "pemasukan",
    kategori: (fd.get("kategori")||"").trim(),
    nominal: Number(fd.get("nominal")||0),
    keterangan: (fd.get("keterangan")||"").trim(),
    kontak: (fd.get("kontak")||"").trim()
  };
  if(!item.kategori || item.nominal<=0){
    return Swal.fire("Validasi", "Kategori & nominal harus benar.", "warning");
  }
  const data = $store.ensure(KEY_TRX, []);
  data.push(item);
  $store.write(KEY_TRX, data);
  elForm.reset();
  Swal.fire("Tersimpan", "Transaksi ditambahkan.", "success");
  applyTransaksiFilter(); // re-render dengan filter aktif
});

elBody?.addEventListener("click",(e)=>{
  const btn = e.target.closest("button"); if(!btn) return;
  const id = btn.dataset.id, act = btn.dataset.act;
  const data = $store.ensure(KEY_TRX, []);
  if(act==="del"){
    Swal.fire({title:"Hapus transaksi?", icon:"warning", showCancelButton:true})
      .then(r=>{
        if(!r.isConfirmed) return;
        const next = data.filter(x=>x.id!==id);
        $store.write(KEY_TRX, next);
        applyTransaksiFilter();
      });
  }
  if(act==="edit"){
    const t = data.find(x=>x.id===id);
    if(!t) return;
    // isi ke form untuk diedit cepat
    elForm.querySelector('[name="tanggal"]').value = t.tanggal;
    elForm.querySelector('[name="jenis"]').value = t.jenis;
    elForm.querySelector('[name="kategori"]').value = t.kategori;
    elForm.querySelector('[name="nominal"]').value = t.nominal;
    elForm.querySelector('[name="keterangan"]').value = t.keterangan||"";
    elForm.querySelector('[name="kontak"]').value = t.kontak||"";
    // hapus dulu yang lama, nanti disubmit jadi entri baru (sederhana)
    $store.write(KEY_TRX, data.filter(x=>x.id!==id));
    applyTransaksiFilter();
  }
});

// EVENT FILTER
btnFilter?.addEventListener("click", (e)=>{
  e.preventDefault();
  applyTransaksiFilter();
});

// (opsional) realtime saat ganti select / input
[fMonth, fKategori, fJenis].forEach(el=>{
  el?.addEventListener("change", applyTransaksiFilter);
  if (el === fKategori) {
    el.addEventListener("input", applyTransaksiFilter);
  }
});

// render awal
applyTransaksiFilter();


// === SCRIPT SIDEBAR ===
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