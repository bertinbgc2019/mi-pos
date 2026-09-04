// js/config.js - Estado Global y LocalStorage

let productos = JSON.parse(localStorage.getItem('pos_productos')) || [];
let ventas = JSON.parse(localStorage.getItem('pos_ventas')) || [];
let clientes = JSON.parse(localStorage.getItem('pos_clientes')) || [];
let carrito = [];
let productoSeleccionadoIndex = -1;

function guardarLocalStorage() {
  localStorage.setItem('pos_productos', JSON.stringify(productos));
  localStorage.setItem('pos_ventas', JSON.stringify(ventas));
  localStorage.setItem('pos_clientes', JSON.stringify(clientes));
}
