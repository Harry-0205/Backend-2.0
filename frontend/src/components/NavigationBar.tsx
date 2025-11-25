import React, { useState, useEffect } from 'react';
import { Container, Modal, Row, Col, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const NavigationBar: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  const handleShowProfile = () => {
    setShowProfileModal(true);
    setDropdownOpen(false);
  };
  
  const handleCloseProfile = () => {
    setShowProfileModal(false);
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
            <img src={`${process.env.PUBLIC_URL}/Logo.png`} alt="Pet-History" style={{ height: '40px' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <h3 style={{ margin: 0, color: '#1e40af', fontWeight: '700' }}>Pet-History</h3>
          </Link>

          {/* Navigation Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            {/* Link Inicio - Solo visible cuando NO está autenticado */}
            {!isAuthenticated && (
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
            )}

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

                {/* Botón Registrarse - COMENTADO para que solo admin pueda crear usuarios */}
                {/* <Link to="/register" style={{ textDecoration: 'none' }}>
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
                </Link> */}
              </>
            ) : (
              <>
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
                        onClick={handleShowProfile}
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

                      {/* Dashboard */}
                      <div 
                        onClick={() => {
                          navigate('/dashboard');
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
                        <i className="fas fa-chart-line"></i> Dashboard
                      </div>

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
      
      {/* Modal de Perfil */}
      <Modal show={showProfileModal} onHide={handleCloseProfile} size="lg" centered>
        <Modal.Header closeButton style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
          <Modal.Title style={{ color: '#1e40af', fontWeight: '700' }}>
            <i className="fas fa-user-circle" style={{ marginRight: '10px' }}></i>
            Mi Perfil
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '30px' }}>
          <Row>
            <Col md={12}>
              <Card style={{ border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                <Card.Body>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px', gap: '20px' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '2rem'
                    }}>
                      <i className="fas fa-user"></i>
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: '#1e293b', fontWeight: '700' }}>
                        {currentUser?.nombres} {currentUser?.apellidos}
                      </h4>
                      <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
                        {authService.isAdmin() && 'Administrador'}
                        {authService.isRecepcionista() && 'Recepcionista'}
                        {authService.isVeterinario() && 'Veterinario'}
                        {authService.isCliente() && 'Cliente'}
                      </p>
                    </div>
                  </div>

                  <Row>
                    <Col md={6} style={{ marginBottom: '20px' }}>
                      <div style={{ 
                        padding: '15px', 
                        backgroundColor: '#f8fafc', 
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <label style={{ 
                          fontSize: '0.85rem', 
                          color: '#64748b', 
                          fontWeight: '600',
                          display: 'block',
                          marginBottom: '5px'
                        }}>
                          <i className="fas fa-id-card" style={{ marginRight: '8px' }}></i>
                          Documento
                        </label>
                        <p style={{ margin: 0, color: '#1e293b', fontWeight: '600', fontSize: '1rem' }}>
                          {currentUser?.documento}
                        </p>
                      </div>
                    </Col>
                    
                    <Col md={6} style={{ marginBottom: '20px' }}>
                      <div style={{ 
                        padding: '15px', 
                        backgroundColor: '#f8fafc', 
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <label style={{ 
                          fontSize: '0.85rem', 
                          color: '#64748b', 
                          fontWeight: '600',
                          display: 'block',
                          marginBottom: '5px'
                        }}>
                          <i className="fas fa-user-tag" style={{ marginRight: '8px' }}></i>
                          Usuario
                        </label>
                        <p style={{ margin: 0, color: '#1e293b', fontWeight: '600', fontSize: '1rem' }}>
                          {currentUser?.username}
                        </p>
                      </div>
                    </Col>

                    <Col md={6} style={{ marginBottom: '20px' }}>
                      <div style={{ 
                        padding: '15px', 
                        backgroundColor: '#f8fafc', 
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <label style={{ 
                          fontSize: '0.85rem', 
                          color: '#64748b', 
                          fontWeight: '600',
                          display: 'block',
                          marginBottom: '5px'
                        }}>
                          <i className="fas fa-envelope" style={{ marginRight: '8px' }}></i>
                          Correo Electrónico
                        </label>
                        <p style={{ margin: 0, color: '#1e293b', fontWeight: '600', fontSize: '1rem' }}>
                          {currentUser?.email || 'No registrado'}
                        </p>
                      </div>
                    </Col>

                    <Col md={6} style={{ marginBottom: '20px' }}>
                      <div style={{ 
                        padding: '15px', 
                        backgroundColor: '#f8fafc', 
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <label style={{ 
                          fontSize: '0.85rem', 
                          color: '#64748b', 
                          fontWeight: '600',
                          display: 'block',
                          marginBottom: '5px'
                        }}>
                          <i className="fas fa-phone" style={{ marginRight: '8px' }}></i>
                          Teléfono
                        </label>
                        <p style={{ margin: 0, color: '#1e293b', fontWeight: '600', fontSize: '1rem' }}>
                          {currentUser?.telefono || 'No registrado'}
                        </p>
                      </div>
                    </Col>

                    <Col md={12} style={{ marginBottom: '20px' }}>
                      <div style={{ 
                        padding: '15px', 
                        backgroundColor: '#f8fafc', 
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <label style={{ 
                          fontSize: '0.85rem', 
                          color: '#64748b', 
                          fontWeight: '600',
                          display: 'block',
                          marginBottom: '5px'
                        }}>
                          <i className="fas fa-map-marker-alt" style={{ marginRight: '8px' }}></i>
                          Dirección
                        </label>
                        <p style={{ margin: 0, color: '#1e293b', fontWeight: '600', fontSize: '1rem' }}>
                          {currentUser?.direccion || 'No registrada'}
                        </p>
                      </div>
                    </Col>

                    {(authService.isAdmin() || authService.isRecepcionista() || authService.isVeterinario()) && currentUser?.veterinaria && (
                      <Col md={12}>
                        <div style={{
                          padding: '20px',
                          background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                          borderRadius: '12px',
                          border: '2px solid #3b82f6',
                          marginTop: '10px'
                        }}>
                          <h5 style={{ 
                            color: '#1e40af', 
                            fontWeight: '700',
                            marginBottom: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}>
                            <i className="fas fa-hospital"></i>
                            Información de la Veterinaria
                          </h5>
                          <Row>
                            <Col md={6} style={{ marginBottom: '15px' }}>
                              <label style={{ 
                                fontSize: '0.85rem', 
                                color: '#1e40af', 
                                fontWeight: '600',
                                display: 'block',
                                marginBottom: '5px'
                              }}>
                                Nombre
                              </label>
                              <p style={{ margin: 0, color: '#1e293b', fontWeight: '700', fontSize: '1.1rem' }}>
                                {currentUser.veterinaria.nombre}
                              </p>
                            </Col>
                            <Col md={6} style={{ marginBottom: '15px' }}>
                              <label style={{ 
                                fontSize: '0.85rem', 
                                color: '#1e40af', 
                                fontWeight: '600',
                                display: 'block',
                                marginBottom: '5px'
                              }}>
                                Teléfono
                              </label>
                              <p style={{ margin: 0, color: '#1e293b', fontWeight: '600' }}>
                                {currentUser.veterinaria.telefono || 'No registrado'}
                              </p>
                            </Col>
                            <Col md={12}>
                              <label style={{ 
                                fontSize: '0.85rem', 
                                color: '#1e40af', 
                                fontWeight: '600',
                                display: 'block',
                                marginBottom: '5px'
                              }}>
                                Dirección
                              </label>
                              <p style={{ margin: 0, color: '#1e293b', fontWeight: '600' }}>
                                {currentUser.veterinaria.direccion || 'No registrada'}
                              </p>
                            </Col>
                          </Row>
                        </div>
                      </Col>
                    )}
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </nav>
  );
};

export default NavigationBar;