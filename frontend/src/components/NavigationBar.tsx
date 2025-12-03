import React, { useState, useEffect } from 'react';
import { Container, Modal, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import veterinariaService from '../services/veterinariaService';
import userService from '../services/userService';

const NavigationBar: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCreateVeterinariaForm, setShowCreateVeterinariaForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [veterinariaForm, setVeterinariaForm] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    ciudad: '',
    descripcion: '',
    servicios: '',
    horarioAtencion: ''
  });

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
    setShowCreateVeterinariaForm(false);
    setError('');
    setSuccess('');
    setVeterinariaForm({
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      ciudad: '',
      descripcion: '',
      servicios: '',
      horarioAtencion: ''
    });
  };

  const handleVeterinariaInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVeterinariaForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateVeterinaria = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!veterinariaForm.nombre || !veterinariaForm.telefono) {
      setError('El nombre y teléfono son obligatorios');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('🏥 Creando veterinaria:', veterinariaForm);
      
      // Crear la veterinaria
      const nuevaVeterinaria = await veterinariaService.createVeterinaria(veterinariaForm);
      console.log('✅ Veterinaria creada:', nuevaVeterinaria);
      
      // Asociar el admin a la veterinaria
      if (currentUser?.documento) {
        console.log('👤 Asociando admin:', currentUser.documento, 'a veterinaria:', nuevaVeterinaria.id);
        
        // Preparar datos de actualización con los campos requeridos
        const updateData = {
          documento: currentUser.documento,
          username: currentUser.username,
          nombres: currentUser.nombres || '',
          apellidos: currentUser.apellidos || '',
          email: currentUser.email,
          telefono: currentUser.telefono,
          direccion: currentUser.direccion,
          activo: true, // Campo requerido
          roles: currentUser.roles,
          veterinariaId: nuevaVeterinaria.id
        };

        console.log('📤 Datos de actualización:', updateData);
        const usuarioActualizado = await userService.updateUsuario(currentUser.documento, updateData);
        console.log('✅ Usuario actualizado:', usuarioActualizado);
        
        // Actualizar el usuario en localStorage
        const userWithVeterinaria = {
          ...currentUser,
          veterinaria: {
            id: nuevaVeterinaria.id,
            nombre: nuevaVeterinaria.nombre,
            telefono: nuevaVeterinaria.telefono,
            direccion: nuevaVeterinaria.direccion
          }
        };
        localStorage.setItem('user', JSON.stringify(userWithVeterinaria));
        console.log('💾 Usuario guardado en localStorage con veterinaria');
        
        setSuccess('¡Veterinaria creada y asociada exitosamente!');
        setTimeout(() => {
          setShowCreateVeterinariaForm(false);
          window.location.reload(); // Recargar para actualizar la UI
        }, 2000);
      }
    } catch (error: any) {
      console.error('❌ Error completo:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      setError(error.response?.data?.message || error.message || 'Error al crear la veterinaria');
    } finally {
      setLoading(false);
    }
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={`${process.env.PUBLIC_URL}/Logo.png`} alt="Pet-History" style={{ height: '40px' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <h3 style={{ margin: 0, color: '#1e40af', fontWeight: '700' }}>Pet-History</h3>
          </div>

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
                        onClick={() => {
                          navigate('/dashboard/perfil');
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

                    {/* Sección para crear veterinaria (solo admin sin veterinaria) */}
                    {authService.isAdmin() && !currentUser?.veterinaria && (
                      <Col md={12}>
                        <div style={{
                          padding: '20px',
                          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                          borderRadius: '12px',
                          border: '2px solid #f59e0b',
                          marginTop: '10px'
                        }}>
                          {!showCreateVeterinariaForm ? (
                            <div style={{ textAlign: 'center' }}>
                              <i className="fas fa-hospital" style={{ fontSize: '3rem', color: '#f59e0b', marginBottom: '15px' }}></i>
                              <h5 style={{ color: '#92400e', fontWeight: '700', marginBottom: '10px' }}>
                                No tienes una veterinaria asociada
                              </h5>
                              <p style={{ color: '#78350f', marginBottom: '20px' }}>
                                Como administrador, puedes crear y asociarte a tu veterinaria
                              </p>
                              <Button
                                variant="warning"
                                onClick={() => setShowCreateVeterinariaForm(true)}
                                style={{
                                  padding: '12px 30px',
                                  fontWeight: '600',
                                  borderRadius: '8px'
                                }}
                              >
                                <i className="fas fa-plus-circle me-2"></i>
                                Crear Mi Veterinaria
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <h5 style={{ 
                                color: '#92400e', 
                                fontWeight: '700',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                              }}>
                                <i className="fas fa-hospital"></i>
                                Crear Nueva Veterinaria
                              </h5>

                              {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
                              {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

                              <Form onSubmit={handleCreateVeterinaria}>
                                <Row>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label style={{ fontWeight: '600', color: '#78350f' }}>
                                        <i className="fas fa-hospital me-2"></i>
                                        Nombre <span style={{ color: '#dc2626' }}>*</span>
                                      </Form.Label>
                                      <Form.Control
                                        type="text"
                                        name="nombre"
                                        value={veterinariaForm.nombre}
                                        onChange={handleVeterinariaInputChange}
                                        placeholder="Ej: Veterinaria San Francisco"
                                        required
                                        disabled={loading}
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label style={{ fontWeight: '600', color: '#78350f' }}>
                                        <i className="fas fa-phone me-2"></i>
                                        Teléfono <span style={{ color: '#dc2626' }}>*</span>
                                      </Form.Label>
                                      <Form.Control
                                        type="tel"
                                        name="telefono"
                                        value={veterinariaForm.telefono}
                                        onChange={handleVeterinariaInputChange}
                                        placeholder="Ej: 3001234567"
                                        required
                                        disabled={loading}
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label style={{ fontWeight: '600', color: '#78350f' }}>
                                        <i className="fas fa-envelope me-2"></i>
                                        Email
                                      </Form.Label>
                                      <Form.Control
                                        type="email"
                                        name="email"
                                        value={veterinariaForm.email}
                                        onChange={handleVeterinariaInputChange}
                                        placeholder="contacto@veterinaria.com"
                                        disabled={loading}
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label style={{ fontWeight: '600', color: '#78350f' }}>
                                        <i className="fas fa-map-marker-alt me-2"></i>
                                        Ciudad
                                      </Form.Label>
                                      <Form.Control
                                        type="text"
                                        name="ciudad"
                                        value={veterinariaForm.ciudad}
                                        onChange={handleVeterinariaInputChange}
                                        placeholder="Ej: Bogotá"
                                        disabled={loading}
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={12}>
                                    <Form.Group className="mb-3">
                                      <Form.Label style={{ fontWeight: '600', color: '#78350f' }}>
                                        <i className="fas fa-home me-2"></i>
                                        Dirección
                                      </Form.Label>
                                      <Form.Control
                                        type="text"
                                        name="direccion"
                                        value={veterinariaForm.direccion}
                                        onChange={handleVeterinariaInputChange}
                                        placeholder="Ej: Calle 123 # 45-67"
                                        disabled={loading}
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={12}>
                                    <Form.Group className="mb-3">
                                      <Form.Label style={{ fontWeight: '600', color: '#78350f' }}>
                                        <i className="fas fa-info-circle me-2"></i>
                                        Descripción
                                      </Form.Label>
                                      <Form.Control
                                        as="textarea"
                                        rows={2}
                                        name="descripcion"
                                        value={veterinariaForm.descripcion}
                                        onChange={handleVeterinariaInputChange}
                                        placeholder="Descripción de la veterinaria"
                                        disabled={loading}
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label style={{ fontWeight: '600', color: '#78350f' }}>
                                        <i className="fas fa-concierge-bell me-2"></i>
                                        Servicios
                                      </Form.Label>
                                      <Form.Control
                                        as="textarea"
                                        rows={2}
                                        name="servicios"
                                        value={veterinariaForm.servicios}
                                        onChange={handleVeterinariaInputChange}
                                        placeholder="Ej: Consulta, Vacunación, Cirugía"
                                        disabled={loading}
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label style={{ fontWeight: '600', color: '#78350f' }}>
                                        <i className="fas fa-clock me-2"></i>
                                        Horario de Atención
                                      </Form.Label>
                                      <Form.Control
                                        type="text"
                                        name="horarioAtencion"
                                        value={veterinariaForm.horarioAtencion}
                                        onChange={handleVeterinariaInputChange}
                                        placeholder="Ej: Lun-Vie 8am-6pm, Sáb 9am-1pm"
                                        disabled={loading}
                                      />
                                    </Form.Group>
                                  </Col>
                                </Row>

                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                  <Button
                                    variant="secondary"
                                    onClick={() => setShowCreateVeterinariaForm(false)}
                                    disabled={loading}
                                  >
                                    <i className="fas fa-times me-2"></i>
                                    Cancelar
                                  </Button>
                                  <Button
                                    variant="success"
                                    type="submit"
                                    disabled={loading}
                                  >
                                    {loading ? (
                                      <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Creando...
                                      </>
                                    ) : (
                                      <>
                                        <i className="fas fa-save me-2"></i>
                                        Crear Veterinaria
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </Form>
                            </div>
                          )}
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