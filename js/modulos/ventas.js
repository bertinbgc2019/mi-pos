function agregarAlCarrito(producto) {
  // Se busca si el producto ya está en el carrito
  const existe = carrito.find(item => item.codigo === producto.codigo);

  if (existe) {
    existe.cantidad++;
  } else {
    carrito.push({
      id: producto.id,
      codigo: producto.codigo, // Asigna el código real (e.g. 750123456)
      nombre: producto.nombre, // Asigna la descripción (e.g. Hals Menta)
      precio: producto.precio,
      cantidad: 1
    });
  }

  actualizarTablaCarrito();
}
