import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { 
  FaUsers, 
  FaDog, 
  FaCalendarAlt, 
  FaFileMedicalAlt, 
  FaHospital, 
  FaChartLine,
  FaUserMd,
  FaClipboardList
} from 'react-icons/fa';
import authService from '../services/authService';
import mascotaService from '../services/mascotaService';
import citaService from '../services/citaService';
import historiaClinicaService from '../services/historiaClinicaService';
import { getAllUsuarios } from '../services/userService';
import veterinariaService from '../services/veterinariaService';
import '../styles/Dashboard.css';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, loading }) => {
  return (
    <Card className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
      <Card.Body>
        <div className="stat-card-content">
          <div className="stat-info">
            <p className="stat-title">{title}</p>
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <h2 className="stat-value">{value}</h2>
            )}
          </div>
          <div className="stat-icon" style={{ backgroundColor: `${color}15`, color: color }}>
            {icon}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

const DashboardHome: React.FC = () => {
  const currentUser = authService.getCurrentUser();
  const [stats, setStats] = useState({
    usuarios: 0,
    mascotas: 0,
    citas: 0,
    citasPendientes: 0,
    historias: 0,
    veterinarias: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas según el rol
      const promises: Promise<any>[] = [];

      // Mascotas
      if (authService.isCliente()) {
        promises.push(
          mascotaService.getMascotasByPropietario(currentUser?.documento || '')
            .then(data => ({ mascotas: data.length }))
            .catch(() => ({ mascotas: 0 }))
        );
      } else {
        promises.push(
          mascotaService.getAllMascotas()
            .then(data => ({ mascotas: data.length }))
            .catch(() => ({ mascotas: 0 }))
        );
      }

      // Citas
      promises.push(
        citaService.getAllCitas()
          .then(data => {
            const pendientes = Array.isArray(data) 
              ? data.filter(c => c.estado === 'PROGRAMADA' || c.estado === 'CONFIRMADA').length 
              : 0;
            return { 
              citas: Array.isArray(data) ? data.length : 0,
              citasPendientes: pendientes 
            };
          })
          .catch(() => ({ citas: 0, citasPendientes: 0 }))
      );

      // Historias clínicas
      promises.push(
        historiaClinicaService.getAllHistoriasClinicas()
          .then(data => ({ historias: Array.isArray(data) ? data.length : 0 }))
          .catch(() => ({ historias: 0 }))
      );

      // Usuarios (solo admin y recepcionista)
      if (authService.isAdmin() || authService.isRecepcionista()) {
        promises.push(
          getAllUsuarios()
            .then(data => ({ usuarios: Array.isArray(data) ? data.length : 0 }))
            .catch(() => ({ usuarios: 0 }))
        );
      }

      // Veterinarias (solo admin)
      if (authService.isAdmin()) {
        promises.push(
          veterinariaService.getAllVeterinarias()
            .then(data => ({ veterinarias: Array.isArray(data) ? data.length : 0 }))
            .catch(() => ({ veterinarias: 0 }))
        );
      }

      const results = await Promise.all(promises);
      
      // Combinar resultados
      const newStats = results.reduce((acc, curr) => ({ ...acc, ...curr }), {
        usuarios: 0,
        mascotas: 0,
        citas: 0,
        citasPendientes: 0,
        historias: 0,
        veterinarias: 0,
      });

      setStats(newStats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  const getRoleName = () => {
    if (authService.isAdmin()) return 'Administrador';
    if (authService.isVeterinario()) return 'Veterinario';
    if (authService.isRecepcionista()) return 'Recepcionista';
    if (authService.isCliente()) return 'Cliente';
    return 'Usuario';
  };

  return (
    <div className="dashboard-home">
      {/* Header de bienvenida */}
      <div className="welcome-header">
        <div>
          <h1 className="welcome-title">
            <span>{getGreeting()}, {currentUser?.nombres || currentUser?.username}!</span> <span className="wave-emoji">👋</span>
          </h1>
          <p className="welcome-subtitle">
            Rol: <strong>{getRoleName()}</strong> | {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <Container fluid className="px-0">
        <Row className="g-4">
          {/* Usuarios - Solo Admin y Recepcionista */}
          {(authService.isAdmin() || authService.isRecepcionista()) && (
            <Col xs={12} sm={6} lg={4} xl={3}>
              <StatCard
                title="Usuarios Registrados"
                value={stats.usuarios}
                icon={<FaUsers size={32} />}
                color="#6366f1"
                loading={loading}
              />
            </Col>
          )}

          {/* Mascotas */}
          <Col xs={12} sm={6} lg={4} xl={3}>
            <StatCard
              title={authService.isCliente() ? "Mis Mascotas" : "Mascotas Registradas"}
              value={stats.mascotas}
              icon={<FaDog size={32} />}
              color="#10b981"
              loading={loading}
            />
          </Col>

          {/* Citas Totales */}
          <Col xs={12} sm={6} lg={4} xl={3}>
            <StatCard
              title="Total de Citas"
              value={stats.citas}
              icon={<FaCalendarAlt size={32} />}
              color="#f59e0b"
              loading={loading}
            />
          </Col>

          {/* Citas Pendientes */}
          <Col xs={12} sm={6} lg={4} xl={3}>
            <StatCard
              title="Citas Pendientes"
              value={stats.citasPendientes}
              icon={<FaClipboardList size={32} />}
              color="#ef4444"
              loading={loading}
            />
          </Col>

          {/* Historias Clínicas */}
          <Col xs={12} sm={6} lg={4} xl={3}>
            <StatCard
              title="Historias Clínicas"
              value={stats.historias}
              icon={<FaFileMedicalAlt size={32} />}
              color="#8b5cf6"
              loading={loading}
            />
          </Col>

          {/* Veterinarias - Solo Admin */}
          {authService.isAdmin() && (
            <Col xs={12} sm={6} lg={4} xl={3}>
              <StatCard
                title="Veterinarias"
                value={stats.veterinarias}
                icon={<FaHospital size={32} />}
                color="#06b6d4"
                loading={loading}
              />
            </Col>
          )}
        </Row>

        {/* Información adicional */}
        <Row className="mt-5">
          <Col xs={12}>
            <Card className="info-card">
              <Card.Body>
                <h4 className="mb-3">
                  <FaChartLine className="me-2" />
                  Resumen de Actividad
                </h4>
                <Row>
                  <Col md={6} lg={4} className="mb-3">
                    <div className="info-item">
                      <FaUserMd className="info-icon text-success" size={24} />
                      <div>
                        <p className="mb-0 text-muted small">Estado del Sistema</p>
                        <h5 className="mb-0">Operativo ✓</h5>
                      </div>
                    </div>
                  </Col>
                  <Col md={6} lg={4} className="mb-3">
                    <div className="info-item">
                      <FaCalendarAlt className="info-icon text-warning" size={24} />
                      <div>
                        <p className="mb-0 text-muted small">Próximas Citas</p>
                        <h5 className="mb-0">{stats.citasPendientes} programadas</h5>
                      </div>
                    </div>
                  </Col>
                  <Col md={6} lg={4} className="mb-3">
                    <div className="info-item">
                      <FaDog className="info-icon text-info" size={24} />
                      <div>
                        <p className="mb-0 text-muted small">Mascotas Activas</p>
                        <h5 className="mb-0">{stats.mascotas} registradas</h5>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Mensaje de bienvenida personalizado */}
        <Row className="mt-4">
          <Col xs={12}>
            <Card className="welcome-card">
              <Card.Body>
                <h5>👋 Bienvenido al Sistema de Gestión Veterinaria</h5>
                <p className="mb-0">
                  Utiliza el menú lateral para navegar entre las diferentes secciones del sistema. 
                  {authService.isAdmin() && ' Como administrador, tienes acceso completo a todas las funcionalidades.'}
                  {authService.isVeterinario() && ' Como veterinario, puedes gestionar citas, historias clínicas y mascotas.'}
                  {authService.isRecepcionista() && ' Como recepcionista, puedes gestionar citas, usuarios y mascotas.'}
                  {authService.isCliente() && ' Como cliente, puedes gestionar tus mascotas, citas e historias clínicas.'}
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DashboardHome;
