import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import syncStorage from "../firebase/storage.js";
import "../App.css"; // ← AÑADIDO PARA ESTILOS

export default function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState({});
  const [notification, setNotification] = useState(null);
  const [orderCounter, setOrderCounter] = useState(1); // ← CONTADOR GLOBAL

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const saved = await syncStorage.getItem("orders");
        
        let completas;
        
        if (saved && typeof saved === 'object') {
          if (Array.isArray(saved)) {
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
            completas = Array.from({ length: 15 }, (_, i) => {
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
          completas = Array.from({ length: 15 }, (_, i) => ({
            items: [], 
            estado: "vacia", 
            tipo: i >= 10 ? "domicilio" : "mesa", 
            domicilio: 0,
            pedidoNumero: 0,
            timestamp: Date.now()
          }));
        }

        // ✅ CORRECCIÓN 3: NÚMEROS ÚNICOS POR FECHA/TIMESTAMP
        // Ordenar por timestamp para asignar números consecutivos
        const pedidosConTimestamp = completas
          .map((order, index) => ({ ...order, originalIndex: index }))
          .filter(order => order.estado === "espera" && order.items?.length > 0)
          .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

        // Crear mapa de asignación de números
        const indexToOrderNumber = {};
        let currentOrderNumber = 1;
        
        pedidosConTimestamp.forEach((order) => {
          if (!order.pedidoNumero || order.pedidoNumero === 0) {
            indexToOrderNumber[order.originalIndex] = currentOrderNumber;
            currentOrderNumber++;
          } else {
            indexToOrderNumber[order.originalIndex] = order.pedidoNumero;
          }
        });

        // Actualizar números en todas las órdenes
        let changed = false;
        const updatedOrders = completas.map((order, index) => {
          const newOrderNumber = indexToOrderNumber[index];
          
          if (newOrderNumber && newOrderNumber !== order.pedidoNumero) {
            changed = true;
            return {
              ...order,
              pedidoNumero: newOrderNumber
            };
          }
          return order;
        });

        if (changed) {
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
        if (currentOrderNumber > 1) {
          setOrderCounter(currentOrderNumber);
        }
        
      } catch (error) {
        console.error("❌ Error cargando pedidos:", error);
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
    
    const unsuscribe = syncStorage.syncItem("orders", (newOrders) => {
      if (newOrders !== null && newOrders !== undefined) {
        try {
          let nuevasOrders;
          
          if (Array.isArray(newOrders)) {
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
            console.warn("Formato de datos inesperado:", newOrders);
            return;
          }
          
          setOrders(nuevasOrders);
          localStorage.setItem("orders", JSON.stringify(nuevasOrders));
          
        } catch (error) {
          console.error("Error procesando datos:", error);
        }
      }
    });
    
    const interval = setInterval(() => {
      loadOrders();
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
      const saved = await syncStorage.getItem("orders") || {};
      
      let data;
      
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
      
      const orderInfo = {
        mesaNumero: data[index].tipo === "domicilio" ? `D${index - 9}` : `M${index + 1}`,
        pedidoNumero: data[index].pedidoNumero
      };
      
      data[index].estado = "listo";
      
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
      localStorage.setItem("orders", JSON.stringify(data));
      window.dispatchEvent(new Event('storage'));
      
      setNotification(orderInfo);
      
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
    <div className="min-h-screen reportes-container p-4 md:p-6">
      {/* NOTIFICACIÓN */}
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

      {/* HEADER - CORREGIDO CON ESTILOS DEL POS */}
      <header className="mb-8">
        <div className="reportes-card text-center p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-green-500 to-orange-500"></div>
          
          <h1 className="reportes-title text-3xl md:text-4xl font-black tracking-tight mb-2">
            👨‍🍳 Cocina
          </h1>
          
          <p className="text-gray-600 font-medium">Gestión de pedidos en tiempo real</p>
          
          <div className="mt-6">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-6 py-2.5 rounded-lg font-bold transition-colors"
            >
              ← Volver al POS
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL - ORGANIZADO EN CUADROS */}
      {pedidosEnPreparacion.length === 0 ? (
        <div className="reportes-card text-center py-12">
          <div className="text-gray-300 text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay pedidos pendientes</h3>
          <p className="text-gray-500">Los pedidos del POS aparecerán aquí automáticamente</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pedidosEnPreparacion.map((mesa) => {
            const mesaIndex = mesa.originalIndex;
            const tiempo = tiempoTranscurrido[mesaIndex] || { minutos: 0, segundos: 0 };
            const isDomicilio = mesa.tipo === "domicilio";
            const totalItems = mesa.items?.reduce((sum, item) => sum + (item.cantidad || 1), 0) || 0;
            
            return (
              // ✅ CORRECCIÓN 1: CUADRO/CARD ORGANIZADO
              <div key={mesaIndex} className="reportes-card hover:shadow-xl transition-all duration-300">
                {/* CABECERA DEL PEDIDO */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`icon-card ${isDomicilio ? 'bg-gradient-to-br from-purple-500 to-pink-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'} text-white`}>
                        {isDomicilio ? '🚚' : '🪑'}
                      </div>
                      <div>
                        <h2 className="reportes-subtitle">
                          {isDomicilio ? `Domicilio D${mesaIndex - 9}` : `Mesa M${mesaIndex + 1}`}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm font-bold text-gray-600">
                            Pedido #{mesa.pedidoNumero}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {totalItems} producto{totalItems !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {mesa.domicilio > 0 && (
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">+${mesa.domicilio.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Domicilio</div>
                      </div>
                    )}
                  </div>
                  
                  {/* TIEMPO Y ESTADO */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-blue-600">⏱️</span>
                        <div>
                          <div className="font-bold text-blue-800">Tiempo transcurrido</div>
                          <div className="text-sm text-blue-600">
                            {tiempo.minutos}:{tiempo.segundos.toString().padStart(2, '0')} minutos
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-600">Estado</div>
                        <div className="text-green-600 font-bold">🟡 En preparación</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ✅ CORRECCIÓN 1: PRODUCTOS CON VIÑETAS */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>📋</span>
                    Productos del pedido:
                  </h3>
                  
                  <div className="space-y-3">
                    {mesa.items.map((producto, pIdx) => {
                      const cantidad = producto.cantidad || 1;
                      const totalProducto = (producto.precio || 0) * cantidad;
                      
                      return (
                        // ✅ VIÑETA CON PUNTO AZUL
                        <div key={pIdx} className="flex items-start pl-2">
                          <div className="mr-3 mt-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                          
                          <div className="flex-1 producto-card">
                            <div className="producto-header">
                              <span className="font-bold text-gray-800">{producto.nombre}</span>
                              <span className="font-bold text-green-600">${totalProducto.toLocaleString()}</span>
                            </div>
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="controles-cantidad">
                                <div className="text-sm text-gray-600">
                                  Cantidad: <span className="font-bold">{cantidad}</span>
                                </div>
                              </div>
                              
                              {producto.nota && (
                                <div className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                                  📝 {producto.nota}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ✅ CORRECCIÓN 2: BOTÓN VERDE LLAMATIVO */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => marcarListo(mesaIndex)}
                    className="btn-gradient-success w-full py-3 text-lg font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                  >
                    <span className="text-xl">✓</span>
                    MARCAR COMO LISTO
                  </button>
                  
                  <div className="text-center mt-3">
                    <div className="text-xs text-gray-500">
                      Al marcar como listo, el POS será notificado automáticamente
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FOOTER MEJORADO */}
      {pedidosEnPreparacion.length > 0 && (
        <div className="reportes-card mt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="icon-card bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <span>📊</span>
              </div>
              <div>
                <div className="font-bold text-gray-800">
                  Mostrando {pedidosEnPreparacion.length} pedido{pedidosEnPreparacion.length !== 1 ? 's' : ''}
                </div>
                <div className="text-sm text-gray-600">
                  Ordenados por antigüedad • Más antiguo primero
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600">Próximo número de pedido</div>
              <div className="text-2xl font-bold text-blue-600">#{orderCounter}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}