// frontend/src/data/products.js - ARCHIVO COMPLETO CON 80 PRODUCTOS
const products = [
  // ==================== PERROS CALIENTES (11) ====================
  { id: 1, nombre: "Perro Mini", precio: 3500, categoria: "Perros calientes" },
  { id: 2, nombre: "Perro Sencillo", precio: 9000, categoria: "Perros calientes" },
  { id: 3, nombre: "Perro Doble Salchicha", precio: 13000, categoria: "Perros calientes" },
  { id: 4, nombre: "Choriperro", precio: 13000, categoria: "Perros calientes" },
  { id: 5, nombre: "Butiperro", precio: 13000, categoria: "Perros calientes" },
  { id: 6, nombre: "Ranchero", precio: 15000, categoria: "Perros calientes" },
  { id: 7, nombre: "Perra Sencilla", precio: 12000, categoria: "Perros calientes" },
  { id: 8, nombre: "Medio Suizo", precio: 12000, categoria: "Perros calientes" },
  { id: 9, nombre: "Suizo", precio: 15000, categoria: "Perros calientes" },
  { id: 10, nombre: "Super Perro Sencillo", precio: 12000, categoria: "Perros calientes" },
  { id: 11, nombre: "La Perrada de Piter", precio: 24000, categoria: "Perros calientes" },
  
  // ==================== HAMBURGUESAS (4) ====================
  { id: 12, nombre: "Hamburguesa Mini", precio: 6000, categoria: "Hamburguesas" },
  { id: 13, nombre: "Hamburguesa Sencilla", precio: 12000, categoria: "Hamburguesas" },
  { id: 14, nombre: "Hamburguesa Doble Carne", precio: 17000, categoria: "Hamburguesas" },
  { id: 15, nombre: "Hamburguesa La Perrada de Piter", precio: 22000, categoria: "Hamburguesas" },

  // ==================== SUIZOS (5) ====================
  { id: 16, nombre: "Mini Suizo al Vapor", precio: 11000, categoria: "Suizos" },
  { id: 17, nombre: "Mini Suizo a la Francesa", precio: 13000, categoria: "Suizos" },
  { id: 18, nombre: "Suizo al Vapor", precio: 17000, categoria: "Suizos" },
  { id: 19, nombre: "Suizo a la Francesa", precio: 19000, categoria: "Suizos" },
  { id: 20, nombre: "Suizo La Perrada de Piter", precio: 25000, categoria: "Suizos" },

  // ==================== SALCHIPAPA (6) ====================
  { id: 21, nombre: "Salchipapa Mini", precio: 9000, categoria: "Salchipapa" },
  { id: 22, nombre: "Salchipapa Sencilla", precio: 14000, categoria: "Salchipapa" },
  { id: 23, nombre: "Salchipapa Mixta", precio: 18000, categoria: "Salchipapa" },
  { id: 24, nombre: "Salchipapa Especial", precio: 21000, categoria: "Salchipapa" },
  { id: 25, nombre: "Salchipapa Doble", precio: 25000, categoria: "Salchipapa" },
  { id: 26, nombre: "Salchipapa La Perrada de Piter", precio: 35000, categoria: "Salchipapa" },

  // ==================== PICADAS (10) ====================
  { id: 27, nombre: "Picada Sencilla al Vapor", precio: 17000, categoria: "Picadas" },
  { id: 28, nombre: "Picada Sencilla a la Francesa", precio: 19000, categoria: "Picadas" },
  { id: 29, nombre: "Picada Res al Vapor", precio: 18000, categoria: "Picadas" },
  { id: 30, nombre: "Picada Res a la Francesa", precio: 20000, categoria: "Picadas" },
  { id: 31, nombre: "Picada Pollo al Vapor", precio: 18000, categoria: "Picadas" },
  { id: 32, nombre: "Picada Pollo a la Francesa", precio: 20000, categoria: "Picadas" },
  { id: 33, nombre: "Picada Res y Pollo", precio: 25000, categoria: "Picadas" },
  { id: 34, nombre: "Picada para 2 Personas", precio: 30000, categoria: "Picadas" },
  { id: 35, nombre: "Picada para 3 Personas", precio: 45000, categoria: "Picadas" },
  { id: 36, nombre: "Picada para 4 Personas", precio: 60000, categoria: "Picadas" },

  // ==================== AREPAS SENCILLAS (4) ====================
  { id: 37, nombre: "Arepa de Queso", precio: 5000, categoria: "Arepas sencillas" },
  { id: 38, nombre: "Arepa de Jamón", precio: 5000, categoria: "Arepas sencillas" },
  { id: 39, nombre: "Arepa de Jamón y Queso", precio: 6000, categoria: "Arepas sencillas" },
  { id: 40, nombre: "Arepa de Butifarra", precio: 7000, categoria: "Arepas sencillas" },

  // ==================== AREPAS TÍPICAS (6) ====================
  { id: 41, nombre: "Arepa de Pollo Desmechado", precio: 11000, categoria: "Arepas típicas" },
  { id: 42, nombre: "Arepa de Carne Desmechada", precio: 11000, categoria: "Arepas típicas" },
  { id: 43, nombre: "Arepa de Carne de Hamburguesa", precio: 11000, categoria: "Arepas típicas" },
  { id: 44, nombre: "Arepa Suiza", precio: 10000, categoria: "Arepas típicas" },
  { id: 45, nombre: "Arepa de Chorizo", precio: 10000, categoria: "Arepas típicas" },
  { id: 46, nombre: "Arepa Ranchera", precio: 10000, categoria: "Arepas típicas" },

  // ==================== AREPAS TRIFÁSICAS (2) ====================
  { id: 47, nombre: "Arepa de Pollo y Carne y Suiza", precio: 15000, categoria: "Arepas trifásicas" },
  { id: 48, nombre: "Arepa de Carne Hamburguesa y Chorizo y Butifarra", precio: 15000, categoria: "Arepas trifásicas" },

  // ==================== AREPAS DOBLES (18) ====================
  { id: 49, nombre: "Arepa de Pollo y Carne Desmechada", precio: 13000, categoria: "Arepas dobles" },
  { id: 50, nombre: "Arepa de Pollo y Carne de Hamburguesa", precio: 13000, categoria: "Arepas dobles" },
  { id: 51, nombre: "Arepa de Pollo y Suiza", precio: 13000, categoria: "Arepas dobles" },
  { id: 52, nombre: "Arepa de Pollo y Chorizo", precio: 13000, categoria: "Arepas dobles" },
  { id: 53, nombre: "Arepa de Pollo y Ranchera", precio: 13000, categoria: "Arepas dobles" },
  { id: 54, nombre: "Arepa de Pollo y Butifarra", precio: 13000, categoria: "Arepas dobles" },
  { id: 55, nombre: "Arepa de Carne y Carne de Hamburguesa", precio: 13000, categoria: "Arepas dobles" },
  { id: 56, nombre: "Arepa de Carne y Suiza", precio: 13000, categoria: "Arepas dobles" },
  { id: 57, nombre: "Arepa de Carne y Chorizo", precio: 13000, categoria: "Arepas dobles" },
  { id: 58, nombre: "Arepa de Carne y Ranchera", precio: 13000, categoria: "Arepas dobles" },
  { id: 59, nombre: "Arepa de Carne y Butifarra", precio: 13000, categoria: "Arepas dobles" },
  { id: 60, nombre: "Arepa Suiza y Butifarra", precio: 13000, categoria: "Arepas dobles" },
  { id: 61, nombre: "Arepa Suiza y Chorizo", precio: 13000, categoria: "Arepas dobles" },
  { id: 62, nombre: "Arepa Suiza y Ranchera", precio: 13000, categoria: "Arepas dobles" },
  { id: 63, nombre: "Arepa Suiza y Carne de Hamburguesa", precio: 13000, categoria: "Arepas dobles" },
  { id: 64, nombre: "Arepa de Chorizo y Butifarra", precio: 13000, categoria: "Arepas dobles" },
  { id: 65, nombre: "Arepa de Chorizo y Ranchera", precio: 13000, categoria: "Arepas dobles" },
  { id: 66, nombre: "Arepa de Chorizo y Carne de Hamburguesa", precio: 13000, categoria: "Arepas dobles" },

  // ==================== BEBIDAS (8) ====================
  { id: 67, nombre: "Gaseosa Personal", precio: 2500, categoria: "Bebidas" },
  { id: 68, nombre: "Agua", precio: 2500, categoria: "Bebidas" },
  { id: 69, nombre: "Agua Saborizada", precio: 3000, categoria: "Bebidas" },
  { id: 70, nombre: "Jugo del Valle", precio: 3000, categoria: "Bebidas" },
  { id: 71, nombre: "Gaseosa Plástica 400ml", precio: 4000, categoria: "Bebidas" },
  { id: 72, nombre: "Gaseosa 1L", precio: 5500, categoria: "Bebidas" },
  { id: 73, nombre: "Gaseosa 1.5L", precio: 9000, categoria: "Bebidas" },
  { id: 74, nombre: "Gaseosa 2.5L", precio: 13000, categoria: "Bebidas" },

  // ==================== ADICIONES (3) ====================
  { id: 75, nombre: "Queso Gratinado", precio: 5000, categoria: "Adiciones" },
  { id: 76, nombre: "Butifarra", precio: 3500, categoria: "Adiciones" },
  { id: 77, nombre: "Papa Francesa", precio: 5000, categoria: "Adiciones" },

  // ==================== COMBOS (3) ====================
  { id: 78, nombre: "Combo Hamburguesa Mini + Papas", precio: 9000, categoria: "Combos" },
  { id: 79, nombre: "Combo Hamburguesa Sencilla + Papas", precio: 15000, categoria: "Combos" },
  { id: 80, nombre: "Combo Hamburguesa Doble Carne + Papas", precio: 20000, categoria: "Combos" }
];

export default products;