// js/escaner.js - Lectura por Cámara y Lector USB

let html5QrcodeScanner = null;

function toggleCamara() {
  const container = document.getElementById('reader-container');
  if (!container) return;

  if (container.classList.contains('hidden')) {
    container.classList.remove('hidden');
    iniciarEscanerCamara();
  } else {
    detenerEscanerCamara();
    container.classList.add('hidden');
  }
}

function iniciarEscanerCamara() {
  if (typeof Html5QrcodeScanner === 'undefined') {
    alert('La librería del escáner no está cargada aún.');
    return;
  }

  if (!html5QrcodeScanner) {
    html5QrcodeScanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 150 } },
      /* verbose= */ false
    );

    html5QrcodeScanner.render((decodedText) => {
      // Al detectar un código, insertarlo en el input activo
      const activeInput = document.getElementById('barcode-input') || document.getElementById('prod-codigo');
      if (activeInput) {
        activeInput.value = decodedText;
        // Si estamos en la pantalla de ventas, procesar la búsqueda
        if (typeof buscarProductoPorCodigo === 'function' && activeInput.id === 'barcode-input') {
          buscarProductoPorCodigo(decodedText);
        }
      }
      detenerEscanerCamara();
      document.getElementById('reader-container').classList.add('hidden');
    }, (errorMessage) => {
      // Ignorar errores continuos de búsqueda de código en cuadro
    });
  }
}

function detenerEscanerCamara() {
  if (html5QrcodeScanner) {
    html5QrcodeScanner.clear().catch(error => console.error("Error al detener cámara", error));
    html5QrcodeScanner = null;
  }
}
