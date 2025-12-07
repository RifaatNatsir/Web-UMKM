// === Tabs Masuk / Daftar ===
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');

tabLogin.onclick = () => {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  loginTab.classList.add('active');
  registerTab.classList.remove('active');
};

tabRegister.onclick = () => {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  registerTab.classList.add('active');
  loginTab.classList.remove('active');
};

// === Storage user & auth ===
const usersKey = 'umkm_users';
const authKey = 'auth_user';

const getUsers = () => JSON.parse(localStorage.getItem(usersKey) || '[]');
const setUsers = (users) => localStorage.setItem(usersKey, JSON.stringify(users));

// Seed akun demo pertama kali
if (!getUsers().length) {
  setUsers([{ name: 'Admin Demo', email: 'admin@demo.com', pass: '12345' }]);
}

// === LOGIN ===
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = lemail.value.trim().toLowerCase();
  const pass = lpass.value.trim();

  if (pass.length < 3) {
    Swal.fire({
        toast: true,             // WAJIB: Agar jadi notifikasi baris (bukan popup tengah)
        position: 'top',         // Posisi di atas tengah (bisa 'top-end' untuk kanan)
        icon: 'error',
        title: 'Password minimal 3 karakter!',
        showConfirmButton: false,
        timer: 2000,             // Hilang dalam 3 detik
        timerProgressBar: true,
        background: '#fff',      // Opsional: warna background
        color: '#000'            // Opsional: warna teks
    });
    return; // Stop proses login
  }
  
  const user = getUsers().find((u) => u.email === email && u.pass === pass);

  if (user) {
    await Swal.fire({
      toast: true,
      position: 'top',
      title: "Berhasil Masuk",
      icon: "success",
      timer: 2200,
      showConfirmButton: false,
      timerProgressBar: true,
      background: '#fff',
      color: '#000'
    });

    localStorage.setItem(authKey, JSON.stringify({ name: user.name, email: user.email }));
    location.href = 'dashboard.html';
  } else {
    Swal.fire({
      toast: true,
      icon: "error",
      position: 'top',
      title: "Login Gagal",
      text: "Email atau password salah.",
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: true,
      background: '#fff',
      color: '#000'
    });
  }
});

// === REGISTER ===
document.getElementById('regForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = rnama.value.trim();
  const email = remail.value.trim().toLowerCase();
  const pass = rpass.value.trim();
  const pass2 = rpass2.value.trim();

  if (!name || !email || !pass) {
    return Swal.fire({
      toast: true,
      icon: "warning",
      position: 'top',
      title: "Data belum lengkap",
      text: "Isi semua kolom terlebih dahulu.",
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: true,
      background: '#fff',
      color: '#000'
    });
  }

  if (pass !== pass2) {
    return Swal.fire({
      toast: true,
      icon: "warning",
      position: 'top',
      title: "Password tidak cocok",
      text: "Konfirmasi password harus sama.",
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: true,
      background: '#fff',
      color: '#000'
    });
  }

  if (pass.length < 3) {
    Swal.fire({
        toast: true,             // WAJIB: Agar jadi notifikasi baris (bukan popup tengah)
        position: 'top',         // Posisi di atas tengah (bisa 'top-end' untuk kanan)
        icon: 'error',
        title: 'Password minimal 3 karakter!',
        showConfirmButton: false,
        timer: 2000,             // Hilang dalam 3 detik
        timerProgressBar: true,
        background: '#fff',      // Opsional: warna background
        color: '#000'            // Opsional: warna teks
    });
    return; // Stop proses login
  }

  const users = getUsers();
  if (users.some((u) => u.email === email)) {
    return Swal.fire({
      toast: true,
      icon: "error",
      position: 'top',
      title: "Email sudah terdaftar",
      text: "Gunakan email lain.",
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: true,
      background: '#fff',
      color: '#000'
    });
  }

  users.push({ name, email, pass });
  setUsers(users);

  await Swal.fire({ 
    toast: true,
    position: 'top',
    icon: "success",
    title: "Registrasi Berhasil",
    text: "Silakan login menggunakan akun baru.",
    timer: 2000,
    showConfirmButton: false,
    timerProgressBar: true,
    background: '#fff',
    color: '#000'
  });

  tabLogin.click(); // pindah ke tab login
});