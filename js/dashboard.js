// dashboard.js

// Ambil data dari LocalStorage
const transaksi = JSON.parse(localStorage.getItem("transaksi")) || [];
const stok = JSON.parse(localStorage.getItem("stok")) || [];

// --------------------------------------------
// Hitung pemasukan, pengeluaran, saldo
// --------------------------------------------
let totalPemasukan = 0;
let totalPengeluaran = 0;

transaksi.forEach(t => {
    if (t.jenis === "pemasukan") {
        totalPemasukan += t.nominal;
    } else if (t.jenis === "pengeluaran") {
        totalPengeluaran += t.nominal;
    }
});

let saldoAkhir = totalPemasukan - totalPengeluaran;

// Tampilkan ke UI
document.getElementById("sumIn").innerText = "Rp" + totalPemasukan.toLocaleString();
document.getElementById("sumOut").innerText = "Rp" + totalPengeluaran.toLocaleString();
document.getElementById("sumSaldo").innerText = "Rp" + saldoAkhir.toLocaleString();

// --------------------------------------------
// STOK MENIPIS
// --------------------------------------------
const listLowStock = document.getElementById("listLowStock");
listLowStock.innerHTML = "";

stok.forEach(item => {
    if (item.jumlah <= item.batas) {
        listLowStock.innerHTML += `
        <li class="list-group-item d-flex justify-content-between">
            ${item.nama}
            <span class="badge bg-danger">${item.jumlah} / batas ${item.batas}</span>
        </li>`;
    }
});

// --------------------------------------------
// GRAFIK Pemasukan vs Pengeluaran
// --------------------------------------------
const ctx = document.getElementById("chartDaily").getContext("2d");

new Chart(ctx, {
    type: "bar",
    data: {
        labels: ["Pemasukan", "Pengeluaran"],
        datasets: [{
            label: "Total",
            data: [totalPemasukan, totalPengeluaran],
            backgroundColor: ["#4CAF50", "#F44336"]
        }]
    }
});