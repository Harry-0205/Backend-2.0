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
import { Cita, EstadoCita } from '../types';
import citaService from '../services/citaService';
import mascotaService from '../services/mascotaService';
import { getAllUsuarios, getVeterinarios, getVeterinariosByVeterinaria } from '../services/userService';
import { getAllVeterinarias } from '../services/veterinariaService';
import authService from '../services/authService';

const CitaManagement: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [filteredCitas, setFilteredCitas] = useState<Cita[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [veterinarios, setVeterinarios] = useState<any[]>([]);
  const [filteredVeterinarios, setFilteredVeterinarios] = useState<any[]>([]);
  const [mascotas, setMascotas] = useState<any[]>([]);
  const [veterinarias, setVeterinarias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByEstado, setFilterByEstado] = useState<string>('');
  const [filterByFecha, setFilterByFecha] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    fechaHora: '',
    motivo: '',
    observaciones: '',
    clienteId: '',
    mascotaId: '',
    veterinarioId: '',
    veterinariaId: ''
  });

  useEffect(() => {
    loadCitas();
    loadClientes();
    loadVeterinarios();
    loadMascotas();
    loadVeterinarias();
  }, []);

  useEffect(() => {
    filterCitas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [citas, searchTerm, filterByEstado, filterByFecha]);

  const loadCitas = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Iniciando carga de citas...');
      let data: any;
      
      // Si es cliente, solo cargar sus propias citas
      if (authService.isCliente()) {
        const currentUser = authService.getCurrentUser();
        if (currentUser && currentUser.documento) {
          console.log('📅 Cargando citas del cliente:', currentUser.documento);
          data = await citaService.getCitasByCliente(currentUser.documento);
        } else {
          data = [];
        }
      } else {
        // Otros roles ven todas las citas
        console.log('📅 Cargando todas las citas...');
        data = await citaService.getAllCitas();
      }
      
      console.log('📥 Citas recibidas:', data);
      console.log('📊 Total de citas:', data?.length || 0);
      
      if (data && data.length > 0) {
        console.log('✅ Citas cargadas exitosamente');
        setCitas(Array.isArray(data) ? data : []);
      } else {
        console.warn('⚠️ No se encontraron citas');
        setCitas([]);
        if (!authService.isCliente()) {
          setError('No se encontraron citas. Verifica que existan datos en la base de datos.');
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al cargar las citas';
      console.error('❌ Error loading citas:', error);
      console.error('❌ Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      setError(errorMessage);
      setCitas([]);
    } finally {
      setLoading(false);
    }
  };

  const loadClientes = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      
      // Si es cliente, solo mostrar al usuario actual
      if (authService.isCliente()) {
        const clienteData = {
          documento: currentUser?.documento || '',
          username: currentUser?.username || '',
          email: currentUser?.email || '',
          nombres: 'Mi',
          apellidos: 'Perfil',
          roles: ['CLIENTE']
        };
        setClientes([clienteData]);
        return;
      }
      
      // Para otros roles, cargar todos los usuarios
      const data = await getAllUsuarios();
      const clientesList = Array.isArray(data) 
        ? data.filter(usuario => 
            usuario.roles?.some(role => role === 'CLIENTE' || role === 'ROLE_CLIENTE')
          )
        : [];
      setClientes(clientesList);
    } catch (error) {
      console.error('Error loading clientes:', error);
      // Si es cliente y hay error, mostrar usuario actual
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
        setClientes([clienteData]);
      } else {
        setClientes([]);
      }
    }
  };

  const loadVeterinarios = async () => {
    try {
      console.log('🔄 Cargando veterinarios...');
      console.log('🔑 Usuario actual:', authService.getCurrentUser());
      
      // Usar el nuevo endpoint específico para veterinarios
      const veterinariosList = await getVeterinarios();
      console.log('✅ Veterinarios obtenidos:', veterinariosList);
      console.log('📊 Cantidad de veterinarios:', veterinariosList?.length || 0);
      
      setVeterinarios(Array.isArray(veterinariosList) ? veterinariosList : []);
    } catch (error: any) {
      console.error('❌ Error loading veterinarios:', error);
      console.error('❌ Error completo:', error.response || error);
      setVeterinarios([]);
    }
  };

  const loadMascotas = async () => {
    try {
      let data: any;
      
      // Si es cliente, solo cargar sus propias mascotas
      if (authService.isCliente()) {
        const currentUser = authService.getCurrentUser();
        if (currentUser && currentUser.documento) {
          data = await mascotaService.getActiveMascotasByPropietario(currentUser.documento);
        } else {
          data = [];
        }
      } else {
        // Otros roles ven todas las mascotas activas
        data = await mascotaService.getActiveMascotas();
      }
      
      setMascotas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading mascotas:', error);
      setMascotas([]);
    }
  };

  const loadVeterinarias = async () => {
    try {
      console.log('🏥 Cargando veterinarias...');
      console.log('🔐 Usuario actual:', authService.getCurrentUser());
      console.log('🔐 Token:', authService.getToken()?.substring(0, 20) + '...');
      console.log('🔐 Es cliente?:', authService.isCliente());
      console.log('🔐 Roles:', authService.getCurrentUser()?.roles);
      
      const data = await getAllVeterinarias();
      console.log('🏥 Veterinarias cargadas:', data);
      console.log('🏥 Cantidad de veterinarias:', data?.length || 0);
      setVeterinarias(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('❌ Error loading veterinarias:', error);
      console.error('❌ Código de estado:', error.response?.status);
      console.error('❌ Mensaje:', error.response?.data?.message);
      console.error('❌ Error completo veterinarias:', error.response || error);
      
      // No cerrar sesión si es un error de permisos, solo mostrar mensaje
      if (error.response?.status === 403) {
        console.warn('⚠️ No tienes permisos para ver veterinarias, pero puedes continuar');
      }
      
      setVeterinarias([]);
    }
  };

  const filterCitas = () => {
    let filtered = citas;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(cita =>
        cita.motivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.clienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.clienteApellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.cliente?.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.cliente?.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.mascotaNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.mascota?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.veterinarioNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.veterinarioApellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.veterinario?.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.veterinario?.apellidos?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (filterByEstado) {
      filtered = filtered.filter(cita => cita.estado === filterByEstado);
    }

    // Filtrar por fecha
    if (filterByFecha) {
      filtered = filtered.filter(cita => {
        const citaFecha = new Date(cita.fechaHora).toISOString().split('T')[0];
        return citaFecha === filterByFecha;
      });
    }

    setFilteredCitas(filtered);
  };

  const resetForm = () => {
    setFormData({
      fechaHora: '',
      motivo: '',
      observaciones: '',
      clienteId: '',
      mascotaId: '',
      veterinarioId: '',
      veterinariaId: ''
    });
  };

  const handleShowModal = (mode: 'create' | 'edit' | 'view', cita?: Cita) => {
    setModalMode(mode);
    setSelectedCita(cita || null);
    
    if (cita && (mode === 'edit' || mode === 'view')) {
      // Convertir fecha a formato datetime-local 
      let fechaHora = '';
      if (cita.fechaHora) {
        // Si la fecha viene del backend, simplemente tomar los primeros 16 caracteres
        fechaHora = cita.fechaHora.slice(0, 16);
      }
      
      setFormData({
        fechaHora: fechaHora,
        motivo: cita.motivo || '',
        observaciones: cita.observaciones || '',
        // Usar los campos del DTO o los objetos completos como fallback
        clienteId: cita.clienteDocumento || cita.cliente?.documento || '',
        mascotaId: cita.mascotaId?.toString() || cita.mascota?.id?.toString() || '',
        veterinarioId: cita.veterinarioDocumento || cita.veterinario?.documento || '',
        veterinariaId: cita.veterinariaId?.toString() || cita.veterinaria?.id?.toString() || ''
      });
      
      // Si hay veterinaria seleccionada, filtrar veterinarios
      if (cita.veterinariaId || cita.veterinaria?.id) {
        setFilteredVeterinarios(veterinarios);
      } else {
        setFilteredVeterinarios([]);
      }
    } else {
      resetForm();
      setFilteredVeterinarios([]); // Inicialmente vacío hasta que seleccione veterinaria
    }
    
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCita(null);
    resetForm();
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Si cambió la veterinaria, filtrar veterinarios y limpiar la selección de veterinario
    if (name === 'veterinariaId') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        veterinarioId: '' // Limpiar veterinario seleccionado
      }));
      
      // Filtrar veterinarios por veterinaria seleccionada
      if (value) {
        getVeterinariosByVeterinaria(parseInt(value))
          .then(vetsFiltered => {
            console.log('🏥 Veterinarios filtrados por veterinaria:', vetsFiltered);
            setFilteredVeterinarios(vetsFiltered);
          })
          .catch(error => {
            console.error('❌ Error al filtrar veterinarios:', error);
            setFilteredVeterinarios([]);
          });
      } else {
        setFilteredVeterinarios(veterinarios);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fechaHora || !formData.clienteId || !formData.mascotaId) {
      setError('Fecha/hora, cliente y mascota son obligatorios');
      return;
    }

    try {
      setLoading(true);
      
      // El input datetime-local ya está en formato local, solo agregamos ':00.000Z' para el backend
      const citaData: any = {
        fechaHora: formData.fechaHora + ':00.000',
        motivo: formData.motivo || null,
        observaciones: formData.observaciones || null,
        estado: modalMode === 'create' ? EstadoCita.PROGRAMADA : selectedCita?.estado,
        cliente: {
          documento: formData.clienteId
        },
        mascota: {
          id: parseInt(formData.mascotaId)
        },
        ...(formData.veterinarioId && {
          veterinario: {
            documento: formData.veterinarioId
          }
        }),
        ...(formData.veterinariaId && {
          veterinaria: {
            id: parseInt(formData.veterinariaId)
          }
        })
      };
      
      if (modalMode === 'create') {
        await citaService.createCita(citaData);
        setSuccess('Cita creada exitosamente');
      } else if (modalMode === 'edit' && selectedCita) {
        await citaService.updateCita(selectedCita.id, citaData);
        setSuccess('Cita actualizada exitosamente');
      }
      
      await loadCitas();
      handleCloseModal();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError('Error al guardar la cita: ' + (error.response?.data?.message || error.message));
      console.error('Error saving cita:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (cita: Cita, nuevoEstado: EstadoCita) => {
    const estadoNombres: { [key in EstadoCita]: string } = {
      PROGRAMADA: 'Programada',
      CONFIRMADA: 'Confirmada',
      EN_CURSO: 'En Curso',
      COMPLETADA: 'Completada',
      CANCELADA: 'Cancelada',
      NO_ASISTIO: 'No Asistió'
    };

    if (!window.confirm(`¿Está seguro de cambiar el estado a "${estadoNombres[nuevoEstado]}"?`)) return;

    try {
      setLoading(true);
      await citaService.cambiarEstado(cita.id, nuevoEstado);
      setSuccess(`Cita marcada como ${estadoNombres[nuevoEstado]}`);
      await loadCitas();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError('Error al cambiar el estado de la cita: ' + (error.response?.data?.message || error.message));
      console.error('Error changing cita status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cita: Cita) => {
    if (window.confirm(`¿Está seguro de que desea eliminar esta cita?`)) {
      try {
        setLoading(true);
        await citaService.deleteCita(cita.id);
        setSuccess('Cita eliminada exitosamente');
        await loadCitas();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error: any) {
        setError('Error al eliminar la cita: ' + (error.response?.data?.message || error.message));
        console.error('Error deleting cita:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getEstadoBadgeColor = (estado: EstadoCita) => {
    switch(estado) {
      case EstadoCita.PROGRAMADA: return 'primary';
      case EstadoCita.CONFIRMADA: return 'info';
      case EstadoCita.EN_CURSO: return 'warning';
      case EstadoCita.COMPLETADA: return 'success';
      case EstadoCita.CANCELADA: return 'danger';
      case EstadoCita.NO_ASISTIO: return 'secondary';
      default: return 'secondary';
    }
  };

  const getEstadoNombre = (estado: EstadoCita) => {
    switch(estado) {
      case EstadoCita.PROGRAMADA: return 'Programada';
      case EstadoCita.CONFIRMADA: return 'Confirmada';
      case EstadoCita.EN_CURSO: return 'En Curso';
      case EstadoCita.COMPLETADA: return 'Completada';
      case EstadoCita.CANCELADA: return 'Cancelada';
      case EstadoCita.NO_ASISTIO: return 'No Asistió';
      default: return estado;
    }
  };

  const formatFechaHora = (fechaHora: string) => {
    const fecha = new Date(fechaHora);
    return fecha.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMascotasByCliente = () => {
    if (!formData.clienteId) return [];
    return mascotas.filter(mascota => 
      mascota.propietario?.documento === formData.clienteId
    );
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Gestión de Citas</h4>
              <Button
                variant="primary"
                onClick={() => handleShowModal('create')}
                disabled={loading}
              >
                <i className="fas fa-plus me-2"></i>
                Nueva Cita
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
                      placeholder="Buscar por cliente, mascota, veterinario..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={4}>
                  <Form.Select
                    value={filterByEstado}
                    onChange={(e) => setFilterByEstado(e.target.value)}
                  >
                    <option value="">Todos los estados</option>
                    <option value={EstadoCita.PROGRAMADA}>Programada</option>
                    <option value={EstadoCita.CONFIRMADA}>Confirmada</option>
                    <option value={EstadoCita.EN_CURSO}>En Curso</option>
                    <option value={EstadoCita.COMPLETADA}>Completada</option>
                    <option value={EstadoCita.CANCELADA}>Cancelada</option>
                    <option value={EstadoCita.NO_ASISTIO}>No Asistió</option>
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Control
                    type="date"
                    value={filterByFecha}
                    onChange={(e) => setFilterByFecha(e.target.value)}
                    placeholder="Filtrar por fecha"
                  />
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
                      <th>Fecha y Hora</th>
                      <th>Cliente</th>
                      <th>Mascota</th>
                      <th>Veterinario</th>
                      <th>Motivo</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCitas.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4">
                          No se encontraron citas
                        </td>
                      </tr>
                    ) : (
                      filteredCitas.map((cita) => (
                        <tr key={cita.id}>
                          <td>
                            <strong>{formatFechaHora(cita.fechaHora)}</strong>
                          </td>
                          <td>
                            {cita.clienteNombre || cita.cliente?.nombres
                              ? `${cita.clienteNombre || cita.cliente?.nombres || ''} ${cita.clienteApellido || cita.cliente?.apellidos || ''}`
                              : '-'
                            }
                          </td>
                          <td>
                            {cita.mascotaNombre || cita.mascota?.nombre || '-'}
                            {(cita.mascotaEspecie || cita.mascota?.especie) && (
                              <small className="text-muted d-block">
                                ({cita.mascotaEspecie || cita.mascota?.especie})
                              </small>
                            )}
                          </td>
                          <td>
                            {cita.veterinarioNombre || cita.veterinario?.nombres
                              ? `${cita.veterinarioNombre || cita.veterinario?.nombres || ''} ${cita.veterinarioApellido || cita.veterinario?.apellidos || ''}`
                              : <em className="text-muted">Sin asignar</em>
                            }
                          </td>
                          <td>{cita.motivo || '-'}</td>
                          <td>
                            <Badge bg={getEstadoBadgeColor(cita.estado)}>
                              {getEstadoNombre(cita.estado)}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex gap-1 flex-wrap">
                              <Button
                                size="sm"
                                variant="info"
                                onClick={() => handleShowModal('view', cita)}
                                title="Ver detalles"
                              >
                                <i className="fas fa-eye"></i>
                              </Button>
                              {cita.estado !== EstadoCita.COMPLETADA && cita.estado !== EstadoCita.CANCELADA && (
                                <Button
                                  size="sm"
                                  variant="warning"
                                  onClick={() => handleShowModal('edit', cita)}
                                  title="Editar"
                                >
                                  <i className="fas fa-edit"></i>
                                </Button>
                              )}
                              {cita.estado === EstadoCita.PROGRAMADA && (
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => handleCambiarEstado(cita, EstadoCita.CONFIRMADA)}
                                  title="Confirmar"
                                >
                                  <i className="fas fa-check"></i>
                                </Button>
                              )}
                              {cita.estado === EstadoCita.CONFIRMADA && (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => handleCambiarEstado(cita, EstadoCita.EN_CURSO)}
                                  title="Iniciar"
                                >
                                  <i className="fas fa-play"></i>
                                </Button>
                              )}
                              {cita.estado === EstadoCita.EN_CURSO && (
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => handleCambiarEstado(cita, EstadoCita.COMPLETADA)}
                                  title="Completar"
                                >
                                  <i className="fas fa-check-double"></i>
                                </Button>
                              )}
                              {(cita.estado === EstadoCita.PROGRAMADA || cita.estado === EstadoCita.CONFIRMADA) && (
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => handleCambiarEstado(cita, EstadoCita.CANCELADA)}
                                  title="Cancelar"
                                >
                                  <i className="fas fa-ban"></i>
                                </Button>
                              )}
                              {authService.isAdmin() && (
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => handleDelete(cita)}
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
            {modalMode === 'create' && 'Nueva Cita'}
            {modalMode === 'edit' && 'Editar Cita'}
            {modalMode === 'view' && 'Detalles de Cita'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha y Hora *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="fechaHora"
                    value={formData.fechaHora}
                    onChange={handleInputChange}
                    required
                    disabled={modalMode === 'view'}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cliente *</Form.Label>
                  {modalMode === 'view' && selectedCita ? (
                    <Form.Control
                      type="text"
                      value={`${selectedCita.clienteNombre || ''} ${selectedCita.clienteApellido || ''} - ${selectedCita.clienteDocumento || ''}`}
                      disabled
                    />
                  ) : (
                    <Form.Select
                      name="clienteId"
                      value={formData.clienteId}
                      onChange={handleInputChange}
                      required
                      disabled={modalMode === 'view'}
                    >
                      <option value="">Seleccione un cliente</option>
                      {clientes.map(cliente => (
                        <option key={cliente.documento} value={cliente.documento}>
                          {`${cliente.nombres || ''} ${cliente.apellidos || ''} - ${cliente.documento}`}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mascota *</Form.Label>
                  {modalMode === 'view' && selectedCita ? (
                    <Form.Control
                      type="text"
                      value={`${selectedCita.mascotaNombre || ''} (${selectedCita.mascotaEspecie || ''})`}
                      disabled
                    />
                  ) : (
                    <Form.Select
                      name="mascotaId"
                      value={formData.mascotaId}
                      onChange={handleInputChange}
                      required
                      disabled={modalMode === 'view' || !formData.clienteId}
                    >
                      <option value="">
                        {formData.clienteId 
                          ? 'Seleccione una mascota' 
                          : 'Primero seleccione un cliente'}
                      </option>
                      {getMascotasByCliente().map(mascota => (
                        <option key={mascota.id} value={mascota.id}>
                          {`${mascota.nombre} (${mascota.especie})`}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                  {modalMode !== 'view' && formData.clienteId && getMascotasByCliente().length === 0 && (
                    <Form.Text className="text-warning">
                      El cliente seleccionado no tiene mascotas registradas
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Veterinaria <span className="text-danger">*</span></Form.Label>
                  {modalMode === 'view' && selectedCita ? (
                    <Form.Control
                      type="text"
                      value={selectedCita.veterinariaNombre || 'No especificada'}
                      disabled
                    />
                  ) : (
                    <>
                      <Form.Select
                        name="veterinariaId"
                        value={formData.veterinariaId}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        required
                      >
                        <option value="">Seleccione una veterinaria</option>
                        {veterinarias.map(veterinaria => (
                          <option key={veterinaria.id} value={veterinaria.id}>
                            {veterinaria.nombre}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Text className="text-muted">
                        Primero seleccione la veterinaria para ver los veterinarios disponibles
                      </Form.Text>
                    </>
                  )}
                </Form.Group>
              </Col>
            </Row>

            {/* Solo mostrar campo de veterinario si NO es veterinario */}
            {!authService.isVeterinario() && (
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Veterinario</Form.Label>
                    {modalMode === 'view' && selectedCita ? (
                      <Form.Control
                        type="text"
                        value={selectedCita.veterinarioNombre && selectedCita.veterinarioApellido 
                          ? `Dr. ${selectedCita.veterinarioNombre} ${selectedCita.veterinarioApellido}`
                          : 'Sin asignar'}
                        disabled
                      />
                    ) : (
                      <>
                        <Form.Select
                          name="veterinarioId"
                          value={formData.veterinarioId}
                          onChange={handleInputChange}
                          disabled={modalMode === 'view' || !formData.veterinariaId}
                        >
                          <option value="">Sin asignar</option>
                          {filteredVeterinarios.map(veterinario => (
                            <option key={veterinario.documento} value={veterinario.documento}>
                              {`Dr. ${veterinario.nombres || ''} ${veterinario.apellidos || ''}`}
                            </option>
                          ))}
                        </Form.Select>
                        {!formData.veterinariaId && (
                          <Form.Text className="text-muted">
                            Seleccione primero una veterinaria
                          </Form.Text>
                        )}
                      </>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            )}
            
            {/* Mostrar mensaje informativo si es veterinario */}
            {authService.isVeterinario() && modalMode !== 'view' && (
              <Alert variant="info" className="mb-3">
                <i className="fas fa-info-circle me-2"></i>
                Como veterinario, serás asignado automáticamente a esta cita
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Motivo</Form.Label>
              <Form.Control
                type="text"
                name="motivo"
                value={formData.motivo}
                onChange={handleInputChange}
                disabled={modalMode === 'view'}
                placeholder="Motivo de la consulta"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                disabled={modalMode === 'view'}
                placeholder="Observaciones adicionales"
              />
            </Form.Group>

            {modalMode === 'view' && selectedCita && (
              <>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Estado</Form.Label>
                      <div>
                        <Badge bg={getEstadoBadgeColor(selectedCita.estado)} className="fs-6">
                          {getEstadoNombre(selectedCita.estado)}
                        </Badge>
                      </div>
                    </Form.Group>
                  </Col>
                  {selectedCita.fechaCreacion && (
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Fecha de Creación</Form.Label>
                        <Form.Control
                          type="text"
                          value={formatFechaHora(selectedCita.fechaCreacion)}
                          disabled
                        />
                      </Form.Group>
                    </Col>
                  )}
                </Row>
                {selectedCita.veterinaria && (
                  <Alert variant="info">
                    <strong>Veterinaria:</strong> {selectedCita.veterinaria.nombre}
                    {selectedCita.veterinaria.direccion && (
                      <><br /><strong>Dirección:</strong> {selectedCita.veterinaria.direccion}</>
                    )}
                    {selectedCita.veterinaria.telefono && (
                      <><br /><strong>Teléfono:</strong> {selectedCita.veterinaria.telefono}</>
                    )}
                  </Alert>
                )}
              </>
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

export default CitaManagement;
