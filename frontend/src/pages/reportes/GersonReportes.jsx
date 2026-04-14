import React, { useState, useEffect, useCallback } from 'react';
import './ReportesComunes.css';
import products from "../../data/products.js";
import PDFGenerator from "../../components/PDFGenerator";
import syncStorage from "../../firebase/storage.js";

const GersonReportes = ({ usuario, onLogout }) => {
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
  const [formattedBase, setFormattedBase] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sincronizacionActiva, setSincronizacionActiva] = useState(false);
  const [ventas, setVentas] = useState([]);
  const [showModalPagarFiado, setShowModalPagarFiado] = useState(false);
  const [fiadoAPagar, setFiadoAPagar] = useState(null);
  const [fechaPagoFiado, setFechaPagoFiado] = useState("");
  const [metodoPagoFiado, setMetodoPagoFiado] = useState("efectivo");
  const [efectivoMixto, setEfectivoMixto] = useState(0);
  const [nequiMixto, setNequiMixto] = useState(0);
  const [showAgregarAfiado, setShowAgregarAfiado] = useState(false);
  const [fiadoParaAgregar, setFiadoParaAgregar] = useState(null);
  const [productosNuevos, setProductosNuevos] = useState([]);

  // Estados para el modal de método de pago al dividir cuenta
  const [showModalMetodoPagoPersona, setShowModalMetodoPagoPersona] = useState(false);
  const [personaPendiente, setPersonaPendiente] = useState(null);
  const [metodoPagoPersona, setMetodoPagoPersona] = useState("efectivo");
  const [efectivoPersona, setEfectivoPersona] = useState(0);
  const [nequiPersona, setNequiPersona] = useState(0);

  // Estados para división de cuentas (deben estar definidos)
  const [mesaActual, setMesaActual] = useState(null);
  const [personasDividir, setPersonasDividir] = useState(2);
  const [productosAsignados, setProductosAsignados] = useState({});
  const [pagosRealizados, setPagosRealizados] = useState({});
  const [showPagoIndividual, setShowPagoIndividual] = useState(false);
  const [personaAPagar, setPersonaAPagar] = useState(1);
  const [fechaActiva, setFechaActivaLocal] = useState(() => {
    return localStorage.getItem("fechaActiva") || "";
  });

  const [nuevoFiado, setNuevoFiado] = useState({ nombre: "", celular: "", fechaFiado: "" });

  useEffect(() => {
    setFechaPagoFiado(new Date().toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    const eliminarBotonFlotante = () => {
      document.querySelectorAll('button').forEach(boton => {
        const texto = boton.textContent || '';
        const estilos = boton.getAttribute('style') || '';
        if (texto.includes('Cerrar Sesión') && estilos.includes('position: fixed') && estilos.includes('top: 20px')) boton.remove();
      });
    };
    eliminarBotonFlotante();
    const intervalo = setInterval(eliminarBotonFlotante, 1000);
    return () => clearInterval(intervalo);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('reportes_usuario');
    localStorage.removeItem('fechaActiva');
    localStorage.removeItem('estadoCaja');
    const isGitHubPages = window.location.hostname.includes('github.io');
    const basePath = isGitHubPages ? '/la-perrada-pos' : '';
    window.location.href = basePath + '/';
    setTimeout(() => window.location.reload(true), 100);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const fecha = await syncStorage.getItem("fechaActiva");
        if (fecha && fecha !== "") setFechaSeleccionada(fecha);
        else setFechaSeleccionada(localStorage.getItem("fechaActiva") || "");
        const estado = await syncStorage.getItem("estadoCaja");
        setEstadoCaja(estado !== null ? estado : localStorage.getItem("estadoCaja") || "cerrada");
        const fiadosData = await syncStorage.getItem("fiados");
        if (fiadosData) setFiados(Array.isArray(fiadosData) ? fiadosData : Object.values(fiadosData));
        else setFiados(JSON.parse(localStorage.getItem("fiados") || "[]"));
        const ventasData = await syncStorage.getItem("sales");
        if (ventasData) setVentas(Array.isArray(ventasData) ? ventasData : Object.values(ventasData));
        else setVentas(JSON.parse(localStorage.getItem("sales") || "[]"));
        setSincronizacionActiva(true);
      } catch (error) {
        console.error("Error cargando:", error);
        setFechaSeleccionada(localStorage.getItem("fechaActiva") || "");
        setEstadoCaja(localStorage.getItem("estadoCaja") || "cerrada");
        setFiados(JSON.parse(localStorage.getItem("fiados") || "[]"));
        setVentas(JSON.parse(localStorage.getItem("sales") || "[]"));
      }
    };
    loadInitialData();

    const loadBase = async () => {
      try {
        const baseData = await syncStorage.getItem("baseCaja");
        if (baseData && typeof baseData === 'object' && baseData.fecha === fechaSeleccionada) {
          setBaseCaja(baseData.monto || 0);
          setFormattedBase(formatNumber(baseData.monto || 0));
        }
      } catch (error) { console.error("Error cargando base:", error); }
    };
    if (fechaSeleccionada) loadBase();

    const unsubscribeFecha = syncStorage.syncItem("fechaActiva", (nf) => nf && setFechaSeleccionada(nf));
    const unsubscribeEstado = syncStorage.syncItem("estadoCaja", (ne) => ne && setEstadoCaja(ne));
    const unsubscribeFiados = syncStorage.syncItem("fiados", (nf) => nf && setFiados(Array.isArray(nf) ? nf : Object.values(nf)));
    const unsubscribeVentas = syncStorage.syncItem("sales", (nv) => nv && setVentas(Array.isArray(nv) ? nv : Object.values(nv)));
    const unsubscribeBase = syncStorage.syncItem("baseCaja", (nb) => { if (nb && typeof nb === 'object' && nb.fecha === fechaSeleccionada) { setBaseCaja(nb.monto || 0); setFormattedBase(formatNumber(nb.monto || 0)); } });
    return () => { unsubscribeFecha?.(); unsubscribeEstado?.(); unsubscribeFiados?.(); unsubscribeVentas?.(); unsubscribeBase?.(); };
  }, [fechaSeleccionada]);

  const getName = (p) => p.name || p.nombre || "Producto";
  const getPrice = (p) => p.price || p.precio || 0;
  const getCat = (p) => p.category || p.categoria || "Sin categoría";
  const getId = (p) => p.id || Math.random().toString();

  const categorias = [
    "Perros calientes", "Hamburguesas", "Suizos", "Salchipapa", "Picadas",
    "Bebidas", "Adiciones", "Combos"
  ];

  const getIconoPorCategoria = (categoria) => {
    const iconos = {
      "Perros calientes": "🌭", "Hamburguesas": "🍔", "Suizos": "🧀",
      "Salchipapa": "🍟", "Picadas": "🥘", "Bebidas": "🥤",
      "Adiciones": "➕", "Combos": "🎯"
    };
    return iconos[categoria] || "🍕";
  };

  const refrescarDatos = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const fecha = await syncStorage.getItem("fechaActiva");
      if (fecha) setFechaSeleccionada(fecha);
      const estado = await syncStorage.getItem("estadoCaja");
      if (estado) setEstadoCaja(estado);
      const ventasData = await syncStorage.getItem("sales");
      if (ventasData) setVentas(Array.isArray(ventasData) ? ventasData : Object.values(ventasData));
      const fiadosData = await syncStorage.getItem("fiados");
      if (fiadosData) setFiados(Array.isArray(fiadosData) ? fiadosData : Object.values(fiadosData));
      setRefreshKey(prev => prev + 1);
      setUltimaActualizacion(new Date());
    } catch (error) { console.error("Error refrescando:", error); }
    finally { setTimeout(() => setIsRefreshing(false), 500); }
  }, [isRefreshing]);

  const calcularEstadisticas = (ventasPorDia) => {
    let totalVentas = 0;
    let efectivo = 0;
    let nequi = 0;
    let totalDomicilios = 0;
    let count = 0;
    
    ventasPorDia.forEach(v => {
      const totalVenta = parseInt(v.total) || 0;
      const domicilio = parseInt(v.domicilio) || 0;
      
      totalDomicilios += domicilio;
      totalVentas += totalVenta + domicilio;
      count++;
      
      const totalPagar = totalVenta + domicilio;
      switch(v.metodo) {
        case 'efectivo':
          efectivo += totalPagar;
          break;
        case 'nequi':
          nequi += totalPagar;
          break;
        case 'mixto':
          if (v.efectivo && v.nequi) {
            efectivo += parseInt(v.efectivo) || 0;
            nequi += parseInt(v.nequi) || 0;
          } else {
            efectivo += Math.round(totalPagar / 2);
            nequi += Math.round(totalPagar / 2);
          }
          break;
        default:
          efectivo += totalPagar;
      }
    });
    
    return {
      totalVentas: Math.round(totalVentas),
      efectivo: Math.round(efectivo),
      nequi: Math.round(nequi),
      totalDomicilios: Math.round(totalDomicilios),
      count,
      baseCaja: Math.round(baseCaja)
    };
  };

  const ventasPorDia = ventas.filter(v => {
    try {
      if (!v.fecha) return false;
      const f = new Date(v.fecha);
      if (isNaN(f.getTime())) return false;
      return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}` === fechaSeleccionada;
    } catch { return false; }
  });

  const stats = calcularEstadisticas(ventasPorDia);

  const eliminarVenta = async (index) => {
    if (!window.confirm("¿Estás seguro de eliminar esta venta? Esta acción no se puede deshacer.")) {
      return;
    }

    const ventaAEliminar = ventasPorDia[index];
    const nuevasVentas = ventas.filter(v => {
      const fechaVenta = v.fecha?.split('T')[0] || "";
      const fechaSeleccionadaVenta = fechaSeleccionada;
      return !(fechaVenta === fechaSeleccionadaVenta && 
               v.mesa === ventaAEliminar.mesa && 
               v.total === ventaAEliminar.total &&
               v.metodo === ventaAEliminar.metodo);
    });

    try {
      await syncStorage.setItem("sales", nuevasVentas);
      setVentas(nuevasVentas);
      alert("✅ Venta eliminada correctamente");
      refrescarDatos();
    } catch (error) {
      console.error("Error eliminando venta:", error);
      localStorage.setItem("sales", JSON.stringify(nuevasVentas));
      setVentas(nuevasVentas);
      alert("✅ Venta eliminada (modo offline)");
    }
  };

  const abrirCaja = async () => {
    if (!fechaSeleccionada) return alert("Selecciona una fecha");
    try {
      await syncStorage.setItem("estadoCaja", "abierta");
      await syncStorage.setItem("fechaActiva", fechaSeleccionada);
      setEstadoCaja("abierta");
      alert("Caja abierta");
    } catch (error) { setEstadoCaja("abierta"); alert("Caja abierta (offline)"); }
  };

  const cerrarCaja = async () => {
    if (!fechaSeleccionada) return alert("Selecciona una fecha");
    try {
      await syncStorage.setItem("estadoCaja", "cerrada");
      await syncStorage.setItem("fechaActiva", "");
      setEstadoCaja("cerrada");
      setFechaSeleccionada("");
      alert(`Caja cerrada\nTotal: $${stats.totalVentas.toLocaleString()}`);
    } catch (error) { setEstadoCaja("cerrada"); setFechaSeleccionada(""); alert(`Caja cerrada (offline)\nTotal: $${stats.totalVentas.toLocaleString()}`); }
  };

  const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const handleBaseChange = (e) => { const num = parseInt(e.target.value.replace(/[^\d]/g, '')) || 0; setBaseCaja(num); setFormattedBase(formatNumber(num)); };
  const setBaseRapida = (monto) => { setBaseCaja(monto); setFormattedBase(formatNumber(monto)); };
  const guardarBaseCaja = async () => {
    if (!fechaSeleccionada) return alert("Selecciona una fecha");
    if (baseCaja <= 0) return alert("La base debe ser mayor a $0");
    try {
      await syncStorage.setItem("baseCaja", { fecha: fechaSeleccionada, monto: baseCaja, usuario: 'GERSON', timestamp: new Date().toISOString() });
      alert(`Base guardada: $${baseCaja.toLocaleString()}`);
      refrescarDatos();
    } catch (error) { alert(`Base guardada localmente: $${baseCaja.toLocaleString()}`); refrescarDatos(); }
  };

  const exportarCSV = () => {
    if (ventasPorDia.length === 0) {
      alert("No hay ventas para exportar");
      return;
    }

    const headers = ["Fecha", "Cliente", "Tipo", "Método", "Total", "Efectivo", "Nequi", "Domicilio", "Productos"];
    let csv = headers.join(",") + "\n";

    ventasPorDia.forEach(venta => {
      const productos = venta.items?.map(item => 
        `${item.nombre} x${item.cantidad || 1}`
      ).join("; ") || "";

      const row = [
        venta.fecha?.split('T')[0] || fechaSeleccionada,
        `"${venta.mesa || "Sin nombre"}"`,
        venta.tipo || "normal",
        venta.metodo,
        venta.total || 0,
        venta.efectivo || 0,
        venta.nequi || 0,
        venta.domicilio || 0,
        `"${productos}"`
      ];

      csv += row.join(",") + "\n";
    });

    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `ventas_${fechaSeleccionada}_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("📥 CSV exportado correctamente");
  };

  const generarPDFManual = () => {
    if (ventasPorDia.length === 0) {
      alert("⚠ No hay ventas para generar PDF");
      return;
    }

    try {
      if (PDFGenerator && typeof PDFGenerator.generarReporteDiario === 'function') {
        PDFGenerator.generarReporteDiario(ventasPorDia);
        alert("✅ PDF generado correctamente");
      } else {
        generarPDFAlternativo();
      }
    } catch (error) {
      console.error("Error generando PDF:", error);
      generarPDFAlternativo();
    }
  };

  const generarPDFAlternativo = () => {
    const contenido = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte Diario Gerencia - ${fechaSeleccionada}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { background: linear-gradient(135deg, #2b2d42 0%, #4c6ef5 100%); color: white; padding: 20px; text-align: center; border-radius: 10px; }
          .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
          .total { color: #2b8a3e; font-size: 20px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⭐ REPORTE DIARIO GERENCIA</h1>
          <h3>La Perrada de Piter</h3>
          <p>Fecha: ${fechaSeleccionada} • Generado: ${new Date().toLocaleString()}</p>
        </div>
        <div class="section">
          <h2>📊 RESUMEN FINANCIERO</h2>
          <p>Base de Caja: $${stats.baseCaja.toLocaleString()}</p>
          <p>Efectivo Recaudado: $${stats.efectivo.toLocaleString()}</p>
          <p>Nequi Recaudado: $${stats.nequi.toLocaleString()}</p>
          <p>Total Domicilios: $${stats.totalDomicilios.toLocaleString()}</p>
          <p class="total">🏆 VENTAS DEL DÍA: $${(stats.baseCaja + stats.efectivo + stats.nequi).toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    const ventana = window.open('', '_blank');
    ventana.document.write(contenido);
    ventana.document.close();
    ventana.print();
  };

  const calcularSubtotal = () => productosFiado.reduce((t, p) => t + (getPrice(p) * (p.cantidad || 1)), 0);
  const calcularTotalFiado = () => calcularSubtotal() + (tipoFiado === "domicilio" ? precioDomicilio : 0);

  const agregarProductoFiado = (prod) => {
    const id = getId(prod);
    const idx = productosFiado.findIndex(p => getId(p) === id);
    if (idx >= 0) { const u = [...productosFiado]; u[idx] = { ...u[idx], cantidad: (u[idx].cantidad || 1) + 1 }; setProductosFiado(u); }
    else setProductosFiado([...productosFiado, { ...prod, cantidad: 1 }]);
  };

  const agregarProductoNuevo = (prod) => {
    const id = getId(prod);
    const idx = productosNuevos.findIndex(p => getId(p) === id);
    if (idx >= 0) { const u = [...productosNuevos]; u[idx] = { ...u[idx], cantidad: (u[idx].cantidad || 1) + 1 }; setProductosNuevos(u); }
    else setProductosNuevos([...productosNuevos, { ...prod, cantidad: 1 }]);
  };

  const disminuirNuevo = (idx) => { const u = [...productosNuevos]; const c = u[idx].cantidad || 1; if (c <= 1) u.splice(idx, 1); else u[idx] = { ...u[idx], cantidad: c - 1 }; setProductosNuevos(u); };
  const eliminarNuevo = (idx) => { const u = [...productosNuevos]; u.splice(idx, 1); setProductosNuevos(u); };
  const disminuirFiado = (idx) => { const u = [...productosFiado]; const c = u[idx].cantidad || 1; if (c <= 1) u.splice(idx, 1); else u[idx] = { ...u[idx], cantidad: c - 1 }; setProductosFiado(u); };
  const eliminarFiado = (idx) => { const u = [...productosFiado]; u.splice(idx, 1); setProductosFiado(u); };
  const filtrados = categoriaSeleccionada ? products.filter(p => getCat(p) === categoriaSeleccionada) : [];

  const guardarFiado = async () => {
    if (!nuevoFiado.nombre) return alert("Ingresa el nombre");
    if (productosFiado.length === 0) return alert("Selecciona productos");
    const nuevo = {
      id: Date.now(), nombre: nuevoFiado.nombre, celular: nuevoFiado.celular,
      tipo: tipoFiado, domicilio: tipoFiado === "domicilio" ? precioDomicilio : 0,
      items: productosFiado.map(p => ({ id: getId(p), nombre: getName(p), precio: getPrice(p), cantidad: p.cantidad || 1 })),
      valor: calcularTotalFiado(), fechaFiado: nuevoFiado.fechaFiado || new Date().toISOString().split('T')[0], estado: "pendiente"
    };
    const nuevaLista = [...fiados, nuevo];
    try {
      await syncStorage.setItem("fiados", nuevaLista);
      setFiados(nuevaLista);
      setNuevoFiado({ nombre: "", celular: "", fechaFiado: "" });
      setProductosFiado([]);
      alert("Fiado registrado");
    } catch (error) { localStorage.setItem("fiados", JSON.stringify(nuevaLista)); setFiados(nuevaLista); alert("Fiado registrado (offline)"); }
  };

  const agregarAFiadoExistente = async () => {
    if (!fiadoParaAgregar || productosNuevos.length === 0) return;
    const nuevosItems = productosNuevos.map(p => ({ id: getId(p), nombre: getName(p), precio: getPrice(p), cantidad: p.cantidad || 1 }));
    const itemsActualizados = [...(fiadoParaAgregar.items || []), ...nuevosItems];
    const nuevoValor = itemsActualizados.reduce((s, i) => s + (i.precio * (i.cantidad || 1)), 0) + (fiadoParaAgregar.domicilio || 0);
    const actualizados = fiados.map(f => f.id === fiadoParaAgregar.id ? { ...f, items: itemsActualizados, valor: nuevoValor } : f);
    try {
      await syncStorage.setItem("fiados", actualizados);
      setFiados(actualizados);
      setShowAgregarAfiado(false);
      setFiadoParaAgregar(null);
      setProductosNuevos([]);
      setCategoriaSeleccionada(null);
      alert(`✅ Productos agregados a ${fiadoParaAgregar.nombre}\nNuevo total: $${nuevoValor.toLocaleString()}`);
      refrescarDatos();
    } catch (error) { localStorage.setItem("fiados", JSON.stringify(actualizados)); setFiados(actualizados); alert("Productos agregados (offline)"); setShowAgregarAfiado(false); setFiadoParaAgregar(null); setProductosNuevos([]); }
  };

  const marcarPagado = (f) => { setFiadoAPagar(f); setFechaPagoFiado(new Date().toISOString().split('T')[0]); setMetodoPagoFiado("efectivo"); setEfectivoMixto(0); setNequiMixto(0); setShowModalPagarFiado(true); };
  
  const procesarPago = async () => {
    if (!fiadoAPagar || !fechaPagoFiado) return alert("Datos incompletos");
    let efectivo = 0, nequi = 0, metodo = metodoPagoFiado;
    if (metodo === 'mixto') {
      efectivo = efectivoMixto || 0; nequi = nequiMixto || 0;
      if (efectivo + nequi !== fiadoAPagar.valor) return alert(`Los montos no suman el total ($${fiadoAPagar.valor.toLocaleString()})`);
    }
    const nuevaVenta = { mesa: "Fiado - " + fiadoAPagar.nombre, total: fiadoAPagar.valor, metodo, fecha: fechaPagoFiado + "T12:00:00", domicilio: fiadoAPagar.domicilio || 0, tipo: "fiado", items: fiadoAPagar.items || [] };
    if (metodo === 'mixto') { nuevaVenta.efectivo = efectivo; nuevaVenta.nequi = nequi; }
    const nuevasVentas = [...ventas, nuevaVenta];
    const actualizados = fiados.map(f => f.id === fiadoAPagar.id ? { ...f, estado: "aldia", fechaPago: fechaPagoFiado } : f);
    try {
      await syncStorage.setItem("sales", nuevasVentas);
      await syncStorage.setItem("fiados", actualizados);
      setVentas(nuevasVentas); setFiados(actualizados);
      alert(`✅ Fiado pagado\nCliente: ${fiadoAPagar.nombre}\nTotal: $${fiadoAPagar.valor.toLocaleString()}`);
      setShowModalPagarFiado(false); setFiadoAPagar(null);
      refrescarDatos();
    } catch (error) { localStorage.setItem("sales", JSON.stringify(nuevasVentas)); localStorage.setItem("fiados", JSON.stringify(actualizados)); setVentas(nuevasVentas); setFiados(actualizados); alert("Fiado pagado (offline)"); setShowModalPagarFiado(false); setFiadoAPagar(null); }
  };

  const verDetalle = (f) => { setFiadoSeleccionado(f); setShowDetalleFiado(true); };
  const formatearHora = (f) => f.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatearFecha = (str) => { if (!str) return ""; try { return new Date(str).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); } catch { return str; } };
  const calcularMitad = () => { if (fiadoAPagar && metodoPagoFiado === 'mixto') { const mitad = Math.round(fiadoAPagar.valor / 2); setEfectivoMixto(mitad); setNequiMixto(fiadoAPagar.valor - mitad); } };

  // ============ FUNCIONES PARA DIVIDIR CUENTAS ============
  
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

  const saveSales = async (nuevasVentas) => {
    try {
      await syncStorage.setItem("sales", nuevasVentas);
      localStorage.setItem("sales", JSON.stringify(nuevasVentas));
    } catch (error) {
      console.error("Error guardando ventas:", error);
      localStorage.setItem("sales", JSON.stringify(nuevasVentas));
    }
  };

  const saveMesas = async (nuevasMesas) => {
    try {
      await syncStorage.setItem("orders", nuevasMesas);
      localStorage.setItem("orders", JSON.stringify(nuevasMesas));
    } catch (error) {
      console.error("Error guardando mesas:", error);
      localStorage.setItem("orders", JSON.stringify(nuevasMesas));
    }
  };

  // Función para abrir modal de método de pago
  const abrirModalMetodoPagoPersona = (persona) => {
    const subtotal = calcularSubtotalPersona(persona);
    setPersonaPendiente(persona);
    setMetodoPagoPersona("efectivo");
    setEfectivoPersona(subtotal);
    setNequiPersona(0);
    setShowModalMetodoPagoPersona(true);
  };

  // Función para pagar persona (llama al modal)
  const pagarPersona = (persona) => {
    abrirModalMetodoPagoPersona(persona);
  };

  // Procesar pago de persona con el método seleccionado
  const procesarPagoPersona = async () => {
    if (!personaPendiente) return;
    
    const subtotal = calcularSubtotalPersona(personaPendiente);
    let efectivo = 0, nequi = 0, metodo = metodoPagoPersona;
    
    if (metodo === 'mixto') {
      efectivo = efectivoPersona || 0;
      nequi = nequiPersona || 0;
      if (efectivo + nequi !== subtotal) {
        alert(`⚠️ Los montos no suman el total ($${subtotal.toLocaleString()}).`);
        return;
      }
    } else if (metodo === 'efectivo') {
      efectivo = subtotal;
    } else if (metodo === 'nequi') {
      nequi = subtotal;
    }
    
    setPagosRealizados(prev => ({ ...prev, [personaPendiente]: true }));
    
    let ventasArr = [];
    try {
      const saved = await syncStorage.getItem("sales");
      ventasArr = (saved && Array.isArray(saved)) ? saved : (localStorage.getItem("sales") ? JSON.parse(localStorage.getItem("sales")) : []);
    } catch (error) {
      ventasArr = localStorage.getItem("sales") ? JSON.parse(localStorage.getItem("sales")) : [];
    }

    const fechaISO = fechaActiva ? `${fechaActiva}T${new Date().toTimeString().split(' ')[0]}` : new Date().toISOString();
    const nuevaVenta = {
      fecha: fechaISO, fechaSimple: fechaActiva,
      mesa: mesas[mesaActual].tipo === "domicilio" ? `Domicilio ${mesaActual - 9}` : `Mesa ${mesaActual + 1}`,
      total: subtotal, metodo: metodo,
      domicilio: mesas[mesaActual].domicilio ? mesas[mesaActual].domicilio / personasDividir : 0,
      tipo: mesas[mesaActual].tipo || "mesa",
      persona: personaPendiente, dividido: true,
      efectivo: efectivo,
      nequi: nequi
    };
    
    ventasArr.push(nuevaVenta);
    await saveSales(ventasArr);

    const datosFactura = {
      id: Date.now(),
      nombre: `Persona ${personaPendiente} - ${mesas[mesaActual].tipo === "domicilio" ? `Domicilio ${mesaActual - 9}` : `Mesa ${mesaActual + 1}`}`,
      celular: "", tipo: mesas[mesaActual].tipo || "mesa",
      fechaVenta: fechaActiva || new Date().toISOString().split('T')[0],
      valor: subtotal, domicilio: mesas[mesaActual].domicilio ? mesas[mesaActual].domicilio / personasDividir : 0,
      metodoPago: metodo,
      montoEfectivo: efectivo,
      montoNequi: nequi,
      items: mesas[mesaActual].items.map((item, idx) => {
        const asignado = productosAsignados[idx];
        let cantidad = 0;
        if (asignado === personaPendiente) cantidad = item.cantidad || 1;
        else if (asignado === "todos") cantidad = (item.cantidad || 1) / personasDividir;
        return { id: item.id || Math.random(), nombre: item.nombre, precio: item.precio, cantidad: Math.round(cantidad * 100) / 100 };
      }).filter(i => i.cantidad > 0)
    };
    
    PDFGenerator.generarFacturaVenta(datosFactura);
    
    alert(`✅ Pago Persona ${personaPendiente}: $${subtotal.toLocaleString()} (${metodo === 'efectivo' ? 'Efectivo' : metodo === 'nequi' ? 'Nequi' : 'Mixto'})`);
    
    const todasPagadas = Array.from({ length: personasDividir }, (_, i) => i + 1).every(p => pagosRealizados[p] || (p === personaPendiente));
    
    if (todasPagadas) {
      const nuevas = [...mesas];
      nuevas[mesaActual] = { ...nuevas[mesaActual], items: [], estado: "vacia", domicilio: 0 };
      await saveMesas(nuevas);
      setShowPagoIndividual(false);
      setMesaActual(null);
      alert("✅ Mesa liberada");
    } else {
      const sig = personaPendiente + 1;
      if (sig <= personasDividir) {
        setPersonaAPagar(sig);
      } else {
        setShowPagoIndividual(false);
      }
    }
    setShowModalMetodoPagoPersona(false);
    setPersonaPendiente(null);
  };

  // ============ FIN FUNCIONES DIVIDIR CUENTAS ============

  // Fórmula corregida
  const ventasDelDiaFinal = stats.baseCaja + stats.efectivo + stats.nequi;

  // Simulación de mesas (para evitar errores, en la práctica se cargan desde Firebase)
  const [mesas, setMesas] = useState([]);

  return (
    <div className="reportes-container" key={refreshKey}>
      <div className="tiempo-real-indicator" style={{ position: 'fixed', top: '10px', right: '10px', background: sincronizacionActiva ? (isRefreshing ? '#f59e0b' : '#10b981') : '#ef4444', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '6px' }}>
        {isRefreshing ? <><span className="spinner" style={{ width: '10px', height: '10px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>Actualizando...</> : <><span>{sincronizacionActiva ? '✅' : '⚠️'}</span>{sincronizacionActiva ? `Actualizado: ${formatearHora(ultimaActualizacion)}` : 'Sin conexión'}</>}
        <button onClick={refrescarDatos} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer' }} disabled={isRefreshing}>🔄</button>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>

      <div className="reportes-header" style={{ background: "linear-gradient(135deg, #2b2d42 0%, #4c6ef5 100%)" }}>
        <div>
          <h1 style={{ color: "white", WebkitTextFillColor: "white" }}>⭐ GERENCIA (GERSON)</h1>
          <p className="fecha" style={{ color: "#adb5bd" }}>{fechaSeleccionada ? formatearFecha(fechaSeleccionada) : "Selecciona una fecha"}</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <button onClick={() => { const isGitHubPages = window.location.hostname.includes('github.io'); const basePath = isGitHubPages ? '/la-perrada-pos' : ''; window.location.href = basePath + '/'; }} className="back-pos-btn" style={{ background: "rgba(255,255,255,0.1)", color: "white", borderColor: "white" }}>← Volver al POS</button>
            <div className={`px-3 py-1 rounded-lg font-bold text-sm ${estadoCaja === "abierta" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{estadoCaja === "abierta" ? "📦 Caja ABIERTA" : "📕 Caja CERRADA"}</div>
            <button onClick={generarPDFManual} className="px-3 py-1 rounded-lg font-bold text-sm bg-purple-100 text-purple-800" disabled={ventasPorDia.length === 0}>📄 Generar PDF</button>
            <button onClick={exportarCSV} className="px-3 py-1 rounded-lg font-bold text-sm bg-blue-100 text-blue-800" disabled={ventasPorDia.length === 0}>📥 Exportar CSV</button>
          </div>
        </div>
        <div className="user-info"><span style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>👑 GERENTE: GERSON</span><button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button></div>
      </div>

      <div className="section-card gerencia-section">
        <div className="section-header-gerencia"><h2>💰 BASE DE CAJA</h2><span className="gerencia-badge">EXCLUSIVO</span></div>
        <div className="base-caja-container">
          <div className="flex gap-3 items-center flex-wrap">
            <div><input type="tel" inputMode="numeric" className="input-field" placeholder="Ej: 50.000" value={formattedBase} onChange={handleBaseChange} style={{ maxWidth: "200px" }} /><div className="text-xs text-gray-500">Usa teclado numérico</div></div>
            <div className="flex gap-2"><button onClick={() => setBaseRapida(10000)} className="px-3 py-2 rounded-lg bg-blue-100">$10k</button><button onClick={() => setBaseRapida(50000)} className="px-3 py-2 rounded-lg bg-green-100">$50k</button><button onClick={() => setBaseRapida(100000)} className="px-3 py-2 rounded-lg bg-purple-100">$100k</button><button onClick={() => setBaseRapida(0)} className="px-3 py-2 rounded-lg bg-gray-100">Limpiar</button></div>
            <button onClick={guardarBaseCaja} className="btn btn-success" disabled={!fechaSeleccionada}>💾 Guardar</button>
          </div>
          {baseCaja > 0 && <div className="mt-3 p-2 bg-green-50 rounded"><div className="font-bold text-green-700">Base: ${baseCaja.toLocaleString()}</div><div className="text-xs">Se sincronizará con Admin</div></div>}
        </div>
      </div>

      <div className="section-card">
        <h2>📅 Control de Caja</h2>
        <div className="flex flex-col md:flex-row gap-4"><input type="date" className="w-full border-2 p-3 rounded-xl text-lg" value={fechaSeleccionada} onChange={e => { setFechaSeleccionada(e.target.value); syncStorage.setItem("fechaActiva", e.target.value); refrescarDatos(); }} /></div>
        <div className="mt-4 flex gap-3"><button onClick={abrirCaja} className={`btn ${estadoCaja === "abierta" ? 'btn-disabled' : 'btn-success'}`} disabled={estadoCaja === "abierta" || !fechaSeleccionada}>📦 Abrir Caja</button><button onClick={cerrarCaja} className={`btn ${estadoCaja === "cerrada" ? 'btn-disabled' : 'btn-danger'}`} disabled={estadoCaja === "cerrada" || !fechaSeleccionada}>📕 Cerrar Caja</button></div>
      </div>

      <div className="kpi-container">
        <div className="kpi-card"><div className="kpi-label">💰 BASE DE CAJA</div><div className="kpi-value">${stats.baseCaja.toLocaleString()}</div></div>
        <div className="kpi-card"><div className="kpi-label">💵 EFECTIVO RECAUDADO</div><div className="kpi-value">${stats.efectivo.toLocaleString()}</div></div>
        <div className="kpi-card"><div className="kpi-label">📱 NEQUI RECAUDADO</div><div className="kpi-value">${stats.nequi.toLocaleString()}</div></div>
        <div className="kpi-card"><div className="kpi-label">🚚 TOTAL DOMICILIOS</div><div className="kpi-value">${stats.totalDomicilios.toLocaleString()}</div></div>
      </div>

      <div className="section-card" style={{ background: 'linear-gradient(135deg, #2b8a3e, #40c057)', color: 'white', textAlign: 'center' }}>
        <h2 style={{ color: 'white' }}>🏆 VENTAS DEL DÍA</h2>
        <div style={{ fontSize: '4rem', fontWeight: '800' }}>${ventasDelDiaFinal.toLocaleString()}</div>
        <p>{stats.count} ventas realizadas</p>
        <p style={{ fontSize: '0.8rem', marginTop: '8px', opacity: 0.9 }}>Base + Efectivo + Nequi</p>
      </div>

      <div className="section-card">
        <div className="flex justify-between items-center mb-4">
          <h2>📋 Ventas del Día</h2>
          <div className="flex gap-2">
            <span className="text-sm text-gray-600">{ventasPorDia.length} ventas</span>
            <button onClick={exportarCSV} className="btn btn-blue btn-sm" disabled={ventasPorDia.length === 0}>📥 Exportar CSV</button>
          </div>
        </div>
        {ventasPorDia.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No hay ventas registradas para esta fecha</p>
        ) : (
          <div className="ventas-cuadro-container">
            <div className="ventas-cuadro-header">
              <div className="ventas-cuadro-col-cliente">Cliente</div>
              <div className="ventas-cuadro-col-tipo">Tipo</div>
              <div className="ventas-cuadro-col-metodo">Método</div>
              <div className="ventas-cuadro-col-total">Total</div>
              <div className="ventas-cuadro-col-detalle">Detalle Pago</div>
              <div className="ventas-cuadro-col-productos">Productos</div>
              <div className="ventas-cuadro-col-acciones">Acciones</div>
            </div>
            <div className="ventas-cuadro-scroll">
              {ventasPorDia.map((venta, index) => (
                <div key={index} className="venta-cuadro-item">
                  <div className="ventas-cuadro-col-cliente">
                    <span className="venta-cuadro-cliente">{venta.mesa || "Sin nombre"}</span>
                    {venta.domicilio > 0 && <span className="venta-cuadro-domicilio">🚚</span>}
                  </div>
                  <div className="ventas-cuadro-col-tipo">
                    {venta.tipo === "fiado" ? <span className="badge badge-purple">Fiado</span> : <span className="badge badge-green">Normal</span>}
                  </div>
                  <div className="ventas-cuadro-col-metodo">
                    {venta.metodo === "efectivo" ? "💰" : venta.metodo === "nequi" ? "📱" : venta.metodo === "mixto" ? "🔄" : "💳"}
                  </div>
                  <div className="ventas-cuadro-col-total">
                    <span className="venta-cuadro-total">${(parseInt(venta.total) + parseInt(venta.domicilio || 0)).toLocaleString()}</span>
                  </div>
                  <div className="ventas-cuadro-col-detalle">
                    {venta.metodo === "mixto" ? (
                      <div className="text-xs">
                        <div>💵 ${venta.efectivo?.toLocaleString() || "0"}</div>
                        <div>📱 ${venta.nequi?.toLocaleString() || "0"}</div>
                      </div>
                    ) : venta.metodo === "efectivo" ? (
                      <div className="text-xs text-green-600">💵 ${(parseInt(venta.total) + parseInt(venta.domicilio || 0)).toLocaleString()}</div>
                    ) : venta.metodo === "nequi" ? (
                      <div className="text-xs text-purple-600">📱 ${(parseInt(venta.total) + parseInt(venta.domicilio || 0)).toLocaleString()}</div>
                    ) : "-"}
                  </div>
                  <div className="ventas-cuadro-col-productos">
                    <div className="venta-cuadro-productos-lista">
                      {venta.items?.map((item, itemIndex) => (
                        <div key={itemIndex} className="producto-cuadro-item">
                          <span className="producto-cuadro-nombre">{item.nombre}</span>
                          <span className="producto-cuadro-cantidad">x{item.cantidad || 1}</span>
                          <span className="producto-cuadro-precio">${((item.precio || 0) * (item.cantidad || 1)).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="ventas-cuadro-col-acciones">
                    <button onClick={() => eliminarVenta(index)} className="producto-eliminar-btn" title="Eliminar esta venta">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="section-card">
        <h2>📘 Registrar Fiado</h2>
        <div className="mb-4"><label className="font-semibold">Tipo:</label><div className="flex gap-3"><button onClick={() => setTipoFiado("fisico")} className={`btn-tipo ${tipoFiado === "fisico" ? 'btn-tipo-active' : ''}`}>🏠 Físico</button><button onClick={() => setTipoFiado("domicilio")} className={`btn-tipo ${tipoFiado === "domicilio" ? 'btn-tipo-active' : ''}`}>🚚 Domicilio</button></div></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4"><input type="text" placeholder="Nombre" className="input-field" value={nuevoFiado.nombre} onChange={e => setNuevoFiado({ ...nuevoFiado, nombre: e.target.value })} /><input type="text" placeholder="Celular" className="input-field" value={nuevoFiado.celular} onChange={e => setNuevoFiado({ ...nuevoFiado, celular: e.target.value })} /></div>
        <div className="mb-4"><button onClick={() => setShowMenuFiado(true)} className="btn btn-orange w-full">🛒 Escoger Productos ({productosFiado.length})</button></div>
        <div className="mb-4 p-3 bg-blue-50 rounded"><div className="flex justify-between"><span>Subtotal:</span><span>${calcularSubtotal().toLocaleString()}</span></div>{tipoFiado === "domicilio" && <div className="flex justify-between"><span>Domicilio:</span><span>+${precioDomicilio.toLocaleString()}</span></div>}<div className="flex justify-between pt-2 border-t"><span className="font-bold">TOTAL A FIAR:</span><span className="text-xl font-bold text-green-700">${calcularTotalFiado().toLocaleString()}</span></div></div>
        <input type="date" className="input-field mb-4" value={nuevoFiado.fechaFiado} onChange={e => setNuevoFiado({ ...nuevoFiado, fechaFiado: e.target.value })} />
        <button onClick={guardarFiado} className="btn btn-indigo w-full" disabled={productosFiado.length === 0 || !nuevoFiado.nombre}>💾 Guardar Fiado</button>
      </div>

      <div className="section-card">
        <h2>📗 Fiados Pendientes</h2>
        <div className="fiados-header"><span>Pendientes: {fiados.filter(f => f.estado === "pendiente").length}</span><span>Total: ${fiados.filter(f => f.estado === "pendiente").reduce((s, f) => s + f.valor, 0).toLocaleString()}</span></div>
        {fiados.filter(f => f.estado === "pendiente").length === 0 ? <p className="text-center text-gray-500 py-4">🎉 No hay fiados pendientes</p> : (
          <div className="fiados-lista">{fiados.filter(f => f.estado === "pendiente").map(f => (<div key={f.id} className="fiado-item"><div className="fiado-info"><p className="fiado-nombre">{f.nombre}</p><p className="fiado-detalles">{f.tipo === "domicilio" ? "🚚 Domicilio" : "🏠 Físico"} • ${f.valor.toLocaleString()}</p><button onClick={() => verDetalle(f)} className="btn btn-blue btn-sm">📋 Ver ({f.items?.length || 0})</button></div><div className="flex flex-col gap-2"><button onClick={() => { setFiadoParaAgregar(f); setProductosNuevos([]); setCategoriaSeleccionada(null); setShowAgregarAfiado(true); }} className="btn btn-orange btn-sm">➕ Agregar</button><button onClick={() => marcarPagado(f)} className="btn btn-success btn-sm">✅ Pagar</button></div></div>))}</div>
        )}
      </div>

      {showMenuFiado && (
        <div className="modal-overlay">
          <div className="modal-content-large">
            <div className="modal-header"><h3>🛒 Seleccionar productos</h3><button onClick={() => { setShowMenuFiado(false); setCategoriaSeleccionada(null); }} className="modal-close">×</button></div>
            <div className="modal-body">
              {!categoriaSeleccionada ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">{categorias.map(cat => (<button key={cat} onClick={() => setCategoriaSeleccionada(cat)} className="p-4 bg-gray-50 rounded-lg border text-center"><div className="text-2xl">{getIconoPorCategoria(cat)}</div><div className="text-sm">{cat}</div></button>))}</div>
              ) : (
                <div><button onClick={() => setCategoriaSeleccionada(null)} className="text-blue-600 mb-4">← Volver</button><div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">{filtrados.map(prod => { const enF = productosFiado.find(p => getId(p) === getId(prod)); const cant = enF ? enF.cantidad || 1 : 0; return (<button key={getId(prod)} onClick={() => agregarProductoFiado(prod)} style={{ padding: '12px', borderRadius: '8px', border: cant > 0 ? '2px solid #22c55e' : '1px solid #e5e7eb', backgroundColor: cant > 0 ? '#dcfce7' : 'white', textAlign: 'left' }}><div style={{ fontWeight: '500' }}>{getName(prod)}</div><div style={{ color: '#16a34a' }}>${getPrice(prod).toLocaleString()}</div>{cant > 0 && <div style={{ fontSize: '11px', backgroundColor: '#22c55e', color: 'white', padding: '2px 8px', borderRadius: '20px', display: 'inline-block', marginTop: '8px' }}>✕ {cant}</div>}</button>); })}</div></div>
              )}
            </div>
            <div className="modal-footer p-4 border-t">
              {productosFiado.length > 0 && (<div className="mb-4"><h4>Seleccionados ({productosFiado.length}):</h4>{productosFiado.map((p, i) => (<div key={i} className="flex justify-between p-2 bg-gray-50 rounded mb-1"><span>{getName(p)}</span><div><button onClick={() => disminuirFiado(i)} className="w-6 h-6 bg-red-200 rounded-full">−</button><span className="mx-2">{p.cantidad || 1}</span><button onClick={() => { const u = [...productosFiado]; u[i] = { ...u[i], cantidad: (u[i].cantidad || 1) + 1 }; setProductosFiado(u); }} className="w-6 h-6 bg-green-200 rounded-full">＋</button><button onClick={() => eliminarFiado(i)} className="ml-2 w-6 h-6 bg-red-200 rounded-full">✕</button><span className="ml-2 text-green-600">${(getPrice(p) * (p.cantidad || 1)).toLocaleString()}</span></div></div>))}</div>)}
              <div className="flex justify-between"><div>Total: <span className="text-xl font-bold text-green-600">${calcularSubtotal().toLocaleString()}</span></div><div className="flex gap-2"><button onClick={() => { setProductosFiado([]); setCategoriaSeleccionada(null); }} className="px-4 py-2 bg-gray-200 rounded-lg">Limpiar</button><button onClick={() => setShowMenuFiado(false)} className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold">Listo ✓</button></div></div>
            </div>
          </div>
        </div>
      )}

      {showAgregarAfiado && fiadoParaAgregar && (
        <div className="modal-overlay">
          <div className="modal-content-large">
            <div className="modal-header"><h3>➕ Agregar a fiado de {fiadoParaAgregar.nombre}</h3><button onClick={() => { setShowAgregarAfiado(false); setFiadoParaAgregar(null); setProductosNuevos([]); setCategoriaSeleccionada(null); }} className="modal-close">×</button></div>
            <div className="modal-body">
              {!categoriaSeleccionada ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">{categorias.map(cat => (<button key={cat} onClick={() => setCategoriaSeleccionada(cat)} className="p-4 bg-gray-50 rounded-lg border text-center"><div className="text-2xl">{getIconoPorCategoria(cat)}</div><div className="text-sm">{cat}</div></button>))}</div>
              ) : (
                <div><button onClick={() => setCategoriaSeleccionada(null)} className="text-blue-600 mb-4">← Volver</button><div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">{filtrados.map(prod => { const enN = productosNuevos.find(p => getId(p) === getId(prod)); const cant = enN ? enN.cantidad || 1 : 0; return (<button key={getId(prod)} onClick={() => agregarProductoNuevo(prod)} style={{ padding: '12px', borderRadius: '8px', border: cant > 0 ? '2px solid #22c55e' : '1px solid #e5e7eb', backgroundColor: cant > 0 ? '#dcfce7' : 'white', textAlign: 'left' }}><div style={{ fontWeight: '500' }}>{getName(prod)}</div><div style={{ color: '#16a34a' }}>${getPrice(prod).toLocaleString()}</div>{cant > 0 && <div style={{ fontSize: '11px', backgroundColor: '#22c55e', color: 'white', padding: '2px 8px', borderRadius: '20px', display: 'inline-block', marginTop: '8px' }}>✕ {cant}</div>}</button>); })}</div></div>
              )}
            </div>
            <div className="modal-footer p-4 border-t">
              {productosNuevos.length > 0 && (<div className="mb-4"><h4>Nuevos productos:</h4>{productosNuevos.map((p, i) => (<div key={i} className="flex justify-between p-2 bg-gray-50 rounded mb-1"><span>{getName(p)}</span><div><button onClick={() => disminuirNuevo(i)} className="w-6 h-6 bg-red-200 rounded-full">−</button><span className="mx-2">{p.cantidad || 1}</span><button onClick={() => { const u = [...productosNuevos]; u[i] = { ...u[i], cantidad: (u[i].cantidad || 1) + 1 }; setProductosNuevos(u); }} className="w-6 h-6 bg-green-200 rounded-full">＋</button><button onClick={() => eliminarNuevo(i)} className="ml-2 w-6 h-6 bg-red-200 rounded-full">✕</button><span className="ml-2 text-green-600">${(getPrice(p) * (p.cantidad || 1)).toLocaleString()}</span></div></div>))}</div>)}
              <div className="flex justify-between"><div>Total nuevo: <span className="text-xl font-bold text-green-600">${productosNuevos.reduce((s, p) => s + (getPrice(p) * (p.cantidad || 1)), 0).toLocaleString()}</span></div><div className="flex gap-2"><button onClick={() => { setProductosNuevos([]); setCategoriaSeleccionada(null); }} className="px-4 py-2 bg-gray-200 rounded-lg">Limpiar</button><button onClick={agregarAFiadoExistente} disabled={productosNuevos.length === 0} className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold">✅ Agregar</button></div></div>
            </div>
          </div>
        </div>
      )}

      {showDetalleFiado && fiadoSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h3>📋 Detalle del fiado</h3><button onClick={() => setShowDetalleFiado(false)} className="modal-close">×</button></div>
            <div className="modal-body"><p className="font-bold text-lg">{fiadoSeleccionado.nombre}</p><p>{fiadoSeleccionado.tipo === "domicilio" ? "🚚 Domicilio" : "🏠 Físico"} • Fecha: {fiadoSeleccionado.fechaFiado}</p><div className="border rounded p-3 mt-3"><h4>Productos:</h4>{fiadoSeleccionado.items?.map((item, i) => (<div key={i} className="flex justify-between py-1"><span>{item.nombre} x{item.cantidad || 1}</span><span>${((item.precio || 0) * (item.cantidad || 1)).toLocaleString()}</span></div>))}{fiadoSeleccionado.domicilio > 0 && <div className="flex justify-between py-1"><span>🚚 Domicilio</span><span>+${fiadoSeleccionado.domicilio.toLocaleString()}</span></div>}<div className="flex justify-between pt-2 font-bold border-t"><span>TOTAL:</span><span className="text-green-600">${fiadoSeleccionado.valor.toLocaleString()}</span></div></div><div className="flex justify-end mt-4"><button onClick={() => setShowDetalleFiado(false)} className="btn btn-gray">Cerrar</button></div></div>
          </div>
        </div>
      )}

      {showModalPagarFiado && fiadoAPagar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h3>💳 Marcar Fiado como Pagado</h3><button onClick={() => { setShowModalPagarFiado(false); setFiadoAPagar(null); }} className="modal-close">×</button></div>
            <div className="modal-body"><p className="font-bold">Cliente: {fiadoAPagar.nombre}</p><p>Total: <span className="font-bold text-green-600">${fiadoAPagar.valor.toLocaleString()}</span></p><div className="mb-4"><label className="font-semibold">📅 Fecha de pago:</label><input type="date" className="w-full border rounded p-2 mt-1" value={fechaPagoFiado} onChange={e => setFechaPagoFiado(e.target.value)} /></div><div className="mb-4"><label className="font-semibold">💳 Método:</label><div className="flex gap-3 mt-2"><button onClick={() => setMetodoPagoFiado("efectivo")} className={`btn-tipo ${metodoPagoFiado === "efectivo" ? 'btn-tipo-active' : ''}`}>💵 Efectivo</button><button onClick={() => setMetodoPagoFiado("nequi")} className={`btn-tipo ${metodoPagoFiado === "nequi" ? 'btn-tipo-active' : ''}`}>📱 Nequi</button><button onClick={() => { setMetodoPagoFiado("mixto"); calcularMitad(); }} className={`btn-tipo ${metodoPagoFiado === "mixto" ? 'btn-tipo-active' : ''}`}>🔄 Mixto</button></div></div><div className="flex justify-end gap-2 mt-4"><button onClick={() => { setShowModalPagarFiado(false); setFiadoAPagar(null); }} className="btn btn-gray">Cancelar</button><button onClick={procesarPago} className="btn btn-green">✅ Confirmar</button></div></div>
          </div>
        </div>
      )}

      {/* MODAL PARA SELECCIONAR MÉTODO DE PAGO AL DIVIDIR CUENTA */}
      {showModalMetodoPagoPersona && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>💳 Método de pago - Persona {personaPendiente}</h3>
              <button onClick={() => setShowModalMetodoPagoPersona(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <p className="font-bold mb-4">Total a pagar: <span className="text-green-600">${calcularSubtotalPersona(personaPendiente).toLocaleString()}</span></p>
              
              <div className="mb-4">
                <label className="font-semibold">💳 Método de pago:</label>
                <div className="flex gap-3 mt-2">
                  <button onClick={() => setMetodoPagoPersona("efectivo")} className={`btn-tipo ${metodoPagoPersona === "efectivo" ? 'btn-tipo-active' : ''}`}>💵 Efectivo</button>
                  <button onClick={() => setMetodoPagoPersona("nequi")} className={`btn-tipo ${metodoPagoPersona === "nequi" ? 'btn-tipo-active' : ''}`}>📱 Nequi</button>
                  <button onClick={() => setMetodoPagoPersona("mixto")} className={`btn-tipo ${metodoPagoPersona === "mixto" ? 'btn-tipo-active' : ''}`}>🔄 Mixto</button>
                </div>
              </div>
              
              {metodoPagoPersona === "mixto" && (
                <div className="p-3 bg-blue-50 rounded">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">💵 Efectivo:</label>
                      <input type="number" className="w-full border rounded p-2" value={efectivoPersona} onChange={(e) => { const val = parseInt(e.target.value) || 0; setEfectivoPersona(val); setNequiPersona(calcularSubtotalPersona(personaPendiente) - val); }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">📱 Nequi:</label>
                      <input type="number" className="w-full border rounded p-2" value={nequiPersona} onChange={(e) => { const val = parseInt(e.target.value) || 0; setNequiPersona(val); setEfectivoPersona(calcularSubtotalPersona(personaPendiente) - val); }} />
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    {efectivoPersona + nequiPersona !== calcularSubtotalPersona(personaPendiente) && (
                      <span className="text-red-600">⚠️ Total: ${(efectivoPersona + nequiPersona).toLocaleString()} / ${calcularSubtotalPersona(personaPendiente).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer flex gap-2">
              <button onClick={() => setShowModalMetodoPagoPersona(false)} className="btn btn-gray">Cancelar</button>
              <button onClick={procesarPagoPersona} className="btn btn-green" disabled={metodoPagoPersona === "mixto" && (efectivoPersona + nequiPersona !== calcularSubtotalPersona(personaPendiente))}>✅ Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GersonReportes;