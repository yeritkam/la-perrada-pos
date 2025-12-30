import React, { useState, useEffect, useCallback } from 'react';
import './ReportesComunes.css';
import products from "../../data/products.js";
import PDFGenerator from "../../components/PDFGenerator";
import syncStorage from "../../firebase/storage.js";

const AdminReportes = ({ usuario, onLogout }) => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [estadoCaja, setEstadoCaja] = useState("cerrada");
  const [fiados, setFiados] = useState([]);
  const [tipoFiado, setTipoFiado] = useState("fisico");
  const [precioDomicilio, setPrecioDomicilio] = useState(3000);
  const [productosFiado, setProductosFiado] = useState([]);
  const [showMenuFiado, setShowMenuFiado] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [showDetalleFiado, setShowDetalleFiado] = useState(false);
  const [fiadoSeleccionado, setFiadoSeleccionado] = useState(null);
  const [baseCaja, setBaseCaja] = useState(0);
  const [baseCargada, setBaseCargada] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sincronizacionActiva, setSincronizacionActiva] = useState(false);
  const [ventas, setVentas] = useState([]);
  // Estados para el modal de marcar fiado como pagado
  const [showModalPagarFiado, setShowModalPagarFiado] = useState(false);
  const [fiadoAPagar, setFiadoAPagar] = useState(null);
  const [fechaPagoFiado, setFechaPagoFiado] = useState("");
  const [metodoPagoFiado, setMetodoPagoFiado] = useState("efectivo");
  const [efectivoMixto, setEfectivoMixto] = useState(0);
  const [nequiMixto, setNequiMixto] = useState(0);

  const [nuevoFiado, setNuevoFiado] = useState({
    nombre: "",
    celular: "",
    fechaFiado: "",
  });

  useEffect(() => {
    // Establecer fecha de hoy por defecto para el modal
    const hoy = new Date().toISOString().split('T')[0];
    setFechaPagoFiado(hoy);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('reportes_usuario');
    localStorage.removeItem('fechaActiva');
    localStorage.removeItem('estadoCaja');
    
    const isGitHubPages = window.location.hostname.includes('github.io');
    const basePath = '';  // ✅ CAMBIADO: GitHub Pages ahora en raíz
    
window.location.href = basePath + '/';
    
    setTimeout(() => {
      window.location.reload(true);
    }, 100);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log("📥 AdminReportes: Cargando datos iniciales...");
        
        const fecha = await syncStorage.getItem("fechaActiva");
        if (fecha !== null && fecha !== undefined && fecha !== "") {
          setFechaSeleccionada(fecha);
          localStorage.setItem("fechaActiva", fecha);
        } else {
          const fechaLocal = localStorage.getItem("fechaActiva") || "";
          setFechaSeleccionada(fechaLocal);
        }
        
        const estado = await syncStorage.getItem("estadoCaja");
        if (estado !== null && estado !== undefined) {
          setEstadoCaja(estado);
        } else {
          setEstadoCaja(localStorage.getItem("estadoCaja") || "cerrada");
        }
        
        const fiadosData = await syncStorage.getItem("fiados");
        if (fiadosData !== null && fiadosData !== undefined) {
          if (Array.isArray(fiadosData)) {
            setFiados(fiadosData);
          } else if (typeof fiadosData === 'object') {
            const fiadosArray = Object.values(fiadosData);
            setFiados(fiadosArray);
          } else {
            setFiados([]);
          }
        } else {
          try {
            const fiadosLocal = JSON.parse(localStorage.getItem("fiados") || "[]");
            setFiados(fiadosLocal);
          } catch {
            setFiados([]);
          }
        }
        
        const ventasData = await syncStorage.getItem("sales");
        if (ventasData !== null && ventasData !== undefined) {
          if (Array.isArray(ventasData)) {
            setVentas(ventasData);
          } else if (typeof ventasData === 'object') {
            const ventasArray = Object.values(ventasData);
            setVentas(ventasArray);
          } else {
            setVentas([]);
          }
        } else {
          try {
            const ventasLocal = JSON.parse(localStorage.getItem("sales") || "[]");
            setVentas(ventasLocal);
          } catch {
            setVentas([]);
          }
        }
        
        console.log("📥 AdminReportes: Cargando base de caja desde Firebase...");
        const baseData = await syncStorage.getItem("baseCaja");
        
        if (baseData !== null && baseData !== undefined) {
          if (typeof baseData === 'object') {
            if (baseData.fecha === fechaSeleccionada || !fechaSeleccionada) {
              setBaseCaja(baseData.monto || 0);
              setBaseCargada(true);
              console.log("✅ Base cargada desde Firebase:", baseData.monto);
            }
          }
        } else {
          const saved = localStorage.getItem("baseCaja_" + fechaSeleccionada);
          if (saved) {
            setBaseCaja(parseInt(saved));
            setBaseCargada(true);
          }
        }
        
        console.log("✅ AdminReportes: Datos iniciales cargados correctamente");
        setSincronizacionActiva(true);
        
      } catch (error) {
        console.error("❌ Error cargando datos iniciales:", error);
        setFechaSeleccionada(localStorage.getItem("fechaActiva") || "");
        setEstadoCaja(localStorage.getItem("estadoCaja") || "cerrada");
        
        try {
          setFiados(JSON.parse(localStorage.getItem("fiados") || "[]"));
        } catch {
          setFiados([]);
        }
        
        try {
          setVentas(JSON.parse(localStorage.getItem("sales") || "[]"));
        } catch {
          setVentas([]);
        }
      }
    };

    loadInitialData();

    const unsubscribeFecha = syncStorage.syncItem("fechaActiva", (newFecha) => {
      if (newFecha !== null && newFecha !== undefined) {
        setFechaSeleccionada(newFecha);
        localStorage.setItem("fechaActiva", newFecha);
        setRefreshKey(prev => prev + 1);
      }
    });

    const unsubscribeEstado = syncStorage.syncItem("estadoCaja", (newEstado) => {
      if (newEstado !== null && newEstado !== undefined) {
        setEstadoCaja(newEstado);
        localStorage.setItem("estadoCaja", newEstado);
        setRefreshKey(prev => prev + 1);
      }
    });

    const unsubscribeFiados = syncStorage.syncItem("fiados", (newFiados) => {
      if (newFiados !== null && newFiados !== undefined) {
        if (Array.isArray(newFiados)) {
          setFiados(newFiados);
          localStorage.setItem("fiados", JSON.stringify(newFiados));
        } else if (typeof newFiados === 'object') {
          const fiadosArray = Object.values(newFiados);
          setFiados(fiadosArray);
          localStorage.setItem("fiados", JSON.stringify(fiadosArray));
        }
        setRefreshKey(prev => prev + 1);
        setUltimaActualizacion(new Date());
      }
    });

    const unsubscribeVentas = syncStorage.syncItem("sales", (newVentas) => {
      if (newVentas !== null && newVentas !== undefined) {
        if (Array.isArray(newVentas)) {
          setVentas(newVentas);
          localStorage.setItem("sales", JSON.stringify(newVentas));
        } else if (typeof newVentas === 'object') {
          const ventasArray = Object.values(newVentas);
          setVentas(ventasArray);
          localStorage.setItem("sales", JSON.stringify(ventasArray));
        }
        setRefreshKey(prev => prev + 1);
        setUltimaActualizacion(new Date());
      }
    });

    const unsubscribeBase = syncStorage.syncItem("baseCaja", (newBaseData) => {
      console.log("🔄 AdminReportes: Sincronización base recibida:", newBaseData);
      
      if (newBaseData !== null && newBaseData !== undefined) {
        if (typeof newBaseData === 'object') {
          if (newBaseData.fecha === fechaSeleccionada) {
            setBaseCaja(newBaseData.monto || 0);
            setBaseCargada(true);
            setRefreshKey(prev => prev + 1);
            console.log("✅ Base actualizada desde Firebase:", newBaseData.monto);
          }
        }
      }
    });

    return () => {
      unsubscribeFecha?.();
      unsubscribeEstado?.();
      unsubscribeFiados?.();
      unsubscribeVentas?.();
      unsubscribeBase?.();
    };
  }, [fechaSeleccionada]);

  const getName = (p) => p.name || p.nombre || "Producto";
  const getPrice = (p) => p.price || p.precio || 0;
  const getCat = (p) => p.category || p.categoria || "Sin categoría";
  const getId = (p) => p.id || Math.random().toString();

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

  const refrescarDatos = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    console.log("🔄 Refrescando datos manualmente...");
    
    try {
      const fecha = await syncStorage.getItem("fechaActiva");
      if (fecha !== null && fecha !== undefined) setFechaSeleccionada(fecha);
      
      const estado = await syncStorage.getItem("estadoCaja");
      if (estado !== null && estado !== undefined) setEstadoCaja(estado);
      
      const ventasData = await syncStorage.getItem("sales");
      if (ventasData !== null && ventasData !== undefined) {
        if (Array.isArray(ventasData)) {
          setVentas(ventasData);
        } else if (typeof ventasData === 'object') {
          setVentas(Object.values(ventasData));
        }
      }
      
      const fiadosData = await syncStorage.getItem("fiados");
      if (fiadosData !== null && fiadosData !== undefined) {
        if (Array.isArray(fiadosData)) {
          setFiados(fiadosData);
        } else if (typeof fiadosData === 'object') {
          setFiados(Object.values(fiadosData));
        }
      }
      
      setRefreshKey(prev => prev + 1);
      setUltimaActualizacion(new Date());
      console.log("✅ Datos refrescados correctamente");
      
    } catch (error) {
      console.error("❌ Error refrescando datos:", error);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  }, [isRefreshing]);

  // ✅ CORRECCIÓN 1: FUNCIÓN DE CÁLCULO REEMPLAZADA
  const calcularEstadisticasCompletas = (ventasPorDia) => {
    let totalVentas = 0;
    let efectivoRecaudado = 0;
    let nequiRecaudado = 0;
    let totalDomicilios = 0;
    let ventasCount = 0;
    let totalProductos = 0;
    
    ventasPorDia.forEach(venta => {
      const totalVenta = parseInt(venta.total) || 0;
      const domicilio = parseInt(venta.domicilio) || 0;
      
      // ✅ CORRECCIÓN: TRATAR FIADOS DIFERENTE
      if (venta.tipo === "fiado") {
        // Para fiados: totalVenta YA INCLUYE domicilio
        totalVentas += totalVenta;
        totalProductos += totalVenta - domicilio; // Restar domicilio para productos puros
        // ❌ NO sumar domicilio a totalDomicilios (no es domicilio del día)
      } else {
        // Para ventas normales: sumar domicilio aparte
        const totalReal = totalVenta + domicilio;
        totalVentas += totalReal;
        totalDomicilios += domicilio;  // ✅ Solo domicilios NORMALES del día
        totalProductos += totalVenta;
      }
      
      ventasCount++;
      
      // Cálculo de métodos de pago (igual para todos)
      const totalAPagar = (venta.tipo === "fiado") ? totalVenta : (totalVenta + domicilio);
      
      switch(venta.metodo) {
        case 'efectivo':
          efectivoRecaudado += totalAPagar;
          break;
        case 'nequi':
          nequiRecaudado += totalAPagar;
          break;
        case 'mixto':
          if (venta.efectivo !== undefined && venta.nequi !== undefined) {
            efectivoRecaudado += parseInt(venta.efectivo) || 0;
            nequiRecaudado += parseInt(venta.nequi) || 0;
          } else {
            efectivoRecaudado += Math.round(totalAPagar / 2);
            nequiRecaudado += Math.round(totalAPagar / 2);
          }
          break;
        default:
          efectivoRecaudado += totalAPagar;
          break;
      }
    });
    
    return {
      totalVentas: Math.round(totalVentas),
      totalProductos: Math.round(totalProductos),
      efectivoRecaudado: Math.round(efectivoRecaudado),
      nequiRecaudado: Math.round(nequiRecaudado),
      totalDomicilios: Math.round(totalDomicilios),
      saldoCaja: Math.round(baseCaja + efectivoRecaudado),
      gananciaDia: Math.round(totalVentas),
      promedioVenta: ventasCount > 0 ? Math.round(totalVentas / ventasCount) : 0,
      ventasCount,
      baseCaja: Math.round(baseCaja)
    };
  };

  const ventasPorDia = ventas.filter((v) => {
    try {
      if (!v.fecha) return false;
      
      const fechaVenta = new Date(v.fecha);
      if (isNaN(fechaVenta.getTime())) return false;
      
      const año = fechaVenta.getFullYear();
      const mes = String(fechaVenta.getMonth() + 1).padStart(2, '0');
      const dia = String(fechaVenta.getDate()).padStart(2, '0');
      const fechaFormateada = `${año}-${mes}-${dia}`;
      
      return fechaFormateada === fechaSeleccionada;
    } catch (e) {
      console.warn("Error filtrando venta:", e, v);
      return false;
    }
  });

  const estadisticas = calcularEstadisticasCompletas(ventasPorDia);

  const abrirCaja = async () => {
    if (!fechaSeleccionada) {
      alert("⚠ Selecciona una fecha antes de abrir caja.");
      return;
    }
    
    try {
      console.log("📦 Abriendo caja para fecha:", fechaSeleccionada);
      await syncStorage.setItem("estadoCaja", "abierta");
      await syncStorage.setItem("fechaActiva", fechaSeleccionada);
      
      localStorage.setItem("estadoCaja", "abierta");
      localStorage.setItem("fechaActiva", fechaSeleccionada);
      
      setEstadoCaja("abierta");
      setRefreshKey(prev => prev + 1);
      console.log("✅ Caja abierta correctamente");
      alert("📦 Caja abierta correctamente.");
    } catch (error) {
      console.error("❌ Error abriendo caja:", error);
      localStorage.setItem("estadoCaja", "abierta");
      localStorage.setItem("fechaActiva", fechaSeleccionada);
      setEstadoCaja("abierta");
      alert("📦 Caja abierta (modo offline).");
    }
  };

  const cerrarCaja = async () => {
    if (!fechaSeleccionada) {
      alert("⚠ Selecciona una fecha antes de cerrar caja.");
      return;
    }

    const datosCaja = {
      fecha: fechaSeleccionada,
      total: estadisticas.totalVentas,
      productos: estadisticas.totalProductos,
      domicilio: estadisticas.totalDomicilios,
      cantDomicilios: ventasPorDia.filter(v => v.domicilio > 0 && v.tipo !== "fiado").length,
      efectivo: estadisticas.efectivoRecaudado,
      nequi: estadisticas.nequiRecaudado,
      mixto: ventasPorDia.filter(s => s.metodo === "mixto").length,
      cantVentas: estadisticas.ventasCount,
      baseCaja: estadisticas.baseCaja,
      saldoCaja: estadisticas.saldoCaja,
      gananciaDia: estadisticas.gananciaDia
    };

    localStorage.setItem(
      "cajaCerrada_" + fechaSeleccionada,
      JSON.stringify(datosCaja)
    );

    try {
      console.log("📕 Cerrando caja para fecha:", fechaSeleccionada);
      await syncStorage.setItem("estadoCaja", "cerrada");
      await syncStorage.setItem("fechaActiva", "");
      
      localStorage.setItem("estadoCaja", "cerrada");
      localStorage.removeItem("fechaActiva");
      
      setEstadoCaja("cerrada");
      setFechaSeleccionada("");
      setRefreshKey(prev => prev + 1);
      console.log("✅ Caja cerrada correctamente");

      alert(`📕 Caja cerrada\nFecha: ${fechaSeleccionada}\nTotal: $${estadisticas.totalVentas.toLocaleString()}`);
    } catch (error) {
      console.error("❌ Error cerrando caja:", error);
      localStorage.setItem("estadoCaja", "cerrada");
      localStorage.removeItem("fechaActiva");
      setEstadoCaja("cerrada");
      setFechaSeleccionada("");
      
      alert(`📕 Caja cerrada (modo offline)\nFecha: ${fechaSeleccionada}\nTotal: $${estadisticas.totalVentas.toLocaleString()}`);
    }
  };

  const calcularSubtotalProductos = () => {
    return productosFiado.reduce((total, prod) => {
      return total + (getPrice(prod) * (prod.cantidad || 1));
    }, 0);
  };

  const calcularTotalFiado = () => {
    const subtotal = calcularSubtotalProductos();
    const domicilio = tipoFiado === "domicilio" ? precioDomicilio : 0;
    return subtotal + domicilio;
  };

  const agregarProductoFiado = (prod) => {
    const productId = getId(prod);
    const existingIndex = productosFiado.findIndex(item => getId(item) === productId);
    
    if (existingIndex >= 0) {
      const updatedItems = [...productosFiado];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        cantidad: (updatedItems[existingIndex].cantidad || 1) + 1,
      };
      setProductosFiado(updatedItems);
    } else {
      setProductosFiado([...productosFiado, { 
        ...prod, 
        cantidad: 1 
      }]);
    }
  };

  const disminuirCantidadFiado = (index) => {
    const updatedItems = [...productosFiado];
    const currentQuantity = updatedItems[index].cantidad || 1;
    
    if (currentQuantity <= 1) {
      updatedItems.splice(index, 1);
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        cantidad: currentQuantity - 1,
      };
    }
    
    setProductosFiado(updatedItems);
  };

  const eliminarProductoFiado = (index) => {
    const updatedItems = [...productosFiado];
    updatedItems.splice(index, 1);
    setProductosFiado(updatedItems);
  };

  const productosFiltrados = categoriaSeleccionada 
    ? products.filter(p => getCat(p) === categoriaSeleccionada)
    : [];

  const guardarFiado = async () => {
    if (!nuevoFiado.nombre) {
      alert("⚠ Debes ingresar el nombre del cliente.");
      return;
    }
    
    if (productosFiado.length === 0) {
      alert("⚠ Debes seleccionar al menos un producto.");
      return;
    }

    const nuevoFiadoData = {
      id: Date.now(),
      nombre: nuevoFiado.nombre,
      celular: nuevoFiado.celular,
      tipo: tipoFiado,
      domicilio: tipoFiado === "domicilio" ? precioDomicilio : 0,
      items: productosFiado.map(p => ({
        id: getId(p),
        nombre: getName(p),
        precio: getPrice(p),
        cantidad: p.cantidad || 1,
      })),
      valor: calcularTotalFiado(),
      fechaFiado: nuevoFiado.fechaFiado || new Date().toISOString().split('T')[0],
      estado: "pendiente",
    };

    const nuevaListaFiados = [...fiados, nuevoFiadoData];
    
    try {
      console.log("📌 Guardando nuevo fiado:", nuevoFiadoData);
      await syncStorage.setItem("fiados", nuevaListaFiados);
      setFiados(nuevaListaFiados);
      
      localStorage.setItem("fiados", JSON.stringify(nuevaListaFiados));

      setNuevoFiado({ nombre: "", celular: "", fechaFiado: "" });
      setProductosFiado([]);
      setTipoFiado("fisico");
      setPrecioDomicilio(3000);
      setRefreshKey(prev => prev + 1);

      alert("📌 Fiado registrado correctamente.");
    } catch (error) {
      console.error("❌ Error guardando fiado:", error);
      localStorage.setItem("fiados", JSON.stringify(nuevaListaFiados));
      setFiados(nuevaListaFiados);
      alert("📌 Fiado registrado (modo offline).");
    }
  };

  // 🔧 CORRECCIÓN 2: FUNCIÓN marcarAlDia MODIFICADA (NO prompt - usa modal)
  const marcarAlDia = (fiado) => {
    // Abrir modal en lugar de usar prompt
    setFiadoAPagar(fiado);
    setFechaPagoFiado(new Date().toISOString().split('T')[0]); // Fecha de hoy por defecto
    setMetodoPagoFiado("efectivo");
    setEfectivoMixto(0);
    setNequiMixto(0);
    setShowModalPagarFiado(true);
  };

  // 🔧 CORRECCIÓN 2: NUEVA FUNCIÓN para procesar el pago desde el modal
  const procesarPagoFiado = async () => {
    if (!fiadoAPagar) return;
    
    if (!fechaPagoFiado) {
      alert("Debes ingresar una fecha válida.");
      return;
    }
    
    // Variables para mixto
    let efectivo = 0;
    let nequi = 0;
    let metodoPago = metodoPagoFiado;
    
    if (metodoPago === 'mixto') {
      efectivo = efectivoMixto || 0;
      nequi = nequiMixto || 0;
      
      // Validar que sumen el total
      if (efectivo + nequi !== fiadoAPagar.valor) {
        alert(`⚠️ Los montos no suman el total ($${fiadoAPagar.valor.toLocaleString()}).\n\n` +
              `Efectivo: $${efectivo.toLocaleString()}\n` +
              `Nequi: $${nequi.toLocaleString()}\n` +
              `Total: $${(efectivo + nequi).toLocaleString()}\n\n` +
              `Por favor, ingresa montos que sumen exactamente $${fiadoAPagar.valor.toLocaleString()}`);
        return;
      }
    }
    
    // Crear nueva venta con el método correcto
    const nuevaVenta = {
      mesa: "Fiado - " + fiadoAPagar.nombre,
      total: fiadoAPagar.valor,
      metodo: metodoPago,
      fecha: fechaPagoFiado + "T12:00:00",
      domicilio: fiadoAPagar.domicilio || 0,
      tipo: "fiado",
      items: fiadoAPagar.items || []
    };
    
    // Agregar campos específicos para mixto
    if (metodoPago === 'mixto') {
      nuevaVenta.efectivo = efectivo;
      nuevaVenta.nequi = nequi;
    }
    
    const nuevasVentas = [...ventas, nuevaVenta];
    const actualizados = fiados.map((f) =>
      f.id === fiadoAPagar.id ? { ...f, estado: "aldia", fechaPago: fechaPagoFiado } : f
    );
    
    try {
      await syncStorage.setItem("sales", nuevasVentas);
      await syncStorage.setItem("fiados", actualizados);
      
      setVentas(nuevasVentas);
      setFiados(actualizados);
      
      localStorage.setItem("sales", JSON.stringify(nuevasVentas));
      localStorage.setItem("fiados", JSON.stringify(actualizados));
      
      setRefreshKey(prev => prev + 1);
      setUltimaActualizacion(new Date());
      
      // Generar PDF si está disponible
      try {
        const fiadoPagado = {
          ...fiadoAPagar,
          fechaPago: fechaPagoFiado,
          metodoPago,
          ...(metodoPago === 'mixto' && { efectivo, nequi })
        };
        
        if (PDFGenerator && typeof PDFGenerator.generarFacturaFiado === 'function') {
          PDFGenerator.generarFacturaFiado(fiadoPagado);
        }
      } catch (error) {
        console.warn("No se pudo generar PDF del fiado:", error);
      }
      
      alert(`✅ Fiado marcado como pagado:\n\n` +
            `Cliente: ${fiadoAPagar.nombre}\n` +
            `Método: ${metodoPago.toUpperCase()}\n` +
            `Total: $${fiadoAPagar.valor.toLocaleString()}\n` +
            `${metodoPago === 'mixto' ? `Efectivo: $${efectivo.toLocaleString()}\nNequi: $${nequi.toLocaleString()}\n` : ''}` +
            `Fecha: ${fechaPagoFiado}\n\n` +
            `Sumado a las ventas del ${fechaPagoFiado}`);
      
      // Cerrar modal
      setShowModalPagarFiado(false);
      setFiadoAPagar(null);
      
    } catch (error) {
      console.error("❌ Error marcando fiado:", error);
      localStorage.setItem("sales", JSON.stringify(nuevasVentas));
      localStorage.setItem("fiados", JSON.stringify(actualizados));
      setVentas(nuevasVentas);
      setFiados(actualizados);
      
      alert("✅ Fiado marcado como pagado (modo offline).");
      setShowModalPagarFiado(false);
      setFiadoAPagar(null);
    }
  };

  const verDetalleFiado = (fiado) => {
    setFiadoSeleccionado(fiado);
    setShowDetalleFiado(true);
  };

  const formatearHora = (fecha) => {
    return fecha.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "";
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return fechaStr;
    }
  };

  // Función para calcular valores de mixto automáticamente
  const calcularMixto = () => {
    if (fiadoAPagar && metodoPagoFiado === 'mixto') {
      const total = fiadoAPagar.valor;
      const mitad = Math.round(total / 2);
      setEfectivoMixto(mitad);
      setNequiMixto(total - mitad);
    }
  };

  return (
    <div className="reportes-container" key={refreshKey}>
      {/* INDICADOR DE SINCRONIZACIÓN */}
      <div className="tiempo-real-indicator" style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: sincronizacionActiva 
          ? (isRefreshing ? '#f59e0b' : '#10b981')
          : '#ef4444',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 'bold',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        border: '2px solid white'
      }}>
        {isRefreshing ? (
          <>
            <span className="spinner" style={{
              width: '10px',
              height: '10px',
              border: '2px solid white',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></span>
            Actualizando...
          </>
        ) : (
          <>
            <span>{sincronizacionActiva ? '✅' : '⚠️'}</span>
            {sincronizacionActiva 
              ? `Actualizado: ${formatearHora(ultimaActualizacion)}`
              : 'Sin conexión'}
          </>
        )}
        
        <button
          onClick={refrescarDatos}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '10px',
            marginLeft: '5px'
          }}
          title="Refrescar datos"
          disabled={isRefreshing}
        >
          🔄
        </button>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* HEADER */}
      <div className="reportes-header">
        <div>
          <h1>📊 PANEL ADMINISTRADOR</h1>
          <p className="fecha">{fechaSeleccionada ? formatearFecha(fechaSeleccionada) : "Selecciona una fecha"}</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <button 
              onClick={() => {
                const isGitHubPages = window.location.hostname.includes('github.io');
                const basePath = isGitHubPages ? '/la-perrada-pos' : '';
                window.location.href = basePath + '/';
              }}
              className="back-pos-btn"
            >
              ← Volver al POS
            </button>
            
            <div className={`px-3 py-1 rounded-lg font-bold text-sm ${
              estadoCaja === "abierta" 
                ? "bg-green-100 text-green-800 border border-green-300" 
                : "bg-red-100 text-red-800 border border-red-300"
            }`}>
              {estadoCaja === "abierta" ? "📦 Caja ABIERTA" : "📕 Caja CERRADA"}
            </div>
          </div>
        </div>
        
        <div className="user-info">
          <span>👤 {usuario?.nombre || 'Administrador'}</span>
          <button onClick={handleLogout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* CONTROL DE FECHA */}
      <div className="section-card">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-blue-600">📅</span>
          Fecha para Reportes
        </h2>
        
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1">
              <label className="block font-semibold text-gray-700 mb-2">
                Seleccionar fecha para filtrar reportes:
              </label>
              <input
                type="date"
                className="w-full border-2 border-blue-300 p-3 rounded-xl text-lg bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                value={fechaSeleccionada}
                onChange={(e) => {
                  const nuevaFecha = e.target.value;
                  setFechaSeleccionada(nuevaFecha);
                  
                  syncStorage.setItem("fechaActiva", nuevaFecha).catch(console.error);
                  localStorage.setItem("fechaActiva", nuevaFecha);
                  refrescarDatos();
                }}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <div className={`px-4 py-2 rounded-lg font-bold ${
                estadoCaja === "abierta" 
                  ? "bg-green-100 text-green-800 border border-green-300" 
                  : "bg-red-100 text-red-800 border border-red-300"
              }`}>
                {estadoCaja === "abierta" ? "📦 Caja ABIERTA" : "📕 Caja CERRADA"}
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-700 text-sm">
              💡 Esta fecha determina qué ventas se muestran en los reportes. 
              Puedes cambiarla en cualquier momento, incluso si la caja está abierta.
            </p>
          </div>
        </div>
        
        <div className="mt-4 flex gap-3">
          <button
            onClick={abrirCaja}
            className={`btn ${estadoCaja === "abierta" ? 'btn-disabled' : 'btn-success'}`}
            disabled={estadoCaja === "abierta" || !fechaSeleccionada}
          >
            📦 Abrir Caja
          </button>

          <button
            onClick={cerrarCaja}
            className={`btn ${estadoCaja === "cerrada" ? 'btn-disabled' : 'btn-danger'}`}
            disabled={estadoCaja === "cerrada" || !fechaSeleccionada}
          >
            📕 Cerrar Caja
          </button>
        </div>
      </div>

      {/* ✅ SECCIÓN BASE DE CAJA - SOLO LECTURA */}
      <div className="section-card">
        <h2>💰 Base de Caja</h2>
        
        <div className="space-y-4">
          {baseCargada && baseCaja > 0 ? (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-blue-700">Base establecida por Gerencia:</div>
                  <div className="text-2xl font-bold text-blue-900">${baseCaja.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Para fecha:</div>
                  <div className="font-semibold">{fechaSeleccionada}</div>
                </div>
              </div>
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-800">
                  ⚠️ Solo Gerencia (Gerson) puede modificar la base de caja.
                  Contacta al gerente para cambios.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-yellow-700">Base de caja no establecida</div>
                  <div className="text-sm text-yellow-600 mt-1">
                    La gerencia (Gerson) debe establecer la base de caja para esta fecha.
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Para fecha:</div>
                  <div className="font-semibold">{fechaSeleccionada}</div>
                </div>
              </div>
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs text-blue-800">
                  💡 Los cálculos se mostrarán con base $0 hasta que Gerencia establezca el monto.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ KPI CORREGIDOS */}
      <div className="kpi-container">
        <div className="kpi-card" onClick={refrescarDatos} style={{ cursor: 'pointer' }}>
          <div className="kpi-label">VENTAS TOTALES</div>
          <div className="kpi-value">${estadisticas.totalVentas.toLocaleString()}</div>
          <div className="kpi-trend">
            {estadisticas.ventasCount} transacciones
          </div>
          <div className="text-xs text-gray-500 mt-1">
            📊 Productos: ${estadisticas.totalProductos.toLocaleString()}
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-label">EFECTIVO RECAUDADO</div>
          <div className="kpi-value">${estadisticas.efectivoRecaudado.toLocaleString()}</div>
          <div className="kpi-trend">
            Base caja: ${estadisticas.baseCaja.toLocaleString()}
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-label">NEQUI RECAUDADO</div>
          <div className="kpi-value">${estadisticas.nequiRecaudado.toLocaleString()}</div>
          <div className="kpi-trend">
            Transferencias digitales
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-label">SALDO EN CAJA</div>
          <div className="kpi-value">${estadisticas.saldoCaja.toLocaleString()}</div>
          <div className="kpi-trend">
            Base + Efectivo recaudado
          </div>
        </div>
      </div>

      {/* 🔧 CORRECCIÓN 3: ELIMINADA SECCIÓN "📊 Resumen Financiero (Cálculos Corregidos)" */}

      {/* VENTAS DEL DÍA */}
      <div className="section-card">
        <div className="flex justify-between items-center mb-4">
          <h2>📋 Ventas del Día</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {estadisticas.ventasCount} ventas • ${estadisticas.totalVentas.toLocaleString()}
            </span>
            <button
              onClick={refrescarDatos}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded flex items-center gap-1"
              disabled={isRefreshing}
            >
              {isRefreshing ? '🔄' : '🔃'} Actualizar
            </button>
          </div>
        </div>
        
        {ventasPorDia.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No hay ventas registradas para esta fecha
          </p>
        ) : (
          <div className="ventas-cuadro-container">
            <div className="ventas-cuadro-header">
              <div className="ventas-cuadro-col-cliente">Cliente</div>
              <div className="ventas-cuadro-col-metodo">Método</div>
              <div className="ventas-cuadro-col-total">Total</div>
              <div className="ventas-cuadro-col-productos">Productos</div>
            </div>
            
            <div className="ventas-cuadro-scroll">
              {ventasPorDia.map((venta, index) => (
                <div key={index} className="venta-cuadro-item">
                  <div className="ventas-cuadro-col-cliente">
                    <span className="venta-cuadro-cliente">{venta.mesa || "Sin nombre"}</span>
                    {venta.domicilio > 0 && (
                      <span className="venta-cuadro-domicilio">🚚</span>
                    )}
                    {venta.tipo === "fiado" && (
                      <span className="venta-cuadro-fiado">📋 Fiado</span>
                    )}
                  </div>
                  
                  <div className="ventas-cuadro-col-metodo">
                    {venta.metodo === "efectivo" ? "💰" : 
                     venta.metodo === "nequi" ? "📱" : 
                     venta.metodo === "mixto" ? "🔄" : "💳"}
                  </div>
                  
                  <div className="ventas-cuadro-col-total">
                    <span className="venta-cuadro-total">
                      ${venta.total?.toLocaleString() || "0"}
                    </span>
                    {venta.metodo === "mixto" && (
                      <div className="text-xs text-gray-500">
                        💵 ${venta.efectivo?.toLocaleString() || "0"} + 📱 ${venta.nequi?.toLocaleString() || "0"}
                      </div>
                    )}
                  </div>
                  
                  <div className="ventas-cuadro-col-productos">
                    <div className="venta-cuadro-productos-lista">
                      {venta.items?.map((item, itemIndex) => (
                        <div key={itemIndex} className="producto-cuadro-item">
                          <span className="producto-cuadro-nombre">{item.nombre}</span>
                          <span className="producto-cuadro-cantidad">x{item.cantidad || 1}</span>
                          <span className="producto-cuadro-precio">
                            ${((item.precio || 0) * (item.cantidad || 1)).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* REGISTRAR FIADO */}
      <div className="section-card">
        <h2>📘 Registrar Fiado</h2>
        
        <div className="mb-4">
          <label className="block font-semibold mb-2">Tipo:</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTipoFiado("fisico")}
              className={`btn-tipo ${tipoFiado === "fisico" ? 'btn-tipo-active' : ''}`}
            >
              🏠 Físico
            </button>
            <button
              type="button"
              onClick={() => setTipoFiado("domicilio")}
              className={`btn-tipo ${tipoFiado === "domicilio" ? 'btn-tipo-active' : ''}`}
            >
              🚚 Domicilio
            </button>
          </div>
          
          {tipoFiado === "domicilio" && (
            <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
              <span className="font-semibold">Precio domicilio: </span>
              <select 
                className="border rounded px-2 py-1 ml-2"
                value={precioDomicilio}
                onChange={(e) => setPrecioDomicilio(parseInt(e.target.value))}
              >
                <option value="1500">$1.500</option>
                <option value="2000">$2.000</option>
                <option value="3000">$3.000</option>
                <option value="5000">$5.000</option>
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <input
            type="text"
            placeholder="Nombre del cliente"
            className="input-field"
            value={nuevoFiado.nombre}
            onChange={(e) =>
              setNuevoFiado({ ...nuevoFiado, nombre: e.target.value })
            }
          />
          
          <input
            type="text"
            placeholder="Celular (opcional)"
            className="input-field"
            value={nuevoFiado.celular}
            onChange={(e) =>
              setNuevoFiado({ ...nuevoFiado, celular: e.target.value })
            }
          />
        </div>

        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowMenuFiado(true)}
            className="btn btn-orange w-full"
          >
            🛒 Escoger Productos ({productosFiado.length} seleccionados)
          </button>
          
          {productosFiado.length > 0 && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
              <h4 className="font-bold mb-2">Productos seleccionados:</h4>
              <div className="space-y-2">
                {productosFiado.map((prod, idx) => {
                  const cantidad = prod.cantidad || 1;
                  return (
                    <div key={idx} className="producto-seleccionado">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{getName(prod)}</span>
                        <span className="badge badge-blue">
                          x{cantidad}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          ${(getPrice(prod) * cantidad).toLocaleString()}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => disminuirCantidadFiado(idx)}
                            className="btn-cantidad"
                          >
                            −
                          </button>
                          <button
                            onClick={() => eliminarProductoFiado(idx)}
                            className="btn-eliminar"
                          >
                            ✖
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
          <div className="flex justify-between font-bold">
            <span>Subtotal productos:</span>
            <span>${calcularSubtotalProductos().toLocaleString()}</span>
          </div>
          
          {tipoFiado === "domicilio" && (
            <div className="flex justify-between mt-1">
              <span>Domicilio:</span>
              <span>+${precioDomicilio.toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex justify-between mt-2 pt-2 border-t border-blue-300">
            <span className="text-lg font-bold">TOTAL A FIAR:</span>
            <span className="text-xl font-bold text-green-700">
              ${calcularTotalFiado().toLocaleString()}
            </span>
          </div>
        </div>

        <input
          type="date"
          className="input-field mb-4"
          value={nuevoFiado.fechaFiado}
          onChange={(e) =>
            setNuevoFiado({ ...nuevoFiado, fechaFiado: e.target.value })
          }
        />

        <button
          onClick={guardarFiado}
          className="btn btn-indigo w-full"
          disabled={productosFiado.length === 0 || !nuevoFiado.nombre}
        >
          💾 Guardar Fiado
        </button>
      </div>

      {/* FIADOS PENDIENTES */}
      <div className="section-card">
        <h2>📗 Fiados Pendientes</h2>
        <div className="fiados-header">
          <div>
            <span className="fiados-pendientes">
              Fiados pendientes: {fiados.filter((f) => f.estado === "pendiente").length}
            </span>
            <span className="fiados-total">
              Total pendiente: ${fiados
                .filter(f => f.estado === "pendiente")
                .reduce((sum, f) => sum + f.valor, 0)
                .toLocaleString()}
            </span>
          </div>
        </div>
        
        {fiados.filter((f) => f.estado === "pendiente").length === 0 ? (
          <p className="text-center text-gray-500 py-4">🎉 No hay fiados pendientes.</p>
        ) : (
          <div className="fiados-lista">
            {fiados
              .filter((f) => f.estado === "pendiente")
              .map((f) => (
                <div key={f.id} className="fiado-item">
                  <div className="fiado-info">
                    <p className="fiado-nombre">{f.nombre}</p>
                    <p className="fiado-detalles">
                      {f.tipo === "domicilio" ? "🚚 Domicilio" : "🏠 Físico"} • 
                      Fecha: {f.fechaFiado} • ${f.valor.toLocaleString()}
                    </p>
                    {f.celular && (
                      <p className="fiado-celular">📱 {f.celular}</p>
                    )}
                    
                    <button
                      onClick={() => verDetalleFiado(f)}
                      className="btn btn-blue btn-sm"
                    >
                      📋 Ver productos ({f.items?.length || 0})
                    </button>
                  </div>
                  
                  <div>
                    <button
                      onClick={() => marcarAlDia(f)}
                      className="btn btn-success"
                    >
                      ✅ Marcar pagado (genera PDF)
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* MODALES */}
      {showMenuFiado && (
        <div className="modal-overlay">
          <div className="modal-content-large">
            <div className="modal-header">
              <h3>🛒 Seleccionar productos</h3>
              <button
                onClick={() => {
                  setShowMenuFiado(false);
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
                        const enFiado = productosFiado.find(p => getId(p) === productId);
                        const cantidad = enFiado ? (enFiado.cantidad || 1) : 0;
                        
                        return (
                          <button
                            key={productId}
                            onClick={() => agregarProductoFiado(producto)}
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
              
              {productosFiado.length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <h4 className="font-bold mb-2">Productos seleccionados ({productosFiado.length}):</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {productosFiado.map((prod, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{getName(prod)}</span>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                            x{prod.cantidad || 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            ${(getPrice(prod) * (prod.cantidad || 1)).toLocaleString()}
                          </span>
                          <button
                            onClick={() => eliminarProductoFiado(idx)}
                            className="text-red-500 hover:text-red-700 text-sm transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
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
                  {productosFiado.length} productos
                </div>
              </div>
              <div className="modal-actions">
                <button
                  onClick={() => {
                    setProductosFiado([]);
                    setCategoriaSeleccionada(null);
                  }}
                  className="btn btn-gray"
                >
                  Limpiar todo
                </button>
                <button
                  onClick={() => setShowMenuFiado(false)}
                  className="btn btn-orange"
                >
                  Listo ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDetalleFiado && fiadoSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>📋 Detalle del fiado</h3>
              <button
                onClick={() => setShowDetalleFiado(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="mb-4">
                <p className="font-bold text-lg">{fiadoSeleccionado.nombre}</p>
                <p className="text-gray-600">
                  {fiadoSeleccionado.tipo === "domicilio" ? "🚚 Domicilio" : "🏠 Físico"} • 
                  Fecha: {fiadoSeleccionado.fechaFiado}
                </p>
                {fiadoSeleccionado.celular && (
                  <p className="text-gray-600">📱 {fiadoSeleccionado.celular}</p>
                )}
              </div>
              
              <div className="border rounded-lg p-3 mb-4">
                <h4 className="font-bold mb-2">Productos:</h4>
                <div className="space-y-2">
                  {fiadoSeleccionado.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1 border-b">
                      <div>
                        <span className="font-medium">{item.nombre}</span>
                        <div className="text-xs text-gray-600">x{item.cantidad || 1}</div>
                      </div>
                      <span className="font-semibold">
                        ${((item.precio || 0) * (item.cantidad || 1)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  
                  {fiadoSeleccionado.domicilio > 0 && (
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-medium">🚚 Domicilio</span>
                      <span className="font-semibold text-green-600">
                        +${fiadoSeleccionado.domicilio.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-2 font-bold">
                    <span>TOTAL:</span>
                    <span className="text-lg text-green-600">
                      ${fiadoSeleccionado.valor.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDetalleFiado(false)}
                  className="btn btn-gray"
                >
                  Cerrar
                </button>
                {fiadoSeleccionado.estado === "pendiente" && (
                  <button
                    onClick={() => {
                      setShowDetalleFiado(false);
                      marcarAlDia(fiadoSeleccionado);
                    }}
                    className="btn btn-green"
                  >
                    Marcar como pagado
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔧 CORRECCIÓN 2: MODAL PARA PAGAR FIADO (en lugar de prompt) */}
      {showModalPagarFiado && fiadoAPagar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>💳 Marcar Fiado como Pagado</h3>
              <button
                onClick={() => {
                  setShowModalPagarFiado(false);
                  setFiadoAPagar(null);
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="mb-4">
                <p className="font-bold text-lg">Cliente: {fiadoAPagar.nombre}</p>
                <p className="text-gray-600">
                  Total a pagar: <span className="font-bold text-green-600">${fiadoAPagar.valor.toLocaleString()}</span>
                </p>
              </div>
              
              {/* 🔧 CORRECCIÓN 4: SELECTOR DE FECHA - input type="date" */}
              <div className="mb-4">
                <label className="block font-semibold mb-2">📅 Fecha de pago:</label>
                <input
                  type="date"
                  className="w-full border-2 border-blue-300 p-2 rounded-lg"
                  value={fechaPagoFiado}
                  onChange={(e) => setFechaPagoFiado(e.target.value)}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Fecha en que el cliente realizó el pago
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block font-semibold mb-2">💳 Método de pago:</label>
                <div className="flex gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setMetodoPagoFiado("efectivo")}
                    className={`btn-tipo ${metodoPagoFiado === "efectivo" ? 'btn-tipo-active' : ''}`}
                  >
                    💵 Efectivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodoPagoFiado("nequi")}
                    className={`btn-tipo ${metodoPagoFiado === "nequi" ? 'btn-tipo-active' : ''}`}
                  >
                    📱 Nequi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMetodoPagoFiado("mixto");
                      calcularMixto();
                    }}
                    className={`btn-tipo ${metodoPagoFiado === "mixto" ? 'btn-tipo-active' : ''}`}
                  >
                    🔄 Mixto
                  </button>
                </div>
                
                {metodoPagoFiado === "mixto" && (
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">💵 Efectivo:</label>
                        <input
                          type="number"
                          className="w-full border rounded p-2"
                          value={efectivoMixto}
                          onChange={(e) => {
                            const valor = parseInt(e.target.value) || 0;
                            setEfectivoMixto(valor);
                            setNequiMixto(fiadoAPagar.valor - valor);
                          }}
                          min="0"
                          max={fiadoAPagar.valor}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">📱 Nequi:</label>
                        <input
                          type="number"
                          className="w-full border rounded p-2"
                          value={nequiMixto}
                          onChange={(e) => {
                            const valor = parseInt(e.target.value) || 0;
                            setNequiMixto(valor);
                            setEfectivoMixto(fiadoAPagar.valor - valor);
                          }}
                          min="0"
                          max={fiadoAPagar.valor}
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="font-semibold">Total: ${(efectivoMixto + nequiMixto).toLocaleString()}</span>
                      {efectivoMixto + nequiMixto !== fiadoAPagar.valor && (
                        <span className="text-red-600 ml-2">
                          ⚠️ Falta: ${(fiadoAPagar.valor - (efectivoMixto + nequiMixto)).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowModalPagarFiado(false);
                    setFiadoAPagar(null);
                  }}
                  className="btn btn-gray"
                >
                  Cancelar
                </button>
                <button
                  onClick={procesarPagoFiado}
                  className="btn btn-green"
                  disabled={metodoPagoFiado === "mixto" && (efectivoMixto + nequiMixto !== fiadoAPagar.valor)}
                >
                  ✅ Confirmar Pago
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReportes;