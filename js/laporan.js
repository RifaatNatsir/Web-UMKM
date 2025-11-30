const TRX = $store.ensure("transaksi", []);
const UP  = $store.ensure("utangpiutang", []);

const elMonth = document.querySelector('input[type="month"]');
const elSumIn   = $id("sumIn");
const elSumOut  = $id("sumOut");
const elSaldo   = $id("sumSaldo");
const elSumUP   = $id("sumUP");
const elTopKat  = $id("topKategori");
const elRek     = $id("panelRekomendasi");
const elCanvas  = $id("chartLaporan");
const elExport  = $id("btnExportJSON");

function pickMonth(m){ // "2025-01"
  if(!m) return TRX;
  const [yy,mm] = m.split("-").map(Number);
  return TRX.filter(t=>{
    const d = new Date(t.tanggal);
    return d.getFullYear()===yy && (d.getMonth()+1)===mm;
  });
}

let chart;

function render(){
  const monthVal = elMonth?.value;
  const data = pickMonth(monthVal);

  const pemasukan = data.filter(t=>t.jenis==="pemasukan").reduce((a,b)=>a+b.nominal,0);
  const pengeluaran = data.filter(t=>t.jenis==="pengeluaran").reduce((a,b)=>a+b.nominal,0);
  const saldo = pemasukan - pengeluaran;

  elSumIn && (elSumIn.textContent = $fmt.rupiah(pemasukan));
  elSumOut && (elSumOut.textContent = $fmt.rupiah(pengeluaran));
  elSaldo && (elSaldo.textContent = $fmt.rupiah(saldo));
  elSumUP && (elSumUP.textContent = (UP.filter(u=>u.status!=="Lunas").length || 0) + " aktif");

  // Top kategori
  const byKat = {};
  data.forEach(t=>{ byKat[t.kategori] = (byKat[t.kategori]||0) + t.nominal*(t.jenis==="pengeluaran"?-1:1); });
  const top = Object.entries(byKat).sort((a,b)=>b[1]-a[1]).slice(0,5);
  if(elTopKat){
    elTopKat.innerHTML = top.map(([kat,val])=>`<li>${kat||"-"} (${ $fmt.rupiah(val) })</li>`).join("") || "<li>-</li>";
  }

  // Rekomendasi sederhana
  if(elRek){
    elRek.innerHTML = "";
    if(pengeluaran>pemasukan) elRek.innerHTML += `<li class="text-danger">Pengeluaran > pemasukan. Pertimbangkan efisiensi biaya.</li>`;
    const bigOut = data.filter(t=>t.jenis==="pengeluaran").sort((a,b)=>b.nominal-a.nominal)[0];
    if(bigOut) elRek.innerHTML += `<li>Biaya terbesar kategori <b>${bigOut.kategori}</b> (${ $fmt.rupiah(bigOut.nominal) }). Cek peluang optimasi.</li>`;
    if(!elRek.innerHTML) elRek.innerHTML = "<li>Arus kas sehat. Pertahankan!</li>";
  }

  // Grafik
  if(elCanvas && typeof Chart!=="undefined"){
    const ctx = elCanvas.getContext("2d");
    const labels = ["Pemasukan","Pengeluaran","Saldo"];
    const values = [pemasukan, pengeluaran, saldo];
    if(chart){ chart.destroy(); }
    chart = new Chart(ctx, {
      type: "bar",
      data: { labels, datasets: [{ label:"Ringkasan", data: values }] },
      options: { responsive:true, maintainAspectRatio:false }
    });
  }
}

elMonth?.addEventListener("change", render);
elExport?.addEventListener("click", ()=>{
  const payload = { bulan: elMonth?.value || "all", data: pickMonth(elMonth?.value) };
  const blob = new Blob([JSON.stringify(payload,null,2)], {type:"application/json;charset=utf-8"});
  saveAs(blob, `laporan-${(elMonth?.value||'semua')}.json`);
});

render();


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