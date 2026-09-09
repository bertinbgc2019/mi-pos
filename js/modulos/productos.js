let productos = JSON.parse(localStorage.getItem('gnet_productos')) || [];

function guardarProducto(e) {
  e.preventDefault();

  const codigoInput = document.getElementById('prod-codigo').value.trim();
  const nombreInput = document.getElementById('prod-nombre').value.trim();
  const precioInput = parseFloat(document.getElementById('prod-precio').value) || 0;
  const stockInput = parseInt(document.getElementById('prod-stock').value) || 0;
  const deptoInput = document.getElementById('prod-depto').value;

  if (!codigoInput || !nombreInput) {
    alert("Por favor ingrese el código de barras y la descripción del producto.");
    return;
  }

  // Comprobar si existe para actualizar o crear nuevo
  const indexExistente = productos.findIndex(p => p.codigo === codigoInput);

  const nuevoProducto = {
    id: indexExistente >= 0 ? productos[indexExistente].id : Date.now().toString(),
    codigo: codigoInput, // CÓDIGO DE BARRAS
    nombre: nombreInput, // DESCRIPCIÓN
    precio: precioInput,
    costo: parseFloat(document.getElementById('prod-costo').value) || 0,
    mayoreo: parseFloat(document.getElementById('prod-mayoreo').value) || 0,
    stock: stockInput,
    departamento: deptoInput
  };

  if (indexExistente >= 0) {
    productos[indexExistente] = nuevoProducto;
  } else {
    productos.push(nuevoProducto);
  }

  // Guardar en Storage
  localStorage.setItem('gnet_productos', JSON.stringify(productos));
  alert("Producto guardado correctamente.");
  limpiarFormularioProducto();
}

// Cálculo automático de Margen de Ganancia a Precio Venta
function calcularPrecios() {
  const costo = parseFloat(document.getElementById('prod-costo').value) || 0;
  const ganancia = parseFloat(document.getElementById('prod-ganancia').value) || 0;
  
  if (costo > 0 && ganancia > 0) {
    const precioCalculado = costo + (costo * (ganancia / 100));
    document.getElementById('prod-precio').value = precioCalculado.toFixed(2);
  }
}

function limpiarFormularioProducto() {
  document.getElementById('form-producto').reset();
}
