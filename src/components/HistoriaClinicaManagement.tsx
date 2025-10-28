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
  Accordion
} from 'react-bootstrap';
import { HistoriaClinica, EstadoCita } from '../types';
import historiaClinicaService from '../services/historiaClinicaService';
import mascotaService from '../services/mascotaService';
import { getAllUsuarios } from '../services/userService';
import citaService from '../services/citaService';
import authService from '../services/authService';

const HistoriaClinicaManagement: React.FC = () => {
  const [historiasClinicas, setHistoriasClinicas] = useState<HistoriaClinica[]>([]);
  const [filteredHistorias, setFilteredHistorias] = useState<HistoriaClinica[]>([]);
  const [mascotas, setMascotas] = useState<any[]>([]);
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
    mascotaId: '',
    veterinarioId: '',
    citaId: ''
  });

  useEffect(() => {
    loadHistoriasClinicas();
    loadMascotas();
    loadVeterinarios();
    loadCitas();
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
      
      setMascotas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading mascotas:', error);
      setMascotas([]);
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
      setVeterinarios(veterinariosList);
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

  const filterHistorias = () => {
    let filtered = historiasClinicas;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(historia =>
        historia.motivoConsulta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        historia.diagnostico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        historia.mascota?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        historia.veterinario?.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        historia.veterinario?.apellidos?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por fecha
    if (filterByFecha) {
      filtered = filtered.filter(historia => {
        const historiaFecha = new Date(historia.fechaConsulta).toISOString().split('T')[0];
        return historiaFecha === filterByFecha;
      });
    }

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
      citaId: ''
    });
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
        veterinarioId: historia.veterinario?.documento || '',
        citaId: historia.cita?.id?.toString() || ''
      });
    } else {
      resetForm();
      // Establecer fecha actual por defecto
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setFormData(prev => ({
        ...prev,
        fechaConsulta: now.toISOString().slice(0, 16)
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        proximaCita: formData.proximaCita ? new Date(formData.proximaCita + ':00.000').toISOString() : null,
        mascota: {
          id: parseInt(formData.mascotaId)
        },
        veterinario: {
          documento: formData.veterinarioId
        },
        ...(formData.citaId && {
          cita: {
            id: parseInt(formData.citaId)
          }
        })
      };
      
      if (modalMode === 'create') {
        const nuevaHistoria = await historiaClinicaService.createHistoriaClinica(historiaData);
        
        // Si hay próxima cita, crear una cita en el sistema
        if (formData.proximaCita) {
          try {
            const mascota = mascotas.find(m => m.id === parseInt(formData.mascotaId));
            console.log('Mascota encontrada:', mascota);
            
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
            } else {
              console.log('Creando cita con datos:', {
                fechaHora: formData.proximaCita + ':00.000',
                propietarioDocumento,
                mascotaId: formData.mascotaId,
                veterinarioId: formData.veterinarioId
              });
              
              const citaData: any = {
                fechaHora: formData.proximaCita + ':00.000',
                motivo: 'Seguimiento - Próxima consulta',
                observaciones: formData.recomendaciones || 'Cita de seguimiento',
                estado: EstadoCita.PROGRAMADA,
                cliente: {
                  documento: propietarioDocumento
                },
                mascota: {
                  id: parseInt(formData.mascotaId)
                },
                veterinario: {
                  documento: formData.veterinarioId
                }
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
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCitasByMascota = () => {
    if (!formData.mascotaId) return [];
    return citas.filter(cita => {
      const mascotaId = cita.mascotaId || cita.mascota?.id;
      return mascotaId?.toString() === formData.mascotaId;
    });
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
                            {historia.veterinario 
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
      <Modal show={showModal} onHide={handleCloseModal} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === 'create' && '📋 Nueva Historia Clínica'}
            {modalMode === 'edit' && '📋 Editar Historia Clínica'}
            {modalMode === 'view' && '📋 Detalles de Historia Clínica'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
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
                        {mascotas.map(mascota => (
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
                      <Form.Select
                        name="veterinarioId"
                        value={formData.veterinarioId}
                        onChange={handleInputChange}
                        required
                        disabled={modalMode === 'view'}
                      >
                        <option value="">Seleccione un veterinario</option>
                        {veterinarios.map(veterinario => (
                          <option key={veterinario.documento} value={veterinario.documento}>
                            {`Dr. ${veterinario.nombres || ''} ${veterinario.apellidos || ''}`}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Cita Asociada (opcional)</Form.Label>
                      <Form.Select
                        name="citaId"
                        value={formData.citaId}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view' || !formData.mascotaId}
                      >
                        <option value="">Sin cita asociada</option>
                        {getCitasByMascota().map(cita => (
                          <option key={cita.id} value={cita.id}>
                            {`${formatFechaHora(cita.fechaHora)} - ${cita.motivo || 'Sin motivo'} (${cita.estado})`}
                          </option>
                        ))}
                      </Form.Select>
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
                  <Form.Label>Próxima Cita</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="proximaCita"
                    value={formData.proximaCita}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            {modalMode === 'view' && selectedHistoria?.fechaCreacion && (
              <Alert variant="light">
                <strong>Fecha de Creación del Registro:</strong> {formatFechaHora(selectedHistoria.fechaCreacion)}
              </Alert>
            )}
          </Modal.Body>
          
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              {modalMode === 'view' ? 'Cerrar' : 'Cancelar'}
            </Button>
            {modalMode !== 'view' && (
              <Button variant="primary" type="submit" disabled={loading}>
                {loading && <Spinner animation="border" size="sm" className="me-2" />}
                {modalMode === 'create' ? 'Crear Historia Clínica' : 'Actualizar Historia Clínica'}
              </Button>
            )}
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default HistoriaClinicaManagement;
