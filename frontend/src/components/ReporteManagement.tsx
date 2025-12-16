import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Alert,
  Badge,
  InputGroup,
  Form,
  Spinner,
  Nav,
  Tab,
  ButtonGroup
} from 'react-bootstrap';
import {
  ReporteUsuario,
  ReporteMascota,
  ReporteCita,
  EstadisticasUsuarios,
  EstadisticasMascotas,
  EstadisticasCitas,
  getReporteUsuarios,
  getEstadisticasUsuarios,
  getReporteUsuariosPorRol,
  getReporteMascotas,
  getEstadisticasMascotas,
  getReporteMascotasPorEspecie,
  getReporteCitas,
  getEstadisticasCitas,
  getReporteCitasPorEstado,
  getReporteCitasPorFecha,
  exportarReporteCSV,
  exportarReportePDF
} from '../services/reporteService';
import { getAllVeterinarias } from '../services/veterinariaService';
import authService from '../services/authService';
import SearchableSelect from './SearchableSelect';
import './ReporteManagement.css';

const ReporteManagement: React.FC = () => {
  // Estados generales
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [activeTab, setActiveTab] = useState('usuarios');
  const [veterinarias, setVeterinarias] = useState<any[]>([]);
  const [selectedVeterinaria, setSelectedVeterinaria] = useState<string>('');

  // Estados para reportes de usuarios
  const [reporteUsuarios, setReporteUsuarios] = useState<ReporteUsuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<ReporteUsuario[]>([]);
  const [estadisticasUsuarios, setEstadisticasUsuarios] = useState<EstadisticasUsuarios | null>(null);
  const [searchUsuarios, setSearchUsuarios] = useState('');
  const [filterRol, setFilterRol] = useState('');

  // Estados para reportes de mascotas
  const [reporteMascotas, setReporteMascotas] = useState<ReporteMascota[]>([]);
  const [filteredMascotas, setFilteredMascotas] = useState<ReporteMascota[]>([]);
  const [estadisticasMascotas, setEstadisticasMascotas] = useState<EstadisticasMascotas | null>(null);
  const [searchMascotas, setSearchMascotas] = useState('');
  const [filterEspecie, setFilterEspecie] = useState('');

  // Estados para reportes de citas
  const [reporteCitas, setReporteCitas] = useState<ReporteCita[]>([]);
  const [filteredCitas, setFilteredCitas] = useState<ReporteCita[]>([]);
  const [estadisticasCitas, setEstadisticasCitas] = useState<EstadisticasCitas | null>(null);
  const [searchCitas, setSearchCitas] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Cargar datos según la pestaña activa
  useEffect(() => {
    loadVeterinarias();
    
    // Limpiar filtros al cambiar de pestaña
    setSearchUsuarios('');
    setFilterRol('');
    setSearchMascotas('');
    setFilterEspecie('');
    setSearchCitas('');
    setFilterEstado('');
    setFechaInicio('');
    setFechaFin('');
    
    if (activeTab === 'usuarios') {
      loadReporteUsuarios();
    } else if (activeTab === 'mascotas') {
      loadReporteMascotas();
    } else if (activeTab === 'citas') {
      loadReporteCitas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Recargar datos cuando cambia la veterinaria seleccionada
  useEffect(() => {
    if (activeTab === 'usuarios') {
      // Si hay un filtro de rol activo, reaplicarlo después de cargar los datos
      if (filterRol) {
        handleFilterPorRol(filterRol);
      } else {
        loadReporteUsuarios();
      }
    } else if (activeTab === 'mascotas') {
      // Si hay un filtro de especie activo, reaplicarlo después de cargar los datos
      if (filterEspecie) {
        handleFilterPorEspecie(filterEspecie);
      } else {
        loadReporteMascotas();
      }
    } else if (activeTab === 'citas') {
      // Si hay un filtro de estado activo, reaplicarlo después de cargar los datos
      if (filterEstado) {
        handleFilterPorEstado(filterEstado);
      } else {
        loadReporteCitas();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVeterinaria]);
  
  // Cargar veterinarias
  const loadVeterinarias = async () => {
    if (authService.isAdmin()) {
      try {
        const data = await getAllVeterinarias();
        setVeterinarias(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading veterinarias:', error);
        setVeterinarias([]);
      }
    }
  };

  // Filtrar usuarios
  useEffect(() => {
    // Solo aplicar filtrado local para búsqueda por texto
    // El filtrado por rol se hace desde el backend
    if (searchUsuarios) {
      filterUsuariosData();
    } else {
      setFilteredUsuarios(reporteUsuarios);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reporteUsuarios, searchUsuarios]);

  // Filtrar mascotas
  useEffect(() => {
    // Solo aplicar filtrado local para búsqueda por texto
    // El filtrado por especie se hace desde el backend
    if (searchMascotas) {
      filterMascotasData();
    } else {
      setFilteredMascotas(reporteMascotas);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reporteMascotas, searchMascotas]);

  // Filtrar citas
  useEffect(() => {
    // Solo aplicar filtrado local para búsqueda por texto
    // El filtrado por estado se hace desde el backend
    if (searchCitas) {
      filterCitasData();
    } else {
      setFilteredCitas(reporteCitas);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reporteCitas, searchCitas]);

  // ==================== FUNCIONES DE CARGA ====================

  const loadReporteUsuarios = async () => {
    try {
      setLoading(true);
      const veterinariaId = selectedVeterinaria ? parseInt(selectedVeterinaria) : undefined;
      const [reporte, stats] = await Promise.all([
        getReporteUsuarios(veterinariaId),
        getEstadisticasUsuarios(veterinariaId)
      ]);
      setReporteUsuarios(reporte);
      setFilteredUsuarios(reporte);
      setEstadisticasUsuarios(stats);
      setError('');
    } catch (error: any) {
      setError('Error al cargar el reporte de usuarios');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReporteMascotas = async () => {
    try {
      setLoading(true);
      const veterinariaId = selectedVeterinaria ? parseInt(selectedVeterinaria) : undefined;
      const [reporte, stats] = await Promise.all([
        getReporteMascotas(veterinariaId),
        getEstadisticasMascotas(veterinariaId)
      ]);
      setReporteMascotas(reporte);
      setFilteredMascotas(reporte);
      setEstadisticasMascotas(stats);
      setError('');
    } catch (error: any) {
      setError('Error al cargar el reporte de mascotas');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReporteCitas = async () => {
    try {
      setLoading(true);
      const veterinariaId = selectedVeterinaria ? parseInt(selectedVeterinaria) : undefined;
      const [reporte, stats] = await Promise.all([
        getReporteCitas(veterinariaId),
        getEstadisticasCitas(veterinariaId)
      ]);
      setReporteCitas(reporte);
      setFilteredCitas(reporte);
      setEstadisticasCitas(stats);
      setError('');
    } catch (error: any) {
      setError('Error al cargar el reporte de citas');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== FUNCIONES DE FILTRADO ====================

  const filterUsuariosData = () => {
    let filtered = reporteUsuarios;

    if (searchUsuarios) {
      filtered = filtered.filter(u =>
        u.username.toLowerCase().includes(searchUsuarios.toLowerCase()) ||
        u.nombres?.toLowerCase().includes(searchUsuarios.toLowerCase()) ||
        u.apellidos?.toLowerCase().includes(searchUsuarios.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchUsuarios.toLowerCase()) ||
        u.documento.toLowerCase().includes(searchUsuarios.toLowerCase())
      );
    }

    setFilteredUsuarios(filtered);
  };

  const filterMascotasData = () => {
    let filtered = reporteMascotas;

    if (searchMascotas) {
      filtered = filtered.filter(m =>
        m.nombre.toLowerCase().includes(searchMascotas.toLowerCase()) ||
        m.propietarioNombre?.toLowerCase().includes(searchMascotas.toLowerCase()) ||
        m.propietarioApellido?.toLowerCase().includes(searchMascotas.toLowerCase()) ||
        m.raza?.toLowerCase().includes(searchMascotas.toLowerCase())
      );
    }

    setFilteredMascotas(filtered);
  };

  const filterCitasData = () => {
    let filtered = reporteCitas;

    if (searchCitas) {
      filtered = filtered.filter(c =>
        c.clienteNombre?.toLowerCase().includes(searchCitas.toLowerCase()) ||
        c.mascotaNombre?.toLowerCase().includes(searchCitas.toLowerCase()) ||
        c.veterinarioNombre?.toLowerCase().includes(searchCitas.toLowerCase()) ||
        c.motivo?.toLowerCase().includes(searchCitas.toLowerCase())
      );
    }

    setFilteredCitas(filtered);
  };

  // ==================== FUNCIONES DE FILTRO ESPECIAL ====================

  const handleFilterPorRol = async (rol: string) => {
    if (!rol) {
      await loadReporteUsuarios();
      return;
    }
    
    try {
      setLoading(true);
      // Obtener todos los usuarios y filtrar localmente por rol
      const veterinariaId = selectedVeterinaria ? parseInt(selectedVeterinaria) : undefined;
      const [reporte, stats] = await Promise.all([
        getReporteUsuarios(veterinariaId),
        getEstadisticasUsuarios(veterinariaId)
      ]);
      
      // Filtrar por rol localmente
      const filtered = reporte.filter(u => normalizeRole(u.rol) === rol);
      
      setReporteUsuarios(filtered);
      setFilteredUsuarios(filtered);
      setEstadisticasUsuarios(stats);
      setError('');
    } catch (error: any) {
      setError('Error al filtrar usuarios por rol');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterPorEspecie = async (especie: string) => {
    if (!especie) {
      await loadReporteMascotas();
      return;
    }

    try {
      setLoading(true);
      // Obtener todas las mascotas y filtrar localmente por especie
      const veterinariaId = selectedVeterinaria ? parseInt(selectedVeterinaria) : undefined;
      const [reporte, stats] = await Promise.all([
        getReporteMascotas(veterinariaId),
        getEstadisticasMascotas(veterinariaId)
      ]);
      
      // Filtrar por especie localmente
      const filtered = reporte.filter(m => m.especie.toLowerCase() === especie.toLowerCase());
      
      setReporteMascotas(filtered);
      setFilteredMascotas(filtered);
      setEstadisticasMascotas(stats);
      setError('');
    } catch (error: any) {
      setError('Error al filtrar mascotas por especie');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterPorEstado = async (estado: string) => {
    if (!estado) {
      await loadReporteCitas();
      return;
    }

    try {
      setLoading(true);
      // Obtener todas las citas y filtrar localmente por estado
      const veterinariaId = selectedVeterinaria ? parseInt(selectedVeterinaria) : undefined;
      const [reporte, stats] = await Promise.all([
        getReporteCitas(veterinariaId),
        getEstadisticasCitas(veterinariaId)
      ]);
      
      // Filtrar por estado localmente
      const filtered = reporte.filter(c => c.estado === estado);
      
      setReporteCitas(filtered);
      setFilteredCitas(filtered);
      setEstadisticasCitas(stats);
      setError('');
    } catch (error: any) {
      setError('Error al filtrar citas por estado');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterPorFecha = async () => {
    if (!fechaInicio || !fechaFin) {
      setError('Debe seleccionar ambas fechas');
      return;
    }

    try {
      setLoading(true);
      const reporte = await getReporteCitasPorFecha(fechaInicio, fechaFin);
      setReporteCitas(reporte);
      setError('');
    } catch (error: any) {
      setError('Error al filtrar citas por fecha');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== FUNCIONES DE EXPORTACIÓN ====================

  const handleExportCSV = async (tipo: 'usuarios' | 'mascotas' | 'citas') => {
    try {
      setLoading(true);
      
      // Exportar los datos filtrados directamente desde el frontend
      let csvContent = '';
      let filename = '';
      
      if (tipo === 'usuarios') {
        // Encabezados
        csvContent = 'Documento,Usuario,Nombres,Apellidos,Email,Teléfono,Rol,Estado,Mascotas,Citas,Fecha Registro\n';
        // Datos
        filteredUsuarios.forEach(u => {
          csvContent += `${u.documento},"${u.username}","${u.nombres || ''}","${u.apellidos || ''}","${u.email || ''}","${u.telefono || ''}","${u.rol}","${u.activo ? 'Activo' : 'Inactivo'}",${u.totalMascotas || 0},${u.totalCitas || 0},"${formatFecha(u.fechaRegistro || '')}"\n`;
        });
        filename = `reporte_usuarios_${new Date().toISOString().split('T')[0]}.csv`;
      } else if (tipo === 'mascotas') {
        // Encabezados
        csvContent = 'ID,Nombre,Especie,Raza,Sexo,Edad,Propietario,Citas,Historias,Última Cita\n';
        // Datos
        filteredMascotas.forEach(m => {
          csvContent += `${m.id},"${m.nombre}","${m.especie}","${m.raza || ''}","${m.sexo || ''}","${m.edad || ''}","${m.propietarioNombre || ''} ${m.propietarioApellido || ''}",${m.totalCitas || 0},${m.totalHistorias || 0},"${formatFecha(m.ultimaCita || '')}"\n`;
        });
        filename = `reporte_mascotas_${new Date().toISOString().split('T')[0]}.csv`;
      } else if (tipo === 'citas') {
        // Encabezados
        csvContent = 'ID,Fecha y Hora,Cliente,Mascota,Veterinario,Veterinaria,Motivo,Estado\n';
        // Datos
        filteredCitas.forEach(c => {
          csvContent += `${c.id},"${formatFechaHora(c.fechaHora)}","${c.clienteNombre || ''}","${c.mascotaNombre || ''}","${c.veterinarioNombre || ''}","${c.veterinariaNombre || ''}","${c.motivo || ''}","${c.estado}"\n`;
        });
        filename = `reporte_citas_${new Date().toISOString().split('T')[0]}.csv`;
      }
      
      // Crear blob y descargar
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Reporte CSV exportado exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError('Error al exportar el reporte CSV.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async (tipo: 'usuarios' | 'mascotas' | 'citas') => {
    try {
      setLoading(true);
      const veterinariaId = selectedVeterinaria ? parseInt(selectedVeterinaria) : undefined;
      
      // Construir parámetros de filtros según el tipo de reporte
      const filtros: any = {};
      
      if (tipo === 'usuarios') {
        if (filterRol) filtros.rol = filterRol;
        if (searchUsuarios) filtros.search = searchUsuarios;
      } else if (tipo === 'mascotas') {
        if (filterEspecie) filtros.especie = filterEspecie;
        if (searchMascotas) filtros.search = searchMascotas;
      } else if (tipo === 'citas') {
        if (filterEstado) filtros.estado = filterEstado;
        if (searchCitas) filtros.search = searchCitas;
        if (fechaInicio) filtros.fechaInicio = fechaInicio;
        if (fechaFin) filtros.fechaFin = fechaFin;
      }
      
      await exportarReportePDF(tipo, veterinariaId, filtros);
      setSuccess('Reporte PDF exportado exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError('Error al exportar el reporte PDF.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== FUNCIONES AUXILIARES ====================

  const normalizeRole = (rol: string): string => {
    // Remover el prefijo ROLE_ si existe
    return rol.replace(/^ROLE_/, '');
  };

  const getRoleBadgeColor = (rol: string) => {
    // Normalizar el rol antes de comparar
    const normalizedRole = normalizeRole(rol);
    switch (normalizedRole) {
      case 'ADMIN': return 'danger';
      case 'VETERINARIO': return 'primary';
      case 'RECEPCIONISTA': return 'info';
      case 'CLIENTE': return 'secondary';
      default: return 'secondary';
    }
  };

  const getEstadoCitaBadgeColor = (estado: string) => {
    switch (estado) {
      case 'PROGRAMADA': return 'warning';
      case 'CONFIRMADA': return 'info';
      case 'EN_CURSO': return 'primary';
      case 'COMPLETADA': return 'success';
      case 'CANCELADA': return 'danger';
      case 'NO_ASISTIO': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatFecha = (fecha: string) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatFechaHora = (fecha: string) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ==================== COMPONENTES DE ESTADÍSTICAS ====================

  const EstadisticasUsuariosCard = () => (
    <Row className="mb-4">
      {estadisticasUsuarios && (
        <>
          <Col md={3}>
            <Card className="text-center h-100">
              <Card.Body>
                <h5 className="text-muted">Total Usuarios</h5>
                <h2 className="text-primary">{estadisticasUsuarios.totalUsuarios}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center h-100">
              <Card.Body>
                <h5 className="text-muted">Activos</h5>
                <h2 className="text-success">{estadisticasUsuarios.totalActivos}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center h-100">
              <Card.Body>
                <h5 className="text-muted">Inactivos</h5>
                <h2 className="text-danger">{estadisticasUsuarios.totalInactivos}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100">
              <Card.Body>
                <h6 className="text-muted mb-3">Por Rol</h6>
                {Object.entries(estadisticasUsuarios.totalPorRol).map(([rol, total]) => (
                  <div key={rol} className="d-flex justify-content-between mb-2">
                    <Badge bg={getRoleBadgeColor(rol)}>{normalizeRole(rol)}</Badge>
                    <strong>{total}</strong>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </>
      )}
    </Row>
  );

  const EstadisticasMascotasCard = () => (
    <Row className="mb-4">
      {estadisticasMascotas && (
        <>
          <Col md={3}>
            <Card className="text-center h-100">
              <Card.Body>
                <h5 className="text-muted">Total Mascotas</h5>
                <h2 className="text-primary">{estadisticasMascotas.totalMascotas}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center h-100">
              <Card.Body>
                <h5 className="text-muted">Promedio Edad</h5>
                <h2 className="text-info">
                  {estadisticasMascotas.promedioEdad 
                    ? `${estadisticasMascotas.promedioEdad.toFixed(1)} años` 
                    : 'N/A'}
                </h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100">
              <Card.Body>
                <h6 className="text-muted mb-3">Por Especie</h6>
                {Object.entries(estadisticasMascotas.totalPorEspecie).map(([especie, total]) => (
                  <div key={especie} className="d-flex justify-content-between mb-2">
                    <Badge bg="primary">{especie}</Badge>
                    <strong>{total}</strong>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100">
              <Card.Body>
                <h6 className="text-muted mb-3">Por Sexo</h6>
                {Object.entries(estadisticasMascotas.totalPorSexo).map(([sexo, total]) => (
                  <div key={sexo} className="d-flex justify-content-between mb-2">
                    <Badge bg="secondary">{sexo}</Badge>
                    <strong>{total}</strong>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </>
      )}
    </Row>
  );

  const EstadisticasCitasCard = () => (
    <Row className="mb-4">
      {estadisticasCitas && (
        <>
          <Col md={3}>
            <Card className="text-center h-100">
              <Card.Body>
                <h5 className="text-muted">Total Citas</h5>
                <h2 className="text-primary">{estadisticasCitas.totalCitas}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center h-100">
              <Card.Body>
                <h5 className="text-muted">Citas Hoy</h5>
                <h2 className="text-info">{estadisticasCitas.citasHoy}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center h-100">
              <Card.Body>
                <h5 className="text-muted">Esta Semana</h5>
                <h2 className="text-warning">{estadisticasCitas.citasSemana}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100">
              <Card.Body>
                <h6 className="text-muted mb-3">Por Estado</h6>
                {Object.entries(estadisticasCitas.totalPorEstado).map(([estado, total]) => (
                  <div key={estado} className="d-flex justify-content-between mb-2">
                    <Badge bg={getEstadoCitaBadgeColor(estado)}>{estado}</Badge>
                    <strong>{total}</strong>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </>
      )}
    </Row>
  );

  // ==================== RENDER ====================

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4 className="mb-0">Gestión de Reportes</h4>
            </Card.Header>

            <Card.Body>
              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
              {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

              <div className="reportes-tabs-container">
                <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'usuarios')}>
                  <Nav variant="tabs" className="mb-4">
                    <Nav.Item>
                      <Nav.Link eventKey="usuarios" data-report-type="usuarios">
                        <i className="fas fa-users me-2"></i>
                        Reportes de Usuarios
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="mascotas" data-report-type="mascotas">
                        <i className="fas fa-paw me-2"></i>
                        Reportes de Mascotas
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="citas" data-report-type="citas">
                        <i className="fas fa-calendar-alt me-2"></i>
                        Reportes de Citas
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>

                  <Tab.Content>
                    {/* TAB DE USUARIOS */}
                    <Tab.Pane eventKey="usuarios">
                    <EstadisticasUsuariosCard />

                    <Row className="mb-3">
                      <Col md={authService.isAdmin() ? 2 : 3}>
                        <InputGroup>
                          <InputGroup.Text>
                            <i className="fas fa-search"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            placeholder="Buscar usuario..."
                            value={searchUsuarios}
                            onChange={(e) => setSearchUsuarios(e.target.value)}
                          />
                        </InputGroup>
                      </Col>
                      <Col md={authService.isAdmin() ? 2 : 2}>
                        <SearchableSelect
                          options={[
                            { value: '', label: 'Todos los roles' },
                            { value: 'ADMIN', label: 'Administrador' },
                            { value: 'VETERINARIO', label: 'Veterinario' },
                            { value: 'RECEPCIONISTA', label: 'Recepcionista' },
                            { value: 'CLIENTE', label: 'Cliente' }
                          ]}
                          value={filterRol}
                          onChange={(value) => {
                            setFilterRol(value);
                            handleFilterPorRol(value);
                          }}
                          placeholder="Todos los roles"
                        />
                      </Col>
                      {authService.isAdmin() && (
                        <Col md={2}>
                          <SearchableSelect
                            options={[
                              { value: '', label: 'Todas las veterinarias' },
                              ...veterinarias.map((vet) => ({
                                value: vet.id.toString(),
                                label: vet.nombre
                              }))
                            ]}
                            value={selectedVeterinaria}
                            onChange={setSelectedVeterinaria}
                            placeholder="Todas las veterinarias"
                          />
                        </Col>
                      )}
                      <Col md={1}>
                        <Button
                          variant="outline-secondary"
                          className="w-100"
                          onClick={async () => {
                            setSearchUsuarios('');
                            setFilterRol('');
                            setSelectedVeterinaria('');
                            await loadReporteUsuarios();
                          }}
                          title="Limpiar filtros"
                        >
                          <i className="fas fa-eraser"></i>
                        </Button>
                      </Col>
                      <Col md={1}>
                        <Button 
                          variant="outline-primary" 
                          onClick={loadReporteUsuarios}
                          disabled={loading}
                          className="w-100"
                        >
                          <i className="fas fa-sync"></i>
                        </Button>
                      </Col>
                      <Col md={authService.isAdmin() ? 2 : 3}>
                        <ButtonGroup className="w-100">
                          <Button 
                            variant="success" 
                            onClick={() => handleExportCSV('usuarios')}
                            disabled={loading}
                          >
                            <i className="fas fa-file-csv me-1"></i>
                            CSV
                          </Button>
                          <Button 
                            variant="danger" 
                            onClick={() => handleExportPDF('usuarios')}
                            disabled={loading}
                          >
                            <i className="fas fa-file-pdf me-1"></i>
                            PDF
                          </Button>
                        </ButtonGroup>
                      </Col>
                    </Row>

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
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Mascotas</th>
                            <th>Citas</th>
                            <th>Fecha Registro</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsuarios.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="text-center py-4">
                                No se encontraron usuarios
                              </td>
                            </tr>
                          ) : (
                            filteredUsuarios.map((usuario) => (
                              <tr key={usuario.documento}>
                                <td>{usuario.documento}</td>
                                <td><strong>{usuario.username}</strong></td>
                                <td>{`${usuario.nombres} ${usuario.apellidos}`}</td>
                                <td>{usuario.email}</td>
                                <td>
                                  <Badge bg={getRoleBadgeColor(usuario.rol)}>
                                    {normalizeRole(usuario.rol)}
                                  </Badge>
                                </td>
                                <td>
                                  <Badge bg={usuario.activo ? 'success' : 'danger'}>
                                    {usuario.activo ? 'Activo' : 'Inactivo'}
                                  </Badge>
                                </td>
                                <td className="text-center">{usuario.totalMascotas || 0}</td>
                                <td className="text-center">{usuario.totalCitas || 0}</td>
                                <td>{formatFecha(usuario.fechaRegistro || '')}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    )}
                  </Tab.Pane>

                  {/* TAB DE MASCOTAS */}
                  <Tab.Pane eventKey="mascotas">
                    <EstadisticasMascotasCard />

                    <Row className="mb-3">
                      <Col md={authService.isAdmin() ? 2 : 3}>
                        <InputGroup>
                          <InputGroup.Text>
                            <i className="fas fa-search"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            placeholder="Buscar mascota..."
                            value={searchMascotas}
                            onChange={(e) => setSearchMascotas(e.target.value)}
                          />
                        </InputGroup>
                      </Col>
                      <Col md={authService.isAdmin() ? 2 : 2}>
                        <SearchableSelect
                          options={[
                            { value: '', label: 'Todas las especies' },
                            { value: 'Perro', label: 'Perro' },
                            { value: 'Gato', label: 'Gato' },
                            { value: 'Ave', label: 'Ave' },
                            { value: 'Roedor', label: 'Roedor' },
                            { value: 'Reptil', label: 'Reptil' },
                            { value: 'Otro', label: 'Otro' }
                          ]}
                          value={filterEspecie}
                          onChange={(value) => {
                            setFilterEspecie(value);
                            handleFilterPorEspecie(value);
                          }}
                          placeholder="Todas las especies"
                        />
                      </Col>
                      {authService.isAdmin() && (
                        <Col md={2}>
                          <SearchableSelect
                            options={[
                              { value: '', label: 'Todas las veterinarias' },
                              ...veterinarias.map((vet) => ({
                                value: vet.id.toString(),
                                label: vet.nombre
                              }))
                            ]}
                            value={selectedVeterinaria}
                            onChange={setSelectedVeterinaria}
                            placeholder="Todas las veterinarias"
                          />
                        </Col>
                      )}
                      <Col md={1}>
                        <Button
                          variant="outline-secondary"
                          className="w-100"
                          onClick={async () => {
                            setSearchMascotas('');
                            setFilterEspecie('');
                            setSelectedVeterinaria('');
                            await loadReporteMascotas();
                          }}
                          title="Limpiar filtros"
                        >
                          <i className="fas fa-eraser"></i>
                        </Button>
                      </Col>
                      <Col md={1}>
                        <Button 
                          variant="outline-primary" 
                          onClick={loadReporteMascotas}
                          disabled={loading}
                          className="w-100"
                        >
                          <i className="fas fa-sync"></i>
                        </Button>
                      </Col>
                      <Col md={authService.isAdmin() ? 2 : 3}>
                        <ButtonGroup className="w-100">
                          <Button 
                            variant="success" 
                            onClick={() => handleExportCSV('mascotas')}
                            disabled={loading}
                          >
                            <i className="fas fa-file-csv me-1"></i>
                            CSV
                          </Button>
                          <Button 
                            variant="danger" 
                            onClick={() => handleExportPDF('mascotas')}
                            disabled={loading}
                          >
                            <i className="fas fa-file-pdf me-1"></i>
                            PDF
                          </Button>
                        </ButtonGroup>
                      </Col>
                    </Row>

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
                            <th>Especie</th>
                            <th>Raza</th>
                            <th>Sexo</th>
                            <th>Edad</th>
                            <th>Propietario</th>
                            <th>Citas</th>
                            <th>Historias</th>
                            <th>Última Cita</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMascotas.length === 0 ? (
                            <tr>
                              <td colSpan={10} className="text-center py-4">
                                No se encontraron mascotas
                              </td>
                            </tr>
                          ) : (
                            filteredMascotas.map((mascota) => (
                              <tr key={mascota.id}>
                                <td>{mascota.id}</td>
                                <td><strong>{mascota.nombre}</strong></td>
                                <td>{mascota.especie}</td>
                                <td>{mascota.raza || '-'}</td>
                                <td>{mascota.sexo || '-'}</td>
                                <td>{mascota.edad ? `${mascota.edad} años` : '-'}</td>
                                <td>{`${mascota.propietarioNombre || ''} ${mascota.propietarioApellido || ''}`}</td>
                                <td className="text-center">{mascota.totalCitas || 0}</td>
                                <td className="text-center">{mascota.totalHistorias || 0}</td>
                                <td>{formatFecha(mascota.ultimaCita || '')}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    )}
                  </Tab.Pane>

                  {/* TAB DE CITAS */}
                  <Tab.Pane eventKey="citas">
                    <EstadisticasCitasCard />

                    <Row className="mb-3">
                      <Col md={authService.isAdmin() ? 2 : 3}>
                        <InputGroup>
                          <InputGroup.Text>
                            <i className="fas fa-search"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            placeholder="Buscar cita..."
                            value={searchCitas}
                            onChange={(e) => setSearchCitas(e.target.value)}
                          />
                        </InputGroup>
                      </Col>
                      <Col md={2}>
                        <SearchableSelect
                          options={[
                            { value: '', label: 'Todos los estados' },
                            { value: 'PROGRAMADA', label: 'Programada' },
                            { value: 'CONFIRMADA', label: 'Confirmada' },
                            { value: 'EN_CURSO', label: 'En Curso' },
                            { value: 'COMPLETADA', label: 'Completada' },
                            { value: 'CANCELADA', label: 'Cancelada' },
                            { value: 'NO_ASISTIO', label: 'No Asistió' }
                          ]}
                          value={filterEstado}
                          onChange={(value) => {
                            setFilterEstado(value);
                            handleFilterPorEstado(value);
                          }}
                          placeholder="Todos los estados"
                        />
                      </Col>
                      {authService.isAdmin() && (
                        <Col md={2}>
                          <SearchableSelect
                            options={[
                              { value: '', label: 'Todas las veterinarias' },
                              ...veterinarias.map((vet) => ({
                                value: vet.id.toString(),
                                label: vet.nombre
                              }))
                            ]}
                            value={selectedVeterinaria}
                            onChange={setSelectedVeterinaria}
                            placeholder="Todas las veterinarias"
                          />
                        </Col>
                      )}
                      <Col md={2}>
                        <Form.Control
                          type="date"
                          value={fechaInicio}
                          onChange={(e) => setFechaInicio(e.target.value)}
                          placeholder="Fecha inicio"
                        />
                      </Col>
                      <Col md={2}>
                        <Form.Control
                          type="date"
                          value={fechaFin}
                          onChange={(e) => setFechaFin(e.target.value)}
                          placeholder="Fecha fin"
                        />
                      </Col>
                      <Col md={1}>
                        <Button
                          variant="outline-secondary"
                          className="w-100"
                          onClick={async () => {
                            setSearchCitas('');
                            setFilterEstado('');
                            setSelectedVeterinaria('');
                            setFechaInicio('');
                            setFechaFin('');
                            await loadReporteCitas();
                          }}
                          title="Limpiar filtros"
                        >
                          <i className="fas fa-eraser"></i>
                        </Button>
                      </Col>
                      <Col md={1}>
                        <Button 
                          variant="outline-secondary" 
                          onClick={handleFilterPorFecha}
                          disabled={loading || !fechaInicio || !fechaFin}
                          title="Filtrar por rango de fechas"
                          className="w-100"
                        >
                          <i className="fas fa-filter"></i>
                        </Button>
                      </Col>
                      <Col md={1}>
                        <Button 
                          variant="outline-primary" 
                          onClick={loadReporteCitas}
                          disabled={loading}
                          title="Actualizar"
                          className="w-100"
                        >
                          <i className="fas fa-sync"></i>
                        </Button>
                      </Col>
                      <Col md={authService.isAdmin() ? 2 : 3}>
                        <ButtonGroup className="w-100">
                          <Button 
                            variant="success" 
                            onClick={() => handleExportCSV('citas')}
                            disabled={loading}
                          >
                            <i className="fas fa-file-csv me-1"></i>
                            CSV
                          </Button>
                          <Button 
                            variant="danger" 
                            onClick={() => handleExportPDF('citas')}
                            disabled={loading}
                          >
                            <i className="fas fa-file-pdf me-1"></i>
                            PDF
                          </Button>
                        </ButtonGroup>
                      </Col>
                    </Row>

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
                            <th>Fecha y Hora</th>
                            <th>Cliente</th>
                            <th>Mascota</th>
                            <th>Veterinario</th>
                            <th>Veterinaria</th>
                            <th>Motivo</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCitas.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="text-center py-4">
                                No se encontraron citas
                              </td>
                            </tr>
                          ) : (
                            filteredCitas.map((cita) => (
                              <tr key={cita.id}>
                                <td>{cita.id}</td>
                                <td>{formatFechaHora(cita.fechaHora)}</td>
                                <td>{cita.clienteNombre || '-'}</td>
                                <td>
                                  {cita.mascotaNombre && (
                                    <div>
                                      <strong>{cita.mascotaNombre}</strong>
                                      <br />
                                      <small className="text-muted">{cita.mascotaEspecie}</small>
                                    </div>
                                  )}
                                </td>
                                <td>{cita.veterinarioNombre || '-'}</td>
                                <td>{cita.veterinariaNombre || '-'}</td>
                                <td>{cita.motivo || '-'}</td>
                                <td>
                                  <Badge bg={getEstadoCitaBadgeColor(cita.estado)}>
                                    {cita.estado}
                                  </Badge>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    )}
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ReporteManagement;
