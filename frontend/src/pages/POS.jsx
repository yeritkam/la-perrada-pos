// src/pages/POS.jsx - VERSIÓN FINAL SIN AREPAS
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import products from "../data/products.js";
import PDFGenerator from "../components/PDFGenerator";
import syncStorage from "../firebase/storage.js";
import "../App.css";

export default function POS() {
  const [mesaActual, setMesaActual] = useState(null);
  const [ordenTemporal, setOrdenTemporal] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [showMesaPedido, setShowMesaPedido] = useState(false);
  const [mesaSeleccionadaPedido, setMesaSeleccionadaPedido] = useState(null);
  const [showAgregarProductos, setShowAgregarProductos] = useState(false);
  
  const [fechaActiva, setFechaActiva] = useState(() => {
    return localStorage.getItem("fechaActiva") || "";
  });
  
  const [estadoCaja, setEstadoCaja] = useState(() => {
    return localStorage.getItem("estadoCaja") || "cerrada";
  });

  const [mesas, setMesas] = useState(() => {
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
        return mesasIniciales;
      }
    } catch (error) {
      console.warn("⚠️ POS: Error cargando mesas:", error);
    }
    return Array.from({ length: 15 }, (_, i) => ({
      items: [],
      estado: "vacia",
      tipo: i >= 10 ? "domicilio" : "mesa",
      domicilio: 0,
      pedidoNumero: 0,
      timestamp: Date.now()
    }));
  });

  // Firebase sincronización
  useEffect(() => {
    const loadFechaYEstado = async () => {
      try {
        const fechaFirebase = await syncStorage.getItem("fechaActiva");
        if (fechaFirebase && fechaFirebase !== "") {
          setFechaActiva(fechaFirebase);
          localStorage.setItem("fechaActiva", fechaFirebase);
        }
        const estadoFirebase = await syncStorage.getItem("estadoCaja");
        if (estadoFirebase !== null) {
          setEstadoCaja(estadoFirebase);
          localStorage.setItem("estadoCaja", estadoFirebase);
        }
      } catch (error) {
        console.error("Error cargando:", error);
      }
    };
    loadFechaYEstado();
    const unsubscribeFecha = syncStorage.syncItem("fechaActiva", (newFecha) => {
      if (newFecha) setFechaActiva(newFecha);
    });
    const unsubscribeEstado = syncStorage.syncItem("estadoCaja", (newEstado) => {
      if (newEstado) setEstadoCaja(newEstado);
    });
    return () => {
      unsubscribeFecha?.();
      unsubscribeEstado?.();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe = null;
    const initSync = async () => {
      try {
        const firebaseData = await syncStorage.getItem("orders");
        if (firebaseData && isMounted) {
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
            }
            return { items: [], estado: "vacia", tipo: i >= 10 ? "domicilio" : "mesa", domicilio: 0, pedidoNumero: 0, timestamp: Date.now() };
          });
          setMesas(nuevasMesas);
          localStorage.setItem("orders", JSON.stringify(nuevasMesas));
        }
        if (isMounted) {
          unsubscribe = syncStorage.syncItem("orders", (newOrders) => {
            if (newOrders && isMounted) {
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
                }
                return { items: [], estado: "vacia", tipo: i >= 10 ? "domicilio" : "mesa", domicilio: 0, pedidoNumero: 0, timestamp: Date.now() };
              });
              setMesas(nuevasMesas);
              localStorage.setItem("orders", JSON.stringify(nuevasMesas));
            }
          });
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    initSync();
    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const [historialVentas, setHistorialVentas] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('historialVentas')) || {};
    } catch (error) {
      return {};
    }
  });

  useEffect(() => {
    let unsubscribeHistorial = null;
    const loadHistorial = async () => {
      try {
        const firebaseHistorial = await syncStorage.getItem("historialVentas");
        if (firebaseHistorial) {
          setHistorialVentas(firebaseHistorial);
          localStorage.setItem("historialVentas", JSON.stringify(firebaseHistorial));
        }
      } catch (error) {
        console.warn("Error:", error);
      }
    };
    loadHistorial();
    unsubscribeHistorial = syncStorage.syncItem("historialVentas", (newHistorial) => {
      if (newHistorial) {
        setHistorialVentas(newHistorial);
        localStorage.setItem("historialVentas", JSON.stringify(newHistorial));
      }
    });
    return () => {
      if (unsubscribeHistorial) unsubscribeHistorial();
    };
  }, []);

  const [openCobrar, setOpenCobrar] = useState(false);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [montoEfectivo, setMontoEfectivo] = useState("");
  const [montoNequi, setMontoNequi] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [notaTemp, setNotaTemp] = useState("");
  const [showNotaModal, setShowNotaModal] = useState(false);
  const [showDividirCuenta, setShowDividirCuenta] = useState(false);
  const [personasDividir, setPersonasDividir] = useState(2);
  const [productosAsignados, setProductosAsignados] = useState({});
  const [showPagoIndividual, setShowPagoIndividual] = useState(false);
  const [personaAPagar, setPersonaAPagar] = useState(1);
  const [pagosRealizados, setPagosRealizados] = useState({});

  const NEQUI_NUM = "304 649 2391";
  const NEQUI_TITULAR = "Gerson Soto";

  const getName = (p) => p.nombre ?? p.name ?? "Producto";
  const getPrice = (p) => p.precio ?? p.price ?? 0;
  const getCat = (p) => p.categoria ?? p.category ?? "Sin categoría";
  const getId = (p) => p.id ?? p._id ?? Math.random().toString();

  const getLogoPath = () => {
    if (window.location.hostname.includes('github.io')) {
      return '/la-perrada-pos/logo.png';
    }
    return '/logo.png';
  };

  const guardarPedidoDesdeModal = async () => {
    if (mesaSeleccionadaPedido === null) {
      alert("Error: No hay mesa seleccionada");
      return;
    }
    if (ordenTemporal.length === 0) {
      alert("No hay productos para guardar");
      return;
    }

    const productosParaEnviar = ordenTemporal.map((p) => ({
      id: getId(p),
      nombre: getName(p),
      precio: getPrice(p),
      cantidad: p.cantidad || 1,
      nota: p.nota || "",
    }));

    const mesa = mesas[mesaSeleccionadaPedido];
    const isEditing = mesa?.estado === "listo";
    
    let itemsActuales = [];
    if (isEditing) {
      itemsActuales = [...productosParaEnviar];
    } else {
      itemsActuales = [...(mesa?.items || [])];
      productosParaEnviar.forEach(nuevoProducto => {
        const existingIndex = itemsActuales.findIndex(item => item.id === nuevoProducto.id);
        if (existingIndex >= 0) {
          itemsActuales[existingIndex].cantidad += nuevoProducto.cantidad;
        } else {
          itemsActuales.push({ ...nuevoProducto, cantidad: nuevoProducto.cantidad || 1 });
        }
      });
    }

    const nuevasMesas = [...mesas];
    nuevasMesas[mesaSeleccionadaPedido] = {
      ...nuevasMesas[mesaSeleccionadaPedido],
      items: itemsActuales,
      estado: "listo",
      pedidoNumero: isEditing ? (mesa?.pedidoNumero || 1) : (mesa?.pedidoNumero || 0) + 1,
      timestamp: isEditing ? (mesa?.timestamp || Date.now()) : Date.now()
    };
    
    await saveMesas(nuevasMesas);
    setOrdenTemporal([]);
    setShowAgregarProductos(false);
    setShowMesaPedido(false);
    setCategoriaSeleccionada(null);
    alert(`✅ Pedido guardado - ¡Listo para cobrar!`);
  };

  const abrirEditarPedido = (mesaIndex) => {
    const mesa = mesas[mesaIndex];
    if (!mesa || mesa.estado !== "listo") {
      alert("Solo puedes editar pedidos activos");
      return;
    }
    if (mesa.items.length === 0) {
      alert("No hay productos para editar");
      return;
    }
    setMesaSeleccionadaPedido(mesaIndex);
    setOrdenTemporal(mesa.items.map(item => ({ ...item, cantidad: item.cantidad || 1, nota: item.nota || "" })));
    setShowMesaPedido(false);
    setShowAgregarProductos(true);
    setCategoriaSeleccionada(null);
  };

  const abrirAgregarProductos = (mesaIndex) => {
    const mesa = mesas[mesaIndex];
    setMesaSeleccionadaPedido(mesaIndex);
    setOrdenTemporal(mesa.items.map(item => ({ ...item, cantidad: item.cantidad || 1, nota: item.nota || "" })));
    setShowAgregarProductos(true);
    setShowMesaPedido(false);
    setCategoriaSeleccionada(null);
  };

  const cobrarDesdeModal = (mesaIndex) => {
    if (!fechaActiva) {
      alert("⚠️ No hay fecha activa. Ve a Reportes.");
      return;
    }
    const mesa = mesas[mesaIndex] || { items: [] };
    if (!mesa.items.length) {
      alert("La mesa no tiene pedidos");
      return;
    }
    setMesaActual(mesaIndex);
    setMetodoPago("efectivo");
    setMontoEfectivo("");
    setMontoNequi("");
    setOpenCobrar(true);
    setShowMesaPedido(false);
  };

  const dividirCuentaDesdeModal = (mesaIndex) => {
    if (!fechaActiva) {
      alert("⚠️ No hay fecha activa. Ve a Reportes.");
      return;
    }
    const mesa = mesas[mesaIndex] || { items: [] };
    if (!mesa.items.length) {
      alert("La mesa no tiene pedidos para dividir");
      return;
    }
    setMesaActual(mesaIndex);
    const inicialAsignacion = {};
    mesa.items.forEach((item, index) => { inicialAsignacion[index] = null; });
    setProductosAsignados(inicialAsignacion);
    setPersonasDividir(2);
    setPagosRealizados({});
    setShowDividirCuenta(true);
    setShowPagoIndividual(false);
    setShowMesaPedido(false);
  };

  const generarFacturaDesdeModal = (mesaIndex) => {
    const mesa = mesas[mesaIndex] || { items: [], domicilio: 0 };
    if (!mesa.items.length) {
      alert("La mesa no tiene pedidos");
      return;
    }
    const subtotalProductos = mesa.items.reduce((sum, item) => sum + (item.precio * (item.cantidad || 1)), 0);
    const domicilio = mesa.domicilio || 0;
    const totalConDomicilio = subtotalProductos + domicilio;
    const datosFactura = {
      id: Date.now(),
      nombre: mesa.tipo === "domicilio" ? `Cliente Domicilio ${mesaIndex - 9}` : `Mesa ${mesaIndex + 1}`,
      celular: "",
      tipo: mesa.tipo || "mesa",
      fechaVenta: fechaActiva || new Date().toISOString().split('T')[0],
      valor: totalConDomicilio,
      domicilio: domicilio,
      items: mesa.items.map(item => ({
        id: item.id || Math.random(),
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad || 1
      }))
    };
    PDFGenerator.generarFacturaVenta(datosFactura);
    alert("✅ Factura generada");
  };

  const saveMesas = async (nuevasMesas) => {
    try {
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
        return { items: [], estado: "vacia", tipo: i >= 10 ? "domicilio" : "mesa", domicilio: 0, pedidoNumero: 0, timestamp: Date.now() };
      });
      setMesas(mesasCompletas);
      localStorage.setItem("orders", JSON.stringify(mesasCompletas));
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
    } catch (error) {
      console.error("Error guardando:", error);
    }
  };

  const saveSales = async (nuevasVentas) => {
    try {
      const ventasConFecha = nuevasVentas.map(venta => ({
        ...venta,
        fecha: venta.fecha || (fechaActiva ? `${fechaActiva}T${new Date().toTimeString().split(' ')[0]}` : new Date().toISOString()),
        fechaSimple: fechaActiva || new Date().toISOString().split('T')[0]
      }));
      await syncStorage.setItem("sales", ventasConFecha);
      localStorage.setItem("sales", JSON.stringify(ventasConFecha));
    } catch (error) {
      console.error("Error:", error);
      localStorage.setItem("sales", JSON.stringify(nuevasVentas));
    }
  };

  // CATEGORÍAS ACTUALIZADAS - SIN AREPAS
  const categorias = [
    "Perros calientes", "Hamburguesas", "Suizos", "Salchipapa", "Picadas",
    "Bebidas", "Adiciones", "Combos"
  ];

  const getIconoPorCategoria = (categoria) => {
    const iconos = {
      "Perros calientes": "🌭",
      "Hamburguesas": "🍔",
      "Suizos": "🧀",
      "Salchipapa": "🍟",
      "Picadas": "🥘",
      "Bebidas": "🥤",
      "Adiciones": "➕",
      "Combos": "🎯"
    };
    return iconos[categoria] || "🍕";
  };

  const productosFiltrados = categoriaSeleccionada 
    ? products.filter((p) => getCat(p) === categoriaSeleccionada)
    : [];

  const handleDobleClickMesa = (index) => {
    setMesaSeleccionadaPedido(index);
    setShowMesaPedido(true);
  };

  const addToTemp = (prod) => {
    const productId = getId(prod);
    setOrdenTemporal((currentItems) => {
      const existingIndex = currentItems.findIndex(item => getId(item) === productId);
      if (existingIndex >= 0) {
        const updatedItems = [...currentItems];
        updatedItems[existingIndex] = { ...updatedItems[existingIndex], cantidad: (updatedItems[existingIndex].cantidad || 1) + 1 };
        return updatedItems;
      } else {
        return [...currentItems, { ...prod, cantidad: 1, nota: "" }];
      }
    });
  };

  const increaseQuantity = (index) => {
    setOrdenTemporal((currentItems) => {
      const updatedItems = [...currentItems];
      updatedItems[index] = { ...updatedItems[index], cantidad: (updatedItems[index].cantidad || 1) + 1 };
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
        updatedItems[index] = { ...updatedItems[index], cantidad: currentQuantity - 1 };
        return updatedItems;
      }
    });
  };

  const removeFromTemp = (index) => {
    setOrdenTemporal((currentItems) => currentItems.filter((_, i) => i !== index));
  };

  const calcularProductosUnicos = () => ordenTemporal.length;
  const calcularTotalItems = () => ordenTemporal.reduce((total, item) => total + (item.cantidad || 1), 0);
  const calcularTotalTemporal = () => ordenTemporal.reduce((total, item) => total + ((item.cantidad || 1) * getPrice(item)), 0);
  const calcularSubtotalProductos = () => ordenTemporal.reduce((total, prod) => total + (getPrice(prod) * (prod.cantidad || 1)), 0);
  const calcularTotalConDomicilio = () => {
    const subtotal = calcularTotalTemporal();
    const costoDomicilio = mesaActual !== null ? mesas[mesaActual]?.domicilio || 0 : 0;
    return subtotal + costoDomicilio;
  };

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

  const actualizarPrecioDomicilio = async (mesaIndex, nuevoPrecio) => {
    const nuevasMesas = [...mesas];
    nuevasMesas[mesaIndex] = { ...nuevasMesas[mesaIndex], domicilio: nuevoPrecio };
    await saveMesas(nuevasMesas);
  };

  const totalMesaEnCocina = (idx) => {
    const mesa = mesas[idx] || { items: [], domicilio: 0 };
    const totalProductos = (mesa.items || []).reduce((s, it) => s + (it.precio * (it.cantidad || 1)), 0);
    return totalProductos + (mesa.domicilio || 0);
  };

  const abrirModalCobrar = () => {
    if (!fechaActiva) {
      alert("⚠️ No hay fecha activa. Ve a Reportes.");
      return;
    }
    if (mesaActual === null) return alert("Selecciona una mesa");
    const mesa = mesas[mesaActual] || { items: [] };
    if (!mesa.items.length) return alert("La mesa no tiene pedidos");
    setMetodoPago("efectivo");
    setMontoEfectivo("");
    setMontoNequi("");
    setOpenCobrar(true);
  };

  const totalAPagar = mesaActual === null ? 0 : totalMesaEnCocina(mesaActual);

  const parseNumber = (v) => {
    const n = Number(String(v).replace(/[^0-9.-]+/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const efectivoNum = parseNumber(montoEfectivo);
  const nequiNum = parseNumber(montoNequi);
  const recibidoTotal = metodoPago === "efectivo" ? efectivoNum : metodoPago === "nequi" ? nequiNum : efectivoNum + nequiNum;
  const diferencia = recibidoTotal - totalAPagar;

  const procesarPago = async () => {
    if (metodoPago === "mixto" && (efectivoNum <= 0 || nequiNum <= 0)) {
      alert("Pago mixto requiere ambos métodos");
      return;
    }
    if (recibidoTotal < totalAPagar) {
      alert(`Faltan $${(totalAPagar - recibidoTotal).toLocaleString()}`);
      return;
    }

    let ventas = [];
    try {
      const savedSales = await syncStorage.getItem("sales");
      ventas = (savedSales && Array.isArray(savedSales)) ? savedSales : (localStorage.getItem("sales") ? JSON.parse(localStorage.getItem("sales")) : []);
    } catch (error) {
      ventas = localStorage.getItem("sales") ? JSON.parse(localStorage.getItem("sales")) : [];
    }

    const fechaISO = fechaActiva ? `${fechaActiva}T${new Date().toTimeString().split(' ')[0]}` : new Date().toISOString();
    const subtotalProductos = (mesas[mesaActual].items || []).reduce((sum, item) => sum + (item.precio * (item.cantidad || 1)), 0);
    const domicilio = mesas[mesaActual].domicilio || 0;
    
    const nuevaVenta = {
      fecha: fechaISO, fechaSimple: fechaActiva,
      mesa: mesas[mesaActual].tipo === "domicilio" ? `Domicilio ${mesaActual - 9}` : `Mesa ${mesaActual + 1}`,
      total: subtotalProductos, domicilio: domicilio, metodo: metodoPago,
      efectivo: metodoPago === "efectivo" ? (subtotalProductos + domicilio) : metodoPago === "mixto" ? efectivoNum : 0,
      nequi: metodoPago === "nequi" ? (subtotalProductos + domicilio) : metodoPago === "mixto" ? nequiNum : 0,
      vuelto: diferencia > 0 ? diferencia : 0, tipo: mesas[mesaActual].tipo || "mesa",
      items: mesas[mesaActual].items || []
    };
    
    ventas.push(nuevaVenta);
    await saveSales(ventas);

    const datosFactura = {
      id: Date.now(),
      nombre: mesas[mesaActual].tipo === "domicilio" ? `Cliente Domicilio ${mesaActual - 9}` : `Mesa ${mesaActual + 1}`,
      celular: "", tipo: mesas[mesaActual].tipo || "mesa",
      fechaVenta: fechaActiva || new Date().toISOString().split('T')[0],
      valor: subtotalProductos + domicilio, domicilio: domicilio, metodoPago: metodoPago,
      montoEfectivo: metodoPago === "efectivo" ? (subtotalProductos + domicilio) : metodoPago === "mixto" ? efectivoNum : 0,
      montoNequi: metodoPago === "nequi" ? (subtotalProductos + domicilio) : metodoPago === "mixto" ? nequiNum : 0,
      vuelto: diferencia > 0 ? diferencia : 0,
      items: mesas[mesaActual].items.map(item => ({ id: item.id || Math.random(), nombre: item.nombre, precio: item.precio, cantidad: item.cantidad || 1 }))
    };
    PDFGenerator.generarFacturaVenta(datosFactura);

    const nuevasMesas = [...mesas];
    nuevasMesas[mesaActual] = { items: [], estado: "vacia", tipo: nuevasMesas[mesaActual].tipo, domicilio: 0, pedidoNumero: 0, timestamp: Date.now() };
    await saveMesas(nuevasMesas);
    alert(`✅ Pago registrado exitosamente!\nTotal: $${(subtotalProductos + domicilio).toLocaleString()}`);
    setOpenCobrar(false);
    setMesaActual(null);
  };

  const generarFacturaMesa = () => {
    if (mesaSeleccionadaPedido === null) return alert("Selecciona una mesa");
    const mesa = mesas[mesaSeleccionadaPedido] || { items: [], domicilio: 0 };
    if (!mesa.items.length) return alert("No hay pedidos");
    const subtotal = mesa.items.reduce((sum, item) => sum + (item.precio * (item.cantidad || 1)), 0);
    const total = subtotal + (mesa.domicilio || 0);
    const datosFactura = {
      id: Date.now(),
      nombre: mesa.tipo === "domicilio" ? `Cliente Domicilio ${mesaSeleccionadaPedido - 9}` : `Mesa ${mesaSeleccionadaPedido + 1}`,
      celular: "", tipo: mesa.tipo || "mesa",
      fechaVenta: fechaActiva || new Date().toISOString().split('T')[0],
      valor: total, domicilio: mesa.domicilio || 0,
      items: mesa.items.map(item => ({ id: item.id || Math.random(), nombre: item.nombre, precio: item.precio, cantidad: item.cantidad || 1 }))
    };
    PDFGenerator.generarFacturaVenta(datosFactura);
    alert("✅ Factura generada");
  };

  const abrirDividirCuenta = () => {
    if (mesaSeleccionadaPedido === null) return alert("Selecciona una mesa");
    const mesa = mesas[mesaSeleccionadaPedido] || { items: [] };
    if (!mesa.items.length) return alert("No hay pedidos");
    setMesaActual(mesaSeleccionadaPedido);
    const inicial = {};
    mesa.items.forEach((_, idx) => { inicial[idx] = null; });
    setProductosAsignados(inicial);
    setPersonasDividir(2);
    setPagosRealizados({});
    setShowDividirCuenta(true);
    setShowPagoIndividual(false);
    setShowMesaPedido(false);
  };

  const asignarProducto = (idx, persona) => {
    setProductosAsignados(prev => ({ ...prev, [idx]: persona }));
  };

  const dividirProducto = (idx) => {
    setProductosAsignados(prev => ({ ...prev, [idx]: "todos" }));
  };

  const calcularSubtotalPersona = (persona) => {
    const mesa = mesas[mesaActual] || { items: [], domicilio: 0 };
    let subtotal = 0;
    mesa.items.forEach((item, idx) => {
      const asignado = productosAsignados[idx];
      if (asignado === persona) subtotal += item.precio * (item.cantidad || 1);
      else if (asignado === "todos") subtotal += (item.precio * (item.cantidad || 1)) / personasDividir;
    });
    if (mesa.domicilio > 0) subtotal += mesa.domicilio / personasDividir;
    return Math.round(subtotal);
  };

  const productosSinAsignar = () => {
    const mesa = mesas[mesaActual] || { items: [] };
    return mesa.items.filter((_, idx) => productosAsignados[idx] === null || productosAsignados[idx] === undefined).length;
  };

  const irAPagoIndividual = () => {
    if (productosSinAsignar() > 0) return alert("Hay productos sin asignar");
    setShowDividirCuenta(false);
    setShowPagoIndividual(true);
    setPersonaAPagar(1);
    setPagosRealizados({});
  };

  const pagarPersona = async (persona) => {
    const subtotal = calcularSubtotalPersona(persona);
    setPagosRealizados(prev => ({ ...prev, [persona]: true }));
    
    let ventas = [];
    try {
      const saved = await syncStorage.getItem("sales");
      ventas = (saved && Array.isArray(saved)) ? saved : (localStorage.getItem("sales") ? JSON.parse(localStorage.getItem("sales")) : []);
    } catch (error) {
      ventas = localStorage.getItem("sales") ? JSON.parse(localStorage.getItem("sales")) : [];
    }

    const fechaISO = fechaActiva ? `${fechaActiva}T${new Date().toTimeString().split(' ')[0]}` : new Date().toISOString();
    ventas.push({
      fecha: fechaISO, fechaSimple: fechaActiva,
      mesa: mesas[mesaActual].tipo === "domicilio" ? `Domicilio ${mesaActual - 9}` : `Mesa ${mesaActual + 1}`,
      total: subtotal, metodo: "efectivo",
      domicilio: mesas[mesaActual].domicilio ? mesas[mesaActual].domicilio / personasDividir : 0,
      tipo: mesas[mesaActual].tipo || "mesa", persona, dividido: true
    });
    await saveSales(ventas);

    const datosFactura = {
      id: Date.now(),
      nombre: `Persona ${persona} - ${mesas[mesaActual].tipo === "domicilio" ? `Domicilio ${mesaActual - 9}` : `Mesa ${mesaActual + 1}`}`,
      celular: "", tipo: mesas[mesaActual].tipo || "mesa",
      fechaVenta: fechaActiva || new Date().toISOString().split('T')[0],
      valor: subtotal, domicilio: mesas[mesaActual].domicilio ? mesas[mesaActual].domicilio / personasDividir : 0,
      items: mesas[mesaActual].items.map((item, idx) => {
        const asignado = productosAsignados[idx];
        let cantidad = 0;
        if (asignado === persona) cantidad = item.cantidad || 1;
        else if (asignado === "todos") cantidad = (item.cantidad || 1) / personasDividir;
        return { id: item.id || Math.random(), nombre: item.nombre, precio: item.precio, cantidad: Math.round(cantidad * 100) / 100 };
      }).filter(i => i.cantidad > 0)
    };
    PDFGenerator.generarFacturaVenta(datosFactura);
    alert(`✅ Pago Persona ${persona}: $${subtotal.toLocaleString()}`);

    const todas = Array.from({ length: personasDividir }, (_, i) => i + 1).every(p => pagosRealizados[p] || p === persona);
    if (todas) {
      const nuevas = [...mesas];
      nuevas[mesaActual] = { ...nuevas[mesaActual], items: [], estado: "vacia", domicilio: 0 };
      await saveMesas(nuevas);
      setShowPagoIndividual(false);
      setMesaActual(null);
      alert("✅ Mesa liberada");
    } else {
      const sig = persona + 1;
      if (sig <= personasDividir) setPersonaAPagar(sig);
      else setShowPagoIndividual(false);
    }
  };

  const getColorPorEstado = (estado) => {
    if (estado === "vacia") {
      return { gradient: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)", text: "#1f2937", border: "#e5e7eb" };
    } else if (estado === "listo") {
      return { gradient: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", text: "#065f46", border: "#10b981" };
    } else {
      return { gradient: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", text: "#1e40af", border: "#60a5fa" };
    }
  };

  const getEstadoTexto = (estado) => {
    if (estado === "vacia") return "Vacia";
    if (estado === "listo") return "Listo";
    return estado;
  };

  const handleSeleccionarMesa = (index) => { setMesaActual(index); };
  const handleMesaClick = (index, e) => {
    if (e.detail === 2) handleDobleClickMesa(index);
    else handleSeleccionarMesa(index);
  };
  const cerrarModalPedidoMesa = () => { setShowMesaPedido(false); setMesaSeleccionadaPedido(null); };
  const cerrarAgregarProductos = () => { setShowAgregarProductos(false); setCategoriaSeleccionada(null); setOrdenTemporal([]); };

  return (
    <div className="min-h-screen reportes-container p-4 md:p-6">
      <header className="mb-8">
        <div className="reportes-card text-center p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-green-500 to-orange-500"></div>
          <div className="logo-header-container mb-4">
            <img src={getLogoPath()} alt="La Perrada de Piter" className="h-24 md:h-28 drop-shadow-lg" />
          </div>
          <h1 className="reportes-title text-3xl md:text-4xl font-black tracking-tight">Sistema de Punto de Venta</h1>
          <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 inline-block">
            <div className="flex items-center gap-2">
              <span className="text-blue-600">📅</span>
              <div>
                <div className="font-bold text-blue-800">Fecha activa: {fechaActiva || "No seleccionada"}</div>
                <div className="text-sm text-blue-600">Estado caja: <span className={`ml-2 font-bold ${estadoCaja === "abierta" ? "text-green-600" : "text-red-600"}`}>{estadoCaja === "abierta" ? "📦 ABIERTA" : "📕 CERRADA"}</span></div>
              </div>
            </div>
          </div>
          <p className="text-gray-600 mt-2 font-medium">Gestión profesional de pedidos</p>
          {!fechaActiva && (
            <div className="mt-4 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
              <p className="font-bold text-red-700">¡ATENCIÓN! No hay fecha activa. Ve a <Link to="/reportes" className="underline">Reportes</Link>.</p>
            </div>
          )}
        </div>
        {mesaActual !== null && (mesas[mesaActual]?.tipo === "domicilio" || mesaActual >= 10) && (
          <div className="kpi-card mb-6 p-5">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="icon-card bg-gradient-to-br from-yellow-500 to-orange-500 text-white"><span className="text-xl">🚚</span></div>
                <div><span className="font-bold text-gray-800 text-lg">Costo de Domicilio</span><div className="text-sm text-gray-600">Se sumará al total final</div></div>
              </div>
              <select className="modern-input w-full md:w-48" value={mesas[mesaActual]?.domicilio || 0} onChange={(e) => actualizarPrecioDomicilio(mesaActual, parseInt(e.target.value))}>
                <option value="0">Sin domicilio</option><option value="1500">$1.500</option><option value="2000">$2.000</option><option value="3000">$3.000</option><option value="5000">$5.000</option>
              </select>
              <div className="flex flex-col items-end ml-auto"><span className="text-2xl font-black text-green-600">+${(mesas[mesaActual]?.domicilio || 0).toLocaleString()}</span><div className="text-xs text-gray-500">Costo adicional</div></div>
            </div>
          </div>
        )}
      </header>

      <div className="w-full">
        <section className="reportes-card">
          <div className="flex items-center gap-4 mb-6">
            <div className="icon-card bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg"><span className="text-2xl">🪑</span></div>
            <div><h2 className="reportes-subtitle">Mesas</h2><p className="text-gray-600 text-sm">Clic: Seleccionar | Doble clic: Ver pedido</p></div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-3">
              {mesas.slice(0, 5).map((mesa, i) => {
                const colors = getColorPorEstado(mesa?.estado || "vacia");
                return (
                  <button key={i} onClick={(e) => handleMesaClick(i, e)} style={{ background: colors.gradient, color: colors.text, borderColor: colors.border }} className={`mesa-card ${mesaActual === i ? 'ring-4 ring-blue-400 ring-opacity-50' : ''} border-3 relative cursor-pointer transition-all duration-200 hover:scale-105`}>
                    <div className="font-black text-2xl mb-1">M{i + 1}</div>
                    <div className="text-xs font-bold px-2 leading-tight">{getEstadoTexto(mesa?.estado || "vacia")}</div>
                    {mesa?.items?.length > 0 && <div className="mesa-badge">{mesa.items.length}</div>}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-5 gap-3">
              {mesas.slice(5, 10).map((mesa, i) => {
                const idx = i + 5;
                const colors = getColorPorEstado(mesa?.estado || "vacia");
                return (
                  <button key={idx} onClick={(e) => handleMesaClick(idx, e)} style={{ background: colors.gradient, color: colors.text, borderColor: colors.border }} className={`mesa-card ${mesaActual === idx ? 'ring-4 ring-blue-400 ring-opacity-50' : ''} border-3 relative cursor-pointer transition-all duration-200 hover:scale-105`}>
                    <div className="font-black text-2xl mb-1">M{idx + 1}</div>
                    <div className="text-xs font-bold px-2 leading-tight">{getEstadoTexto(mesa?.estado || "vacia")}</div>
                    {mesa?.items?.length > 0 && <div className="mesa-badge">{mesa.items.length}</div>}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="reportes-card mt-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="icon-card bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg"><span className="text-2xl">🛵</span></div>
            <div><h2 className="reportes-subtitle">Domicilios</h2><p className="text-gray-600 text-sm">Clic: Seleccionar | Doble clic: Ver pedido</p></div>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {mesas.slice(10, 15).map((mesa, i) => {
              const idx = i + 10;
              const colors = getColorPorEstado(mesa?.estado || "vacia");
              return (
                <button key={idx} onClick={(e) => handleMesaClick(idx, e)} style={{ background: colors.gradient, color: colors.text, borderColor: colors.border }} className={`mesa-card ${mesaActual === idx ? 'ring-4 ring-blue-400 ring-opacity-50' : ''} border-3 relative cursor-pointer transition-all duration-200 hover:scale-105`}>
                  <div className="font-black text-2xl mb-1 flex items-center gap-1">D{i + 1}<span className="text-base">🚚</span></div>
                  <div className="text-xs font-bold px-2 leading-tight">{getEstadoTexto(mesa?.estado || "vacia")}</div>
                  {mesa?.items?.length > 0 && <div className="mesa-badge bg-red-500">{mesa.items.length}</div>}
                  {mesa?.domicilio > 0 && <div className="absolute bottom-1 left-0 right-0"><div className="text-[9px] font-black text-green-700 bg-green-100 px-1 py-0.5 rounded-full mx-2">+${mesa.domicilio.toLocaleString()}</div></div>}
                </button>
              );
            })}
          </div>
        </section>

        <div className="mt-6"><Link to="/reportes" className="bg-purple-600 hover:bg-purple-700 text-white text-center py-3 font-bold rounded-lg block">📊 Reportes</Link></div>
      </div>

      {/* MODAL VER PEDIDO */}
      {showMesaPedido && mesaSeleccionadaPedido !== null && (
        <div className="modal-overlay">
          <div className="modal-content-large">
            <div className="modal-header">
              <h3>📋 Pedido de {mesas[mesaSeleccionadaPedido]?.tipo === "domicilio" ? `Domicilio D${mesaSeleccionadaPedido - 9}` : `Mesa M${mesaSeleccionadaPedido + 1}`}</h3>
              <button onClick={cerrarModalPedidoMesa} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              {(!mesas[mesaSeleccionadaPedido]?.items || mesas[mesaSeleccionadaPedido]?.items.length === 0) ? (
                <div className="text-center py-12"><div className="text-gray-300 text-6xl mb-4">📭</div><p className="text-gray-600 font-bold mb-2">No hay productos</p><p className="text-gray-400">Haz clic en "Agregar Productos"</p></div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div><div className="text-sm text-blue-700 font-semibold">Total Productos</div><div className="text-2xl font-bold text-blue-900">{mesas[mesaSeleccionadaPedido].items.length}</div></div>
                      <div><div className="text-sm text-blue-700 font-semibold">Costo Domicilio</div><div className="text-2xl font-bold text-blue-900">${(mesas[mesaSeleccionadaPedido].domicilio || 0).toLocaleString()}</div></div>
                    </div>
                    <div className="border-t border-blue-200 pt-3"><div className="flex justify-between"><div className="text-lg font-bold text-gray-800">TOTAL A PAGAR:</div><div className="text-2xl font-bold text-green-700">${totalMesaEnCocina(mesaSeleccionadaPedido).toLocaleString()}</div></div></div>
                  </div>
                  <div><h4 className="font-bold text-lg mb-3">Productos:</h4><ul className="space-y-3 max-h-96 overflow-y-auto">{mesas[mesaSeleccionadaPedido].items.map((item, idx) => (<li key={idx} className="producto-item"><div><div className="font-bold">{item.nombre}</div><div className="text-sm">Cantidad: {item.cantidad || 1}</div>{item.nota && <div className="text-sm text-yellow-700 bg-yellow-50 p-1 rounded mt-1">📝 {item.nota}</div>}</div><div className="font-bold text-green-600">${(item.precio * (item.cantidad || 1)).toLocaleString()}</div></li>))}</ul></div>
                  {mesas[mesaSeleccionadaPedido].domicilio > 0 && <div className="bg-green-50 p-3 rounded"><div className="flex justify-between"><div>🚚 Domicilio:</div><div className="font-bold text-green-700">+${mesas[mesaSeleccionadaPedido].domicilio.toLocaleString()}</div></div></div>}
                </div>
              )}
            </div>
            <div className="modal-footer mt-6 pt-6 border-t">
              {mesas[mesaSeleccionadaPedido]?.estado === "listo" && mesas[mesaSeleccionadaPedido]?.items?.length > 0 && (
                <div className="flex flex-col gap-3 mb-4">
                  <div className="grid grid-cols-2 gap-3"><button onClick={() => cobrarDesdeModal(mesaSeleccionadaPedido)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">💰 Cobrar</button><button onClick={() => dividirCuentaDesdeModal(mesaSeleccionadaPedido)} className="px-4 py-2 bg-orange-500 text-white rounded-lg font-bold">👥 Dividir</button></div>
                  <div className="grid grid-cols-3 gap-3"><button onClick={() => generarFacturaDesdeModal(mesaSeleccionadaPedido)} className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold">📄 Factura</button><button onClick={() => abrirEditarPedido(mesaSeleccionadaPedido)} className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-bold">✏️ Editar</button><button onClick={() => abrirAgregarProductos(mesaSeleccionadaPedido)} className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold">➕ Agregar</button></div>
                </div>
              )}
              {(!mesas[mesaSeleccionadaPedido]?.items || mesas[mesaSeleccionadaPedido]?.items.length === 0) && (<button onClick={() => abrirAgregarProductos(mesaSeleccionadaPedido)} className="px-4 py-3 bg-green-500 text-white rounded-lg font-bold w-full mb-4">➕ Agregar Productos</button>)}
              <div className="flex justify-center"><button onClick={cerrarModalPedidoMesa} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Cerrar</button></div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR/EDITAR PRODUCTOS */}
      {showAgregarProductos && (
        <div className="modal-overlay">
          <div className="modal-content-large">
            <div className="modal-header">
              <h3>🛒 {ordenTemporal.length > 0 ? "Editar" : "Agregar"} productos para {mesas[mesaSeleccionadaPedido]?.tipo === "domicilio" ? `Domicilio D${mesaSeleccionadaPedido - 9}` : `Mesa M${mesaSeleccionadaPedido + 1}`}</h3>
              <button onClick={cerrarAgregarProductos} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              {!categoriaSeleccionada ? (
                <div><h4 className="text-lg font-bold mb-4">Selecciona una categoría:</h4><div className="grid grid-cols-3 md:grid-cols-4 gap-3">{categorias.map(cat => (<button key={cat} onClick={() => setCategoriaSeleccionada(cat)} className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border text-center"><div className="text-2xl mb-2">{getIconoPorCategoria(cat)}</div><div className="text-sm font-medium">{cat}</div></button>))}</div></div>
              ) : (
                <div>
                  <div className="flex items-center gap-4 mb-6"><button onClick={() => setCategoriaSeleccionada(null)} className="text-blue-600">← Volver</button><h4 className="text-lg font-bold">{categoriaSeleccionada}</h4></div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                    {productosFiltrados.map((producto) => {
                      const enOrden = ordenTemporal.find(p => getId(p) === getId(producto));
                      const cantidad = enOrden ? (enOrden.cantidad || 1) : 0;
                      return (
                        <button key={getId(producto)} onClick={() => addToTemp(producto)} style={{
                          padding: '12px', borderRadius: '8px', border: cantidad > 0 ? '2px solid #22c55e' : '1px solid #e5e7eb',
                          backgroundColor: cantidad > 0 ? '#dcfce7' : 'white', textAlign: 'left', cursor: 'pointer'
                        }}>
                          <div style={{ fontWeight: '500' }}>{getName(producto)}</div>
                          <div style={{ color: '#16a34a', fontWeight: 'bold', marginTop: '4px' }}>${getPrice(producto).toLocaleString()}</div>
                          {cantidad > 0 && <div style={{ marginTop: '8px', fontSize: '11px', backgroundColor: '#22c55e', color: 'white', padding: '2px 8px', borderRadius: '20px', display: 'inline-block' }}>✕ {cantidad}</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer p-4 border-t">
              {ordenTemporal.length > 0 && (
                <div className="mb-4 max-h-48 overflow-y-auto">
                  <h4 className="font-bold mb-2">Seleccionados ({ordenTemporal.length}):</h4>
                  {ordenTemporal.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg mb-1">
                      <span className="text-sm">{getName(p)} {p.nota && <span className="text-yellow-600">📝</span>}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => decreaseQuantity(i)} className="w-6 h-6 bg-red-200 rounded-full">−</button>
                        <span className="w-6 text-center">{p.cantidad || 1}</span>
                        <button onClick={() => increaseQuantity(i)} className="w-6 h-6 bg-green-200 rounded-full">＋</button>
                        <button onClick={() => abrirNota(i)} className="w-6 h-6 bg-blue-200 rounded-full">✏️</button>
                        <button onClick={() => removeFromTemp(i)} className="w-6 h-6 bg-red-200 rounded-full">✕</button>
                        <span className="text-green-600 text-sm w-20 text-right">${(getPrice(p) * (p.cantidad || 1)).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center">
                <div><div className="text-sm text-gray-600">Total:</div><div className="text-xl font-bold text-green-600">${calcularSubtotalProductos().toLocaleString()}</div><div className="text-xs">{ordenTemporal.length} productos • {calcularTotalItems()} items</div></div>
                <div className="flex gap-2"><button onClick={() => { setOrdenTemporal([]); setCategoriaSeleccionada(null); }} className="px-4 py-2 bg-gray-200 rounded-lg">Limpiar</button><button onClick={guardarPedidoDesdeModal} disabled={ordenTemporal.length === 0} className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold">{ordenTemporal.length > 0 ? "✅ Guardar" : "Agregar"}</button></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL COBRAR */}
      {openCobrar && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="modal-header"><h3>💰 Cobrar {mesas[mesaActual]?.tipo === "domicilio" ? `Domicilio D${mesaActual - 9}` : `Mesa M${mesaActual + 1}`}</h3><button onClick={() => setOpenCobrar(false)} className="modal-close">×</button></div>
            <div className="modal-body">
              <div className="mb-4 p-3 bg-blue-50 rounded-lg"><div className="font-bold text-blue-800">Fecha: {fechaActiva}</div></div>
              <div className="mb-6"><h4 className="font-bold text-center mb-3">Total a pagar: <span className="text-green-600 text-2xl">${totalAPagar.toLocaleString()}</span></h4></div>
              <div className="mb-6"><label className="block text-sm font-medium mb-2">Método de pago:</label><div className="grid grid-cols-3 gap-2"><button onClick={() => setMetodoPago("efectivo")} className={`p-2 rounded border ${metodoPago === "efectivo" ? "border-green-500 bg-green-50" : "border-gray-200"}`}>💵 Efectivo</button><button onClick={() => setMetodoPago("nequi")} className={`p-2 rounded border ${metodoPago === "nequi" ? "border-purple-500 bg-purple-50" : "border-gray-200"}`}>📱 Nequi</button><button onClick={() => setMetodoPago("mixto")} className={`p-2 rounded border ${metodoPago === "mixto" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>🔄 Mixto</button></div></div>
              {(metodoPago === "efectivo" || metodoPago === "mixto") && <div className="mb-4"><label>Efectivo:</label><input type="number" value={montoEfectivo} onChange={(e) => setMontoEfectivo(e.target.value)} className="w-full p-2 border rounded" /></div>}
              {(metodoPago === "nequi" || metodoPago === "mixto") && <div className="mb-4"><label>Nequi:</label><input type="number" value={montoNequi} onChange={(e) => setMontoNequi(e.target.value)} className="w-full p-2 border rounded" /><div className="text-sm text-gray-600 mt-1">📱 {NEQUI_NUM} - {NEQUI_TITULAR}</div></div>}
            </div>
            <div className="modal-footer flex gap-3"><button onClick={() => setOpenCobrar(false)} className="flex-1 py-2 bg-gray-200 rounded">Cancelar</button><button onClick={procesarPago} disabled={recibidoTotal < totalAPagar} className="flex-1 py-2 bg-green-600 text-white rounded">✅ Confirmar</button></div>
          </div>
        </div>
      )}

      {/* MODAL DIVIDIR CUENTA */}
      {showDividirCuenta && (
        <div className="modal-overlay">
          <div className="modal-content-large">
            <div className="modal-header"><h3>👥 Dividir cuenta de {mesas[mesaActual]?.tipo === "domicilio" ? `Domicilio D${mesaActual - 9}` : `Mesa M${mesaActual + 1}`}</h3><button onClick={() => setShowDividirCuenta(false)} className="modal-close">×</button></div>
            <div className="modal-body">
              <div className="mb-6"><label className="block text-sm font-medium mb-2">Número de personas:</label><div className="flex flex-wrap gap-2">{[2,3,4,5,6].map(num => (<button key={num} onClick={() => setPersonasDividir(num)} className={`px-4 py-2 rounded border ${personasDividir === num ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>{num} personas</button>))}</div></div>
              <div className="mb-6"><h4 className="font-bold text-lg mb-3">Asignar productos:</h4><div className="space-y-3">{mesas[mesaActual]?.items.map((item, idx) => (<div key={idx} className="p-3 bg-gray-50 rounded"><div className="flex justify-between items-center"><div><div className="font-bold">{item.nombre}</div><div className="text-sm">${item.precio.toLocaleString()} × {item.cantidad || 1}</div></div><select value={productosAsignados[idx] || ""} onChange={(e) => { if (e.target.value === "todos") dividirProducto(idx); else asignarProducto(idx, parseInt(e.target.value)); }} className="p-2 border rounded"><option value="">Sin asignar</option>{Array.from({ length: personasDividir }, (_, i) => i + 1).map(p => (<option key={p} value={p}>Persona {p}</option>))}<option value="todos">Dividir entre todos</option></select></div></div>))}</div></div>
              <div className="p-4 bg-gray-50 rounded"><h4 className="font-bold text-lg mb-3">Resumen:</h4><div className="grid grid-cols-2 gap-3">{Array.from({ length: personasDividir }, (_, i) => i + 1).map(p => (<div key={p} className="bg-white p-3 rounded border"><div className="font-bold">Persona {p}</div><div className="text-green-600 font-bold">${calcularSubtotalPersona(p).toLocaleString()}</div></div>))}</div></div>
              {productosSinAsignar() > 0 && <div className="mt-4 p-3 bg-yellow-50 rounded"><div className="font-bold text-yellow-700">{productosSinAsignar()} productos sin asignar</div></div>}
            </div>
            <div className="modal-footer flex gap-3"><button onClick={() => setShowDividirCuenta(false)} className="flex-1 py-2 bg-gray-200 rounded">Cancelar</button><button onClick={irAPagoIndividual} disabled={productosSinAsignar() > 0} className="flex-1 py-2 bg-orange-500 text-white rounded">Continuar</button></div>
          </div>
        </div>
      )}

      {/* MODAL PAGO INDIVIDUAL */}
      {showPagoIndividual && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="modal-header"><h3>💳 Pago individual - Persona {personaAPagar}</h3><button onClick={() => setShowPagoIndividual(false)} className="modal-close">×</button></div>
            <div className="modal-body">
              <div className="text-center mb-6"><div className="text-6xl mb-4">👤</div><div className="text-2xl font-bold">Persona {personaAPagar}</div><div className="text-sm text-gray-600">de {personasDividir} personas</div></div>
              <div className="text-center mb-6"><div className="text-sm text-gray-600">Total a pagar:</div><div className="text-3xl font-bold text-green-600">${calcularSubtotalPersona(personaAPagar).toLocaleString()}</div></div>
            </div>
            <div className="modal-footer flex gap-3"><button onClick={() => setShowPagoIndividual(false)} className="flex-1 py-2 bg-gray-200 rounded">Cancelar</button><button onClick={() => pagarPersona(personaAPagar)} className="flex-1 py-2 bg-green-600 text-white rounded">✅ Registrar pago</button></div>
          </div>
        </div>
      )}

      {/* MODAL NOTA */}
      {showNotaModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="modal-header"><h3>📝 Agregar nota</h3><button onClick={() => setShowNotaModal(false)} className="modal-close">×</button></div>
            <div className="modal-body"><textarea value={notaTemp} onChange={(e) => setNotaTemp(e.target.value)} placeholder="Ej: Sin cebolla, bien cocido, etc." className="w-full p-3 border rounded" rows="4" /></div>
            <div className="modal-footer flex gap-3"><button onClick={() => setShowNotaModal(false)} className="flex-1 py-2 bg-gray-200 rounded">Cancelar</button><button onClick={guardarNota} className="flex-1 py-2 bg-blue-600 text-white rounded">Guardar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}