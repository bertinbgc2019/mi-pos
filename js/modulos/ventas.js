// ==========================================
// 1. LÓGICA DEL CARRITO Y VENTAS
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
      e.target.value = ''; // Limpiar input después de agregar
    } else {
      alert("⚠️ Producto no encontrado en el catálogo.");
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
  const vacioEl = document.getElementById('carrito-vacio');

  if (!tbody) return;
  tbody.innerHTML = '';

  let total = 0;
  let totalArticulos = 0;
  const productosCatalog = JSON.parse(localStorage.getItem('gnet_productos')) || [];

  // Mostrar u ocultar mensaje de carrito vacío
  if (carrito.length === 0) {
    if (vacioEl) vacioEl.classList.remove('hidden');
  } else {
    if (vacioEl) vacioEl.classList.add('hidden');
  }

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
        <input type="number" value="${item.cantidad}" min="1" onchange="actualizarCantidadCarrito(${index}, this.value)" class="w-16 border border-gray-400 rounded p-1 text-center font-mono font-bold text-black">
      </td>
      <td class="p-2 text-right font-mono font-bold text-blue-900">$${subtotal.toFixed(2)}</td>
      <td class="p-2 text-center font-mono text-gray-700">${existencia}</td>
      <td class="p-2 text-center">
        <button onclick="eliminarDelCarrito(${index})" type="button" class="text-red-500 hover:text-red-700 font-bold text-xl">✕</button>
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
  if(carrito.length > 0 && confirm('¿Estás seguro de cancelar esta venta?')) {
    carrito = [];
    actualizarTablaCarrito();
  }
}

// ==========================================
// 2. FUNCIONES DE CÁMARA Y COBRO PARA VENTAS
// ==========================================
let html5QrCodeVenta = null;

function abrirCamaraEscanerVenta() {
  const modal = document.getElementById('modal-escaner-camara');
  if (modal) modal.classList.remove('hidden');
  
  html5QrCodeVenta = new Html5Qrcode("reader");
  const config = {
    fps: 10,
    qrbox: { width: 250, height: 150 },
    aspectRatio: 1.0
  };
  
  html5QrCodeVenta.start(
    { facingMode: "environment" },
    config,
    (decodedText) => {
      const valor = decodedText.trim().toLowerCase();
      const productosCatalog = JSON.parse(localStorage.getItem('gnet_productos')) || [];
      const prod = productosCatalog.find(p => 
        p.codigo.toLowerCase() === valor || 
        p.nombre.toLowerCase().includes(valor)
      );
      
      if (prod) {
        agregarAlCarrito(prod);
      } else {
        alert("⚠️ Producto no encontrado: " + decodedText);
      }
      cerrarCamaraEscanerVenta();
    },
    (errorMessage) => { /* Ignorar errores de frame */ }
  ).catch(err => {
    alert("No se pudo acceder a la cámara. Asegúrate de dar los permisos necesarios.");
    cerrarCamaraEscanerVenta();
  });
}

function cerrarCamaraEscanerVenta() {
  const modal = document.getElementById('modal-escaner-camara');
  if (html5QrCodeVenta) {
    html5QrCodeVenta.stop().then(() => {
      html5QrCodeVenta.clear();
      if (modal) modal.classList.add('hidden');
    }).catch(err => {
      if (modal) modal.classList.add('hidden');
    });
  } else {
    if (modal) modal.classList.add('hidden');
  }
}

function procesarCobro() {
  if (carrito.length === 0) {
    alert("⚠️ No hay productos en el carrito para cobrar.");
    return;
  }
  const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  alert(`💰 Total a cobrar: $${total.toFixed(2)}\n\n(Aquí se integrará el modal de cobro.js)`);
  // Aquí puedes llamar a tu función de cobro, ej: iniciarProcesoCobro(total);
}
