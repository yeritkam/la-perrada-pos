// src/App.jsx - VERSIÓN COMPLETA CORREGIDA
import { Routes, Route } from "react-router-dom";
import POS from "./pages/POS.jsx";
import Kitchen from "./pages/Kitchen.jsx";
import Reportes from "./pages/Reportes.jsx";
import AdminReportes from "./pages/reportes/AdminReportes.jsx";
import GersonReportes from "./pages/reportes/GersonReportes.jsx";
import LoginReportes from "./pages/reportes/LoginReportes.jsx";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* HEADER CON LOGO */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* LOGO - USANDO RUTA DESDE PUBLIC */}
            <div className="flex items-center gap-2">
              <div className="bg-white p-2 rounded-lg">
                <img 
                  src="/logo.png"  // ✅ Ruta absoluta desde public/
                  alt="Logo La Perrada de Piter"
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    console.log("Error cargando logo, usando emoji");
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    // Crear elemento de fallback
                    const parent = e.target.parentElement;
                    const fallback = document.createElement('div');
                    fallback.className = 'text-2xl';
                    fallback.textContent = '🌭';
                    parent.appendChild(fallback);
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

      {/* RUTAS PRINCIPALES */}
      <Routes>
        <Route path="/" element={<POS />} />
        <Route path="/pos" element={<POS />} />
        <Route path="/kitchen" element={<Kitchen />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/admin-reportes" element={<AdminReportes />} />
        <Route path="/gerson-reportes" element={<GersonReportes />} />
        <Route path="/login-reportes" element={<LoginReportes />} />
      </Routes>

      {/* FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-800 to-gray-900 text-white py-2 px-4 text-center text-xs">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="text-gray-400">Sistema POS • La Perrada de Piter</div>
          <div className="text-gray-500">
            {window.location.hostname.includes('github.io') ? '🌐 En línea' : '💻 Local'}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;