import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner
} from 'react-bootstrap';
import { FaUsers, FaChartLine } from 'react-icons/fa';
import authService from '../services/authService';
import { updatePerfil } from '../services/userService';

const UserProfile: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Estados para información básica
  const [profileData, setProfileData] = useState({
    telefono: '',
    direccion: '',
    email: ''
  });

  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setProfileData({
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        email: user.email || ''
      });
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('No se pudo obtener la información del usuario');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Crear objeto de actualización solo con los campos que cambiaron
      const updateData: any = {};
      if (profileData.email && profileData.email !== currentUser.email) {
        updateData.email = profileData.email;
      }
      if (profileData.telefono && profileData.telefono !== currentUser.telefono) {
        updateData.telefono = profileData.telefono;
      }
      if (profileData.direccion && profileData.direccion !== currentUser.direccion) {
        updateData.direccion = profileData.direccion;
      }

      // Verificar si hay cambios
      if (Object.keys(updateData).length === 0) {
        setError('No hay cambios para guardar');
        setLoading(false);
        return;
      }

      console.log('📝 Actualizando perfil del usuario:', currentUser.username);
      const updatedUser = await updatePerfil(updateData);
      
      // Actualizar el usuario en localStorage
      authService.updateCurrentUser({ ...currentUser, ...updatedUser });
      setCurrentUser({ ...currentUser, ...updatedUser });
      
      setSuccess('Perfil actualizado exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      const errorMsg = error.response?.data?.message || error.response?.data || error.message || 'Error al actualizar el perfil';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('No se pudo obtener la información del usuario');
      return;
    }

    // Validaciones
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Todos los campos de contraseña son obligatorios');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('🔒 Cambiando contraseña del usuario:', currentUser.username);
      await updatePerfil({
        passwordActual: passwordData.currentPassword,
        passwordNueva: passwordData.newPassword
      });
      
      setSuccess('Contraseña actualizada exitosamente');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      const errorMsg = error.response?.data?.message || error.response?.data || error.message || 'Error al cambiar la contraseña';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <Container>
        <Alert variant="warning">No se pudo cargar la información del usuario</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">
        <FaUsers className="me-2" />
        Mi Perfil
      </h2>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Row>
        {/* Información del Usuario (Solo lectura) */}
        <Col md={12} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Información Personal</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Documento</Form.Label>
                    <Form.Control
                      type="text"
                      value={currentUser.documento || ''}
                      disabled
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombres</Form.Label>
                    <Form.Control
                      type="text"
                      value={currentUser.nombres || ''}
                      disabled
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Apellidos</Form.Label>
                    <Form.Control
                      type="text"
                      value={currentUser.apellidos || ''}
                      disabled
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Roles</Form.Label>
                    <Form.Control
                      type="text"
                      value={currentUser.roles?.map((r: string) => r.replace('ROLE_', '')).join(', ') || ''}
                      disabled
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Información Editable */}
        <Col md={12} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Información de Contacto</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleUpdateProfile}>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Teléfono</Form.Label>
                      <Form.Control
                        type="tel"
                        name="telefono"
                        value={profileData.telefono}
                        onChange={handleProfileChange}
                        placeholder="Ingrese su teléfono"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Correo Electrónico</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        placeholder="Ingrese su email"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Dirección</Form.Label>
                      <Form.Control
                        type="text"
                        name="direccion"
                        value={profileData.direccion}
                        onChange={handleProfileChange}
                        placeholder="Ingrese su dirección"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex justify-content-end">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Guardando...
                      </>
                    ) : (
                      <>
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Cambio de Contraseña */}
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FaChartLine className="me-2" />
                Cambiar Contraseña
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleChangePassword}>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Contraseña Actual *</Form.Label>
                      <Form.Control
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Ingrese su contraseña actual"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nueva Contraseña *</Form.Label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Ingrese su nueva contraseña"
                        required
                        minLength={6}
                      />
                      <Form.Text className="text-muted">
                        Mínimo 6 caracteres
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirmar Nueva Contraseña *</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirme su nueva contraseña"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex justify-content-end">
                  <Button
                    type="submit"
                    variant="warning"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <FaChartLine className="me-2" />
                        Cambiar Contraseña
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfile;
