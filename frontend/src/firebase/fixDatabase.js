// src/firebase/fixDatabase.js - REPARADOR DE BASE DE DATOS
import syncStorage from "./storage.js";

export const fixFirebaseDatabase = async () => {
  console.log("🛠️  INICIANDO REPARACIÓN DE BASE DE DATOS...");
  
  try {
    // 1. Obtener datos actuales de Firebase
    console.log("📡 Obteniendo datos actuales de Firebase...");
    const currentData = await syncStorage.getItem("orders");
    
    console.log("📊 DATOS ACTUALES EN FIREBASE:");
    console.log("Tipo:", typeof currentData);
    console.log("Es array?", Array.isArray(currentData));
    console.log("Es objeto?", currentData && typeof currentData === 'object' && !Array.isArray(currentData));
    
    if (currentData) {
      console.log("Contenido:", currentData);
      console.log("Claves existentes:", Object.keys(currentData));
    }
    
    // 2. Crear estructura CORRECTA de 15 mesas
    console.log("🔧 Creando estructura correcta de 15 mesas...");
    
    const todasLasMesas = {};
    
    for (let i = 0; i < 15; i++) {
      // Verificar si esta mesa ya existe en los datos actuales
      const mesaExistente = currentData && (
        currentData[i] || 
        currentData[i.toString()] ||
        (Array.isArray(currentData) && currentData[i])
      );
      
      if (mesaExistente && typeof mesaExistente === 'object') {
        // 🔥 PRESERVAR DATOS EXISTENTES (mesas 4 y 5)
        console.log(`💾 Preservando Mesa ${i}:`, mesaExistente);
        todasLasMesas[i] = {
          items: mesaExistente.items || [],
          estado: mesaExistente.estado || "vacia",
          tipo: mesaExistente.tipo || (i >= 10 ? "domicilio" : "mesa"),
          domicilio: mesaExistente.domicilio || 0,
          pedidoNumero: mesaExistente.pedidoNumero || 0,
          timestamp: mesaExistente.timestamp || Date.now()
        };
      } else {
        // 🔥 CREAR MESA VACÍA para las que no existen
        console.log(`➕ Creando Mesa ${i} vacía`);
        todasLasMesas[i] = {
          items: [],
          estado: "vacia",
          tipo: i >= 10 ? "domicilio" : "mesa",
          domicilio: 0,
          pedidoNumero: 0,
          timestamp: Date.now()
        };
      }
    }
    
    // 3. Mostrar resumen
    console.log("📋 RESUMEN DE REPARACIÓN:");
    console.log("Total mesas creadas:", Object.keys(todasLasMesas).length);
    
    // Contar mesas con datos
    const mesasConDatos = Object.values(todasLasMesas).filter(mesa => 
      mesa.items && mesa.items.length > 0
    ).length;
    console.log("Mesas con datos:", mesasConDatos);
    
    // 4. Guardar en Firebase
    console.log("💾 Guardando en Firebase...");
    await syncStorage.setItem("orders", todasLasMesas);
    
    console.log("✅ REPARACIÓN COMPLETADA!");
    console.log("Nueva estructura:", todasLasMesas);
    
    return {
      success: true,
      message: `✅ Base de datos reparada. ${mesasConDatos} mesas con datos preservadas.`,
      data: todasLasMesas
    };
    
  } catch (error) {
    console.error("❌ ERROR EN REPARACIÓN:", error);
    return {
      success: false,
      message: `❌ Error: ${error.message}`
    };
  }
};

// Función para verificar el estado
export const checkDatabaseStatus = async () => {
  try {
    const data = await syncStorage.getItem("orders");
    
    return {
      existeDatos: !!data,
      tipo: typeof data,
      esArray: Array.isArray(data),
      esObjeto: data && typeof data === 'object' && !Array.isArray(data),
      totalMesas: data ? Object.keys(data).length : 0,
      mesasConItems: data ? Object.values(data).filter(mesa => 
        mesa && mesa.items && mesa.items.length > 0
      ).length : 0,
      estructura: data
    };
  } catch (error) {
    return {
      error: error.message
    };
  }
};