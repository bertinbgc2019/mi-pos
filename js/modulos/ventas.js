// ==========================================
// 1. NAVEGACIÓN Y TECLAS DE ACCESO RÁPIDO
// ==========================================
function cambiarModulo(modulo) {
  const mVentas = document.getElementById('modulo-ventas');
  const mProductos = document.getElementById('modulo-productos');

  if (mVentas) mVentas.classList.add('hidden');
  if (mProductos) mProductos.classList.add('hidden');

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('ring-2', 'ring-blue-400', 'bg-blue-50');
  });

  const moduloActivo = document.getElementById(`modulo-${modulo}`);
  const btnActivo = document.getElementById(`btn-tab-${modulo}`);

  if (moduloActivo) {
    moduloActivo.classList.remove('hidden');
  }

  if (btnActivo) {
    btnActivo.classList.add('ring-2', 'ring-blue-400', 'bg-blue-50');
  }
}

// CAPTURA GLOBAL DE TECLAS TECLADO (F12, F1, F4, etc.)
document.addEventListener('keydown', function(e) {
  if (e.key === 'F12' || e.keyCode === 123) {
    e.preventDefault();
    e.stopPropagation();
    abrirModalCobrar();
  } else if (e.key === 'F1') {
    e.preventDefault();
    cambiarModulo('ventas');
  } else if (e.key === 'F4') {
    e.preventDefault();
    cambiarModulo('productos');
  }
});

// RELOJ EN TIEMPO REAL
setInterval(() => {
  const reloj = document.getElementById('reloj-footer');
  if (reloj) {
    const ahora = new Date();
    const opcionesFecha = { day: '2-digit', month: 'short' };
    const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    reloj.innerText = `${ahora.toLocaleDateString('es-ES', opcionesFecha)} ${ahora.toLocaleTimeString('es-ES', opcionesHora)}`;
  }
}, 1000);


// ==========================================
// 2. LÓGICA DEL CARRITO Y VENTAS
// ==========================================
let carrito = [];

function evaluarBusquedaVentas(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const valor = e.target.value.trim().toLowerCase();
    if (!valor) return;

    const productosCatalog = JSON.parse(localStorage.getItem('gnet_productos')) || [];
    const prod = productosCatalog.find(p => p.codigo.toLowerCase() === valor || p.nombre.toLowerCase().includes(valor));

    if (prod) {
      agregarAlCarrito(prod);
      e.target.value = '';
    } else {
      alert("Producto no encontrado en el catálogo.");
    }
  }
}

function agregarAlCarrito(producto) {
  const existe = carrito.find(item => item.codigo === producto.codigo);

  if (existe) {
    existe.cantidad++;
  } else {
    carrito.push({
      id: producto.id || Date.now(),
      codigo: producto.codigo,
      nombre: producto.nombre,
      precio: parseFloat(producto.precio) || 0,
      cantidad: 1
    });
  }

  actualizarTablaCarrito();
}

function actualizarTablaCarrito() {
  const tbody = document.getElementById('carrito-body');
  const totalEl = document.getElementById('total-pagar');
  const contadorEl = document.getElementById('contador-productos-carrito');

  if (!tbody) return;
  tbody.innerHTML = '';

  let total = 0;
  let totalArticulos = 0;
  const productosCatalog = JSON.parse(localStorage.getItem('gnet_productos')) || [];

  carrito.forEach((item, index) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;
    totalArticulos += item.cantidad;

    const prodCatalogo = productosCatalog.find(p => p.codigo === item.codigo);
    const existencia = prodCatalogo ? prodCatalogo.stock : '--';

    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-100 border-b border-gray-300 text-black";
    tr.innerHTML = `
      <td class="p-2 font-mono font-medium text-gray-800">${item.codigo || '--'}</td>
      <td class="p-2 font-semibold text-gray-900">${item.nombre}</td>
      <td class="p-2 text-right font-mono font-bold">$${item.precio.toFixed(2)}</td>
      <td class="p-2 text-center">
        <input type="number" value="${item.cantidad}" min="1" onchange="actualizarCantidadCarrito(${index}, this.value)" class="w-12 border border-gray-400 rounded p-0.5 text-center font-mono font-bold text-black">
      </td>
      <td class="p-2 text-right font-mono font-bold text-blue-900">$${subtotal.toFixed(2)}</td>
      <td class="p-2 text-center font-mono text-gray-700">${existencia}</td>
      <td class="p-2 text-center">
        <button onclick="eliminarDelCarrito(${index})" type="button" class="text-red-500 hover:text-red-700 font-bold">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (totalEl) totalEl.innerText = `$ ${total.toFixed(2)}`;
  if (contadorEl) contadorEl.innerText = `${totalArticulos} Productos en la Venta actual`;
}

function actualizarCantidadCarrito(index, cantidad) {
  const cant = parseInt(cantidad);
  if (cant > 0) {
    carrito[index].cantidad = cant;
  } else {
    carrito.splice(index, 1);
  }
  actualizarTablaCarrito();
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  actualizarTablaCarrito();
}

function vaciarCarrito() {
  carrito = [];
  actualizarTablaCarrito();
}


// ==========================================
// 3. FUNCIONES DE COBRO Y MODAL BLINDADAS
// ==========================================
function obtenerTotalCarrito() {
  if (!Array.isArray(carrito)) return 0;
  return carrito.reduce((acc, item) => acc + (parseFloat(item.precio || 0) * parseInt(item.cantidad || 0)), 0);
}

function abrirModalCobrar() {
  if (!carrito || carrito.length === 0) {
    alert("El carrito está vacío. Agrega al menos un producto para cobrar.");
    return;
  }

  const total = obtenerTotalCarrito();
  const modal = document.getElementById('modal-cobrar');
  const modalTotal = document.getElementById('modal-total-pagar');
  const modalInputPago = document.getElementById('modal-input-pago');

  if (modal && modalTotal && modalInputPago) {
    modalTotal.innerText = `$ ${total.toFixed(2)}`;
    modalInputPago.value = '';
    const cambioEl = document.getElementById('modal-cambio-pagar');
    if (cambioEl) {
      cambioEl.innerText = '$ 0.00';
      cambioEl.className = "text-2xl font-bold text-green-600";
    }

    modal.classList.remove('hidden');
    setTimeout(() => modalInputPago.focus(), 150);
  } else {
    console.error("No se encontró el elemento modal-cobrar en el HTML.");
  }
}

function cerrarModalCobrar() {
  const modal = document.getElementById('modal-cobrar');
  if (modal) modal.classList.add('hidden');
}

function calcularCambioCobro() {
  const total = obtenerTotalCarrito();
  const pagoInput = parseFloat(document.getElementById('modal-input-pago').value) || 0;
  const cambioEl = document.getElementById('modal-cambio-pagar');

  const cambio = pagoInput - total;
  if (cambioEl) {
    if (cambio >= 0) {
      cambioEl.innerText = `$ ${cambio.toFixed(2)}`;
      cambioEl.className = "text-2xl font-bold text-green-600";
    } else {
      cambioEl.innerText = `Faltan $ ${Math.abs(cambio).toFixed(2)}`;
      cambioEl.className = "text-2xl font-bold text-red-600";
    }
  }
}

function evaluarProcesarCobro(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    procesarCobroFinal();
  }
}

function procesarCobroFinal() {
  const total = obtenerTotalCarrito();
  const pagoInput = parseFloat(document.getElementById('modal-input-pago').value) || 0;

  if (pagoInput < total) {
    alert("El monto pagado es menor al total a cobrar.");
    return;
  }

  const cambio = pagoInput - total;
  alert(`¡Venta realizada con éxito!\n\nTotal: $${total.toFixed(2)}\nPago: $${pagoInput.toFixed(2)}\nCambio: $${cambio.toFixed(2)}`);

  // Descontar inventario local
  let productosCatalog = JSON.parse(localStorage.getItem('gnet_productos')) || [];
  carrito.forEach(item => {
    const prod = productosCatalog.find(p => p.codigo === item.codigo);
    if (prod && prod.stock !== undefined) {
      prod.stock = Math.max(0, parseInt(prod.stock) - parseInt(item.cantidad));
    }
  });
  localStorage.setItem('gnet_productos', JSON.stringify(productosCatalog));

  // Limpiar y cerrar
  vaciarCarrito();
  cerrarModalCobrar();
}

// VINCULACIÓN DIRECTA AL CARGAR EL DOM
document.addEventListener('DOMContentLoaded', () => {
  const btnCobrar = document.getElementById('btn-cobrar-f12');
  if (btnCobrar) {
    btnCobrar.addEventListener('click', abrirModalCobrar);
  }
});
