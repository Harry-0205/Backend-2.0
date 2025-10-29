import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Badge,
  InputGroup,
  Spinner
} from 'react-bootstrap';
import { Usuario } from '../types';
import { 
  getAllUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  activateUsuario,
  deactivateUsuario
} from '../services/userService';
import authService from '../services/authService';

const UserManagement: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showActives, setShowActives] = useState<boolean | null>(null);
  const [filterByRole, setFilterByRole] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    documento: '',
    username: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    tipoDocumento: 'CC',
    password: '',
    rol: ''
  });

  useEffect(() => {
    loadUsuarios();
  }, []);

  useEffect(() => {
    filterUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarios, searchTerm, showActives, filterByRole]);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const data = await getAllUsuarios();
      // Información sensible removida de console.log por seguridad
      setUsuarios(Array.isArray(data) ? data : []);
      setError('');
    } catch (error) {
      setError('Error al cargar los usuarios');
      console.error('Error loading usuarios:', error);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para verificar si un usuario tiene rol ADMIN
  const isAdminUser = (usuario: Usuario): boolean => {
    return usuario.roles?.some(role => role === 'ROLE_ADMIN' || role === 'ADMIN') || false;
  };

  // Función para verificar si la recepcionista puede editar este usuario
  const canEdit = (usuario: Usuario): boolean => {
    if (authService.isAdmin()) return true;
    if (authService.isRecepcionista()) {
      return !isAdminUser(usuario); // Recepcionista NO puede editar admins
    }
    return false;
  };

  const filterUsuarios = () => {
    let filtered = usuarios;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.documento.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado activo/inactivo
    if (showActives !== null) {
      filtered = filtered.filter(user => user.activo === showActives);
    }

    // Filtrar por rol
    if (filterByRole) {
      filtered = filtered.filter(user => 
        user.roles && user.roles.some(role => role === filterByRole)
      );
    }

    setFilteredUsuarios(filtered);
  };

  const resetForm = () => {
    setFormData({
      documento: '',
      username: '',
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      direccion: '',
      tipoDocumento: 'CC',
      password: '',
      rol: ''
    });
  };

  const handleShowModal = (mode: 'create' | 'edit' | 'view', usuario?: Usuario) => {
    setModalMode(mode);
    setSelectedUsuario(usuario || null);
    
    if (usuario && (mode === 'edit' || mode === 'view')) {
      setFormData({
        documento: usuario.documento,
        username: usuario.username,
        nombres: usuario.nombres || '',
        apellidos: usuario.apellidos || '',
        email: usuario.email || '',
        telefono: usuario.telefono || '',
        direccion: usuario.direccion || '',
        tipoDocumento: usuario.tipoDocumento || 'CC',
        password: '', // No mostrar password en edición
        rol: usuario.roles && usuario.roles.length > 0 ? usuario.roles[0] : ''
      });
    } else {
      resetForm();
    }
    
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUsuario(null);
    resetForm();
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.documento.trim() || !formData.username.trim()) {
      setError('Documento y usuario son obligatorios');
      return;
    }

    if (modalMode === 'create' && !formData.password) {
      setError('La contraseña es obligatoria para crear un usuario');
      return;
    }

    try {
      setLoading(true);
      
      if (modalMode === 'create') {
        const nuevoUsuario: Usuario = {
          ...formData,
          activo: true,
          roles: formData.rol ? [formData.rol] : []
        };
        await createUsuario(nuevoUsuario);
        setSuccess('Usuario creado exitosamente');
      } else if (modalMode === 'edit' && selectedUsuario) {
        // Preparar el usuario actualizado incluyendo roles
        const usuarioActualizado: Usuario = {
          documento: formData.documento,
          username: formData.username,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          email: formData.email,
          telefono: formData.telefono,
          direccion: formData.direccion,
          activo: selectedUsuario.activo,
          tipoDocumento: selectedUsuario.tipoDocumento || 'CC',
          fechaNacimiento: selectedUsuario.fechaNacimiento,
          // Manejar roles: si se cambió el rol en el formulario, usar nuevo rol, sino mantener el existente
          roles: formData.rol ? [formData.rol] : selectedUsuario.roles,
          // Solo incluir password si se proporcionó una nueva
          ...(formData.password && formData.password.trim() !== '' && { password: formData.password })
        };
        
        await updateUsuario(selectedUsuario.documento, usuarioActualizado);
        setSuccess('Usuario actualizado exitosamente');
      }
      
      await loadUsuarios();
      handleCloseModal();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError('Error al guardar el usuario: ' + (error.response?.data?.message || error.message));
      console.error('Error saving usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivo = async (usuario: Usuario) => {
    const confirmMessage = usuario.activo 
      ? `¿Está seguro de desactivar al usuario "${usuario.username}"?`
      : `¿Está seguro de activar al usuario "${usuario.username}"?`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);
      
      if (usuario.activo) {
        await deactivateUsuario(usuario.documento);
        setSuccess('Usuario desactivado exitosamente');
      } else {
        await activateUsuario(usuario.documento);
        setSuccess('Usuario activado exitosamente');
      }
      
      await loadUsuarios();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError('Error al cambiar el estado del usuario: ' + (error.response?.data?.message || error.message));
      console.error('Error toggling usuario status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (usuario: Usuario) => {
    if (window.confirm(`¿Está seguro de que desea eliminar al usuario "${usuario.username}"?`)) {
      try {
        setLoading(true);
        await deleteUsuario(usuario.documento);
        setSuccess('Usuario eliminado exitosamente');
        await loadUsuarios();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error: any) {
        setError('Error al eliminar el usuario: ' + (error.response?.data?.message || error.message));
        console.error('Error deleting usuario:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getRoleBadgeColor = (rol: string) => {
    // Validar que rol no sea undefined o null
    if (!rol || typeof rol !== 'string') {
      return 'secondary';
    }
    
    // Normalizar rol (quitar ROLE_ si existe)
    const normalizedRole = rol.replace('ROLE_', '');
    switch(normalizedRole) {
      case 'ADMIN': return 'danger';
      case 'VETERINARIO': return 'primary';
      case 'RECEPCIONISTA': return 'info';
      case 'CLIENTE': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRoleDisplayName = (rol: string) => {
    // Validar que rol no sea undefined o null
    if (!rol || typeof rol !== 'string') {
      return 'Sin rol';
    }
    
    // Normalizar rol (quitar ROLE_ si existe)
    const normalizedRole = rol.replace('ROLE_', '');
    switch(normalizedRole) {
      case 'ADMIN': return 'Administrador';
      case 'VETERINARIO': return 'Veterinario';
      case 'RECEPCIONISTA': return 'Recepcionista';
      case 'CLIENTE': return 'Cliente';
      default: return rol;
    }
  };

  const getRoleId = (roleName: string) => {
    switch(roleName) {
      case 'ADMIN': return 1;
      case 'RECEPCIONISTA': return 2;
      case 'VETERINARIO': return 3;
      case 'CLIENTE': return 4;
      default: return 1;
    }
  };

  const getRoleDescription = (roleName: string) => {
    switch(roleName) {
      case 'ADMIN': return 'Administrador del sistema con acceso completo';
      case 'RECEPCIONISTA': return 'Recepcionista con acceso a citas y clientes';
      case 'VETERINARIO': return 'Veterinario con acceso a consultas y historias clínicas';
      case 'CLIENTE': return 'Cliente propietario de mascotas';
      default: return 'Sin descripción';
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Gestión de Usuarios</h4>
              <Button
                variant="primary"
                onClick={() => handleShowModal('create')}
                disabled={loading}
              >
                <i className="fas fa-plus me-2"></i>
                Nuevo Usuario
              </Button>
            </Card.Header>
            
            <Card.Body>
              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
              {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
              
              {/* Filtros */}
              <Row className="mb-3">
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="fas fa-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Buscar por nombre, usuario, email o documento..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={4}>
                  <Form.Select
                    value={showActives === null ? '' : showActives.toString()}
                    onChange={(e) => setShowActives(e.target.value === '' ? null : e.target.value === 'true')}
                  >
                    <option value="">Todos los usuarios</option>
                    <option value="true">Solo activos</option>
                    <option value="false">Solo inactivos</option>
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Select
                    value={filterByRole}
                    onChange={(e) => setFilterByRole(e.target.value)}
                  >
                    <option value="">Todos los roles</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="VETERINARIO">Veterinario</option>
                    <option value="RECEPCIONISTA">Recepcionista</option>
                    <option value="CLIENTE">Cliente</option>
                  </Form.Select>
                </Col>
              </Row>

              {/* Tabla */}
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </Spinner>
                </div>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Documento</th>
                      <th>Usuario</th>
                      <th>Nombre Completo</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsuarios.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          No se encontraron usuarios
                        </td>
                      </tr>
                    ) : (
                      filteredUsuarios.map((usuario) => (
                        <tr key={usuario.documento}>
                          <td>{usuario.documento}</td>
                          <td><strong>{usuario.username}</strong></td>
                          <td>{`${usuario.nombres || ''} ${usuario.apellidos || ''}`}</td>
                          <td>{usuario.email || '-'}</td>
                          <td>{usuario.telefono || '-'}</td>
                          <td>
                            {usuario.roles && Array.isArray(usuario.roles) && usuario.roles.length > 0 ? (
                              usuario.roles.filter(role => role != null).map((role, index) => (
                                <Badge key={index} bg={getRoleBadgeColor(role)} className="me-1">
                                  {getRoleDisplayName(role)}
                                </Badge>
                              ))
                            ) : (
                              <Badge bg="secondary">Sin rol</Badge>
                            )}
                          </td>
                          <td>
                            <Badge bg={usuario.activo ? 'success' : 'danger'}>
                              {usuario.activo ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                size="sm"
                                variant="info"
                                onClick={() => handleShowModal('view', usuario)}
                                title="Ver detalles"
                              >
                                <i className="fas fa-eye"></i>
                              </Button>
                              {canEdit(usuario) && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="warning"
                                    onClick={() => handleShowModal('edit', usuario)}
                                    title="Editar"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={usuario.activo ? 'secondary' : 'success'}
                                    onClick={() => handleToggleActivo(usuario)}
                                    title={usuario.activo ? 'Desactivar' : 'Activar'}
                                  >
                                    <i className={usuario.activo ? 'fas fa-ban' : 'fas fa-check'}></i>
                                  </Button>
                                </>
                              )}
                              {authService.isAdmin() && (
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => handleDelete(usuario)}
                                  title="Eliminar"
                                >
                                  <i className="fas fa-trash"></i>
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

            {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === 'create' && 'Nuevo Usuario'}
            {modalMode === 'edit' && 'Editar Usuario'}
            {modalMode === 'view' && 'Detalles de Usuario'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Documento *</Form.Label>
                  <Form.Control
                    type="text"
                    name="documento"
                    value={formData.documento}
                    onChange={handleInputChange}
                    required
                    disabled={modalMode === 'view' || modalMode === 'edit'}
                  />
                  {modalMode === 'edit' && (
                    <Form.Text className="text-muted">
                      El documento no se puede modificar
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Documento *</Form.Label>
                  <Form.Select
                    name="tipoDocumento"
                    value={formData.tipoDocumento || 'CC'}
                    onChange={handleInputChange}
                    required
                    disabled={modalMode === 'view'}
                  >
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="RC">Registro Civil</option>
                    <option value="PA">Pasaporte</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Usuario *</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    disabled={modalMode === 'view'}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                disabled={modalMode === 'view'}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Rol *</Form.Label>
                  <Form.Select
                    name="rol"
                    value={formData.rol}
                    onChange={handleInputChange}
                    required
                    disabled={modalMode === 'view'}
                  >
                    <option value="">Seleccione un rol</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="VETERINARIO">Veterinario</option>
                    <option value="RECEPCIONISTA">Recepcionista</option>
                    <option value="CLIENTE">Cliente</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                {modalMode !== 'view' && (
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Contraseña {modalMode === 'create' ? '*' : '(opcional)'}
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={modalMode === 'create'}
                      placeholder={modalMode === 'edit' ? 'Dejar vacío para no cambiar' : ''}
                    />
                  </Form.Group>
                )}
              </Col>
            </Row>

            {modalMode === 'view' && selectedUsuario && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Estado</Form.Label>
                    <div>
                      <Badge bg={selectedUsuario.activo ? 'success' : 'danger'} className="fs-6">
                        {selectedUsuario.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </Form.Group>
                </Col>
                {selectedUsuario.fechaRegistro && (
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha de Registro</Form.Label>
                      <Form.Control
                        type="text"
                        value={new Date(selectedUsuario.fechaRegistro).toLocaleDateString()}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                )}
              </Row>
            )}
          </Modal.Body>
          
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              {modalMode === 'view' ? 'Cerrar' : 'Cancelar'}
            </Button>
            {modalMode !== 'view' && (
              <Button variant="primary" type="submit" disabled={loading}>
                {loading && <Spinner animation="border" size="sm" className="me-2" />}
                {modalMode === 'create' ? 'Crear' : 'Actualizar'}
              </Button>
            )}
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default UserManagement;
