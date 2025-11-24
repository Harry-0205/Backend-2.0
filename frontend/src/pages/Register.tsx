import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { SignupRequest } from '../types';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignupRequest>({
    username: '',
    email: '',
    password: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    direccion: '',
    cedula: '',
    documento: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Sincronizar cédula con documento si cédula está llena
      const dataToSend = {
        ...formData,
        documento: formData.cedula || formData.documento
      };
      
      await authService.register(dataToSend);
      setSuccess('¡Registro exitoso! Puedes iniciar sesión ahora.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      // Manejar el error correctamente
      if (err.response?.data) {
        const errorData = err.response.data;
        // Si es un objeto con mensaje, extraer el mensaje
        if (typeof errorData === 'object' && errorData.message) {
          setError(errorData.message);
        } else if (typeof errorData === 'string') {
          setError(errorData);
        } else {
          setError('Error al registrarse. Por favor, verifica los datos.');
        }
      } else {
        setError(err.message || 'Error al registrarse');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #153372 0%, #2bc6a0 100%)',
      display: 'flex',
      alignItems: 'center',
      padding: '40px 0'
    }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={7}>
            <Card style={{
              border: 'none',
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '20px'
                  }}>
                    <i className="fas fa-paw" style={{
                      fontSize: '2.5rem',
                      color: '#2bc6a0',
                      background: 'linear-gradient(135deg, #2bc6a0, #153372)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}></i>
                    <h1 style={{
                      margin: 0,
                      background: 'linear-gradient(135deg, #2bc6a0, #153372)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: '700',
                      fontSize: '2rem'
                    }}>VetCare</h1>
                  </div>
                  <h2 style={{
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '8px'
                  }}>Crear Cuenta</h2>
                  <p style={{
                    color: '#64748b',
                    margin: 0,
                    fontSize: '1.1rem'
                  }}>Únete a nuestra comunidad</p>
                </div>

                {error && (
                  <Alert variant="danger" style={{
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    borderLeft: '4px solid #dc2626'
                  }}>
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert variant="success" style={{
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#f0fdf4',
                    color: '#16a34a',
                    borderLeft: '4px solid #16a34a'
                  }}>
                    <i className="fas fa-check-circle me-2"></i>
                    {success}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '8px'
                        }}>
                          <i className="fas fa-user me-2" style={{ color: '#2bc6a0' }}></i>
                          Nombres *
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="nombres"
                          value={formData.nombres}
                          onChange={handleInputChange}
                          placeholder="Nombres"
                          required
                          style={{
                            borderRadius: '12px',
                            border: '2px solid #e5e7eb',
                            padding: '12px 16px',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#2bc6a0';
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e5e7eb';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '8px'
                        }}>
                          <i className="fas fa-user me-2" style={{ color: '#2bc6a0' }}></i>
                          Apellidos *
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="apellidos"
                          value={formData.apellidos}
                          onChange={handleInputChange}
                          placeholder="Apellidos"
                          required
                          style={{
                            borderRadius: '12px',
                            border: '2px solid #e5e7eb',
                            padding: '12px 16px',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#2bc6a0';
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e5e7eb';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label style={{
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      <i className="fas fa-at me-2" style={{ color: '#2bc6a0' }}></i>
                      Usuario *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Nombre de usuario"
                      required
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        padding: '12px 16px',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2bc6a0';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label style={{
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      <i className="fas fa-envelope me-2" style={{ color: '#2bc6a0' }}></i>
                      Email *
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="correo@ejemplo.com"
                      required
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        padding: '12px 16px',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2bc6a0';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label style={{
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      <i className="fas fa-lock me-2" style={{ color: '#2bc6a0' }}></i>
                      Contraseña *
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        padding: '12px 16px',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2bc6a0';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '8px'
                        }}>
                          <i className="fas fa-phone me-2" style={{ color: '#2bc6a0' }}></i>
                          Teléfono
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          placeholder="+57 300 123 4567"
                          style={{
                            borderRadius: '12px',
                            border: '2px solid #e5e7eb',
                            padding: '12px 16px',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#2bc6a0';
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e5e7eb';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '8px'
                        }}>
                          <i className="fas fa-id-card me-2" style={{ color: '#2bc6a0' }}></i>
                          Cédula *
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="cedula"
                          value={formData.cedula}
                          onChange={handleInputChange}
                          placeholder="Número de cédula"
                          required
                          style={{
                            borderRadius: '12px',
                            border: '2px solid #e5e7eb',
                            padding: '12px 16px',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#2bc6a0';
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e5e7eb';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label style={{
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      <i className="fas fa-map-marker-alt me-2" style={{ color: '#2bc6a0' }}></i>
                      Dirección
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      placeholder="Dirección completa"
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        padding: '12px 16px',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2bc6a0';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </Form.Group>

                  <Button 
                    type="submit" 
                    className="w-100 mb-4"
                    disabled={loading}
                    style={{
                      background: loading 
                        ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                        : 'linear-gradient(135deg, #2bc6a0, #153372)',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '14px 24px',
                      fontWeight: '600',
                      fontSize: '1.1rem',
                      transition: 'all 0.3s ease',
                      boxShadow: loading ? 'none' : '0 4px 15px rgba(59, 130, 246, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                      }
                    }}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Registrando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        Crear Cuenta
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <p style={{ color: '#64748b', margin: 0 }}>
                      ¿Ya tienes cuenta?{' '}
                      <Link to="/login" style={{
                        color: '#2bc6a0',
                        textDecoration: 'none',
                        fontWeight: '600'
                      }}>
                        Inicia sesión aquí
                      </Link>
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;
