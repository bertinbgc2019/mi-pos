// js/router.js - Control de Navegación y Reloj

document.addEventListener('DOMContentLoaded', () => {
  iniciarReloj();
  cambiarModulo('ventas');
});

function iniciarReloj() {
  const clockEl = document.getElementById('live-clock');
  setInterval(() => {
    const now = new Date();
    if (clockEl) {
      clockEl.innerText = now.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
    }
  }, 1000);
}

function cambiarModulo(modulo) {
  // Oculta todos los módulos
  document.querySelectorAll('[id^="modulo-"]').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.btn-toolbar').forEach(el => el.classList.remove('active'));

  // Muestra el módulo seleccionado
  const modTarget = document.getElementById(`modulo-${modulo}`);
  const navTarget = document.getElementById(`nav-${modulo}`);

  if (modTarget) modTarget.classList.remove('hidden');
  if (navTarget) navTarget.classList.add('active');

  // Enfoque automático en campos de texto según el módulo activo
  if (modulo === 'ventas' && document.getElementById('barcode-input')) {
    setTimeout(() => document.getElementById('barcode-input').focus(), 100);
  } else if (modulo === 'productos' && document.getElementById('prod-codigo')) {
    setTimeout(() => document.getElementById('prod-codigo').focus(), 100);
  }
}
