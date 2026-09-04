// ==========================================
// ESTADO Y VARIABLES GLOBALES
// ==========================================
let productos = JSON.parse(localStorage.getItem('pos_productos')) || [
  {
    codigo: "7622210529688",
    nombre: "Galletas Oreos 114g",
    costo: 12.00,
    precio: 16.50,
    mayoreo: 15.00,
    depto: "Abarrotes",
    stock: 25,
    min: 5,
    max: 50,
    usaInv: true,
    foto: ""
  }
];

let ventas = JSON.parse(localStorage.getItem('pos_ventas')) || [];
let carrito = [];
let productoSeleccionadoIndex = -1;
let html5QrCodeScanner = null;
let targetInputScannerId = null;
let fotoTempBase64 = "";

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  iniciarReloj();
  inicializarLectorCodigoBarras();
  
  // Foco inicial al campo de escaneo de ventas
  const barcodeInput = document.getElementById('barcode-input');
  if (barcodeInput) barcodeInput.focus();
});

// ==========================================
// RELOJ Y NAVEGACIÓN DE MÓDULOS
// ==========================================
function iniciarReloj() {
  const clockEl = document.getElementById('live-clock');
  setInterval(() => {
    const now = new Date();
    if (clockEl) {
      clockEl.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  }, 1000);
}

function cambiarModulo(modulo) {
  document.getElementById('modulo-ventas').classList.add('hidden');
  document.getElementById('modulo-productos').classList.add('hidden');

  document.getElementById('nav-ventas').classList.remove('active');
  document.getElementById('nav-productos').classList.remove('active');

  if (modulo === 'ventas') {
    document.getElementById('modulo-ventas').classList.remove('hidden');
    document.getElementById('nav-ventas').classList.add('active');
    setTimeout(() => document.getElementById('barcode-input').focus(), 100);
  } else if (modulo === 'productos') {
    document.getElementById('modulo-productos').classList.remove('hidden');
    document.getElementById('nav-productos').classList.add('active');
    setTimeout(() => document.getElementById('prod-codigo').focus(), 100);
  }
}

// ==========================================
// LECTOR DE CÓDIGO DE BARRAS / BÚSQUEDA
// ==========================================
function inicializarLectorCodigoBarras() {
  const input = document.getElementById('barcode-input');
  if (!input) return;

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarProducto();
    }
  });
}

function buscarProducto() {
  const input = document.getElementById('barcode-input');
  const codigo = input.value.trim();

  if (!codigo) return;

  const prod = productos.find(p => p.codigo.toLowerCase() === codigo.toLowerCase());

  if (prod) {
    agregarAlCarrito(prod);
    input.value = '';
  } else {
    alert(`El producto con código "${codigo}" no existe en el catálogo.`);
    input.value = '';
  }
  input.focus();
}

function buscarProductoPrompt() {
  const termino = prompt("Ingrese el Código de Barras o Nombre del producto:");
  if (!termino) return;

  const prod = productos.find(p => 
    p.codigo.toLowerCase() === termino.toLowerCase() || 
    p.nombre.toLowerCase().includes(termino.toLowerCase())
  );

  if (prod) {
    agregarAlCarrito(prod);
  } else {
    alert("Producto no encontrado.");
  }
}

// ==========================================
// CARRITO DE VENTAS
// ==========================================
function agregarAlCarrito(prod) {
  const itemExistente = carrito.find(item => item.codigo === prod.codigo);

  if (prod.usaInv && prod.stock <= 0) {
    alert(`El producto "${prod.nombre}" no tiene stock disponible.`);
    return;
  }

  if (itemExistente) {
    if (prod.usaInv && itemExistente.cantidad >= prod.stock) {
      alert(`No hay suficiente inventario disponible para agregar más unidades.`);
      return;
    }
    itemExistente.cantidad++;
  } else {
    carrito.push({
      codigo: prod.codigo,
      nombre: prod.nombre,
      precio: parseFloat(prod.precio),
      cantidad: 1,
      stock: prod.stock,
      foto: prod.foto || ""
    });
  }

  productoSeleccionadoIndex = carrito.findIndex(i => i.codigo === prod.codigo);
  renderCart();
  actualizarPreviewFoto(prod.foto);
}

function renderCart() {
  const tbody = document.getElementById('cart-rows');
  tbody.innerHTML = '';

  let totalCount = 0;
  let totalMonto = 0;

  carrito.forEach((item, index) => {
    const importe = item.precio * item.cantidad;
    totalCount += item.cantidad;
    totalMonto += importe;

    const isSelected = index === productoSeleccionadoIndex;
    const rowClass = isSelected ? 'bg-blue-100 font-bold' : 'hover:bg-gray-50';

    tbody.innerHTML += `
      <tr class="${rowClass} cursor-pointer text-xs" onclick="seleccionarFilaCarrito(${index})">
        <td class="p-1.5 font-mono border-r border-gray-200">${item.codigo}</td>
        <td class="p-1.5 border-r border-gray-200">${item.nombre}</td>
        <td class="p-1.5 text-right font-mono border-r border-gray-200">$${item.precio.toFixed(2)}</td>
        <td class="p-1.5 text-center border-r border-gray-200">
          <input type="number" min="1" value="${item.cantidad}" onchange="cambiarCantidadCarrito(${index}, this.value)" class="w-12 text-center border rounded font-bold" onclick="event.stopPropagation()">
        </td>
        <td class="p-1.5 text-right font-mono font-bold text-green-700 bg-emerald-50 border-r border-gray-200">$${importe.toFixed(2)}</td>
        <td class="p-1.5 text-center font-mono">${item.stock}</td>
      </tr>
    `;
  });

  document.getElementById('items-count').innerText = totalCount;
  document.getElementById('summary-total').innerText = `$${totalMonto.toFixed(2)}`;
  document.getElementById('cart-total').innerText = `$${totalMonto.toFixed(2)}`;
}

function seleccionarFilaCarrito(index) {
  productoSeleccionadoIndex = index;
  renderCart();
  if (carrito[index]) {
    actualizarPreviewFoto(carrito[index].foto);
  }
}

function cambiarCantidadCarrito(index, nuevaCant) {
  const cant = parseInt(nuevaCant);
  if (isNaN(cant) || cant <= 0) {
    carrito.splice(index, 1);
  } else {
    const prod = productos.find(p => p.codigo === carrito[index].codigo);
    if (prod && prod.usaInv && cant > prod.stock) {
      alert("La cantidad excede el stock disponible.");
      renderCart();
      return;
    }
    carrito[index].cantidad = cant;
  }
  renderCart();
}

function eliminarSeleccionado() {
  if (productoSeleccionadoIndex >= 0 && productoSeleccionadoIndex < carrito.length) {
    carrito.splice(productoSeleccionadoIndex, 1);
    productoSeleccionadoIndex = -1;
    actualizarPreviewFoto("");
    renderCart();
  } else {
    alert("Por favor, seleccione un artículo de la lista para eliminar.");
  }
}

function actualizarPreviewFoto(fotoBase64) {
  const imgEl = document.getElementById('product-preview-img');
  const placeholderEl = document.getElementById('product-preview-placeholder');

  if (fotoBase64) {
    imgEl.src = fotoBase64;
    imgEl.classList.remove('hidden');
    placeholderEl.classList.add('hidden');
  } else {
    imgEl.src = "";
    imgEl.classList.add('hidden');
    placeholderEl.classList.remove('hidden');
  }
}

// ==========================================
// COBRO Y FINALIZACIÓN DE VENTA
// ==========================================
function completarVenta() {
  if (carrito.length === 0) {
    alert("El carrito de ventas está vacío.");
    return;
  }

  const total = parseFloat(document.getElementById('cart-total').innerText.replace('$', ''));
  const pagoStr = prompt(`TOTAL A COBRAR: $${total.toFixed(2)}\n\nIngrese con cuánto paga el cliente:`, total.toFixed(2));

  if (pagoStr === null) return;

  const pago = parseFloat(pagoStr);
  if (isNaN(pago) || pago < total) {
    alert("El monto de pago introducido es insuficiente.");
    return;
  }

  const cambio = pago - total;

  // Actualizar Stock de productos
  carrito.forEach(item => {
    const prod = productos.find(p => p.codigo === item.codigo);
    if (prod && prod.usaInv) {
      prod.stock -= item.cantidad;
    }
  });

  const venta = {
    fecha: new Date().toISOString(),
    items: [...carrito],
    total: total,
    pago: pago,
    cambio: cambio
  };

  ventas.push(venta);
  guardarLocalStorage();

  document.getElementById('summary-pay').innerText = `$${pago.toFixed(2)}`;
  document.getElementById('summary-change').innerText = `$${cambio.toFixed(2)}`;

  alert(`¡Venta realizada con éxito!\n\nTotal: $${total.toFixed(2)}\nPagó: $${pago.toFixed(2)}\nCambio: $${cambio.toFixed(2)}`);

  carrito = [];
  productoSeleccionadoIndex = -1;
  actualizarPreviewFoto("");
  renderCart();
  document.getElementById('barcode-input').focus();
}

function reimprimirUltimoTicket() {
  if (ventas.length === 0) {
    alert("No hay ventas registradas en esta sesión.");
    return;
  }
  const ultimaVenta = ventas[ventas.length - 1];
  alert(`REIMPRESIÓN TICKET\nFecha: ${new Date(ultimaVenta.fecha).toLocaleString()}\nTotal: $${ultimaVenta.total.toFixed(2)}\nArtículos: ${ultimaVenta.items.length}`);
}

// ==========================================
// GESTIÓN DE PRODUCTOS (ALTA / FOTO)
// ==========================================
function calcularPrecioVenta() {
  const costo = parseFloat(document.getElementById('prod-costo').value) || 0;
  const ganancia = parseFloat(document.getElementById('prod-ganancia').value) || 0;

  if (costo > 0 && ganancia > 0) {
    const precio = costo + (costo * (ganancia / 100));
    document.getElementById('prod-precio').value = precio.toFixed(2);
  }
}

function toggleInventarioInputs(usaInv) {
  const container = document.getElementById('inv-inputs');
  if (usaInv) {
    container.classList.remove('opacity-50', 'pointer-events-none');
  } else {
    container.classList.add('opacity-50', 'pointer-events-none');
  }
}

function procesarFotoSeleccionada(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    fotoTempBase64 = e.target.result;
    document.getElementById('new-prod-img-preview').src = fotoTempBase64;
    document.getElementById('new-prod-img-preview').classList.remove('hidden');
    document.getElementById('new-prod-img-placeholder').classList.add('hidden');
  };
  reader.readAsDataURL(file);
}

function limpiarFotoProducto() {
  fotoTempBase64 = "";
  document.getElementById('input-prod-foto').value = "";
  document.getElementById('new-prod-img-preview').src = "";
  document.getElementById('new-prod-img-preview').classList.add('hidden');
  document.getElementById('new-prod-img-placeholder').classList.remove('hidden');
}

function ejecutarGuardadoFormulario() {
  document.getElementById('btn-submit-hidden').click();
}

function guardarNuevoProducto(event) {
  event.preventDefault();

  const codigo = document.getElementById('prod-codigo').value.trim();
  const nombre = document.getElementById('prod-nombre').value.trim();
  const costo = parseFloat(document.getElementById('prod-costo').value) || 0;
  const precio = parseFloat(document.getElementById('prod-precio').value) || 0;
  const mayoreo = parseFloat(document.getElementById('prod-mayoreo').value) || 0;
  const depto = document.getElementById('prod-depto').value;
  const usaInv = document.getElementById('prod-usa-inv').checked;
  const stock = parseInt(document.getElementById('prod-stock').value) || 0;
  const min = parseInt(document.getElementById('prod-min').value) || 0;
  const max = parseInt(document.getElementById('prod-max').value) || 0;

  const indexExistente = productos.findIndex(p => p.codigo === codigo);

  const nuevoProducto = {
    codigo,
    nombre,
    costo,
    precio,
    mayoreo,
    depto,
    usaInv,
    stock,
    min,
    max,
    foto: fotoTempBase64
  };

  if (indexExistente >= 0) {
    productos[indexExistente] = nuevoProducto;
    alert("¡Producto actualizado correctamente!");
  } else {
    productos.push(nuevoProducto);
    alert("¡Producto guardado exitosamente!");
  }

  guardarLocalStorage();
  limpiarFormularioProducto();
  cambiarModulo('ventas');
}

function limpiarFormularioProducto() {
  document.getElementById('form-producto').reset();
  limpiarFotoProducto();
}

// ==========================================
// ESCÁNER DE CÁMARA (html5-qrcode)
// ==========================================
function abrirEscanerCamara(targetInputId) {
  targetInputScannerId = targetInputId;
  const modal = document.getElementById('modal-scanner');
  modal.classList.remove('hidden');

  if (!html5QrCodeScanner) {
    html5QrCodeScanner = new Html5Qrcode("reader");
  }

  html5QrCodeScanner.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: { width: 250, height: 150 }
    },
    (decodedText) => {
      // Éxito al leer
      document.getElementById(targetInputScannerId).value = decodedText;
      cerrarEscanerCamara();

      if (targetInputScannerId === 'barcode-input') {
        buscarProducto();
      }
    },
    (errorMessage) => {
      // Fallo de escaneo por cuadro
    }
  ).catch(err => {
    alert("No se pudo iniciar la cámara o permisos denegados.");
    cerrarEscanerCamara();
  });
}

function cerrarEscanerCamara() {
  const modal = document.getElementById('modal-scanner');
  modal.classList.add('hidden');

  if (html5QrCodeScanner) {
    html5QrCodeScanner.stop().then(() => {
      html5QrCodeScanner.clear();
    }).catch(err => console.log(err));
  }
}

// ==========================================
// ALMACENAMIENTO Y LOCALSTORAGE
// ==========================================
function guardarLocalStorage() {
  localStorage.setItem('pos_productos', JSON.stringify(productos));
  localStorage.setItem('pos_ventas', JSON.stringify(ventas));
}
