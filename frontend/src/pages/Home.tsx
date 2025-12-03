import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Home: React.FC = () => {
  return (
    <div className="home-page" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#ffffff' }}>
      {/* Hero Section */}
      <section className="hero-section text-center" style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        padding: '120px 20px 100px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background circles */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.15)',
          filter: 'blur(80px)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-150px',
          left: '-150px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(20, 184, 166, 0.12)',
          filter: 'blur(100px)'
        }}></div>
        <Container style={{ position: 'relative', zIndex: 1 }}>
          <Row className="justify-content-center">
            <Col lg={10}>
              <h1 style={{
                fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
                fontWeight: '900',
                color: 'white',
                marginBottom: '30px',
                lineHeight: '1.1',
                letterSpacing: '-0.02em'
              }}>
                Cuida mejor a tus <br />
                <span style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>pacientes peludos</span>
              </h1>
              <p style={{
                fontSize: '1.25rem',
                color: 'rgba(255,255,255,0.85)',
                marginBottom: '40px',
                maxWidth: '650px',
                margin: '0 auto 40px',
                lineHeight: '1.7'
              }}>
                Sistema integral de gestión veterinaria. Organiza citas, historiales médicos y administra tu clínica desde un solo lugar.
              </p>
              {/* Botón de Iniciar Sesión eliminado según solicitud */}
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section style={{ padding: '100px 20px', backgroundColor: '#f9fafb' }}>
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <span style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '0.95rem',
                fontWeight: '700',
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}>
                Características principales
              </span>
              <h2 style={{
                fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                fontWeight: '900',
                color: '#1e293b',
                marginTop: '15px',
                marginBottom: '20px',
                letterSpacing: '-0.02em'
              }}>
                Todo lo que necesitas
              </h2>
              <p style={{ fontSize: '1.15rem', color: '#64748b', maxWidth: '600px', margin: '0 auto', lineHeight: '1.7' }}>
                Gestión completa de tu veterinaria en una plataforma moderna
              </p>
            </Col>
          </Row>

          <Row className="g-4">
            {[
              {
                icon: 'fa-paw',
                title: 'Historiales de Mascotas',
                description: 'Registros médicos completos y seguimiento de cada paciente',
                gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)'
              },
              {
                icon: 'fa-calendar-check',
                title: 'Gestión de Citas',
                description: 'Agenda inteligente con recordatorios automáticos',
                gradient: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)'
              },
              {
                icon: 'fa-notes-medical',
                title: 'Historias Clínicas',
                description: 'Diagnósticos, tratamientos y seguimiento médico completo',
                gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
              }
            ].map((feature, index) => (
              <Col lg={4} md={6} key={index}>
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '24px',
                  padding: '45px 35px',
                  height: '100%',
                  textAlign: 'center',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-12px)';
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.boxShadow = '0 20px 40px -12px rgba(59, 130, 246, 0.2)';
                  e.currentTarget.style.borderColor = '#dbeafe';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    background: feature.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 28px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
                  }}>
                    <i className={`fas ${feature.icon}`} style={{ fontSize: '2rem', color: 'white' }}></i>
                  </div>
                  <h4 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#1e293b', marginBottom: '16px', letterSpacing: '-0.01em' }}>
                    {feature.title}
                  </h4>
                  <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.7', margin: 0 }}>
                    {feature.description}
                  </p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Benefits Section */}
      <section style={{ padding: '100px 20px', backgroundColor: 'white', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative gradient blob */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '0',
          width: '300px',
          height: '300px',
          background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
          opacity: '0.06',
          borderRadius: '50%',
          filter: 'blur(60px)',
          transform: 'translateY(-50%)'
        }}></div>
        <Container style={{ position: 'relative', zIndex: 1 }}>
          <Row className="align-items-center" style={{ gap: '60px 0' }}>
            <Col lg={6} className="d-flex align-items-center justify-content-center">
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #10b981 100%)',
                borderRadius: '32px',
                padding: '60px',
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
                maxWidth: '500px',
                minHeight: '380px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.3)'
              }}>
                {/* Animated circles */}
                <div style={{
                  position: 'absolute',
                  top: '-80px',
                  right: '-80px',
                  width: '250px',
                  height: '250px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%'
                }}></div>
                <div style={{
                  position: 'absolute',
                  bottom: '-60px',
                  left: '-60px',
                  width: '200px',
                  height: '200px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  borderRadius: '50%'
                }}></div>
                <i className="fas fa-laptop-medical" style={{ 
                  fontSize: '8rem', 
                  color: 'white',
                  opacity: '0.95',
                  position: 'relative',
                  zIndex: 1,
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))'
                }}></i>
              </div>
            </Col>
            <Col lg={6}>
              <span style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '1rem',
                fontWeight: '700',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '15px'
              }}>
                Ventajas
              </span>
              <h2 style={{
                fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
                fontWeight: '900',
                color: '#1e293b',
                marginBottom: '40px',
                letterSpacing: '-0.02em',
                lineHeight: '1.2'
              }}>
                ¿Por qué elegir Pet-History?
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {[
                  { icon: 'fa-smile-beam', title: 'Fácil de usar', desc: 'Interfaz intuitiva diseñada pensando en veterinarios', color: '#10b981' },
                  { icon: 'fa-shield-alt', title: 'Seguro y confiable', desc: 'Protección de datos con encriptación JWT avanzada', color: '#14b8a6' },
                  { icon: 'fa-headset', title: 'Soporte dedicado', desc: 'Equipo de expertos listo para ayudarte cuando lo necesites', color: '#3b82f6' }
                ].map((benefit, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '24px',
                    padding: '28px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '20px',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    border: '1px solid #e5e7eb',
                    boxShadow: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.transform = 'translateX(12px)';
                    e.currentTarget.style.boxShadow = '0 10px 30px -12px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.borderColor = benefit.color + '40';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '16px',
                      background: `linear-gradient(135deg, ${benefit.color}, ${benefit.color}dd)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: `0 8px 16px ${benefit.color}40`
                    }}>
                      <i className={`fas ${benefit.icon}`} style={{ fontSize: '1.5rem', color: 'white' }}></i>
                    </div>
                    <div style={{ textAlign: 'left', flex: 1 }}>
                      <h5 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px', letterSpacing: '-0.01em' }}>
                        {benefit.title}
                      </h5>
                      <p style={{ color: '#64748b', margin: 0, fontSize: '1rem', lineHeight: '1.6' }}>
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
        background: 'linear-gradient(135deg, #1e293b 0%, #1e40af 100%)',
        padding: '70px 20px 30px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '300px',
          height: '300px',
          background: 'rgba(16, 185, 129, 0.12)',
          borderRadius: '50%',
          filter: 'blur(80px)'
        }}></div>
        <Container style={{ position: 'relative', zIndex: 1 }}>
          <Row style={{ marginBottom: '50px', alignItems: 'flex-start' }}>
            <Col lg={4} md={12} style={{ marginBottom: '40px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <img src={`${process.env.PUBLIC_URL}/Logo.png`} alt="Pet-History" style={{ height: '55px' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.5rem', letterSpacing: '-0.01em' }}>Pet-History</h4>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6', maxWidth: '350px' }}>
                Gestiona la historia clínica de tus pacientes de forma sencilla y eficiente.
              </p>
            </Col>
            <Col lg={4} md={6} style={{ marginBottom: '40px', textAlign: 'center' }}>
              <h5 style={{ fontWeight: '800', marginBottom: '25px', fontSize: '1.2rem', color: 'white' }}>Acceso</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
                <Link to="/login" style={{ 
                  color: '#94a3b8', 
                  textDecoration: 'none', 
                  transition: 'all 0.3s',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#10b981';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#94a3b8';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}>
                  → Iniciar Sesión
                </Link>
              </div>
            </Col>
            <Col lg={4} md={6} style={{ marginBottom: '40px', textAlign: 'center' }}>
              <h5 style={{ fontWeight: '800', marginBottom: '25px', fontSize: '1.2rem', color: 'white' }}>Síguenos</h5>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                {[
                  { name: 'facebook', color: '#1877f2' },
                  { name: 'twitter', color: '#1da1f2' },
                  { name: 'instagram', color: '#e4405f' },
                  { name: 'linkedin', color: '#0077b5' }
                ].map((social, index) => (
                  <a key={index} href="#" style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = social.color;
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                    e.currentTarget.style.boxShadow = `0 10px 25px ${social.color}60`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = '#94a3b8';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <i className={`fab fa-${social.name}`} style={{ fontSize: '1.3rem' }}></i>
                  </a>
                ))}
              </div>
            </Col>
          </Row>
          
          <div style={{ 
            borderTop: '1px solid rgba(148, 163, 184, 0.15)', 
            paddingTop: '35px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>
              © 2025 <strong style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: '800'
              }}>Pet-History</strong>. Todos los derechos reservados. Hecho con 💙 para veterinarios
            </p>
          </div>
        </Container>
      </footer>


    </div>
  );
};

export default Home;