import React from 'react';
import UserManagement from '../components/UserManagement';
import VeterinariaManagement from '../components/VeterinariaManagement';
import MascotaManagement from '../components/MascotaManagement';
import CitaManagement from '../components/CitaManagement';
import HistoriaClinicaManagement from '../components/HistoriaClinicaManagement';
import ReporteManagement from '../components/ReporteManagement';
import { Container, Row, Col, Card, Badge, Nav } from 'react-bootstrap';
import authService from '../services/authService';

const Dashboard: React.FC = () => {
  const currentUser = authService.getCurrentUser();
  const [activeTab, setActiveTab] = React.useState('usuarios');
  
  // Debug: Ver qué hay en currentUser
  React.useEffect(() => {
    console.log('🔍 DEBUG Dashboard - currentUser:', currentUser);
    console.log('🔍 DEBUG Dashboard - roles:', currentUser?.roles);
    console.log('🔍 DEBUG Dashboard - localStorage:', localStorage.getItem('user'));
  }, [currentUser]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'danger';
      case 'ROLE_VETERINARIO': return 'success';
      case 'ROLE_RECEPCIONISTA': return 'warning';
      case 'ROLE_CLIENTE': return 'info';
      default: return 'secondary';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'Administrador';
      case 'ROLE_VETERINARIO': return 'Veterinario';
      case 'ROLE_RECEPCIONISTA': return 'Recepcionista';
      case 'ROLE_CLIENTE': return 'Cliente';
      default: return role;
    }
  };

  const AdminPanel: React.FC = () => {
    return (
      <Row className="mb-4">
        <Col>
          <h3>Panel de Administrador</h3>
          <Card>
            <Card.Header>
              <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'usuarios')}>
                <Nav.Item>
                  <Nav.Link eventKey="usuarios">Gestión de Usuarios</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="veterinarias">Gestión de Veterinarias</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="mascotas">Gestión de Mascotas</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="citas">Gestión de Citas</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="historias">Historias Clínicas</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="reportes">Reportes</Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
              {activeTab === 'usuarios' && <UserManagement />}
              {activeTab === 'veterinarias' && <VeterinariaManagement />}
              {activeTab === 'mascotas' && <MascotaManagement />}
              {activeTab === 'citas' && <CitaManagement />}
              {activeTab === 'historias' && <HistoriaClinicaManagement />}
              {activeTab === 'reportes' && <ReporteManagement />}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h1 className="mb-4">Dashboard</h1>
          
          <Card className="mb-4">
            <Card.Body>
              <h5>Bienvenido, {currentUser?.username}!</h5>
              <p className="text-muted mb-2">Documento: {currentUser?.documento}</p>
              <p className="text-muted mb-3">Email: {currentUser?.email}</p>
              
              <div>
                <strong>Roles:</strong>{' '}
                {currentUser?.roles.map((role, index) => (
                  <Badge 
                    key={index} 
                    bg={getRoleColor(role)} 
                    className="me-2"
                  >
                    {getRoleName(role)}
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Admin Panel */}
          {authService.isAdmin() && (
            <AdminPanel />
          )}

          {/* Veterinario Panel */}
          {authService.isVeterinario() && (
            <Row className="mb-4">
              <Col>
                <h3>Panel de Veterinario</h3>
                <Card>
                  <Card.Header>
                    <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'citas')}>
                      <Nav.Item>
                        <Nav.Link eventKey="citas">Gestión de Citas</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="historias">Historias Clínicas</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="mascotas">Mascotas</Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Card.Header>
                  <Card.Body>
                    {activeTab === 'citas' && <CitaManagement />}
                    {activeTab === 'historias' && <HistoriaClinicaManagement />}
                    {activeTab === 'mascotas' && <MascotaManagement />}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Recepcionista Panel */}
          {authService.isRecepcionista() && (
            <Row className="mb-4">
              <Col>
                <h3>Panel de Recepcionista</h3>
                <Card>
                  <Card.Header>
                    <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'citas')}>
                      <Nav.Item>
                        <Nav.Link eventKey="citas">Gestión de Citas</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="usuarios">Gestión de Usuarios</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="mascotas">Gestión de Mascotas</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="historias">Historias Clínicas</Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Card.Header>
                  <Card.Body>
                    {activeTab === 'citas' && <CitaManagement />}
                    {activeTab === 'usuarios' && <UserManagement />}
                    {activeTab === 'mascotas' && <MascotaManagement />}
                    {activeTab === 'historias' && <HistoriaClinicaManagement />}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Cliente Panel */}
          {authService.isCliente() && (
            <Row className="mb-4">
              <Col>
                <h3>Panel de Cliente</h3>
                <Card>
                  <Card.Header>
                    <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'mascotas')}>
                      <Nav.Item>
                        <Nav.Link eventKey="mascotas">Mis Mascotas</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="citas">Mis Citas</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="historias">Historias Clínicas</Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Card.Header>
                  <Card.Body>
                    {activeTab === 'mascotas' && <MascotaManagement />}
                    {activeTab === 'citas' && <CitaManagement />}
                    {activeTab === 'historias' && <HistoriaClinicaManagement />}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;