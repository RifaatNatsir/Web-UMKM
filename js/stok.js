const KEY_STOK = "stok";
const elFormS = $id("formStok");
const elBodyS = $id("tbodyStok");

function renderStok(){
  const data = $store.ensure(KEY_STOK, []);
  elBodyS.innerHTML = data.map(p=>{
    const menipis = p.jumlah <= p.batas;
    return `<tr>
      <td>${p.nama}</td>
      <td>${$fmt.rupiah(p.harga)}</td>
      <td>${p.jumlah}</td>
      <td>${p.batas}</td>
      <td>${menipis?'<span class="badge bg-danger">Menipis</span>':'<span class="badge bg-success">Aman</span>'}</td>
      <td>
        <button class="btn btn-sm btn-warning" data-act="edit" data-id="${p.id}">Edit</button>
        <button class="btn btn-sm btn-danger" data-act="del" data-id="${p.id}">Hapus</button>
      </td>
    </tr>`;
  }).join("");
}

elFormS?.addEventListener("submit",(e)=>{
  e.preventDefault();
  const fd = new FormData(elFormS);
  const item = {
    id: $uuid(),
    nama: (fd.get("nama")||"").trim(),
    harga: Number(fd.get("harga")||0),
    jumlah: Number(fd.get("jumlah")||0),
    batas: Number(fd.get("batas")||0)
  };
  if(!item.nama){ return Swal.fire("Validasi","Nama produk wajib.","warning"); }
  const data = $store.ensure(KEY_STOK, []);
  data.push(item);
  $store.write(KEY_STOK, data);
  elFormS.reset();
  renderStok();
});

elBodyS?.addEventListener("click",(e)=>{
  const btn = e.target.closest("button"); if(!btn) return;
  const { id, act } = btn.dataset;
  const data = $store.ensure(KEY_STOK, []);
  if(act==="del"){
    Swal.fire({title:"Hapus produk?", icon:"warning", showCancelButton:true})
      .then(r=>{ if(r.isConfirmed){ $store.write(KEY_STOK, data.filter(x=>x.id!==id)); renderStok(); }});
  }
  if(act==="edit"){
    const p = data.find(x=>x.id===id); if(!p) return;
    elFormS.querySelector('[name="nama"]').value = p.nama;
    elFormS.querySelector('[name="harga"]').value = p.harga;
    elFormS.querySelector('[name="jumlah"]').value = p.jumlah;
    elFormS.querySelector('[name="batas"]').value = p.batas;
    $store.write(KEY_STOK, data.filter(x=>x.id!==id));
    renderStok();
  }
});

renderStok();


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