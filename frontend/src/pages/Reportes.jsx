// src/pages/Reportes.jsx - VERSIÓN COMPLETA CORREGIDA
import { useState, useEffect } from "react";
import AdminReportes from "./reportes/AdminReportes";
import GersonReportes from "./reportes/GersonReportes";

// Componente de Login
const LoginReportes = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState("admin");

  // Definir usuarios
  const usuarios = {
    "admin": { 
      password: "12345", 
      rol: "admin", 
      nombre: "ADMIN",
      displayName: "ADMIN",
      icon: "👔",
      color: "#3B82F6",
      gradient: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)"
    },
    "gerson": { 
      password: "J@ireck30", 
      rol: "gerente", 
      nombre: "GERSON",
      displayName: "GERSON",
      icon: "⭐",
      color: "#8B5CF6",
      gradient: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)"
    }
  };

  useEffect(() => {
    setUsername(selectedUser);
  }, [selectedUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const usuario = usuarios[username.toLowerCase()];
    
    if (usuario && usuario.password === password) {
      const sesion = {
        username: username.toLowerCase(),
        rol: usuario.rol,
        nombre: usuario.nombre,
        timestamp: Date.now()
      };
      
      localStorage.setItem('reportes_usuario', JSON.stringify(sesion));
      onLogin(sesion);
    } else {
      setError("❌ Contraseña incorrecta");
      setIsLoading(false);
    }
  };

  // 🔥🔥🔥 BOTÓN VOLVER CORREGIDO 🔥🔥🔥
  const handleBackToPOS = () => {
    // Detectar si estamos en GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io');
    const basePath = isGitHubPages ? '/la-perrada-pos' : '';
    
    window.location.href = basePath + '/';
  };

  // ESTILOS
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Segoe UI', Arial, sans-serif"
    },
    mainCard: {
      display: 'flex',
      background: 'white',
      borderRadius: '25px',
      boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
      maxWidth: '900px',
      width: '100%',
      overflow: 'hidden',
      minHeight: '550px'
    },
    leftPanel: {
      flex: 1,
      background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
      padding: '40px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      color: 'white',
      position: 'relative'
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      marginBottom: '30px'
    },
    logoIcon: {
      fontSize: '50px',
      background: 'rgba(255,255,255,0.2)',
      width: '70px',
      height: '70px',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(10px)'
    },
    logoText: {
      fontSize: '24px',
      fontWeight: 'bold'
    },
    title: {
      fontSize: '36px',
      fontWeight: 'bold',
      marginBottom: '10px',
      lineHeight: 1.2
    },
    subtitle: {
      fontSize: '16px',
      opacity: 0.9,
      marginBottom: '40px'
    },
    userSelector: {
      display: 'flex',
      gap: '15px',
      marginBottom: '40px'
    },
    userButton: {
      flex: 1,
      padding: '20px',
      borderRadius: '15px',
      border: '3px solid transparent',
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
      cursor: 'pointer',
      transition: 'all 0.3s',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px'
    },
    userButtonActive: {
      borderColor: 'white',
      background: 'rgba(255,255,255,0.2)',
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
    },
    userIcon: {
      fontSize: '35px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    userName: {
      fontSize: '18px',
      fontWeight: 'bold',
      textAlign: 'center'
    },
    securityBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      background: 'rgba(255,255,255,0.15)',
      padding: '12px 20px',
      borderRadius: '25px',
      marginTop: '20px',
      backdropFilter: 'blur(10px)',
      fontSize: '14px'
    },
    rightPanel: {
      flex: 1,
      padding: '50px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    },
    rightTitle: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '30px',
      textAlign: 'center'
    },
    inputGroup: {
      marginBottom: '25px'
    },
    inputLabel: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#4b5563',
      marginBottom: '8px'
    },
    inputContainer: {
      position: 'relative'
    },
    inputIcon: {
      position: 'absolute',
      left: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '20px',
      color: '#9ca3af',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '20px',
      height: '20px'
    },
    input: {
      width: '100%',
      padding: '15px 15px 15px 45px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      fontSize: '16px',
      transition: 'all 0.3s',
      backgroundColor: 'white',
      boxSizing: 'border-box'
    },
    passwordInput: {
      letterSpacing: '3px',
      fontWeight: 'bold'
    },
    errorBox: {
      background: '#fee2e2',
      border: '2px solid #fca5a5',
      borderRadius: '12px',
      padding: '15px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      animation: 'shake 0.5s ease-in-out'
    },
    button: {
      width: '100%',
      padding: '16px',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      marginBottom: '12px'
    },
    primaryButton: {
      color: 'white',
      boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
    },
    secondaryButton: {
      background: 'white',
      color: '#374151',
      border: '2px solid #e5e7eb'
    },
    passwordHint: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '8px',
      textAlign: 'center',
      padding: '8px',
      backgroundColor: '#f3f4f6',
      borderRadius: '8px',
      marginTop: '12px'
    },
    adminPasswordHint: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      border: '1px solid #93c5fd',
      fontWeight: 'bold'
    },
    gerentePasswordHint: {
      backgroundColor: '#f3e8ff',
      color: '#7c3aed',
      border: '1px solid #d8b4fe'
    },
    footer: {
      marginTop: '30px',
      textAlign: 'center',
      fontSize: '14px',
      color: '#9ca3af'
    }
  };

  const currentUser = usuarios[selectedUser];
  const passwordHint = selectedUser === "admin" 
    ? `💡 Ingresa la contraseña de administrador`
    : `💡 Ingresa la contraseña de gerencia`;

  return (
    <div style={styles.container}>
      <div style={styles.mainCard}>
        {/* PANEL IZQUIERDO */}
        <div style={styles.leftPanel}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>
              <span>🌭</span>
            </div>
            <div style={styles.logoText}>LA PERRADA DE PITER</div>
          </div>
          
          <h1 style={styles.title}>Sistema de Reportes</h1>
          <p style={styles.subtitle}>Acceso exclusivo para personal autorizado</p>
          
          {/* Selector de usuario */}
          <div style={styles.userSelector}>
            <button
              type="button"
              onClick={() => setSelectedUser("admin")}
              style={{
                ...styles.userButton,
                ...(selectedUser === "admin" && styles.userButtonActive)
              }}
            >
              <div style={styles.userIcon}>👔</div>
              <div style={styles.userName}>ADMINISTRADOR</div>
              <div style={{fontSize: '12px', opacity: 0.9}}>Reportes básicos</div>
            </button>
            
            <button
              type="button"
              onClick={() => setSelectedUser("gerson")}
              style={{
                ...styles.userButton,
                ...(selectedUser === "gerson" && styles.userButtonActive)
              }}
            >
              <div style={styles.userIcon}>⭐</div>
              <div style={styles.userName}>GERENCIA</div>
              <div style={{fontSize: '12px', opacity: 0.9}}>Control total</div>
            </button>
          </div>
          
          {/* Badge de seguridad */}
          <div style={styles.securityBadge}>
            <span>🔒</span>
            <div>
              <div style={{fontWeight: 'bold'}}>Conexión segura</div>
              <div style={{fontSize: '12px', opacity: 0.9}}>Firebase • SSL • 24/7</div>
            </div>
          </div>
        </div>
        
        {/* PANEL DERECHO */}
        <div style={styles.rightPanel}>
          <h2 style={styles.rightTitle}>
            <div style={{color: currentUser.color, fontSize: '40px', marginBottom: '10px'}}>
              {currentUser.icon}
            </div>
            Acceso {selectedUser === "admin" ? "Administrativo" : "Gerencial"}
          </h2>
          
          <form onSubmit={handleSubmit}>
            {/* Usuario seleccionado */}
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Usuario seleccionado</label>
              <div style={styles.inputContainer}>
                <div style={styles.inputIcon}>👤</div>
                <input
                  type="text"
                  value={currentUser.nombre}
                  readOnly
                  style={{
                    ...styles.input,
                    backgroundColor: '#f3f4f6',
                    cursor: 'default',
                    color: currentUser.color,
                    fontWeight: 'bold',
                    fontSize: '18px',
                    textAlign: 'center',
                    paddingLeft: '15px'
                  }}
                />
              </div>
            </div>
            
            {/* Contraseña */}
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Contraseña</label>
              <div style={styles.inputContainer}>
                <div style={styles.inputIcon}>🔒</div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  style={{
                    ...styles.input,
                    ...styles.passwordInput,
                    paddingRight: '45px'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = currentUser.color;
                    e.target.style.boxShadow = `0 0 0 3px ${currentUser.color}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              {/* HINT DE CONTRASEÑA */}
              <div style={{
                ...styles.passwordHint,
                ...(selectedUser === "admin" ? styles.adminPasswordHint : styles.gerentePasswordHint)
              }}>
                {passwordHint}
              </div>
            </div>
            
            {/* Error */}
            {error && (
              <div style={styles.errorBox}>
                <span style={{fontSize: '20px'}}>⚠️</span>
                <div>
                  <div style={{fontWeight: 'bold', color: '#dc2626'}}>Error de acceso</div>
                  <div style={{color: '#b91c1c', fontSize: '14px'}}>{error}</div>
                </div>
              </div>
            )}
            
            {/* Botón de acceso */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                ...styles.button,
                ...styles.primaryButton,
                background: currentUser.gradient,
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
              onMouseOver={(e) => !isLoading && (e.target.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => !isLoading && (e.target.style.transform = 'translateY(0)')}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Verificando credenciales...
                </>
              ) : (
                <>
                  <span style={{fontSize: '20px'}}>🚀</span>
                  ACCEDER AL SISTEMA
                </>
              )}
            </button>
            
            {/* 🔥🔥🔥 BOTÓN VOLVER CORREGIDO 🔥🔥🔥 */}
            <button
              type="button"
              onClick={handleBackToPOS}
              style={{
                ...styles.button,
                ...styles.secondaryButton
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.borderColor = currentUser.color;
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.borderColor = '#e5e7eb';
              }}
            >
              <span style={{fontSize: '18px'}}>🏪</span>
              Volver al POS Principal
            </button>
          </form>
          
          <div style={styles.footer}>
            Sistema POS 24/7 • v2.0 Professional • © {new Date().getFullYear()}
          </div>
        </div>
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        input:focus {
          outline: none;
        }
        button {
          font-family: inherit;
        }
      `}</style>
    </div>
  );
};

// Componente principal Reportes
const Reportes = () => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarSesion = () => {
      try {
        const sesionGuardada = localStorage.getItem('reportes_usuario');
        if (sesionGuardada) {
          const sesion = JSON.parse(sesionGuardada);
          
          const haceCuanto = Date.now() - sesion.timestamp;
          const OCHO_HORAS = 8 * 60 * 60 * 1000;
          
          if (haceCuanto < OCHO_HORAS) {
            setUsuario(sesion);
          } else {
            localStorage.removeItem('reportes_usuario');
          }
        }
      } catch (error) {
        localStorage.removeItem('reportes_usuario');
      } finally {
        setCargando(false);
      }
    };

    cargarSesion();
  }, []);

  const handleLogin = (nuevoUsuario) => {
    setUsuario(nuevoUsuario);
  };

  // 🔥🔥🔥 LOGOUT CORREGIDO - FUNCIONAL PARA TODO 🔥🔥🔥
  const handleLogout = () => {
    // Limpiar todo
    localStorage.removeItem('reportes_usuario');
    localStorage.removeItem('fechaActiva');
    localStorage.removeItem('estadoCaja');
    
    // Forzar recarga completa
    setTimeout(() => {
      const isGitHubPages = window.location.hostname.includes('github.io');
      const basePath = isGitHubPages ? '/la-perrada-pos' : '';
      
      window.location.href = basePath + '/reportes';
      window.location.reload(true);
    }, 50);
  };

  if (cargando) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{textAlign: 'center'}}>
          <div style={{
            width: '80px',
            height: '80px',
            border: '5px solid #f97316',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '10px'
          }}>Cargando sistema</h2>
          <p style={{color: 'rgba(255,255,255,0.8)', fontSize: '16px'}}>
            Inicializando módulos de seguridad...
          </p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return <LoginReportes onLogin={handleLogin} />;
  }

  return (
    <div className="reportes-container">
      {/* BOTÓN LOGOUT - CORREGIDO */}
      <button
        onClick={handleLogout}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          background: 'linear-gradient(45deg, #dc2626, #b91c1c)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '10px',
          border: 'none',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 'bold',
          fontSize: '14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'all 0.3s'
        }}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
      >
        <span style={{fontSize: '16px'}}>🚪</span>
        <div style={{textAlign: 'left'}}>
          <div>Cerrar Sesión</div>
          <div style={{fontSize: '11px', opacity: 0.9}}>{usuario.nombre}</div>
        </div>
      </button>

      {usuario.rol === "gerente" ? (
        <GersonReportes usuario={usuario} onLogout={handleLogout} />
      ) : (
        <AdminReportes usuario={usuario} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default Reportes;