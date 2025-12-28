// src/firebase/storage.js - VERSIÓN CORREGIDA CON PATRÓN SINGLETON
import { ref, set, get, onValue, off } from "firebase/database";
import { signInAnonymously } from "firebase/auth";

// 🔥 🔥 🔥 IMPORTAR DESDE EL ARCHIVO CENTRAL 🔥 🔥 🔥
import { getFirebaseDatabase, getFirebaseAuth } from "./firebase.js";

// 🔥 CONTROL DE LISTENERS
const listeners = new Map();

class SyncStorage {
  constructor() {
    this.syncEnabled = true;
    this.isAuthenticated = false;
    this.userId = null;
    this.initialized = false;
    this.database = null;
    this.auth = null;
  }

  // 🔥 INICIALIZACIÓN LAZY (SOLO CUANDO SE NECESITA)
  async initialize() {
    if (this.initialized) return true;
    
    console.log("🔄 SyncStorage inicializando...");
    
    try {
      // 🔥 OBTENER INSTANCIAS DE FIREBASE DE MANERA SEGURA
      this.auth = getFirebaseAuth();
      this.database = getFirebaseDatabase();
      
      if (!this.auth || !this.database) {
        throw new Error("Firebase no está disponible");
      }
      
      const userCredential = await signInAnonymously(this.auth);
      this.userId = userCredential.user.uid;
      this.isAuthenticated = true;
      this.initialized = true;
      
      console.log("✅ SyncStorage conectado - User ID:", this.userId);
      return true;
    } catch (error) {
      console.warn("⚠️ Modo offline - Usando localStorage:", error.message);
      this.syncEnabled = false;
      this.initialized = true;
      return false;
    }
  }

  // 🔥 CONVERTIR ARRAY A OBJETO (para Firebase)
  _arrayToObject(arrayData) {
    if (!Array.isArray(arrayData)) return arrayData;
    
    const obj = {};
    arrayData.forEach((item, index) => {
      if (item !== undefined && item !== null) {
        obj[index] = item;
      }
    });
    return obj;
  }

  // 🔥 CONVERTIR OBJETO A ARRAY (desde Firebase)
  _objectToArray(objData) {
    if (!objData || typeof objData !== 'object') return objData || [];
    if (Array.isArray(objData)) return objData;
    
    const keys = Object.keys(objData).filter(key => !isNaN(Number(key)));
    if (keys.length > 0) {
      const maxIndex = Math.max(...keys.map(Number));
      const array = new Array(maxIndex + 1);
      
      keys.forEach(key => {
        array[Number(key)] = objData[key];
      });
      return array.filter(item => item !== undefined);
    }
    
    return objData;
  }

  // 🔥 GUARDAR DATOS
  async setItem(key, value) {
    // 1. Siempre guardar en localStorage
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`❌ Error guardando en localStorage (${key}):`, e.message);
    }
    
    // 2. Sincronizar con Firebase si está habilitado
    if (this.syncEnabled) {
      const authSuccess = await this.initialize();
      if (authSuccess && this.database) {
        try {
          const firebaseValue = this._arrayToObject(value);
          await set(ref(this.database, key), firebaseValue);
          console.log(`💾 Firebase: ${key} guardado`);
          return true;
        } catch (error) {
          console.warn(`📴 Falló Firebase (${key}), usando localStorage:`, error.message);
          this.syncEnabled = false;
        }
      }
    }
    return true;
  }

  // 🔥 OBTENER DATOS
  async getItem(key) {
    // 1. Intentar desde Firebase si está habilitado
    if (this.syncEnabled) {
      const authSuccess = await this.initialize();
      if (authSuccess && this.database) {
        try {
          const snapshot = await get(ref(this.database, key));
          if (snapshot.exists()) {
            const data = snapshot.val();
            const convertedData = this._objectToArray(data);
            
            localStorage.setItem(key, JSON.stringify(convertedData));
            console.log(`📦 Firebase: ${key} obtenido`);
            return convertedData;
          }
        } catch (error) {
          console.warn(`📴 Error Firebase (${key}):`, error.message);
        }
      }
    }
    
    // 2. Fallback a localStorage
    const localData = localStorage.getItem(key);
    if (localData) {
      try {
        return JSON.parse(localData);
      } catch (error) {
        console.error(`❌ Error parseando localStorage (${key}):`, error);
      }
    }
    
    return null;
  }

  // 🔥 SINCRONIZAR EN TIEMPO REAL
  syncItem(key, callback) {
    // Configurar inmediatamente el callback con datos locales
    const localData = localStorage.getItem(key);
    if (localData) {
      try {
        callback(JSON.parse(localData));
      } catch (error) {
        callback(null);
      }
    }
    
    if (!this.syncEnabled || !this.database) {
      console.log(`🔇 Sync offline para: ${key}`);
      return () => {};
    }
    
    // Autenticar y configurar listener en tiempo real
    this.initialize().then(authSuccess => {
      if (!authSuccess) {
        console.log(`🔇 No autenticado: ${key}`);
        return;
      }
      
      const dbRef = ref(this.database, key);
      
      const handleValueChange = (snapshot) => {
        if (!snapshot.exists()) {
          console.log(`📭 No hay datos en Firebase para: ${key}`);
          return;
        }
        
        const data = snapshot.val();
        console.log(`📡 Cambio en tiempo real (${key}) desde otro dispositivo`);
        
        const convertedData = this._objectToArray(data);
        localStorage.setItem(key, JSON.stringify(convertedData));
        
        if (callback && typeof callback === 'function') {
          console.log(`🔄 Actualizando UI con datos de: ${key}`);
          callback(convertedData);
        }
      };
      
      onValue(dbRef, handleValueChange);
      listeners.set(key, { ref: dbRef, handler: handleValueChange });
      console.log(`👂 Escuchando cambios en: ${key}`);
    }).catch(error => {
      console.warn(`⚠️ Error configurando sync para ${key}:`, error.message);
    });
    
    // Función para detener el listener
    return () => {
      if (listeners.has(key)) {
        const listener = listeners.get(key);
        off(listener.ref, 'value', listener.handler);
        listeners.delete(key);
        console.log(`🔇 Listener detenido: ${key}`);
      }
    };
  }

  // 🔥 DETENER ESCUCHA
  stopSync(key) {
    if (listeners.has(key)) {
      const listener = listeners.get(key);
      off(listener.ref, 'value', listener.handler);
      listeners.delete(key);
      console.log(`🔇 Listener detenido manualmente: ${key}`);
    }
  }

  // 🔥 OBTENER ESTADO
  async getStatus() {
    await this.initialize();
    return {
      connected: this.isAuthenticated,
      userId: this.userId,
      syncEnabled: this.syncEnabled,
      device: window.innerWidth < 768 ? '📱 Celular' : '🖥️ PC'
    };
  }
}

// 🔥 INSTANCIA GLOBAL - CORREGIDO: eliminar "const" y dejar solo la instancia
const syncStorage = new SyncStorage();

// Auto-inicializar (perezosa)
setTimeout(() => {
  syncStorage.initialize().then(success => {
    if (success) {
      console.log("🚀 SyncStorage operativo con Firebase");
    } else {
      console.log("📴 SyncStorage en modo offline (solo localStorage)");
    }
  }).catch(error => {
    console.error("❌ Error crítico en SyncStorage:", error);
  });
}, 1000);

export default syncStorage;