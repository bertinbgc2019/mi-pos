// ==========================================
// MÓDULO ESPECIAL DE COBRO
// ==========================================

const ModuloCobro = {
  modal: null,
  inputPaga: null,
  totalTexto: null,
  cambioTexto: null,

  init() {
    this.modal = document.getElementById('modulo-cobro-modal');
    this.inputPaga = document.getElementById('cobro-input-paga');
    this.totalTexto = document.getElementById('cobro-total-texto');
    this.cambioTexto = document.getElementById('cobro-cambio-texto');

    // Asignar eventos de botones
    const btnAccion = document.getElementById('btn-cobrar-accion');
    if (btnAccion) {
      btnAccion.onclick = () => this.abrir();
    }

    const btnCerrar = document.getElementById('btn-cerrar-cobro');
    if (btnCerrar) btnCerrar.onclick = () => this.cerrar();

    const btnCancelar = document.getElementById('btn-cancelar-cobro');
    if (btnCancelar) btnCancelar.onclick = () => this.cerrar();

    const btnConfirmar = document.getElementById('btn-confirmar-cobro');
    if (btnConfirmar) btnConfirmar.onclick = () => this.procesar();

    // Evento de entrada de dinero
    if (this.inputPaga) {
      this.inputPaga.oninput = () => this.calcular();
      this.inputPaga.onkeydown = (e) => {
        if (e.key === 'Enter') this.procesar();
      };
    }

    // Listener de Teclado Global para F12
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        this.abrir();
      }
    });
  },

  obtenerTotal() {
    if (typeof carrito === 'undefined' || !Array.isArray(carrito)) return 0;
    return carrito.reduce((acc, item) => acc + (parseFloat(item.precio || 0) * parseInt(item.cantidad || 0)), 0);
  },

  abrir() {
    const total = this.obtenerTotal();
    if (total <= 0) {
      alert("El carrito está vacío. Agrega al menos un producto para cobrar.");
      return;
    }

    if (this.totalTexto) this.totalTexto.innerText = `$ ${total.toFixed(2)}`;
    if (this.inputPaga) this.inputPaga.value = '';
    if (this.cambioTexto) {
      this.cambioTexto.innerText = '$ 0.00';
      this.cambioTexto.className = "text-3xl font-bold text-green-600";
    }

    if (this.modal) {
      this.modal.classList.remove('hidden');
      setTimeout(() => {
        if (this.inputPaga) this.inputPaga.focus();
      }, 100);
    }
  },

  cerrar() {
    if (this.modal) this.modal.classList.add('hidden');
  },

  calcular() {
    const total = this.obtenerTotal();
    const paga = parseFloat(this.inputPaga ? this.inputPaga.value : 0) || 0;
    const cambio = paga - total;

    if (this.cambioTexto) {
      if (cambio >= 0) {
        this.cambioTexto.innerText = `$ ${cambio.toFixed(2)}`;
        this.cambioTexto.className = "text-3xl font-bold text-green-600";
      } else {
        this.cambioTexto.innerText = `Faltan $ ${Math.abs(cambio).toFixed(2)}`;
        this.cambioTexto.className = "text-3xl font-bold text-red-600";
      }
    }
  },

  procesar() {
    const total = this.obtenerTotal();
    const paga = parseFloat(this.inputPaga ? this.inputPaga.value : 0) || 0;

    if (paga < total) {
      alert("El monto pagado es menor al total a cobrar.");
      return;
    }

    const cambio = paga - total;
    alert(`¡Venta procesada con éxito!\n\nTotal: $${total.toFixed(2)}\nPaga con: $${paga.toFixed(2)}\nCambio: $${cambio.toFixed(2)}`);

    // Actualizar inventario local si existe
    let productosCatalog = JSON.parse(localStorage.getItem('gnet_productos')) || [];
    if (Array.isArray(carrito)) {
      carrito.forEach(item => {
        const prod = productosCatalog.find(p => p.codigo === item.codigo);
        if (prod && prod.stock !== undefined) {
          prod.stock = Math.max(0, parseInt(prod.stock) - parseInt(item.cantidad));
        }
      });
      localStorage.setItem('gnet_productos', JSON.stringify(productosCatalog));
    }

    // Vaciar y cerrar
    if (typeof vaciarCarrito === 'function') vaciarCarrito();
    this.cerrar();
  }
};

// Inicializar módulo al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  ModuloCobro.init();
});
