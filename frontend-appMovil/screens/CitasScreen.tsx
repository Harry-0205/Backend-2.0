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
import { Calendar, LocaleConfig } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../services/apiClient';

// Configurar calendario en español
LocaleConfig.locales['es'] = {
  monthNames: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

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
  const [saving, setSaving] = useState(false);
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
      console.log('📋 Cargando citas...');
      const response = await apiClient.get('/citas');
      const citasList = Array.isArray(response.data) ? response.data : [];
      console.log('✅ Citas cargadas:', citasList.length);
      setCitas(citasList);
    } catch (error: any) {
      console.error('❌ Error al cargar citas:', error);
      console.error('❌ Response:', error.response?.data);
      console.error('❌ Status:', error.response?.status);
      // No mostrar Alert aquí para no interrumpir el flujo
      setCitas([]);
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
    
    // Si el usuario actual es veterinario, solo mostrarlo a él mismo
    const isVeterinario = currentUser?.roles?.some((role: string) => 
      role === 'VETERINARIO' || role === 'ROLE_VETERINARIO'
    );
    
    if (isVeterinario && currentUser) {
      console.log('👨‍⚕️ Usuario es veterinario - Auto-asignando como único veterinario');
      setVeterinarios([{
        documento: currentUser.documento,
        nombres: currentUser.nombres || 'Veterinario',
        apellidos: currentUser.apellidos || 'Actual',
        username: currentUser.username,
        email: currentUser.email,
        roles: currentUser.roles,
        veterinaria: currentUser.veterinaria
      }]);
      
      // Auto-seleccionar el veterinario en el formulario
      setFormData(prev => ({ ...prev, veterinarioId: currentUser.documento }));
      return;
    }
    
    try {
      console.log('👨‍⚕️ Cargando veterinarios de veterinaria:', veterinariaId);
      const response = await apiClient.get(`/usuarios/veterinarios/por-veterinaria/${veterinariaId}`);
      const veterinariosList = Array.isArray(response.data) ? response.data : [];
      console.log('✅ Veterinarios filtrados cargados:', veterinariosList.length);
      console.log('📋 Veterinarios:', veterinariosList.map(v => `${v.nombres} ${v.apellidos}`).join(', '));
      setVeterinarios(veterinariosList);
      
      // Si es cliente y hay al menos un veterinario, no auto-seleccionar (dejar que el cliente elija)
      // Si hay solo uno, podríamos auto-seleccionarlo
      if (veterinariosList.length === 1) {
        console.log('ℹ️ Solo hay un veterinario disponible, auto-seleccionando');
        setFormData(prev => ({ ...prev, veterinarioId: veterinariosList[0].documento }));
      }
    } catch (error: any) {
      console.error('❌ Error al cargar veterinarios por veterinaria:', error.response?.status, error.response?.data);
      
      // Si es error 403 y el usuario es veterinario, usar sus propios datos como fallback
      if (error.response?.status === 403 && currentUser) {
        console.log('⚠️ Error 403 - Usando datos del usuario actual como fallback');
        setVeterinarios([{
          documento: currentUser.documento,
          nombres: currentUser.nombres || 'Veterinario',
          apellidos: currentUser.apellidos || 'Actual',
          username: currentUser.username,
          email: currentUser.email,
          roles: currentUser.roles,
          veterinaria: currentUser.veterinaria
        }]);
        setFormData(prev => ({ ...prev, veterinarioId: currentUser.documento }));
      } else {
        Alert.alert('Advertencia', 'No se pudieron cargar los veterinarios. El veterinario será asignado automáticamente por el sistema.');
        setVeterinarios([]);
      }
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

  // Ya no se necesita handleFechaChange - El calendario maneja la selección directamente

  const handleSelectHorario = (horario: any) => {
    try {
      console.log('🕐 Horario seleccionado:', horario);
      
      if (!horario) {
        console.warn('⚠️ Horario es null o undefined');
        return;
      }
      
      if (horario.disponible) {
        if (!horario.fechaHora) {
          console.error('❌ horario.fechaHora es null o undefined');
          Alert.alert('Error', 'El horario seleccionado no tiene una fecha válida');
          return;
        }
        
        // El backend espera formato "yyyy-MM-ddTHH:mm"
        const fechaHora = horario.fechaHora.substring(0, 16);
        console.log('✅ FechaHora formateada:', fechaHora);
        setFormData(prev => ({ ...prev, fechaHora }));
      } else {
        console.log('⚠️ Horario no disponible');
        Alert.alert('No disponible', 'Este horario ya no está disponible');
      }
    } catch (error) {
      console.error('❌ Error en handleSelectHorario:', error);
      Alert.alert('Error', 'Error al seleccionar el horario');
    }
  };

  const handleSave = async () => {
    // Prevenir doble envío
    if (saving) {
      console.log('⏳ Ya hay un guardado en proceso, ignorando...');
      return;
    }
    
    console.log('💾 Intentando guardar cita...');
    console.log('📋 FormData actual:', formData);
    
    // Validaciones
    if (!formData.fechaHora || !formData.clienteId || !formData.mascotaId) {
      console.log('❌ Validación falló: Faltan campos obligatorios');
      Alert.alert('Error', 'Fecha, cliente y mascota son obligatorios');
      return;
    }

    if (!formData.veterinariaId) {
      console.log('❌ Validación falló: Falta veterinaria');
      Alert.alert('Error', 'Debe seleccionar una veterinaria');
      return;
    }

    setSaving(true);
    try {
      // Formatear fechaHora correctamente
      let fechaHoraFormateada = formData.fechaHora;
      
      // Asegurar que tenga formato yyyy-MM-ddTHH:mm:ss
      if (fechaHoraFormateada.length === 16) {
        // Si es yyyy-MM-ddTHH:mm, agregar :00
        fechaHoraFormateada = fechaHoraFormateada + ':00';
      } else if (!fechaHoraFormateada.includes(':')) {
        console.error('❌ Formato de fecha inválido:', fechaHoraFormateada);
        Alert.alert('Error', 'Formato de fecha inválido. Por favor seleccione fecha y hora.');
        return;
      }
      
      console.log('📅 Fecha formateada:', fechaHoraFormateada);
      
      // Validar que mascotaId sea un número válido
      const mascotaIdNum = parseInt(formData.mascotaId);
      if (isNaN(mascotaIdNum)) {
        console.error('❌ mascotaId no es un número válido:', formData.mascotaId);
        Alert.alert('Error', 'ID de mascota inválido');
        return;
      }
      
      // Validar que veterinariaId sea un número válido
      const veterinariaIdNum = parseInt(formData.veterinariaId);
      if (isNaN(veterinariaIdNum)) {
        console.error('❌ veterinariaId no es un número válido:', formData.veterinariaId);
        Alert.alert('Error', 'ID de veterinaria inválido');
        return;
      }
      
      // Usar el mismo formato que el frontend web (CitaRequest DTO)
      const citaData: any = {
        fechaHora: fechaHoraFormateada,
        motivo: formData.motivo || null,
        observaciones: formData.observaciones || null,
        estado: editingCita ? editingCita.estado : 'PROGRAMADA',
        clienteDocumento: formData.clienteId,
        mascotaId: mascotaIdNum,
        veterinarioDocumento: formData.veterinarioId || null,
        veterinariaId: veterinariaIdNum
      };

      console.log('📤 Enviando al backend:', JSON.stringify(citaData, null, 2));

      if (editingCita) {
        console.log('📝 Actualizando cita:', editingCita.id);
        await apiClient.put(`/citas/${editingCita.id}`, citaData);
        Alert.alert('Éxito', 'Cita actualizada correctamente');
      } else {
        console.log('✨ Creando nueva cita');
        await apiClient.post('/citas', citaData);
        Alert.alert('Éxito', 'Cita creada correctamente');
      }
      
      console.log('✅ Cita guardada exitosamente');
      setShowForm(false);
      resetForm();
      loadCitas();
    } catch (error: any) {
      console.error('❌ Error al guardar cita:', error);
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      console.error('❌ Error completo:', JSON.stringify(error, null, 2));
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Error al guardar cita';
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
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
    // Pre-asignar veterinaria y veterinario si el usuario es veterinario
    const isVeterinario = currentUser?.roles?.some((role: string) => 
      role === 'VETERINARIO' || role === 'ROLE_VETERINARIO'
    );
    
    const veterinariaIdDefault = isVeterinario && currentUser?.veterinaria?.id 
      ? currentUser.veterinaria.id.toString() 
      : '';
    
    const veterinarioIdDefault = isVeterinario && currentUser?.documento 
      ? currentUser.documento 
      : '';
    
    console.log('🔄 Reset form - Es veterinario:', isVeterinario);
    console.log('🏥 Veterinaria pre-asignada:', veterinariaIdDefault);
    console.log('👨‍⚕️ Veterinario pre-asignado:', veterinarioIdDefault);
    
    setFormData({
      fechaHora: '',
      motivo: '',
      observaciones: '',
      clienteId: '',
      mascotaId: '',
      veterinarioId: veterinarioIdDefault,
      veterinariaId: veterinariaIdDefault,
    });
    
    // Si es veterinario y tiene veterinaria asignada, cargar veterinarios de esa veterinaria
    if (veterinariaIdDefault) {
      loadVeterinariosByVeterinaria(veterinariaIdDefault);
    }
    
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
                  enabled={!currentUser?.roles?.some((role: string) => 
                    role === 'VETERINARIO' || role === 'ROLE_VETERINARIO'
                  )}
                >
                  <Picker.Item label="Seleccione una veterinaria" value="" />
                  {veterinarias.map((vet) => (
                    <Picker.Item key={vet.id} label={vet.nombre} value={vet.id.toString()} />
                  ))}
                </Picker>
              </View>
              {currentUser?.roles?.some((role: string) => 
                role === 'VETERINARIO' || role === 'ROLE_VETERINARIO'
              ) && (
                <Text style={styles.helperText}>
                  🔒 Veterinaria asignada automáticamente según tu perfil
                </Text>
              )}

              {formData.veterinariaId && (
                <>
                  <Text style={styles.label}>Seleccione una Fecha *</Text>
                  <Calendar
                    current={new Date().toISOString().split('T')[0]}
                    minDate={new Date().toISOString().split('T')[0]}
                    markedDates={{
                      [fechaSeleccionada]: {
                        selected: true,
                        selectedColor: '#3b82f6',
                        selectedTextColor: '#fff'
                      }
                    }}
                    onDayPress={(day: any) => {
                      console.log('📅 Fecha seleccionada:', day.dateString);
                      setFechaSeleccionada(day.dateString);
                      setFormData(prev => ({ ...prev, fechaHora: '' }));
                      setHorariosDisponibles([]);
                      loadHorariosDisponibles(day.dateString);
                    }}
                    theme={{
                      backgroundColor: '#ffffff',
                      calendarBackground: '#ffffff',
                      textSectionTitleColor: '#1e293b',
                      selectedDayBackgroundColor: '#3b82f6',
                      selectedDayTextColor: '#ffffff',
                      todayTextColor: '#3b82f6',
                      dayTextColor: '#1e293b',
                      textDisabledColor: '#cbd5e1',
                      dotColor: '#3b82f6',
                      selectedDotColor: '#ffffff',
                      arrowColor: '#3b82f6',
                      monthTextColor: '#1e293b',
                      indicatorColor: '#3b82f6',
                      textDayFontFamily: 'System',
                      textMonthFontFamily: 'System',
                      textDayHeaderFontFamily: 'System',
                      textDayFontWeight: '500',
                      textMonthFontWeight: '700',
                      textDayHeaderFontWeight: '600',
                      textDayFontSize: 15,
                      textMonthFontSize: 17,
                      textDayHeaderFontSize: 13
                    }}
                    style={{
                      borderRadius: 16,
                      elevation: 3,
                      shadowColor: '#64748b',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      marginBottom: 18,
                    }}
                  />

                  {loadingHorarios && (
                    <Text style={styles.helperText}>⏳ Cargando horarios disponibles...</Text>
                  )}

                  {!loadingHorarios && horariosDisponibles.length > 0 && (
                    <>
                      <Text style={styles.label}>Horarios Disponibles *</Text>
                      <View style={styles.horariosGrid}>
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
                              <Text style={[
                                styles.horarioVet,
                                formData.fechaHora === horario.fechaHora.substring(0, 16) && styles.horarioVetSelected
                              ]}>
                                Dr. {horario.veterinarioNombre}
                              </Text>
                            )}
                            <View style={styles.horarioBadge}>
                              <Text style={styles.horarioBadgeText}>
                                {horario.disponible ? '✓ Disponible' : '✗ Ocupado'}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  )}
                  
                  {!loadingHorarios && fechaSeleccionada && horariosDisponibles.length === 0 && (
                    <View style={styles.noHorariosContainer}>
                      <Text style={styles.noHorariosText}>
                        📅 No hay horarios disponibles para esta fecha
                      </Text>
                      <Text style={styles.noHorariosSubtext}>
                        Por favor, seleccione otra fecha
                      </Text>
                    </View>
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
                  enabled={!!formData.veterinariaId && !currentUser?.roles?.some((role: string) => 
                    role === 'VETERINARIO' || role === 'ROLE_VETERINARIO'
                  )}
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
                      label={
                        currentUser?.roles?.some((role: string) => 
                          role === 'VETERINARIO' || role === 'ROLE_VETERINARIO'
                        ) && vet.documento === currentUser?.documento
                          ? '👨‍⚕️ Tú (Veterinario)'
                          : `Dr(a). ${vet.nombres || ''} ${vet.apellidos || ''}`
                      }
                      value={vet.documento}
                    />
                  ))}
                </Picker>
              </View>
              {currentUser?.roles?.some((role: string) => 
                role === 'VETERINARIO' || role === 'ROLE_VETERINARIO'
              ) && (
                <Text style={styles.helperText}>
                  🔒 Asignado automáticamente a tu perfil
                </Text>
              )}

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
                  disabled={saving}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.button, 
                    styles.saveButton,
                    saving && styles.buttonDisabled
                  ]} 
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Text style={styles.buttonText}>
                    {saving ? 'Guardando...' : 'Guardar'}
                  </Text>
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
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: {
    backgroundColor: '#1e40af',
    padding: 20,
    paddingTop: 50,
    paddingBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: { 
    width: 40, 
    height: 40, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
  },
  backIcon: { fontSize: 22, color: '#fff', fontWeight: 'bold' },
  title: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#fff', 
    flex: 1,
    marginLeft: 15,
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  addIcon: { fontSize: 26, color: '#fff', fontWeight: 'bold' },
  content: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cardTitle: { fontSize: 19, fontWeight: '700', color: '#1e293b', flex: 1, marginRight: 10 },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  editBtn: { 
    flex: 1, 
    backgroundColor: '#f59e0b', 
    padding: 12, 
    borderRadius: 10, 
    alignItems: 'center',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteBtn: { 
    flex: 1, 
    backgroundColor: '#ef4444', 
    padding: 12, 
    borderRadius: 10, 
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelarBtn: { 
    flex: 1, 
    backgroundColor: '#dc2626', 
    padding: 12, 
    borderRadius: 10, 
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cardText: { fontSize: 15, color: '#64748b', marginBottom: 6, fontWeight: '500' },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.6)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: { 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  formTitle: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#1e293b', 
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  label: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#1e293b', 
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginBottom: 18,
    fontWeight: '500',
    color: '#1e293b',
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
  horariosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  horarioButton: {
    width: '48%',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  horarioDisponible: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
    shadowColor: '#10b981',
  },
  horarioNoDisponible: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    shadowColor: '#ef4444',
    opacity: 0.6,
  },
  horarioSeleccionado: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.3,
    elevation: 4,
  },
  horarioText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  horarioTextDisabled: {
    color: '#9ca3af',
  },
  horarioTextSelected: {
    color: '#fff',
  },
  horarioVet: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 6,
    fontWeight: '600',
  },
  horarioVetSelected: {
    color: '#dbeafe',
  },
  horarioBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  horarioBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1e293b',
  },
  noHorariosContainer: {
    backgroundColor: '#fef3c7',
    padding: 20,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  noHorariosText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 6,
    textAlign: 'center',
  },
  noHorariosSubtext: {
    fontSize: 13,
    color: '#b45309',
    fontWeight: '500',
    textAlign: 'center',
  },
  formButtons: { flexDirection: 'row', gap: 12, marginTop: 12 },
  button: { 
    flex: 1, 
    padding: 18, 
    borderRadius: 14, 
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: { 
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  saveButton: { 
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    shadowColor: '#9ca3af',
    opacity: 0.6,
  },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
