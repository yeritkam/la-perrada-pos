// src/pages/POS.jsx - VERSIÓN 100% CORREGIDA
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import products from "../data/products.js";
import PDFGenerator from "../components/PDFGenerator";
import syncStorage from "../firebase/storage.js";

export default function POS() {
  const [mesaActual, setMesaActual] = useState(null);
  const [ordenTemporal, setOrdenTemporal] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [showMesaPedido, setShowMesaPedido] = useState(false);
  const [mesaSeleccionadaPedido, setMesaSeleccionadaPedido] = useState(null);
  
  // ESTADO PARA FECHA ACTIVA
  const [fechaActiva, setFechaActiva] = useState(() => {
    return localStorage.getItem("fechaActiva") || "";
  });
  
  // ESTADO PARA ESTADO CAJA
  const [estadoCaja, setEstadoCaja] = useState(() => {
    return localStorage.getItem("estadoCaja") || "cerrada";
  });

  // MESAS - VERSIÓN CORREGIDA
  const [mesas, setMesas] = useState(() => {
    console.log("🔄 POS: Inicializando mesas...");
    
    try {
      const saved = localStorage.getItem("orders");
      if (saved) {
        const parsed = JSON.parse(saved);
        
        const mesasIniciales = Array.from({ length: 15 }, (_, i) => {
          if (Array.isArray(parsed)) {
            const mesa = parsed[i];
            if (mesa && typeof mesa === 'object') {
              return {
                items: Array.isArray(mesa.items) ? mesa.items : [],
                estado: mesa.estado || "vacia",
                tipo: mesa.tipo || (i >= 10 ? "domicilio" : "mesa"),
                domicilio: typeof mesa.domicilio === 'number' ? mesa.domicilio : 0,
                pedidoNumero: typeof mesa.pedidoNumero === 'number' ? mesa.pedidoNumero : 0,
                timestamp: typeof mesa.timestamp === 'number' ? mesa.timestamp : Date.now()
              };
            }
          } else if (parsed && typeof parsed === 'object') {
            const mesa = parsed[i] || parsed[i.toString()];
            if (mesa && typeof mesa === 'object') {
              return {
                items: Array.isArray(mesa.items) ? mesa.items : [],
                estado: mesa.estado || "vacia",
                tipo: mesa.tipo || (i >= 10 ? "domicilio" : "mesa"),
                domicilio: typeof mesa.domicilio === 'number' ? mesa.domicilio : 0,
                pedidoNumero: typeof mesa.pedidoNumero === 'number' ? mesa.pedidoNumero : 0,
                timestamp: typeof mesa.timestamp === 'number' ? mesa.timestamp : Date.now()
              };
            }
          }
          
          return {
            items: [],
            estado: "vacia",
            tipo: i >= 10 ? "domicilio" : "mesa",
            domicilio: 0,
            pedidoNumero: 0,
            timestamp: Date.now()
          };
        });
        
        console.log("✅ POS: Mesas inicializadas desde localStorage");
        return mesasIniciales;
      }
    } catch (error) {
      console.warn("⚠️ POS: Error cargando mesas de localStorage:", error);
    }
    
    console.log("📭 POS: Creando 15 mesas vacías por defecto...");
    return Array.from({ length: 15 }, (_, i) => ({
      items: [],
      estado: "vacia",
      tipo: i >= 10 ? "domicilio" : "mesa",
      domicilio: 0,
      pedidoNumero: 0,
      timestamp: Date.now()
    }));
  });

  // SINCRONIZAR FECHA Y ESTADO CAJA DESDE FIREBASE
  useEffect(() => {
    console.log("📅 POS: Iniciando sincronización de fecha y estado caja...");
    
    const loadFechaYEstado = async () => {
      try {
        // Cargar fecha activa
        const fechaFirebase = await syncStorage.getItem("fechaActiva");
        console.log("📅 Fecha de Firebase:", fechaFirebase);
        
        if (fechaFirebase !== null && fechaFirebase !== undefined && fechaFirebase !== "") {
          setFechaActiva(fechaFirebase);
          localStorage.setItem("fechaActiva", fechaFirebase);
        } else {
          const fechaLocal = localStorage.getItem("fechaActiva") || "";
          setFechaActiva(fechaLocal);
        }
        
        // Cargar estado caja
        const estadoFirebase = await syncStorage.getItem("estadoCaja");
        if (estadoFirebase !== null && estadoFirebase !== undefined) {
          setEstadoCaja(estadoFirebase);
          localStorage.setItem("estadoCaja", estadoFirebase);
        } else {
          setEstadoCaja(localStorage.getItem("estadoCaja") || "cerrada");
        }
        
      } catch (error) {
        console.error("❌ Error cargando fecha/estado:", error);
      }
    };
    
    loadFechaYEstado();
    
    // Listeners en tiempo real
    const unsubscribeFecha = syncStorage.syncItem("fechaActiva", (newFecha) => {
      console.log("🔄 POS: Cambio en fecha activa:", newFecha);
      if (newFecha !== null && newFecha !== undefined) {
        setFechaActiva(newFecha);
        localStorage.setItem("fechaActiva", newFecha);
      }
    });
    
    const unsubscribeEstado = syncStorage.syncItem("estadoCaja", (newEstado) => {
      console.log("🔄 POS: Cambio en estado caja:", newEstado);
      if (newEstado !== null && newEstado !== undefined) {
        setEstadoCaja(newEstado);
        localStorage.setItem("estadoCaja", newEstado);
      }
    });
    
    return () => {
      unsubscribeFecha?.();
      unsubscribeEstado?.();
    };
  }, []);

  // SINCRONIZAR MESAS DESDE FIREBASE
  useEffect(() => {
    console.log("🚀 POS: Iniciando sincronización de mesas...");
    
    let isMounted = true;
    let unsubscribe = null;
    
    const initSync = async () => {
      try {
        const firebaseData = await syncStorage.getItem("orders");
        console.log("📦 POS: Datos recibidos de Firebase:", firebaseData);
        
        if (!isMounted) return;
        
        if (firebaseData !== null && firebaseData !== undefined) {
          const nuevasMesas = Array.from({ length: 15 }, (_, i) => {
            let mesaFirebase = null;
            
            if (Array.isArray(firebaseData) && firebaseData[i]) {
              mesaFirebase = firebaseData[i];
            } else if (firebaseData && typeof firebaseData === 'object') {
              mesaFirebase = firebaseData[i] || firebaseData[i.toString()];
            }
            
            if (mesaFirebase && typeof mesaFirebase === 'object') {
              return {
                items: Array.isArray(mesaFirebase.items) ? mesaFirebase.items : [],
                estado: mesaFirebase.estado || "vacia",
                tipo: mesaFirebase.tipo || (i >= 10 ? "domicilio" : "mesa"),
                domicilio: typeof mesaFirebase.domicilio === 'number' ? mesaFirebase.domicilio : 0,
                pedidoNumero: typeof mesaFirebase.pedidoNumero === 'number' ? mesaFirebase.pedidoNumero : 0,
                timestamp: typeof mesaFirebase.timestamp === 'number' ? mesaFirebase.timestamp : Date.now()
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
          
          if (isMounted) {
            setMesas(nuevasMesas);
            localStorage.setItem("orders", JSON.stringify(nuevasMesas));
            console.log("✅ POS: Mesas actualizadas desde Firebase");
          }
        }
        
        if (isMounted) {
          unsubscribe = syncStorage.syncItem("orders", (newOrders) => {
            console.log("📡 POS: Cambio en tiempo real de Firebase");
            
            if (newOrders !== null && newOrders !== undefined && isMounted) {
              const nuevasMesas = Array.from({ length: 15 }, (_, i) => {
                let mesaData = null;
                
                if (Array.isArray(newOrders) && newOrders[i]) {
                  mesaData = newOrders[i];
                } else if (newOrders && typeof newOrders === 'object') {
                  mesaData = newOrders[i] || newOrders[i.toString()];
                }
                
                if (mesaData && typeof mesaData === 'object') {
                  return {
                    items: Array.isArray(mesaData.items) ? mesaData.items : [],
                    estado: mesaData.estado || "vacia",
                    tipo: mesaData.tipo || (i >= 10 ? "domicilio" : "mesa"),
                    domicilio: typeof mesaData.domicilio === 'number' ? mesaData.domicilio : 0,
                    pedidoNumero: typeof mesaData.pedidoNumero === 'number' ? mesaData.pedidoNumero : 0,
                    timestamp: typeof mesaData.timestamp === 'number' ? mesaData.timestamp : Date.now()
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
              
              setMesas(nuevasMesas);
              localStorage.setItem("orders", JSON.stringify(nuevasMesas));
              console.log("🔄 POS: Mesas actualizadas desde sincronización en tiempo real");
            }
          });
        }
        
      } catch (error) {
        console.error("💥 POS: Error inicializando sincronización:", error);
      }
    };
    
    initSync();
    
    return () => {
      console.log("🧹 POS: Limpiando listeners y estado");
      isMounted = false;
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // HISTORIAL
  const [historialMesa, setHistorialMesa] = useState(null);
  const [showHistorial, setShowHistorial] = useState(false);
  const [historialVentas, setHistorialVentas] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('historialVentas')) || {};
    } catch (error) {
      return {};
    }
  });

  // Cargar historial desde Firebase
  useEffect(() => {
    let unsubscribeHistorial = null;
    
    const loadHistorial = async () => {
      try {
        const firebaseHistorial = await syncStorage.getItem("historialVentas");
        if (firebaseHistorial !== null && firebaseHistorial !== undefined) {
          setHistorialVentas(firebaseHistorial);
          localStorage.setItem("historialVentas", JSON.stringify(firebaseHistorial));
        }
      } catch (error) {
        console.warn("POS: Error cargando historial desde Firebase:", error);
      }
    };

    loadHistorial();

    unsubscribeHistorial = syncStorage.syncItem("historialVentas", (newHistorial) => {
      if (newHistorial !== null && newHistorial !== undefined) {
        setHistorialVentas(newHistorial);
        localStorage.setItem("historialVentas", JSON.stringify(newHistorial));
      }
    });

    return () => {
      if (unsubscribeHistorial) unsubscribeHistorial();
    };
  }, []);

  // ESTADOS PARA COBRO
  const [openCobrar, setOpenCobrar] = useState(false);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [montoEfectivo, setMontoEfectivo] = useState("");
  const [montoNequi, setMontoNequi] = useState("");
  const [vuelto, setVuelto] = useState(0);

  const [editIndex, setEditIndex] = useState(null);
  const [notaTemp, setNotaTemp] = useState("");
  const [showNotaModal, setShowNotaModal] = useState(false);
  const [showMenuSeleccion, setShowMenuSeleccion] = useState(false);
  const [showDividirCuenta, setShowDividirCuenta] = useState(false);
  const [personasDividir, setPersonasDividir] = useState(2);
  const [productosAsignados, setProductosAsignados] = useState({});
  const [showPagoIndividual, setShowPagoIndividual] = useState(false);
  const [personaAPagar, setPersonaAPagar] = useState(1);
  const [pagosRealizados, setPagosRealizados] = useState({});

  const NEQUI_NUM = "304 649 2391";
  const NEQUI_TITULAR = "Gerson Soto";

  // FUNCIONES PARA PRODUCTOS
  const getName = (p) => p.nombre ?? p.name ?? "Producto";
  const getPrice = (p) => p.precio ?? p.price ?? 0;
  const getCat = (p) => p.categoria ?? p.category ?? "Sin categoría";
  const getId = (p) => p.id ?? p._id ?? Math.random().toString();

  // 🔥🔥🔥 FUNCIÓN PARA OBTENER RUTA CORRECTA DEL LOGO - CORREGIDA 🔥🔥🔥
  const getLogoPath = () => {
    // Detectar si estamos en GitHub Pages
    if (window.location.hostname.includes('github.io')) {
      return '/la-perrada-pos/logo.png';
    }
    // Si estamos en desarrollo local
    return '/logo.png';
  };

  // GUARDAR MESAS CON FECHA AUTOMÁTICA
  const saveMesas = async (nuevasMesas) => {
    console.log("💾 POS: Guardando mesas...");
    
    try {
      if (!Array.isArray(nuevasMesas)) {
        console.error("❌ POS: nuevasMesas no es un array:", nuevasMesas);
        return;
      }
      
      const mesasCompletas = Array.from({ length: 15 }, (_, i) => {
        const mesa = nuevasMesas[i];
        if (mesa && typeof mesa === 'object') {
          return {
            items: Array.isArray(mesa.items) ? mesa.items : [],
            estado: mesa.estado || "vacia",
            tipo: mesa.tipo || (i >= 10 ? "domicilio" : "mesa"),
            domicilio: typeof mesa.domicilio === 'number' ? mesa.domicilio : 0,
            pedidoNumero: typeof mesa.pedidoNumero === 'number' ? mesa.pedidoNumero : 0,
            timestamp: typeof mesa.timestamp === 'number' ? mesa.timestamp : Date.now()
          };
        }
        return {
          items: [],
          estado: "vacia",
          tipo: i >= 10 ? "domicilio" : "mesa",
          domicilio: 0,
          pedidoNumero: 0,
          timestamp: Date.now()
        };
      });
      
      setMesas(mesasCompletas);
      localStorage.setItem("orders", JSON.stringify(mesasCompletas));
      
      try {
        if (syncStorage && typeof syncStorage.setItem === 'function') {
          const firebaseObject = {};
          mesasCompletas.forEach((mesa, index) => {
            firebaseObject[index] = {
              items: mesa.items || [],
              estado: mesa.estado || "vacia",
              tipo: mesa.tipo || (index >= 10 ? "domicilio" : "mesa"),
              domicilio: mesa.domicilio || 0,
              pedidoNumero: mesa.pedidoNumero || 0,
              timestamp: mesa.timestamp || Date.now()
            };
          });
          
          await syncStorage.setItem("orders", firebaseObject);
          console.log("✅ POS: Mesas guardadas en Firebase");
        }
      } catch (firebaseError) {
        console.warn("⚠️ POS: Error guardando en Firebase, usando solo local:", firebaseError);
      }
      
      console.log("✅ POS: Mesas guardadas exitosamente");
      
    } catch (error) {
      console.error("❌ POS: Error crítico en saveMesas:", error);
      setMesas(nuevasMesas);
      localStorage.setItem("orders", JSON.stringify(nuevasMesas));
    }
  };

  // Guardar historial
  const saveHistorial = async (nuevoHistorial) => {
    try {
      await syncStorage.setItem("historialVentas", nuevoHistorial);
      localStorage.setItem("historialVentas", JSON.stringify(nuevoHistorial));
      setHistorialVentas(nuevoHistorial);
    } catch (error) {
      console.error("POS: Error guardando historial:", error);
      localStorage.setItem("historialVentas", JSON.stringify(nuevoHistorial));
      setHistorialVentas(nuevoHistorial);
    }
  };

  // GUARDAR VENTAS CON FECHA AUTOMÁTICA
  const saveSales = async (nuevasVentas) => {
    try {
      console.log("💰 POS: Guardando ventas con fecha activa:", fechaActiva);
      
      // Asegurar que todas las ventas tengan la fecha activa
      const ventasConFecha = nuevasVentas.map(venta => ({
        ...venta,
        // Si no tiene fecha, usar la fecha activa actual
        fecha: venta.fecha || (fechaActiva ? `${fechaActiva}T${new Date().toTimeString().split(' ')[0]}` : new Date().toISOString()),
        // Guardar también la fecha simple para fácil filtrado
        fechaSimple: fechaActiva || new Date().toISOString().split('T')[0]
      }));
      
      await syncStorage.setItem("sales", ventasConFecha);
      localStorage.setItem("sales", JSON.stringify(ventasConFecha));
      console.log("✅ POS: Ventas guardadas con fecha:", fechaActiva);
    } catch (error) {
      console.error("❌ POS: Error guardando ventas:", error);
      localStorage.setItem("sales", JSON.stringify(nuevasVentas));
    }
  };

  // CATEGORÍAS
  const categorias = [
    "Perros calientes",
    "Hamburguesas", 
    "Suizos",
    "Salchipapa",
    "Picadas",
    "Arepas sencillas",
    "Arepas típicas",
    "Arepas trifásicas",
    "Arepas dobles",
    "Bebidas",
    "Adiciones",
    "Combos"
  ];

  const getIconoPorCategoria = (categoria) => {
    const iconos = {
      "Perros calientes": "🌭",
      "Hamburguesas": "🍔",
      "Suizos": "🧀",
      "Salchipapa": "🍟",
      "Picadas": "🥘",
      "Arepas sencillas": "🥪",
      "Arepas típicas": "🇨🇴",
      "Arepas trifásicas": "⚡",
      "Arepas dobles": "🥪🥪",
      "Bebidas": "🥤",
      "Adiciones": "➕",
      "Combos": "🎯"
    };
    return iconos[categoria] || "🍕";
  };

  const productosFiltrados = categoriaSeleccionada 
    ? products.filter((p) => getCat(p) === categoriaSeleccionada)
    : [];

  // MANEJAR DOBLE CLICK EN MESA
  const handleDobleClickMesa = (index) => {
    const mesa = mesas[index];
    if (mesa && mesa.items && mesa.items.length > 0) {
      setMesaSeleccionadaPedido(index);
      setShowMesaPedido(true);
    }
  };

  // FUNCIONES PARA EL SISTEMA DE CANTIDADES
  const addToTemp = (prod) => {
    if (mesaActual === null) {
      alert("Selecciona una mesa primero");
      return;
    }
    
    const productId = getId(prod);
    setOrdenTemporal((currentItems) => {
      const existingIndex = currentItems.findIndex(item => getId(item) === productId);
      
      if (existingIndex >= 0) {
        const updatedItems = [...currentItems];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          cantidad: (updatedItems[existingIndex].cantidad || 1) + 1,
        };
        return updatedItems;
      } else {
        return [...currentItems, { 
          ...prod, 
          cantidad: 1, 
          nota: "",
        }];
      }
    });
  };

  const increaseQuantity = (index) => {
    setOrdenTemporal((currentItems) => {
      const updatedItems = [...currentItems];
      const currentQuantity = updatedItems[index].cantidad || 1;
      
      updatedItems[index] = {
        ...updatedItems[index],
        cantidad: currentQuantity + 1,
      };
      
      return updatedItems;
    });
  };

  const decreaseQuantity = (index) => {
    setOrdenTemporal((currentItems) => {
      const updatedItems = [...currentItems];
      const currentQuantity = updatedItems[index].cantidad || 1;
      
      if (currentQuantity <= 1) {
        return updatedItems.filter((_, i) => i !== index);
      } else {
        updatedItems[index] = {
          ...updatedItems[index],
          cantidad: currentQuantity - 1,
        };
        return updatedItems;
      }
    });
  };

  const removeFromTemp = (index) => {
    setOrdenTemporal((currentItems) => currentItems.filter((_, i) => i !== index));
  };

  const calcularProductosUnicos = () => {
    return ordenTemporal.length;
  };

  const calcularTotalItems = () => {
    return ordenTemporal.reduce((total, item) => total + (item.cantidad || 1), 0);
  };

  const calcularTotalTemporal = () => {
    return ordenTemporal.reduce((total, item) => {
      const cantidad = item.cantidad || 1;
      const precio = getPrice(item);
      return total + (cantidad * precio);
    }, 0);
  };

  const calcularSubtotalProductos = () => {
    return ordenTemporal.reduce((total, prod) => {
      return total + (getPrice(prod) * (prod.cantidad || 1));
    }, 0);
  };

  // Actualizar nota
  const abrirNota = (idx) => {
    setEditIndex(idx);
    setNotaTemp(ordenTemporal[idx].nota || "");
    setShowNotaModal(true);
  };

  const guardarNota = () => {
    const copia = [...ordenTemporal];
    copia[editIndex].nota = notaTemp;
    setOrdenTemporal(copia);
    setShowNotaModal(false);
  };

  // Actualizar precio domicilio
  const actualizarPrecioDomicilio = async (mesaIndex, nuevoPrecio) => {
    const nuevasMesas = [...mesas];
    nuevasMesas[mesaIndex] = { 
      ...nuevasMesas[mesaIndex], 
      domicilio: nuevoPrecio 
    };
    
    await saveMesas(nuevasMesas);
  };

  // ENVIAR A COCINA
  const enviarACocina = async () => {
    if (mesaActual === null) return alert("Selecciona una mesa primero");
    if (ordenTemporal.length === 0) return alert("No hay productos para enviar.");

    const productosParaEnviar = ordenTemporal.map((p) => ({
      id: getId(p),
      nombre: getName(p),
      precio: getPrice(p),
      cantidad: p.cantidad || 1,
      nota: p.nota || "",
    }));

    const itemsActuales = [...(mesas[mesaActual]?.items || [])];
    
    productosParaEnviar.forEach(nuevoProducto => {
      const existingIndex = itemsActuales.findIndex(item => item.id === nuevoProducto.id);
      
      if (existingIndex >= 0) {
        itemsActuales[existingIndex].cantidad += nuevoProducto.cantidad;
      } else {
        itemsActuales.push({
          ...nuevoProducto,
          cantidad: nuevoProducto.cantidad || 1
        });
      }
    });

    const nuevasMesas = [...mesas];
    nuevasMesas[mesaActual] = {
      ...nuevasMesas[mesaActual],
      items: itemsActuales,
      estado: "espera",
      pedidoNumero: (nuevasMesas[mesaActual].pedidoNumero || 0) + 1,
      timestamp: Date.now()
    };
    
    await saveMesas(nuevasMesas);
    
    setOrdenTemporal([]);
    
    alert(`✅ Pedido enviado a cocina (${calcularProductosUnicos()} productos)`);
  };

  // Calcular total de una mesa
  const totalMesaEnCocina = (idx) => {
    const mesa = mesas[idx] || { items: [], domicilio: 0 };
    const totalProductos = (mesa.items || []).reduce((s, it) => s + (it.precio * (it.cantidad || 1)), 0);
    const domicilio = mesa.domicilio || 0;
    return totalProductos + domicilio;
  };

  // VER HISTORIAL DE MESA
  const verHistorialMesa = (mesaIndex, e) => {
    if (e) e.stopPropagation();
    setHistorialMesa(mesaIndex);
    setShowHistorial(true);
  };

  // LIMPIAR HISTORIAL DE MESA
  const limpiarHistorialMesa = async () => {
    if (historialMesa !== null) {
      const nuevoHistorial = { ...historialVentas };
      delete nuevoHistorial[historialMesa];
      
      await saveHistorial(nuevoHistorial);
      
      setShowHistorial(false);
      alert(`✅ Historial limpiado para ${mesas[historialMesa]?.tipo === "domicilio" ? 
        `Domicilio D${historialMesa - 9}` : 
        `Mesa M${historialMesa + 1}`}`);
    }
  };

  // FUNCIÓN COBRAR CON FECHA AUTOMÁTICA
  const abrirModalCobrar = () => {
    // Verificar que haya fecha activa
    if (!fechaActiva) {
      alert("⚠️ No hay fecha activa seleccionada. Ve a Reportes y selecciona una fecha antes de cobrar.");
      return;
    }
    
    if (mesaActual === null) return alert("Selecciona una mesa");
    const mesa = mesas[mesaActual] || { items: [] };
    if (!mesa.items.length) return alert("La mesa no tiene pedidos");
    
    setMetodoPago("efectivo");
    setMontoEfectivo("");
    setMontoNequi("");
    setVuelto(0);
    setOpenCobrar(true);
  };

  const totalAPagar = mesaActual === null ? 0 : totalMesaEnCocina(mesaActual);

  const parseNumber = (v) => {
    const n = Number(String(v).replace(/[^0-9.-]+/g, ""));
    return Number.isNaN(n) ? 0 : n;
  };

  const efectivoNum = parseNumber(montoEfectivo);
  const nequiNum = parseNumber(montoNequi);

  const recibidoTotal =
    metodoPago === "efectivo"
      ? efectivoNum
      : metodoPago === "nequi"
      ? nequiNum
      : metodoPago === "mixto"
      ? efectivoNum + nequiNum
      : 0;

  const diferencia = recibidoTotal - totalAPagar;

  // PROCESAR PAGO CON FECHA AUTOMÁTICA Y PAGOS MIXTOS CORRECTOS
  const procesarPago = async () => {
    // VALIDACIÓN ESPECIAL PARA PAGO MIXTO
    if (metodoPago === "mixto") {
      if (efectivoNum <= 0 || nequiNum <= 0) {
        alert("❌ Pago mixto requiere montos en AMBOS métodos (efectivo y Nequi)");
        return;
      }
      if (efectivoNum + nequiNum < totalAPagar) {
        alert(`❌ El total de pagos mixtos ($${(efectivoNum + nequiNum).toLocaleString()}) es menor al total a pagar ($${totalAPagar.toLocaleString()})`);
        return;
      }
    }

    if (recibidoTotal < totalAPagar) {
      alert(`❌ Faltan $${(totalAPagar - recibidoTotal).toLocaleString()}`);
      return;
    }

    // Cargar ventas existentes
    let ventas = [];
    try {
      const savedSales = await syncStorage.getItem("sales");
      if (savedSales && Array.isArray(savedSales)) {
        ventas = savedSales;
      } else {
        const localStorageSales = localStorage.getItem("sales");
        ventas = localStorageSales ? JSON.parse(localStorageSales) : [];
      }
    } catch (error) {
      console.warn("Error cargando ventas:", error);
      const localStorageSales = localStorage.getItem("sales");
      ventas = localStorageSales ? JSON.parse(localStorageSales) : [];
    }

    // Crear fecha ISO con la fecha activa
    const fechaISO = fechaActiva ? `${fechaActiva}T${new Date().toTimeString().split(' ')[0]}` : new Date().toISOString();
    
    // CORRECCIÓN: Guardar montos específicos para pagos mixtos
    const nuevaVenta = {
      fecha: fechaISO,
      fechaSimple: fechaActiva,
      mesa: mesas[mesaActual].tipo === "domicilio" 
        ? `Domicilio ${mesaActual - 9}` 
        : `Mesa ${mesaActual + 1}`,
      total: totalAPagar,
      metodo: metodoPago,
      // IMPORTANTE: Guardar montos específicos por método
      efectivo: metodoPago === "efectivo" ? totalAPagar : 
                metodoPago === "mixto" ? efectivoNum : 0,
      nequi: metodoPago === "nequi" ? totalAPagar : 
              metodoPago === "mixto" ? nequiNum : 0,
      vuelto: diferencia > 0 ? diferencia : 0,
      domicilio: mesas[mesaActual].domicilio || 0,
      tipo: mesas[mesaActual].tipo || "mesa",
      items: mesas[mesaActual].items || []
    };
    
    console.log("💰 Guardando venta con datos:", nuevaVenta);
    
    ventas.push(nuevaVenta);
    
    // Guardar ventas usando la función corregida
    await saveSales(ventas);

    // GUARDAR EN HISTORIAL DE LA MESA
    const nuevaVentaHistorial = {
      id: Date.now(),
      fecha: fechaISO,
      mesa: mesas[mesaActual].tipo === "domicilio" 
        ? `Domicilio ${mesaActual - 9}` 
        : `Mesa ${mesaActual + 1}`,
      total: totalAPagar,
      metodo: metodoPago,
      // También en el historial guardar montos específicos
      efectivo: metodoPago === "efectivo" ? totalAPagar : 
                metodoPago === "mixto" ? efectivoNum : 0,
      nequi: metodoPago === "nequi" ? totalAPagar : 
              metodoPago === "mixto" ? nequiNum : 0,
      vuelto: diferencia > 0 ? diferencia : 0,
      domicilio: mesas[mesaActual].domicilio || 0,
      items: mesas[mesaActual].items.map(item => ({
        ...item,
        cantidad: item.cantidad || 1
      }))
    };

    // Actualizar historial
    const nuevoHistorial = { ...historialVentas };
    if (!nuevoHistorial[mesaActual]) {
      nuevoHistorial[mesaActual] = [];
    }
    nuevoHistorial[mesaActual].push(nuevaVentaHistorial);
    
    await saveHistorial(nuevoHistorial);

    // Generar factura
    const datosFactura = {
      id: Date.now(),
      nombre: mesas[mesaActual].tipo === "domicilio" 
        ? `Cliente Domicilio ${mesaActual - 9}` 
        : `Mesa ${mesaActual + 1}`,
      celular: "",
      tipo: mesas[mesaActual].tipo || "mesa",
      fechaVenta: fechaActiva || new Date().toISOString().split('T')[0],
      valor: totalAPagar,
      domicilio: mesas[mesaActual].domicilio || 0,
      metodoPago: metodoPago,
      montoEfectivo: metodoPago === "efectivo" ? totalAPagar : 
                    metodoPago === "mixto" ? efectivoNum : 0,
      montoNequi: metodoPago === "nequi" ? totalAPagar : 
                  metodoPago === "mixto" ? nequiNum : 0,
      vuelto: diferencia > 0 ? diferencia : 0,
      items: mesas[mesaActual].items.map(item => ({
        id: item.id || Math.random(),
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad || 1
      }))
    };

    PDFGenerator.generarFacturaVenta(datosFactura);

    // Limpiar la mesa
    const nuevasMesas = [...mesas];
    nuevasMesas[mesaActual] = {
      items: [],
      estado: "vacia",
      tipo: nuevasMesas[mesaActual].tipo,
      domicilio: 0,
      pedidoNumero: 0,
      timestamp: Date.now()
    };
    
    await saveMesas(nuevasMesas);

    // Mostrar confirmación
    const mensaje = `✅ Pago registrado exitosamente!\n\n` +
                   `Fecha: ${fechaActiva}\n` +
                   `Total: $${totalAPagar.toLocaleString()}\n` +
                   `Método: ${metodoPago === "efectivo" ? "Efectivo" : 
                              metodoPago === "nequi" ? "Nequi" : 
                              "Mixto (Efectivo + Nequi)"}\n` +
                   `${metodoPago === "mixto" ? `Efectivo: $${efectivoNum.toLocaleString()}\n` : ''}` +
                   `${metodoPago === "mixto" ? `Nequi: $${nequiNum.toLocaleString()}\n` : ''}` +
                   `Recibido: $${recibidoTotal.toLocaleString()}\n` +
                   `${diferencia > 0 ? `Vuelto: $${diferencia.toLocaleString()}` : ''}\n\n` +
                   `📄 Factura generada\n` +
                   `📋 Historial guardado\n` +
                   `✅ Mesa liberada`;
    
    alert(mensaje);
    setOpenCobrar(false);
    setMesaActual(null);
  };

  // GENERAR FACTURA DE MESA
  const generarFacturaMesa = () => {
    if (mesaActual === null) {
      alert("Selecciona una mesa primero");
      return;
    }
    
    const mesa = mesas[mesaActual] || { items: [], domicilio: 0 };
    if (!mesa.items.length) {
      alert("La mesa no tiene pedidos");
      return;
    }

    const datosFactura = {
      id: Date.now(),
      nombre: mesa.tipo === "domicilio" ? 
              `Cliente Domicilio ${mesaActual - 9}` : 
              `Mesa ${mesaActual + 1}`,
      celular: "",
      tipo: mesa.tipo || "mesa",
      fechaVenta: fechaActiva || new Date().toISOString().split('T')[0],
      valor: totalMesaEnCocina(mesaActual),
      domicilio: mesa.domicilio || 0,
      items: mesa.items.map(item => ({
        id: item.id || Math.random(),
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad || 1
      }))
    };

    PDFGenerator.generarFacturaVenta(datosFactura);
    alert("✅ Factura generada exitosamente");
  };

  // FUNCIONES PARA DIVIDIR CUENTAS
  const abrirDividirCuenta = () => {
    if (mesaActual === null) return alert("Selecciona una mesa primero");
    const mesa = mesas[mesaActual] || { items: [] };
    if (!mesa.items.length) return alert("La mesa no tiene pedidos para dividir");
    
    const inicialAsignacion = {};
    mesa.items.forEach((item, index) => {
      inicialAsignacion[index] = null;
    });
    
    setProductosAsignados(inicialAsignacion);
    setPersonasDividir(2);
    setPagosRealizados({});
    setShowDividirCuenta(true);
    setShowPagoIndividual(false);
  };

  const asignarProducto = (productoIndex, persona) => {
    setProductosAsignados(prev => ({
      ...prev,
      [productoIndex]: persona
    }));
  };

  const dividirProducto = (productoIndex) => {
    const nuevaAsignacion = { ...productosAsignados };
    nuevaAsignacion[productoIndex] = "todos";
    
    setProductosAsignados(nuevaAsignacion);
  };

  const calcularSubtotalPersona = (persona) => {
    const mesa = mesas[mesaActual] || { items: [], domicilio: 0 };
    let subtotal = 0;
    
    mesa.items.forEach((item, index) => {
      const asignadoA = productosAsignados[index];
      
      if (asignadoA === persona) {
        subtotal += item.precio * (item.cantidad || 1);
      } else if (asignadoA === "todos") {
        subtotal += (item.precio * (item.cantidad || 1)) / personasDividir;
      }
    });
    
    if (mesa.domicilio > 0) {
      subtotal += mesa.domicilio / personasDividir;
    }
    
    return Math.round(subtotal);
  };

  const productosSinAsignar = () => {
    const mesa = mesas[mesaActual] || { items: [] };
    return mesa.items.filter((_, index) => 
      productosAsignados[index] === null || 
      productosAsignados[index] === undefined
    ).length;
  };

  const irAPagoIndividual = () => {
    if (productosSinAsignar() > 0) {
      return alert("Hay productos sin asignar. Asigna todos los productos antes de continuar.");
    }
    setShowDividirCuenta(false);
    setShowPagoIndividual(true);
    setPersonaAPagar(1);
    setPagosRealizados({});
  };

  const pagarPersona = async (persona) => {
    const subtotal = calcularSubtotalPersona(persona);
    
    setPagosRealizados(prev => ({
      ...prev,
      [persona]: true
    }));
    
    let ventas = [];
    try {
      const savedSales = await syncStorage.getItem("sales");
      if (savedSales && Array.isArray(savedSales)) {
        ventas = savedSales;
      } else {
        const localStorageSales = localStorage.getItem("sales");
        ventas = localStorageSales ? JSON.parse(localStorageSales) : [];
      }
    } catch (error) {
      console.warn("Error cargando ventas:", error);
      const localStorageSales = localStorage.getItem("sales");
      ventas = localStorageSales ? JSON.parse(localStorageSales) : [];
    }

    // Usar fecha activa
    const fechaISO = fechaActiva ? `${fechaActiva}T${new Date().toTimeString().split(' ')[0]}` : new Date().toISOString();
    
    const nuevaVenta = {
      fecha: fechaISO,
      fechaSimple: fechaActiva,
      mesa: mesas[mesaActual].tipo === "domicilio" ? 
            `Domicilio ${mesaActual - 9}` : 
            `Mesa ${mesaActual + 1}`,
      total: subtotal,
      metodo: "efectivo",
      domicilio: mesas[mesaActual].domicilio ? mesas[mesaActual].domicilio / personasDividir : 0,
      tipo: mesas[mesaActual].tipo || "mesa",
      persona: persona,
      dividido: true
    };
    
    ventas.push(nuevaVenta);
    
    await saveSales(ventas);
    
    // Generar factura para esta persona
    const datosFactura = {
      id: Date.now(),
      nombre: `Persona ${persona} - ${mesas[mesaActual].tipo === "domicilio" ? 
              `Domicilio ${mesaActual - 9}` : 
              `Mesa ${mesaActual + 1}`}`,
      celular: "",
      tipo: mesas[mesaActual].tipo || "mesa",
      fechaVenta: fechaActiva || new Date().toISOString().split('T')[0],
      valor: subtotal,
      domicilio: mesas[mesaActual].domicilio ? mesas[mesaActual].domicilio / personasDividir : 0,
      items: mesas[mesaActual].items
        .map((item, index) => {
          const asignadoA = productosAsignados[index];
          const cantidad = item.cantidad || 1;
          let cantidadAsignada = 0;
          
          if (asignadoA === persona) {
            cantidadAsignada = cantidad;
          } else if (asignadoA === "todos") {
            cantidadAsignada = cantidad / personasDividir;
          }
          
          return {
            id: item.id || Math.random(),
            nombre: item.nombre,
            precio: item.precio,
            cantidad: cantidadAsignada > 0 ? Math.round(cantidadAsignada * 100) / 100 : 0
          };
        })
        .filter(item => item.cantidad > 0)
    };
    
    PDFGenerator.generarFacturaVenta(datosFactura);
    
    alert(`✅ Pago registrado para Persona ${persona}: $${subtotal.toLocaleString()}\n📄 Factura PDF generada`);
    
    // Verificar si todas las personas han pagado
    const todasPagadas = Array.from({ length: personasDividir }, (_, i) => i + 1)
      .every(p => pagosRealizados[p] || (p === persona));
    
    if (todasPagadas) {
      const nuevaVentaHistorial = {
        id: Date.now(),
        fecha: fechaISO,
        mesa: mesas[mesaActual].tipo === "domicilio" ? 
              `Domicilio ${mesaActual - 9}` : 
              `Mesa ${mesaActual + 1}`,
        total: totalMesaEnCocina(mesaActual),
        metodo: "dividido",
        dividido: true,
        personas: personasDividir,
        domicilio: mesas[mesaActual].domicilio || 0,
        items: mesas[mesaActual].items
      };

      const nuevoHistorial = { ...historialVentas };
      if (!nuevoHistorial[mesaActual]) {
        nuevoHistorial[mesaActual] = [];
      }
      nuevoHistorial[mesaActual].push(nuevaVentaHistorial);
      
      await saveHistorial(nuevoHistorial);

      // Limpiar la mesa
      const nuevasMesas = [...mesas];
      nuevasMesas[mesaActual] = {
        ...nuevasMesas[mesaActual],
        items: [],
        estado: "vacia",
        domicilio: 0
      };
      
      await saveMesas(nuevasMesas);
      
      setShowPagoIndividual(false);
      setMesaActual(null);
      alert("✅ ¡Todos han pagado! La mesa ha sido liberada.");
    } else {
      const siguientePersona = persona + 1;
      if (siguientePersona <= personasDividir) {
        setPersonaAPagar(siguientePersona);
      } else {
        setShowPagoIndividual(false);
      }
    }
  };

  // FUNCIONES AUXILIARES
  const getColorPorEstado = (estado) => {
    let colors;
    if (estado === "vacia") {
      colors = {
        bg: "#ffffff",
        text: "#1f2937",
        border: "#e5e7eb",
        gradient: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"
      };
    } else if (estado === "espera") {
      colors = {
        bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
        text: "#92400e",
        border: "#fbbf24",
        gradient: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
      };
    } else if (estado === "listo") {
      colors = {
        bg: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
        text: "#065f46",
        border: "#10b981",
        gradient: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)"
      };
    } else {
      colors = {
        bg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
        text: "#1e40af",
        border: "#60a5fa",
        gradient: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)"
      };
    }
    
    return colors;
  };

  const getEstadoTexto = (estado) => {
    if (estado === "vacia") return "Vacia";
    if (estado === "espera") return "En cola";
    if (estado === "listo") return "Listo";
    return estado;
  };

  // MANEJAR SELECCIÓN DE MESAS
  const handleSeleccionarMesa = (index) => {
    setMesaActual(index);
    setOrdenTemporal([]);
  };

  // MANEJAR CLIC EN MESA
  const handleMesaClick = (index, e) => {
    if (e.detail === 2) {
      handleDobleClickMesa(index);
    } else {
      handleSeleccionarMesa(index);
    }
  };

  // CERRAR MODAL DE PEDIDO DE MESA
  const cerrarModalPedidoMesa = () => {
    setShowMesaPedido(false);
    setMesaSeleccionadaPedido(null);
  };

  return (
    <div className="min-h-screen reportes-container p-4 md:p-6">
      {/* HEADER SIMPLIFICADO */}
      <header className="mb-8">
        <div className="reportes-card text-center p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-green-500 to-orange-500"></div>
          
          {/* 🔥🔥🔥 LOGO CORREGIDO PARA GITHUB PAGES 🔥🔥🔥 */}
          <img 
            src={getLogoPath()}
            alt="La Perrada de Piter" 
            className="h-24 md:h-28 mx-auto mb-4 drop-shadow-lg"
            onError={(e) => {
              e.target.onerror = null;
              // Mostrar placeholder si falla
              e.target.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = 'flex items-center justify-center w-full h-24 md:h-28 mb-4';
              fallback.innerHTML = `
                <div class="text-center">
                  <div class="text-4xl mb-2">🌭</div>
                  <div class="text-xl font-bold text-blue-600">La Perrada de Piter</div>
                </div>
              `;
              
              if (e.target.parentNode) {
                e.target.parentNode.insertBefore(fallback, e.target.nextSibling);
              }
            }}
          />
          
          <h1 className="reportes-title text-3xl md:text-4xl font-black tracking-tight">
            Sistema de Punto de Venta
          </h1>
          
          {/* FECHA ACTIVA Y ESTADO CAJA */}
          <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 inline-block">
            <div className="flex items-center gap-2">
              <span className="text-blue-600">📅</span>
              <div>
                <div className="font-bold text-blue-800">
                  Fecha activa: {fechaActiva || "No seleccionada"}
                </div>
                <div className="text-sm text-blue-600">
                  Estado caja: 
                  <span className={`ml-2 font-bold ${estadoCaja === "abierta" ? "text-green-600" : "text-red-600"}`}>
                    {estadoCaja === "abierta" ? "📦 ABIERTA" : "📕 CERRADA"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 mt-2 font-medium">Gestión profesional de pedidos</p>
          
          {/* ADVERTENCIA SI NO HAY FECHA ACTIVA */}
          {!fechaActiva && (
            <div className="mt-4 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-3">
                <span className="text-red-600 text-xl">⚠️</span>
                <div>
                  <p className="font-bold text-red-700">¡ATENCIÓN! No hay fecha activa</p>
                  <p className="text-sm text-red-600">
                    Ve a <Link to="/reportes" className="underline font-bold">Reportes</Link> y selecciona una fecha antes de cobrar.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SELECTOR DE DOMICILIO */}
        {mesaActual !== null && (mesas[mesaActual]?.tipo === "domicilio" || mesaActual >= 10) && (
          <div className="kpi-card mb-6 p-5">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="icon-card bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
                  <span className="text-xl">🚚</span>
                </div>
                <span className="font-bold text-gray-800 text-lg">Precio Domicilio:</span>
              </div>
              <select
                className="modern-input w-full md:w-48"
                value={mesas[mesaActual]?.domicilio || 0}
                onChange={(e) => actualizarPrecioDomicilio(mesaActual, parseInt(e.target.value))}
              >
                <option value="0">Sin domicilio</option>
                <option value="1500">$1.500</option>
                <option value="2000">$2.000</option>
                <option value="3000">$3.000</option>
                <option value="5000">$5.000</option>
              </select>
              <div className="text-2xl font-black text-green-600 ml-auto">
                ${(mesas[mesaActual]?.domicilio || 0).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* COLUMNA IZQUIERDA - MESAS Y PRODUCTOS */}
        <div className="xl:w-2/3 space-y-6">
          {/* SECCIÓN DE MESAS */}
          <section className="reportes-card">
            <div className="flex items-center gap-4 mb-6">
              <div className="icon-card bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                <span className="text-2xl">🪑</span>
              </div>
              <div>
                <h2 className="reportes-subtitle">Mesas</h2>
                <p className="text-gray-600 text-sm">Clic: Seleccionar | Doble clic: Ver pedido</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* FILA 1: Mesas 1-5 */}
              <div className="grid grid-cols-5 gap-3">
                {mesas.slice(0, 5).map((mesa, i) => {
                  const estado = mesa?.estado || "vacia";
                  const colors = getColorPorEstado(estado);
                  const estadoTexto = getEstadoTexto(estado);
                  const tieneHistorial = historialVentas[i]?.length > 0;
                  
                  return (
                    <button
                      key={i}
                      onClick={(e) => handleMesaClick(i, e)}
                      style={{
                        background: colors.gradient,
                        color: colors.text,
                        borderColor: colors.border,
                      }}
                      className={`
                        mesa-card
                        ${mesaActual === i ? 'selected ring-4 ring-blue-400 ring-opacity-50' : ''}
                        border-3
                        relative
                        cursor-pointer
                        transition-all duration-200
                        hover:transform hover:scale-[1.02]
                      `}
                      title={`Clic: Seleccionar | Doble clic: Ver pedido`}
                    >
                      {tieneHistorial && (
                        <button
                          onClick={(e) => verHistorialMesa(i, e)}
                          className="historial-btn"
                          title="Ver historial de pedidos"
                        >
                          👁️
                        </button>
                      )}
                      
                      <div className="font-black text-xl md:text-2xl mb-1">
                        M{i + 1}
                      </div>
                      
                      <div className="text-xs font-bold px-2 leading-tight line-clamp-2">
                        {estadoTexto}
                      </div>
                      
                      {mesa?.items?.length > 0 && (
                        <div className="mesa-badge">
                          {mesa.items.length}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* FILA 2: Mesas 6-10 */}
              <div className="grid grid-cols-5 gap-3">
                {mesas.slice(5, 10).map((mesa, i) => {
                  const index = i + 5;
                  const estado = mesa?.estado || "vacia";
                  const colors = getColorPorEstado(estado);
                  const estadoTexto = getEstadoTexto(estado);
                  const tieneHistorial = historialVentas[index]?.length > 0;
                  
                  return (
                    <button
                      key={index}
                      onClick={(e) => handleMesaClick(index, e)}
                      style={{
                        background: colors.gradient,
                        color: colors.text,
                        borderColor: colors.border,
                      }}
                      className={`
                        mesa-card
                        ${mesaActual === index ? 'selected ring-4 ring-blue-400 ring-opacity-50' : ''}
                        border-3
                        relative
                        cursor-pointer
                        transition-all duration-200
                        hover:transform hover:scale-[1.02]
                      `}
                      title={`Clic: Seleccionar | Doble clic: Ver pedido`}
                    >
                      {tieneHistorial && (
                        <button
                          onClick={(e) => verHistorialMesa(index, e)}
                          className="historial-btn"
                          title="Ver historial de pedidos"
                        >
                          👁️
                        </button>
                      )}
                      
                      <div className="font-black text-xl md:text-2xl mb-1">
                        M{index + 1}
                      </div>
                      
                      <div className="text-xs font-bold px-2 leading-tight line-clamp-2">
                        {estadoTexto}
                      </div>
                      
                      {mesa?.items?.length > 0 && (
                        <div className="mesa-badge">
                          {mesa.items.length}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* SECCIÓN DE DOMICILIOS */}
          <section className="reportes-card">
            <div className="flex items-center gap-4 mb-6">
              <div className="icon-card bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg">
                <span className="text-2xl">🛵</span>
              </div>
              <div>
                <h2 className="reportes-subtitle">Domicilios</h2>
                <p className="text-gray-600 text-sm">Clic: Seleccionar | Doble clic: Ver pedido</p>
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-3">
              {mesas.slice(10, 15).map((mesa, i) => {
                const index = i + 10;
                const estado = mesa?.estado || "vacia";
                const colors = getColorPorEstado(estado);
                const estadoTexto = getEstadoTexto(estado);
                const tieneHistorial = historialVentas[index]?.length > 0;
                
                return (
                  <button
                    key={index}
                    onClick={(e) => handleMesaClick(index, e)}
                    style={{
                      background: colors.gradient,
                      color: colors.text,
                      borderColor: colors.border,
                    }}
                    className={`
                      mesa-card
                      ${mesaActual === index ? 'selected ring-4 ring-blue-400 ring-opacity-50' : ''}
                      border-3
                      relative
                      cursor-pointer
                      transition-all duration-200
                      hover:transform hover:scale-[1.02]
                    `}
                    title={`Clic: Seleccionar | Doble clic: Ver pedido`}
                  >
                    {tieneHistorial && (
                      <button
                        onClick={(e) => verHistorialMesa(index, e)}
                        className="historial-btn"
                        title="Ver historial de pedidos"
                      >
                        👁️
                      </button>
                    )}
                    
                    <div className="font-black text-xl md:text-2xl mb-1 flex items-center gap-1">
                      D{i + 1}
                      <span className="text-base">🚚</span>
                    </div>
                    
                    <div className="text-xs font-bold px-2 leading-tight line-clamp-2">
                      {estadoTexto}
                    </div>
                    
                    {mesa?.items?.length > 0 && (
                      <div className="mesa-badge bg-red-500">
                        {mesa.items.length}
                      </div>
                    )}
                    
                    {mesa?.domicilio > 0 && (
                      <div className="absolute bottom-1 left-0 right-0">
                        <div className="text-[9px] font-black text-green-700 bg-green-100 px-1 py-0.5 rounded-full mx-2">
                          +${mesa.domicilio.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* SECCIÓN DE PRODUCTOS */}
          <section className="reportes-card">
            <div className="flex items-center gap-4 mb-8">
              <div className="icon-card bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
                <span className="text-2xl">🍔</span>
              </div>
              <div>
                <h2 className="reportes-subtitle">Productos</h2>
                <p className="text-gray-600 text-sm">Selecciona productos para la orden</p>
              </div>
            </div>
            
            {/* BOTÓN PRINCIPAL PARA SELECCIÓN DE PRODUCTOS */}
            <div className="mb-6">
              <button
                onClick={() => setShowMenuSeleccion(true)}
                className="btn btn-orange w-full py-5 text-xl font-black shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={mesaActual === null}
                style={{
                  background: "linear-gradient(135deg, #ff922b 0%, #e8590c 100%)",
                  border: "none",
                  borderRadius: "16px",
                  color: "white",
                  padding: "20px",
                  fontSize: "18px",
                  fontWeight: "bold"
                }}
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">🛒</span>
                  <div className="text-left">
                    <div>Escoger Productos</div>
                    <div className="text-sm font-normal opacity-90">
                      {ordenTemporal.length > 0 
                        ? `${ordenTemporal.length} productos seleccionados • ${calcularTotalItems()} items`
                        : "Haz clic para seleccionar productos"
                      }
                    </div>
                  </div>
                </div>
              </button>
              
              {mesaActual === null && (
                <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-3 text-red-700">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <span className="font-bold">Selecciona una mesa primero</span>
                      <p className="text-sm text-red-600 mt-1">Debes seleccionar una mesa o domicilio antes de agregar productos</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* CATEGORÍAS RÁPIDAS */}
            {mesaActual !== null && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Acceso rápido a categorías:</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {categorias.slice(0, 6).map((categoria) => (
                    <button
                      key={categoria}
                      onClick={() => {
                        setShowMenuSeleccion(true);
                        setCategoriaSeleccionada(categoria);
                      }}
                      className="quick-category-btn"
                    >
                      <div className="text-2xl mb-1">
                        {getIconoPorCategoria(categoria)}
                      </div>
                      <div className="text-xs font-bold text-center leading-tight truncate">
                        {categoria}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* COLUMNA DERECHA - ORDEN ACTUAL */}
        <div className="xl:w-1/3">
          <div className="reportes-card h-full flex flex-col">
            {/* HEADER DE ORDEN */}
            <div className="order-header mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="icon-card bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                  <span className="text-2xl">📋</span>
                </div>
                <div className="flex-1">
                  <h2 className="reportes-subtitle">Orden Actual</h2>
                  {mesaActual !== null && (
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-blue-600 font-black text-xl">
                        {mesas[mesaActual]?.tipo === "domicilio" 
                          ? `Domicilio D${mesaActual - 9}` 
                          : `Mesa M${mesaActual + 1}`
                        }
                      </span>
                      {mesas[mesaActual]?.domicilio > 0 && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                          +${mesas[mesaActual].domicilio.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* INDICADOR DE FECHA EN ORDEN */}
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">📅</span>
                  <div className="text-sm">
                    <div className="font-bold text-blue-800">Fecha: {fechaActiva || "No seleccionada"}</div>
                    <div className="text-xs text-blue-600">
                      Las ventas se guardarán con esta fecha en los reportes
                    </div>
                  </div>
                </div>
              </div>
              
              {/* ESTADÍSTICAS RÁPIDAS */}
              {ordenTemporal.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="stat-card">
                    <div className="stat-label">Productos</div>
                    <div className="stat-value">{calcularProductosUnicos()}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Items</div>
                    <div className="stat-value">{calcularTotalItems()}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Subtotal</div>
                    <div className="stat-value text-green-600">${calcularTotalTemporal().toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>

            {/* LISTA DE PRODUCTOS */}
            <div className="flex-1 overflow-y-auto mb-8">
              {ordenTemporal.length === 0 ? (
                <div className="empty-state-order text-center py-12">
                  <div className="text-gray-300 text-6xl mb-4">🛒</div>
                  <p className="text-gray-600 font-bold mb-2 text-lg">Orden vacía</p>
                  <p className="text-gray-400">Haz clic en "Escoger Productos" para agregar items</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ordenTemporal.map((p, i) => {
                    const cantidad = p.cantidad || 1;
                    const totalProducto = getPrice(p) * cantidad;
                    
                    return (
                      <div key={i} className="order-item-compact">
                        <div className="flex items-center justify-between">
                          {/* CONTROLES DE CANTIDAD */}
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => decreaseQuantity(i)}
                              className="quantity-btn-compact decrease"
                              title="Disminuir"
                            >
                              −
                            </button>
                            <div className="quantity-display-compact">
                              <span className="font-bold text-lg">{cantidad}</span>
                            </div>
                            <button 
                              onClick={() => increaseQuantity(i)}
                              className="quantity-btn-compact increase"
                              title="Aumentar"
                            >
                              ＋
                            </button>
                          </div>
                          
                          {/* NOMBRE Y PRECIO */}
                          <div className="flex-1 mx-4 min-w-0">
                            <div className="font-bold text-gray-800 truncate">
                              {getName(p)}
                            </div>
                            <div className="text-xs text-gray-600 flex items-center gap-2 mt-1">
                              <span className="font-bold text-green-600">
                                ${totalProducto.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          
                          {/* ACCIONES */}
                          <div className="flex gap-1">
                            <button 
                              onClick={() => abrirNota(i)} 
                              className={`action-btn-compact ${p.nota ? 'has-note' : ''}`}
                              title={p.nota || "Agregar nota"}
                            >
                              {p.nota ? "📝" : "✏️"}
                            </button>
                            <button 
                              onClick={() => removeFromTemp(i)} 
                              className="action-btn-compact delete"
                              title="Eliminar"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        
                        {/* NOTA */}
                        {p.nota && (
                          <div className="note-preview mt-2">
                            <div className="text-xs font-semibold text-yellow-700 mb-1">📝 Nota:</div>
                            <div className="text-sm text-gray-700 bg-yellow-50 p-2 rounded border border-yellow-200">
                              {p.nota}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RESUMEN FINAL */}
            <div className="summary-final mb-8">
              <div className="space-y-4">
                {mesaActual !== null && mesas[mesaActual]?.domicilio > 0 && (
                  <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-600 text-xl">🚚</span>
                      <div>
                        <div className="font-bold text-gray-800">Domicilio</div>
                        <div className="text-sm text-gray-600">Entrega a domicilio</div>
                      </div>
                    </div>
                    <span className="font-bold text-green-600 text-lg">
                      +${mesas[mesaActual].domicilio.toLocaleString()}
                    </span>
                  </div>
                )}
                
                <div className="total-final">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xl font-bold text-gray-800">Subtotal:</span>
                    <span className="text-2xl font-black text-gray-800">
                      ${calcularTotalTemporal().toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-300 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-black text-gray-900">TOTAL:</span>
                      <span className="text-3xl font-black text-green-600">
                        ${(calcularTotalTemporal() + (mesaActual !== null ? mesas[mesaActual]?.domicilio || 0 : 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="space-y-3 mt-auto">
              <button
                onClick={enviarACocina}
                className="btn-gradient-success w-full py-4 text-lg font-black"
                disabled={ordenTemporal.length === 0}
              >
                🚀 Enviar a Cocina
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={generarFacturaMesa}
                  className="btn-gradient-purple w-full py-3 font-bold"
                  disabled={mesaActual === null || mesas[mesaActual]?.items.length === 0}
                >
                  📄 Factura
                </button>

                <button
                  onClick={abrirModalCobrar}
                  className="btn-gradient-primary w-full py-3 font-bold"
                  disabled={mesaActual === null || mesas[mesaActual]?.items.length === 0 || !fechaActiva}
                  title={!fechaActiva ? "Selecciona una fecha en Reportes primero" : "Cobrar mesa"}
                >
                  💰 Cobrar
                </button>
              </div>

              <button
                onClick={abrirDividirCuenta}
                className="btn-gradient-orange w-full py-3 font-bold"
                disabled={mesaActual === null || totalMesaEnCocina(mesaActual) === 0 || !fechaActiva}
                title={!fechaActiva ? "Selecciona una fecha en Reportes primero" : "Dividir cuenta"}
              >
                👥 Dividir Cuenta
              </button>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <Link
                  to="/kitchen"
                  className="btn-gradient-indigo text-center py-3 font-bold"
                >
                  👨‍🍳 Cocina
                </Link>

                <Link
                  to="/reportes"
                  className="btn-gradient-purple text-center py-3 font-bold"
                >
                  📊 Reportes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALES */}
      {showMesaPedido && mesaSeleccionadaPedido !== null && (
        <div className="modal-overlay">
          <div className="modal-content-large">
            <div className="modal-header">
              <h3>
                📋 Pedido de {mesas[mesaSeleccionadaPedido]?.tipo === "domicilio" 
                  ? `Domicilio D${mesaSeleccionadaPedido - 9}` 
                  : `Mesa M${mesaSeleccionadaPedido + 1}`}
              </h3>
              <button 
                onClick={cerrarModalPedidoMesa} 
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {(!mesas[mesaSeleccionadaPedido]?.items || mesas[mesaSeleccionadaPedido]?.items.length === 0) ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📭</div>
                  <p className="text-gray-600 font-bold mb-2">No hay productos en esta mesa</p>
                  <p className="text-gray-400">Agrega productos desde la orden temporal</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="resumen-dividir p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-blue-700 font-semibold">Total Productos</div>
                        <div className="text-2xl font-black text-blue-900">
                          {mesas[mesaSeleccionadaPedido].items.length}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-green-700 font-semibold">Total a Pagar</div>
                        <div className="text-2xl font-black text-green-700">
                          ${totalMesaEnCocina(mesaSeleccionadaPedido).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-lg mb-3 text-gray-800">Productos en la mesa:</h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {mesas[mesaSeleccionadaPedido].items.map((item, index) => {
                        const cantidad = item.cantidad || 1;
                        const totalProducto = item.precio * cantidad;
                        
                        return (
                          <div key={index} className="producto-detalle bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-bold text-gray-800 text-lg">{item.nombre}</div>
                                <div className="text-sm text-gray-600">
                                  Cantidad: <span className="font-bold">{cantidad}</span>
                                </div>
                                {item.nota && (
                                  <div className="text-sm text-yellow-700 bg-yellow-50 px-2 py-1 rounded mt-2">
                                    📝 {item.nota}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-lg text-green-600">
                                  ${totalProducto.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {mesas[mesaSeleccionadaPedido].domicilio > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🚚</span>
                          <div>
                            <div className="font-bold text-gray-800">Domicilio</div>
                            <div className="text-sm text-gray-600">Costo de entrega</div>
                          </div>
                        </div>
                        <div className="font-bold text-2xl text-green-700">
                          +${mesas[mesaSeleccionadaPedido].domicilio.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="modal-footer mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-center">
                <button
                  onClick={cerrarModalPedidoMesa}
                  className="btn btn-blue px-8"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE HISTORIAL */}
      {showHistorial && historialMesa !== null && (
        <div className="historial-modal">
          <div className="historial-content">
            <div className="historial-header">
              <h3>📋 Historial de {mesas[historialMesa]?.tipo === "domicilio" 
                ? `Domicilio D${historialMesa - 9}` 
                : `Mesa M${historialMesa + 1}`}
              </h3>
              <button 
                onClick={() => setShowHistorial(false)} 
                className="historial-close"
              >
                ×
              </button>
            </div>
            
            <div className="historial-body">
              {(!historialVentas[historialMesa] || historialVentas[historialMesa].length === 0) ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📭</div>
                  <p className="text-gray-600 font-bold mb-2">No hay historial de ventas</p>
                  <p className="text-gray-400">Los pedidos aparecerán aquí después de cobrar</p>
                </div>
              ) : (
                <div className="historial-list">
                  {historialVentas[historialMesa]
                    .slice()
                    .reverse()
                    .map((venta) => (
                      <div key={venta.id} className="historial-item">
                        <div className="historial-fecha">
                          <span>📅</span>
                          {new Date(venta.fecha).toLocaleDateString('es-CO', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {venta.dividido && (
                            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded-full ml-2">
                              Dividido
                            </span>
                          )}
                        </div>
                        
                        <div className="historial-products">
                          {venta.items.map((item, idx) => (
                            <div key={idx} className="historial-product">
                              <div className="flex items-center gap-2">
                                <span>{item.nombre}</span>
                                <span className="text-gray-500 text-sm">
                                  × {item.cantidad || 1}
                                </span>
                              </div>
                              <span className="font-bold">
                                ${((item.precio || 0) * (item.cantidad || 1)).toLocaleString()}
                              </span>
                            </div>
                          ))}
                          
                          {venta.domicilio > 0 && (
                            <div className="historial-product">
                              <span className="flex items-center gap-2">
                                <span>🚚 Domicilio</span>
                              </span>
                              <span className="font-bold text-green-600">
                                +${venta.domicilio.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="historial-total">
                          <div>
                            <span className="font-bold">Total:</span>
                            <span className="text-sm text-gray-600 ml-2">
                              {venta.metodo === "efectivo" ? "💵 Efectivo" : 
                               venta.metodo === "nequi" ? "📱 Nequi" : 
                               venta.metodo === "mixto" ? "🔄 Mixto" : 
                               venta.metodo === "dividido" ? "👥 Dividido" : "Otro"}
                            </span>
                          </div>
                          <span className="text-2xl font-black text-green-600">
                            ${venta.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            
            <div className="historial-footer mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between">
                <button
                  onClick={limpiarHistorialMesa}
                  className="btn btn-gray"
                  disabled={!historialVentas[historialMesa]?.length}
                >
                  🗑️ Limpiar historial
                </button>
                <button
                  onClick={() => setShowHistorial(false)}
                  className="btn btn-blue"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE SELECCIÓN DE PRODUCTOS */}
      {showMenuSeleccion && (
        <div className="modal-overlay">
          <div className="modal-content-large">
            <div className="modal-header">
              <h3>🛒 Seleccionar productos para {mesaActual !== null ? 
                (mesas[mesaActual]?.tipo === "domicilio" ? 
                  `Domicilio D${mesaActual - 9}` : 
                  `Mesa M${mesaActual + 1}`) : 
                "la orden"}</h3>
              <button
                onClick={() => {
                  setShowMenuSeleccion(false);
                  setCategoriaSeleccionada(null);
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {!categoriaSeleccionada ? (
                <div>
                  <h4 className="modal-subtitle">Selecciona una categoría:</h4>
                  <div className="categorias-grid">
                    {categorias.map((categoria) => (
                      <button
                        key={categoria}
                        onClick={() => setCategoriaSeleccionada(categoria)}
                        className="categoria-btn-modal"
                      >
                        <div className="categoria-icon">{getIconoPorCategoria(categoria)}</div>
                        <div className="categoria-nombre">{categoria}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="modal-back">
                    <button
                      onClick={() => setCategoriaSeleccionada(null)}
                      className="btn-back"
                    >
                      ← Volver
                    </button>
                    <h4 className="modal-categoria">{categoriaSeleccionada}</h4>
                  </div>
                  
                  {productosFiltrados.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No hay productos en esta categoría
                    </p>
                  ) : (
                    <div className="productos-grid">
                      {productosFiltrados.map((producto) => {
                        const productId = getId(producto);
                        const enOrden = ordenTemporal.find(p => getId(p) === productId);
                        const cantidad = enOrden ? (enOrden.cantidad || 1) : 0;
                        
                        return (
                          <button
                            key={productId}
                            onClick={() => addToTemp(producto)}
                            className={`producto-btn-modal ${cantidad > 0 ? 'producto-selected' : ''}`}
                          >
                            <div className="producto-nombre-modal">{getName(producto)}</div>
                            <div className="producto-precio-modal">
                              ${getPrice(producto).toLocaleString()}
                            </div>
                            {cantidad > 0 && (
                              <div className="producto-cantidad-badge">
                                Seleccionado: {cantidad}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <div className="modal-total">
                <div className="modal-total-label">Total seleccionado:</div>
                <div className="modal-total-valor">
                  ${calcularSubtotalProductos().toLocaleString()}
                </div>
                <div className="modal-total-count">
                  {ordenTemporal.length} productos • {calcularTotalItems()} items
                </div>
              </div>
              <div className="modal-actions">
                <button
                  onClick={() => {
                    setOrdenTemporal([]);
                    setCategoriaSeleccionada(null);
                  }}
                  className="btn btn-gray"
                >
                  Limpiar todo
                </button>
                <button
                  onClick={() => setShowMenuSeleccion(false)}
                  className="btn btn-orange"
                >
                  Listo ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE COBRAR */}
      {openCobrar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>💰 Cobrar {mesas[mesaActual]?.tipo === "domicilio" ? 
                `Domicilio D${mesaActual - 9}` : 
                `Mesa M${mesaActual + 1}`}</h3>
              <button onClick={() => setOpenCobrar(false)} className="modal-close">
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {/* INDICADOR DE FECHA EN MODAL DE COBRO */}
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">📅</span>
                  <div>
                    <div className="font-bold text-blue-800">Venta se guardará con fecha:</div>
                    <div className="text-lg font-black text-blue-900">{fechaActiva}</div>
                  </div>
                </div>
              </div>
              
              <div className="cobro-total">
                <div className="cobro-total-label">Total a pagar:</div>
                <div className="cobro-total-valor">${totalAPagar.toLocaleString()}</div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de pago:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setMetodoPago("efectivo")}
                    className={`p-3 rounded-lg border-2 ${metodoPago === "efectivo" 
                      ? "border-green-500 bg-green-50" 
                      : "border-gray-200"}`}
                  >
                    💵 Efectivo
                  </button>
                  <button
                    onClick={() => setMetodoPago("nequi")}
                    className={`p-3 rounded-lg border-2 ${metodoPago === "nequi" 
                      ? "border-purple-500 bg-purple-50" 
                      : "border-gray-200"}`}
                  >
                    📱 Nequi
                  </button>
                  <button
                    onClick={() => setMetodoPago("mixto")}
                    className={`p-3 rounded-lg border-2 ${metodoPago === "mixto" 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-200"}`}
                  >
                    🔄 Mixto
                  </button>
                </div>
              </div>
              
              {(metodoPago === "efectivo" || metodoPago === "mixto") && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Efectivo recibido:
                  </label>
                  <input
                    type="number"
                    value={montoEfectivo}
                    onChange={(e) => setMontoEfectivo(e.target.value)}
                    placeholder="0"
                    className="modern-input"
                  />
                  {metodoPago === "mixto" && (
                    <div className="text-xs text-gray-500 mt-1">
                      Monto en efectivo (el resto será Nequi)
                    </div>
                  )}
                </div>
              )}
              
              {(metodoPago === "nequi" || metodoPago === "mixto") && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nequi recibido:
                  </label>
                  <input
                    type="number"
                    value={montoNequi}
                    onChange={(e) => setMontoNequi(e.target.value)}
                    placeholder="0"
                    className="modern-input"
                  />
                  <div className="text-sm text-gray-600 mt-2">
                    <div>📱 Nequi: <span className="font-bold">{NEQUI_NUM}</span></div>
                    <div>👤 Titular: <span className="font-bold">{NEQUI_TITULAR}</span></div>
                  </div>
                  {metodoPago === "mixto" && (
                    <div className="text-xs text-gray-500 mt-1">
                      Monto en Nequi (complementa el efectivo)
                    </div>
                  )}
                </div>
              )}
              
              <div className="cobro-resumen p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Total a pagar:</span>
                  <span className="font-bold">${totalAPagar.toLocaleString()}</span>
                </div>
                {metodoPago === "mixto" && (
                  <>
                    <div className="flex justify-between mb-2">
                      <span>Efectivo:</span>
                      <span className="font-bold text-green-600">${efectivoNum.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Nequi:</span>
                      <span className="font-bold text-purple-600">${nequiNum.toLocaleString()}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between mb-2">
                  <span>Recibido total:</span>
                  <span className="font-bold">${recibidoTotal.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-bold">Diferencia:</span>
                    <span className={`font-bold text-lg ${diferencia >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {diferencia >= 0 ? "Vuelto:" : "Falta:"} ${Math.abs(diferencia).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setOpenCobrar(false)}
                className="btn btn-gray"
              >
                Cancelar
              </button>
              <button
                onClick={procesarPago}
                className="btn btn-green"
                disabled={recibidoTotal < totalAPagar}
              >
                ✅ Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DIVIDIR CUENTA */}
      {showDividirCuenta && (
        <div className="modal-overlay">
          <div className="modal-content-large">
            <div className="modal-header">
              <h3>👥 Dividir cuenta de {mesas[mesaActual]?.tipo === "domicilio" ? 
                `Domicilio D${mesaActual - 9}` : 
                `Mesa M${mesaActual + 1}`}</h3>
              <button onClick={() => setShowDividirCuenta(false)} className="modal-close">
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de personas:
                </label>
                <div className="flex items-center gap-2">
                  {[2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      onClick={() => setPersonasDividir(num)}
                      className={`px-4 py-2 rounded-lg border-2 ${
                        personasDividir === num
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200"
                      }`}
                    >
                      {num} personas
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-bold text-lg mb-3">Asignar productos:</h4>
                <div className="space-y-3">
                  {mesas[mesaActual]?.items.map((item, index) => {
                    const asignadoA = productosAsignados[index];
                    return (
                      <div key={index} className="producto-asignar">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold">{item.nombre}</div>
                            <div className="text-sm text-gray-600">
                              ${item.precio.toLocaleString()} × {item.cantidad || 1}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={asignadoA || ""}
                              onChange={(e) => {
                                if (e.target.value === "todos") {
                                  dividirProducto(index);
                                } else {
                                  asignarProducto(index, parseInt(e.target.value));
                                }
                              }}
                              className="modern-input"
                            >
                              <option value="">Sin asignar</option>
                              {Array.from({ length: personasDividir }, (_, i) => i + 1).map((p) => (
                                <option key={p} value={p}>
                                  Persona {p}
                                </option>
                              ))}
                              <option value="todos">Dividir entre todos</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="resumen-dividir p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-lg mb-3">Resumen por persona:</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: personasDividir }, (_, i) => i + 1).map((persona) => (
                    <div key={persona} className="bg-white p-3 rounded border">
                      <div className="font-bold text-gray-800">Persona {persona}</div>
                      <div className="text-green-600 font-bold text-lg">
                        ${calcularSubtotalPersona(persona).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-yellow-600 text-xl">⚠️</span>
                  <div>
                    <div className="font-bold text-yellow-700">
                      {productosSinAsignar()} productos sin asignar
                    </div>
                    <p className="text-sm text-yellow-600">
                      Asigna todos los productos antes de continuar
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowDividirCuenta(false)}
                className="btn btn-gray"
              >
                Cancelar
              </button>
              <button
                onClick={irAPagoIndividual}
                className="btn btn-orange"
                disabled={productosSinAsignar() > 0}
              >
                Continuar con pagos individuales
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PAGO INDIVIDUAL */}
      {showPagoIndividual && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>💳 Pago individual - Persona {personaAPagar}</h3>
              <button onClick={() => setShowPagoIndividual(false)} className="modal-close">
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="mb-6 text-center">
                <div className="text-6xl mb-4">👤</div>
                <div className="text-3xl font-bold text-gray-800">Persona {personaAPagar}</div>
                <div className="text-sm text-gray-600">
                  de {personasDividir} personas
                </div>
              </div>
              
              <div className="mb-6">
                <div className="cobro-total">
                  <div className="cobro-total-label">Total a pagar:</div>
                  <div className="cobro-total-valor">
                    ${calcularSubtotalPersona(personaAPagar).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-bold mb-3">Productos asignados:</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {mesas[mesaActual]?.items
                    .filter((_, index) => {
                      const asignadoA = productosAsignados[index];
                      return asignadoA === personaAPagar || asignadoA === "todos";
                    })
                    .map((item, index) => {
                      const asignadoA = productosAsignados[index];
                      let cantidad = item.cantidad || 1;
                      if (asignadoA === "todos") {
                        cantidad = cantidad / personasDividir;
                      }
                      
                      return (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <div className="truncate">{item.nombre}</div>
                          <div className="font-bold">
                            ${item.precio.toLocaleString()} × {cantidad.toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-green-800">Total Persona {personaAPagar}</div>
                    <div className="text-sm text-green-600">Incluye domicilio dividido</div>
                  </div>
                  <div className="text-2xl font-black text-green-600">
                    ${calcularSubtotalPersona(personaAPagar).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowPagoIndividual(false)}
                className="btn btn-gray"
              >
                Cancelar
              </button>
              <button
                onClick={() => pagarPersona(personaAPagar)}
                className="btn btn-green"
              >
                ✅ Registrar pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE NOTA */}
      {showNotaModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>📝 Agregar nota</h3>
              <button onClick={() => setShowNotaModal(false)} className="modal-close">
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <textarea
                value={notaTemp}
                onChange={(e) => setNotaTemp(e.target.value)}
                placeholder="Ej: Sin cebolla, bien cocido, etc."
                className="modern-textarea"
                rows="4"
              />
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowNotaModal(false)}
                className="btn btn-gray"
              >
                Cancelar
              </button>
              <button
                onClick={guardarNota}
                className="btn btn-blue"
              >
                Guardar nota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}