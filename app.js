// Base de datos local de ejemplo
const productosBase = [
  { id: '1', nombre: 'Agua Ciel 1L', precio: 15, codigo: '75010001' },
  { id: '2', nombre: 'Galletas Chokis', precio: 22, codigo: '75010002' },
  { id: '3', nombre: 'Refresco 600ml', precio: 18, codigo: '75010003' },
  { id: '4', nombre: 'Cuaderno', precio: 35, codigo: '75010004' }
];

let carrito = [];

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  renderProductos();
  registrarServiceWorker();

  const barcodeInput = document.getElementById('barcode-input');
  
  // Coloca el cursor en la caja de texto automáticamente
  barcodeInput.focus();

  // Captura la tecla Enter que envía el escáner de código de barras
  barcodeInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      buscarProducto();
    }
  });
});

// Renderizar catálogo
function renderProductos() {
  const grid = document.getElementById('product-grid');
  grid.innerHTML = '';
  
  productosBase.forEach(p => {
    grid.innerHTML += `
      <div onclick="agregarAlCarrito('${p.id}')" class="border rounded-lg p-3 bg-gray-50 hover:bg-blue-50 cursor-pointer flex flex-col justify-between shadow-sm">
        <p class="font-bold text-sm text-gray-800">${p.nombre}</p>
        <p class="text-blue-600 font-semibold mt-2">$${p.precio.toFixed(2)}</p>
      </div>
    `;
  });
}

// Agregar producto directo por ID
function agregarAlCarrito(id) {
  const producto = productosBase.find(p => p.id === id);
  if (!producto) return;

  const itemEnCarrito = carrito.find(item => item.id === id);
  if (itemEnCarrito) {
    itemEnCarrito.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  actualizarCarrito();
}

// Buscar y agregar por código de barras o por nombre
function buscarProducto() {
  const input = document.getElementById('barcode-input');
  const valor = input.value.trim();

  if (!valor) return;

  const producto = productosBase.find(
    p => p.codigo === valor || p.nombre.toLowerCase().includes(valor.toLowerCase())
  );

  if (producto) {
    agregarAlCarrito(producto.id);
    input.value = '';
  } else {
    alert('Producto no encontrado');
    input.value = '';
  }

  // Mantiene el cursor en la caja para el siguiente escaneo
  input.focus();
}

// Actualizar vista del carrito
function actualizarCarrito() {
  const container = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  container.innerHTML = '';

  let total = 0;

  carrito.forEach(item => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    container.innerHTML += `
      <div class="flex justify-between items-center bg-gray-100 p-2 rounded">
        <div>
          <p class="font-semibold text-sm">${item.nombre}</p>
          <p class="text-xs text-gray-500">$${item.precio} x ${item.cantidad}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-bold">$${subtotal.toFixed(2)}</span>
          <button onclick="eliminarDelCarrito('${item.id}')" class="text-red-500 font-bold px-1">✕</button>
        </div>
      </div>
    `;
  });

  totalEl.innerText = `$${total.toFixed(2)}`;
}

// Eliminar ítem del carrito
function eliminarDelCarrito(id) {
  carrito = carrito.filter(item => item.id !== id);
  actualizarCarrito();
  document.getElementById('barcode-input').focus();
}

// Guardar la venta en localStorage
function completarVenta() {
  if (carrito.length === 0) return alert('El carrito está vacío');

  const venta = {
    id: Date.now(),
    fecha: new Date().toISOString(),
    items: carrito,
    total: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
  };

  const ventasPrevias = JSON.parse(localStorage.getItem('pos_ventas') || '[]');
  ventasPrevias.push(venta);
  localStorage.setItem('pos_ventas', JSON.stringify(ventasPrevias));

  alert('¡Venta registrada con éxito!');
  carrito = [];
  actualizarCarrito();
  document.getElementById('barcode-input').focus();
}

// Registrar el Service Worker para funcionamiento sin conexión
function registrarServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('Service Worker listo'))
      .catch(err => console.error('Error al registrar SW:', err));
  }
}
