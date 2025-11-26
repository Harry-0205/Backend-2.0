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

export default function UsuariosScreen({ onBack }: { onBack: () => void }) {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [veterinarias, setVeterinarias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<any>(null);
  const [formData, setFormData] = useState({
    documento: '',
    username: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    tipoDocumento: 'CC',
    password: '',
    rol: '',
    veterinariaId: '',
  });

  useEffect(() => {
    loadUsuarios();
    loadVeterinarias();
  }, []);

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/usuarios');
      console.log('Respuesta de usuarios:', response.data);
      const usuariosData = response.data?.data || response.data;
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
    } catch (error: any) {
      console.error('Error al cargar usuarios:', error);
      Alert.alert('Error', error.response?.data?.message || 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
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

  const handleSave = async () => {
    if (!formData.documento || !formData.username || !formData.rol) {
      Alert.alert('Error', 'Documento, usuario y rol son obligatorios');
      return;
    }

    if (!editingUsuario && !formData.password) {
      Alert.alert('Error', 'La contraseña es obligatoria al crear un usuario');
      return;
    }

    try {
      if (editingUsuario) {
        const usuarioActualizado: any = {
          documento: formData.documento,
          username: formData.username,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          email: formData.email,
          telefono: formData.telefono,
          direccion: formData.direccion,
          activo: editingUsuario.activo,
          tipoDocumento: formData.tipoDocumento || 'CC',
          roles: [formData.rol],
          veterinariaId: formData.veterinariaId ? parseInt(formData.veterinariaId) : undefined,
        };
        if (formData.password && formData.password.trim() !== '') {
          usuarioActualizado.password = formData.password;
        }
        await apiClient.put(`/usuarios/${editingUsuario.documento}`, usuarioActualizado);
        Alert.alert('Éxito', 'Usuario actualizado correctamente');
      } else {
        const nuevoUsuario: any = {
          documento: formData.documento,
          username: formData.username,
          password: formData.password,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          email: formData.email,
          telefono: formData.telefono,
          direccion: formData.direccion,
          tipoDocumento: formData.tipoDocumento,
          roles: [formData.rol],
          veterinariaId: formData.veterinariaId ? parseInt(formData.veterinariaId) : undefined,
        };
        await apiClient.post('/usuarios', nuevoUsuario);
        Alert.alert('Éxito', 'Usuario creado correctamente');
      }
      setShowForm(false);
      resetForm();
      loadUsuarios();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const handleEdit = (usuario: any) => {
    setEditingUsuario(usuario);
    const rol = usuario.roles && usuario.roles.length > 0 
      ? usuario.roles[0].replace('ROLE_', '') 
      : '';
    setFormData({
      documento: usuario.documento || '',
      username: usuario.username || '',
      nombres: usuario.nombres || '',
      apellidos: usuario.apellidos || '',
      email: usuario.email || '',
      telefono: usuario.telefono || '',
      direccion: usuario.direccion || '',
      tipoDocumento: usuario.tipoDocumento || 'CC',
      password: '',
      rol: rol,
      veterinariaId: usuario.veterinariaId?.toString() || '',
    });
    setShowForm(true);
  };

  const handleDelete = (documento: string) => {
    Alert.alert('Confirmar', '¿Estás seguro de eliminar este usuario?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/usuarios/${documento}`);
            Alert.alert('Éxito', 'Usuario eliminado');
            loadUsuarios();
          } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar el usuario');
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setFormData({
      documento: '',
      username: '',
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      direccion: '',
      tipoDocumento: 'CC',
      password: '',
      rol: '',
      veterinariaId: '',
    });
    setEditingUsuario(null);
  };

  const getRoleBadgeColor = (rol: string) => {
    const normalizedRole = rol?.replace('ROLE_', '');
    const colores: any = {
      ADMIN: '#ef4444',
      VETERINARIO: '#10b981',
      RECEPCIONISTA: '#3b82f6',
      CLIENTE: '#6b7280',
    };
    return colores[normalizedRole] || '#6b7280';
  };

  const getRoleDisplayName = (rol: string) => {
    const normalizedRole = rol?.replace('ROLE_', '');
    const nombres: any = {
      ADMIN: 'Administrador',
      VETERINARIO: 'Veterinario',
      RECEPCIONISTA: 'Recepcionista',
      CLIENTE: 'Cliente',
    };
    return nombres[normalizedRole] || rol;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>👥 Gestión de Usuarios</Text>
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
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadUsuarios} />}
        contentContainerStyle={styles.content}
      >
        {usuarios.map((usuario) => (
          <View key={usuario.documento} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{usuario.username}</Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: getRoleBadgeColor(usuario.roles?.[0] || '') },
                ]}
              >
                <Text style={styles.badgeText}>
                  {getRoleDisplayName(usuario.roles?.[0] || '')}
                </Text>
              </View>
            </View>
            <Text style={styles.cardText}>
              👤 {usuario.nombres || ''} {usuario.apellidos || ''}
            </Text>
            <Text style={styles.cardText}>📄 Doc: {usuario.documento}</Text>
            <Text style={styles.cardText}>📧 {usuario.email || 'Sin email'}</Text>
            <Text style={styles.cardText}>📱 {usuario.telefono || 'Sin teléfono'}</Text>
            {usuario.veterinariaNombre && (
              <Text style={styles.cardText}>🏥 {usuario.veterinariaNombre}</Text>
            )}

            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => handleEdit(usuario)} style={[styles.editBtn, { flex: 1 }]}>
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
                {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
              </Text>

              <Text style={styles.label}>Documento *</Text>
              <TextInput
                style={styles.input}
                placeholder="Número de documento"
                value={formData.documento}
                onChangeText={(text) => setFormData({ ...formData, documento: text })}
                editable={!editingUsuario}
              />
              {editingUsuario && <Text style={styles.helperText}>El documento no se puede modificar</Text>}

              <Text style={styles.label}>Tipo de Documento *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.tipoDocumento}
                  onValueChange={(value) => setFormData({ ...formData, tipoDocumento: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="Cédula de Ciudadanía" value="CC" />
                  <Picker.Item label="Cédula de Extranjería" value="CE" />
                  <Picker.Item label="Tarjeta de Identidad" value="TI" />
                  <Picker.Item label="Registro Civil" value="RC" />
                  <Picker.Item label="Pasaporte" value="PA" />
                </Picker>
              </View>

              <Text style={styles.label}>Usuario *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre de usuario"
                value={formData.username}
                onChangeText={(text) => setFormData({ ...formData, username: text })}
              />

              <Text style={styles.label}>Nombres</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombres"
                value={formData.nombres}
                onChangeText={(text) => setFormData({ ...formData, nombres: text })}
              />

              <Text style={styles.label}>Apellidos</Text>
              <TextInput
                style={styles.input}
                placeholder="Apellidos"
                value={formData.apellidos}
                onChangeText={(text) => setFormData({ ...formData, apellidos: text })}
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="correo@ejemplo.com"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
              />

              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                placeholder="Número de teléfono"
                keyboardType="phone-pad"
                value={formData.telefono}
                onChangeText={(text) => setFormData({ ...formData, telefono: text })}
              />

              <Text style={styles.label}>Dirección</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Dirección completa"
                multiline
                numberOfLines={2}
                value={formData.direccion}
                onChangeText={(text) => setFormData({ ...formData, direccion: text })}
              />

              <Text style={styles.label}>Rol *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.rol}
                  onValueChange={(value) => setFormData({ ...formData, rol: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccione un rol" value="" />
                  <Picker.Item label="Administrador" value="ADMIN" />
                  <Picker.Item label="Veterinario" value="VETERINARIO" />
                  <Picker.Item label="Recepcionista" value="RECEPCIONISTA" />
                  <Picker.Item label="Cliente" value="CLIENTE" />
                </Picker>
              </View>

              {formData.rol === 'VETERINARIO' && (
                <>
                  <Text style={styles.label}>Veterinaria *</Text>
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
                </>
              )}

              <Text style={styles.label}>
                Contraseña {editingUsuario ? '(opcional)' : '*'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={editingUsuario ? 'Dejar vacío para no cambiar' : 'Contraseña'}
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
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
  editBtn: {
    flex: 1,
    backgroundColor: '#f59e0b',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#ef4444',
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
    minHeight: 60,
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
