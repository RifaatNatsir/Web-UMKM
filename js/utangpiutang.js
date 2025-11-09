// utangpiutang.js
const KEY_UP = "utangpiutang";
const elFormUP = $id("formUP");
const elBodyUP = $id("tbodyUP");

let filterState = { status:"Semua", jenis:"Utang", tempoMax:null };

function getUP(){
  let data = $store.ensure(KEY_UP, []);
  // filter UI (jika kamu tambahkan id pada input filter, sambungkan ke sini)
  if(filterState.status!=="Semua") data = data.filter(x=>x.status===filterState.status);
  if(filterState.jenis) data = data.filter(x=>x.jenis.toLowerCase()===filterState.jenis.toLowerCase());
  if(filterState.tempoMax) data = data.filter(x=> new Date(x.jatuhTempo) <= new Date(filterState.tempoMax));
  return data;
}

function renderUP(){
  const data = getUP();
  elBodyUP.innerHTML = data.map(u=>`
    <tr>
      <td>${u.nama}</td>
      <td>${u.jenis}</td>
      <td>${$fmt.rupiah(u.nominal)}</td>
      <td>${u.tanggal}</td>
      <td>${u.jatuhTempo}</td>
      <td>${u.status}</td>
      <td>${u.bukti?'<a href="'+u.bukti+'" target="_blank">Lihat</a>':'-'}</td>
      <td>
        ${u.status!=="Lunas"?`<button class="btn btn-sm btn-success" data-act="lunas" data-id="${u.id}">Tandai Lunas</button>`:""}
        <button class="btn btn-sm btn-danger" data-act="del" data-id="${u.id}">Hapus</button>
      </td>
    </tr>
  `).join("");
}

elFormUP?.addEventListener("submit",(e)=>{
  e.preventDefault();
  const fd = new FormData(elFormUP);
  const item = {
    id: $uuid(),
    nama: (fd.get("nama")||"").trim(),
    jenis: (fd.get("jenis")||"utang").toLowerCase(),
    nominal: Number(fd.get("nominal")||0),
    tanggal: fd.get("tanggal") || $fmt.ymd(new Date()),
    jatuhTempo: fd.get("jatuhTempo") || $fmt.ymd(new Date()),
    status: fd.get("status") || "Belum Lunas",
    catatan: (fd.get("catatan")||"").trim(),
    // untuk demo: abaikan upload, tapi bisa simpan nama file
    bukti: null
  };
  const data = $store.ensure(KEY_UP, []);
  data.push(item);
  $store.write(KEY_UP, data);
  elFormUP.reset();
  renderUP();
});

elBodyUP?.addEventListener("click",(e)=>{
  const btn = e.target.closest("button"); if(!btn) return;
  const { id, act } = btn.dataset;
  const data = $store.ensure(KEY_UP, []);
  if(act==="lunas"){
    $store.write(KEY_UP, data.map(x=> x.id===id? {...x, status:"Lunas"} : x));
    renderUP();
  }
  if(act==="del"){
    Swal.fire({title:"Hapus catatan?", icon:"warning", showCancelButton:true})
      .then(r=>{ if(r.isConfirmed){ $store.write(KEY_UP, data.filter(x=>x.id!==id)); renderUP(); }});
  }
});

renderUP();