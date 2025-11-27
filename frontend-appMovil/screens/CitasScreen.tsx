import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../services/apiClient';

export default function CitasScreen({ onBack }: { onBack: () => void }) {
  const [citas, setCitas] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [mascotas, setMascotas] = useState<any[]>([]);
  const [veterinarios, setVeterinarios] = useState<any[]>([]);
  const [veterinarias, setVeterinarias] = useState<any[]>([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState<any[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCita, setEditingCita] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    fechaHora: '',
    motivo: '',
    observaciones: '',
    clienteId: '',
    mascotaId: '',
    veterinarioId: '',
    veterinariaId: '',
  });

  useEffect(() => {
    console.log('🔄 CitasScreen montado - Cargando datos iniciales...');
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      console.log('👤 Usuario actual:', currentUser.username, '- Roles:', currentUser.roles);
      loadCitas();
      loadVeterinarias();
      
      // Solo cargar listas completas si es ADMIN, VETERINARIO o RECEPCIONISTA
      const isAdminOrStaff = currentUser.roles?.some((role: string) => 
        ['ROLE_ADMIN', 'ROLE_VETERINARIO', 'ROLE_RECEPCIONISTA', 'ADMIN', 'VETERINARIO', 'RECEPCIONISTA'].includes(role)
      );
      
      if (isAdminOrStaff) {
        console.log('✅ Usuario con permisos de staff - Cargando todas las listas');
        loadClientes();
        loadMascotas();
        // NO cargar veterinarios aquí - se cargarán al seleccionar veterinaria
      } else {
        console.log('👥 Cliente - Solo cargando sus propios datos');
        loadClienteData();
      }
    }
  }, [currentUser]);

  const loadCurrentUser = async () => {
    try {
      const userStr = await AsyncStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error al cargar usuario actual:', error);
    }
  };

  const loadClienteData = async () => {
    try {
      // Para clientes, pre-cargar sus datos
      if (currentUser) {
        console.log('📝 Pre-cargando datos del cliente:', currentUser.documento);
        setClientes([{
          documento: currentUser.documento,
          nombres: currentUser.nombres,
          apellidos: currentUser.apellidos,
          email: currentUser.email,
          telefono: currentUser.telefono,
          roles: currentUser.roles
        }]);
        
        // Auto-seleccionar el cliente en el formulario
        setFormData(prev => ({ ...prev, clienteId: currentUser.documento }));
        
        // Cargar solo las mascotas del cliente
        await loadMascotasDelCliente(currentUser.documento);
      }
    } catch (error) {
      console.error('Error al cargar datos del cliente:', error);
    }
  };

  const loadMascotasDelCliente = async (documentoCliente: string) => {
    try {
      console.log('🐾 Cargando mascotas del cliente:', documentoCliente);
      const response = await apiClient.get(`/mascotas/propietario/${documentoCliente}`);
      const mascotasList = Array.isArray(response.data) ? response.data : [];
      console.log('✅ Mascotas del cliente cargadas:', mascotasList.length);
      setMascotas(mascotasList);
    } catch (error: any) {
      console.error('❌ Error al cargar mascotas del cliente:', error.response?.status);
      // Si falla, intentar con el endpoint general y filtrar
      try {
        const response = await apiClient.get('/mascotas');
        const todasMascotas = Array.isArray(response.data) ? response.data : [];
        const mascotasCliente = todasMascotas.filter(
          (m: any) => m.propietario?.documento === documentoCliente
        );
        setMascotas(mascotasCliente);
      } catch (err) {
        console.error('❌ Error secundario al cargar mascotas:', err);
        setMascotas([]);
      }
    }
  };

  useEffect(() => {
    console.log('🔔 Estado veterinarias actualizado:', veterinarias.length, 'elementos');
    if (veterinarias.length > 0) {
      console.log('📋 Primera veterinaria:', veterinarias[0]);
    }
  }, [veterinarias]);

  useEffect(() => {
    console.log('🔔 Estado veterinarios actualizado:', veterinarios.length, 'elementos');
    if (veterinarios.length > 0) {
      console.log('📋 Veterinarios con sus veterinarias:');
      veterinarios.forEach(vet => {
        console.log(`   - ${vet.nombres} ${vet.apellidos}: Veterinaria ID ${vet.veterinaria?.id} (${vet.veterinaria?.nombre || 'Sin asignar'})`);
      });
    }
  }, [veterinarios]);

  const loadCitas = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/citas');
      setCitas(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error al cargar citas:', error);
      Alert.alert('Error', 'No se pudieron cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const loadClientes = async () => {
    try {
      console.log('👥 Cargando clientes...');
      const response = await apiClient.get('/usuarios');
      const usuariosData = response.data?.data || response.data;
      const clientesList = Array.isArray(usuariosData)
        ? usuariosData.filter(
            (usuario) =>
              usuario.roles?.some((role: string) => role === 'CLIENTE' || role === 'ROLE_CLIENTE')
          )
        : [];
      console.log('✅ Clientes cargados:', clientesList.length);
      setClientes(clientesList);
    } catch (error: any) {
      console.error('❌ Error al cargar clientes:', error.response?.status, error.response?.data);
      // No mostrar Alert aquí, solo log
      setClientes([]);
    }
  };

  const loadMascotas = async () => {
    try {
      console.log('🐾 Cargando todas las mascotas...');
      const response = await apiClient.get('/mascotas');
      const mascotasList = Array.isArray(response.data) ? response.data : [];
      console.log('✅ Mascotas cargadas:', mascotasList.length);
      setMascotas(mascotasList);
    } catch (error: any) {
      console.error('❌ Error al cargar mascotas:', error.response?.status, error.response?.data);
      setMascotas([]);
    }
  };

  const loadVeterinarios = async () => {
    try {
      console.log('👨‍⚕️ Cargando veterinarios...');
      
      // Intentar primero el endpoint específico de veterinarios
      try {
        const response = await apiClient.get('/usuarios/veterinarios');
        const veterinariosList = Array.isArray(response.data) ? response.data : [];
        console.log('✅ Veterinarios cargados desde endpoint específico:', veterinariosList.length);
        setVeterinarios(veterinariosList);
        return;
      } catch (specificError: any) {
        console.log('⚠️ Endpoint específico falló, intentando con /usuarios...');
      }
      
      // Fallback al endpoint general si falla el específico
      const response = await apiClient.get('/usuarios');
      const usuariosData = response.data?.data || response.data;
      const veterinariosList = Array.isArray(usuariosData)
        ? usuariosData.filter(
            (usuario) =>
              usuario.roles?.some(
                (role: string) => role === 'VETERINARIO' || role === 'ROLE_VETERINARIO'
              )
          )
        : [];
      console.log('✅ Veterinarios cargados:', veterinariosList.length);
      setVeterinarios(veterinariosList);
    } catch (error: any) {
      console.error('❌ Error al cargar veterinarios:', error.response?.status, error.response?.data);
      setVeterinarios([]);
    }
  };

  const loadVeterinariosByVeterinaria = async (veterinariaId: string) => {
    if (!veterinariaId) {
      setVeterinarios([]);
      return;
    }
    
    try {
      console.log('👨‍⚕️ Cargando veterinarios de veterinaria:', veterinariaId);
      const response = await apiClient.get(`/usuarios/veterinarios/por-veterinaria/${veterinariaId}`);
      const veterinariosList = Array.isArray(response.data) ? response.data : [];
      console.log('✅ Veterinarios filtrados cargados:', veterinariosList.length);
      console.log('📋 Veterinarios:', veterinariosList.map(v => `${v.nombres} ${v.apellidos}`).join(', '));
      setVeterinarios(veterinariosList);
    } catch (error: any) {
      console.error('❌ Error al cargar veterinarios por veterinaria:', error.response?.status, error.response?.data);
      setVeterinarios([]);
    }
  };

  const loadVeterinarias = async () => {
    try {
      console.log('🏥 Cargando veterinarias...');
      const response = await apiClient.get('/veterinarias');
      console.log('📦 Respuesta veterinarias:', JSON.stringify(response.data, null, 2));
      
      // Manejar diferentes estructuras de respuesta
      let veterinariasList = [];
      if (Array.isArray(response.data)) {
        veterinariasList = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        veterinariasList = response.data.data;
      } else if (response.data?.content && Array.isArray(response.data.content)) {
        veterinariasList = response.data.content;
      }
      
      console.log('✅ Veterinarias cargadas:', veterinariasList.length);
      console.log('📋 Lista:', JSON.stringify(veterinariasList, null, 2));
      setVeterinarias(veterinariasList);
    } catch (error: any) {
      console.error('❌ Error al cargar veterinarias:', error);
      console.error('❌ Response:', error.response?.data);
      console.error('❌ Status:', error.response?.status);
      Alert.alert('Error', 'No se pudieron cargar las veterinarias');
    }
  };

  const getMascotasByCliente = () => {
    if (!formData.clienteId) return [];
    return mascotas.filter((m) => m.propietario?.documento === formData.clienteId);
  };

  const loadHorariosDisponibles = async (fecha: string) => {
    if (!formData.veterinariaId || !fecha) {
      return;
    }

    try {
      setLoadingHorarios(true);
      console.log('📅 Cargando horarios disponibles:', fecha, 'Veterinaria:', formData.veterinariaId);
      const response = await apiClient.get('/citas/disponibilidad', {
        params: { fecha, veterinariaId: formData.veterinariaId }
      });
      const horarios = Array.isArray(response.data) ? response.data : [];
      console.log('✅ Horarios disponibles:', horarios.length);
      setHorariosDisponibles(horarios);
      setFechaSeleccionada(fecha);
    } catch (error: any) {
      console.error('❌ Error al cargar horarios disponibles:', error.response?.data);
      setHorariosDisponibles([]);
    } finally {
      setLoadingHorarios(false);
    }
  };

  const handleFechaChange = (texto: string) => {
    console.log('📅 Fecha ingresada:', texto);
    
    // Eliminar caracteres no numéricos excepto guiones
    let fecha = texto.replace(/[^\d-]/g, '');
    
    // Formatear automáticamente mientras escribe
    if (fecha.length === 4 && !fecha.includes('-')) {
      fecha = fecha + '-';
    } else if (fecha.length === 7 && fecha.split('-').length === 2) {
      fecha = fecha + '-';
    }
    
    // Limitar a 10 caracteres (YYYY-MM-DD)
    fecha = fecha.substring(0, 10);
    
    // Validar formato YYYY-MM-DD
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    setFechaSeleccionada(fecha);
    setFormData(prev => ({ ...prev, fechaHora: '' }));
    setHorariosDisponibles([]);
    
    // Solo cargar horarios si la fecha tiene el formato completo correcto
    if (fecha && fechaRegex.test(fecha) && formData.veterinariaId) {
      console.log('✅ Formato de fecha válido, cargando horarios...');
      loadHorariosDisponibles(fecha);
    } else if (fecha && !fechaRegex.test(fecha)) {
      console.log('⚠️ Formato de fecha incompleto o inválido:', fecha);
    }
  };

  const handleSelectHorario = (horario: any) => {
    if (horario.disponible) {
      // El backend espera formato "yyyy-MM-ddTHH:mm"
      const fechaHora = horario.fechaHora.substring(0, 16);
      setFormData(prev => ({ ...prev, fechaHora }));
    }
  };

  const handleSave = async () => {
    if (!formData.fechaHora || !formData.clienteId || !formData.mascotaId) {
      Alert.alert('Error', 'Fecha, cliente y mascota son obligatorios');
      return;
    }

    try {
      console.log('💾 Guardando cita con datos:', formData);
      
      // Usar el mismo formato que el frontend web (CitaRequest DTO)
      const citaData: any = {
        fechaHora: formData.fechaHora.includes(':00') ? formData.fechaHora : formData.fechaHora + ':00',
        motivo: formData.motivo || null,
        observaciones: formData.observaciones || null,
        estado: editingCita ? editingCita.estado : 'PROGRAMADA',
        clienteDocumento: formData.clienteId,
        mascotaId: parseInt(formData.mascotaId),
        veterinarioDocumento: formData.veterinarioId || null,
        veterinariaId: formData.veterinariaId ? parseInt(formData.veterinariaId) : null
      };

      console.log('📤 Enviando al backend:', citaData);

      if (editingCita) {
        await apiClient.put(`/citas/${editingCita.id}`, citaData);
        Alert.alert('Éxito', 'Cita actualizada correctamente');
      } else {
        await apiClient.post('/citas', citaData);
        Alert.alert('Éxito', 'Cita creada correctamente');
      }
      setShowForm(false);
      resetForm();
      loadCitas();
    } catch (error: any) {
      console.error('❌ Error al guardar cita:', error.response?.data);
      Alert.alert('Error', error.response?.data?.message || 'Error al guardar cita');
    }
  };

  const handleEdit = (cita: any) => {
    setEditingCita(cita);
    const veterinariaId = cita.veterinariaId?.toString() || cita.veterinaria?.id?.toString() || '';
    
    setFormData({
      fechaHora: cita.fechaHora ? cita.fechaHora.substring(0, 16) : '',
      motivo: cita.motivo || '',
      observaciones: cita.observaciones || '',
      clienteId: cita.clienteDocumento || cita.cliente?.documento || '',
      mascotaId: cita.mascotaId?.toString() || cita.mascota?.id?.toString() || '',
      veterinarioId: cita.veterinarioDocumento || cita.veterinario?.documento || '',
      veterinariaId: veterinariaId,
    });
    
    // Si hay veterinaria seleccionada, cargar sus veterinarios
    if (veterinariaId) {
      loadVeterinariosByVeterinaria(veterinariaId);
    }
    
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Confirmar', '¿Estás seguro de eliminar esta cita?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/citas/${id}`);
            Alert.alert('Éxito', 'Cita eliminada');
            loadCitas();
          } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar la cita');
          }
        },
      },
    ]);
  };

  const handleCancelarCita = async (cita: any) => {
    Alert.alert(
      'Cancelar Cita',
      '¿Está seguro de que desea cancelar esta cita?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚫 Cancelando cita:', cita.id);
              await apiClient.patch(`/citas/${cita.id}/estado`, null, {
                params: { estado: 'CANCELADA' }
              });
              Alert.alert('Éxito', 'Cita cancelada correctamente');
              loadCitas();
            } catch (error: any) {
              console.error('❌ Error al cancelar cita:', error.response?.data);
              Alert.alert('Error', error.response?.data?.message || 'No se pudo cancelar la cita');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      fechaHora: '',
      motivo: '',
      observaciones: '',
      clienteId: '',
      mascotaId: '',
      veterinarioId: '',
      veterinariaId: '',
    });
    setEditingCita(null);
    setHorariosDisponibles([]);
    setFechaSeleccionada('');
  };

  const getEstadoBadge = (estado: string) => {
    const colores: any = {
      PROGRAMADA: '#f59e0b',
      CONFIRMADA: '#3b82f6',
      EN_CURSO: '#8b5cf6',
      COMPLETADA: '#10b981',
      CANCELADA: '#ef4444',
    };
    return colores[estado] || '#6b7280';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📅 Gestión de Citas</Text>
        <TouchableOpacity
          onPress={() => {
            console.log('🆕 Abriendo formulario nueva cita');
            console.log('📊 Estado actual:');
            console.log('   - Veterinarias:', veterinarias.length);
            console.log('   - Clientes:', clientes.length);
            console.log('   - Veterinarios:', veterinarios.length);
            console.log('   - Mascotas:', mascotas.length);
            resetForm();
            
            // Si es cliente, pre-seleccionar sus datos
            if (currentUser && !currentUser.roles?.some((role: string) => 
              ['ROLE_ADMIN', 'ROLE_VETERINARIO', 'ROLE_RECEPCIONISTA'].includes(role)
            )) {
              setFormData(prev => ({ 
                ...prev, 
                clienteId: currentUser.documento 
              }));
            }
            
            setShowForm(true);
          }}
          style={styles.addButton}
        >
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadCitas} />}
        contentContainerStyle={styles.content}
      >
        {citas.map((cita) => (
          <View key={cita.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                {new Date(cita.fechaHora).toLocaleDateString('es-ES')}
              </Text>
              <View style={[styles.badge, { backgroundColor: getEstadoBadge(cita.estado) }]}>
                <Text style={styles.badgeText}>{cita.estado}</Text>
              </View>
            </View>
            <Text style={styles.cardText}>
              🕐 {new Date(cita.fechaHora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.cardText}>
              👤 Cliente: {cita.clienteNombre || ''} {cita.clienteApellido || ''}
            </Text>
            <Text style={styles.cardText}>
              🐾 Mascota: {cita.mascotaNombre || 'N/A'} ({cita.mascotaEspecie || ''})
            </Text>
            <Text style={styles.cardText}>
              👨‍⚕️ Veterinario: {cita.veterinarioNombre ? `Dr. ${cita.veterinarioNombre} ${cita.veterinarioApellido || ''}` : 'Sin asignar'}
            </Text>
            <Text style={styles.cardText}>🏥 Clínica: {cita.veterinariaNombre || 'N/A'}</Text>
            {cita.motivo && <Text style={styles.cardText}>📝 Motivo: {cita.motivo}</Text>}
            
            <View style={styles.cardActions}>
              {currentUser?.roles?.some((role: string) => 
                ['ROLE_ADMIN', 'ROLE_VETERINARIO', 'ROLE_RECEPCIONISTA'].includes(role)
              ) ? (
                // Botones para ADMIN, VETERINARIO, RECEPCIONISTA
                <TouchableOpacity onPress={() => handleEdit(cita)} style={[styles.editBtn, { flex: 1 }]}>
                  <Text style={styles.actionText}>✏️ Editar</Text>
                </TouchableOpacity>
              ) : (
                // Botón para CLIENTE - Solo cancelar
                cita.estado !== 'CANCELADA' && cita.estado !== 'COMPLETADA' && (
                  <TouchableOpacity 
                    onPress={() => handleCancelarCita(cita)} 
                    style={[styles.cancelarBtn, { flex: 1 }]}
                  >
                    <Text style={styles.actionText}>🚫 Cancelar Cita</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Form Modal */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>{editingCita ? 'Editar Cita' : 'Nueva Cita'}</Text>

              <Text style={styles.label}>Veterinaria *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.veterinariaId}
                  onValueChange={(value) => {
                    console.log('🏥 Veterinaria seleccionada:', value);
                    // Resetear veterinario y horarios cuando cambia la veterinaria
                    setFormData({ ...formData, veterinariaId: value, veterinarioId: '', fechaHora: '' });
                    setHorariosDisponibles([]);
                    setFechaSeleccionada('');
                    // Cargar veterinarios de la veterinaria seleccionada
                    if (value) {
                      loadVeterinariosByVeterinaria(value);
                    } else {
                      setVeterinarios([]);
                    }
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccione una veterinaria" value="" />
                  {veterinarias.map((vet) => (
                    <Picker.Item key={vet.id} label={vet.nombre} value={vet.id.toString()} />
                  ))}
                </Picker>
              </View>

              {formData.veterinariaId && (
                <>
                  <Text style={styles.label}>Fecha * (Formato: AAAA-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2024-12-25"
                    value={fechaSeleccionada}
                    onChangeText={handleFechaChange}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                  {fechaSeleccionada && fechaSeleccionada.length > 0 && fechaSeleccionada.length < 10 && (
                    <Text style={styles.helperText}>
                      📝 Continúe escribiendo... (Formato: AAAA-MM-DD)
                    </Text>
                  )}
                  {fechaSeleccionada && fechaSeleccionada.length === 10 && !/^\d{4}-\d{2}-\d{2}$/.test(fechaSeleccionada) && (
                    <Text style={styles.errorText}>
                      ⚠️ Formato incorrecto. Use: AAAA-MM-DD (ej: 2024-12-25)
                    </Text>
                  )}
                  {fechaSeleccionada && /^\d{4}-\d{2}-\d{2}$/.test(fechaSeleccionada) && (
                    <Text style={styles.successText}>
                      ✅ Formato válido - Cargando horarios...
                    </Text>
                  )}

                  {loadingHorarios && (
                    <Text style={styles.helperText}>⏳ Cargando horarios disponibles...</Text>
                  )}

                  {!loadingHorarios && horariosDisponibles.length > 0 && (
                    <>
                      <Text style={styles.label}>Horarios Disponibles</Text>
                      <ScrollView style={styles.horariosContainer} horizontal>
                        {horariosDisponibles.map((horario, index) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() => handleSelectHorario(horario)}
                            disabled={!horario.disponible}
                            style={[
                              styles.horarioButton,
                              horario.disponible ? styles.horarioDisponible : styles.horarioNoDisponible,
                              formData.fechaHora === horario.fechaHora.substring(0, 16) && styles.horarioSeleccionado
                            ]}
                          >
                            <Text style={[
                              styles.horarioText,
                              !horario.disponible && styles.horarioTextDisabled,
                              formData.fechaHora === horario.fechaHora.substring(0, 16) && styles.horarioTextSelected
                            ]}>
                              {new Date(horario.fechaHora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                            {horario.veterinarioNombre && (
                              <Text style={styles.horarioVet}>{horario.veterinarioNombre}</Text>
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </>
                  )}

                  {!loadingHorarios && fechaSeleccionada && horariosDisponibles.length === 0 && (
                    <Text style={styles.helperText}>No hay horarios disponibles para esta fecha</Text>
                  )}
                </>
              )}

              <Text style={styles.label}>Fecha y Hora Seleccionada *</Text>
              <TextInput
                style={styles.input}
                placeholder="Seleccione de los horarios disponibles"
                value={formData.fechaHora}
                editable={false}
              />

              <Text style={styles.label}>Cliente *</Text>
              {currentUser?.roles?.some((role: string) => 
                ['ROLE_ADMIN', 'ROLE_VETERINARIO', 'ROLE_RECEPCIONISTA'].includes(role)
              ) ? (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.clienteId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, clienteId: value, mascotaId: '' })
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="Seleccione un cliente" value="" />
                    {clientes.map((cliente) => (
                      <Picker.Item
                        key={cliente.documento}
                        label={`${cliente.nombres || ''} ${cliente.apellidos || ''} - ${cliente.documento}`}
                        value={cliente.documento}
                      />
                    ))}
                  </Picker>
                </View>
              ) : (
                <View style={styles.disabledInput}>
                  <Text style={styles.disabledText}>
                    {currentUser?.nombres} {currentUser?.apellidos} - {currentUser?.documento}
                  </Text>
                </View>
              )}

              <Text style={styles.label}>Mascota *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.mascotaId}
                  onValueChange={(value) => setFormData({ ...formData, mascotaId: value })}
                  style={styles.picker}
                  enabled={!!formData.clienteId}
                >
                  <Picker.Item
                    label={
                      formData.clienteId
                        ? 'Seleccione una mascota'
                        : 'Primero seleccione un cliente'
                    }
                    value=""
                  />
                  {getMascotasByCliente().map((mascota) => (
                    <Picker.Item
                      key={mascota.id}
                      label={`${mascota.nombre} (${mascota.especie})`}
                      value={mascota.id.toString()}
                    />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Veterinario</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.veterinarioId}
                  onValueChange={(value) => setFormData({ ...formData, veterinarioId: value })}
                  style={styles.picker}
                  enabled={!!formData.veterinariaId}
                >
                  <Picker.Item 
                    label={
                      formData.veterinariaId 
                        ? veterinarios.length > 0
                          ? 'Sin asignar'
                          : 'No hay veterinarios disponibles'
                        : 'Seleccione primero una veterinaria'
                    } 
                    value="" 
                  />
                  {veterinarios.map((vet) => (
                    <Picker.Item
                      key={vet.documento}
                      label={`Dr. ${vet.nombres || ''} ${vet.apellidos || ''}`}
                      value={vet.documento}
                    />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Motivo</Text>
              <TextInput
                style={styles.input}
                placeholder="Motivo de la consulta"
                value={formData.motivo}
                onChangeText={(text) => setFormData({ ...formData, motivo: text })}
              />

              <Text style={styles.label}>Observaciones</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Observaciones adicionales"
                multiline
                numberOfLines={3}
                value={formData.observaciones}
                onChangeText={(text) => setFormData({ ...formData, observaciones: text })}
              />

              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                  <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff', flex: 1 },
  addButton: {
    width: 45,
    height: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: { fontSize: 28, color: '#fff' },
  content: { padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', flex: 1 },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  editBtn: { flex: 1, backgroundColor: '#f59e0b', padding: 10, borderRadius: 8, alignItems: 'center' },
  deleteBtn: { flex: 1, backgroundColor: '#ef4444', padding: 10, borderRadius: 8, alignItems: 'center' },
  cancelarBtn: { flex: 1, backgroundColor: '#dc2626', padding: 10, borderRadius: 8, alignItems: 'center' },
  actionText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  cardText: { fontSize: 14, color: '#6b7280', marginBottom: 5 },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 25 },
  formTitle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginBottom: 15,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  disabledInput: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    padding: 15,
    marginBottom: 15,
  },
  disabledText: {
    fontSize: 16,
    color: '#6b7280',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: -10,
    marginBottom: 15,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: -10,
    marginBottom: 15,
    fontWeight: '600',
  },
  successText: {
    fontSize: 12,
    color: '#10b981',
    marginTop: -10,
    marginBottom: 15,
    fontWeight: '600',
  },
  horariosContainer: {
    maxHeight: 120,
    marginBottom: 15,
  },
  horarioButton: {
    padding: 12,
    marginRight: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 2,
  },
  horarioDisponible: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  horarioNoDisponible: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  horarioSeleccionado: {
    backgroundColor: '#667eea',
    borderColor: '#5a67d8',
  },
  horarioText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  horarioTextDisabled: {
    color: '#9ca3af',
  },
  horarioTextSelected: {
    color: '#fff',
  },
  horarioVet: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  formButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
  button: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  cancelButton: { backgroundColor: '#ef4444' },
  saveButton: { backgroundColor: '#10b981' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
