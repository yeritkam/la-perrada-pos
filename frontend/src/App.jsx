// src/App.jsx - VERSIÓN COMPLETA CORREGIDA PARA LOGO Y RUTAS
import { BrowserRouter, Routes, Route } from "react-router-dom";
import POS from "./pages/POS.jsx";
import Kitchen from "./pages/Kitchen.jsx";
import Reportes from "./pages/Reportes.jsx";
import AdminReportes from "./pages/reportes/AdminReportes.jsx";
import GersonReportes from "./pages/reportes/GersonReportes.jsx";
import LoginReportes from "./pages/reportes/LoginReportes.jsx";

function App() {
  // Función para obtener ruta del logo (funciona en local y GitHub Pages)
  const getLogoPath = () => {
    // Si estamos en GitHub Pages
    if (window.location.hostname.includes('github.io')) {
      return '/la-perrada-pos/logo.png';
    }
    // Si estamos en desarrollo local
    return '/logo.png';
  };

  return (
    <BrowserRouter basename="/la-perrada-pos">
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {/* HEADER CON LOGO - VERSIÓN QUE FUNCIONA EN TODO */}
        <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* LOGO - VERSIÓN CORREGIDA QUE FUNCIONA SIEMPRE */}
              <div className="flex items-center gap-2">
                <div className="bg-white p-2 rounded-lg flex items-center justify-center h-12 w-12">
                  <img 
                    src={getLogoPath()}
                    alt="Logo La Perrada de Piter"
                    className="h-8 w-8 object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      // Si el logo no carga, mostrar emoji
                      e.target.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'h-8 w-8 flex items-center justify-center';
                      fallback.innerHTML = '<span class="text-2xl">🌭</span>';
                      
                      if (e.target.parentNode) {
                        e.target.parentNode.appendChild(fallback);
                      }
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold">La Perrada de Piter</h1>
                  <p className="text-xs text-blue-200">Sistema POS • Gestión de Ventas</p>
                </div>
              </div>
            </div>
            
            <div className="text-sm bg-blue-800 bg-opacity-50 px-3 py-1 rounded-full">
              🕒 {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* RUTAS - TODAS CORREGIDAS PARA GITHUB PAGES */}
          <Routes>
            <Route path="/" element={<POS />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/kitchen" element={<Kitchen />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/reportes-admin" element={<AdminReportes />} />
            <Route path="/reportes-gerson" element={<GersonReportes />} />
            <Route path="/login-reportes" element={<LoginReportes />} />
          </Routes>
        </main>

        {/* FOOTER */}
        <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 px-4 mt-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="text-gray-400 text-sm">
              🌭 Sistema POS • La Perrada de Piter • © {new Date().getFullYear()}
            </div>
            <div className="flex gap-4">
              <a href="/la-perrada-pos/" className="text-gray-300 hover:text-white text-sm">
                🏪 POS Principal
              </a>
              <a href="/la-perrada-pos/kitchen" className="text-gray-300 hover:text-white text-sm">
                👨‍🍳 Cocina
              </a>
              <a href="/la-perrada-pos/reportes" className="text-gray-300 hover:text-white text-sm">
                📊 Reportes
              </a>
            </div>
            <div className="text-gray-500 text-xs">
              {window.location.hostname.includes('github.io') 
                ? '🌐 Hosting: GitHub Pages' 
                : '💻 Modo: Desarrollo Local'}
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;