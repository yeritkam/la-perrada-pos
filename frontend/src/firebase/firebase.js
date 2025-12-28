// src/firebase/firebase.js - ARCHIVO CENTRAL DE CONFIGURACIÓN FIREBASE
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// 🔥 CONFIGURACIÓN DE FIREBASE (ÚNICA PARA TODO EL SISTEMA)
const firebaseConfig = {
  apiKey: "AIzaSyBqVcWCV0XCchtHduTy28pE7QfA6FfhL0A",
  authDomain: "laperradadepiterpos-web-sync.firebaseapp.com",
  databaseURL: "https://laperradadepiterpos-web-sync-default-rtdb.firebaseio.com",
  projectId: "laperradadepiterpos-web-sync",
  storageBucket: "laperradadepiterpos-web-sync.firebasestorage.app",
  messagingSenderId: "1089594532212",
  appId: "1:1089594532212:web:2ccec6d80811ad18d08c21"
};

// 🔥 PATRÓN SINGLETON: Inicializar una sola vez
let appInstance = null;
let databaseInstance = null;
let authInstance = null;

// 🔥 Función para obtener la instancia de Firebase App
export const getFirebaseApp = () => {
  if (!appInstance) {
    console.log("🔥 Inicializando Firebase App...");
    appInstance = initializeApp(firebaseConfig);
    console.log("✅ Firebase App inicializada");
  }
  return appInstance;
};

// 🔥 Función para obtener la instancia de Database
export const getFirebaseDatabase = () => {
  if (!databaseInstance) {
    console.log("🔥 Inicializando Firebase Database...");
    databaseInstance = getDatabase(getFirebaseApp());
    console.log("✅ Firebase Database inicializada");
  }
  return databaseInstance;
};

// 🔥 Función para obtener la instancia de Auth
export const getFirebaseAuth = () => {
  if (!authInstance) {
    console.log("🔥 Inicializando Firebase Auth...");
    authInstance = getAuth(getFirebaseApp());
    console.log("✅ Firebase Auth inicializada");
  }
  return authInstance;
};

// 🔥 Inicializar automáticamente (opcional, puede ser lazy)
export const initializeFirebase = () => {
  try {
    getFirebaseApp();
    getFirebaseDatabase();
    getFirebaseAuth();
    console.log("🚀 Firebase completamente inicializado");
    return true;
  } catch (error) {
    console.error("❌ Error inicializando Firebase:", error);
    return false;
  }
};

// 🔥 Exportar funciones para uso directo
export default {
  getFirebaseApp,
  getFirebaseDatabase,
  getFirebaseAuth,
  initializeFirebase
};