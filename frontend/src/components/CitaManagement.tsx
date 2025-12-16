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
  Spinner,
  ListGroup
} from 'react-bootstrap';
import { Cita, EstadoCita } from '../types';
import citaService, { HorarioDisponible } from '../services/citaService';
import mascotaService from '../services/mascotaService';
import { getAllUsuarios, getVeterinarios, getVeterinariosByVeterinaria } from '../services/userService';
import { getAllVeterinarias } from '../services/veterinariaService';
import authService from '../services/authService';
import SearchableSelect from './SearchableSelect';

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
  
  // Estados para disponibilidad de horarios
  const [horariosDisponibles, setHorariosDisponibles] = useState<HorarioDisponible[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');
  const [loadingHorarios, setLoadingHorarios] = useState(false);

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

    // Ordenar por fecha y hora (más próximas primero)
    filtered.sort((a, b) => {
      const fechaA = a.fechaHora ? new Date(a.fechaHora).getTime() : 0;
      const fechaB = b.fechaHora ? new Date(b.fechaHora).getTime() : 0;
      return fechaA - fechaB;
    });

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
      
      const veterinariaId = cita.veterinariaId?.toString() || cita.veterinaria?.id?.toString() || '';
      const clienteDocumento = cita.clienteDocumento || cita.cliente?.documento || '';
      
      console.log('📋 Cargando cita para editar:', {
        citaId: cita.id,
        clienteDocumento: clienteDocumento,
        clienteFromDTO: cita.clienteDocumento,
        clienteFromObj: cita.cliente?.documento,
        mascotaId: cita.mascotaId,
        veterinarioDocumento: cita.veterinarioDocumento,
        veterinariaId: veterinariaId
      });
      
      if (!clienteDocumento) {
        console.error('⚠️ ADVERTENCIA: No se pudo obtener el documento del cliente de la cita');
      }
      
      setFormData({
        fechaHora: fechaHora,
        motivo: cita.motivo || '',
        observaciones: cita.observaciones || '',
        // Usar los campos del DTO o los objetos completos como fallback
        clienteId: clienteDocumento,
        mascotaId: cita.mascotaId?.toString() || cita.mascota?.id?.toString() || '',
        veterinarioId: cita.veterinarioDocumento || cita.veterinario?.documento || '',
        veterinariaId: veterinariaId
      });
      
      // Si hay veterinaria seleccionada, filtrar veterinarios por esa veterinaria
      if (veterinariaId) {
        getVeterinariosByVeterinaria(parseInt(veterinariaId))
          .then(vetsFiltered => {
            console.log('🏥 Veterinarios filtrados para edición:', vetsFiltered);
            setFilteredVeterinarios(vetsFiltered);
          })
          .catch(error => {
            console.error('❌ Error al filtrar veterinarios para edición:', error);
            setFilteredVeterinarios(veterinarios); // Fallback a todos los veterinarios
          });
      } else {
        setFilteredVeterinarios([]);
      }
    } else {
      resetForm();
      
      // Si es cliente, establecer automáticamente su documento
      if (authService.isCliente()) {
        const currentUser = authService.getCurrentUser();
        if (currentUser && currentUser.documento) {
          setFormData(prev => ({
            ...prev,
            clienteId: currentUser.documento
          }));
          console.log('👤 Cliente detectado - documento establecido automáticamente:', currentUser.documento);
        }
      }
      
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
        veterinarioId: '', // Limpiar veterinario seleccionado
        fechaHora: '' // Limpiar fecha/hora cuando cambia veterinaria
      }));
      
      setHorariosDisponibles([]); // Limpiar horarios
      setFechaSeleccionada(''); // Limpiar fecha seleccionada
      
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
  
  const loadHorariosDisponibles = async (fecha: string) => {
    if (!formData.veterinariaId || !fecha) {
      return;
    }
    
    try {
      setLoadingHorarios(true);
      const horarios = await citaService.getHorariosDisponibles(fecha, parseInt(formData.veterinariaId));
      setHorariosDisponibles(horarios);
      setFechaSeleccionada(fecha);
    } catch (error: any) {
      console.error('Error al cargar horarios disponibles:', error);
      setError('Error al cargar horarios disponibles');
    } finally {
      setLoadingHorarios(false);
    }
  };
  
  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fecha = e.target.value;
    setFechaSeleccionada(fecha);
    setFormData(prev => ({ ...prev, fechaHora: '' }));
    if (fecha && formData.veterinariaId) {
      loadHorariosDisponibles(fecha);
    }
  };
  
  const handleSelectHorario = (e: React.MouseEvent, horario: HorarioDisponible) => {
    e.preventDefault(); // Prevenir submit del formulario
    e.stopPropagation(); // Detener propagación del evento
    
    if (horario.disponible) {
      // El backend espera formato "yyyy-MM-ddTHH:mm"
      const fechaHora = horario.fechaHora.substring(0, 16);
      setFormData(prev => ({ ...prev, fechaHora }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    if (!formData.fechaHora) {
      setError('La fecha y hora de la cita son obligatorias');
      return;
    }
    
    if (!formData.clienteId || formData.clienteId.trim() === '') {
      setError('El cliente es obligatorio');
      return;
    }
    
    if (!formData.mascotaId || formData.mascotaId.trim() === '') {
      setError('La mascota es obligatoria');
      return;
    }
    
    // Validar que recepcionista complete veterinaria y veterinario
    if (authService.isRecepcionista() && modalMode === 'create') {
      if (!formData.veterinariaId) {
        setError('Debe seleccionar una veterinaria para crear la cita');
        return;
      }
      if (!formData.veterinarioId) {
        setError('Debe seleccionar un veterinario para crear la cita');
        return;
      }
    }

    try {
      setLoading(true);
      
      // Validación adicional de seguridad
      console.log('📝 FormData antes de enviar:', {
        modalMode,
        formData: { ...formData },
        clienteIdLength: formData.clienteId?.length,
        clienteIdType: typeof formData.clienteId
      });
      
      if (!formData.clienteId || formData.clienteId.trim() === '') {
        console.error('❌ ClienteId está vacío:', formData.clienteId);
        setError('Error: El documento del cliente no puede estar vacío');
        setLoading(false);
        return;
      }
      
      // En modo edición, usar los datos originales de la cita para cliente y mascota
      let clienteDocumento = '';
      let mascotaIdValue = 0;
      
      if (modalMode === 'edit' && selectedCita) {
        // Para edición, SIEMPRE usar los datos de selectedCita
        clienteDocumento = selectedCita.clienteDocumento || selectedCita.cliente?.documento || '';
        mascotaIdValue = selectedCita.mascotaId || selectedCita.mascota?.id || 0;
        
        console.log('🔄 Modo EDIT - Extrayendo datos de selectedCita:', {
          clienteDocumento,
          mascotaIdValue,
          selectedCita: {
            clienteDocumento: selectedCita.clienteDocumento,
            clienteObjeto: selectedCita.cliente,
            mascotaId: selectedCita.mascotaId,
            mascotaObjeto: selectedCita.mascota
          }
        });
      } else {
        // Para creación, usar formData
        clienteDocumento = formData.clienteId || '';
        mascotaIdValue = parseInt(formData.mascotaId) || 0;
        
        console.log('✨ Modo CREATE - Usando formData:', {
          clienteDocumento,
          mascotaIdValue
        });
      }
      
      // Crear objeto en formato CitaRequest (DTO del backend)
      const citaData: any = {
        fechaHora: formData.fechaHora + ':00',
        motivo: formData.motivo || null,
        observaciones: formData.observaciones || null,
        estado: modalMode === 'create' ? EstadoCita.PROGRAMADA : selectedCita?.estado,
        clienteDocumento: clienteDocumento ? clienteDocumento.trim() : null,
        mascotaId: mascotaIdValue,
        veterinarioDocumento: formData.veterinarioId && formData.veterinarioId.trim() !== '' ? formData.veterinarioId.trim() : null,
        veterinariaId: formData.veterinariaId ? parseInt(formData.veterinariaId) : null
      };
      
      console.log('📤 CitaData a enviar:', citaData);
      console.log('📤 ClienteDocumento específicamente:', citaData.clienteDocumento);
      
      // Validación final CRÍTICA antes de enviar
      if (!citaData.clienteDocumento || 
          citaData.clienteDocumento === 'null' || 
          citaData.clienteDocumento === null ||
          citaData.clienteDocumento.toString().trim() === '') {
        
        console.error('❌❌❌ ERROR CRÍTICO: clienteDocumento es null o vacío en citaData ❌❌❌');
        console.error('📊 Datos completos de depuración:', {
          modalMode,
          'selectedCita completa': selectedCita,
          'formData completo': formData,
          'citaData.clienteDocumento': citaData.clienteDocumento,
          'tipo de clienteDocumento': typeof citaData.clienteDocumento,
          'selectedCita.clienteDocumento': selectedCita?.clienteDocumento,
          'selectedCita.cliente': selectedCita?.cliente,
          'formData.clienteId': formData.clienteId
        });
        
        setError('Error crítico: No se pudo obtener el documento del cliente. La cita puede estar corrupta. Por favor, contacte al administrador.');
        setLoading(false);
        return;
      }
      
      console.log('✅ Validación pasada - clienteDocumento es válido:', citaData.clienteDocumento);
      
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
                <Col md={3}>
                  <SearchableSelect
                    options={[
                      { value: '', label: 'Todos los estados' },
                      { value: EstadoCita.PROGRAMADA, label: 'Programada' },
                      { value: EstadoCita.CONFIRMADA, label: 'Confirmada' },
                      { value: EstadoCita.EN_CURSO, label: 'En Curso' },
                      { value: EstadoCita.COMPLETADA, label: 'Completada' },
                      { value: EstadoCita.CANCELADA, label: 'Cancelada' },
                      { value: EstadoCita.NO_ASISTIO, label: 'No Asistió' }
                    ]}
                    value={filterByEstado}
                    onChange={setFilterByEstado}
                    placeholder="Todos los estados"
                  />
                </Col>
                <Col md={3}>
                  <Form.Control
                    type="date"
                    value={filterByFecha}
                    onChange={(e) => setFilterByFecha(e.target.value)}
                    placeholder="Filtrar por fecha"
                  />
                </Col>
                <Col md={2}>
                  <Button
                    variant="outline-secondary"
                    className="w-100"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterByEstado('');
                      setFilterByFecha('');
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
                              {cita.estado !== EstadoCita.COMPLETADA && cita.estado !== EstadoCita.CANCELADA && !authService.isCliente() && (
                                <Button
                                  size="sm"
                                  variant="warning"
                                  onClick={() => handleShowModal('edit', cita)}
                                  title="Editar"
                                >
                                  <i className="fas fa-edit"></i>
                                </Button>
                              )}
                              {cita.estado === EstadoCita.PROGRAMADA && (authService.isAdmin() || authService.isRecepcionista() || authService.isVeterinario()) && (
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => handleCambiarEstado(cita, EstadoCita.CONFIRMADA)}
                                  title="Confirmar"
                                >
                                  <i className="fas fa-check"></i>
                                </Button>
                              )}
                              {cita.estado === EstadoCita.CONFIRMADA && (authService.isAdmin() || authService.isRecepcionista() || authService.isVeterinario()) && (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => handleCambiarEstado(cita, EstadoCita.EN_CURSO)}
                                  title="Iniciar"
                                >
                                  <i className="fas fa-play"></i>
                                </Button>
                              )}
                              {cita.estado === EstadoCita.EN_CURSO && (authService.isAdmin() || authService.isRecepcionista() || authService.isVeterinario()) && (
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
                                authService.isAdmin() || 
                                authService.isRecepcionista() || 
                                authService.isVeterinario() || 
                                (authService.isCliente() && cita.clienteDocumento === authService.getCurrentUser()?.documento)
                              ) && (
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
            
            {/* Sección 1: Información de la Clínica */}
            <Card className="mb-4 border-primary">
              <Card.Header className="bg-primary text-white">
                <h6 className="mb-0">
                  <i className="fas fa-hospital me-2"></i>
                  Paso 1: Seleccione la Clínica
                </h6>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-0">
                  <Form.Label>Veterinaria <span className="text-danger">*</span></Form.Label>
                  {modalMode === 'view' && selectedCita ? (
                    <Form.Control
                      type="text"
                      value={selectedCita.veterinariaNombre || 'No especificada'}
                      disabled
                    />
                  ) : (
                    <SearchableSelect
                      options={[
                        { value: '', label: 'Seleccione una veterinaria' },
                        ...veterinarias.map(veterinaria => ({
                          value: veterinaria.id.toString(),
                          label: veterinaria.nombre
                        }))
                      ]}
                      value={formData.veterinariaId}
                      onChange={(value) => handleInputChange({ target: { name: 'veterinariaId', value } } as any)}
                      disabled={modalMode === 'view'}
                      required
                    />
                  )}
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Sección 2: Fecha y Horario */}
            <Card className="mb-4 border-success">
              <Card.Header className="bg-success text-white">
                <h6 className="mb-0">
                  <i className="fas fa-calendar-alt me-2"></i>
                  Paso 2: Seleccione Fecha y Horario
                </h6>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Seleccionar Fecha *</Form.Label>
                  <Form.Control
                    type="date"
                    value={fechaSeleccionada}
                    onChange={handleFechaChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    disabled={modalMode === 'view' || !formData.veterinariaId}
                  />
                  {!formData.veterinariaId && modalMode !== 'view' && (
                    <Form.Text className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Primero seleccione una veterinaria
                    </Form.Text>
                  )}
                </Form.Group>
                
                {/* Mostrar horarios disponibles */}
                {modalMode !== 'view' && fechaSeleccionada && formData.veterinariaId && (
                  <Form.Group className="mb-3">
                    <Form.Label>Horarios Disponibles *</Form.Label>
                    {loadingHorarios ? (
                      <div className="text-center p-4 bg-light rounded">
                        <Spinner animation="border" size="sm" className="me-2" />
                        <span>Cargando horarios disponibles...</span>
                      </div>
                    ) : horariosDisponibles.length > 0 ? (
                      <div style={{ 
                        maxHeight: '250px', 
                        overflowY: 'auto', 
                        border: '2px solid #e9ecef', 
                        borderRadius: '8px', 
                        padding: '12px',
                        backgroundColor: '#f8f9fa'
                      }}>
                        <Row className="g-2">
                          {horariosDisponibles.map((horario, index) => {
                            const hora = new Date(horario.fechaHora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                            const isSelected = formData.fechaHora === horario.fechaHora.substring(0, 16);
                            return (
                              <Col xs={6} md={4} key={index}>
                                <div
                                  onClick={(e) => horario.disponible && handleSelectHorario(e, horario)}
                                  className={`p-3 rounded text-center ${
                                    isSelected 
                                      ? 'bg-primary text-white' 
                                      : horario.disponible 
                                      ? 'bg-white border border-success' 
                                      : 'bg-light border border-danger'
                                  }`}
                                  style={{ 
                                    cursor: horario.disponible ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.2s',
                                    opacity: horario.disponible ? 1 : 0.6
                                  }}
                                >
                                  <div className="fw-bold fs-5">{hora}</div>
                                  {horario.veterinarioNombre && (
                                    <small className={isSelected ? 'text-white' : 'text-muted'}>
                                      Dr. {horario.veterinarioNombre}
                                    </small>
                                  )}
                                  <div className="mt-1">
                                    <Badge bg={isSelected ? 'light' : horario.disponible ? 'success' : 'danger'} 
                                           className={isSelected ? 'text-primary' : ''}>
                                      {horario.disponible ? '✓ Disponible' : '✗ Ocupado'}
                                    </Badge>
                                  </div>
                                </div>
                              </Col>
                            );
                          })}
                        </Row>
                      </div>
                    ) : (
                      <Alert variant="warning" className="mb-0">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        No hay horarios disponibles para esta fecha
                      </Alert>
                    )}
                  </Form.Group>
                )}
                
                {formData.fechaHora && (
                  <Alert variant="info" className="mb-0">
                    <i className="fas fa-clock me-2"></i>
                    <strong>Horario seleccionado:</strong> {new Date(formData.fechaHora).toLocaleString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Alert>
                )}
              </Card.Body>
            </Card>

            {/* Sección 3: Información del Cliente y Mascota */}
            <Card className="mb-4 border-info">
              <Card.Header className="bg-info text-white">
                <h6 className="mb-0">
                  <i className="fas fa-user-friends me-2"></i>
                  Paso 3: Cliente y Mascota
                </h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Cliente *</Form.Label>
                      {(modalMode === 'view' || modalMode === 'edit') && selectedCita ? (
                        <Form.Control
                          type="text"
                          value={`${selectedCita.clienteNombre || ''} ${selectedCita.clienteApellido || ''} - ${selectedCita.clienteDocumento || ''}`}
                          disabled
                        />
                      ) : (
                        <SearchableSelect
                          options={[
                            { value: '', label: 'Seleccione un cliente' },
                            ...clientes.map(cliente => ({
                              value: cliente.documento,
                              label: `${cliente.nombres || ''} ${cliente.apellidos || ''} - ${cliente.documento}`
                            }))
                          ]}
                          value={formData.clienteId}
                          onChange={(value) => handleInputChange({ target: { name: 'clienteId', value } } as any)}
                          required
                          disabled={modalMode === 'view' || authService.isCliente()}
                        />
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mascota *</Form.Label>
                      {(modalMode === 'view' || modalMode === 'edit') && selectedCita ? (
                        <Form.Control
                          type="text"
                          value={`${selectedCita.mascotaNombre || ''} (${selectedCita.mascotaEspecie || ''})`}
                          disabled
                        />
                      ) : (
                        <>
                          <SearchableSelect
                            options={[
                              {
                                value: '',
                                label: formData.clienteId 
                                  ? 'Seleccione una mascota' 
                                  : 'Primero seleccione un cliente'
                              },
                              ...getMascotasByCliente().map(mascota => ({
                                value: mascota.id.toString(),
                                label: `${mascota.nombre} (${mascota.especie})`
                              }))
                            ]}
                            value={formData.mascotaId}
                            onChange={(value) => handleInputChange({ target: { name: 'mascotaId', value } } as any)}
                            required
                            disabled={modalMode === 'view' || !formData.clienteId}
                          />
                          {modalMode !== 'view' && modalMode !== 'edit' && formData.clienteId && getMascotasByCliente().length === 0 && (
                            <Form.Text className="text-warning">
                              <i className="fas fa-exclamation-circle me-1"></i>
                              El cliente seleccionado no tiene mascotas registradas
                            </Form.Text>
                          )}
                        </>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Sección 4: Veterinario */}
            {!authService.isVeterinario() && (
              <Card className="mb-4 border-warning">
                <Card.Header className="bg-warning">
                  <h6 className="mb-0">
                    <i className="fas fa-user-md me-2"></i>
                    Paso 4: Asignación de Veterinario
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-0">
                    <Form.Label>
                      Veterinario {authService.isRecepcionista() && modalMode === 'create' && <span className="text-danger">*</span>}
                    </Form.Label>
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
                        <SearchableSelect
                          options={[
                            {
                              value: '',
                              label: authService.isRecepcionista() && modalMode === 'create' ? 'Seleccione un veterinario' : 'Sin asignar'
                            },
                            ...filteredVeterinarios.map(veterinario => ({
                              value: veterinario.documento,
                              label: `Dr. ${veterinario.nombres || ''} ${veterinario.apellidos || ''}`
                            }))
                          ]}
                          value={formData.veterinarioId}
                          onChange={(value) => handleInputChange({ target: { name: 'veterinarioId', value } } as any)}
                          disabled={modalMode === 'view' || !formData.veterinariaId}
                          required={authService.isRecepcionista() && modalMode === 'create'}
                        />
                        {!formData.veterinariaId && (
                          <Form.Text className="text-muted">
                            <i className="fas fa-info-circle me-1"></i>
                            Seleccione primero una veterinaria
                          </Form.Text>
                        )}
                      </>
                    )}
                  </Form.Group>
                </Card.Body>
              </Card>
            )}
            
            {/* Mensaje informativo para veterinarios */}
            {authService.isVeterinario() && modalMode !== 'view' && (
              <Alert variant="info" className="mb-4">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Nota:</strong> Como veterinario, serás asignado automáticamente a esta cita
              </Alert>
            )}

            {/* Sección 5: Detalles Adicionales */}
            <Card className="mb-0 border-secondary">
              <Card.Header className="bg-secondary text-white">
                <h6 className="mb-0">
                  <i className="fas fa-clipboard me-2"></i>
                  Paso 5: Detalles de la Consulta
                </h6>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Motivo de la Consulta</Form.Label>
                  <Form.Control
                    type="text"
                    name="motivo"
                    value={formData.motivo}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    placeholder="Ej: Vacunación, Control general, Consulta de urgencia..."
                  />
                </Form.Group>

                <Form.Group className="mb-0">
                  <Form.Label>Observaciones Adicionales</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    placeholder="Información adicional que el veterinario deba conocer..."
                  />
                </Form.Group>
              </Card.Body>
            </Card>

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
              <Button 
                variant="primary" 
                type="submit" 
                disabled={
                  loading || 
                  !formData.fechaHora || 
                  !formData.clienteId || 
                  !formData.mascotaId ||
                  (authService.isRecepcionista() && modalMode === 'create' && (!formData.veterinariaId || !formData.veterinarioId))
                }
              >
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
