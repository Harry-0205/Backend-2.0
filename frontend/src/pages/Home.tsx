import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Home: React.FC = () => {
  return (
    <div className="home-page" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Hero Section */}
      <section className="hero-section text-center" style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)',
        padding: '100px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
        <Container style={{ position: 'relative', zIndex: 1 }}>
          <Row className="justify-content-center">
            <Col lg={10}>
              <div style={{ marginBottom: '30px' }}>
                <span style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '10px 25px',
                  borderRadius: '50px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  backdropFilter: 'blur(10px)'
                }}>
                  🐾 Plataforma líder en gestión veterinaria
                </span>
              </div>
              <h1 style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: '800',
                color: 'white',
                marginBottom: '25px',
                lineHeight: '1.2'
              }}>
                Cuida mejor a tus <br />
                <span style={{
                  background: 'linear-gradient(to right, #60a5fa, #93c5fd)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>pacientes peludos</span>
              </h1>
              <p style={{
                fontSize: '1.3rem',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '40px',
                maxWidth: '700px',
                margin: '0 auto 40px'
              }}>
                Sistema integral de gestión veterinaria. Organiza citas, historiales médicos y administra tu clínica desde un solo lugar.
              </p>
              {/* Botón de registro removido - solo admin puede crear usuarios */}
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <button style={{
                    padding: '15px 40px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    border: 'none',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.3s ease'
                  }}>
                    Iniciar Sesión
                  </button>
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 20px', backgroundColor: '#f8fafc' }}>
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: '800',
                color: '#1e293b',
                marginBottom: '15px'
              }}>
                Todo lo que necesitas en un solo lugar
              </h2>
              <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                Herramientas profesionales para gestionar tu veterinaria de manera eficiente
              </p>
            </Col>
          </Row>

          <Row className="g-4">
            {[
              {
                icon: 'fa-users',
                title: 'Gestión de Usuarios',
                description: 'Control completo de clientes, veterinarios y personal con roles personalizados',
                color: '#3b82f6'
              },
              {
                icon: 'fa-paw',
                title: 'Historiales de Mascotas',
                description: 'Registros médicos detallados, vacunas y seguimiento de cada paciente',
                color: '#2563eb'
              },
              {
                icon: 'fa-calendar-check',
                title: 'Agenda Inteligente',
                description: 'Programa y gestiona citas con recordatorios automáticos por email',
                color: '#1d4ed8'
              },
              {
                icon: 'fa-hospital',
                title: 'Multi-Clínicas',
                description: 'Administra múltiples veterinarias desde una sola plataforma',
                color: '#1e40af'
              },
              {
                icon: 'fa-notes-medical',
                title: 'Historias Clínicas',
                description: 'Diagnósticos, tratamientos y observaciones médicas completas',
                color: '#3b82f6'
              },
              {
                icon: 'fa-chart-bar',
                title: 'Reportes y Analytics',
                description: 'Estadísticas en tiempo real y reportes detallados de tu negocio',
                color: '#2563eb'
              }
            ].map((feature, index) => (
              <Col lg={4} md={6} key={index}>
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '40px 30px',
                  height: '100%',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.15)';
                  e.currentTarget.style.borderColor = feature.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}>
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '15px',
                    background: `linear-gradient(135deg, ${feature.color}, #1e40af)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 25px'
                  }}>
                    <i className={`fas ${feature.icon}`} style={{ fontSize: '1.8rem', color: 'white' }}></i>
                  </div>
                  <h4 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#1e293b', marginBottom: '15px' }}>
                    {feature.title}
                  </h4>
                  <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                    {feature.description}
                  </p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Benefits Section */}
      <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <Container>
          <Row className="align-items-center" style={{ gap: '40px 0', alignItems: 'center' }}>
            <Col lg={6} className="d-flex align-items-center justify-content-center">
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: '30px',
                padding: '10px 50px',
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
                maxWidth: '640px',
                minHeight: '220px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2rem'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '-50px',
                  width: '200px',
                  height: '200px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%'
                }}></div>
                <i className="fas fa-laptop-medical" style={{ 
                  fontSize: '6.5rem', 
                  color: 'white',
                  opacity: '0.95',
                  position: 'relative',
                  zIndex: 1,
                }}></i>
              </div>
            </Col>
            <Col lg={6}>
              <h2 style={{
                fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                fontWeight: '800',
                color: '#1e293b',
                marginBottom: '30px',
                textAlign: 'center'
              }}>
                ¿Por qué elegir VetCare?
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { icon: 'fa-smile-beam', title: 'Fácil de usar', desc: 'Interfaz intuitiva diseñada pensando en veterinarios' },
                  { icon: 'fa-shield-alt', title: 'Seguro y confiable', desc: 'Protección de datos con encriptación JWT avanzada' },
                  { icon: 'fa-headset', title: 'Soporte dedicado', desc: 'Equipo de expertos listo para ayudarte cuando lo necesites' }
                ].map((benefit, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '20px',
                    padding: '20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '15px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                    e.currentTarget.style.transform = 'translateX(10px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <i className={`fas ${benefit.icon}`} style={{ fontSize: '1.3rem', color: 'white' }}></i>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <h5 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '5px' }}>
                        {benefit.title}
                      </h5>
                      <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer style={{ 
        backgroundColor: '#1e293b', 
        padding: '50px 20px 30px',
        color: 'white'
      }}>
        <Container>
          <Row style={{ marginBottom: '40px', textAlign: 'center' }}>
            <Col lg={4} md={6} style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
                <i className="fas fa-paw" style={{ fontSize: '1.5rem', color: '#3b82f6' }}></i>
                <h4 style={{ margin: 0, fontWeight: '700' }}>VetCare</h4>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                La plataforma líder en gestión veterinaria. Cuidamos de quienes cuidan.
              </p>
            </Col>
            <Col lg={4} md={6} style={{ marginBottom: '30px' }}>
              <h5 style={{ fontWeight: '700', marginBottom: '20px' }}>Enlaces Rápidos</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.3s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>
                  Iniciar Sesión
                </Link>
                {/* Enlace de registro removido - solo admin puede crear usuarios */}
                {/* <Link to="/register" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.3s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>
                  Crear Cuenta
                </Link> */}
                <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.3s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>
                  Características
                </a>
              </div>
            </Col>
            <Col lg={4} md={6} style={{ marginBottom: '30px' }}>
              <h5 style={{ fontWeight: '700', marginBottom: '20px' }}>Síguenos</h5>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                {['facebook', 'twitter', 'instagram', 'linkedin'].map((social, index) => (
                  <a key={index} href="#" style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '10px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#3b82f6',
                    transition: 'all 0.3s ease',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.color = '#3b82f6';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                    <i className={`fab fa-${social}`} style={{ fontSize: '1.2rem' }}></i>
                  </a>
                ))}
              </div>
            </Col>
          </Row>
          
          <div style={{ 
            borderTop: '1px solid rgba(148, 163, 184, 0.2)', 
            paddingTop: '30px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
              © 2025 <strong style={{ color: 'white' }}>VetCare</strong>. Todos los derechos reservados. Hecho con 💙 para veterinarios
            </p>
          </div>
        </Container>
      </footer>


    </div>
  );
};

export default Home;