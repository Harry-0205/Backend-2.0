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
  Accordion,
  ListGroup
} from 'react-bootstrap';
import { HistoriaClinica, EstadoCita } from '../types';
import historiaClinicaService from '../services/historiaClinicaService';
import mascotaService from '../services/mascotaService';
import { getAllUsuarios } from '../services/userService';
import citaService, { HorarioDisponible } from '../services/citaService';
import authService from '../services/authService';

const HistoriaClinicaManagement: React.FC = () => {
  const [historiasClinicas, setHistoriasClinicas] = useState<HistoriaClinica[]>([]);
  const [filteredHistorias, setFilteredHistorias] = useState<HistoriaClinica[]>([]);
  const [mascotas, setMascotas] = useState<any[]>([]);
  const [filteredMascotas, setFilteredMascotas] = useState<any[]>([]);
  const [propietarios, setPropietarios] = useState<any[]>([]);
  const [veterinarios, setVeterinarios] = useState<any[]>([]);
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedHistoria, setSelectedHistoria] = useState<HistoriaClinica | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByFecha, setFilterByFecha] = useState<string>('');
  
  // Estados para disponibilidad de horarios de próxima cita
  const [horariosDisponibles, setHorariosDisponibles] = useState<HorarioDisponible[]>([]);
  const [fechaProximaCita, setFechaProximaCita] = useState<string>('');
  const [loadingHorarios, setLoadingHorarios] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fechaConsulta: '',
    motivoConsulta: '',
    sintomas: '',
    diagnostico: '',
    tratamiento: '',
    medicamentos: '',
    peso: '',
    temperatura: '',
    frecuenciaCardiaca: '',
    frecuenciaRespiratoria: '',
    observaciones: '',
    recomendaciones: '',
    proximaCita: '',
    propietarioId: '',
    mascotaId: '',
    veterinarioId: '',
    citaId: ''
  });

  useEffect(() => {
    loadHistoriasClinicas();
    loadMascotas();
    loadVeterinarios();
    loadCitas();
    loadPropietarios();
  }, []);

  useEffect(() => {
    filterHistorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historiasClinicas, searchTerm, filterByFecha]);

  const loadHistoriasClinicas = async () => {
    try {
      setLoading(true);
      let data: any = [];
      
      // Si es cliente, cargar historias solo de SUS mascotas
      if (authService.isCliente()) {
        const currentUser = authService.getCurrentUser();
        if (currentUser && currentUser.documento) {
          // Primero obtener las mascotas del cliente
          const mascotasCliente = await mascotaService.getMascotasByPropietario(currentUser.documento);
          
          // Luego obtener historias de cada mascota
          const historiasPromises = mascotasCliente.map(mascota => 
            historiaClinicaService.getHistoriasClinicasByMascota(mascota.id)
          );
          
          const historiasArrays = await Promise.all(historiasPromises);
          data = historiasArrays.flat(); // Aplanar arrays anidados
        }
      } else {
        // Otros roles ven todas las historias
        data = await historiaClinicaService.getAllHistoriasClinicas();
      }
      
      setHistoriasClinicas(Array.isArray(data) ? data : []);
      setError('');
    } catch (error) {
      setError('Error al cargar las historias clínicas');
      console.error('Error loading historias clinicas:', error);
      setHistoriasClinicas([]);
    } finally {
      setLoading(false);
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
      
      const mascotasArray = Array.isArray(data) ? data : [];
      setMascotas(mascotasArray);
      // Inicializar filteredMascotas con todas las mascotas
      setFilteredMascotas(mascotasArray);
    } catch (error) {
      console.error('Error loading mascotas:', error);
      setMascotas([]);
      setFilteredMascotas([]);
    }
  };

  const loadVeterinarios = async () => {
    try {
      // Si es cliente, no necesita cargar veterinarios (solo ve datos, no crea)
      if (authService.isCliente()) {
        setVeterinarios([]);
        return;
      }
      
      const data = await getAllUsuarios();
      const veterinariosList = Array.isArray(data) 
        ? data.filter(usuario => 
            usuario.roles?.some(role => role === 'VETERINARIO' || role === 'ROLE_VETERINARIO')
          )
        : [];
      
      // Si es veterinario, filtrar solo su propio usuario
      if (authService.isVeterinario()) {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          const currentVet = veterinariosList.find(vet => vet.documento === currentUser.documento);
          setVeterinarios(currentVet ? [currentVet] : []);
        } else {
          setVeterinarios([]);
        }
      } else {
        setVeterinarios(veterinariosList);
      }
    } catch (error) {
      console.error('Error loading veterinarios:', error);
      setVeterinarios([]);
    }
  };

  const loadCitas = async () => {
    try {
      let data: any;
      
      // Si es cliente, solo cargar sus propias citas
      if (authService.isCliente()) {
        const currentUser = authService.getCurrentUser();
        if (currentUser && currentUser.documento) {
          data = await citaService.getCitasByCliente(currentUser.documento);
        } else {
          data = [];
        }
      } else {
        // Otros roles ven todas las citas
        data = await citaService.getAllCitas();
      }
      
      setCitas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading citas:', error);
      setCitas([]);
    }
  };

  const loadPropietarios = async () => {
    try {
      // Solo cargar propietarios si el usuario es veterinario, admin o recepcionista
      if (authService.isVeterinario() || authService.isAdmin() || authService.isRecepcionista()) {
        const data = await getAllUsuarios();
        // Filtrar solo usuarios con rol CLIENTE
        const clientes = Array.isArray(data) 
          ? data.filter(user => user.roles && user.roles.some((role: string) => 
              role === 'ROLE_CLIENTE' || role === 'CLIENTE'
            ))
          : [];
        setPropietarios(clientes);
      }
    } catch (error) {
      console.error('Error loading propietarios:', error);
      setPropietarios([]);
    }
  };

  const filterHistorias = () => {
    let filtered = historiasClinicas;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(historia => {
        const veterinarioNombre = historia.veterinario && typeof historia.veterinario === 'object' 
          ? `${historia.veterinario.nombres || ''} ${historia.veterinario.apellidos || ''}`
          : '';
        
        return historia.motivoConsulta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          historia.diagnostico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          historia.mascota?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          veterinarioNombre.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Filtrar por fecha
    if (filterByFecha) {
      filtered = filtered.filter(historia => {
        const historiaFecha = new Date(historia.fechaConsulta).toISOString().split('T')[0];
        return historiaFecha === filterByFecha;
      });
    }

    // Ordenar por fecha de creación (más recientes primero)
    filtered.sort((a, b) => {
      const fechaA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0;
      const fechaB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0;
      return fechaB - fechaA;
    });

    setFilteredHistorias(filtered);
  };

  const resetForm = () => {
    setFormData({
      fechaConsulta: '',
      motivoConsulta: '',
      sintomas: '',
      diagnostico: '',
      tratamiento: '',
      medicamentos: '',
      peso: '',
      temperatura: '',
      frecuenciaCardiaca: '',
      frecuenciaRespiratoria: '',
      observaciones: '',
      recomendaciones: '',
      proximaCita: '',
      mascotaId: '',
      veterinarioId: '',
      citaId: '',
      propietarioId: ''
    });
    // Limpiar estados de próxima cita
    setFechaProximaCita('');
    setHorariosDisponibles([]);
  };

  const handleShowModal = (mode: 'create' | 'edit' | 'view', historia?: HistoriaClinica) => {
    setModalMode(mode);
    setSelectedHistoria(historia || null);
    
    if (historia && (mode === 'edit' || mode === 'view')) {
      setFormData({
        fechaConsulta: historia.fechaConsulta ? new Date(historia.fechaConsulta).toISOString().slice(0, 16) : '',
        motivoConsulta: historia.motivoConsulta || '',
        sintomas: historia.sintomas || '',
        diagnostico: historia.diagnostico || '',
        tratamiento: historia.tratamiento || '',
        medicamentos: historia.medicamentos || '',
        peso: historia.peso?.toString() || '',
        temperatura: historia.temperatura?.toString() || '',
        frecuenciaCardiaca: historia.frecuenciaCardiaca?.toString() || '',
        frecuenciaRespiratoria: historia.frecuenciaRespiratoria?.toString() || '',
        observaciones: historia.observaciones || '',
        recomendaciones: historia.recomendaciones || '',
        proximaCita: historia.proximaCita ? historia.proximaCita.slice(0, 16) : '',
        mascotaId: historia.mascota?.id?.toString() || '',
        veterinarioId: historia.veterinario && typeof historia.veterinario === 'object' 
          ? historia.veterinario.documento || ''
          : '',
        citaId: historia.cita?.id?.toString() || '',
        propietarioId: typeof historia.mascota?.propietario === 'string' 
          ? historia.mascota.propietario 
          : historia.mascota?.propietario?.documento || ''
      });
    } else {
      resetForm();
      // Establecer fecha actual por defecto
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      
      // Si es veterinario, establecer automáticamente su documento como veterinarioId
      const currentUser = authService.getCurrentUser();
      const veterinarioId = authService.isVeterinario() && currentUser ? currentUser.documento : '';
      
      setFormData(prev => ({
        ...prev,
        fechaConsulta: now.toISOString().slice(0, 16),
        veterinarioId: veterinarioId
      }));
    }
    
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedHistoria(null);
    resetForm();
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Si cambia el propietario, filtrar mascotas y limpiar mascotaId
    if (name === 'propietarioId') {
      if (value) {
        // Filtrar mascotas por propietario
        const mascotasFiltradas = mascotas.filter(mascota => {
          const propietarioDocumento = typeof mascota.propietario === 'string' 
            ? mascota.propietario 
            : mascota.propietario?.documento;
          return propietarioDocumento === value;
        });
        setFilteredMascotas(mascotasFiltradas);
      } else {
        // Si no hay propietario seleccionado, mostrar todas las mascotas
        setFilteredMascotas(mascotas);
      }
      // Limpiar mascota seleccionada cuando cambia el propietario
      setFormData(prev => ({
        ...prev,
        [name]: value,
        mascotaId: ''
      }));
    } else if (name === 'veterinarioId') {
      // Si cambia el veterinario y hay una fecha seleccionada, recargar horarios
      setFormData(prev => ({
        ...prev,
        [name]: value,
        proximaCita: '' // Limpiar la cita seleccionada al cambiar veterinario
      }));
      
      // Recargar horarios si ya hay una fecha seleccionada
      if (fechaProximaCita && value) {
        loadHorariosDisponibles(fechaProximaCita, value);
      } else if (!value) {
        // Si se deseleccionó el veterinario, limpiar horarios
        setHorariosDisponibles([]);
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
    
    if (!formData.fechaConsulta || !formData.mascotaId || !formData.veterinarioId) {
      setError('Fecha de consulta, mascota y veterinario son obligatorios');
      return;
    }

    try {
      setLoading(true);
      
      const historiaData: any = {
        fechaConsulta: new Date(formData.fechaConsulta).toISOString(),
        motivoConsulta: formData.motivoConsulta || null,
        sintomas: formData.sintomas || null,
        diagnostico: formData.diagnostico || null,
        tratamiento: formData.tratamiento || null,
        medicamentos: formData.medicamentos || null,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        temperatura: formData.temperatura ? parseFloat(formData.temperatura) : null,
        frecuenciaCardiaca: formData.frecuenciaCardiaca ? parseInt(formData.frecuenciaCardiaca) : null,
        frecuenciaRespiratoria: formData.frecuenciaRespiratoria ? parseInt(formData.frecuenciaRespiratoria) : null,
        observaciones: formData.observaciones || null,
        recomendaciones: formData.recomendaciones || null,
        mascotaId: parseInt(formData.mascotaId),
        veterinarioDocumento: formData.veterinarioId,
        ...(formData.citaId && {
          citaId: parseInt(formData.citaId)
        })
      };
      
      if (modalMode === 'create') {
        const nuevaHistoria = await historiaClinicaService.createHistoriaClinica(historiaData);
        
        // Si hay próxima cita, crear una cita en el sistema
        if (formData.proximaCita) {
          try {
            const mascota = mascotas.find(m => m.id === parseInt(formData.mascotaId));
            console.log('Mascota encontrada:', mascota);
            
            // Obtener el veterinario y su veterinariaId
            const veterinario = veterinarios.find(v => v.documento === formData.veterinarioId);
            let veterinariaId: number | undefined;
            
            if (veterinario?.veterinariaId) {
              veterinariaId = veterinario.veterinariaId;
            } else {
              // Fallback: obtener del usuario actual si es veterinario
              const currentUser = authService.getCurrentUser();
              if (currentUser?.veterinaria?.id) {
                veterinariaId = currentUser.veterinaria.id;
              }
            }
            
            console.log('VeterinariaId obtenido:', veterinariaId);
            
            // Obtener el documento del propietario
            let propietarioDocumento = '';
            if (mascota) {
              if (typeof mascota.propietario === 'string') {
                propietarioDocumento = mascota.propietario;
                console.log('Propietario es string:', propietarioDocumento);
              } else if (mascota.propietario?.documento) {
                propietarioDocumento = mascota.propietario.documento;
                console.log('Propietario es objeto con documento:', propietarioDocumento);
              }
            }
            
            if (!propietarioDocumento) {
              console.error('No se pudo obtener el documento del propietario');
              setSuccess('Historia clínica creada. No se pudo crear la próxima cita: falta información del propietario');
            } else if (!veterinariaId) {
              console.error('No se pudo obtener el veterinariaId');
              setSuccess('Historia clínica creada. No se pudo crear la próxima cita: falta información de la veterinaria');
            } else {
              console.log('Creando cita con datos:', {
                fechaHora: formData.proximaCita + ':00',
                clienteDocumento: propietarioDocumento,
                mascotaId: parseInt(formData.mascotaId),
                veterinarioDocumento: formData.veterinarioId,
                veterinariaId: veterinariaId
              });
              
              const citaData: any = {
                fechaHora: formData.proximaCita + ':00',
                motivo: 'Seguimiento - Próxima consulta',
                observaciones: formData.recomendaciones || 'Cita de seguimiento',
                estado: EstadoCita.PROGRAMADA,
                clienteDocumento: propietarioDocumento,
                mascotaId: parseInt(formData.mascotaId),
                veterinarioDocumento: formData.veterinarioId,
                veterinariaId: veterinariaId
              };
              
              await citaService.createCita(citaData);
              console.log('Cita creada exitosamente');
              setSuccess('Historia clínica y próxima cita creadas exitosamente');
            }
          } catch (citaError: any) {
            console.error('Error al crear la próxima cita:', citaError);
            console.error('Detalles del error:', citaError.response?.data);
            const errorMsg = citaError.response?.data?.message || citaError.message || 'Error desconocido';
            setSuccess('Historia clínica creada, pero hubo un error al crear la próxima cita: ' + errorMsg);
          }
        } else {
          setSuccess('Historia clínica creada exitosamente');
        }
      } else if (modalMode === 'edit' && selectedHistoria) {
        await historiaClinicaService.updateHistoriaClinica(selectedHistoria.id, historiaData);
        setSuccess('Historia clínica actualizada exitosamente');
      }
      
      // Asegurar que se recarguen los datos
      await loadHistoriasClinicas();
      handleCloseModal();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error completo:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Response headers:', error.response?.headers);
      
      let errorMessage = 'Error desconocido';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError('Error al guardar la historia clínica: ' + errorMessage);
      console.error('Error saving historia clinica:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (historia: HistoriaClinica) => {
    if (window.confirm(`¿Está seguro de que desea eliminar esta historia clínica?`)) {
      try {
        setLoading(true);
        console.log('Intentando eliminar historia clínica ID:', historia.id);
        await historiaClinicaService.deleteHistoriaClinica(historia.id);
        console.log('Historia clínica eliminada exitosamente del backend');
        setSuccess('Historia clínica eliminada exitosamente');
        console.log('Recargando lista de historias clínicas...');
        await loadHistoriasClinicas();
        console.log('Lista recargada');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error: any) {
        console.error('Error completo al eliminar:', error);
        console.error('Response:', error.response);
        const errorMsg = error.response?.data?.message || error.response?.data || error.message || 'Error desconocido';
        setError('Error al eliminar la historia clínica: ' + errorMsg);
        console.error('Error deleting historia clinica:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDescargarPDF = async (historia: HistoriaClinica) => {
    try {
      setLoading(true);
      console.log('Descargando PDF para mascota ID:', historia.mascota?.id);
      
      if (!historia.mascota?.id) {
        setError('No se pudo identificar la mascota para generar el PDF');
        return;
      }
      
      const pdfBlob = await historiaClinicaService.descargarHistoriaClinicaPdf(historia.mascota.id);
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `historia_clinica_${historia.mascota.nombre}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess('PDF descargado exitosamente');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error: any) {
      console.error('Error al descargar PDF:', error);
      const errorMsg = error.response?.data?.message || error.response?.data || error.message || 'Error desconocido';
      setError('Error al descargar PDF: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatFechaHora = (fecha: string) => {
    const date = new Date(fecha);
    const fechaStr = date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const horaStr = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return `${fechaStr} - ${horaStr}`;
  };

  const getCitasByMascota = () => {
    if (!formData.mascotaId) return [];
    return citas.filter(cita => {
      const mascotaId = cita.mascotaId || cita.mascota?.id;
      return mascotaId?.toString() === formData.mascotaId;
    });
  };
  
  const loadHorariosDisponibles = async (fecha: string, veterinarioIdOverride?: string) => {
    // Obtener la veterinaria del veterinario seleccionado
    const vetId = veterinarioIdOverride || formData.veterinarioId;
    
    if (!vetId || !fecha) {
      console.log('❌ No se puede cargar horarios: falta veterinario o fecha', { vetId, fecha });
      return;
    }
    
    // Buscar el veterinario en la lista
    let veterinario = veterinarios.find(v => v.documento === vetId);
    
    // Si no se encuentra o no tiene veterinariaId, intentar obtenerlo del usuario actual
    if (!veterinario || !veterinario.veterinariaId) {
      console.log('⚠️ Veterinario no encontrado en lista o sin veterinariaId, intentando con usuario actual');
      const currentUser = authService.getCurrentUser();
      
      if (currentUser && currentUser.documento === vetId && currentUser.veterinaria?.id) {
        console.log('✅ Usando veterinaria del usuario actual:', currentUser.veterinaria.id);
        veterinario = {
          documento: currentUser.documento,
          nombres: currentUser.nombres,
          apellidos: currentUser.apellidos,
          veterinariaId: currentUser.veterinaria.id
        } as any;
      } else {
        console.log('❌ El veterinario seleccionado no tiene veterinaria asignada', {
          veterinario,
          currentUser,
          vetId,
          tieneVeterinaria: !!currentUser?.veterinaria?.id
        });
        setError('El veterinario seleccionado no tiene una veterinaria asignada');
        setHorariosDisponibles([]);
        return;
      }
    }
    
    try {
      setLoadingHorarios(true);
      console.log('📅 Cargando horarios disponibles:', {
        fecha,
        veterinariaId: veterinario.veterinariaId,
        veterinarioDocumento: veterinario.documento
      });
      
      const horarios = await citaService.getHorariosDisponibles(fecha, veterinario.veterinariaId);
      console.log('✅ Horarios cargados:', horarios.length, 'horarios disponibles');
      
      setHorariosDisponibles(horarios);
      setFechaProximaCita(fecha);
      setError(''); // Limpiar errores previos
    } catch (error: any) {
      console.error('❌ Error al cargar horarios disponibles:', error);
      setError('Error al cargar horarios disponibles: ' + (error.response?.data?.message || error.message));
      setHorariosDisponibles([]);
    } finally {
      setLoadingHorarios(false);
    }
  };
  
  const handleFechaProximaCitaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fecha = e.target.value;
    setFechaProximaCita(fecha);
    setFormData(prev => ({ ...prev, proximaCita: '' }));
    if (fecha && formData.mascotaId) {
      loadHorariosDisponibles(fecha);
    }
  };
  
  const handleSelectHorario = (e: React.MouseEvent, horario: HorarioDisponible) => {
    e.preventDefault(); // Prevenir el submit del formulario
    e.stopPropagation(); // Detener la propagación del evento
    
    if (horario.disponible) {
      const fechaHora = horario.fechaHora.substring(0, 16);
      setFormData(prev => ({ ...prev, proximaCita: fechaHora }));
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">{authService.isCliente() ? 'Historias Clínicas de Mis Mascotas' : 'Gestión de Historias Clínicas'}</h4>
              {!authService.isCliente() && (
                <Button
                  variant="primary"
                  onClick={() => handleShowModal('create')}
                  disabled={loading}
                >
                  <i className="fas fa-plus me-2"></i>
                  Nueva Historia Clínica
                </Button>
              )}
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
                      placeholder="Buscar por mascota, veterinario, motivo o diagnóstico..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={6}>
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
                      <th>Fecha Consulta</th>
                      <th>Mascota</th>
                      <th>Propietario</th>
                      <th>Veterinario</th>
                      <th>Motivo</th>
                      <th>Diagnóstico</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistorias.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4">
                          No se encontraron historias clínicas
                        </td>
                      </tr>
                    ) : (
                      filteredHistorias.map((historia) => (
                        <tr key={historia.id}>
                          <td>
                            <strong>{formatFecha(historia.fechaConsulta)}</strong>
                          </td>
                          <td>
                            {historia.mascota?.nombre || '-'}
                            {historia.mascota?.especie && (
                              <small className="text-muted d-block">
                                ({historia.mascota.especie})
                              </small>
                            )}
                          </td>
                          <td>
                            {typeof historia.mascota?.propietario === 'string'
                              ? historia.mascota.propietario
                              : historia.mascota?.propietario 
                                ? `${historia.mascota.propietario.nombres || ''} ${historia.mascota.propietario.apellidos || ''}`
                                : '-'
                            }
                          </td>
                          <td>
                            {historia.veterinario && typeof historia.veterinario === 'object'
                              ? `Dr. ${historia.veterinario.nombres || ''} ${historia.veterinario.apellidos || ''}`
                              : '-'
                            }
                          </td>
                          <td>
                            {historia.motivoConsulta ? (
                              <span>{historia.motivoConsulta.substring(0, 50)}{historia.motivoConsulta.length > 50 ? '...' : ''}</span>
                            ) : '-'}
                          </td>
                          <td>
                            {historia.diagnostico ? (
                              <span>{historia.diagnostico.substring(0, 50)}{historia.diagnostico.length > 50 ? '...' : ''}</span>
                            ) : '-'}
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                size="sm"
                                variant="info"
                                onClick={() => handleShowModal('view', historia)}
                                title="Ver detalles"
                              >
                                <i className="fas fa-eye"></i>
                              </Button>
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleDescargarPDF(historia)}
                                title="Descargar PDF de Historia Clínica Completa"
                              >
                                <i className="fas fa-file-pdf"></i>
                              </Button>
                              {!authService.isCliente() && (
                                <Button
                                  size="sm"
                                  variant="warning"
                                  onClick={() => handleShowModal('edit', historia)}
                                  title="Editar"
                                >
                                  <i className="fas fa-edit"></i>
                                </Button>
                              )}
                              {(authService.isAdmin() || authService.isVeterinario()) && (
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => handleDelete(historia)}
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
      <Modal show={showModal} onHide={handleCloseModal} size="xl" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === 'create' && '📋 Nueva Historia Clínica'}
            {modalMode === 'edit' && '📋 Editar Historia Clínica'}
            {modalMode === 'view' && '📋 Detalles de Historia Clínica'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit} id="historiaClinicaForm">
            {error && <Alert variant="danger">{error}</Alert>}
            
            {/* Información General */}
            <Card className="mb-3">
              <Card.Header className="bg-primary text-white">
                <strong>Información General</strong>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha de Consulta *</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        name="fechaConsulta"
                        value={formData.fechaConsulta}
                        onChange={handleInputChange}
                        required
                        disabled={modalMode === 'view'}
                      />
                    </Form.Group>
                  </Col>
                  
                  {/* Solo mostrar selector de propietario si NO es cliente */}
                  {!authService.isCliente() && (
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Propietario</Form.Label>
                        {modalMode === 'view' ? (
                          <Form.Control
                            type="text"
                            value={
                              selectedHistoria?.mascota?.propietario
                                ? typeof selectedHistoria.mascota.propietario === 'string'
                                  ? selectedHistoria.mascota.propietario
                                  : `${selectedHistoria.mascota.propietario.nombres || ''} ${selectedHistoria.mascota.propietario.apellidos || ''} - ${selectedHistoria.mascota.propietario.documento || ''}`
                                : 'No especificado'
                            }
                            disabled
                            readOnly
                          />
                        ) : (
                          <>
                            <Form.Select
                              name="propietarioId"
                              value={formData.propietarioId}
                              onChange={handleInputChange}
                            >
                              <option value="">Todos los propietarios</option>
                              {propietarios.map(propietario => (
                                <option key={propietario.documento} value={propietario.documento}>
                                  {`${propietario.nombres} ${propietario.apellidos} - ${propietario.documento}`}
                                </option>
                              ))}
                            </Form.Select>
                            <Form.Text className="text-muted">
                              Filtre las mascotas por propietario
                            </Form.Text>
                          </>
                        )}
                      </Form.Group>
                    </Col>
                  )}
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mascota *</Form.Label>
                      <Form.Select
                        name="mascotaId"
                        value={formData.mascotaId}
                        onChange={handleInputChange}
                        required
                        disabled={modalMode === 'view'}
                      >
                        <option value="">Seleccione una mascota</option>
                        {(filteredMascotas.length > 0 ? filteredMascotas : mascotas).map(mascota => (
                          <option key={mascota.id} value={mascota.id}>
                            {`${mascota.nombre} (${mascota.especie}) - ${mascota.propietario?.nombres || ''} ${mascota.propietario?.apellidos || ''}`}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Veterinario *</Form.Label>
                      {modalMode === 'view' || authService.isCliente() ? (
                        <Form.Control
                          type="text"
                          value={selectedHistoria?.veterinario && typeof selectedHistoria.veterinario === 'object'
                            ? `Dr. ${selectedHistoria.veterinario.nombres || ''} ${selectedHistoria.veterinario.apellidos || ''}`
                            : 'No especificado'}
                          disabled
                          readOnly
                        />
                      ) : (
                        <>
                          <Form.Select
                            name="veterinarioId"
                            value={formData.veterinarioId}
                            onChange={handleInputChange}
                            required
                            disabled={authService.isVeterinario()}
                          >
                            <option value="">Seleccione un veterinario</option>
                            {veterinarios.map(veterinario => (
                              <option key={veterinario.documento} value={veterinario.documento}>
                                {`Dr. ${veterinario.nombres || ''} ${veterinario.apellidos || ''}`}
                              </option>
                            ))}
                          </Form.Select>
                          {authService.isVeterinario() && (
                            <Form.Text className="text-muted">
                              Como veterinario, solo puede crear historias clínicas a su nombre
                            </Form.Text>
                          )}
                        </>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Cita Asociada (opcional)</Form.Label>
                      {modalMode === 'view' || authService.isCliente() ? (
                        <Form.Control
                          type="text"
                          value={selectedHistoria?.cita 
                            ? `${formatFechaHora(selectedHistoria.cita.fechaHora)} - ${selectedHistoria.cita.motivo || 'Sin motivo'} (${selectedHistoria.cita.estado})`
                            : 'Sin cita asociada'}
                          disabled
                          readOnly
                        />
                      ) : (
                        <Form.Select
                          name="citaId"
                          value={formData.citaId}
                          onChange={handleInputChange}
                          disabled={!formData.mascotaId}
                        >
                          <option value="">Sin cita asociada</option>
                          {getCitasByMascota().map(cita => (
                            <option key={cita.id} value={cita.id}>
                              {`${formatFechaHora(cita.fechaHora)} - ${cita.motivo || 'Sin motivo'} (${cita.estado})`}
                            </option>
                          ))}
                        </Form.Select>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Motivo y Síntomas */}
            <Card className="mb-3">
              <Card.Header className="bg-info text-white">
                <strong>Motivo de Consulta y Síntomas</strong>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Motivo de Consulta</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="motivoConsulta"
                    value={formData.motivoConsulta}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    placeholder="¿Por qué el propietario trae a la mascota?"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Síntomas Observados</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="sintomas"
                    value={formData.sintomas}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    placeholder="Síntomas clínicos observados durante la consulta"
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Signos Vitales */}
            <Card className="mb-3">
              <Card.Header className="bg-warning">
                <strong>Signos Vitales</strong>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3}>
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
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Temperatura (°C)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.1"
                        name="temperatura"
                        value={formData.temperatura}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        placeholder="37.5"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Frecuencia Cardíaca (lpm)</Form.Label>
                      <Form.Control
                        type="number"
                        name="frecuenciaCardiaca"
                        value={formData.frecuenciaCardiaca}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        placeholder="120"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Frecuencia Respiratoria (rpm)</Form.Label>
                      <Form.Control
                        type="number"
                        name="frecuenciaRespiratoria"
                        value={formData.frecuenciaRespiratoria}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        placeholder="30"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Diagnóstico y Tratamiento */}
            <Card className="mb-3">
              <Card.Header className="bg-success text-white">
                <strong>Diagnóstico y Tratamiento</strong>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Diagnóstico</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="diagnostico"
                    value={formData.diagnostico}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    placeholder="Diagnóstico clínico"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Tratamiento</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="tratamiento"
                    value={formData.tratamiento}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    placeholder="Plan de tratamiento prescrito"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Medicamentos</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="medicamentos"
                    value={formData.medicamentos}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    placeholder="Medicamentos recetados (nombre, dosis, frecuencia)"
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Observaciones y Recomendaciones */}
            <Card className="mb-3">
              <Card.Header className="bg-secondary text-white">
                <strong>Observaciones y Recomendaciones</strong>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Observaciones Adicionales</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    placeholder="Observaciones generales"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Recomendaciones</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="recomendaciones"
                    value={formData.recomendaciones}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    placeholder="Recomendaciones para el propietario"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Agendar Próxima Cita</Form.Label>
                  {modalMode === 'view' ? (
                    <Form.Control
                      type="text"
                      value={formData.proximaCita ? formatFechaHora(formData.proximaCita) : 'No agendada'}
                      disabled
                      readOnly
                    />
                  ) : (
                    <>
                      <Form.Control
                        type="date"
                        value={fechaProximaCita}
                        onChange={handleFechaProximaCitaChange}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      <Form.Text className="text-muted">
                        {!formData.veterinarioId && 'Primero seleccione un veterinario'}
                        {formData.veterinarioId && !fechaProximaCita && 'Seleccione una fecha para ver horarios disponibles'}
                      </Form.Text>
                    </>
                  )}
                </Form.Group>
                
                {/* Mostrar horarios disponibles */}
                {modalMode !== 'view' && fechaProximaCita && formData.veterinarioId && (
                  <Form.Group className="mb-3">
                    <Form.Label>Horarios Disponibles</Form.Label>
                    {loadingHorarios ? (
                      <div className="text-center p-3">
                        <Spinner animation="border" size="sm" /> Cargando horarios...
                      </div>
                    ) : horariosDisponibles.length > 0 ? (
                      <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '4px', padding: '10px' }}>
                        <ListGroup>
                          {horariosDisponibles.map((horario, index) => {
                            const hora = new Date(horario.fechaHora).toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: true 
                            });
                            const isSelected = formData.proximaCita === horario.fechaHora.substring(0, 16);
                            return (
                              <ListGroup.Item
                                key={index}
                                action
                                variant={isSelected ? 'primary' : horario.disponible ? 'light' : 'danger'}
                                onClick={(e) => handleSelectHorario(e, horario)}
                                disabled={!horario.disponible}
                                style={{ cursor: horario.disponible ? 'pointer' : 'not-allowed' }}
                              >
                                <div className="d-flex justify-content-between align-items-center">
                                  <span>{hora}</span>
                                  {horario.disponible ? (
                                    <Badge bg="success">Disponible</Badge>
                                  ) : (
                                    <Badge bg="danger">Ocupado</Badge>
                                  )}
                                </div>
                              </ListGroup.Item>
                            );
                          })}
                        </ListGroup>
                      </div>
                    ) : (
                      <Alert variant="info">No hay horarios disponibles para esta fecha</Alert>
                    )}
                    {formData.proximaCita && (
                      <Form.Text className="text-success">
                        ✓ Horario seleccionado: {new Date(formData.proximaCita).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </Form.Text>
                    )}
                  </Form.Group>
                )}
              </Card.Body>
            </Card>

            {modalMode === 'view' && selectedHistoria?.fechaCreacion && (
              <Alert variant="light">
                <strong>Fecha de Creación del Registro:</strong> {formatFechaHora(selectedHistoria.fechaCreacion)}
              </Alert>
            )}
          </Form>
        </Modal.Body>
          
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            {modalMode === 'view' ? 'Cerrar' : 'Cancelar'}
          </Button>
          {modalMode !== 'view' && (
            <Button variant="primary" type="submit" form="historiaClinicaForm" disabled={loading}>
              {loading && <Spinner animation="border" size="sm" className="me-2" />}
              {modalMode === 'create' ? 'Crear Historia Clínica' : 'Actualizar Historia Clínica'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default HistoriaClinicaManagement;
