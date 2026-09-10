// ==========================================
// 1. NAVEGACIÓN GENERAL DE MÓDULOS
// ==========================================
function cambiarModulo(modulo) {
  // Ocultar todos los módulos principales
  const mVentas = document.getElementById('modulo-ventas');
  const mProductos = document.getElementById('modulo-productos');

  if (mVentas) mVentas.classList.add('hidden');
  if (mProductos) mProductos.classList.add('hidden');

  // Quitar la clase activa visual a los botones del menú superior
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('ring-2', 'ring-blue-400', 'bg-blue-50');
  });

  // Mostrar el módulo solicitado
  const moduloActivo = document.getElementById(`modulo-${modulo}`);
  const btnActivo = document.getElementById(`btn-tab-${modulo}`);

  if (moduloActivo) {
    moduloActivo.classList.remove('hidden');
  }

  if (btnActivo) {
    btnActivo.classList.add('ring-2', 'ring-blue-400', 'bg-blue-50');
  }
}

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

    // Buscar en el catálogo local de productos
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
      id: producto.id,
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
        <input type="number" value="${item.cantidad}" min="1" onchange="actualizarCantidadCarrito(${index}, this.value)" class="w-12 border border-gray-400 rounded p-0.5 text-center font-mono font-bold">
      </td>
      <td class="p-2 text-right font-mono font-bold text-blue-900">$${subtotal.toFixed(2)}</td>
      <td class="p-2 text-center font-mono text-gray-700">${existencia}</td>
      <td class="p-2 text-center">
        <button onclick="eliminarDelCarrito(${index})" class="text-red-500 hover:text-red-700 font-bold">✕</button>
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
