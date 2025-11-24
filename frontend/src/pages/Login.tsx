import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { LoginRequest } from '../types';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

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

    try {
      console.log('📝 Enviando formulario de login');
      await authService.login(formData);
      console.log('🎉 Login exitoso, navegando al dashboard');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('💥 Error en handleSubmit:', err);
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #153372 0%, #0a1e42 100%)',
      display: 'flex',
      alignItems: 'center',
      padding: '20px 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Elementos decorativos de fondo */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        right: '-100px',
        width: '400px',
        height: '400px',
        background: 'rgba(43, 198, 160, 0.1)',
        borderRadius: '50%',
        filter: 'blur(80px)'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-150px',
        left: '-150px',
        width: '500px',
        height: '500px',
        background: 'rgba(43, 198, 160, 0.08)',
        borderRadius: '50%',
        filter: 'blur(100px)'
      }}></div>

      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card style={{
              border: 'none',
              borderRadius: '24px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)'
            }}>
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '24px'
                  }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(135deg, #2bc6a0 0%, #1fa885 100%)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 16px rgba(43, 198, 160, 0.3)'
                    }}>
                      <i className="fas fa-paw" style={{
                        fontSize: '1.8rem',
                        color: '#ffffff'
                      }}></i>
                    </div>
                    <h1 style={{
                      margin: 0,
                      color: '#153372',
                      fontWeight: '800',
                      fontSize: '2.2rem',
                      letterSpacing: '-0.5px'
                    }}>VetCare</h1>
                  </div>
                  <h2 style={{
                    fontWeight: '700',
                    color: '#153372',
                    marginBottom: '8px',
                    fontSize: '1.75rem'
                  }}>Iniciar Sesión</h2>
                  <p style={{
                    color: '#64748b',
                    margin: 0,
                    fontSize: '1rem'
                  }}>Bienvenido de vuelta 👋</p>
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

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label style={{
                      fontWeight: '600',
                      color: '#153372',
                      marginBottom: '8px',
                      fontSize: '0.95rem'
                    }}>
                      <i className="fas fa-user me-2" style={{ color: '#2bc6a0' }}></i>
                      Usuario
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Ingresa tu usuario"
                      required
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        padding: '14px 18px',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        backgroundColor: '#f8fafc'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2bc6a0';
                        e.target.style.boxShadow = '0 0 0 4px rgba(43, 198, 160, 0.1)';
                        e.target.style.backgroundColor = '#ffffff';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                        e.target.style.backgroundColor = '#f8fafc';
                      }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label style={{
                      fontWeight: '600',
                      color: '#153372',
                      marginBottom: '8px',
                      fontSize: '0.95rem'
                    }}>
                      <i className="fas fa-lock me-2" style={{ color: '#2bc6a0' }}></i>
                      Contraseña
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Ingresa tu contraseña"
                      required
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        padding: '14px 18px',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        backgroundColor: '#f8fafc'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2bc6a0';
                        e.target.style.boxShadow = '0 0 0 4px rgba(43, 198, 160, 0.1)';
                        e.target.style.backgroundColor = '#ffffff';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                        e.target.style.backgroundColor = '#f8fafc';
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
                        : 'linear-gradient(135deg, #2bc6a0, #1fa885)',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '16px 24px',
                      fontWeight: '600',
                      fontSize: '1.05rem',
                      transition: 'all 0.3s ease',
                      boxShadow: loading ? 'none' : '0 8px 20px rgba(43, 198, 160, 0.3)',
                      letterSpacing: '0.3px'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 12px 30px rgba(43, 198, 160, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(43, 198, 160, 0.3)';
                      }
                    }}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Iniciar Sesión
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <p style={{ color: '#64748b', marginBottom: '15px', fontSize: '0.95rem' }}>
                      ¿No tienes cuenta?{' '}
                      <Link to="/register" style={{
                        color: '#2bc6a0',
                        textDecoration: 'none',
                        fontWeight: '600',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#1fa885'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#2bc6a0'}
                      >
                        Regístrate aquí
                      </Link>
                    </p>
                    <div style={{
                      background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid #d1fae5'
                    }}>
                      <small style={{
                        color: '#059669',
                        fontSize: '0.9rem',
                        lineHeight: '1.6'
                      }}>
                        <i className="fas fa-info-circle me-1" style={{ color: '#2bc6a0' }}></i>
                        <strong>Usuario de prueba:</strong> admin<br/>
                        <strong>Contraseña:</strong> 123456
                      </small>
                    </div>
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

export default Login;