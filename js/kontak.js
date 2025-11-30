// Manajemen Kontak Pelanggan / Supplier
const KEY_KONTAK = "kontak";

const elFormKontak = $id("formKontak");
const elBodyKontak = $id("tbodyKontak");

function logHistory(action, detail) {
  try {
    if (typeof addHistory === "function") {
      addHistory(action, detail);
    }
  } catch (e) {
    
  }
}

// Render tabel kontak
function renderKontak() {
  const data = $store.ensure(KEY_KONTAK, []);

  if (!elBodyKontak) return;

  if (!data.length) {
    elBodyKontak.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted">
          Belum ada kontak. Tambahkan dari form di atas.
        </td>
      </tr>
    `;
    return;
  }

  // Bisa disortir abjad nama
  const sorted = [...data].sort((a, b) =>
    (a.nama || "").localeCompare(b.nama || "", "id")
  );

  elBodyKontak.innerHTML = sorted
    .map(
      (k) => `
    <tr>
      <td>${k.nama || "-"}</td>
      <td>${k.tipe || "-"}</td>
      <td>${k.telepon || "-"}</td>
      <td>${k.email || "-"}</td>
      <td>${k.alamat || "-"}</td>
      <td>
        <button class="btn btn-sm btn-warning me-1" data-act="edit" data-id="${
          k.id
        }">Edit</button>
        <button class="btn btn-sm btn-danger" data-act="del" data-id="${
          k.id
        }">Hapus</button>
      </td>
    </tr>
  `
    )
    .join("");
}

// Submit form: tambah kontak baru
elFormKontak?.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(elFormKontak);

  const item = {
    id: $uuid(),
    nama: (fd.get("nama") || "").trim(),
    tipe: (fd.get("tipe") || "").trim(), // Pelanggan / Supplier
    telepon: (fd.get("telepon") || "").trim(),
    email: (fd.get("email") || "").trim(),
    alamat: (fd.get("alamat") || "").trim(),
  };

  if (!item.nama || !item.tipe) {
    return Swal.fire(
      "Data belum lengkap",
      "Minimal isi Nama dan Tipe kontak.",
      "warning"
    );
  }

  const data = $store.ensure(KEY_KONTAK, []);
  data.push(item);
  $store.write(KEY_KONTAK, data);

  logHistory("Tambah Kontak", `${item.nama} (${item.tipe})`);

  Swal.fire("Tersimpan", "Kontak berhasil ditambahkan.", "success");
  elFormKontak.reset();
  renderKontak();
});

// Event delegation untuk tombol Edit / Hapus
elBodyKontak?.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const id = btn.dataset.id;
  const act = btn.dataset.act;
  const data = $store.ensure(KEY_KONTAK, []);

  if (act === "del") {
    const target = data.find((k) => k.id === id);
    if (!target) return;

    Swal.fire({
      title: "Hapus kontak?",
      text: target.nama || "",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    }).then((res) => {
      if (!res.isConfirmed) return;
      const next = data.filter((k) => k.id !== id);
      $store.write(KEY_KONTAK, next);
      logHistory("Hapus Kontak", target.nama || id);
      Swal.fire("Terhapus", "Kontak telah dihapus.", "success");
      renderKontak();
    });
  }

  if (act === "edit") {
    const k = data.find((x) => x.id === id);
    if (!k) return;

    // Isi form dengan data kontak untuk diedit
    elFormKontak.querySelector('[name="nama"]').value = k.nama || "";
    elFormKontak.querySelector('[name="tipe"]').value = k.tipe || "Pelanggan";
    elFormKontak.querySelector('[name="telepon"]').value = k.telepon || "";
    elFormKontak.querySelector('[name="email"]').value = k.email || "";
    elFormKontak.querySelector('[name="alamat"]').value = k.alamat || "";

    // Hapus dulu dari storage, nanti disubmit akan dianggap update (entry baru)
    const next = data.filter((x) => x.id !== id);
    $store.write(KEY_KONTAK, next);

    Swal.fire(
      "Edit Kontak",
      "Silakan perbarui data pada form, lalu klik Simpan.",
      "info"
    );

    renderKontak();
  }
});

// Render awal saat halaman dimuat
renderKontak();

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