// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// ¡CONFIGURACIÓN DE TU FIREBASE!
const firebaseConfig = {
  apiKey: "AIzaSyBqVcWCV0XCchtHduTy28pE7QfA6FfhL0A",
  authDomain: "laperradadepiterpos-web-sync.firebaseapp.com",
  databaseURL: "https://laperradadepiterpos-web-sync-default-rtdb.firebaseio.com",
  projectId: "laperradadepiterpos-web-sync",
  storageBucket: "laperradadepiterpos-web-sync.firebasestorage.app",
  messagingSenderId: "1089594532212",
  appId: "1:1089594532212:web:2ccec6d80811ad18d08c21"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener servicios
const database = getDatabase(app);
const auth = getAuth(app);

// Exportar
export { database, auth };