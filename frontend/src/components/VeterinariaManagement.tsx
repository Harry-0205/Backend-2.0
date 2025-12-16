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
import SearchableSelect from './SearchableSelect';

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

  // Estados para selector de horarios
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([]);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  useEffect(() => {
    loadVeterinarias();
  }, []);

  useEffect(() => {
    filterVeterinarias();
  }, [veterinarias, searchTerm, showActives]);

  const loadVeterinarias = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Iniciando carga de veterinarias...');
      const data = await veterinariaService.getAllVeterinarias();
      console.log('📥 Veterinarias recibidas:', data);
      console.log('📊 Total de veterinarias:', data?.length || 0);
      
      if (data && data.length > 0) {
        console.log('✅ Veterinarias cargadas exitosamente');
        setVeterinarias(Array.isArray(data) ? data : []);
      } else {
        console.warn('⚠️ No se encontraron veterinarias en la respuesta');
        setVeterinarias([]);
        // No mostrar error, el componente mostrará el formulario de creación
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al cargar las veterinarias';
      console.error('❌ Error loading veterinarias:', error);
      console.error('❌ Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // No mostrar error si no hay veterinarias, mostrar formulario de creación
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

    // Ordenar por fecha de registro (más recientes primero)
    filtered.sort((a, b) => {
      const fechaA = a.fechaRegistro ? new Date(a.fechaRegistro).getTime() : 0;
      const fechaB = b.fechaRegistro ? new Date(b.fechaRegistro).getTime() : 0;
      return fechaB - fechaA;
    });

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
    setDiasSeleccionados([]);
    setHoraInicio('');
    setHoraFin('');
  };

  const handleDiaToggle = (dia: string) => {
    setDiasSeleccionados(prev => {
      if (prev.includes(dia)) {
        return prev.filter(d => d !== dia);
      } else {
        return [...prev, dia];
      }
    });
  };

  const parseHorarioAtencion = (horario: string) => {
    // Extraer días y horas del texto del horario
    try {
      // Ejemplo: "Lunes a Viernes: 8:00 AM - 6:00 PM"
      const dias: string[] = [];
      const horaMatch = horario.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/);
      
      if (horario.toLowerCase().includes('lunes a viernes')) {
        dias.push('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes');
      } else if (horario.toLowerCase().includes('todos los días')) {
        dias.push(...diasSemana);
      } else {
        diasSemana.forEach(dia => {
          if (horario.includes(dia)) {
            dias.push(dia);
          }
        });
      }
      
      if (horaMatch) {
        const horaInicioNum = parseInt(horaMatch[1]);
        const minInicioNum = horaMatch[2];
        const ampmInicio = horaMatch[3];
        const horaFinNum = parseInt(horaMatch[4]);
        const minFinNum = horaMatch[5];
        const ampmFin = horaMatch[6];
        
        const convertTo24 = (hora: number, min: string, ampm: string) => {
          let h = hora;
          if (ampm === 'PM' && h !== 12) h += 12;
          if (ampm === 'AM' && h === 12) h = 0;
          return `${h.toString().padStart(2, '0')}:${min}`;
        };
        
        setHoraInicio(convertTo24(horaInicioNum, minInicioNum, ampmInicio));
        setHoraFin(convertTo24(horaFinNum, minFinNum, ampmFin));
      }
      
      setDiasSeleccionados(dias);
    } catch (error) {
      console.error('Error parsing horario:', error);
    }
  };

  const generarHorarioTexto = (): string => {
    if (diasSeleccionados.length === 0 || !horaInicio || !horaFin) {
      return '';
    }

    const formatHora = (hora: string) => {
      const [h, m] = hora.split(':');
      const hour = parseInt(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${m} ${ampm}`;
    };

    const diasOrdenados = diasSemana.filter(dia => diasSeleccionados.includes(dia));
    
    if (diasOrdenados.length === 7) {
      return `Todos los días: ${formatHora(horaInicio)} - ${formatHora(horaFin)}`;
    } else if (diasOrdenados.length === 5 && 
               diasOrdenados.every(dia => ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].includes(dia))) {
      return `Lunes a Viernes: ${formatHora(horaInicio)} - ${formatHora(horaFin)}`;
    } else if (diasOrdenados.length === 2 && 
               diasOrdenados.includes('Sábado') && diasOrdenados.includes('Domingo')) {
      return `Sábados y Domingos: ${formatHora(horaInicio)} - ${formatHora(horaFin)}`;
    } else {
      const diasTexto = diasOrdenados.join(', ');
      return `${diasTexto}: ${formatHora(horaInicio)} - ${formatHora(horaFin)}`;
    }
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
      // Parsear horario para poblar selectores
      if (veterinaria.horarioAtencion) {
        parseHorarioAtencion(veterinaria.horarioAtencion);
      }
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

    // Validar días y horarios
    if (diasSeleccionados.length === 0) {
      setError('Debe seleccionar al menos un día de atención');
      return;
    }

    if (!horaInicio || !horaFin) {
      setError('Debe especificar la hora de inicio y fin de atención');
      return;
    }

    try {
      setLoading(true);
      
      // Generar horario de atención a partir de los selectores
      const horarioGenerado = generarHorarioTexto();
      const dataToSend = {
        ...formData,
        horarioAtencion: horarioGenerado
      };
      
      if (modalMode === 'create') {
        await veterinariaService.createVeterinaria(dataToSend);
        setSuccess('Veterinaria creada exitosamente');
      } else if (modalMode === 'edit' && selectedVeterinaria) {
        await veterinariaService.updateVeterinaria(selectedVeterinaria.id, dataToSend);
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
              {veterinarias.length > 0 && (
                <Button
                  variant="primary"
                  onClick={() => handleShowModal('create')}
                  disabled={loading}
                >
                  <i className="fas fa-plus me-2"></i>
                  Nueva Veterinaria
                </Button>
              )}
            </Card.Header>
            
            <Card.Body>
              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
              {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
              
              {/* Filtros */}
              <Row className="mb-3">
                <Col md={5}>
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
                <Col md={5}>
                  <SearchableSelect
                    options={[
                      { value: '', label: 'Todas las veterinarias' },
                      { value: 'true', label: 'Solo activas' },
                      { value: 'false', label: 'Solo inactivas' }
                    ]}
                    value={showActives === null ? '' : showActives.toString()}
                    onChange={(value) => setShowActives(value === '' ? null : value === 'true')}
                    placeholder="Todas las veterinarias"
                  />
                </Col>
                <Col md={2}>
                  <Button
                    variant="outline-secondary"
                    className="w-100"
                    onClick={() => {
                      setSearchTerm('');
                      setShowActives(null);
                    }}
                    title="Limpiar filtros"
                  >
                    <i className="fas fa-eraser me-2"></i>
                    Limpiar
                  </Button>
                </Col>
              </Row>

              {/* Tabla */}
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Cargando...</span>
                  </Spinner>
                  <p className="mt-3 text-muted">Cargando veterinarias...</p>
                </div>
              ) : filteredVeterinarias.length === 0 ? (
                veterinarias.length === 0 ? (
                  // Mostrar formulario de creación si no hay veterinarias
                  <div>
                    <Alert variant="info" className="mb-4">
                      <h5><i className="fas fa-hospital me-2"></i>¡Bienvenido!</h5>
                      <p className="mb-0">No tienes ninguna veterinaria registrada. Completa el siguiente formulario para crear tu primera veterinaria.</p>
                    </Alert>
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-100"
                      onClick={() => handleShowModal('create')}
                    >
                      <i className="fas fa-plus me-2"></i>
                      Crear Mi Veterinaria
                    </Button>
                  </div>
                ) : (
                  // Mostrar mensaje de "no se encontraron resultados" si hay veterinarias pero no coinciden con los filtros
                  <div className="text-center py-5">
                    <i className="fas fa-search fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No se encontraron resultados</h5>
                    <p className="text-muted">
                      No hay veterinarias que coincidan con los filtros aplicados
                    </p>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => {
                        setSearchTerm('');
                        setShowActives(null);
                      }}
                    >
                      <i className="fas fa-redo me-2"></i>
                      Limpiar Filtros
                    </Button>
                  </div>
                )
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
                    {filteredVeterinarias.map((veterinaria) => (
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
                    }
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
            
            {/* Sección 1: Información Básica */}
            <Card className="mb-4 border-primary">
              <Card.Header className="bg-primary text-white">
                <h6 className="mb-0">
                  <i className="fas fa-hospital-alt me-2"></i>
                  Paso 1: Información Básica de la Veterinaria
                </h6>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre de la Veterinaria *</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    disabled={modalMode === 'view'}
                    placeholder="Ej: Clínica Veterinaria Los Amigos"
                  />
                  {modalMode !== 'view' && (
                    <Form.Text className="text-muted">
                      <i className="fas fa-asterisk me-1"></i>
                      Campo obligatorio - Nombre comercial de la veterinaria
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-0">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    placeholder="Breve descripción de la veterinaria, especialidades, años de experiencia..."
                  />
                  {modalMode !== 'view' && (
                    <Form.Text className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Información general sobre su veterinaria
                    </Form.Text>
                  )}
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Sección 2: Contacto y Ubicación */}
            <Card className="mb-4 border-success">
              <Card.Header className="bg-success text-white">
                <h6 className="mb-0">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Paso 2: Contacto y Ubicación
                </h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Teléfono</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <i className="fas fa-phone"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="tel"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          disabled={modalMode === 'view'}
                          placeholder="Ej: +57 301 234 5678"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <i className="fas fa-envelope"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={modalMode === 'view'}
                          placeholder="contacto@veterinaria.com"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Ciudad</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="fas fa-city"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      placeholder="Ej: Bogotá, Medellín, Cali..."
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-0">
                  <Form.Label>Dirección Completa</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    placeholder="Calle, número, barrio, referencias..."
                  />
                  {modalMode !== 'view' && (
                    <Form.Text className="text-muted">
                      <i className="fas fa-location-arrow me-1"></i>
                      Dirección física completa del establecimiento
                    </Form.Text>
                  )}
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Sección 3: Servicios y Horarios */}
            <Card className="mb-4 border-info">
              <Card.Header className="bg-info text-white">
                <h6 className="mb-0">
                  <i className="fas fa-briefcase-medical me-2"></i>
                  Paso 3: Servicios y Horarios de Atención
                </h6>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Servicios Ofrecidos</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="servicios"
                    value={formData.servicios}
                    onChange={handleInputChange}
                    placeholder="Ej: Consulta general, Vacunación, Cirugías, Urgencias 24/7, Peluquería, Hospitalización..."
                    disabled={modalMode === 'view'}
                  />
                  {modalMode !== 'view' && (
                    <Form.Text className="text-muted">
                      <i className="fas fa-list-ul me-1"></i>
                      Liste todos los servicios veterinarios disponibles
                    </Form.Text>
                  )}
                </Form.Group>

                {modalMode === 'view' ? (
                  <Form.Group className="mb-0">
                    <Form.Label>Horario de Atención</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <i className="fas fa-clock"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        value={formData.horarioAtencion}
                        disabled
                      />
                    </InputGroup>
                  </Form.Group>
                ) : (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="fas fa-calendar-check me-2"></i>
                        Días de Atención *
                      </Form.Label>
                      <div className="d-flex flex-wrap gap-2">
                        {diasSemana.map((dia) => (
                          <Button
                            key={dia}
                            variant={diasSeleccionados.includes(dia) ? 'primary' : 'outline-primary'}
                            size="sm"
                            onClick={() => handleDiaToggle(dia)}
                            type="button"
                            style={{ minWidth: '90px' }}
                          >
                            {dia}
                          </Button>
                        ))}
                      </div>
                      <Form.Text className="text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        Seleccione los días en que la veterinaria está abierta
                      </Form.Text>
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <i className="fas fa-clock me-2"></i>
                            Hora de Apertura *
                          </Form.Label>
                          <Form.Control
                            type="time"
                            value={horaInicio}
                            onChange={(e) => setHoraInicio(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <i className="fas fa-clock me-2"></i>
                            Hora de Cierre *
                          </Form.Label>
                          <Form.Control
                            type="time"
                            value={horaFin}
                            onChange={(e) => setHoraFin(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {diasSeleccionados.length > 0 && horaInicio && horaFin && (
                      <Alert variant="secondary" className="mb-0">
                        <i className="fas fa-info-circle me-2"></i>
                        <strong>Vista previa del horario:</strong> {generarHorarioTexto()}
                      </Alert>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>

            {/* Sección 4: Información del Sistema */}
            {modalMode === 'view' && selectedVeterinaria && (
              <Card className="mb-0 border-warning">
                <Card.Header className="bg-warning text-dark">
                  <h6 className="mb-0">
                    <i className="fas fa-info-circle me-2"></i>
                    Información del Sistema
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-0">
                        <Form.Label>Estado Actual</Form.Label>
                        <div>
                          <Badge bg={selectedVeterinaria.activo ? 'success' : 'danger'} className="fs-6">
                            <i className={`fas ${selectedVeterinaria.activo ? 'fa-check-circle' : 'fa-times-circle'} me-1`}></i>
                            {selectedVeterinaria.activo ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-0">
                        <Form.Label>Fecha de Registro</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <i className="fas fa-calendar"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            value={new Date(selectedVeterinaria.fechaRegistro).toLocaleDateString('es-CO', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                            disabled
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
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
