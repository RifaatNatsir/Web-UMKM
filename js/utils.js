// utils.js
window.$store = {
  read: k => JSON.parse(localStorage.getItem(k) || "null"),
  write: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  ensure: (k, fallback) => (window.$store.read(k) ?? (window.$store.write(k, fallback), fallback))
};

window.$fmt = {
  rupiah: n => "Rp" + (Number(n)||0).toLocaleString("id-ID"),
  ymd: d => new Date(d).toISOString().slice(0,10)
};

window.$id = id => document.getElementById(id);
window.$uuid = () => "id-" + Math.random().toString(36).slice(2) + Date.now();