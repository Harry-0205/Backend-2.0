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
    backgroundColor: '#f1f5f9',
  },
  header: {
    backgroundColor: '#1e40af',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 26,
    color: '#fff',
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  role: {
    fontSize: 15,
    color: '#dbeafe',
    marginTop: 3,
    fontWeight: '500',
  },
  content: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    borderLeftWidth: 5,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  greenCard: { 
    borderLeftColor: '#10b981',
    shadowColor: '#10b981',
  },
  orangeCard: { 
    borderLeftColor: '#f59e0b',
    shadowColor: '#f59e0b',
  },
  redCard: { 
    borderLeftColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  purpleCard: { 
    borderLeftColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
  },
  blueCard: { 
    borderLeftColor: '#3b82f6',
    shadowColor: '#3b82f6',
  },
  statIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1e293b',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 18,
    letterSpacing: 0.3,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionButton: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  drawerContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.6)',
  },
  drawerMenu: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 20,
  },
  menuHeader: {
    backgroundColor: '#1e40af',
    padding: 30,
    alignItems: 'center',
    paddingTop: 55,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  menuUserName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  menuUserEmail: {
    fontSize: 14,
    color: '#dbeafe',
    fontWeight: '500',
  },
  menuItems: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuItemIcon: {
    fontSize: 26,
  },
  menuItemText: {
    fontSize: 17,
    color: '#1e293b',
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    margin: 20,
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#fecaca',
    gap: 12,
  },
  logoutIcon: {
    fontSize: 22,
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#dc2626',
  },
});
