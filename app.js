// Base inicial de productos si no hay nada en localStorage
const productosDefault = [
  { id: '1', codigo: '75010001', nombre: 'Agua Ciel 1L', precio: 15.00, stock: 45, costo: 10.00 },
  { id: '2', codigo: '75010002', nombre: 'Galletas Chokis', precio: 22.00, stock: 18, costo: 16.00 },
  { id: '3', codigo: '75010003', nombre: 'Refresco Coca-Cola 600ml', precio: 18.00, stock: 30, costo: 13.00 },
  { id: '4', codigo: '75010004', nombre: 'Cuaderno Profesional', precio: 35.00, stock: 12, costo: 25.00 }
];

// Obtener catálogo almacenado
function obtenerProductosDB() {
  const db = localStorage.getItem('eleventa_productos');
  if (!db) {
    localStorage.setItem('eleventa_productos', JSON.stringify(productosDefault));
    return productosDefault;
  }
  return JSON.parse(db);
}

let productosBase = obtenerProductosDB();
let carrito = [];
let itemSeleccionadoIndex = null;

document.addEventListener('DOMContentLoaded', () => {
  registrarServiceWorker();
  iniciarReloj();

  const barcodeInput = document.getElementById('barcode-input');
  if (barcodeInput) barcodeInput.focus();

  // Escaneo automático con Enter
  if (barcodeInput) {
    barcodeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        buscarProducto();
      }
    });
  }

  // Atajos de teclado estilo eleventa (F1, F3, F10, F12, Supr)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F1') {
      e.preventDefault();
      cambiarModulo('ventas');
    } else if (e.key === 'F3') {
      e.preventDefault();
      cambiarModulo('productos');
    } else if (e.key === 'F12') {
      e.preventDefault();
      completarVenta();
    } else if (e.key === 'F10') {
      e.preventDefault();
      buscarProductoPrompt();
    } else if (e.key === 'Delete') {
      eliminarSeleccionado();
    }
  });
});

// Navegación entre Módulos Ventas (F1) y Productos (F3)
function cambiarModulo(modulo) {
  const modVentas = document.getElementById('modulo-ventas');
  const modProductos = document.getElementById('modulo-productos');
  const btnVentas = document.getElementById('nav-ventas');
  const btnProductos = document.getElementById('nav-productos');

  if (modulo === 'ventas') {
    modVentas.classList.remove('hidden');
    modProductos.classList.add('hidden');
    btnVentas.classList.add('active');
    btnProductos.classList.remove('active');
    document.getElementById('barcode-input').focus();
  } else if (modulo === 'productos') {
    modVentas.classList.add('hidden');
    modProductos.classList.remove('hidden');
    btnVentas.classList.remove('active');
    btnProductos.classList.add('active');
    document.getElementById('prod-codigo').focus();
  }
}

// Ventas y Carrito
function buscarProducto() {
  const input = document.getElementById('barcode-input');
  const valor = input.value.trim();
  if (!valor) return;

  productosBase = obtenerProductosDB(); // Actualizar productos
  const producto = productosBase.find(
    p => p.codigo === valor || p.nombre.toLowerCase().includes(valor.toLowerCase())
  );

  if (producto) {
    agregarAlCarrito(producto);
    input.value = '';
  } else {
    alert('El producto no existe en el catálogo.');
    input.value = '';
  }
  input.focus();
}

function buscarProductoPrompt() {
  const busqueda = prompt('Teclee el nombre o código del producto a buscar:');
  if (busqueda) {
    document.getElementById('barcode-input').value = busqueda;
    buscarProducto();
  }
}

function agregarAlCarrito(producto) {
  const item = carrito.find(i => i.id === producto.id);
  if (item) {
    item.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  actualizarTabla();
}

function seleccionarFila(index) {
  itemSeleccionadoIndex = index;
  actualizarTabla();
}

function actualizarTabla() {
  const tbody = document.getElementById('cart-rows');
  tbody.innerHTML = '';

  let total = 0;
  let totalArticulos = 0;

  carrito.forEach((item, index) => {
    const importe = item.precio * item.cantidad;
    total += importe;
    totalArticulos += item.cantidad;

    const isSelected = itemSeleccionadoIndex === index;
    const rowClass = isSelected ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-50';

    tbody.innerHTML += `
      <tr onclick="seleccionarFila(${index})" class="${rowClass} cursor-pointer border-b border-gray-200">
        <td class="p-1.5 font-mono">${item.codigo}</td>
        <td class="p-1.5">${item.nombre}</td>
        <td class="p-1.5 text-right font-mono">$${parseFloat(item.precio).toFixed(2)}</td>
        <td class="p-1.5 text-center font-bold">${item.cantidad}</td>
        <td class="p-1.5 text-right font-mono font-bold bg-[#f4fbf4] text-green-900">$${importe.toFixed(2)}</td>
        <td class="p-1.5 text-center text-gray-500">${item.stock ?? 'N/A'}</td>
      </tr>
    `;
  });

  document.getElementById('cart-total').innerText = `$${total.toFixed(2)}`;
  document.getElementById('summary-total').innerText = `$${total.toFixed(2)}`;
  document.getElementById('items-count').innerText = totalArticulos;
}

function eliminarSeleccionado() {
  if (itemSeleccionadoIndex !== null && carrito[itemSeleccionadoIndex]) {
    carrito.splice(itemSeleccionadoIndex, 1);
    itemSeleccionadoIndex = null;
    actualizarTabla();
  } else if (carrito.length > 0) {
    carrito.pop();
    actualizarTabla();
  }
  document.getElementById('barcode-input').focus();
}

function completarVenta() {
  if (carrito.length === 0) return alert('No hay artículos en la venta actual.');

  const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const pagoStr = prompt(`TOTAL A COBRAR: $${total.toFixed(2)}\n\n¿Con cuánto paga el cliente?`, total);

  if (pagoStr === null) return;

  const pago = parseFloat(pagoStr);
  if (isNaN(pago) || pago < total) {
    return alert('Monto insuficiente o inválido.');
  }

  const cambio = pago - total;

  document.getElementById('summary-pay').innerText = `$${pago.toFixed(2)}`;
  document.getElementById('summary-change').innerText = `$${cambio.toFixed(2)}`;

  const venta = {
    id: Date.now(),
    fecha: new Date().toISOString(),
    items: carrito,
    total: total,
    pago: pago,
    cambio: cambio
  };

  const ventasPrevias = JSON.parse(localStorage.getItem('pos_ventas') || '[]');
  ventasPrevias.push(venta);
  localStorage.setItem('pos_ventas', JSON.stringify(ventasPrevias));

  alert(`¡Venta realizada con éxito!\n\nCambio a entregar: $${cambio.toFixed(2)}`);

  carrito = [];
  itemSeleccionadoIndex = null;
  actualizarTabla();
  document.getElementById('barcode-input').focus();
}

function reimprimirUltimoTicket() {
  const ventas = JSON.parse(localStorage.getItem('pos_ventas') || '[]');
  if (ventas.length === 0) return alert('No hay ventas registradas aún.');

  const ultimaVenta = ventas[ventas.length - 1];
  alert(`REIMPRESIÓN ÚLTIMO TICKET\nID Venta: ${ultimaVenta.id}\nTotal: $${ultimaVenta.total.toFixed(2)}\nPago: $${ultimaVenta.pago.toFixed(2)}\nCambio: $${ultimaVenta.cambio.toFixed(2)}`);
}

// ==================== LÓGICA DE PRODUCTOS ====================

function calcularPrecioVenta() {
  const costo = parseFloat(document.getElementById('prod-costo').value) || 0;
  const ganancia = parseFloat(document.getElementById('prod-ganancia').value) || 0;

  if (costo > 0 && ganancia > 0) {
    const precioVenta = costo + (costo * (ganancia / 100));
    document.getElementById('prod-precio').value = precioVenta.toFixed(2);
  }
}

function toggleInventarioInputs(usaInventario) {
  const invContainer = document.getElementById('inv-inputs');
  if (usaInventario) {
    invContainer.classList.remove('opacity-50', 'pointer-events-none');
  } else {
    invContainer.classList.add('opacity-50', 'pointer-events-none');
  }
}

function guardarNuevoProducto(event) {
  event.preventDefault();

  const codigo = document.getElementById('prod-codigo').value.trim();
  const nombre = document.getElementById('prod-nombre').value.trim();
  const precio = parseFloat(document.getElementById('prod-precio').value) || 0;
  const costo = parseFloat(document.getElementById('prod-costo').value) || 0;
  const mayoreo = parseFloat(document.getElementById('prod-mayoreo').value) || 0;
  const depto = document.getElementById('prod-depto').value;
  const usaInv = document.getElementById('prod-usa-inv').checked;
  const stock = usaInv ? (parseInt(document.getElementById('prod-stock').value) || 0) : 999;

  let db = obtenerProductosDB();

  // Verificar si el código ya existe
  const indexExistente = db.findIndex(p => p.codigo === codigo);

  const nuevoProd = {
    id: indexExistente >= 0 ? db[indexExistente].id : Date.now().toString(),
    codigo: codigo,
    nombre: nombre,
    precio: precio,
    costo: costo,
    mayoreo: mayoreo,
    departamento: depto,
    stock: stock
  };

  if (indexExistente >= 0) {
    db[indexExistente] = nuevoProd;
    alert('¡Producto actualizado correctamente!');
  } else {
    db.push(nuevoProd);
    alert('¡Producto guardado exitosamente!');
  }

  localStorage.setItem('eleventa_productos', JSON.stringify(db));
  productosBase = db;

  limpiarFormularioProducto();
  cambiarModulo('ventas');
}

function limpiarFormularioProducto() {
  document.getElementById('form-producto').reset();
  toggleInventarioInputs(true);
}

// Utilidades
function iniciarReloj() {
  const clockEl = document.getElementById('live-clock');
  setInterval(() => {
    const ahora = new Date();
    clockEl.innerText = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " - " + ahora.toLocaleDateString();
  }, 1000);
}

function registrarServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.error(err));
  }
}
