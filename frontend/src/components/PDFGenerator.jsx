// ============================================================
// src/components/PDFGenerator.jsx - VERSIÓN COMPLETA CORREGIDA
// ============================================================

import { jsPDF } from 'jspdf';

const PDFGenerator = {
  // ============================================================
  // 1. FACTURA PARA VENTA NORMAL (MESA/DOMICILIO)
  // ============================================================
  generarFacturaVenta: (venta) => {
    console.log("Generando factura de VENTA para:", venta.nombre);
    
    const doc = new jsPDF('p', 'mm', 'letter');
    
    doc.setProperties({
      title: `Factura - ${venta.nombre}`,
      subject: 'Comprobante de venta',
      author: 'La Perrada de Piter'
    });
    
    // ========== ENCABEZADO ==========
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 0, 216, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text("LA PERRADA DE PITER", 108, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text("COMPROBANTE DE VENTA", 108, 32, { align: 'center' });
    
    // ========== INFORMACIÓN ==========
    let yPos = 50;
    
    doc.setDrawColor(245, 158, 11);
    doc.rect(15, yPos, 186, 25);
    
    doc.setTextColor(245, 158, 11);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("INFORMACIÓN DE LA VENTA", 108, yPos + 8, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const ahora = new Date();
    const fechaColombia = ahora.toLocaleDateString('es-CO', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    const horaColombia = ahora.toLocaleTimeString('es-CO', {
      timeZone: 'America/Bogota',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    doc.text(`Cliente: ${venta.nombre}`, 108, yPos + 15, { align: 'center' });
    
    doc.text(`Fecha: ${fechaColombia}`, 75, yPos + 22);
    doc.text(`Hora: ${horaColombia}`, 140, yPos + 22);
    
    yPos += 35;
    
    // ========== PRODUCTOS ==========
    doc.setTextColor(245, 158, 11);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("PRODUCTOS", 108, yPos, { align: 'center' });
    
    yPos += 8;
    
    doc.setFillColor(245, 158, 11);
    doc.rect(15, yPos, 186, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    doc.text("PRODUCTO", 25, yPos + 7);
    doc.text("CANT.", 120, yPos + 7);
    doc.text("PRECIO", 140, yPos + 7);
    doc.text("TOTAL", 175, yPos + 7);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPos + 10, 201, yPos + 10);
    
    yPos += 12;
    
    let subtotalProductos = 0;
    
    venta.items?.forEach((item, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(250, 250, 250);
      }
      doc.rect(15, yPos - 4, 186, 10, 'F');
      
      const nombreCorto = item.nombre.length > 30 ? item.nombre.substring(0, 30) + "..." : item.nombre;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(nombreCorto, 25, yPos + 2);
      
      doc.text(item.cantidad.toString(), 120, yPos + 2);
      doc.text(`$${item.precio.toLocaleString()}`, 140, yPos + 2);
      
      const totalItem = item.precio * item.cantidad;
      doc.text(`$${totalItem.toLocaleString()}`, 175, yPos + 2);
      
      subtotalProductos += totalItem;
      yPos += 10;
    });
    
    const domicilio = venta.domicilio || 0;
    if (domicilio > 0) {
      doc.setFillColor(220, 252, 231);
      doc.rect(15, yPos - 4, 186, 10, 'F');
      
      doc.setTextColor(0, 100, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text("DOMICILIO", 25, yPos + 2);
      doc.text("1", 120, yPos + 2);
      doc.text(`$${domicilio.toLocaleString()}`, 140, yPos + 2);
      doc.text(`$${domicilio.toLocaleString()}`, 175, yPos + 2);
      
      yPos += 10;
    }
    
    // ========== TOTALES ==========
    yPos += 10;
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text("Subtotal:", 130, yPos);
    doc.text(`$${subtotalProductos.toLocaleString()}`, 175, yPos);
    
    yPos += 7;
    
    if (domicilio > 0) {
      doc.text("Domicilio:", 130, yPos);
      doc.text(`$${domicilio.toLocaleString()}`, 175, yPos);
      yPos += 7;
    }
    
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.5);
    doc.line(120, yPos, 195, yPos);
    yPos += 1;
    doc.line(120, yPos, 195, yPos);
    yPos += 8;
    
    doc.setTextColor(34, 197, 94);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("TOTAL:", 115, yPos);
    
    const totalGeneral = subtotalProductos + domicilio;
    doc.text(`$${totalGeneral.toLocaleString()}`, 175, yPos);
    
    // ========== PIE DE PÁGINA ==========
    yPos += 20;
    
    doc.setDrawColor(245, 158, 11);
    doc.line(15, yPos, 201, yPos);
    
    yPos += 10;
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text("¡Gracias por su compra!", 108, yPos, { align: 'center' });
    
    yPos += 8;
    
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text("Cra. 16 #12-11 Barrio Once de Noviembre, Ciénaga de Oro", 108, yPos, { align: 'center' });
    yPos += 4;
    doc.text("Tel: 302 207 5484 - Domicilios • Nequi: 304 649 2391 - Gerson Soto", 108, yPos, { align: 'center' });
    
    yPos += 8;
    
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(7);
    doc.text("Documento generado electrónicamente", 108, yPos, { align: 'center' });
    yPos += 4;
    doc.text(`Sistema POS • ${fechaColombia} ${horaColombia}`, 108, yPos, { align: 'center' });
    
    // ========== GUARDAR ==========
    const nombreArchivo = `Factura-${venta.nombre.replace(/\s+/g, '-')}-${fechaColombia.replace(/\//g, '-')}.pdf`;
    doc.save(nombreArchivo);
    
    return true;
  },

  // ============================================================
  // 2. FACTURA PARA FIADO PAGADO
  // ============================================================
  generarFacturaFiado: (fiado) => {
    console.log("Generando factura de FIADO para:", fiado.nombre);
    
    const doc = new jsPDF('p', 'mm', 'letter');
    
    doc.setProperties({
      title: `Factura Fiado - ${fiado.nombre}`,
      subject: 'Pago de fiado',
      author: 'La Perrada de Piter'
    });
    
    // ========== ENCABEZADO ==========
    doc.setFillColor(147, 51, 234);
    doc.rect(0, 0, 216, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text("LA PERRADA DE PITER", 108, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text("COMPROBANTE DE PAGO DE FIADO", 108, 32, { align: 'center' });
    
    // ========== INFORMACIÓN ==========
    let yPos = 50;
    
    doc.setDrawColor(147, 51, 234);
    doc.rect(15, yPos, 186, 35);
    
    doc.setTextColor(147, 51, 234);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("INFORMACIÓN DEL FIADO", 108, yPos + 8, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Cliente: ${fiado.nombre}`, 108, yPos + 18, { align: 'center' });
    
    if (fiado.celular) {
      doc.text(`Teléfono: ${fiado.celular}`, 108, yPos + 25, { align: 'center' });
    }
    
    const fechaFiado = fiado.fechaFiado || "No especificada";
    const fechaPago = fiado.fechaPago || "No especificada";
    
    doc.text(`Fecha fiado: ${fechaFiado}`, 75, yPos + 32);
    doc.text(`Fecha pago: ${fechaPago}`, 140, yPos + 32);
    
    yPos += 45;
    
    // ========== PRODUCTOS ==========
    doc.setTextColor(147, 51, 234);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("PRODUCTOS DEL FIADO", 108, yPos, { align: 'center' });
    
    yPos += 8;
    
    doc.setFillColor(147, 51, 234);
    doc.rect(15, yPos, 186, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    doc.text("PRODUCTO", 25, yPos + 7);
    doc.text("CANT.", 120, yPos + 7);
    doc.text("PRECIO", 140, yPos + 7);
    doc.text("TOTAL", 175, yPos + 7);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPos + 10, 201, yPos + 10);
    
    yPos += 12;
    
    let subtotalProductos = 0;
    
    if (fiado.items && fiado.items.length > 0) {
      fiado.items.forEach((item, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(255, 255, 255);
        } else {
          doc.setFillColor(250, 250, 250);
        }
        doc.rect(15, yPos - 4, 186, 10, 'F');
        
        const nombreCorto = item.nombre.length > 30 ? item.nombre.substring(0, 30) + "..." : item.nombre;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(nombreCorto, 25, yPos + 2);
        
        doc.text(item.cantidad.toString(), 120, yPos + 2);
        doc.text(`$${item.precio.toLocaleString()}`, 140, yPos + 2);
        
        const totalItem = item.precio * item.cantidad;
        doc.text(`$${totalItem.toLocaleString()}`, 175, yPos + 2);
        
        subtotalProductos += totalItem;
        yPos += 10;
      });
    } else {
      doc.setFillColor(255, 255, 255);
      doc.rect(15, yPos - 4, 186, 10, 'F');
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text("PAGO TOTAL DEL FIADO", 25, yPos + 2);
      doc.text("1", 120, yPos + 2);
      doc.text(`$${fiado.valor.toLocaleString()}`, 140, yPos + 2);
      doc.text(`$${fiado.valor.toLocaleString()}`, 175, yPos + 2);
      
      subtotalProductos = fiado.valor;
      yPos += 10;
    }
    
    const domicilio = fiado.domicilio || 0;
    if (domicilio > 0) {
      doc.setFillColor(220, 252, 231);
      doc.rect(15, yPos - 4, 186, 10, 'F');
      
      doc.setTextColor(0, 100, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text("DOMICILIO", 25, yPos + 2);
      doc.text("1", 120, yPos + 2);
      doc.text(`$${domicilio.toLocaleString()}`, 140, yPos + 2);
      doc.text(`$${domicilio.toLocaleString()}`, 175, yPos + 2);
      
      subtotalProductos += domicilio;
      yPos += 10;
    }
    
    // ========== TOTALES ==========
    yPos += 10;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    doc.text("Subtotal:", 130, yPos);
    doc.text(`$${subtotalProductos.toLocaleString()}`, 175, yPos);
    
    yPos += 7;
    
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.5);
    doc.line(120, yPos, 195, yPos);
    yPos += 1;
    doc.line(120, yPos, 195, yPos);
    yPos += 8;
    
    doc.setTextColor(34, 197, 94);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("TOTAL PAGADO:", 100, yPos);
    doc.text(`$${fiado.valor.toLocaleString()}`, 175, yPos);
    
    // ========== PIE DE PÁGINA ==========
    yPos += 20;
    
    doc.setDrawColor(147, 51, 234);
    doc.line(15, yPos, 201, yPos);
    
    yPos += 10;
    
    const ahora = new Date();
    const fechaColombia = ahora.toLocaleDateString('es-CO', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    const horaColombia = ahora.toLocaleTimeString('es-CO', {
      timeZone: 'America/Bogota',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text("¡Gracias por cumplir con su pago!", 108, yPos, { align: 'center' });
    
    yPos += 8;
    
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text("Cra. 16 #12-11 Barrio Once de Noviembre, Ciénaga de Oro", 108, yPos, { align: 'center' });
    yPos += 4;
    doc.text("Tel: 302 207 5484 - Domicilios • Nequi: 304 649 2391 - Gerson Soto", 108, yPos, { align: 'center' });
    
    yPos += 8;
    
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(7);
    doc.text("Documento generado electrónicamente", 108, yPos, { align: 'center' });
    yPos += 4;
    doc.text(`Sistema POS • ${fechaColombia} ${horaColombia}`, 108, yPos, { align: 'center' });
    
    // ========== GUARDAR ==========
    const nombreArchivo = `Factura-Fiado-${fiado.nombre.replace(/\s+/g, '-')}-${fechaColombia.replace(/\//g, '-')}.pdf`;
    doc.save(nombreArchivo);
    
    return true;
  },

  // ============================================================
  // 3. REPORTE DIARIO - VERSIÓN MEJORADA COMPLETA
  // ============================================================
  generarReporteDiario: (ventas = []) => {
    console.log("Generando reporte diario con", ventas.length, "ventas");
    
    // Validación
    if (!Array.isArray(ventas)) {
      console.error("Error: ventas no es un array");
      alert("Error: Los datos de ventas no son válidos");
      return false;
    }
    
    const ventasValidas = ventas.filter(v => 
      v && typeof v === 'object' && (v.total !== undefined || v.mesa !== undefined)
    );
    
    console.log(`Ventas válidas para PDF: ${ventasValidas.length} de ${ventas.length}`);
    
    if (ventasValidas.length === 0) {
      console.warn("No hay ventas válidas para el reporte");
      alert("No hay ventas válidas para generar el reporte");
      return false;
    }
    
    try {
      const doc = new jsPDF('p', 'mm', 'letter');
      
      doc.setProperties({
        title: 'Reporte Diario de Ventas - Gerencia',
        subject: 'Resumen de ventas del día',
        author: 'La Perrada de Piter - Gerencia'
      });
      
      // ========== ENCABEZADO ==========
      doc.setFillColor(42, 67, 101);
      doc.rect(0, 0, 216, 50, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text("LA PERRADA DE PITER", 108, 25, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text("REPORTE DIARIO GERENCIA", 108, 40, { align: 'center' });
      
      // ========== FECHA Y HORA ==========
      let yPos = 60;
      
      const ahora = new Date();
      const fechaColombia = ahora.toLocaleDateString('es-CO', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      
      const horaColombia = ahora.toLocaleTimeString('es-CO', {
        timeZone: 'America/Bogota',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      doc.setTextColor(42, 67, 101);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`FECHA: ${fechaColombia}`, 20, yPos);
      doc.text(`HORA: ${horaColombia}`, 150, yPos);
      
      yPos += 15;
      
      // ========== ESTADÍSTICAS RESUMIDAS ==========
      doc.setFillColor(240, 249, 255);
      doc.roundedRect(15, yPos, 186, 30, 3, 3, 'F');
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text("RESUMEN DEL DÍA", 25, yPos + 10);
      
      // Calcular estadísticas
      const totalVentas = ventasValidas.length;
      const totalGeneral = ventasValidas.reduce((sum, v) => sum + (v.total || 0), 0);
      const totalEfectivo = ventasValidas
        .filter(v => v.metodo === 'efectivo')
        .reduce((sum, v) => sum + (v.total || 0), 0);
      const totalNequi = ventasValidas
        .filter(v => v.metodo === 'nequi')
        .reduce((sum, v) => sum + (v.total || 0), 0);
      const totalMixto = ventasValidas
        .filter(v => v.metodo === 'mixto')
        .reduce((sum, v) => sum + (v.total || 0), 0);
      const totalDomicilios = ventasValidas.reduce((sum, v) => sum + (v.domicilio || 0), 0);
      const cantDomicilios = ventasValidas.filter(v => v.domicilio > 0).length;
      const totalProductos = totalGeneral - totalDomicilios;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Ventas: ${totalVentas}`, 130, yPos + 10);
      doc.text(`Monto Total: $${totalGeneral.toLocaleString()}`, 130, yPos + 17);
      doc.text(`Domicilios: ${cantDomicilios}`, 130, yPos + 24);
      
      yPos += 35;
      
      // ========== DETALLE DE VENTAS ==========
      doc.setTextColor(42, 67, 101);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text("DETALLE DE VENTAS", 20, yPos);
      
      yPos += 10;
      
      // Encabezado de tabla
      doc.setFillColor(42, 67, 101);
      doc.rect(15, yPos, 186, 10, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
      doc.text("HORA", 25, yPos + 7);
      doc.text("CLIENTE", 55, yPos + 7);
      doc.text("TIPO", 105, yPos + 7);
      doc.text("MÉTODO", 140, yPos + 7);
      doc.text("TOTAL", 175, yPos + 7);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(15, yPos + 10, 201, yPos + 10);
      
      yPos += 12;
      
      // Filas de ventas
      ventasValidas.forEach((venta, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
          
          doc.setFillColor(42, 67, 101);
          doc.rect(15, yPos, 186, 10, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text("HORA", 25, yPos + 7);
          doc.text("CLIENTE", 55, yPos + 7);
          doc.text("TIPO", 105, yPos + 7);
          doc.text("MÉTODO", 140, yPos + 7);
          doc.text("TOTAL", 175, yPos + 7);
          yPos += 15;
        }
        
        if (index % 2 === 0) {
          doc.setFillColor(255, 255, 255);
        } else {
          doc.setFillColor(248, 249, 250);
        }
        doc.rect(15, yPos - 4, 186, 10, 'F');
        
        const fecha = new Date(venta.fecha || venta.timestamp || Date.now());
        const hora = fecha.toLocaleTimeString('es-CO', {
          timeZone: 'America/Bogota',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        
        doc.text(hora, 25, yPos + 2);
        
        const cliente = venta.mesa || venta.nombre || "Sin nombre";
        const clienteCorto = cliente.length > 15 ? cliente.substring(0, 15) + "..." : cliente;
        doc.text(clienteCorto, 55, yPos + 2);
        
        const tipo = venta.tipo === 'domicilio' ? 'Domicilio' : 'Local';
        doc.text(tipo, 105, yPos + 2);
        
        const metodoTexto = venta.metodo === 'efectivo' ? 'Efectivo' : 
                           venta.metodo === 'nequi' ? 'Nequi' : 
                           venta.metodo === 'mixto' ? 'Mixto' : 'Otro';
        doc.text(metodoTexto, 140, yPos + 2);
        
        doc.text(`$${(venta.total || 0).toLocaleString()}`, 175, yPos + 2);
        
        yPos += 10;
      });
      
      // ========== RESUMEN FINANCIERO COMPLETO ==========
      yPos += 10;
      
      // Si estamos cerca del final de la página, agregar nueva
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setTextColor(42, 67, 101);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text("RESUMEN FINANCIERO COMPLETO", 20, yPos);
      
      yPos += 10;
      
      // Crear tabla de resumen financiero
      doc.setFillColor(240, 249, 255);
      doc.roundedRect(15, yPos, 186, 85, 3, 3, 'F');
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // Primera columna - Izquierda
      doc.text("VENTAS EN EFECTIVO:", 25, yPos + 10);
      doc.text(`$${totalEfectivo.toLocaleString()}`, 95, yPos + 10, { align: 'right' });
      
      doc.text("VENTAS POR NEQUI:", 25, yPos + 18);
      doc.text(`$${totalNequi.toLocaleString()}`, 95, yPos + 18, { align: 'right' });
      
      doc.text("VENTAS MIXTAS:", 25, yPos + 26);
      doc.text(`$${totalMixto.toLocaleString()}`, 95, yPos + 26, { align: 'right' });
      
      doc.text("TOTAL PRODUCTOS:", 25, yPos + 34);
      doc.text(`$${totalProductos.toLocaleString()}`, 95, yPos + 34, { align: 'right' });
      
      // Segunda columna - Centro
      doc.text("TOTAL DOMICILIOS:", 115, yPos + 10);
      doc.text(`$${totalDomicilios.toLocaleString()}`, 185, yPos + 10, { align: 'right' });
      
      doc.text("CANT. DOMICILIOS:", 115, yPos + 18);
      doc.text(`${cantDomicilios}`, 185, yPos + 18, { align: 'right' });
      
      doc.text("VENTAS EFECTIVO:", 115, yPos + 26);
      doc.text(`${ventasValidas.filter(v => v.metodo === 'efectivo').length}`, 185, yPos + 26, { align: 'right' });
      
      doc.text("VENTAS NEQUI:", 115, yPos + 34);
      doc.text(`${ventasValidas.filter(v => v.metodo === 'nequi').length}`, 185, yPos + 34, { align: 'right' });
      
      // Línea separadora
      yPos += 42;
      doc.setDrawColor(42, 67, 101);
      doc.setLineWidth(0.8);
      doc.line(25, yPos, 195, yPos);
      yPos += 5;
      
      // Tercera sección - Totales importantes
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      
      doc.text("TOTAL VENTAS DEL DÍA:", 25, yPos + 10);
      doc.text(`${totalVentas} ventas`, 185, yPos + 10, { align: 'right' });
      
      doc.text("VALOR TOTAL VENTAS:", 25, yPos + 18);
      doc.text(`$${totalGeneral.toLocaleString()}`, 185, yPos + 18, { align: 'right' });
      
      doc.text("PROMEDIO POR VENTA:", 25, yPos + 26);
      doc.text(`$${Math.round(totalGeneral / (totalVentas || 1)).toLocaleString()}`, 185, yPos + 26, { align: 'right' });
      
      // Resaltar el total general
      yPos += 35;
      doc.setFillColor(42, 67, 101);
      doc.roundedRect(40, yPos, 136, 15, 3, 3, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("TOTAL GENERAL RECAUDADO:", 60, yPos + 10);
      doc.text(`$${totalGeneral.toLocaleString()}`, 170, yPos + 10, { align: 'right' });
      
      // ========== PIE DE PÁGINA ==========
      yPos += 25;
      
      doc.setDrawColor(42, 67, 101);
      doc.line(15, yPos, 201, yPos);
      
      yPos += 10;
      
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.text("Contacto: Cra. 16 #12-11 Barrio Once de Noviembre, Ciénaga de Oro", 108, yPos, { align: 'center' });
      yPos += 5;
      doc.text("Tel: 302 207 5484 - Domicilios • Nequi: 304 649 2391 - Gerson Soto", 108, yPos, { align: 'center' });
      
      yPos += 8;
      
      doc.setFontSize(8);
      doc.text("Documento generado electrónicamente - Exclusivo para Gerencia", 108, yPos, { align: 'center' });
      yPos += 4;
      doc.text(`Sistema POS • ${fechaColombia} ${horaColombia} • Página 1`, 108, yPos, { align: 'center' });
      
      // ========== GUARDAR ==========
      const nombreArchivo = `Reporte-Gerencia-${fechaColombia.replace(/\//g, '-')}-${horaColombia.replace(/:/g, '')}.pdf`;
      doc.save(nombreArchivo);
      
      console.log("PDF generado exitosamente:", nombreArchivo);
      return true;
      
    } catch (error) {
      console.error("Error en generarReporteDiario:", error);
      alert(`Error al generar PDF: ${error.message}`);
      return false;
    }
  },

  // ============================================================
  // 4. REPORTE DE CAJA
  // ============================================================
  generarReporteCaja: (datos) => {
    console.log("Generando reporte de caja");
    
    try {
      const doc = new jsPDF('p', 'mm', 'letter');
      
      doc.setProperties({
        title: 'Reporte de Cierre de Caja',
        subject: 'Resumen financiero del día',
        author: 'La Perrada de Piter'
      });
      
      // Encabezado
      doc.setFillColor(245, 158, 11);
      doc.rect(0, 0, 216, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text("LA PERRADA DE PITER", 108, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text("REPORTE DE CIERRE DE CAJA", 108, 32, { align: 'center' });
      
      // Información
      let yPos = 50;
      
      const ahora = new Date();
      const fechaColombia = ahora.toLocaleDateString('es-CO', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Fecha: ${datos.fecha || fechaColombia}`, 20, yPos);
      
      yPos += 15;
      
      // Resumen financiero
      doc.setFontSize(12);
      doc.text("RESUMEN FINANCIERO", 20, yPos);
      
      yPos += 10;
      
      const resumen = [
        { label: "Ventas totales del día", value: datos.total || 0 },
        { label: "Ventas en efectivo", value: datos.efectivo || 0 },
        { label: "Ventas por Nequi", value: datos.nequi || 0 },
        { label: "Ventas mixtas", value: datos.mixto || 0 },
        { label: "Total domicilios", value: datos.domicilio || 0 },
        { label: "Cantidad de domicilios", value: datos.cantDomicilios || 0 },
        { label: "Cantidad de ventas", value: datos.cantVentas || 0 },
        { label: "Base de caja", value: datos.baseCaja || 0 }
      ];
      
      resumen.forEach(item => {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`${item.label}:`, 30, yPos);
        
        doc.setFont('helvetica', 'bold');
        doc.text(`$${item.value.toLocaleString()}`, 160, yPos, { align: 'right' });
        
        yPos += 8;
      });
      
      // Total final
      yPos += 5;
      doc.setDrawColor(0, 0, 0);
      doc.line(30, yPos, 180, yPos);
      yPos += 10;
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("TOTAL EN CAJA:", 30, yPos);
      doc.text(`$${(datos.total || 0).toLocaleString()}`, 180, yPos, { align: 'right' });
      
      // Pie de página
      yPos += 20;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text("Documento generado automáticamente por el sistema POS", 108, yPos, { align: 'center' });
      
      // Guardar
      const nombreArchivo = `Reporte-Caja-${fechaColombia.replace(/\//g, '-')}.pdf`;
      doc.save(nombreArchivo);
      
      return true;
      
    } catch (error) {
      console.error("Error generando reporte de caja:", error);
      return false;
    }
  },

  // ============================================================
  // 5. LISTA FIADOS PENDIENTES
  // ============================================================
  generarListaFiadosPendientes: (fiados) => {
    console.log("Generando lista de fiados pendientes");
    
    try {
      const doc = new jsPDF('p', 'mm', 'letter');
      
      doc.setProperties({
        title: 'Fiados Pendientes',
        subject: 'Lista de clientes con fiados por pagar',
        author: 'La Perrada de Piter'
      });
      
      // Encabezado
      doc.setFillColor(147, 51, 234);
      doc.rect(0, 0, 216, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text("LA PERRADA DE PITER", 108, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text("FIADOS PENDIENTES", 108, 32, { align: 'center' });
      
      // Fecha
      let yPos = 50;
      const ahora = new Date();
      const fechaColombia = ahora.toLocaleDateString('es-CO', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha: ${fechaColombia}`, 20, yPos);
      
      // Resumen
      const totalPendiente = fiados.reduce((sum, f) => sum + (f.valor || 0), 0);
      doc.text(`Total pendiente: $${totalPendiente.toLocaleString()}`, 160, yPos, { align: 'right' });
      
      yPos += 10;
      
      // Encabezado tabla
      doc.setFillColor(147, 51, 234);
      doc.rect(15, yPos, 186, 10, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
      doc.text("CLIENTE", 25, yPos + 7);
      doc.text("CELULAR", 90, yPos + 7);
      doc.text("FECHA", 140, yPos + 7);
      doc.text("VALOR", 175, yPos + 7);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(15, yPos + 10, 201, yPos + 10);
      
      yPos += 12;
      
      // Lista de fiados
      fiados.forEach((fiado, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(255, 255, 255);
        } else {
          doc.setFillColor(248, 249, 250);
        }
        doc.rect(15, yPos - 4, 186, 10, 'F');
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        
        doc.text(fiado.nombre || "Sin nombre", 25, yPos + 2);
        doc.text(fiado.celular || "Sin celular", 90, yPos + 2);
        doc.text(fiado.fechaFiado || "Sin fecha", 140, yPos + 2);
        doc.text(`$${(fiado.valor || 0).toLocaleString()}`, 175, yPos + 2);
        
        yPos += 10;
      });
      
      // Total al final
      yPos += 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text("TOTAL PENDIENTE:", 130, yPos);
      doc.text(`$${totalPendiente.toLocaleString()}`, 175, yPos);
      
      // Pie de página
      yPos += 15;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text("Documento generado automáticamente - La Perrada de Piter", 108, yPos, { align: 'center' });
      
      // Guardar
      const nombreArchivo = `Fiados-Pendientes-${fechaColombia.replace(/\//g, '-')}.pdf`;
      doc.save(nombreArchivo);
      
      return true;
      
    } catch (error) {
      console.error("Error generando lista de fiados:", error);
      return false;
    }
  },

  // ============================================================
  // FUNCIÓN AUXILIAR
  // ============================================================
  getMetodoTexto: (metodo) => {
    const metodos = {
      'efectivo': 'Efectivo',
      'nequi': 'Nequi',
      'mixto': 'Mixto',
      'fiado': 'Fiado'
    };
    return metodos[metodo] || metodo;
  }
};

export default PDFGenerator;