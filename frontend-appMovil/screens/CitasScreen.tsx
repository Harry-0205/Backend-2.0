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

export default function CitasScreen({ onBack }: { onBack: () => void }) {
  const [citas, setCitas] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [mascotas, setMascotas] = useState<any[]>([]);
  const [veterinarios, setVeterinarios] = useState<any[]>([]);
  const [veterinarias, setVeterinarias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCita, setEditingCita] = useState<any>(null);
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
    loadCitas();
    loadClientes();
    loadMascotas();
    loadVeterinarios();
    loadVeterinarias();
  }, []);

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
      const response = await apiClient.get('/usuarios');
      const usuariosData = response.data?.data || response.data;
      const clientesList = Array.isArray(usuariosData)
        ? usuariosData.filter(
            (usuario) =>
              usuario.roles?.some((role: string) => role === 'CLIENTE' || role === 'ROLE_CLIENTE')
          )
        : [];
      setClientes(clientesList);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const loadMascotas = async () => {
    try {
      const response = await apiClient.get('/mascotas');
      setMascotas(Array.isArray(response.data) ? response.data : []);
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

  const loadVeterinarias = async () => {
    try {
      const response = await apiClient.get('/veterinarias');
      setVeterinarias(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error al cargar veterinarias:', error);
    }
  };

  const getMascotasByCliente = () => {
    if (!formData.clienteId) return [];
    return mascotas.filter((m) => m.propietario?.documento === formData.clienteId);
  };

  const handleSave = async () => {
    if (!formData.fechaHora || !formData.clienteId || !formData.mascotaId) {
      Alert.alert('Error', 'Fecha, cliente y mascota son obligatorios');
      return;
    }

    try {
      const citaData: any = {
        fechaHora: formData.fechaHora,
        motivo: formData.motivo || null,
        observaciones: formData.observaciones || null,
        cliente: { documento: formData.clienteId },
        mascota: { id: parseInt(formData.mascotaId) },
        veterinario: formData.veterinarioId ? { documento: formData.veterinarioId } : null,
        veterinaria: formData.veterinariaId ? { id: parseInt(formData.veterinariaId) } : null,
      };

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
      Alert.alert('Error', error.response?.data?.message || 'Error al guardar cita');
    }
  };

  const handleEdit = (cita: any) => {
    setEditingCita(cita);
    setFormData({
      fechaHora: cita.fechaHora ? cita.fechaHora.substring(0, 16) : '',
      motivo: cita.motivo || '',
      observaciones: cita.observaciones || '',
      clienteId: cita.clienteDocumento || cita.cliente?.documento || '',
      mascotaId: cita.mascotaId?.toString() || cita.mascota?.id?.toString() || '',
      veterinarioId: cita.veterinarioDocumento || cita.veterinario?.documento || '',
      veterinariaId: cita.veterinariaId?.toString() || cita.veterinaria?.id?.toString() || '',
    });
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
              <TouchableOpacity onPress={() => handleEdit(cita)} style={[styles.editBtn, { flex: 1 }]}>
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
              <Text style={styles.formTitle}>{editingCita ? 'Editar Cita' : 'Nueva Cita'}</Text>

              <Text style={styles.label}>Fecha y Hora *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD HH:MM (Ej: 2024-12-01 14:30)"
                value={formData.fechaHora}
                onChangeText={(text) => setFormData({ ...formData, fechaHora: text })}
              />
              <Text style={styles.helperText}>Formato: Año-Mes-Día Hora:Minuto</Text>

              <Text style={styles.label}>Cliente *</Text>
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

              <Text style={styles.label}>Veterinaria</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.veterinariaId}
                  onValueChange={(value) => setFormData({ ...formData, veterinariaId: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccione una veterinaria" value="" />
                  {veterinarias.map((vet) => (
                    <Picker.Item key={vet.id} label={vet.nombre} value={vet.id.toString()} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Veterinario</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.veterinarioId}
                  onValueChange={(value) => setFormData({ ...formData, veterinarioId: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="Sin asignar" value="" />
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
