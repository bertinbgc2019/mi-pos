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
  // 1. Oculta TODOS los módulos
  document.querySelectorAll('[id^="modulo-"]').forEach(el => el.classList.add('hidden'));
  
  // 2. Quita el estado activo de TODOS los botones de navegación
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('ring-2', 'ring-blue-400', 'bg-blue-50');
  });

  // 3. Muestra el módulo seleccionado
  const modTarget = document.getElementById(`modulo-${modulo}`);
  if (modTarget) {
    modTarget.classList.remove('hidden');
  }

  // 4. Activa el botón de navegación correspondiente
  const btnActivo = document.getElementById(`btn-tab-${modulo}`);
  if (btnActivo) {
    btnActivo.classList.add('ring-2', 'ring-blue-400', 'bg-blue-50');
  }

  // 5. Enfoque automático en campos de texto según el módulo activo
  if (modulo === 'ventas') {
    const barcodeInput = document.getElementById('barcode-input');
    if (barcodeInput) {
      setTimeout(() => {
        barcodeInput.focus();
        // También renderizamos el grid de productos al entrar a ventas
        renderizarGridProductos();
      }, 100);
    }
  } else if (modulo === 'productos') {
    const prodCodigo = document.getElementById('prod-codigo');
    if (prodCodigo) {
      setTimeout(() => prodCodigo.focus(), 100);
    }
  }
}
