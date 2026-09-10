// Variable global para manejar la instancia de la cámara
let html5QrCode = null;
let imagenProductoBase64 = "";

// ==========================================
// 1. CAMBIO DINÁMICO DE COLOR DEL MENÚ LATERAL
// ==========================================
function cambiarSubTabProducto(subtab) {
  const botones = document.querySelectorAll('#contenedor-subtabs-producto .subtab-btn');
  
  botones.forEach(btn => {
    btn.classList.remove('bg-blue-600', 'text-white', 'shadow');
    btn.classList.add('hover:bg-slate-700', 'text-gray-200');
  });

  const btnSeleccionado = document.getElementById(`subtab-${subtab}`);
  if (btnSeleccionado) {
    btnSeleccionado.classList.remove('hover:bg-slate-700', 'text-gray-200');
    btnSeleccionado.classList.add('bg-blue-600', 'text-white', 'shadow');
  }
}

// ==========================================
// 2. VERIFICACIÓN DE CÓDIGO EXISTENTE EN BD
// ==========================================
function verificarCodigoExistente(codigo) {
  const valor = codigo.trim();
  const alerta = document.getElementById('alerta-codigo-existente');
  
  if (!valor) {
    if (alerta) alerta.classList.add('hidden');
    return false;
  }

  const productos = JSON.parse(localStorage.getItem('gnet_productos')) || [];
  const existe = productos.some(p => p.codigo.toLowerCase() === valor.toLowerCase());

  if (existe) {
    if (alerta) alerta.classList.remove('hidden');
    return true;
  } else {
    if (alerta) alerta.classList.add('hidden');
    return false;
  }
}

// ==========================================
// 3. LECTURA DE CÓDIGO MEDIANTE CÁMARA
// ==========================================
function abrirCamaraEscaner() {
  const modal = document.getElementById('modal-escaner-camara');
  if (modal) modal.classList.remove('hidden');

  html5QrCode = new Html5Qrcode("reader");

  const config = { 
    fps: 10, 
    qrbox: { width: 250, height: 150 },
    aspectRatio: 1.0 
  };

  html5QrCode.start(
    { facingMode: "environment" }, 
    config,
    (decodedText) => {
      // Éxito al escanear
      const inputCodigo = document.getElementById('prod-codigo');
      if (inputCodigo) {
        inputCodigo.value = decodedText;
        verificarCodigoExistente(decodedText);
      }
      cerrarCamaraEscaner();
    },
    (errorMessage) => {
      // Ignorar errores frame a frame
    }
  ).catch(err => {
    alert("No se pudo acceder a la cámara. Asegúrate de dar los permisos necesarios.");
    cerrarCamaraEscaner();
  });
}

function cerrarCamaraEscaner() {
  const modal = document.getElementById('modal-escaner-camara');
  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      html5QrCode.clear();
      if (modal) modal.classList.add('hidden');
    }).catch(err => {
      if (modal) modal.classList.add('hidden');
    });
  } else {
    if (modal) modal.classList.add('hidden');
  }
}

// ==========================================
// 4. CARGA Y VISTA PREVIA DE IMAGEN
// ==========================================
function procesarImagenProducto(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    imagenProductoBase64 = e.target.result;

    const imgPreview = document.getElementById('img-preview');
    const placeholder = document.getElementById('contenedor-placeholder-img');
    const previewContainer = document.getElementById('contenedor-preview-img');

    if (imgPreview) imgPreview.src = imagenProductoBase64;
    if (placeholder) placeholder.classList.add('hidden');
    if (previewContainer) previewContainer.classList.remove('hidden');
  };

  reader.readAsDataURL(file);
}

function quitarImagenProducto() {
  imagenProductoBase64 = "";
  const input = document.getElementById('input-prod-imagen');
  const placeholder = document.getElementById('contenedor-placeholder-img');
  const previewContainer = document.getElementById('contenedor-preview-img');

  if (input) input.value = "";
  if (placeholder) placeholder.classList.remove('hidden');
  if (previewContainer) previewContainer.classList.add('hidden');
}

// ==========================================
// 5. MÉTODOS DEL FORMULARIO Y PRECIOS
// ==========================================
function calcularPrecios() {
  const costo = parseFloat(document.getElementById('prod-costo').value) || 0;
  const ganancia = parseFloat(document.getElementById('prod-ganancia').value) || 0;

  if (costo > 0) {
    const precioVenta = costo + (costo * (ganancia / 100));
    document.getElementById('prod-precio').value = precioVenta.toFixed(2);
  }
}

function guardarProducto(e) {
  e.preventDefault();

  const codigo = document.getElementById('prod-codigo').value.trim();
  const nombre = document.getElementById('prod-nombre').value.trim();

  if (verificarCodigoExistente(codigo)) {
    if (!confirm("Este código ya existe. ¿Deseas actualizar el registro existente?")) {
      return;
    }
  }

  let productos = JSON.parse(localStorage.getItem('gnet_productos')) || [];
  
  // Buscar si existe para actualizar o agregar
  const index = productos.findIndex(p => p.codigo.toLowerCase() === codigo.toLowerCase());

  const nuevoProducto = {
    id: index !== -1 ? productos[index].id : Date.now(),
    codigo: codigo,
    nombre: nombre,
    tipo_venta: document.querySelector('input[name="tipo_venta"]:checked').value,
    costo: parseFloat(document.getElementById('prod-costo').value) || 0,
    ganancia: parseFloat(document.getElementById('prod-ganancia').value) || 0,
    precio: parseFloat(document.getElementById('prod-precio').value) || 0,
    mayoreo: parseFloat(document.getElementById('prod-mayoreo').value) || 0,
    departamento: document.getElementById('prod-depto').value,
    usa_inventario: document.getElementById('prod-usa-inv').checked,
    stock: parseInt(document.getElementById('prod-stock').value) || 0,
    min: parseInt(document.getElementById('prod-min').value) || 0,
    max: parseInt(document.getElementById('prod-max').value) || 0,
    imagen: imagenProductoBase64
  };

  if (index !== -1) {
    productos[index] = nuevoProducto;
  } else {
    productos.push(nuevoProducto);
  }

  localStorage.setItem('gnet_productos', JSON.stringify(productos));
  alert("¡Producto guardado exitosamente!");
  limpiarFormularioProducto();
}

function limpiarFormularioProducto() {
  document.getElementById('form-producto').reset();
  const alerta = document.getElementById('alerta-codigo-existente');
  if (alerta) alerta.classList.add('hidden');
  quitarImagenProducto();
}
