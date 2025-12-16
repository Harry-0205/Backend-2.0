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
  KeyboardAvoidingView,
  Platform,
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
      console.log('📋 Cargando usuarios...');
      const response = await apiClient.get('/usuarios');
      console.log('✅ Respuesta completa:', JSON.stringify(response.data, null, 2));
      
      const usuariosData = response.data?.data || response.data;
      console.log('👥 Usuarios extraídos:', usuariosData);
      console.log('📊 Total usuarios:', Array.isArray(usuariosData) ? usuariosData.length : 0);
      
      if (Array.isArray(usuariosData) && usuariosData.length > 0) {
        console.log('👤 Primer usuario:', usuariosData[0]);
      }
      
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
    } catch (error: any) {
      console.error('❌ Error al cargar usuarios:', error);
      console.error('❌ Response:', error.response?.data);
      Alert.alert('Error', error.response?.data?.message || 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const loadVeterinarias = async () => {
    try {
      console.log('🏥 Cargando veterinarias...');
      const response = await apiClient.get('/veterinarias');
      console.log('📦 Respuesta veterinarias:', response.data);
      
      // El backend devuelve ApiResponse<List<VeterinariaResponse>>
      // Estructura: { success: boolean, message: string, data: Veterinaria[], timestamp: string }
      let veterinariasList = [];
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        // Si viene en formato ApiResponse
        veterinariasList = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Si viene directamente como array
        veterinariasList = response.data;
      }
      
      // Filtrar solo veterinarias activas
      const veterinariasActivas = veterinariasList.filter((vet: any) => vet.activo !== false);
      
      console.log('✅ Veterinarias cargadas:', veterinariasList.length);
      console.log('✅ Veterinarias activas:', veterinariasActivas.length);
      
      if (veterinariasActivas.length > 0) {
        console.log('📋 Primera veterinaria:', veterinariasActivas[0]);
      }
      
      setVeterinarias(veterinariasActivas);
    } catch (error: any) {
      console.error('❌ Error al cargar veterinarias:', error);
      console.error('❌ Response:', error.response?.data);
      console.error('❌ Status:', error.response?.status);
      setVeterinarias([]);
    }
  };

  const handleSave = async () => {
    // Validaciones mejoradas
    if (!formData.documento || !formData.username || !formData.rol) {
      Alert.alert('Error', 'Documento, usuario y rol son obligatorios');
      return;
    }

    // Validar que no se pueda crear/editar administradores
    if (formData.rol === 'ADMIN' || formData.rol === 'ROLE_ADMIN') {
      Alert.alert('Error', 'No se permite crear o editar usuarios con rol Administrador');
      return;
    }

    if (!editingUsuario && !formData.password) {
      Alert.alert('Error', 'La contraseña es obligatoria al crear un usuario');
      return;
    }

    // Validar que veterinarios tengan veterinaria asignada (SOLO veterinarios)
    if (formData.rol === 'VETERINARIO' && !formData.veterinariaId) {
      Alert.alert('Error', 'Debe seleccionar una veterinaria para el veterinario');
      return;
    }

    // Validar formato de email si se proporciona
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Alert.alert('Error', 'El formato del email no es válido');
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
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
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
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
              />
              <Text style={styles.helperText}>💡 Se recomienda usar un email válido para notificaciones</Text>

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
                  <Picker.Item label="👨‍⚕️ Veterinario" value="VETERINARIO" />
                  <Picker.Item label="👥 Recepcionista" value="RECEPCIONISTA" />
                  <Picker.Item label="🐾 Cliente" value="CLIENTE" />
                </Picker>
              </View>
              <Text style={styles.helperText}>⚠️ No se puede crear usuarios con rol Administrador</Text>

              {/* Mostrar veterinaria para VETERINARIO, RECEPCIONISTA y CLIENTE */}
              {(formData.rol === 'VETERINARIO' || formData.rol === 'RECEPCIONISTA' || formData.rol === 'CLIENTE') && (
                <>
                  <Text style={styles.label}>
                    Veterinaria Asignada {formData.rol === 'VETERINARIO' && '*'}
                  </Text>
                  {veterinarias.length === 0 && (
                    <Text style={styles.warningText}>
                      ⚠️ No hay veterinarias disponibles.{'\n'}
                      Debe crear al menos una veterinaria activa primero.
                    </Text>
                  )}
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.veterinariaId}
                      onValueChange={(value) => setFormData({ ...formData, veterinariaId: value })}
                      style={styles.picker}
                      enabled={veterinarias.length > 0}
                    >
                      <Picker.Item 
                        label={veterinarias.length > 0 ? "Seleccione una veterinaria" : "No hay veterinarias disponibles"} 
                        value="" 
                      />
                      {veterinarias.map((vet) => (
                        <Picker.Item key={vet.id} label={vet.nombre} value={vet.id.toString()} />
                      ))}
                    </Picker>
                  </View>
                  <Text style={styles.helperText}>
                    {formData.rol === 'VETERINARIO' 
                      ? '🏥 Los veterinarios deben estar asignados a una veterinaria' 
                      : '🏥 Opcional: Puede asignar una veterinaria específica'}
                  </Text>
                </>
              )}

              <Text style={styles.label}>
                Contraseña {editingUsuario ? '(opcional)' : '*'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={editingUsuario ? 'Dejar vacío para no cambiar' : 'Contraseña'}
                secureTextEntry
                autoCapitalize="none"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
              />
              {!editingUsuario && (
                <Text style={styles.helperText}>🔒 Mínimo 6 caracteres recomendados</Text>
              )}
              {editingUsuario && (
                <Text style={styles.helperText}>💡 Solo completar si desea cambiar la contraseña</Text>
              )}

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
        </KeyboardAvoidingView>
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
    minHeight: 70,
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
  warningText: {
    fontSize: 13,
    color: '#f59e0b',
    marginBottom: 12,
    fontWeight: '600',
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 8,
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
