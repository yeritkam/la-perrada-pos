// src/App.jsx - VERSIÓN SIN COCINA
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './index.css';

// Importar páginas
import POS from './pages/POS.jsx';
import Reportes from './pages/Reportes.jsx';
import Products from './pages/Products.jsx';
import AdminReportes from './pages/reportes/AdminReportes.jsx';
import GersonReportes from './pages/reportes/GersonReportes.jsx';
import LoginReportes from './pages/reportes/LoginReportes.jsx';

function App() {
  const isAuthenticated = true;

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<POS />} />
          <Route path="/pos" element={<POS />} />
          
          {/* RUTAS DE COCINA ELIMINADAS */}
          
          <Route path="/productos" element={<Products />} />
          <Route path="/reportes" element={<Reportes />} />
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