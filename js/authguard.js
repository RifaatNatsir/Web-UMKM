(function () {
  const authKey = 'auth_user';
  const user = JSON.parse(localStorage.getItem(authKey) || 'null');
  if (!user) {
    // kalau belum login, kirim balik ke halaman login
    location.href = 'index.html';
  }
})();