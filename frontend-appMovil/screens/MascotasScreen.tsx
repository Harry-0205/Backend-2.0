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
import authService from '../services/authService';

export default function MascotasScreen({ onBack }: { onBack: () => void }) {
  const [mascotas, setMascotas] = useState<any[]>([]);
  const [propietarios, setPropietarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMascota, setEditingMascota] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
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
    loadCurrentUser();
    loadMascotas();
    loadPropietarios();
  }, []);

  const loadCurrentUser = async () => {
    const user = await authService.getCurrentUser();
    setCurrentUser(user);
  };

  const isCliente = () => {
    return currentUser?.roles?.includes('ROLE_CLIENTE') || currentUser?.roles?.includes('CLIENTE');
  };

  const loadMascotas = async () => {
    setLoading(true);
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        console.error('❌ No hay usuario autenticado');
        setLoading(false);
        return;
      }

      const roles = user.roles || [];
      const esCliente = roles.includes('ROLE_CLIENTE') || roles.includes('CLIENTE');
      
      let response;
      if (esCliente && user.documento) {
        console.log('🐾 Cliente: Cargando mascotas del propietario:', user.documento);
        response = await apiClient.get(`/mascotas/propietario/${user.documento}`);
      } else {
        console.log('🐾 Cargando todas las mascotas');
        response = await apiClient.get('/mascotas');
      }
      
      setMascotas(Array.isArray(response.data) ? response.data : []);
      console.log('✅ Mascotas cargadas:', response.data?.length || 0);
    } catch (error) {
      console.error('❌ Error al cargar mascotas:', error);
      Alert.alert('Error', 'No se pudieron cargar las mascotas');
    } finally {
      setLoading(false);
    }
  };

  const loadPropietarios = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return;

      const roles = user.roles || [];
      const esCliente = roles.includes('ROLE_CLIENTE') || roles.includes('CLIENTE');

      if (esCliente) {
        // Si es cliente, solo mostrar al usuario actual como propietario
        const clienteData = {
          documento: user.documento || '',
          username: user.username || '',
          email: user.email || '',
          nombres: user.nombres || 'Mi',
          apellidos: user.apellidos || 'Perfil',
          roles: ['CLIENTE']
        };
        setPropietarios([clienteData]);
        console.log('👤 Cliente: Usuario actual como propietario');
        return;
      }

      // Para admin/recepcionista, cargar todos los usuarios
      const response = await apiClient.get('/usuarios');
      const usuariosData = response.data?.data || response.data;
      const clientes = Array.isArray(usuariosData)
        ? usuariosData.filter(
            (usuario) =>
              usuario.roles?.some((role: string) => role === 'CLIENTE' || role === 'ROLE_CLIENTE')
          )
        : [];
      setPropietarios(clientes);
      console.log('👥 Propietarios cargados:', clientes.length);
    } catch (error) {
      console.error('❌ Error al cargar propietarios:', error);
      // Si hay error y es cliente, al menos mostrar usuario actual
      const user = await authService.getCurrentUser();
      if (user) {
        const roles = user.roles || [];
        const esCliente = roles.includes('ROLE_CLIENTE') || roles.includes('CLIENTE');
        if (esCliente) {
          const clienteData = {
            documento: user.documento || '',
            username: user.username || '',
            email: user.email || '',
            nombres: user.nombres || 'Mi',
            apellidos: user.apellidos || 'Perfil',
            roles: ['CLIENTE']
          };
          setPropietarios([clienteData]);
        }
      }
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
              <Text style={styles.cardSubtitle}>
                {mascota.especie} • {mascota.sexo === 'Macho' ? '♂' : mascota.sexo === 'Hembra' ? '♀' : ''}
              </Text>
            </View>
            <Text style={styles.cardText}>🐾 Raza: {mascota.raza || 'No especificada'}</Text>
            <Text style={styles.cardText}>⚖️ Peso: {mascota.peso ? `${mascota.peso} kg` : 'N/A'}</Text>
            <Text style={styles.cardText}>🎨 Color: {mascota.color || 'N/A'}</Text>
            {mascota.fechaNacimiento && (
              <Text style={styles.cardText}>
                🎂 Nacimiento: {new Date(mascota.fechaNacimiento).toLocaleDateString('es-ES')}
              </Text>
            )}
            <Text style={styles.cardText}>
              👤 Propietario: {mascota.propietario?.nombres || 'N/A'} {mascota.propietario?.apellidos || ''}
            </Text>
            {mascota.observaciones && (
              <Text style={styles.cardText}>📝 {mascota.observaciones}</Text>
            )}
            
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => handleEdit(mascota)} style={[styles.editBtn, { flex: 1 }]}>
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
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cardTitle: { fontSize: 19, fontWeight: '700', color: '#1e293b', marginBottom: 6 },
  cardSubtitle: { fontSize: 15, color: '#3b82f6', fontWeight: '600' },
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
    minHeight: 90,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginBottom: 18,
    overflow: 'hidden',
  },
  picker: {
    height: 54,
  },
  helperText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: -12,
    marginBottom: 18,
    fontWeight: '500',
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
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
