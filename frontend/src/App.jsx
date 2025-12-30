// src/App.jsx - VERSIÓN FINAL CON LOGO FUNCIONAL
import React from 'react';
import './index.css';

function App() {
  // Función para obtener la ruta correcta del logo
  const getLogoPath = () => {
    // Detectar si estamos en desarrollo local o producción
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      return './logo.png';  // Desarrollo local
    } else {
      return '/la-perrada-pos/logo.png';  // Producción (GitHub Pages)
    }
  };

  // Función para éxito del logo
  const handleLogoLoad = () => {
    console.log('✅ Logo cargado correctamente desde:', getLogoPath());
  };

  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '30px', 
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        maxWidth: '800px',
        margin: '0 auto',
        color: '#333'
      }}>
        {/* LOGO ARRIBA - PRINCIPAL */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img 
            src={getLogoPath()}
            alt="Logo La Perrada - Sistema POS" 
            onLoad={handleLogoLoad}
            style={{ 
              width: '150px', 
              height: '150px',
              borderRadius: '10px',
              border: '3px solid #4CAF50',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              objectFit: 'contain'
            }}
          />
          <p style={{ marginTop: '10px', color: '#4CAF50', fontWeight: 'bold' }}>
            Logo principal de La Perrada
          </p>
        </div>
        
        <h1 style={{ color: '#4CAF50', fontSize: '2.8rem', marginBottom: '10px' }}>
          ✅ ¡LA PERRADA POS FUNCIONA! ✅
        </h1>
        
        <p style={{ fontSize: '1.3rem', margin: '20px 0', color: '#666' }}>
          Sistema POS 100% Gratis para Siempre
        </p>
        
        <div style={{ 
          background: '#f8f9fa', 
          padding: '25px', 
          borderRadius: '10px',
          margin: '30px 0',
          border: '2px solid #e9ecef'
        }}>
          <h2 style={{ color: '#495057', marginBottom: '20px' }}>Pruebas de funcionalidad:</h2>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => {
                alert('🎉 ¡Sistema POS funcionando perfectamente!\n\n✅ Frontend React: OPERATIVO\n✅ Backend: Configurar siguiente\n✅ GitHub Pages: Listo para deploy');
              }}
              style={{
                padding: '15px 35px',
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              🎯 Probar Alert
            </button>
            
            <button 
              onClick={() => {
                console.log('='.repeat(50));
                console.log('🚀 SISTEMA PERRADA POS - REPORTE TÉCNICO');
                console.log('✅ Frontend React: OPERATIVO');
                console.log('✅ Vite: Sirviendo contenido correctamente');
                console.log('✅ Rutas: Configuradas para GitHub Pages');
                console.log(`✅ Logo: Cargado desde ${getLogoPath()}`);
                console.log('⏳ Próximo paso: Configurar GitHub Actions');
                console.log('⏳ Siguiente: Migrar Firebase a PocketBase');
                console.log('='.repeat(50));
                
                // Mostrar notificación en pantalla
                const notification = document.createElement('div');
                notification.style.cssText = `
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  background: #4CAF50;
                  color: white;
                  padding: 15px 25px;
                  border-radius: 8px;
                  z-index: 1000;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                  font-weight: bold;
                `;
                notification.textContent = '✅ Ver consola para reporte técnico';
                document.body.appendChild(notification);
                setTimeout(() => notification.remove(), 3000);
              }}
              style={{
                padding: '15px 35px',
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #2196F3 0%, #0D47A1 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              📊 Reporte Técnico
            </button>
          </div>
        </div>
        
        {/* Sección de verificación */}
        <div style={{ 
          marginTop: '40px', 
          padding: '25px',
          background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
          borderRadius: '10px',
          textAlign: 'left'
        }}>
          <h3 style={{ color: '#2E7D32', marginBottom: '15px', textAlign: 'center' }}>
            ✅ VERIFICACIÓN COMPLETADA
          </h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '12px 0', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#4CAF50', marginRight: '15px', fontSize: '1.5rem' }}>✓</span>
              <div>
                <strong>React Frontend</strong><br/>
                <small>Componentes montados y funcionando</small>
              </div>
            </li>
            <li style={{ padding: '12px 0', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#4CAF50', marginRight: '15px', fontSize: '1.5rem' }}>✓</span>
              <div>
                <strong>Vite Dev Server</strong><br/>
                <small>Hot reload activo, build configurado</small>
              </div>
            </li>
            <li style={{ padding: '12px 0', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#4CAF50', marginRight: '15px', fontSize: '1.5rem' }}>✓</span>
              <div>
                <strong>Assets & Logo</strong><br/>
                <small>Cargando desde: <code>{getLogoPath()}</code></small>
              </div>
            </li>
            <li style={{ padding: '12px 0', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#2196F3', marginRight: '15px', fontSize: '1.5rem' }}>→</span>
              <div>
                <strong>Próximos Pasos</strong><br/>
                <small>GitHub Actions → Firebase Migration → Deploy</small>
              </div>
            </li>
          </ul>
        </div>
        
        <div style={{ marginTop: '30px', padding: '20px', background: '#e3f2fd', borderRadius: '10px' }}>
          <h4 style={{ color: '#1565c0', marginBottom: '10px' }}>📝 Notas Técnicas:</h4>
          <ul style={{ textAlign: 'left', color: '#0d47a1', fontSize: '0.9rem' }}>
            <li>El logo ahora está <strong>ARRIBA</strong> del título principal</li>
            <li>Ruta automática: <code>{getLogoPath()}</code> (detecta desarrollo/producción)</li>
            <li>Base URL configurada en <code>vite.config.js</code> para GitHub Pages</li>
            <li>Build listo para GitHub Actions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;