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
import { Mascota } from '../types';
import mascotaService from '../services/mascotaService';
import { getAllUsuarios } from '../services/userService';
import authService from '../services/authService';
import historiaClinicaService from '../services/historiaClinicaService';

const MascotaManagement: React.FC = () => {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [filteredMascotas, setFilteredMascotas] = useState<Mascota[]>([]);
  const [propietarios, setPropietarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedMascota, setSelectedMascota] = useState<Mascota | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showActives, setShowActives] = useState<boolean | null>(null);
  const [filterByEspecie, setFilterByEspecie] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    especie: '',
    raza: '',
    sexo: '',
    fechaNacimiento: '',
    peso: '',
    color: '',
    observaciones: '',
    propietarioId: ''
  });

  useEffect(() => {
    loadMascotas();
    loadPropietarios();
  }, []);

  useEffect(() => {
    filterMascotas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mascotas, searchTerm, showActives, filterByEspecie]);

  const loadMascotas = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Iniciando carga de mascotas...');
      let data: any;
      
      // Si es cliente, solo cargar sus propias mascotas
      if (authService.isCliente()) {
        const currentUser = authService.getCurrentUser();
        if (currentUser && currentUser.documento) {
          console.log('🐶 Cargando mascotas del cliente:', currentUser.documento);
          data = await mascotaService.getMascotasByPropietario(currentUser.documento);
        } else {
          data = [];
        }
      } else {
        // Admin, Recepcionista y Veterinario ven todas
        console.log('🐶 Cargando todas las mascotas...');
        data = await mascotaService.getAllMascotas();
      }
      
      console.log('📥 Mascotas recibidas:', data);
      console.log('📊 Total de mascotas:', data?.length || 0);
      
      if (data && data.length > 0) {
        console.log('✅ Mascotas cargadas exitosamente');
        setMascotas(Array.isArray(data) ? data : []);
      } else {
        console.warn('⚠️ No se encontraron mascotas');
        setMascotas([]);
        if (!authService.isCliente()) {
          setError('No se encontraron mascotas. Verifica que existan datos en la base de datos.');
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al cargar las mascotas';
      console.error('❌ Error loading mascotas:', error);
      console.error('❌ Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      setError(errorMessage);
      setMascotas([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPropietarios = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      
      // Si es cliente, solo mostrar al usuario actual como propietario
      if (authService.isCliente()) {
        const clienteData = {
          documento: currentUser?.documento || '',
          username: currentUser?.username || '',
          email: currentUser?.email || '',
          nombres: 'Mi',  // Placeholder hasta tener los datos completos
          apellidos: 'Perfil',
          roles: ['CLIENTE']
        };
        setPropietarios([clienteData]);
        return;
      }
      
      // Para admin/recepcionista, cargar todos los usuarios
      const data = await getAllUsuarios();
      // Filtrar solo usuarios con rol CLIENTE
      const clientes = Array.isArray(data) 
        ? data.filter(usuario => 
            usuario.roles?.some(role => role === 'CLIENTE' || role === 'ROLE_CLIENTE')
          )
        : [];
      setPropietarios(clientes);
    } catch (error) {
      console.error('Error loading propietarios:', error);
      // Si hay error y es cliente, al menos mostrar usuario actual
      if (authService.isCliente()) {
        const currentUser = authService.getCurrentUser();
        const clienteData = {
          documento: currentUser?.documento || '',
          username: currentUser?.username || '',
          email: currentUser?.email || '',
          nombres: 'Mi',
          apellidos: 'Perfil',
          roles: ['CLIENTE']
        };
        setPropietarios([clienteData]);
      } else {
        setPropietarios([]);
      }
    }
  };

  const filterMascotas = () => {
    let filtered = mascotas;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(mascota => {
        const propietarioStr = typeof mascota.propietario === 'string' 
          ? mascota.propietario 
          : `${mascota.propietario?.nombres || ''} ${mascota.propietario?.apellidos || ''}`;
        
        return mascota.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mascota.especie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mascota.raza?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          propietarioStr.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Filtrar por estado activo/inactivo
    if (showActives !== null) {
      filtered = filtered.filter(mascota => mascota.activo === showActives);
    }

    // Filtrar por especie
    if (filterByEspecie) {
      filtered = filtered.filter(mascota => 
        mascota.especie?.toLowerCase() === filterByEspecie.toLowerCase()
      );
    }

    // Ordenar por fecha de registro (más recientes primero)
    filtered.sort((a, b) => {
      const fechaA = a.fechaRegistro ? new Date(a.fechaRegistro).getTime() : 0;
      const fechaB = b.fechaRegistro ? new Date(b.fechaRegistro).getTime() : 0;
      return fechaB - fechaA;
    });

    setFilteredMascotas(filtered);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      especie: '',
      raza: '',
      sexo: '',
      fechaNacimiento: '',
      peso: '',
      color: '',
      observaciones: '',
      propietarioId: ''
    });
  };

  const handleShowModal = (mode: 'create' | 'edit' | 'view', mascota?: Mascota) => {
    setModalMode(mode);
    setSelectedMascota(mascota || null);
    
    if (mascota && (mode === 'edit' || mode === 'view')) {
      setFormData({
        nombre: mascota.nombre,
        especie: mascota.especie || '',
        raza: mascota.raza || '',
        sexo: mascota.sexo || '',
        fechaNacimiento: mascota.fechaNacimiento ? 
          new Date(mascota.fechaNacimiento).toISOString().split('T')[0] : '',
        peso: mascota.peso?.toString() || '',
        color: mascota.color || '',
        observaciones: mascota.observaciones || '',
        propietarioId: typeof mascota.propietario === 'string' 
          ? '' 
          : mascota.propietario?.documento || ''
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
    setSelectedMascota(null);
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
    
    if (!formData.nombre.trim() || !formData.especie.trim()) {
      setError('Nombre y especie son obligatorios');
      return;
    }

    if (modalMode === 'create' && !formData.propietarioId) {
      setError('Debe seleccionar un propietario');
      return;
    }

    try {
      setLoading(true);
      
      if (modalMode === 'create') {
        const mascotaData: any = {
          nombre: formData.nombre,
          especie: formData.especie,
          raza: formData.raza || null,
          sexo: formData.sexo || null,
          fechaNacimiento: formData.fechaNacimiento ? 
            new Date(formData.fechaNacimiento + 'T00:00:00').toISOString() : null,
          peso: formData.peso ? parseFloat(formData.peso) : null,
          color: formData.color || null,
          observaciones: formData.observaciones || null,
          propietario: {
            documento: formData.propietarioId
          }
        };
        await mascotaService.createMascota(mascotaData);
        setSuccess('Mascota creada exitosamente');
      } else if (modalMode === 'edit' && selectedMascota) {
        // Para edición, solo enviar los campos editables, SIN el propietario
        const mascotaData: any = {
          nombre: formData.nombre,
          especie: formData.especie,
          raza: formData.raza || null,
          sexo: formData.sexo || null,
          fechaNacimiento: formData.fechaNacimiento ? 
            new Date(formData.fechaNacimiento + 'T00:00:00').toISOString() : null,
          peso: formData.peso ? parseFloat(formData.peso) : null,
          color: formData.color || null,
          observaciones: formData.observaciones || null
          // NO incluir propietario en la edición
        };
        
        await mascotaService.updateMascota(selectedMascota.id, mascotaData);
        setSuccess('Mascota actualizada exitosamente');
      }
      
      await loadMascotas();
      handleCloseModal();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError('Error al guardar la mascota: ' + (error.response?.data?.message || error.message));
      console.error('Error saving mascota:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivo = async (mascota: Mascota) => {
    const confirmMessage = mascota.activo 
      ? `¿Está seguro de desactivar a "${mascota.nombre}"?`
      : `¿Está seguro de activar a "${mascota.nombre}"?`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);
      
      if (mascota.activo) {
        await mascotaService.deactivateMascota(mascota.id);
        setSuccess('Mascota desactivada exitosamente');
      } else {
        await mascotaService.activateMascota(mascota.id);
        setSuccess('Mascota activada exitosamente');
      }
      
      await loadMascotas();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError('Error al cambiar el estado de la mascota: ' + (error.response?.data?.message || error.message));
      console.error('Error toggling mascota status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarHistoriaClinicaPDF = async (mascota: Mascota) => {
    try {
      setLoading(true);
      console.log('Descargando historia clínica completa para mascota:', mascota.nombre, 'ID:', mascota.id);
      
      const pdfBlob = await historiaClinicaService.descargarHistoriaClinicaPdf(mascota.id);
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `historia_clinica_completa_${mascota.nombre}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess(`Historia clínica de ${mascota.nombre} descargada exitosamente`);
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error: any) {
      console.error('Error al descargar historia clínica PDF:', error);
      const errorMsg = error.response?.data?.message || error.response?.data || error.message || 'Error desconocido';
      setError('Error al descargar historia clínica: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (mascota: Mascota) => {
    if (window.confirm(`¿Está seguro de que desea eliminar a "${mascota.nombre}"?`)) {
      try {
        setLoading(true);
        await mascotaService.deleteMascota(mascota.id);
        setSuccess('Mascota eliminada exitosamente');
        await loadMascotas();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error: any) {
        setError('Error al eliminar la mascota: ' + (error.response?.data?.message || error.message));
        console.error('Error deleting mascota:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getEspecieBadgeColor = (especie: string) => {
    switch(especie?.toLowerCase()) {
      case 'perro': return 'primary';
      case 'gato': return 'warning';
      case 'ave': return 'info';
      case 'conejo': return 'secondary';
      case 'hamster': return 'light';
      case 'reptil': return 'success';
      default: return 'secondary';
    }
  };

  const getSexoIcon = (sexo?: string) => {
    if (!sexo) return '-';
    const sexoLower = sexo.toLowerCase();
    switch(sexoLower) {
      case 'm':
      case 'macho':
      case 'masculino':
        return '♂ Macho';
      case 'f':
      case 'hembra':
      case 'femenino':
        return '♀ Hembra';
      default:
        return sexo;
    }
  };

  const calcularEdad = (fechaNacimiento?: string) => {
    if (!fechaNacimiento) return '-';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    const diffTime = Math.abs(hoy.getTime() - nacimiento.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} días`;
    } else if (diffDays < 365) {
      const meses = Math.floor(diffDays / 30);
      return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    } else {
      const años = Math.floor(diffDays / 365);
      const mesesRestantes = Math.floor((diffDays % 365) / 30);
      return `${años} ${años === 1 ? 'año' : 'años'}${mesesRestantes > 0 ? ` y ${mesesRestantes} ${mesesRestantes === 1 ? 'mes' : 'meses'}` : ''}`;
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">{authService.isCliente() ? 'Mis Mascotas' : 'Gestión de Mascotas'}</h4>
              {!authService.isVeterinario() && (
                <Button
                  variant="primary"
                  onClick={() => handleShowModal('create')}
                  disabled={loading}
                >
                  <i className="fas fa-plus me-2"></i>
                  Nueva Mascota
                </Button>
              )}
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
                      placeholder="Buscar por nombre, especie, raza o propietario..."
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
                    <option value="">Todas las mascotas</option>
                    <option value="true">Solo activas</option>
                    <option value="false">Solo inactivas</option>
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Select
                    value={filterByEspecie}
                    onChange={(e) => setFilterByEspecie(e.target.value)}
                  >
                    <option value="">Todas las especies</option>
                    <option value="perro">Perro</option>
                    <option value="gato">Gato</option>
                    <option value="ave">Ave</option>
                    <option value="conejo">Conejo</option>
                    <option value="hamster">Hamster</option>
                    <option value="reptil">Reptil</option>
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
                      <th>Nombre</th>
                      <th>Especie</th>
                      <th>Raza</th>
                      <th>Sexo</th>
                      <th>Edad</th>
                      <th>Peso (kg)</th>
                      <th>Propietario</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMascotas.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-4">
                          No se encontraron mascotas
                        </td>
                      </tr>
                    ) : (
                      filteredMascotas.map((mascota) => (
                        <tr key={mascota.id}>
                          <td><strong>{mascota.nombre}</strong></td>
                          <td>
                            <Badge bg={getEspecieBadgeColor(mascota.especie)}>
                              {mascota.especie}
                            </Badge>
                          </td>
                          <td>{mascota.raza || '-'}</td>
                          <td>{getSexoIcon(mascota.sexo)}</td>
                          <td>{calcularEdad(mascota.fechaNacimiento)}</td>
                          <td>{mascota.peso ? `${mascota.peso} kg` : '-'}</td>
                          <td>
                            {typeof mascota.propietario === 'string'
                              ? mascota.propietario
                              : mascota.propietario 
                                ? `${mascota.propietario.nombres || ''} ${mascota.propietario.apellidos || ''}`
                                : '-'
                            }
                          </td>
                          <td>
                            <Badge bg={mascota.activo ? 'success' : 'danger'}>
                              {mascota.activo ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                size="sm"
                                variant="info"
                                onClick={() => handleShowModal('view', mascota)}
                                title="Ver detalles"
                              >
                                <i className="fas fa-eye"></i>
                              </Button>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleDescargarHistoriaClinicaPDF(mascota)}
                                title="Descargar Historia Clínica Completa en PDF"
                              >
                                <i className="fas fa-file-pdf"></i>
                              </Button>
                              {!authService.isVeterinario() && (
                                <Button
                                  size="sm"
                                  variant="warning"
                                  onClick={() => handleShowModal('edit', mascota)}
                                  title="Editar"
                                >
                                  <i className="fas fa-edit"></i>
                                </Button>
                              )}
                              {(authService.isAdmin() || authService.isRecepcionista()) && (
                                <Button
                                  size="sm"
                                  variant={mascota.activo ? 'secondary' : 'success'}
                                  onClick={() => handleToggleActivo(mascota)}
                                  title={mascota.activo ? 'Desactivar' : 'Activar'}
                                >
                                  <i className={mascota.activo ? 'fas fa-ban' : 'fas fa-check'}></i>
                                </Button>
                              )}
                              {authService.isAdmin() && (
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => handleDelete(mascota)}
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
            {modalMode === 'create' && 'Nueva Mascota'}
            {modalMode === 'edit' && 'Editar Mascota'}
            {modalMode === 'view' && 'Detalles de Mascota'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            
            {/* Sección 1: Información Básica */}
            <Card className="mb-4 border-primary">
              <Card.Header className="bg-primary text-white">
                <h6 className="mb-0">
                  <i className="fas fa-paw me-2"></i>
                  Información Básica de la Mascota
                </h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        required
                        disabled={modalMode === 'view'}
                        placeholder="Ej: Max, Luna, Coco..."
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Especie <span className="text-danger">*</span></Form.Label>
                      {modalMode === 'view' ? (
                        <Form.Control
                          type="text"
                          value={formData.especie || 'No especificada'}
                          disabled
                        />
                      ) : (
                        <Form.Select
                          name="especie"
                          value={formData.especie}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Seleccione una especie</option>
                          <option value="Perro">🐕 Perro</option>
                          <option value="Gato">🐈 Gato</option>
                          <option value="Ave">🦜 Ave</option>
                          <option value="Conejo">🐰 Conejo</option>
                          <option value="Hamster">🐹 Hamster</option>
                          <option value="Reptil">🦎 Reptil</option>
                          <option value="Otro">🐾 Otro</option>
                        </Form.Select>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-0">
                      <Form.Label>Raza</Form.Label>
                      <Form.Control
                        type="text"
                        name="raza"
                        value={formData.raza}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        placeholder="Ej: Labrador, Persa, Mestizo..."
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-0">
                      <Form.Label>Sexo</Form.Label>
                      {modalMode === 'view' ? (
                        <Form.Control
                          type="text"
                          value={formData.sexo ? (formData.sexo === 'Macho' ? 'Macho ♂' : formData.sexo === 'Hembra' ? 'Hembra ♀' : formData.sexo) : 'No especificado'}
                          disabled
                        />
                      ) : (
                        <Form.Select
                          name="sexo"
                          value={formData.sexo}
                          onChange={handleInputChange}
                        >
                          <option value="">Seleccione el sexo</option>
                          <option value="Macho">♂ Macho</option>
                          <option value="Hembra">♀ Hembra</option>
                        </Form.Select>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Sección 2: Características Físicas */}
            <Card className="mb-4 border-success">
              <Card.Header className="bg-success text-white">
                <h6 className="mb-0">
                  <i className="fas fa-ruler-combined me-2"></i>
                  Características Físicas
                </h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha de Nacimiento</Form.Label>
                      <Form.Control
                        type="date"
                        name="fechaNacimiento"
                        value={formData.fechaNacimiento}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        max={new Date().toISOString().split('T')[0]}
                      />
                      {formData.fechaNacimiento && (
                        <Form.Text className="text-muted">
                          <i className="fas fa-birthday-cake me-1"></i>
                          Edad: {calcularEdad(formData.fechaNacimiento)}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Peso (kg)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="peso"
                        value={formData.peso}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        placeholder="0.00"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Color</Form.Label>
                      <Form.Control
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        placeholder="Ej: Café, Negro, Blanco..."
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Sección 3: Propietario */}
            <Card className="mb-4 border-info">
              <Card.Header className="bg-info text-white">
                <h6 className="mb-0">
                  <i className="fas fa-user me-2"></i>
                  Información del Propietario
                </h6>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-0">
                  <Form.Label>Propietario <span className="text-danger">*</span></Form.Label>
                  {modalMode === 'view' ? (
                    <Form.Control
                      type="text"
                      value={
                        propietarios.find(p => p.documento === formData.propietarioId)
                          ? `${propietarios.find(p => p.documento === formData.propietarioId)?.nombres || ''} ${propietarios.find(p => p.documento === formData.propietarioId)?.apellidos || ''} - ${formData.propietarioId}`
                          : formData.propietarioId || 'No especificado'
                      }
                      disabled
                    />
                  ) : (
                    <Form.Select
                      name="propietarioId"
                      value={formData.propietarioId}
                      onChange={handleInputChange}
                      required
                      disabled={authService.isCliente()}
                    >
                      <option value="">Seleccione un propietario</option>
                      {propietarios.map(propietario => (
                        <option key={propietario.documento} value={propietario.documento}>
                          {`${propietario.nombres || ''} ${propietario.apellidos || ''} - ${propietario.documento}`}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                  {authService.isCliente() && modalMode !== 'view' && (
                    <Form.Text className="text-muted">
                      <i className="fas fa-lock me-1"></i>
                      Asignado automáticamente a tu perfil
                    </Form.Text>
                  )}
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Sección 4: Observaciones Médicas */}
            <Card className="mb-0 border-warning">
              <Card.Header className="bg-warning">
                <h6 className="mb-0">
                  <i className="fas fa-notes-medical me-2"></i>
                  Observaciones Médicas
                </h6>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-0">
                  <Form.Label>Observaciones</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    placeholder="Alergias conocidas, enfermedades crónicas, tratamientos especiales, comportamiento, etc."
                  />
                  {modalMode !== 'view' && (
                    <Form.Text className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Información importante que el veterinario debe conocer
                    </Form.Text>
                  )}
                </Form.Group>
              </Card.Body>
            </Card>

            {modalMode === 'view' && selectedMascota && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Estado</Form.Label>
                    <div>
                      <Badge bg={selectedMascota.activo ? 'success' : 'danger'} className="fs-6">
                        {selectedMascota.activo ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                  </Form.Group>
                </Col>
                {selectedMascota.fechaRegistro && (
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha de Registro</Form.Label>
                      <Form.Control
                        type="text"
                        value={new Date(selectedMascota.fechaRegistro).toLocaleDateString()}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                )}
              </Row>
            )}

            {modalMode === 'view' && selectedMascota?.fechaNacimiento && (
              <Row>
                <Col md={12}>
                  <Alert variant="info">
                    <strong>Edad:</strong> {calcularEdad(selectedMascota.fechaNacimiento)}
                  </Alert>
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

export default MascotaManagement;
