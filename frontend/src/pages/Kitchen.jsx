import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// ✅ IMPORTA SYNCSTORAGE - ESTO ESTÁ CORRECTO
import syncStorage from "../firebase/storage.js";

export default function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState({});
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        // ✅ OBTENER DATOS DE FIREBASE - VERSIÓN CORREGIDA
        const saved = await syncStorage.getItem("orders");
        
        let completas;
        
        // ✅ MANEJAR DIFERENTES FORMATOS DE DATOS
        if (saved && typeof saved === 'object') {
          if (Array.isArray(saved)) {
            // CASO 1: Firebase devuelve ARRAY
            completas = Array.from({ length: 15 }, (_, i) => {
              return saved[i] || { 
                items: [], 
                estado: "vacia", 
                tipo: i >= 10 ? "domicilio" : "mesa", 
                domicilio: 0,
                pedidoNumero: 0,
                timestamp: Date.now()
              };
            });
          } else {
            // CASO 2: Firebase devuelve OBJETO (lo normal)
            completas = Array.from({ length: 15 }, (_, i) => {
              // Buscar en el objeto usando número o string como key
              const mesaData = saved[i] || saved[i.toString()];
              
              if (mesaData && typeof mesaData === 'object') {
                return {
                  items: mesaData.items || [],
                  estado: mesaData.estado || "vacia",
                  tipo: mesaData.tipo || (i >= 10 ? "domicilio" : "mesa"),
                  domicilio: mesaData.domicilio || 0,
                  pedidoNumero: mesaData.pedidoNumero || 0,
                  timestamp: mesaData.timestamp || Date.now()
                };
              } else {
                return { 
                  items: [], 
                  estado: "vacia", 
                  tipo: i >= 10 ? "domicilio" : "mesa", 
                  domicilio: 0,
                  pedidoNumero: 0,
                  timestamp: Date.now()
                };
              }
            });
          }
        } else {
          // CASO 3: No hay datos en Firebase
          completas = Array.from({ length: 15 }, (_, i) => ({
            items: [], 
            estado: "vacia", 
            tipo: i >= 10 ? "domicilio" : "mesa", 
            domicilio: 0,
            pedidoNumero: 0,
            timestamp: Date.now()
          }));
        }

        // ✅ ASIGNAR NÚMEROS DE PEDIDO (TU LÓGICA ORIGINAL)
        const existingOrderNumbers = new Set();
        completas.forEach(order => {
          if (order.pedidoNumero && order.pedidoNumero > 0) {
            existingOrderNumbers.add(order.pedidoNumero);
          }
        });

        let nextNumber = 1;
        while (existingOrderNumbers.has(nextNumber)) {
          nextNumber++;
        }

        let changed = false;
        const updatedOrders = completas.map(order => {
          if (order.estado === "espera" && order.items?.length > 0 && (!order.pedidoNumero || order.pedidoNumero === 0)) {
            changed = true;
            const newOrder = {
              ...order,
              pedidoNumero: nextNumber,
              timestamp: order.timestamp || Date.now()
            };
            existingOrderNumbers.add(nextNumber);
            nextNumber++;
            return newOrder;
          }
          return order;
        });

        if (changed) {
          // ✅ GUARDAR EN FIREBASE - VERSIÓN CORREGIDA
          // Convertir array a objeto para Firebase
          const firebaseObject = {};
          updatedOrders.forEach((order, index) => {
            firebaseObject[index] = {
              items: order.items || [],
              estado: order.estado || "vacia",
              tipo: order.tipo || (index >= 10 ? "domicilio" : "mesa"),
              domicilio: order.domicilio || 0,
              pedidoNumero: order.pedidoNumero || 0,
              timestamp: order.timestamp || Date.now()
            };
          });
          
          await syncStorage.setItem("orders", firebaseObject);
        }

        setOrders(updatedOrders);
        
      } catch (error) {
        console.error("❌ Error cargando pedidos de Firebase:", error);
        // Fallback a localStorage
        try {
          const saved = localStorage.getItem("orders");
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              setOrders(parsed);
            }
          }
        } catch (localError) {
          console.error("Error fallback a localStorage:", localError);
        }
      }
    };

    loadOrders();
    
    // ✅ SINCRONIZAR EN TIEMPO REAL - VERSIÓN CORREGIDA
    const unsuscribe = syncStorage.syncItem("orders", (newOrders) => {
      if (newOrders !== null && newOrders !== undefined) {
        try {
          let nuevasOrders;
          
          if (Array.isArray(newOrders)) {
            // Firebase devuelve array
            nuevasOrders = Array.from({ length: 15 }, (_, i) => 
              newOrders[i] || { 
                items: [], 
                estado: "vacia", 
                tipo: i >= 10 ? "domicilio" : "mesa", 
                domicilio: 0,
                pedidoNumero: 0,
                timestamp: Date.now()
              }
            );
          } else if (typeof newOrders === 'object') {
            // Firebase devuelve objeto
            nuevasOrders = Array.from({ length: 15 }, (_, i) => {
              const mesaData = newOrders[i] || newOrders[i.toString()];
              
              if (mesaData && typeof mesaData === 'object') {
                return {
                  items: mesaData.items || [],
                  estado: mesaData.estado || "vacia",
                  tipo: mesaData.tipo || (i >= 10 ? "domicilio" : "mesa"),
                  domicilio: mesaData.domicilio || 0,
                  pedidoNumero: mesaData.pedidoNumero || 0,
                  timestamp: mesaData.timestamp || Date.now()
                };
              } else {
                return { 
                  items: [], 
                  estado: "vacia", 
                  tipo: i >= 10 ? "domicilio" : "mesa", 
                  domicilio: 0,
                  pedidoNumero: 0,
                  timestamp: Date.now()
                };
              }
            });
          } else {
            console.warn("Formato de datos inesperado de Firebase:", newOrders);
            return;
          }
          
          setOrders(nuevasOrders);
          // También actualizar localStorage para compatibilidad
          localStorage.setItem("orders", JSON.stringify(nuevasOrders));
          
        } catch (error) {
          console.error("Error procesando datos en tiempo real:", error);
        }
      }
    });
    
    // Mantener el intervalo para actualizar tiempos
    const interval = setInterval(() => {
      loadOrders(); // Recargar cada segundo
    }, 1000);
    
    return () => {
      clearInterval(interval);
      if (unsuscribe && typeof unsuscribe === 'function') {
        unsuscribe();
      }
    };
  }, []);

  useEffect(() => {
    const tiempos = {};
    orders.forEach((mesa, index) => {
      if (mesa.estado === "espera" && mesa.timestamp) {
        const segundos = Math.floor((Date.now() - mesa.timestamp) / 1000);
        const minutos = Math.floor(segundos / 60);
        const segundosRestantes = segundos % 60;
        tiempos[index] = { minutos, segundos: segundosRestantes };
      }
    });
    setTiempoTranscurrido(tiempos);
  }, [orders]);

  const marcarListo = async (index) => {
    try {
      // ✅ OBTENER DATOS ACTUALES DE FIREBASE - VERSIÓN CORREGIDA
      const saved = await syncStorage.getItem("orders") || {};
      
      let data;
      
      // Convertir a array de 15 elementos
      if (Array.isArray(saved)) {
        data = Array.from({ length: 15 }, (_, i) => 
          saved[i] || { 
            items: [], 
            estado: "vacia", 
            tipo: i >= 10 ? "domicilio" : "mesa", 
            domicilio: 0,
            pedidoNumero: 0,
            timestamp: 0
          }
        );
      } else if (typeof saved === 'object') {
        // Firebase devuelve objeto
        data = Array.from({ length: 15 }, (_, i) => {
          const mesaData = saved[i] || saved[i.toString()];
          
          if (mesaData && typeof mesaData === 'object') {
            return {
              items: mesaData.items || [],
              estado: mesaData.estado || "vacia",
              tipo: mesaData.tipo || (i >= 10 ? "domicilio" : "mesa"),
              domicilio: mesaData.domicilio || 0,
              pedidoNumero: mesaData.pedidoNumero || 0,
              timestamp: mesaData.timestamp || Date.now()
            };
          } else {
            return { 
              items: [], 
              estado: "vacia", 
              tipo: i >= 10 ? "domicilio" : "mesa", 
              domicilio: 0,
              pedidoNumero: 0,
              timestamp: 0
            };
          }
        });
      } else {
        data = Array.from({ length: 15 }, (_, i) => ({ 
          items: [], 
          estado: "vacia", 
          tipo: i >= 10 ? "domicilio" : "mesa", 
          domicilio: 0,
          pedidoNumero: 0,
          timestamp: 0
        }));
      }
      
      // Guardar info para la notificación
      const orderInfo = {
        mesaNumero: data[index].tipo === "domicilio" ? `D${index - 9}` : `M${index + 1}`,
        pedidoNumero: data[index].pedidoNumero
      };
      
      // Actualizar estado
      data[index].estado = "listo";
      
      // ✅ GUARDAR EN FIREBASE - VERSIÓN CORREGIDA
      // Convertir array a objeto para Firebase
      const firebaseObject = {};
      data.forEach((order, i) => {
        firebaseObject[i] = {
          items: order.items || [],
          estado: order.estado || "vacia",
          tipo: order.tipo || (i >= 10 ? "domicilio" : "mesa"),
          domicilio: order.domicilio || 0,
          pedidoNumero: order.pedidoNumero || 0,
          timestamp: order.timestamp || Date.now()
        };
      });
      
      await syncStorage.setItem("orders", firebaseObject);
      
      setOrders(data);
      
      // También actualizar localStorage para compatibilidad
      localStorage.setItem("orders", JSON.stringify(data));
      window.dispatchEvent(new Event('storage'));
      
      // Mostrar notificación
      setNotification(orderInfo);
      
      // Ocultar después de 3 segundos
      setTimeout(() => {
        setNotification(null);
      }, 3000);
      
    } catch (error) {
      console.error("❌ Error marcando pedido como listo:", error);
      alert("Error al guardar el cambio. Verifica la conexión.");
    }
  };

  // Ordenar por tiempo: más viejo primero
  const pedidosEnPreparacion = orders
    .map((mesa, index) => ({ ...mesa, originalIndex: index }))
    .filter(mesa => mesa.estado === "espera" && mesa.items?.length > 0 && mesa.pedidoNumero > 0)
    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* NOTIFICACIÓN EN EL CENTRO */}
      {notification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 rounded-xl shadow-2xl max-w-sm mx-4 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2">¡PEDIDO LISTO!</h2>
            <div className="text-xl mb-1">{notification.mesaNumero}</div>
            <div className="text-lg">Pedido #{notification.pedidoNumero}</div>
            <div className="text-sm opacity-90 mt-2">Enviado al POS correctamente</div>
          </div>
        </div>
      )}

      {/* HEADER SIMPLE */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-800">👨‍🍳 Cocina</h1>
          <Link 
            to="/" 
            className="bg-gray-800 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 hover:bg-gray-900"
          >
            ← POS
          </Link>
        </div>
        <p className="text-gray-600">Gestión de pedidos en tiempo real</p>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      {pedidosEnPreparacion.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center shadow">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay pedidos pendientes</h3>
          <p className="text-gray-500">Los pedidos del POS aparecerán aquí</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pedidosEnPreparacion.map((mesa) => {
            const mesaIndex = mesa.originalIndex;
            const tiempo = tiempoTranscurrido[mesaIndex] || { minutos: 0, segundos: 0 };
            const isDomicilio = mesa.tipo === "domicilio";
            const totalItems = mesa.items?.reduce((sum, item) => sum + (item.cantidad || 1), 0) || 0;
            
            return (
              <div key={mesaIndex} className="bg-white rounded-xl shadow-lg">
                {/* TÍTULO GRANDE - UN SOLO TÍTULO */}
                <div className="p-5 bg-gray-800 text-white rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {isDomicilio ? `🚚 D${mesaIndex - 9}` : `🪑 M${mesaIndex + 1}`} 
                        <span className="text-blue-300 ml-3">Pedido #{mesa.pedidoNumero}</span>
                      </h2>
                      <div className="flex items-center gap-4 mt-2 text-gray-300">
                        <span>{totalItems} producto{totalItems !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>⏱️ {tiempo.minutos}:{tiempo.segundos.toString().padStart(2, '0')} min</span>
                        {isDomicilio && <span className="text-red-300">• Domicilio</span>}
                      </div>
                    </div>
                    {mesa.domicilio > 0 && (
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-300">+${mesa.domicilio}</div>
                        <div className="text-sm text-gray-300">Domicilio</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* PRODUCTOS CON VIÑETAS */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Productos:</h3>
                  
                  <div className="space-y-3">
                    {mesa.items.map((producto, pIdx) => {
                      const cantidad = producto.cantidad || 1;
                      return (
                        <div key={pIdx} className="flex items-start">
                          <div className="mr-3 mt-1">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-base font-medium text-gray-800">
                                {producto.nombre}
                              </span>
                              {cantidad > 1 && (
                                <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                  x{cantidad}
                                </span>
                              )}
                            </div>
                            {producto.nota && (
                              <div className="mt-2 p-3 bg-yellow-50 border-l-3 border-yellow-500 rounded-r">
                                <div className="flex items-start">
                                  <span className="text-yellow-600 mr-2">📝</span>
                                  <span className="text-sm text-yellow-800">{producto.nota}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* BOTÓN */}
                <div className="p-5 border-t bg-gray-50 rounded-b-xl">
                  <button
                    onClick={() => marcarListo(mesaIndex)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-lg font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">✓</span>
                    MARCAR COMO LISTO
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FOOTER */}
      {pedidosEnPreparacion.length > 0 && (
        <div className="mt-8 p-4 bg-gray-800 text-white text-center rounded-xl">
          <div className="text-sm">
            Mostrando {pedidosEnPreparacion.length} pedido{pedidosEnPreparacion.length !== 1 ? 's' : ''}
            <span className="text-green-300 ml-2">• Ordenado por antigüedad</span>
          </div>
        </div>
      )}
    </div>
  );
}