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
    loadHistorias();
    loadMascotas();
    loadVeterinarios();
    loadPropietarios();
  }, []);

  const loadHistorias = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/historias-clinicas');
      setHistorias(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error al cargar historias:', error);
      Alert.alert('Error', 'No se pudieron cargar las historias clínicas');
    } finally {
      setLoading(false);
    }
  };

  const loadMascotas = async () => {
    try {
      const response = await apiClient.get('/mascotas');
      const mascotasData = Array.isArray(response.data) ? response.data : [];
      setMascotas(mascotasData);
      setFilteredMascotas(mascotasData);
    } catch (error) {
      console.error('Error al cargar mascotas:', error);
    }
  };

  const loadVeterinarios = async () => {
    try {
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
    } catch (error) {
      console.error('Error al cargar veterinarios:', error);
    }
  };

  const loadPropietarios = async () => {
    try {
      const response = await apiClient.get('/usuarios');
      const usuariosData = response.data?.data || response.data;
      const clientes = Array.isArray(usuariosData)
        ? usuariosData.filter(
            (usuario) =>
              usuario.roles?.some((role: string) => role === 'CLIENTE' || role === 'ROLE_CLIENTE')
          )
        : [];
      setPropietarios(clientes);
    } catch (error) {
      console.error('Error al cargar propietarios:', error);
    }
  };

  const handleSave = async () => {
    if (!formData.fechaConsulta || !formData.mascotaId || !formData.veterinarioId) {
      Alert.alert('Error', 'Fecha de consulta, mascota y veterinario son obligatorios');
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
        veterinarioDocumento: formData.veterinarioId,
      };

      if (editingHistoria) {
        await apiClient.put(`/historias-clinicas/${editingHistoria.id}`, historiaData);
        Alert.alert('Éxito', 'Historia clínica actualizada correctamente');
      } else {
        await apiClient.post('/historias-clinicas', historiaData);
        Alert.alert('Éxito', 'Historia clínica creada correctamente');
      }
      setShowForm(false);
      resetForm();
      loadHistorias();
    } catch (error: any) {
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
      veterinarioId: '',
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
      
      // Construir la URL del PDF
      const API_BASE_URL = 'http://172.16.103.201:8080/api';
      const pdfUrl = `${API_BASE_URL}/pdf/historia-clinica/${historia.mascota.id}`;
      
      // Crear nombre del archivo
      const fileName = `historia_clinica_${historia.mascota.nombre}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Usar la nueva API de expo-file-system v19
      const pdfFile = new File(Paths.cache, fileName);
      
      // Descargar el archivo usando fetch
      const response = await fetch(pdfUrl, {
        method: 'GET',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error(`Error al descargar: ${response.status}`);
      }

      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      
      // Escribir el archivo
      await pdfFile.create();
      const writer = pdfFile.writableStream().getWriter();
      await writer.write(new Uint8Array(arrayBuffer));
      await writer.close();

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
      console.error('Error al descargar PDF:', error);
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
        <TouchableOpacity
          onPress={() => {
            resetForm();
            setShowForm(true);
          }}
          style={styles.addButton}
        >
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
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
                style={[styles.downloadBtn, { flex: 1, marginRight: 10 }]}
                disabled={downloading === historia.id}
              >
                {downloading === historia.id ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionText}>📄 Descargar PDF</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleEdit(historia)} style={[styles.editBtn, { flex: 1 }]}>
                <Text style={styles.actionText}>✏️ Editar</Text>
              </TouchableOpacity>
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
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.propietarioId}
                  onValueChange={(value) => {
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
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.mascotaId}
                  onValueChange={(value) => setFormData({ ...formData, mascotaId: value })}
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
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.veterinarioId}
                  onValueChange={(value) => setFormData({ ...formData, veterinarioId: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccione un veterinario" value="" />
                  {veterinarios.map((vet) => (
                    <Picker.Item
                      key={vet.documento}
                      label={`Dr. ${vet.nombres || ''} ${vet.apellidos || ''}`}
                      value={vet.documento}
                    />
                  ))}
                </Picker>
              </View>

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
  cardDate: { fontSize: 14, color: '#6b7280', fontWeight: '600' },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  editBtn: {
    backgroundColor: '#f59e0b',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadBtn: {
    backgroundColor: '#10b981',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
    marginTop: 10,
    marginBottom: 15,
  },
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
    minHeight: 70,
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
  formButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
  button: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  cancelButton: { backgroundColor: '#ef4444' },
  saveButton: { backgroundColor: '#10b981' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
