// js/modulos/ventas.js - Lógica del Carrito, Lectura de Barras y Cobro

document.addEventListener('DOMContentLoaded', () => {
  configurarLectorModoTexto();
});

function configurarLectorModoTexto() {
  const input = document.getElementById('barcode-input');
  if (!input) return;

  // Detectar cuándo el lector presiona Enter automáticamente al terminar de leer
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const codigo = input.value.trim();
      if (codigo) {
        buscarProductoPorCodigo(codigo);
      }
    }
  });
}

function buscarProductoPorCodigo(codigo) {
  if (!codigo) return;
  
  const prod = productos.find(p => p.codigo === codigo);
  if (prod) {
    agregarAlCarrito(prod);
    const input = document.getElementById('barcode-input');
    if (input) input.value = '';
  } else {
    alert(`Producto no encontrado para el código: ${codigo}`);
    const input = document.getElementById('barcode-input');
    if (input) input.select();
  }
}

function agregarAlCarrito(producto) {
  const itemExistente = carrito.find(item => item.id === producto.id);
  
  if (itemExistente) {
    itemExistente.cantidad += 1;
  } else {
    carrito.push({
      id: producto.id,
      codigo: producto.codigo,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1
    });
  }
  
  actualizarTablaCarrito();
}

function actualizarTablaCarrito() {
  const tbody = document.getElementById('carrito-body');
  const totalEl = document.getElementById('total-pagar');
  if (!tbody) return;

  tbody.innerHTML = '';
  let total = 0;

  carrito.forEach((item, index) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    const tr = document.createElement('tr');
    tr.className = "hover:bg-gray-50 border-b border-gray-200";
    tr.innerHTML = `
      <td class="p-1.5 font-medium text-gray-800">${item.nombre}</td>
      <td class="p-1.5 text-center">
        <input type="number" value="${item.cantidad}" min="1" class="w-16 border rounded p-1 text-center font-mono font-bold" onchange="cambiarCantidadCarrito(${index}, this.value)">
      </td>
      <td class="p-1.5 text-right font-mono">$${item.precio.toFixed(2)}</td>
      <td class="p-1.5 text-right font-mono font-bold text-blue-900 bg-[#f4f9f4]">$${subtotal.toFixed(2)}</td>
      <td class="p-1.5 text-center">
        <button onclick="eliminarDelCarrito(${index})" class="text-red-600 hover:text-red-800 font-bold px-2 py-0.5 rounded border border-red-200 hover:bg-red-50">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (totalEl) totalEl.innerText = `$${total.toFixed(2)}`;
}

function cambiarCantidadCarrito(index, nuevaCantidad) {
  const cant = parseInt(nuevaCantidad);
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

function limpiarCarrito() {
  carrito = [];
  actualizarTablaCarrito();
  const input = document.getElementById('barcode-input');
  if (input) input.focus();
}

function procesarCobro() {
  if (carrito.length === 0) {
    alert('El carrito está vacío.');
    return;
  }

  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  
  const nuevaVenta = {
    id: Date.now(),
    fecha: new Date().toISOString(),
    items: [...carrito],
    total: total
  };

  ventas.push(nuevaVenta);
  guardarLocalStorage();
  
  alert(`¡Venta realizada con éxito por $${total.toFixed(2)}!`);
  limpiarCarrito();
}
