(function(){
  const toggleBtn = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');
  toggleBtn && toggleBtn.addEventListener('click', ()=> sidebar.classList.toggle('open'));

  // set active menu by filename
  const path = location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.menu a').forEach(a=>{
    if(a.getAttribute('href') === path) a.classList.add('active');
  });

  // simple logout (demo)
  const btnLogout = document.getElementById('btnLogout');
  btnLogout && btnLogout.addEventListener('click', ()=>{
    localStorage.removeItem('auth_user');
    location.href = 'index.html';
  });

  // Konfigurasi Toast SweetAlert2
  const Toast = Swal.mixin({
      toast: true,
      position: 'top',       // Posisi di ATAS TENGAH (bisa ubah ke 'top-end' untuk pojok kanan)
      showConfirmButton: false,
      timer: 3000,           // Hilang otomatis setelah 3 detik
      timerProgressBar: true,
      didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
      }
  });

  // Fungsi pemanggil yang simpel untuk dipakai di mana saja
  function showNotif(icon, title) {
      Toast.fire({
          icon: icon,   // 'success', 'error', 'warning', 'info'
          title: title
      });
  }

  // guard (demo): block pages except index.html when not logged in
  const publicPages = ['index.html'];
  if(!publicPages.includes(path)){
    const user = localStorage.getItem('auth_user');
    if(!user){ location.href='index.html'; }
  }
})();
