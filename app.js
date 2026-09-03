// Base de datos local de productos
const productosBase = [
  { id: '1', codigo: '75010001', nombre: 'Agua Ciel 1L', precio: 15.00, stock: 45 },
  { id: '2', codigo: '75010002', nombre: 'Galletas Chokis', precio: 22.00, stock: 18 },
  { id: '3', codigo: '75010003', nombre: 'Refresco Coca-Cola 600ml', precio: 18.00, stock: 30 },
  { id: '4', codigo: '75010004', nombre: 'Cuaderno Profesional', precio: 35.00, stock: 12 }
];

let carrito = [];
let itemSeleccionadoIndex = null;

document.addEventListener('DOMContentLoaded', () => {
  registrarServiceWorker();
  iniciarReloj();

  const barcodeInput = document.getElementById('barcode-input');
  barcodeInput.focus();

  // Escaneo automático con Enter
  barcodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarProducto();
    }
  });

  // Atajos de teclado estilo eleventa (F10, F12, Supr)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F12') {
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

function buscarProducto() {
  const input = document.getElementById('barcode-input');
  const valor = input.value.trim();
  if (!valor) return;

  const producto = productosBase.find(
    p => p.codigo === valor || p.nombre.toLowerCase().includes(valor.toLowerCase())
  );

  if (producto) {
    agregarAlCarrito(producto);
    input.value = '';
  } else {
    alert('El producto no existe o no tiene existencia.');
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
        <td class="p-1.5 text-right font-mono">$${item.precio.toFixed(2)}</td>
        <td class="p-1.5 text-center font-bold">${item.cantidad}</td>
        <td class="p-1.5 text-right font-mono font-bold bg-[#f4fbf4] text-green-900">$${importe.toFixed(2)}</td>
        <td class="p-1.5 text-center text-gray-500">${item.stock}</td>
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
