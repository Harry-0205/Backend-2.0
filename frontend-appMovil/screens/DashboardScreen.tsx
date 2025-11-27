import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Modal,
  SafeAreaView,
  Animated,
} from 'react-native';
import authService from '../services/authService';
import apiClient from '../services/apiClient';
import MascotasScreen from './MascotasScreen';
import CitasScreen from './CitasScreen';
import UsuariosScreen from './UsuariosScreen';
import HistoriasClinicasScreen from './HistoriasClinicasScreen';

interface DashboardScreenProps {
  onLogout: () => void;
}

export default function DashboardScreen({ onLogout }: DashboardScreenProps) {
  const [stats, setStats] = useState({
    totalMascotas: 0,
    totalCitas: 0,
    citasPendientes: 0,
    totalUsuarios: 0,
    totalHistorias: 0,
  });
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');
  const slideAnim = useState(new Animated.Value(-280))[0]; // Inicia fuera de pantalla a la izquierda

  useEffect(() => {
    loadUser();
    loadStats();
  }, []);

  useEffect(() => {
    if (showMenu) {
      // Deslizar hacia la derecha (mostrar menú)
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      // Deslizar hacia la izquierda (ocultar menú)
      Animated.timing(slideAnim, {
        toValue: -280,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [showMenu]);

  const loadUser = async () => {
    const user = await authService.getCurrentUser();
    setCurrentUser(user);
    console.log('👤 Usuario actual:', user);
    console.log('🔐 Roles:', user?.roles);
  };

  const getUserRole = () => {
    if (!currentUser?.roles) return null;
    const roles = currentUser.roles;
    if (roles.includes('ROLE_ADMIN') || roles.includes('ADMIN')) return 'ADMIN';
    if (roles.includes('ROLE_VETERINARIO') || roles.includes('VETERINARIO')) return 'VETERINARIO';
    if (roles.includes('ROLE_RECEPCIONISTA') || roles.includes('RECEPCIONISTA')) return 'RECEPCIONISTA';
    if (roles.includes('ROLE_CLIENTE') || roles.includes('CLIENTE')) return 'CLIENTE';
    return null;
  };

  const getRoleLabel = () => {
    const role = getUserRole();
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'VETERINARIO': return 'Veterinario';
      case 'RECEPCIONISTA': return 'Recepcionista';
      case 'CLIENTE': return 'Cliente';
      default: return 'Usuario';
    }
  };

  const canAccessUsuarios = () => {
    const role = getUserRole();
    return role === 'ADMIN';
  };

  const canManageCitas = () => {
    const role = getUserRole();
    return role === 'ADMIN' || role === 'RECEPCIONISTA' || role === 'VETERINARIO';
  };

  const canManageHistorias = () => {
    const role = getUserRole();
    return role === 'ADMIN' || role === 'VETERINARIO';
  };

  const canManageMascotas = () => {
    const role = getUserRole();
    return role === 'ADMIN' || role === 'CLIENTE';
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      // Obtener el usuario actual directamente para evitar problemas de sincronización
      const user = await authService.getCurrentUser();
      if (!user) {
        console.error('❌ No hay usuario autenticado');
        setLoading(false);
        return;
      }

      const roles = user.roles || [];
      let role = null;
      if (roles.includes('ROLE_ADMIN') || roles.includes('ADMIN')) role = 'ADMIN';
      else if (roles.includes('ROLE_VETERINARIO') || roles.includes('VETERINARIO')) role = 'VETERINARIO';
      else if (roles.includes('ROLE_RECEPCIONISTA') || roles.includes('RECEPCIONISTA')) role = 'RECEPCIONISTA';
      else if (roles.includes('ROLE_CLIENTE') || roles.includes('CLIENTE')) role = 'CLIENTE';

      console.log('👤 Usuario en loadStats:', user.username);
      console.log('🔐 Rol detectado:', role);
      
      // Cargar solo las estadísticas permitidas según el rol
      const promises: Promise<any>[] = [];
      
      // Mascotas - ADMIN y CLIENTE
      if (role === 'ADMIN') {
        console.log('📊 Admin: Cargando todas las mascotas');
        promises.push(apiClient.get('/mascotas'));
      } else if (role === 'CLIENTE' && user.documento) {
        console.log('📊 Cliente: Cargando mascotas del propietario:', user.documento);
        promises.push(apiClient.get(`/mascotas/propietario/${user.documento}`));
      } else {
        console.log('📊 No carga mascotas para este rol:', role);
        promises.push(Promise.resolve({ data: [] }));
      }
      
      // Citas - Todos
      console.log('📊 Cargando citas');
      promises.push(apiClient.get('/citas'));
      
      // Usuarios - Solo ADMIN
      if (role === 'ADMIN') {
        console.log('📊 Admin: Cargando usuarios');
        promises.push(apiClient.get('/usuarios'));
      } else {
        promises.push(Promise.resolve({ data: { data: [] } }));
      }
      
      // Historias Clínicas - ADMIN, VETERINARIO, CLIENTE
      if (role === 'ADMIN' || role === 'VETERINARIO' || role === 'CLIENTE') {
        console.log('📊 Cargando historias clínicas');
        promises.push(apiClient.get('/historias-clinicas'));
      } else {
        promises.push(Promise.resolve({ data: [] }));
      }

      const [mascotasRes, citasRes, usuariosRes, historiasRes] = await Promise.all(promises);

      const citas = citasRes.data;
      const citasPendientes = Array.isArray(citas)
        ? citas.filter((c: any) => c.estado === 'PROGRAMADA' || c.estado === 'CONFIRMADA').length
        : 0;

      // Extraer data de ApiResponse wrapper para usuarios
      const usuariosData = usuariosRes.data?.data || usuariosRes.data;

      setStats({
        totalMascotas: Array.isArray(mascotasRes.data) ? mascotasRes.data.length : 0,
        totalCitas: Array.isArray(citasRes.data) ? citasRes.data.length : 0,
        citasPendientes,
        totalUsuarios: Array.isArray(usuariosData) ? usuariosData.length : 0,
        totalHistorias: Array.isArray(historiasRes.data) ? historiasRes.data.length : 0,
      });
      
      console.log('✅ Estadísticas cargadas:', {
        mascotas: mascotasRes.data?.length || 0,
        citas: citasRes.data?.length || 0,
        historias: historiasRes.data?.length || 0
      });
    } catch (error) {
      console.error('❌ Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    onLogout();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  const navigateTo = (screen: string) => {
    setCurrentScreen(screen);
    setShowMenu(false);
  };

  if (currentScreen === 'mascotas') {
    return <MascotasScreen onBack={() => setCurrentScreen('dashboard')} />;
  }

  if (currentScreen === 'citas') {
    return <CitasScreen onBack={() => setCurrentScreen('dashboard')} />;
  }

  if (currentScreen === 'usuarios') {
    return <UsuariosScreen onBack={() => setCurrentScreen('dashboard')} />;
  }

  if (currentScreen === 'historias') {
    return <HistoriasClinicasScreen onBack={() => setCurrentScreen('dashboard')} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowMenu(true)} style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.greeting}>{getGreeting()}, {currentUser?.nombres}!</Text>
          <Text style={styles.role}>{getRoleLabel()}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStats} />}
        contentContainerStyle={styles.content}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Mascotas - ADMIN y CLIENTE */}
          {(getUserRole() === 'ADMIN' || getUserRole() === 'CLIENTE') && (
            <View style={[styles.statCard, styles.greenCard]}>
              <Text style={styles.statIcon}>🐾</Text>
              <Text style={styles.statLabel}>
                {getUserRole() === 'CLIENTE' ? 'Mis Mascotas' : 'Total Mascotas'}
              </Text>
              <Text style={styles.statValue}>{stats.totalMascotas}</Text>
            </View>
          )}

          {/* Citas - Todos excepto CLIENTE */}
          {getUserRole() !== 'CLIENTE' && (
            <View style={[styles.statCard, styles.orangeCard]}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statLabel}>Total de Citas</Text>
              <Text style={styles.statValue}>{stats.totalCitas}</Text>
            </View>
          )}

          {/* Mis Citas - Solo CLIENTE */}
          {getUserRole() === 'CLIENTE' && (
            <View style={[styles.statCard, styles.orangeCard]}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statLabel}>Mis Citas</Text>
              <Text style={styles.statValue}>{stats.totalCitas}</Text>
            </View>
          )}

          {/* Citas Pendientes - Todos */}
          <View style={[styles.statCard, styles.redCard]}>
            <Text style={styles.statIcon}>⏰</Text>
            <Text style={styles.statLabel}>
              {getUserRole() === 'CLIENTE' ? 'Citas Pendientes' : 'Citas Programadas'}
            </Text>
            <Text style={styles.statValue}>{stats.citasPendientes}</Text>
          </View>

          {/* Historias Clínicas - ADMIN, VETERINARIO, CLIENTE */}
          {(getUserRole() === 'ADMIN' || getUserRole() === 'VETERINARIO' || getUserRole() === 'CLIENTE') && (
            <View style={[styles.statCard, styles.purpleCard]}>
              <Text style={styles.statIcon}>📋</Text>
              <Text style={styles.statLabel}>
                {getUserRole() === 'CLIENTE' ? 'Mis Historias' : 'Historias Clínicas'}
              </Text>
              <Text style={styles.statValue}>{stats.totalHistorias}</Text>
            </View>
          )}

          {/* Usuarios - Solo ADMIN */}
          {getUserRole() === 'ADMIN' && (
            <View style={[styles.statCard, styles.blueCard]}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statLabel}>Total Usuarios</Text>
              <Text style={styles.statValue}>{stats.totalUsuarios}</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.actionsGrid}>
          {/* Nueva Cita - ADMIN, RECEPCIONISTA, VETERINARIO, CLIENTE */}
          {canManageCitas() && (
            <TouchableOpacity style={styles.actionButton} onPress={() => navigateTo('citas')}>
              <Text style={styles.actionIcon}>➕</Text>
              <Text style={styles.actionText}>
                {getUserRole() === 'CLIENTE' ? 'Agendar Cita' : 'Nueva Cita'}
              </Text>
            </TouchableOpacity>
          )}

          {getUserRole() === 'CLIENTE' && (
            <TouchableOpacity style={styles.actionButton} onPress={() => navigateTo('citas')}>
              <Text style={styles.actionIcon}>📅</Text>
              <Text style={styles.actionText}>Ver Mis Citas</Text>
            </TouchableOpacity>
          )}

          {/* Nueva Mascota - ADMIN, CLIENTE */}
          {canManageMascotas() && (
            <TouchableOpacity style={styles.actionButton} onPress={() => navigateTo('mascotas')}>
              <Text style={styles.actionIcon}>
                {getUserRole() === 'CLIENTE' ? '➕' : '📝'}
              </Text>
              <Text style={styles.actionText}>
                {getUserRole() === 'CLIENTE' ? 'Registrar Mascota' : 'Nueva Mascota'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Nueva Historia - ADMIN, VETERINARIO */}
          {canManageHistorias() && (
            <TouchableOpacity style={styles.actionButton} onPress={() => navigateTo('historias')}>
              <Text style={styles.actionIcon}>🩺</Text>
              <Text style={styles.actionText}>Nueva Historia</Text>
            </TouchableOpacity>
          )}

          {/* Ver Historias - CLIENTE */}
          {getUserRole() === 'CLIENTE' && (
            <TouchableOpacity style={styles.actionButton} onPress={() => navigateTo('historias')}>
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionText}>Mis Historias</Text>
            </TouchableOpacity>
          )}

          {/* Actualizar - Todos */}
          <TouchableOpacity style={styles.actionButton} onPress={loadStats}>
            <Text style={styles.actionIcon}>🔄</Text>
            <Text style={styles.actionText}>Actualizar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Side Menu */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <View style={styles.drawerContainer}>
          <TouchableOpacity
            style={styles.drawerOverlay}
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
          />
          <Animated.View 
            style={[
              styles.drawerMenu,
              {
                transform: [{ translateX: slideAnim }]
              }
            ]}
          >
            <View style={styles.menuHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {currentUser?.nombres?.charAt(0)}{currentUser?.apellidos?.charAt(0)}
                </Text>
              </View>
              <Text style={styles.menuUserName}>
                {currentUser?.nombres} {currentUser?.apellidos}
              </Text>
              <Text style={styles.menuUserEmail}>{currentUser?.email}</Text>
            </View>

            <View style={styles.menuItems}>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('dashboard')}>
                <Text style={styles.menuItemIcon}>📊</Text>
                <Text style={styles.menuItemText}>Dashboard</Text>
              </TouchableOpacity>
              
              {/* Mascotas - ADMIN, CLIENTE */}
              {canManageMascotas() && (
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('mascotas')}>
                  <Text style={styles.menuItemIcon}>🐾</Text>
                  <Text style={styles.menuItemText}>
                    {getUserRole() === 'CLIENTE' ? 'Mis Mascotas' : 'Mascotas'}
                  </Text>
                </TouchableOpacity>
              )}
              
              {/* Citas - ADMIN, VETERINARIO, RECEPCIONISTA, CLIENTE */}
              {canManageCitas() && (
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('citas')}>
                  <Text style={styles.menuItemIcon}>📅</Text>
                  <Text style={styles.menuItemText}>
                    {getUserRole() === 'CLIENTE' ? 'Mis Citas' : 'Citas'}
                  </Text>
                </TouchableOpacity>
              )}
              
              {/* Historias Clínicas - ADMIN, VETERINARIO, CLIENTE */}
              {(getUserRole() === 'ADMIN' || getUserRole() === 'VETERINARIO' || getUserRole() === 'CLIENTE') && (
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('historias')}>
                  <Text style={styles.menuItemIcon}>📋</Text>
                  <Text style={styles.menuItemText}>
                    {getUserRole() === 'CLIENTE' ? 'Mis Historias' : 'Historias Clínicas'}
                  </Text>
                </TouchableOpacity>
              )}
              
              {/* Usuarios - Solo ADMIN */}
              {canAccessUsuarios() && (
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('usuarios')}>
                  <Text style={styles.menuItemIcon}>👥</Text>
                  <Text style={styles.menuItemText}>Usuarios</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutIcon}>🚪</Text>
              <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  menuButton: {
    width: 45,
    height: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 24,
    color: '#fff',
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  role: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  content: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 30,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  greenCard: { borderLeftColor: '#10b981' },
  orangeCard: { borderLeftColor: '#f59e0b' },
  redCard: { borderLeftColor: '#ef4444' },
  purpleCard: { borderLeftColor: '#8b5cf6' },
  blueCard: { borderLeftColor: '#3b82f6' },
  statIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  actionButton: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  drawerContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawerMenu: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 16,
  },
  menuHeader: {
    backgroundColor: '#667eea',
    padding: 30,
    alignItems: 'center',
    paddingTop: 50,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  menuUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  menuUserEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  menuItems: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 15,
  },
  menuItemIcon: {
    fontSize: 24,
  },
  menuItemText: {
    fontSize: 16,
    color: '#374151',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fcc',
    gap: 10,
  },
  logoutIcon: {
    fontSize: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#c33',
  },
});
