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
  const user = getUsers().find((u) => u.email === email && u.pass === pass);

  if (user) {
    await Swal.fire({
      title: "Berhasil Masuk",
      text: "Selamat datang kembali!",
      icon: "success",
      timer: 1200,
      showConfirmButton: false
    });

    localStorage.setItem(authKey, JSON.stringify({ name: user.name, email: user.email }));
    location.href = 'dashboard.html';
  } else {
    Swal.fire({
      icon: "error",
      title: "Login Gagal",
      text: "Email atau password salah."
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
      icon: "warning",
      title: "Data belum lengkap",
      text: "Isi semua kolom terlebih dahulu."
    });
  }

  if (pass !== pass2) {
    return Swal.fire({
      icon: "warning",
      title: "Password tidak cocok",
      text: "Konfirmasi password harus sama."
    });
  }

  const users = getUsers();
  if (users.some((u) => u.email === email)) {
    return Swal.fire({
      icon: "error",
      title: "Email sudah terdaftar",
      text: "Gunakan email lain."
    });
  }

  users.push({ name, email, pass });
  setUsers(users);

  await Swal.fire({
    icon: "success",
    title: "Registrasi Berhasil",
    text: "Silakan login menggunakan akun baru.",
    timer: 1500,
    showConfirmButton: false
  });

  tabLogin.click(); // pindah ke tab login
});