// App.jsx SIN Router
import { Routes, Route } from "react-router-dom";  // ⬅️ QUITAR BrowserRouter import
import POS from "./pages/POS.jsx";
import Kitchen from "./pages/Kitchen.jsx";
import Reportes from "./pages/Reportes.jsx";
import AdminReportes from "./pages/reportes/AdminReportes.jsx";
import GersonReportes from "./pages/reportes/GersonReportes.jsx";
import LoginReportes from "./pages/reportes/LoginReportes.jsx";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
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
        </div>
      </footer>
    </div>
  );
}

export default App;