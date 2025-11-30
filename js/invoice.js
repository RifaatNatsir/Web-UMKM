// invoice.js
// Fitur Invoice / Kwitansi Digital

const KEY_TRX = "transaksi";
const KEY_INV = "invoice";

const selMode   = document.getElementById("selMode");
const wrapTrx   = document.getElementById("wrapTrx");
const selTrx    = document.getElementById("selTransaksi");

const fNama     = document.getElementById("invNama");
const fTanggal  = document.getElementById("invTanggal");
const fDesk     = document.getElementById("invDesk");
const fJumlah   = document.getElementById("invJumlah");
const fCatatan  = document.getElementById("invCatatan");

const boxPrev   = document.getElementById("invoicePreview");

const btnSave   = document.getElementById("btnSaveInv");
const btnSend   = document.getElementById("btnSendInv");
const btnShare  = document.getElementById("btnShareInv");

let trxList = $store.ensure(KEY_TRX, []);
let invList = $store.ensure(KEY_INV, []);

// optional: integrasi history jika ada
function logHistory(action, detail) {
  try {
    if (typeof addHistory === "function") {
      addHistory(action, detail);
    }
  } catch (e) {}
}

// Generate nomor invoice sederhana
function genNoInvoice() {
  const today = $fmt.ymd(new Date()).replace(/-/g, "");
  const seq = (invList.length + 1).toString().padStart(3, "0");
  return `INV-${today}-${seq}`;
}

// Refresh daftar transaksi di dropdown
function refreshTransaksiOptions() {
  if (!selTrx) return;
  trxList = $store.ensure(KEY_TRX, []);

  selTrx.innerHTML = `<option value="">-- Pilih Transaksi --</option>` +
    trxList.map(t => `
      <option value="${t.id}">
        ${t.tanggal} - ${t.kategori || "-"} (${ $fmt.rupiah(t.nominal) })
      </option>
    `).join("");
}

// Ambil nilai dari form sebagai satu objek
function readForm() {
  return {
    mode: selMode?.value || "manual",
    trxId: selTrx?.value || null,
    nama: (fNama?.value || "").trim(),
    tanggal: fTanggal?.value || "",
    deskripsi: (fDesk?.value || "").trim(),
    jumlah: Number(fJumlah?.value || 0),
    catatan: (fCatatan?.value || "").trim()
  };
}

// Update tampilan preview invoice
function updatePreview() {
  if (!boxPrev) return;
  const data = readForm();
  const noInv = genNoInvoice();

  boxPrev.innerHTML = `
    <h4 class="mb-1">Nama Bisnis / Logo</h4>
    <small class="text-secondary">#${noInv}</small>
    <hr>
    <p>
      <b>Pelanggan:</b> ${data.nama || "-"}<br>
      <b>Tanggal:</b> ${data.tanggal || "-"}
    </p>
    <p>
      <b>Deskripsi:</b><br>
      ${data.deskripsi || "-"}
    </p>
    <h5 class="text-end">Total: ${$fmt.rupiah(data.jumlah || 0)}</h5>
    ${data.catatan ? `<p class="mt-2"><b>Catatan:</b> ${data.catatan}</p>` : ""}
  `;
}

// Isi form dari transaksi yang dipilih (mode = dari transaksi)
function applyFromTransaksi() {
  const id = selTrx?.value;
  if (!id) return;
  const t = trxList.find(x => x.id === id);
  if (!t) return;

  if (fNama)    fNama.value    = t.kontak || "";
  if (fTanggal) fTanggal.value = t.tanggal || "";
  if (fDesk)    fDesk.value    = `${t.kategori || ""} - ${t.keterangan || ""}`.trim();
  if (fJumlah)  fJumlah.value  = t.nominal || 0;
  if (fCatatan) fCatatan.value = "";

  updatePreview();
}

// Validasi sederhana sebelum simpan
function validate(data) {
  if (!data.nama || !data.tanggal || data.jumlah <= 0) {
    Swal.fire(
      "Data belum lengkap",
      "Minimal isi Nama, Tanggal, dan Jumlah.",
      "warning"
    );
    return false;
  }
  return true;
}

// Simpan Invoice ke localStorage
function saveInvoice() {
  const data = readForm();
  if (!validate(data)) return;

  const noInv = genNoInvoice();
  const inv = {
    id: $uuid(),
    no: noInv,
    mode: data.mode,
    trxId: data.trxId,
    nama: data.nama,
    tanggal: data.tanggal,
    deskripsi: data.deskripsi,
    jumlah: data.jumlah,
    catatan: data.catatan,
    createdAt: new Date().toISOString()
  };

  invList = $store.ensure(KEY_INV, []);
  invList.push(inv);
  $store.write(KEY_INV, invList);

  logHistory("Buat Invoice", `${inv.no} - ${inv.nama}`);

  Swal.fire(
    "Invoice Disimpan",
    `Invoice ${inv.no} berhasil disimpan.`,
    "success"
  );

  updatePreview();
}

// Export invoice sebagai file HTML sederhana
function exportInvoiceAsHTML() {
  const data = readForm();
  if (!validate(data)) return;

  const noInv = genNoInvoice();
  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${noInv}</title>
</head>
<body>
  ${boxPrev.innerHTML}
</body>
</html>
  `.trim();

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  saveAs(blob, `${noInv}.html`);

  Swal.fire(
    "Invoice Diekspor",
    "File HTML invoice telah diunduh.",
    "success"
  );
}

// ===== Event binding =====

// Mode: trx vs manual
selMode?.addEventListener("change", () => {
  const mode = selMode.value;
  if (mode === "trx") {
    if (wrapTrx) wrapTrx.style.display = "";
    refreshTransaksiOptions();
  } else {
    if (wrapTrx) wrapTrx.style.display = "none";
  }
  updatePreview();
});

// Pilih transaksi
selTrx?.addEventListener("change", () => {
  applyFromTransaksi();
});

// Form input → update preview
[fNama, fTanggal, fDesk, fJumlah, fCatatan].forEach(el => {
  el?.addEventListener("input", updatePreview);
});

// Tombol simpan
btnSave?.addEventListener("click", (e) => {
  e.preventDefault();
  saveInvoice();
});

// Tombol kirim (sementara hanya info)
btnSend?.addEventListener("click", (e) => {
  e.preventDefault();
  Swal.fire(
    "Belum Diintegrasikan",
    "Fitur kirim (misalnya via WhatsApp / Email) belum diimplementasikan.",
    "info"
  );
});

// Tombol bagikan → export file HTML
btnShare?.addEventListener("click", (e) => {
  e.preventDefault();
  exportInvoiceAsHTML();
});

// Inisialisasi awal
(function init() {
  // default mode: trx
  if (selMode && selMode.value === "trx") {
    if (wrapTrx) wrapTrx.style.display = "";
    refreshTransaksiOptions();
  }
  updatePreview();
})();



// Sidebar menu handling
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