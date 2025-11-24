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

  // guard (demo): block pages except index.html when not logged in
  const publicPages = ['index.html'];
  if(!publicPages.includes(path)){
    const user = localStorage.getItem('auth_user');
    if(!user){ location.href='index.html'; }
  }
})();
