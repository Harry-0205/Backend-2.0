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

  useEffect(() => {
    loadUser();
    loadStats();
  }, []);

  const loadUser = async () => {
    const user = await authService.getCurrentUser();
    setCurrentUser(user);
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const [mascotasRes, citasRes, usuariosRes, historiasRes] = await Promise.all([
        apiClient.get('/mascotas'),
        apiClient.get('/citas'),
        apiClient.get('/usuarios'),
        apiClient.get('/historias-clinicas'),
      ]);

      const citas = citasRes.data;
      const citasPendientes = Array.isArray(citas)
        ? citas.filter((c: any) => c.estado === 'PROGRAMADA').length
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
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
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
        <View>
          <Text style={styles.greeting}>{getGreeting()}, {currentUser?.nombres}!</Text>
          <Text style={styles.role}>Administrador</Text>
        </View>
        <TouchableOpacity onPress={() => setShowMenu(true)} style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStats} />}
        contentContainerStyle={styles.content}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.greenCard]}>
            <Text style={styles.statIcon}>🐾</Text>
            <Text style={styles.statLabel}>Mis Mascotas</Text>
            <Text style={styles.statValue}>{stats.totalMascotas}</Text>
          </View>

          <View style={[styles.statCard, styles.orangeCard]}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statLabel}>Total de Citas</Text>
            <Text style={styles.statValue}>{stats.totalCitas}</Text>
          </View>

          <View style={[styles.statCard, styles.redCard]}>
            <Text style={styles.statIcon}>📋</Text>
            <Text style={styles.statLabel}>Citas Pendientes</Text>
            <Text style={styles.statValue}>{stats.citasPendientes}</Text>
          </View>

          <View style={[styles.statCard, styles.purpleCard]}>
            <Text style={styles.statIcon}>📋</Text>
            <Text style={styles.statLabel}>Historias Clínicas</Text>
            <Text style={styles.statValue}>{stats.totalHistorias}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigateTo('citas')}>
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionText}>Nueva Cita</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigateTo('mascotas')}>
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionText}>Nueva Mascota</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigateTo('historias')}>
            <Text style={styles.actionIcon}>🩺</Text>
            <Text style={styles.actionText}>Nueva Historia</Text>
          </TouchableOpacity>

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
        animationType="slide"
        onRequestClose={() => setShowMenu(false)}
      >
        <View style={styles.drawerContainer}>
          <TouchableOpacity
            style={styles.drawerOverlay}
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
          />
          <View style={styles.drawerMenu}>
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
              
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('mascotas')}>
                <Text style={styles.menuItemIcon}>🐾</Text>
                <Text style={styles.menuItemText}>Mascotas</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('citas')}>
                <Text style={styles.menuItemIcon}>📅</Text>
                <Text style={styles.menuItemText}>Citas</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('historias')}>
                <Text style={styles.menuItemIcon}>📋</Text>
                <Text style={styles.menuItemText}>Historias Clínicas</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('usuarios')}>
                <Text style={styles.menuItemIcon}>👥</Text>
                <Text style={styles.menuItemText}>Usuarios</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutIcon}>🚪</Text>
              <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
    width: 280,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
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
