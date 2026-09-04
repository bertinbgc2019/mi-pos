// --- ESTADO DE LA APLICACIÓN ---
let productos = JSON.parse(localStorage.getItem('productos')) || [];
let ventas = JSON.parse(localStorage.getItem('ventas')) || [];
let carrito = [];

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
  renderInventario();
  renderProductosVenta();
  inicializarEventosBackup();
});

// --- NAVEGACIÓN DE PESTAÑAS ---
function cambiarPestana(tabId, element) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
  
  document.getElementById(tabId).classList.add('active');
  element.classList.add('active');
}

// --- GESTIÓN DE INVENTARIO ---
function renderInventario() {
  const tbody = document.getElementById('tablaInventario');
  tbody.innerHTML = '';

  productos.forEach((prod, index) => {
    tbody.innerHTML += `
      <tr>
        <td>${prod.codigo}</td>
        <td>${prod.nombre}</td>
        <td>$${parseFloat(prod.precio).toFixed(2)}</td>
        <td>${prod.stock}</td>
        <td>
          <button class="btn btn-sm btn-warning me-1" onclick="editarProducto(${index})"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${index})"><i class="bi bi-trash"></i></button>
        </td>
      </tr>
    `;
  });
}

function guardarProducto(e) {
  e.preventDefault();
  const index = document.getElementById('prodIndex').value;
  const codigo = document.getElementById('prodCodigo').value.trim();
  const nombre = document.getElementById('prodNombre').value.trim();
  const precio = parseFloat(document.getElementById('prodPrecio').value);
  const stock = parseInt(document.getElementById('prodStock').value);

  const nuevoProd = { codigo, nombre, precio, stock };

  if (index === '') {
    productos.push(nuevoProd);
  } else {
    productos[index] = nuevoProd;
    document.getElementById('prodIndex').value = '';
  }

  guardarLocalStorage();
  document.getElementById('formProducto').reset();
  renderInventario();
  renderProductosVenta();
}

function editarProducto(index) {
  const prod = productos[index];
  document.getElementById('prodIndex').value = index;
  document.getElementById('prodCodigo').value = prod.codigo;
  document.getElementById('prodNombre').value = prod.nombre;
  document.getElementById('prodPrecio').value = prod.precio;
  document.getElementById('prodStock').value = prod.stock;
}

function eliminarProducto(index) {
  if (confirm('¿Deseas eliminar este producto?')) {
    productos.splice(index, 1);
    guardarLocalStorage();
    renderInventario();
    renderProductosVenta();
  }
}

// --- GESTIÓN DE VENTAS ---
function renderProductosVenta() {
  const tbody = document.getElementById('tablaProductosVenta');
  tbody.innerHTML = '';

  productos.forEach((prod) => {
    tbody.innerHTML += `
      <tr>
        <td>${prod.codigo}</td>
        <td>${prod.nombre}</td>
        <td>$${parseFloat(prod.precio).toFixed(2)}</td>
        <td>${prod.stock}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="agregarAlCarrito('${prod.codigo}')" ${prod.stock <= 0 ? 'disabled' : ''}>
            <i class="bi bi-plus-lg"></i>
          </button>
        </td>
      </tr>
    `;
  });
}

function agregarAlCarrito(codigo) {
  const prod = productos.find(p => p.codigo === codigo);
  if (!prod) return;

  const itemCarrito = carrito.find(item => item.codigo === codigo);

  if (itemCarrito) {
    if (itemCarrito.cantidad < prod.stock) {
      itemCarrito.cantidad++;
    } else {
      alert('Stock insuficiente.');
      return;
    }
  } else {
    carrito.push({
      codigo: prod.codigo,
      nombre: prod.nombre,
      precio: prod.precio,
      cantidad: 1
    });
  }

  renderCarrito();
}

function renderCarrito() {
  const tbody = document.getElementById('tablaCarrito');
  tbody.innerHTML = '';
  let total = 0;

  carrito.forEach((item, index) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    tbody.innerHTML += `
      <tr>
        <td>${item.nombre}</td>
        <td>${item.cantidad}</td>
        <td>$${subtotal.toFixed(2)}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="quitarDelCarrito(${index})"><i class="bi bi-x"></i></button>
        </td>
      </tr>
    `;
  });

  document.getElementById('totalVenta').innerText = total.toFixed(2);
}

function quitarDelCarrito(index) {
  carrito.splice(index, 1);
  renderCarrito();
}

function finalizarVenta() {
  if (carrito.length === 0) {
    alert('El carrito está vacío.');
    return;
  }

  // Actualizar Stock
  carrito.forEach(item => {
    const prod = productos.find(p => p.codigo === item.codigo);
    if (prod) {
      prod.stock -= item.cantidad;
    }
  });

  // Guardar Venta
  const venta = {
    fecha: new Date().toISOString(),
    items: [...carrito],
    total: parseFloat(document.getElementById('totalVenta').innerText)
  };

  ventas.push(venta);
  guardarLocalStorage();

  // Limpiar
  carrito = [];
  renderCarrito();
  renderInventario();
  renderProductosVenta();

  alert('¡Venta completada con éxito!');
}

function guardarLocalStorage() {
  localStorage.setItem('productos', JSON.stringify(productos));
  localStorage.setItem('ventas', JSON.stringify(ventas));
}

// --- COPIA DE SEGURIDAD (EXPORTAR / IMPORTAR) ---
function inicializarEventosBackup() {
  
  // 1. Exportar Respaldo
  document.getElementById('btnExportar').addEventListener('click', () => {
    if (productos.length === 0 && ventas.length === 0) {
      alert('No hay datos registrados para exportar.');
      return;
    }

    const backupData = {
      productos: JSON.parse(localStorage.getItem('productos')) || [],
      ventas: JSON.parse(localStorage.getItem('ventas')) || [],
      fechaRespaldo: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    const fecha = new Date().toISOString().split('T')[0];

    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `respaldo_pos_${fecha}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  // 2. Importar Respaldo
  document.getElementById('inputImportar').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);

        if (data.productos || data.ventas) {
          const confirmar = confirm('¿Estás seguro de restaurar este respaldo? Los datos actuales serán reemplazados.');
          
          if (confirmar) {
            if (data.productos) localStorage.setItem('productos', JSON.stringify(data.productos));
            if (data.ventas) localStorage.setItem('ventas', JSON.stringify(data.ventas));
            
            alert('¡Base de datos restaurada correctamente!');
            location.reload(); // Recarga para actualizar arreglos y vistas
          }
        } else {
          alert('El archivo seleccionado no tiene la estructura de respaldo válida.');
        }
      } catch (err) {
        alert('Error al procesar el archivo. Asegúrate de que sea un JSON válido.');
      }
    };

    reader.readAsText(file);
  });
}
