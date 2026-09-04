// js/modulos/ventas.js - Lógica del Carrito y Cobro

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

function buscarProductoPorCodigo(codigo) {
  if (!codigo.trim()) return;
  
  const prod = productos.find(p => p.codigo === codigo.trim());
  if (prod) {
    agregarAlCarrito(prod);
    document.getElementById('barcode-input').value = '';
  } else {
    alert('Producto no encontrado');
  }
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
    tr.innerHTML = `
      <td>${item.nombre}</td>
      <td>
        <input type="number" value="${item.cantidad}" min="1" class="w-16 border rounded p-1 text-center" onchange="cambiarCantidadCarrito(${index}, this.value)">
      </td>
      <td>$${item.precio.toFixed(2)}</td>
      <td>$${subtotal.toFixed(2)}</td>
      <td>
        <button onclick="eliminarDelCarrito(${index})" class="text-red-600 hover:text-red-800 font-bold px-2">✕</button>
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
