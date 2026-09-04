// js/modulos/productos.js - Gestión de Catálogo de Productos

function guardarProducto(event) {
  if (event) event.preventDefault();

  const codigo = document.getElementById('prod-codigo').value.trim();
  const nombre = document.getElementById('prod-nombre').value.trim();
  const precio = parseFloat(document.getElementById('prod-precio').value);
  const costo = parseFloat(document.getElementById('prod-costo').value) || 0;
  const stock = parseInt(document.getElementById('prod-stock').value) || 0;

  if (!codigo || !nombre || isNaN(precio)) {
    alert('Por favor completa los campos obligatorios: Código, Nombre y Precio.');
    return;
  }

  if (productoSeleccionadoIndex >= 0) {
    // Editar producto existente
    productos[productoSeleccionadoIndex] = {
      ...productos[productoSeleccionadoIndex],
      codigo,
      nombre,
      precio,
      costo,
      stock
    };
    alert('Producto actualizado con éxito');
  } else {
    // Crear nuevo producto
    const nuevoProducto = {
      id: Date.now(),
      codigo,
      nombre,
      precio,
      costo,
      stock
    };
    productos.push(nuevoProducto);
    alert('Producto agregado con éxito');
  }

  guardarLocalStorage();
  limpiarFormularioProducto();
  actualizarTablaProductos();
}

function actualizarTablaProductos() {
  const tbody = document.getElementById('productos-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  productos.forEach((prod, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="p-2 font-mono">${prod.codigo}</td>
      <td class="p-2 font-medium">${prod.nombre}</td>
      <td class="p-2 text-right">$${prod.precio.toFixed(2)}</td>
      <td class="p-2 text-right">${prod.stock}</td>
      <td class="p-2 text-center space-x-2">
        <button onclick="editarProducto(${index})" class="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600">✏️ Editar</button>
        <button onclick="eliminarProducto(${index})" class="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700">🗑️ Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function editarProducto(index) {
  const prod = productos[index];
  productoSeleccionadoIndex = index;

  document.getElementById('prod-codigo').value = prod.codigo;
  document.getElementById('prod-nombre').value = prod.nombre;
  document.getElementById('prod-precio').value = prod.precio;
  document.getElementById('prod-costo').value = prod.costo || 0;
  document.getElementById('prod-stock').value = prod.stock || 0;

  const btnSubmit = document.getElementById('btn-guardar-producto');
  if (btnSubmit) btnSubmit.innerText = 'Actualizar Producto';
}

function eliminarProducto(index) {
  if (confirm(`¿Estás seguro de eliminar el producto "${productos[index].nombre}"?`)) {
    productos.splice(index, 1);
    guardarLocalStorage();
    actualizarTablaProductos();
  }
}

function limpiarFormularioProducto() {
  productoSeleccionadoIndex = -1;
  const form = document.getElementById('form-producto');
  if (form) form.reset();

  const btnSubmit = document.getElementById('btn-guardar-producto');
  if (btnSubmit) btnSubmit.innerText = 'Guardar Producto';
}
