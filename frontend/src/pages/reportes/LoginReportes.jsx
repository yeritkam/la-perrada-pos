// src/pages/reportes/LoginReportes.jsx - VERSIÓN COMPLETA CORREGIDA
import React, { useState } from 'react';
import './LoginReportes.css';

const LoginReportes = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const usuarios = {
    gerson: {
      nombre: 'GERSON SOTO',
      clave: 'J@ireck30',
      rol: 'gerente',
      icono: '👑',
      color: '#4c6ef5',
      acceso: 'Acceso Completo'
    },
    admin: {
      nombre: 'ADMINISTRADOR',
      clave: '12345',
      rol: 'admin',
      icono: '🔒',
      color: '#40c057',
      acceso: 'Acceso Controlado'
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setPassword('');
    setError('');
  };

  const handleLogin = () => {
    if (!selectedRole) {
      setError('Por favor, selecciona un rol');
      return;
    }

    setIsLoading(true);
    
    // Simular carga
    setTimeout(() => {
      const usuario = usuarios[selectedRole];
      
      if (password === usuario.clave) {
        localStorage.setItem('reportes_usuario', JSON.stringify({
          nombre: usuario.nombre,
          rol: usuario.rol,
          color: usuario.color,
          icono: usuario.icono,
          timestamp: Date.now()
        }));
        
        // Redirigir con animación
        document.querySelector('.login-card').style.transform = 'scale(0.95)';
        setTimeout(() => {
          if (usuario.rol === 'gerente') {
            window.location.href = '/la-perrada-pos/reportes-gerson';
          } else {
            window.location.href = '/la-perrada-pos/reportes-admin';
          }
        }, 300);
      } else {
        setError('Clave incorrecta');
        setIsLoading(false);
        
        // Efecto de error
        const input = document.querySelector('.password-input');
        if (input) {
          input.style.animation = 'shake 0.5s';
          setTimeout(() => {
            input.style.animation = '';
          }, 500);
        }
      }
    }, 600);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handleForgotPassword = () => {
    if (!selectedRole) return;
    
    const usuario = usuarios[selectedRole];
    const mensaje = `Contacta al administrador para recuperar tu acceso.`;
    
    // Mostrar modal elegante
    const modal = document.createElement('div');
    modal.className = 'password-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>🔐 Recuperar acceso</h3>
        <p>${mensaje}</p>
        <button onclick="this.parentElement.parentElement.remove()">Cerrar</button>
      </div>
    `;
    document.body.appendChild(modal);
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="gradient-circle-1"></div>
        <div className="gradient-circle-2"></div>
        <div className="gradient-circle-3"></div>
      </div>
      
      <div className="login-card">
        {/* Logo y Título */}
        <div className="login-header">
          <div className="logo">
            <span className="logo-icon">🏪</span>
            <div className="logo-text">
              <h1>LA PERRADA</h1>
              <p>Sistema de Gestión</p>
            </div>
          </div>
          <div className="login-title">
            <h2>Panel de Reportes</h2>
            <p>Selecciona tu perfil para continuar</p>
          </div>
        </div>

        {/* Selector de Roles */}
        <div className="roles-section">
          <h3 className="section-title">¿Quién está ingresando?</h3>
          
          <div className="roles-grid">
            <div 
              className={`role-card ${selectedRole === 'gerson' ? 'active' : ''}`}
              style={{ '--role-color': usuarios.gerson.color }}
              onClick={() => handleRoleSelect('gerson')}
            >
              <div className="role-card-header">
                <div className="role-icon-bg" style={{ backgroundColor: usuarios.gerson.color + '20' }}>
                  <span className="role-icon">{usuarios.gerson.icono}</span>
                </div>
                <div className="role-badge" style={{ backgroundColor: usuarios.gerson.color }}>
                  {usuarios.gerson.acceso}
                </div>
              </div>
              
              <div className="role-card-body">
                <h4>{usuarios.gerson.nombre}</h4>
                <p className="role-description">
                  Gerente principal con acceso total al sistema
                </p>
                
                <div className="role-features">
                  <span className="feature">📊 Reportes completos</span>
                  <span className="feature">💵 Base de caja</span>
                  <span className="feature">📥 Exportar CSV/PDF</span>
                </div>
              </div>
            </div>

            <div 
              className={`role-card ${selectedRole === 'admin' ? 'active' : ''}`}
              style={{ '--role-color': usuarios.admin.color }}
              onClick={() => handleRoleSelect('admin')}
            >
              <div className="role-card-header">
                <div className="role-icon-bg" style={{ backgroundColor: usuarios.admin.color + '20' }}>
                  <span className="role-icon">{usuarios.admin.icono}</span>
                </div>
                <div className="role-badge" style={{ backgroundColor: usuarios.admin.color }}>
                  {usuarios.admin.acceso}
                </div>
              </div>
              
              <div className="role-card-body">
                <h4>{usuarios.admin.nombre}</h4>
                <p className="role-description">
                  Supervisor con acceso limitado al sistema
                </p>
                
                <div className="role-features">
                  <span className="feature">👁️ Ver reportes</span>
                  <span className="feature">🗑️ Eliminar items</span>
                  <span className="feature">⏱️ Tiempo real</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input de Contraseña */}
        {selectedRole && (
          <div className="password-section">
            <div className="password-header">
              <h3>Ingresa tu clave de acceso</h3>
              <p>
                Para <strong style={{ color: usuarios[selectedRole].color }}>
                  {usuarios[selectedRole].nombre}
                </strong>
              </p>
            </div>
            
            <div className="password-input-group">
              <div className="input-wrapper">
                <input
                  type="password"
                  className="password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="••••••••••"
                  disabled={isLoading}
                  autoFocus
                />
                <div className="input-decoration"></div>
              </div>
              
              <button 
                onClick={handleLogin} 
                className="login-button"
                disabled={isLoading || !password}
                style={{ backgroundColor: usuarios[selectedRole].color }}
              >
                {isLoading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    <span className="button-icon">→</span>
                    Ingresar
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
                <button 
                  onClick={handleForgotPassword}
                  className="forgot-password"
                >
                  ¿Olvidaste la clave?
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="login-footer">
          <div className="security-notice">
            <span className="security-icon">🔒</span>
            <p>
              Este sistema está protegido. Todas las actividades quedan registradas.
            </p>
          </div>
          
          {/* 🔥🔥🔥 BOTÓN VOLVER CORREGIDO 🔥🔥🔥 */}
          <button 
            onClick={() => window.location.href = '/la-perrada-pos/'}
            className="back-to-pos-btn"
          >
            ← Volver al POS
          </button>
          
          <div className="version">v2.0 • Sistema de Reportes</div>
        </div>
      </div>
    </div>
  );
};

export default LoginReportes;