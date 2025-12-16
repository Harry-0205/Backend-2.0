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
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../services/apiClient';
import authService from '../services/authService';

export default function HistoriasClinicasScreen({ onBack }: { onBack: () => void }) {
  const [historias, setHistorias] = useState<any[]>([]);
  const [mascotas, setMascotas] = useState<any[]>([]);
  const [filteredMascotas, setFilteredMascotas] = useState<any[]>([]);
  const [veterinarios, setVeterinarios] = useState<any[]>([]);
  const [propietarios, setPropietarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingHistoria, setEditingHistoria] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
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
  });

  useEffect(() => {
    loadCurrentUser();
    loadHistorias();
  }, []);

  const loadCurrentUser = async () => {
    const user = await authService.getCurrentUser();
    setCurrentUser(user);
    console.log('👤 Usuario actual en Historias:', user?.username);
    console.log('🔐 Roles:', user?.roles);
    
    // Cargar datos según el rol
    const roles = user?.roles || [];
    const esCliente = roles.includes('ROLE_CLIENTE') || roles.includes('CLIENTE');
    
    if (!esCliente) {
      // Solo admin, veterinario y recepcionista necesitan estas listas
      loadMascotas();
      loadVeterinarios();
      loadPropietarios();
    } else {
      // Los clientes solo ven sus historias, cargar solo sus mascotas
      if (user?.documento) {
        loadMascotasCliente(user.documento);
      }
    }
  };

  const isCliente = () => {
    return currentUser?.roles?.includes('ROLE_CLIENTE') || currentUser?.roles?.includes('CLIENTE');
  };

  const isVeterinario = () => {
    return currentUser?.roles?.includes('ROLE_VETERINARIO') || currentUser?.roles?.includes('VETERINARIO');
  };

  const canCreateHistoria = () => {
    const roles = currentUser?.roles || [];
    return roles.includes('ROLE_ADMIN') || 
           roles.includes('ROLE_VETERINARIO') || 
           roles.includes('ROLE_RECEPCIONISTA');
  };

  const loadHistorias = async () => {
    setLoading(true);
    try {
      console.log('📋 Cargando historias clínicas...');
      const response = await apiClient.get('/historias-clinicas');
      const historiasData = Array.isArray(response.data) ? response.data : [];
      setHistorias(historiasData);
      console.log('✅ Historias cargadas:', historiasData.length);
    } catch (error) {
      console.error('❌ Error al cargar historias:', error);
      Alert.alert('Error', 'No se pudieron cargar las historias clínicas');
      setHistorias([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMascotas = async () => {
    try {
      console.log('📋 Cargando todas las mascotas (admin/vet/recep)');
      const response = await apiClient.get('/mascotas');
      const mascotasData = Array.isArray(response.data) ? response.data : [];
      setMascotas(mascotasData);
      setFilteredMascotas(mascotasData);
      console.log('✅ Mascotas cargadas:', mascotasData.length);
    } catch (error) {
      console.error('❌ Error al cargar mascotas:', error);
    }
  };

  const loadMascotasCliente = async (documento: string) => {
    try {
      console.log('🐾 Cliente: Cargando mascotas del propietario:', documento);
      const response = await apiClient.get(`/mascotas/propietario/${documento}`);
      const mascotasData = Array.isArray(response.data) ? response.data : [];
      setMascotas(mascotasData);
      setFilteredMascotas(mascotasData);
      console.log('✅ Mascotas del cliente cargadas:', mascotasData.length);
    } catch (error) {
      console.error('❌ Error al cargar mascotas del cliente:', error);
      setMascotas([]);
      setFilteredMascotas([]);
    }
  };

  const loadVeterinarios = async () => {
    try {
      console.log('👨‍⚕️ Cargando veterinarios (solo admin/vet/recep)');
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
      setVeterinarios(veterinariosList);
      console.log('✅ Veterinarios cargados:', veterinariosList.length);
    } catch (error) {
      console.error('❌ Error al cargar veterinarios:', error);
      setVeterinarios([]);
    }
  };

  const loadPropietarios = async () => {
    try {
      console.log('👥 Cargando propietarios (solo admin/vet/recep)');
      const response = await apiClient.get('/usuarios');
      const usuariosData = response.data?.data || response.data;
      const clientes = Array.isArray(usuariosData)
        ? usuariosData.filter(
            (usuario) =>
              usuario.roles?.some((role: string) => role === 'CLIENTE' || role === 'ROLE_CLIENTE')
          )
        : [];
      setPropietarios(clientes);
      console.log('✅ Propietarios cargados:', clientes.length);
    } catch (error) {
      console.error('❌ Error al cargar propietarios:', error);
      setPropietarios([]);
    }
  };

  const handleSave = async () => {
    console.log('💾 Intentando guardar historia clínica...');
    console.log('📋 FormData actual:', formData);
    
    // Validar campos obligatorios básicos
    if (!formData.fechaConsulta || !formData.mascotaId) {
      console.log('❌ Validación falló: Faltan campos obligatorios');
      Alert.alert('Error', 'Fecha de consulta y mascota son obligatorios');
      return;
    }

    // Determinar el veterinario
    let veterinarioDocumento = formData.veterinarioId;
    
    // Si es veterinario y no hay veterinario seleccionado, usar el usuario actual
    const roles = currentUser?.roles || [];
    const esVeterinario = roles.includes('ROLE_VETERINARIO') || roles.includes('VETERINARIO');
    
    if (!editingHistoria && !veterinarioDocumento && esVeterinario && currentUser?.documento) {
      veterinarioDocumento = currentUser.documento;
      console.log('👨‍⚕️ Veterinario: Auto-asignando documento:', veterinarioDocumento);
    }

    // Validar que haya veterinario
    if (!veterinarioDocumento) {
      console.log('❌ Validación falló: No hay veterinario asignado');
      Alert.alert('Error', 'Debe seleccionar un veterinario');
      return;
    }

    try {
      const historiaData: any = {
        fechaConsulta: new Date(formData.fechaConsulta).toISOString(),
        motivoConsulta: formData.motivoConsulta || null,
        sintomas: formData.sintomas || null,
        diagnostico: formData.diagnostico || null,
        tratamiento: formData.tratamiento || null,
        medicamentos: formData.medicamentos || null,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        temperatura: formData.temperatura ? parseFloat(formData.temperatura) : null,
        frecuenciaCardiaca: formData.frecuenciaCardiaca
          ? parseInt(formData.frecuenciaCardiaca)
          : null,
        frecuenciaRespiratoria: formData.frecuenciaRespiratoria
          ? parseInt(formData.frecuenciaRespiratoria)
          : null,
        observaciones: formData.observaciones || null,
        recomendaciones: formData.recomendaciones || null,
        mascotaId: parseInt(formData.mascotaId),
        veterinarioDocumento: veterinarioDocumento,
      };

      console.log('📦 Datos a enviar:', historiaData);

      if (editingHistoria) {
        console.log('📝 Actualizando historia:', editingHistoria.id);
        await apiClient.put(`/historias-clinicas/${editingHistoria.id}`, historiaData);
        Alert.alert('Éxito', 'Historia clínica actualizada correctamente');
      } else {
        console.log('✨ Creando nueva historia clínica');
        await apiClient.post('/historias-clinicas', historiaData);
        Alert.alert('Éxito', 'Historia clínica creada correctamente');
      }
      setShowForm(false);
      resetForm();
      loadHistorias();
    } catch (error: any) {
      console.error('❌ Error al guardar historia:', error.response?.data || error);
      Alert.alert('Error', error.response?.data?.message || 'Error al guardar historia clínica');
    }
  };

  const handleEdit = (historia: any) => {
    setEditingHistoria(historia);
    const fechaConsulta = historia.fechaConsulta
      ? new Date(historia.fechaConsulta).toISOString().slice(0, 16)
      : '';
    setFormData({
      fechaConsulta,
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
      proximaCita: '',
      mascotaId: historia.mascota?.id?.toString() || '',
      veterinarioId: historia.veterinario?.documento || '',
      propietarioId: historia.mascota?.propietario?.documento || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    
    // Si es veterinario, pre-seleccionar su documento
    const roles = currentUser?.roles || [];
    const esVeterinario = roles.includes('ROLE_VETERINARIO') || roles.includes('VETERINARIO');
    const defaultVeterinarioId = esVeterinario && currentUser?.documento ? currentUser.documento : '';
    
    console.log('🔄 Reseteando formulario');
    console.log('👨‍⚕️ Es veterinario:', esVeterinario, '- Documento:', defaultVeterinarioId);
    
    setFormData({
      fechaConsulta: now.toISOString().slice(0, 16),
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
      veterinarioId: defaultVeterinarioId,
    });
    setEditingHistoria(null);
  };

  const filterMascotasByPropietario = (propietarioId: string) => {
    if (!propietarioId) {
      setFilteredMascotas(mascotas);
      return;
    }
    const filtered = mascotas.filter(
      (m) => m.propietario?.documento === propietarioId
    );
    setFilteredMascotas(filtered);
  };

  const handleDownloadPDF = async (historia: any) => {
    if (!historia.mascota?.id) {
      Alert.alert('Error', 'No se puede descargar el PDF: mascota no encontrada');
      return;
    }

    try {
      setDownloading(historia.id);
      
      // Obtener el token de autenticación
      const token = await AsyncStorage.getItem('token');
      
      // Construir la URL del PDF - Usar la misma URL base que apiClient
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.20.25:8080/api';
      const pdfUrl = `${API_BASE_URL}/pdf/historia-clinica/${historia.mascota.id}`;
      
      console.log('📄 Descargando PDF desde:', pdfUrl);
      
      // Crear nombre del archivo con timestamp para hacerlo único
      const timestamp = Date.now();
      const fileName = `historia_clinica_${historia.mascota.nombre}_${timestamp}.pdf`;
      
      // Crear el archivo usando la nueva API de expo-file-system v19
      const pdfFile = new File(Paths.cache, fileName);
      
      // Verificar si el archivo existe y eliminarlo
      try {
        if (pdfFile.exists) {
          console.log('🗑️ Eliminando archivo existente...');
          await pdfFile.delete();
        }
      } catch (err) {
        console.log('ℹ️ Archivo no existe o no se pudo eliminar:', err);
      }
      
      // Descargar usando fetch y escribir el archivo
      const response = await fetch(pdfUrl, {
        method: 'GET',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error(`Error al descargar: ${response.status} - ${response.statusText}`);
      }

      // Convertir la respuesta a blob y luego a arrayBuffer
      const blob = await response.blob();
      
      // Leer el blob como array buffer usando FileReader
      const reader = new FileReader();
      const arrayBufferPromise = new Promise<ArrayBuffer>((resolve, reject) => {
        reader.onloadend = () => {
          if (reader.result) {
            resolve(reader.result as ArrayBuffer);
          } else {
            reject(new Error('No se pudo leer el archivo'));
          }
        };
        reader.onerror = () => reject(reader.error);
      });
      reader.readAsArrayBuffer(blob);
      
      const arrayBuffer = await arrayBufferPromise;
      
      // Escribir el archivo usando streams
      await pdfFile.create();
      const writer = pdfFile.writableStream().getWriter();
      await writer.write(new Uint8Array(arrayBuffer));
      await writer.close();

      console.log('✅ PDF descargado en:', pdfFile.uri);

      // Verificar si el dispositivo soporta compartir
      const canShare = await Sharing.isAvailableAsync();
      
      if (canShare) {
        // Compartir el archivo (abre opciones para guardar o enviar)
        await Sharing.shareAsync(pdfFile.uri);
        Alert.alert('Éxito', 'Historia clínica descargada correctamente');
      } else {
        Alert.alert('Éxito', `Archivo guardado en: ${pdfFile.uri}`);
      }
    } catch (error: any) {
      console.error('❌ Error al descargar PDF:', error);
      Alert.alert('Error', error.message || 'Error al descargar la historia clínica');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📋 Historias Clínicas</Text>
        {canCreateHistoria() ? (
          <TouchableOpacity
            onPress={() => {
              console.log('➕ Abriendo formulario nueva historia clínica');
              console.log('👤 Usuario actual:', currentUser?.username, '- Roles:', currentUser?.roles);
              console.log('🐾 Mascotas disponibles:', mascotas.length);
              console.log('👥 Propietarios disponibles:', propietarios.length);
              console.log('👨‍⚕️ Veterinarios disponibles:', veterinarios.length);
              console.log('🔐 Es veterinario:', isVeterinario());
              resetForm();
              setShowForm(true);
            }}
            style={styles.addButton}
          >
            <Text style={styles.addIcon}>+</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 45 }} />
        )}
      </View>

      {/* List */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadHistorias} />}
        contentContainerStyle={styles.content}
      >
        {historias.map((historia) => (
          <View key={historia.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                {historia.mascota?.nombre || 'Mascota desconocida'}
              </Text>
              <Text style={styles.cardDate}>
                {new Date(historia.fechaConsulta).toLocaleDateString('es-ES')}
              </Text>
            </View>
            <Text style={styles.cardText}>
              🐾 {historia.mascota?.especie || 'N/A'} - {historia.mascota?.raza || 'N/A'}
            </Text>
            <Text style={styles.cardText}>
              👤 Propietario: {historia.mascota?.propietario?.nombres || 'N/A'}{' '}
              {historia.mascota?.propietario?.apellidos || ''}
            </Text>
            <Text style={styles.cardText}>
              👨‍⚕️ Veterinario: Dr. {historia.veterinario?.nombres || 'N/A'}{' '}
              {historia.veterinario?.apellidos || ''}
            </Text>
            {historia.motivoConsulta && (
              <Text style={styles.cardText}>📝 Motivo: {historia.motivoConsulta}</Text>
            )}
            {historia.diagnostico && (
              <Text style={styles.cardText}>🔬 Diagnóstico: {historia.diagnostico}</Text>
            )}
            {historia.peso && <Text style={styles.cardText}>⚖️ Peso: {historia.peso} kg</Text>}
            {historia.temperatura && (
              <Text style={styles.cardText}>🌡️ Temp: {historia.temperatura}°C</Text>
            )}

            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() => handleDownloadPDF(historia)}
                style={[styles.downloadBtn, { flex: 1, marginRight: canCreateHistoria() ? 10 : 0 }]}
                disabled={downloading === historia.id}
              >
                {downloading === historia.id ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionText}>📄 Descargar PDF</Text>
                )}
              </TouchableOpacity>
              {canCreateHistoria() && (
                <TouchableOpacity onPress={() => handleEdit(historia)} style={[styles.editBtn, { flex: 1 }]}>
                  <Text style={styles.actionText}>✏️ Editar</Text>
                </TouchableOpacity>
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
              <Text style={styles.formTitle}>
                {editingHistoria ? 'Editar Historia Clínica' : 'Nueva Historia Clínica'}
              </Text>

              <Text style={styles.label}>Fecha de Consulta *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD HH:MM (Ej: 2024-12-01 14:30)"
                value={formData.fechaConsulta.replace('T', ' ').slice(0, 16)}
                onChangeText={(text) =>
                  setFormData({ ...formData, fechaConsulta: text.replace(' ', 'T') })
                }
              />

              <Text style={styles.label}>Propietario *</Text>
              {propietarios.length === 0 && (
                <Text style={styles.warningText}>⚠️ No hay propietarios disponibles</Text>
              )}
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.propietarioId}
                  onValueChange={(value) => {
                    console.log('👤 Propietario seleccionado:', value);
                    const propietarioSeleccionado = propietarios.find(p => p.documento === value);
                    console.log('📋 Datos del propietario:', propietarioSeleccionado);
                    setFormData({ ...formData, propietarioId: value, mascotaId: '' });
                    filterMascotasByPropietario(value);
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccione un propietario" value="" />
                  {propietarios.map((prop) => (
                    <Picker.Item
                      key={prop.documento}
                      label={`${prop.nombres || ''} ${prop.apellidos || ''} - ${prop.documento}`}
                      value={prop.documento}
                    />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Mascota *</Text>
              {formData.propietarioId && filteredMascotas.length === 0 && (
                <Text style={styles.warningText}>⚠️ Este propietario no tiene mascotas registradas</Text>
              )}
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.mascotaId}
                  onValueChange={(value) => {
                    console.log('🐾 Mascota seleccionada:', value);
                    const mascotaSeleccionada = filteredMascotas.find(m => m.id.toString() === value);
                    console.log('📋 Datos de la mascota:', mascotaSeleccionada);
                    setFormData({ ...formData, mascotaId: value });
                  }}
                  style={styles.picker}
                  enabled={!!formData.propietarioId}
                >
                  <Picker.Item
                    label={
                      formData.propietarioId
                        ? 'Seleccione una mascota'
                        : 'Primero seleccione un propietario'
                    }
                    value=""
                  />
                  {filteredMascotas.map((mascota) => (
                    <Picker.Item
                      key={mascota.id}
                      label={`${mascota.nombre} (${mascota.especie})`}
                      value={mascota.id.toString()}
                    />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Veterinario *</Text>
              {veterinarios.length === 0 && !isVeterinario() && (
                <Text style={styles.warningText}>⚠️ No hay veterinarios disponibles</Text>
              )}
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.veterinarioId}
                  onValueChange={(value) => {
                    console.log('🩺 Veterinario seleccionado:', value);
                    const vetSeleccionado = veterinarios.find(v => v.documento === value);
                    console.log('👨‍⚕️ Datos del veterinario:', vetSeleccionado);
                    setFormData({ ...formData, veterinarioId: value });
                  }}
                  style={styles.picker}
                  enabled={!isVeterinario() && !editingHistoria}
                >
                  {!isVeterinario() && <Picker.Item label="Seleccione un veterinario" value="" />}
                  {veterinarios.map((vet) => (
                    <Picker.Item
                      key={vet.documento}
                      label={isVeterinario() && vet.documento === currentUser?.documento
                        ? '👨‍⚕️ Mi Perfil (Veterinario)'
                        : `Dr(a). ${vet.nombres || ''} ${vet.apellidos || ''}`}
                      value={vet.documento}
                    />
                  ))}
                </Picker>
              </View>
              {isVeterinario() && !editingHistoria && (
                <Text style={styles.helperText}>🔒 Asignado automáticamente a tu perfil</Text>
              )}
              {editingHistoria && (
                <Text style={styles.helperText}>El veterinario no se puede modificar</Text>
              )}

              <Text style={styles.label}>Motivo de Consulta</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Motivo de la consulta"
                multiline
                numberOfLines={2}
                value={formData.motivoConsulta}
                onChangeText={(text) => setFormData({ ...formData, motivoConsulta: text })}
              />

              <Text style={styles.label}>Síntomas</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Síntomas observados"
                multiline
                numberOfLines={2}
                value={formData.sintomas}
                onChangeText={(text) => setFormData({ ...formData, sintomas: text })}
              />

              <Text style={styles.label}>Diagnóstico</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Diagnóstico del veterinario"
                multiline
                numberOfLines={2}
                value={formData.diagnostico}
                onChangeText={(text) => setFormData({ ...formData, diagnostico: text })}
              />

              <Text style={styles.label}>Tratamiento</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tratamiento prescrito"
                multiline
                numberOfLines={2}
                value={formData.tratamiento}
                onChangeText={(text) => setFormData({ ...formData, tratamiento: text })}
              />

              <Text style={styles.label}>Medicamentos</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Medicamentos recetados"
                multiline
                numberOfLines={2}
                value={formData.medicamentos}
                onChangeText={(text) => setFormData({ ...formData, medicamentos: text })}
              />

              <Text style={styles.sectionTitle}>Signos Vitales</Text>

              <Text style={styles.label}>Peso (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Peso en kilogramos"
                keyboardType="decimal-pad"
                value={formData.peso}
                onChangeText={(text) => setFormData({ ...formData, peso: text })}
              />

              <Text style={styles.label}>Temperatura (°C)</Text>
              <TextInput
                style={styles.input}
                placeholder="Temperatura corporal"
                keyboardType="decimal-pad"
                value={formData.temperatura}
                onChangeText={(text) => setFormData({ ...formData, temperatura: text })}
              />

              <Text style={styles.label}>Frecuencia Cardíaca (lpm)</Text>
              <TextInput
                style={styles.input}
                placeholder="Latidos por minuto"
                keyboardType="numeric"
                value={formData.frecuenciaCardiaca}
                onChangeText={(text) => setFormData({ ...formData, frecuenciaCardiaca: text })}
              />

              <Text style={styles.label}>Frecuencia Respiratoria (rpm)</Text>
              <TextInput
                style={styles.input}
                placeholder="Respiraciones por minuto"
                keyboardType="numeric"
                value={formData.frecuenciaRespiratoria}
                onChangeText={(text) =>
                  setFormData({ ...formData, frecuenciaRespiratoria: text })
                }
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

              <Text style={styles.label}>Recomendaciones</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Recomendaciones para el cuidado"
                multiline
                numberOfLines={3}
                value={formData.recomendaciones}
                onChangeText={(text) => setFormData({ ...formData, recomendaciones: text })}
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
  container: { 
    flex: 1, 
    backgroundColor: '#f1f5f9' 
  },
  header: {
    backgroundColor: '#3b82f6',
    padding: 20,
    paddingTop: 50,
    paddingBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#3b82f6',
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
  cardTitle: { 
    fontSize: 17, 
    fontWeight: '700', 
    color: '#1e293b', 
    flex: 1,
    marginRight: 10,
  },
  cardDate: { 
    fontSize: 13, 
    color: '#64748b', 
    fontWeight: '600',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
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
  downloadBtn: {
    flex: 1,
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardText: { 
    fontSize: 14, 
    color: '#475569', 
    marginBottom: 6,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: { 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  formTitle: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#1e293b', 
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3b82f6',
    marginTop: 12,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#e0f2fe',
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#475569', 
    marginBottom: 8,
    marginLeft: 2,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    marginBottom: 16,
    color: '#1e293b',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#1e293b',
  },
  helperText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: -10,
    marginBottom: 16,
    fontWeight: '500',
  },
  warningText: {
    fontSize: 13,
    color: '#f59e0b',
    marginBottom: 12,
    fontWeight: '600',
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 8,
  },
  formButtons: { 
    flexDirection: 'row', 
    gap: 12, 
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  button: { 
    flex: 1, 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: { 
    backgroundColor: '#ef4444',
  },
  saveButton: { 
    backgroundColor: '#3b82f6',
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
