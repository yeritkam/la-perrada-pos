// src/pages/reportes/AdminReportes.jsx - VERSIÓN COMPLETA CORREGIDA
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sincronizacionActiva, setSincronizacionActiva] = useState(false);
  const [ventas, setVentas] = useState([]);
  const [baseCaja, setBaseCaja] = useState(10000);

  const [nuevoFiado, setNuevoFiado] = useState({
    nombre: "",
    celular: "",
    fechaFiado: "",
  });

  // 🔥🔥🔥 FUNCIÓN LOGOUT CORREGIDA Y FUNCIONAL 🔥🔥🔥
  const handleLogout = () => {
    // Limpiar todo
    localStorage.removeItem('reportes_usuario');
    localStorage.removeItem('fechaActiva');
    localStorage.removeItem('estadoCaja');
    
    // Forzar recarga completa
    setTimeout(() => {
      window.location.href = window.location.origin + '/la-perrada-pos/reportes';
      window.location.reload(true);
    }, 50);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log("📥 AdminReportes: Cargando datos iniciales...");
        
        const fecha = await syncStorage.getItem("fechaActiva");
        console.log("📅 Fecha cargada de Firebase:", fecha);
        
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
        console.log("📦 Fiados cargados:", fiadosData, "Tipo:", typeof fiadosData);
        
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
        console.log("📊 Ventas cargadas:", ventasData, "Tipo:", typeof ventasData);
        
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
      console.log("🔄 Sincronización fecha activa:", newFecha);
      if (newFecha !== null && newFecha !== undefined) {
        setFechaSeleccionada(newFecha);
        localStorage.setItem("fechaActiva", newFecha);
        setRefreshKey(prev => prev + 1);
      }
    });

    const unsubscribeEstado = syncStorage.syncItem("estadoCaja", (newEstado) => {
      console.log("🔄 Sincronización estado caja:", newEstado);
      if (newEstado !== null && newEstado !== undefined) {
        setEstadoCaja(newEstado);
        localStorage.setItem("estadoCaja", newEstado);
        setRefreshKey(prev => prev + 1);
      }
    });

    const unsubscribeFiados = syncStorage.syncItem("fiados", (newFiados) => {
      console.log("🔄 Sincronización fiados:", newFiados, "Tipo:", typeof newFiados);
      
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
      console.log("🔄 Sincronización ventas:", newVentas, "Tipo:", typeof newVentas);
      
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

    return () => {
      console.log("🧹 Limpiando listeners de AdminReportes.jsx");
      unsubscribeFecha?.();
      unsubscribeEstado?.();
      unsubscribeFiados?.();
      unsubscribeVentas?.();
    };
  }, []);

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

  const calcularEstadisticasCompletas = (ventasPorDia) => {
    let totalVentas = 0;
    let efectivoRecaudado = 0;
    let nequiRecaudado = 0;
    let totalDomicilios = 0;
    let ventasCount = 0;
    
    ventasPorDia.forEach(venta => {
      const total = parseFloat(venta.total) || 0;
      totalVentas += total;
      ventasCount++;
      
      switch(venta.metodo) {
        case 'efectivo':
          efectivoRecaudado += total;
          break;
        case 'nequi':
          nequiRecaudado += total;
          break;
        case 'mixto':
          efectivoRecaudado += parseFloat(venta.efectivo) || 0;
          nequiRecaudado += parseFloat(venta.nequi) || 0;
          break;
        default:
          break;
      }
      
      totalDomicilios += parseFloat(venta.domicilio) || 0;
    });
    
    const saldoCaja = baseCaja + efectivoRecaudado;
    const gananciaDia = totalVentas;
    const promedioVenta = ventasCount > 0 ? totalVentas / ventasCount : 0;
    const totalProductos = totalVentas - totalDomicilios;
    
    return {
      totalVentas,
      totalProductos,
      efectivoRecaudado,
      nequiRecaudado,
      totalDomicilios,
      saldoCaja,
      gananciaDia,
      promedioVenta,
      ventasCount,
      baseCaja
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
      cantDomicilios: ventasPorDia.filter(v => v.domicilio > 0).length,
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

  const marcarAlDia = async (fiado) => {
    const fechaPago = prompt("📅 Ingresa la fecha en que PAGÓ (AAAA-MM-DD):");

    if (!fechaPago) {
      alert("Debes ingresar una fecha válida.");
      return;
    }

    const nuevaVenta = {
      mesa: "Fiado - " + fiado.nombre,
      total: fiado.valor,
      metodo: "efectivo",
      fecha: fechaPago + "T12:00:00",
      domicilio: fiado.domicilio || 0,
      tipo: "fiado",
      items: fiado.items || []
    };

    const nuevasVentas = [...ventas, nuevaVenta];
    const actualizados = fiados.map((f) =>
      f.id === fiado.id ? { ...f, estado: "aldia", fechaPago } : f
    );

    try {
      console.log("✅ Marcando fiado como pagado:", fiado.id);
      
      await syncStorage.setItem("sales", nuevasVentas);
      await syncStorage.setItem("fiados", actualizados);
      
      setVentas(nuevasVentas);
      setFiados(actualizados);
      
      localStorage.setItem("sales", JSON.stringify(nuevasVentas));
      localStorage.setItem("fiados", JSON.stringify(actualizados));
      
      setRefreshKey(prev => prev + 1);
      setUltimaActualizacion(new Date());

      try {
        const fiadoPagado = {
          ...fiado,
          fechaPago
        };
        
        if (PDFGenerator && typeof PDFGenerator.generarFacturaFiado === 'function') {
          PDFGenerator.generarFacturaFiado(fiadoPagado);
        }
      } catch (error) {
        console.warn("No se pudo generar PDF del fiado:", error);
      }

      alert("✅ Fiado marcado como pagado, sumado a las ventas y factura PDF generada.");
    } catch (error) {
      console.error("❌ Error marcando fiado:", error);
      localStorage.setItem("sales", JSON.stringify(nuevasVentas));
      localStorage.setItem("fiados", JSON.stringify(actualizados));
      setVentas(nuevasVentas);
      setFiados(actualizados);
      
      alert("✅ Fiado marcado como pagado (modo offline).");
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
              onClick={() => window.location.href = '/la-perrada-pos/'}
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

            <button
              onClick={() => {
                if (ventasPorDia.length === 0) {
                  alert("⚠ No hay ventas para generar reporte.");
                  return;
                }
                
                const datosReporte = {
                  fecha: fechaSeleccionada || new Date().toISOString().split('T')[0],
                  ...estadisticas
                };
                
                if (PDFGenerator && typeof PDFGenerator.generarReporteCaja === 'function') {
                  PDFGenerator.generarReporteCaja(datosReporte);
                  alert("✅ Reporte PDF generado correctamente");
                } else {
                  alert("⚠ No se puede generar PDF en este momento");
                }
              }}
              className="px-3 py-1 rounded-lg font-bold text-sm bg-purple-100 text-purple-800 border border-purple-300 hover:bg-purple-200 transition-colors"
              disabled={ventasPorDia.length === 0}
            >
              📄 Generar Reporte PDF
            </button>
          </div>
        </div>
        
        <div className="user-info">
          <span>👤 {usuario?.nombre || 'Administrador'}</span>
          {/* 🔥🔥🔥 BOTÓN LOGOUT CORREGIDO Y FUNCIONAL 🔥🔥🔥 */}
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

      {/* KPI */}
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

      {/* RESUMEN FINANCIERO */}
      <div className="section-card">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="text-green-600">💰</span>
          Resumen Financiero del Día
        </h2>
        
        <div className="space-y-4">
          <div className="resumen-item">
            <div className="resumen-label">Base de Caja Inicial</div>
            <div className="resumen-value">${estadisticas.baseCaja.toLocaleString()}</div>
          </div>
          
          <div className="resumen-item">
            <div className="resumen-label">Efectivo Recaudado Hoy</div>
            <div className="resumen-value text-green-600">+${estadisticas.efectivoRecaudado.toLocaleString()}</div>
          </div>
          
          <div className="resumen-item">
            <div className="resumen-label">Nequi Recaudado Hoy</div>
            <div className="resumen-value text-purple-600">+${estadisticas.nequiRecaudado.toLocaleString()}</div>
          </div>
          
          <div className="resumen-item">
            <div className="resumen-label">Total Domicilios</div>
            <div className="resumen-value">+${estadisticas.totalDomicilios.toLocaleString()}</div>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <div className="resumen-item total">
              <div className="resumen-label">TOTAL VENTAS DEL DÍA</div>
              <div className="resumen-value text-2xl font-black text-blue-600">
                ${estadisticas.totalVentas.toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <div className="resumen-item ganancia">
              <div className="resumen-label">SALDO ACTUAL EN CAJA</div>
              <div className="resumen-value text-2xl font-black text-green-700">
                ${estadisticas.saldoCaja.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                (Base ${estadisticas.baseCaja.toLocaleString()} + Efectivo ${estadisticas.efectivoRecaudado.toLocaleString()})
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <div className="resumen-item ganancia">
              <div className="resumen-label">GANANCIA DEL DÍA</div>
              <div className="resumen-value text-2xl font-black text-emerald-700">
                ${estadisticas.gananciaDia.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                (Total de ventas realizadas hoy)
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-700 text-sm">
            💡 <strong>Explicación:</strong> El "Saldo en Caja" es el dinero físico disponible 
            (base + efectivo recaudado). La "Ganancia del Día" es el total de ventas realizadas, 
            que incluye efectivo, Nequi y domicilios.
          </p>
        </div>
      </div>

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
    </div>
  );
};

export default AdminReportes;