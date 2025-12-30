// src/App.jsx - VERSIÓN ORIGINAL (con basename dinámico)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './index.css';

// Importar páginas
import POS from './pages/POS.jsx';
import Kitchen from './pages/Kitchen.jsx';
import Reportes from './pages/Reportes.jsx';
import Products from './pages/Products.jsx';
import AdminReportes from './pages/reportes/AdminReportes.jsx';
import GersonReportes from './pages/reportes/GersonReportes.jsx';
import LoginReportes from './pages/reportes/LoginReportes.jsx';

function App() {
  const isAuthenticated = true;
  
  // ✅ DETECTAR SI ESTAMOS EN GITHUB PAGES
  const isGitHubPages = window.location.hostname === 'gasons30.github.io';
  const basename = isGitHubPages ? '/la-perrada-pos' : '';

  return (
    <Router basename={basename}>  {/* ✅ CON basename dinámico */}
      <div className="App">
        <Routes>
          <Route path="/" element={<POS />} />
          <Route path="/pos" element={<POS />} />
          
          {/* RUTAS DE COCINA - AMBAS FUNCIONAN */}
          <Route path="/cocina" element={<Kitchen />} />
          <Route path="/kitchen" element={<Kitchen />} />
          
          <Route path="/productos" element={<Products />} />
          <Route path="/reportes" element={<Reportes />} />
          
          {/* ✅ RUTAS ORIGINALES (con /reportes/) */}
          <Route path="/reportes/admin" element={
            isAuthenticated ? <AdminReportes /> : <Navigate to="/" />
          } />
          <Route path="/reportes/gerson" element={
            isAuthenticated ? <GersonReportes /> : <Navigate to="/" />
          } />
          
          <Route path="/reportes/login" element={<LoginReportes />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;