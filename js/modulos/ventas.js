function actualizarTablaCarrito() {
  const tbody = document.getElementById('carrito-body');
  const totalEl = document.getElementById('total-pagar');
  const contadorEl = document.querySelector('.bg-slate-300.px-3.py-1'); // Contador inferior
  if (!tbody) return;

  tbody.innerHTML = '';
  let total = 0;
  let totalArticulos = 0;

  carrito.forEach((item, index) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;
    totalArticulos += item.cantidad;

    // Buscar existencia en el catálogo si está disponible
    const prodCatalogo = productos.find(p => p.id === item.id || p.codigo === item.codigo);
    const existencia = prodCatalogo ? prodCatalogo.stock : '--';

    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-100 border-b border-gray-200 text-black";
    tr.innerHTML = `
      <td class="p-2 font-mono text-gray-700">${item.codigo || '--'}</td>
      <td class="p-2 font-semibold text-gray-900">${item.nombre}</td>
      <td class="p-2 text-right font-mono font-bold">$${item.precio.toFixed(2)}</td>
      <td class="p-2 text-center">
        <input type="number" value="${item.cantidad}" min="1" class="w-14 border border-gray-400 rounded p-0.5 text-center font-mono font-bold" onchange="cambiarCantidadCarrito(${index}, this.value)">
      </td>
      <td class="p-2 text-right font-mono font-bold text-blue-900">$${subtotal.toFixed(2)}</td>
      <td class="p-2 text-center font-mono text-gray-600">${existencia}</td>
    `;
    tbody.appendChild(tr);
  });

  // Actualizar Gran Total
  if (totalEl) totalEl.innerText = `$ ${total.toFixed(2)}`;

  // Actualizar contador de productos al pie de la tabla
  const contadorTabla = document.querySelector('#modulo-ventas .bg-slate-300.text-slate-700');
  if (contadorTabla) {
    contadorTabla.innerText = `${totalArticulos} Productos en la Venta actual`;
  }
}
