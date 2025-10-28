import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const NavigationBar: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-dropdown')) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <nav style={{
      backgroundColor: '#ffffff',
      padding: '20px 0',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <Container>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-paw" style={{ fontSize: '2rem', color: '#2563eb' }}></i>
            <h3 style={{ margin: 0, color: '#1e40af', fontWeight: '700' }}>VetCare</h3>
          </Link>

          {/* Navigation Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            {/* Link Inicio */}
            <Link to="/" style={{ textDecoration: 'none' }}>
              <span className="nav-link-item" style={{
                color: '#374151',
                fontWeight: '600',
                fontSize: '1rem',
                padding: '8px 16px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}>
                Inicio
              </span>
            </Link>

            {!isAuthenticated ? (
              <>
                {/* Botón Iniciar Sesión */}
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <button className="nav-button" style={{
                    padding: '12px 30px',
                    border: '2px solid #e5e7eb',
                    backgroundColor: 'transparent',
                    color: '#374151',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}>
                    Iniciar Sesión
                  </button>
                </Link>

                {/* Botón Registrarse */}
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <button className="nav-button-primary" style={{
                    padding: '12px 30px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}>
                    Registrarse
                  </button>
                </Link>
              </>
            ) : (
              <>
                {/* Mostrar Dashboard solo para Administradores */}
                {authService.isAdmin() && (
                  <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                    <button className="nav-button" style={{
                      padding: '12px 30px',
                      border: '2px solid #e5e7eb',
                      backgroundColor: 'transparent',
                      color: '#374151',
                      borderRadius: '10px',
                      fontWeight: '600',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <i className="fas fa-chart-line"></i> Dashboard
                    </button>
                  </Link>
                )}

                {/* Enlaces para usuarios no administradores */}
                {!authService.isAdmin() && (
                  <>
                    <Link to="/mis-mascotas" style={{ textDecoration: 'none' }}>
                      <button className="nav-button" style={{
                        padding: '12px 30px',
                        border: '2px solid #e5e7eb',
                        backgroundColor: 'transparent',
                        color: '#374151',
                        borderRadius: '10px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <i className="fas fa-paw"></i> Mis Mascotas
                      </button>
                    </Link>

                    <Link to="/mis-citas" style={{ textDecoration: 'none' }}>
                      <button className="nav-button" style={{
                        padding: '12px 30px',
                        border: '2px solid #e5e7eb',
                        backgroundColor: 'transparent',
                        color: '#374151',
                        borderRadius: '10px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <i className="fas fa-calendar-alt"></i> Mis Citas
                      </button>
                    </Link>
                  </>
                )}

                {/* User Dropdown */}
                <div className="user-dropdown" style={{ position: 'relative' }}>
                  <button 
                    onClick={toggleDropdown}
                    style={{
                      padding: '12px 25px',
                      border: 'none',
                      background: dropdownOpen 
                        ? 'linear-gradient(135deg, #1d4ed8, #1e40af)' 
                        : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: 'white',
                      borderRadius: '10px',
                      fontWeight: '600',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <i className="fas fa-user-circle"></i>
                    {authService.isAdmin() ? 'admin' : currentUser?.username}
                    <i className={`fas fa-chevron-${dropdownOpen ? 'up' : 'down'}`} style={{ fontSize: '0.8rem' }}></i>
                  </button>
                  
                  {dropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: '0',
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                      minWidth: '220px',
                      zIndex: 1000,
                      marginTop: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      {/* Información del usuario */}
                      <div style={{
                        padding: '15px 20px',
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px 12px 0 0'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          color: '#374151'
                        }}>
                          <i className="fas fa-user-circle" style={{ fontSize: '1.5rem', color: '#3b82f6' }}></i>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                              {currentUser?.username}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              {authService.isAdmin() ? 'Administrador' : 'Usuario'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mi Perfil */}
                      <div 
                        onClick={() => {
                          navigate('/perfil');
                          setDropdownOpen(false);
                        }}
                        style={{
                          padding: '15px 20px',
                          color: '#374151',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#eff6ff';
                          e.currentTarget.style.color = '#2563eb';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#374151';
                        }}
                      >
                        <i className="fas fa-user"></i> Mi Perfil
                      </div>

                      {/* Configuración (solo para admin) */}
                      {authService.isAdmin() && (
                        <div 
                          onClick={() => {
                            navigate('/dashboard/configuracion');
                            setDropdownOpen(false);
                          }}
                          style={{
                            padding: '15px 20px',
                            color: '#374151',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#eff6ff';
                            e.currentTarget.style.color = '#2563eb';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#374151';
                          }}
                        >
                          <i className="fas fa-cog"></i> Configuración
                        </div>
                      )}

                      {/* Separador */}
                      <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '8px 0' }}></div>

                      {/* Cerrar Sesión */}
                      <div 
                        onClick={handleLogout}
                        style={{
                          padding: '15px 20px',
                          color: '#dc2626',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          borderRadius: '0 0 12px 12px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </Container>

      <style>{`
        .nav-link-item:hover {
          background-color: #eff6ff;
          color: #2563eb !important;
        }

        .nav-button:hover {
          background: linear-gradient(135deg, #eff6ff, #dbeafe) !important;
          border-color: #3b82f6 !important;
          color: #1e40af !important;
          transform: translateY(-2px);
        }
        
        .nav-button-primary:hover {
          background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
        }

        @media (max-width: 768px) {
          nav > div > div {
            justify-content: center;
          }
          
          .user-dropdown {
            position: static;
          }
          
          .dropdown-menu {
            position: fixed;
            top: 80px;
            right: 10px;
            left: 10px;
            width: auto;
          }
        }
      `}</style>
    </nav>
  );
};

export default NavigationBar;