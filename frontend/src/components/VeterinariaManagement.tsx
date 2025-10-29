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
import { Veterinaria } from '../types';
import veterinariaService from '../services/veterinariaService';

const VeterinariaManagement: React.FC = () => {
  const [veterinarias, setVeterinarias] = useState<Veterinaria[]>([]);
  const [filteredVeterinarias, setFilteredVeterinarias] = useState<Veterinaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedVeterinaria, setSelectedVeterinaria] = useState<Veterinaria | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showActives, setShowActives] = useState<boolean | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    ciudad: '',
    descripcion: '',
    servicios: '',
    horarioAtencion: ''
  });

  useEffect(() => {
    loadVeterinarias();
  }, []);

  useEffect(() => {
    filterVeterinarias();
  }, [veterinarias, searchTerm, showActives]);

  const loadVeterinarias = async () => {
    try {
      setLoading(true);
      const data = await veterinariaService.getAllVeterinarias();
      setVeterinarias(Array.isArray(data) ? data : []);
      setError('');
    } catch (error) {
      setError('Error al cargar las veterinarias');
      console.error('Error loading veterinarias:', error);
      setVeterinarias([]);
    } finally {
      setLoading(false);
    }
  };

  const filterVeterinarias = () => {
    if (!Array.isArray(veterinarias)) {
      console.error('veterinarias no es un array:', veterinarias);
      setFilteredVeterinarias([]);
      return;
    }
    
    let filtered = [...veterinarias];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(vet =>
        vet.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vet.ciudad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vet.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado activo/inactivo
    if (showActives !== null) {
      filtered = filtered.filter(vet => vet.activo === showActives);
    }

    setFilteredVeterinarias(filtered);
  };

  const resetForm = () => {
    setFormData({
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

  const handleShowModal = (mode: 'create' | 'edit' | 'view', veterinaria?: Veterinaria) => {
    setModalMode(mode);
    setSelectedVeterinaria(veterinaria || null);
    
    if (veterinaria && (mode === 'edit' || mode === 'view')) {
      setFormData({
        nombre: veterinaria.nombre,
        direccion: veterinaria.direccion || '',
        telefono: veterinaria.telefono || '',
        email: veterinaria.email || '',
        ciudad: veterinaria.ciudad || '',
        descripcion: veterinaria.descripcion || '',
        servicios: veterinaria.servicios || '',
        horarioAtencion: veterinaria.horarioAtencion || ''
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
    setSelectedVeterinaria(null);
    resetForm();
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    try {
      setLoading(true);
      
      if (modalMode === 'create') {
        await veterinariaService.createVeterinaria(formData);
        setSuccess('Veterinaria creada exitosamente');
      } else if (modalMode === 'edit' && selectedVeterinaria) {
        await veterinariaService.updateVeterinaria(selectedVeterinaria.id, formData);
        setSuccess('Veterinaria actualizada exitosamente');
      }
      
      await loadVeterinarias();
      handleCloseModal();
    } catch (error) {
      setError('Error al guardar la veterinaria');
      console.error('Error saving veterinaria:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivo = async (veterinaria: Veterinaria) => {
    try {
      setLoading(true);
      
      if (veterinaria.activo) {
        await veterinariaService.desactivarVeterinaria(veterinaria.id);
        setSuccess('Veterinaria desactivada exitosamente');
      } else {
        await veterinariaService.activarVeterinaria(veterinaria.id);
        setSuccess('Veterinaria activada exitosamente');
      }
      
      await loadVeterinarias();
    } catch (error) {
      setError('Error al cambiar el estado de la veterinaria');
      console.error('Error toggling veterinaria status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (veterinaria: Veterinaria) => {
    if (window.confirm(`¿Está seguro de que desea eliminar la veterinaria "${veterinaria.nombre}"?`)) {
      try {
        setLoading(true);
        await veterinariaService.deleteVeterinaria(veterinaria.id);
        setSuccess('Veterinaria eliminada exitosamente');
        await loadVeterinarias();
      } catch (error) {
        setError('Error al eliminar la veterinaria');
        console.error('Error deleting veterinaria:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Gestión de Veterinarias</h4>
              <Button
                variant="primary"
                onClick={() => handleShowModal('create')}
                disabled={loading}
              >
                <i className="fas fa-plus me-2"></i>
                Nueva Veterinaria
              </Button>
            </Card.Header>
            
            <Card.Body>
              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
              {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
              
              {/* Filtros */}
              <Row className="mb-3">
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="fas fa-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Buscar por nombre, ciudad o email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={6}>
                  <Form.Select
                    value={showActives === null ? '' : showActives.toString()}
                    onChange={(e) => setShowActives(e.target.value === '' ? null : e.target.value === 'true')}
                  >
                    <option value="">Todas las veterinarias</option>
                    <option value="true">Solo activas</option>
                    <option value="false">Solo inactivas</option>
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
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Ciudad</th>
                      <th>Teléfono</th>
                      <th>Email</th>
                      <th>Estado</th>
                      <th>Fecha Registro</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVeterinarias.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          No se encontraron veterinarias
                        </td>
                      </tr>
                    ) : (
                      filteredVeterinarias.map((veterinaria) => (
                        <tr key={veterinaria.id}>
                          <td>{veterinaria.id}</td>
                          <td>{veterinaria.nombre}</td>
                          <td>{veterinaria.ciudad || '-'}</td>
                          <td>{veterinaria.telefono || '-'}</td>
                          <td>{veterinaria.email || '-'}</td>
                          <td>
                            <Badge bg={veterinaria.activo ? 'success' : 'danger'}>
                              {veterinaria.activo ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </td>
                          <td>{new Date(veterinaria.fechaRegistro).toLocaleDateString()}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                size="sm"
                                variant="info"
                                onClick={() => handleShowModal('view', veterinaria)}
                              >
                                <i className="fas fa-eye"></i>
                              </Button>
                              <Button
                                size="sm"
                                variant="warning"
                                onClick={() => handleShowModal('edit', veterinaria)}
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                              <Button
                                size="sm"
                                variant={veterinaria.activo ? 'secondary' : 'success'}
                                onClick={() => handleToggleActivo(veterinaria)}
                              >
                                <i className={veterinaria.activo ? 'fas fa-ban' : 'fas fa-check'}></i>
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleDelete(veterinaria)}
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
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
            {modalMode === 'create' && 'Nueva Veterinaria'}
            {modalMode === 'edit' && 'Editar Veterinaria'}
            {modalMode === 'view' && 'Detalles de Veterinaria'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    disabled={modalMode === 'view'}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ciudad</Form.Label>
                  <Form.Control
                    type="text"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
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

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                disabled={modalMode === 'view'}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Servicios</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="servicios"
                value={formData.servicios}
                onChange={handleInputChange}
                placeholder="Ej: Consulta general, Vacunación, Cirugías, Emergencias..."
                disabled={modalMode === 'view'}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Horario de Atención</Form.Label>
              <Form.Control
                type="text"
                name="horarioAtencion"
                value={formData.horarioAtencion}
                onChange={handleInputChange}
                placeholder="Ej: Lunes a Viernes 8:00 AM - 6:00 PM"
                disabled={modalMode === 'view'}
              />
            </Form.Group>

            {modalMode === 'view' && selectedVeterinaria && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Estado</Form.Label>
                    <div>
                      <Badge bg={selectedVeterinaria.activo ? 'success' : 'danger'} className="fs-6">
                        {selectedVeterinaria.activo ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha de Registro</Form.Label>
                    <Form.Control
                      type="text"
                      value={new Date(selectedVeterinaria.fechaRegistro).toLocaleDateString()}
                      disabled
                    />
                  </Form.Group>
                </Col>
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

export default VeterinariaManagement;
