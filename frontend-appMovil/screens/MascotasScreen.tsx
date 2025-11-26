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
import apiClient from '../services/apiClient';

export default function MascotasScreen({ onBack }: { onBack: () => void }) {
  const [mascotas, setMascotas] = useState<any[]>([]);
  const [propietarios, setPropietarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMascota, setEditingMascota] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    especie: '',
    raza: '',
    sexo: '',
    fechaNacimiento: '',
    peso: '',
    color: '',
    observaciones: '',
    propietarioId: '',
  });

  useEffect(() => {
    loadMascotas();
    loadPropietarios();
  }, []);

  const loadMascotas = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/mascotas');
      setMascotas(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error al cargar mascotas:', error);
      Alert.alert('Error', 'No se pudieron cargar las mascotas');
    } finally {
      setLoading(false);
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
    if (!formData.nombre || !formData.especie) {
      Alert.alert('Error', 'Nombre y especie son obligatorios');
      return;
    }

    if (!editingMascota && !formData.propietarioId) {
      Alert.alert('Error', 'Debe seleccionar un propietario');
      return;
    }

    try {
      if (editingMascota) {
        // Para edición, NO incluir propietario
        const mascotaData: any = {
          nombre: formData.nombre,
          especie: formData.especie,
          raza: formData.raza || null,
          sexo: formData.sexo || null,
          fechaNacimiento: formData.fechaNacimiento
            ? new Date(formData.fechaNacimiento + 'T00:00:00').toISOString()
            : null,
          peso: formData.peso ? parseFloat(formData.peso) : null,
          color: formData.color || null,
          observaciones: formData.observaciones || null,
        };
        await apiClient.put(`/mascotas/${editingMascota.id}`, mascotaData);
        Alert.alert('Éxito', 'Mascota actualizada correctamente');
      } else {
        // Para creación, incluir propietario
        const mascotaData: any = {
          nombre: formData.nombre,
          especie: formData.especie,
          raza: formData.raza || null,
          sexo: formData.sexo || null,
          fechaNacimiento: formData.fechaNacimiento
            ? new Date(formData.fechaNacimiento + 'T00:00:00').toISOString()
            : null,
          peso: formData.peso ? parseFloat(formData.peso) : null,
          color: formData.color || null,
          observaciones: formData.observaciones || null,
          propietario: {
            documento: formData.propietarioId,
          },
        };
        await apiClient.post('/mascotas', mascotaData);
        Alert.alert('Éxito', 'Mascota creada correctamente');
      }
      setShowForm(false);
      resetForm();
      loadMascotas();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al guardar mascota');
    }
  };

  const handleEdit = (mascota: any) => {
    setEditingMascota(mascota);
    const fechaNac = mascota.fechaNacimiento
      ? new Date(mascota.fechaNacimiento).toISOString().split('T')[0]
      : '';
    setFormData({
      nombre: mascota.nombre || '',
      especie: mascota.especie || '',
      raza: mascota.raza || '',
      sexo: mascota.sexo || '',
      fechaNacimiento: fechaNac,
      peso: mascota.peso?.toString() || '',
      color: mascota.color || '',
      observaciones: mascota.observaciones || '',
      propietarioId: mascota.propietario?.documento || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Confirmar', '¿Estás seguro de eliminar esta mascota?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/mascotas/${id}`);
            Alert.alert('Éxito', 'Mascota eliminada');
            loadMascotas();
          } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar la mascota');
          }
        },
      },
    ]);
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
      propietarioId: '',
    });
    setEditingMascota(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🐾 Gestión de Mascotas</Text>
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
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadMascotas} />}
        contentContainerStyle={styles.content}
      >
        {mascotas.map((mascota) => (
          <View key={mascota.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{mascota.nombre}</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => handleEdit(mascota)} style={styles.editBtn}>
                <Text style={styles.actionText}>✏️</Text>
              </TouchableOpacity>
            </View>
            </View>
            <Text style={styles.cardText}>Especie: {mascota.especie}</Text>
            <Text style={styles.cardText}>Raza: {mascota.raza || 'No especificada'}</Text>
            <Text style={styles.cardText}>Sexo: {mascota.sexo || 'No especificado'}</Text>
            <Text style={styles.cardText}>Peso: {mascota.peso ? `${mascota.peso} kg` : 'N/A'}</Text>
            <Text style={styles.cardText}>Color: {mascota.color || 'N/A'}</Text>
            <Text style={styles.cardText}>
              Propietario: {mascota.propietario?.nombres || 'N/A'} {mascota.propietario?.apellidos || ''}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Form Modal */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>
                {editingMascota ? 'Editar Mascota' : 'Nueva Mascota'}
              </Text>

              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre de la mascota"
                value={formData.nombre}
                onChangeText={(text) => setFormData({ ...formData, nombre: text })}
              />

              <Text style={styles.label}>Especie *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.especie}
                  onValueChange={(value) => setFormData({ ...formData, especie: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccione una especie" value="" />
                  <Picker.Item label="Perro" value="Perro" />
                  <Picker.Item label="Gato" value="Gato" />
                  <Picker.Item label="Ave" value="Ave" />
                  <Picker.Item label="Conejo" value="Conejo" />
                  <Picker.Item label="Hamster" value="Hamster" />
                  <Picker.Item label="Reptil" value="Reptil" />
                  <Picker.Item label="Otro" value="Otro" />
                </Picker>
              </View>

              <Text style={styles.label}>Raza</Text>
              <TextInput
                style={styles.input}
                placeholder="Raza de la mascota"
                value={formData.raza}
                onChangeText={(text) => setFormData({ ...formData, raza: text })}
              />

              <Text style={styles.label}>Sexo</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.sexo}
                  onValueChange={(value) => setFormData({ ...formData, sexo: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccione el sexo" value="" />
                  <Picker.Item label="Macho ♂" value="Macho" />
                  <Picker.Item label="Hembra ♀" value="Hembra" />
                </Picker>
              </View>

              <Text style={styles.label}>Fecha de Nacimiento</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={formData.fechaNacimiento}
                onChangeText={(text) => setFormData({ ...formData, fechaNacimiento: text })}
              />

              <Text style={styles.label}>Peso (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Peso en kilogramos"
                keyboardType="decimal-pad"
                value={formData.peso}
                onChangeText={(text) => setFormData({ ...formData, peso: text })}
              />

              <Text style={styles.label}>Color</Text>
              <TextInput
                style={styles.input}
                placeholder="Color del pelaje/plumaje"
                value={formData.color}
                onChangeText={(text) => setFormData({ ...formData, color: text })}
              />

              <Text style={styles.label}>Propietario *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.propietarioId}
                  onValueChange={(value) => setFormData({ ...formData, propietarioId: value })}
                  style={styles.picker}
                  enabled={!editingMascota}
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
              {editingMascota && (
                <Text style={styles.helperText}>El propietario no se puede modificar</Text>
              )}

              <Text style={styles.label}>Observaciones</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Alergias, enfermedades, tratamientos especiales, etc."
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
  cardActions: { flexDirection: 'row', gap: 10 },
  editBtn: { padding: 8 },
  deleteBtn: { padding: 8 },
  actionText: { fontSize: 18 },
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
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: -10,
    marginBottom: 15,
  },
  formButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
  button: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  cancelButton: { backgroundColor: '#ef4444' },
  saveButton: { backgroundColor: '#10b981' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
