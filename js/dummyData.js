// dummyData.js
// --------------------------------------------
// Fungsi untuk menyimpan data ke LocalStorage
// --------------------------------------------
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// --------------------------------------------
// Fungsi untuk mengambil data dari LocalStorage
// --------------------------------------------
function loadData(key) {
    return JSON.parse(localStorage.getItem(key)) || null;
}

// --------------------------------------------
// Dummy Data (akan masuk hanya jika belum ada data)
// --------------------------------------------
function initDummyData() {

    // Dummy Transaksi
    const transaksiDummy = [
        {
            id: "T001",
            tanggal: "2025-01-01",
            jenis: "pemasukan",
            kategori: "Penjualan",
            nominal: 150000,
            keterangan: "Penjualan Kopi Latte",
            kontak: "Andi"
        },
        {
            id: "T002",
            tanggal: "2025-01-01",
            jenis: "pengeluaran",
            kategori: "Pembelian Stok",
            nominal: 80000,
            keterangan: "Beli Gula 5 kg",
            kontak: "Supplier A"
        },
        {
            id: "T003",
            tanggal: "2025-01-02",
            jenis: "pemasukan",
            kategori: "Penjualan",
            nominal: 200000,
            keterangan: "Penjualan Kopi Hitam",
            kontak: "Budi"
        },
        {
            id: "T004",
            tanggal: "2025-01-03",
            jenis: "pengeluaran",
            kategori: "Operasional",
            nominal: 50000,
            keterangan: "Biaya Listrik"
        }
    ];

    // Dummy Stok
    const stokDummy = [
        {
            id: "S001",
            nama: "Kopi Arabika 1kg",
            harga: 120000,
            jumlah: 4,
            batas: 5
        },
        {
            id: "S002",
            nama: "Gelas Cup 12oz",
            harga: 15000,
            jumlah: 30,
            batas: 20
        },
        {
            id: "S003",
            nama: "Gula 1kg",
            harga: 13000,
            jumlah: 2,
            batas: 3
        },
        {
            id: "S004",
            nama: "Susu Bubuk 500g",
            harga: 28000,
            jumlah: 1,
            batas: 2
        }
    ];

    // Dummy Kontak
    const kontakDummy = [
        {
            id: "K001",
            nama: "Andi",
            tipe: "Pelanggan",
            telepon: "081234567890",
            email: "andi@example.com",
            alamat: "Jl. Cendrawasih No. 12"
        },
        {
            id: "K002",
            nama: "Supplier A",
            tipe: "Supplier",
            telepon: "082112223333",
            email: "supplierA@gmail.com",
            alamat: "Jl. Rajawali No. 7"
        }
    ];

    // Dummy Utang Piutang
    const utangPiutangDummy = [
        {
            id: "UP001",
            nama: "Andi",
            jenis: "piutang",
            nominal: 50000,
            tanggal: "2025-01-02",
            jatuhTempo: "2025-01-15",
            status: "Belum Lunas",
            catatan: "Piutang penjualan kopi",
            bukti: null
        },
        {
            id: "UP002",
            nama: "Supplier A",
            jenis: "utang",
            nominal: 80000,
            tanggal: "2025-01-01",
            jatuhTempo: "2025-01-10",
            status: "Belum Lunas",
            catatan: "Pembelian bahan baku",
            bukti: null
        }
    ];

    // --------------------------------------------
    // Simpan ke LocalStorage jika belum ada data
    // --------------------------------------------
    if (!loadData("transaksi")) saveData("transaksi", transaksiDummy);
    if (!loadData("stok")) saveData("stok", stokDummy);
    if (!loadData("kontak")) saveData("kontak", kontakDummy);
    if (!loadData("utangpiutang")) saveData("utangpiutang", utangPiutangDummy);

    console.log("Dummy data berhasil dimuat.");
}

// Jalankan dummy data saat file ini dipanggil
initDummyData();