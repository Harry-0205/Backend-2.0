import React, { useEffect, useState } from 'react';
import authService from '../services/authService';
import dashboardService, { DashboardStats } from '../services/dashboardService';
import './Dashboard.css';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalMascotas: 0,
    totalCitas: 0,
    citasPendientes: 0,
    totalHistorias: 0
  });
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  
  const currentUser = authService.getCurrentUser();
  const greeting = getGreeting();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  }

  const handleLogout = () => {
    authService.logout();
    onLogout();
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>{greeting}, {currentUser?.nombres}!</h1>
            <p className="user-role">
              {authService.isAdmin() ? 'Administrador' : 
               authService.isVeterinario() ? 'Veterinario' : 
               authService.isRecepcionista() ? 'Recepcionista' : 'Usuario'}
            </p>
          </div>
          <button 
            className="menu-button"
            onClick={() => setShowMenu(!showMenu)}
          >
            ☰
          </button>
        </div>
      </header>

      {/* Menu lateral */}
      {showMenu && (
        <>
          <div className="menu-overlay" onClick={() => setShowMenu(false)} />
          <div className="side-menu">
            <div className="menu-header">
              <div className="user-avatar">
                {currentUser?.nombres?.charAt(0)}{currentUser?.apellidos?.charAt(0)}
              </div>
              <h3>{currentUser?.nombres} {currentUser?.apellidos}</h3>
              <p>{currentUser?.email}</p>
            </div>
            
            <nav className="menu-nav">
              <button className="menu-item active">
                <span>📊</span>
                Dashboard
              </button>
              <button className="menu-item">
                <span>🐾</span>
                Mascotas
              </button>
              <button className="menu-item">
                <span>📅</span>
                Citas
              </button>
              <button className="menu-item">
                <span>📋</span>
                Historias Clínicas
              </button>
            </nav>

            <button className="logout-button" onClick={handleLogout}>
              <span>🚪</span>
              Cerrar Sesión
            </button>
          </div>
        </>
      )}

      {/* Stats Cards */}
      <main className="dashboard-main">
        <div className="stats-grid">
          <div className="stat-card green">
            <div className="stat-icon">🐾</div>
            <div className="stat-content">
              <h3>Mis Mascotas</h3>
              {loading ? (
                <div className="stat-skeleton"></div>
              ) : (
                <p className="stat-value">{stats.totalMascotas}</p>
              )}
            </div>
          </div>

          <div className="stat-card orange">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>Total de Citas</h3>
              {loading ? (
                <div className="stat-skeleton"></div>
              ) : (
                <p className="stat-value">{stats.totalCitas}</p>
              )}
            </div>
          </div>

          <div className="stat-card red">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3>Citas Pendientes</h3>
              {loading ? (
                <div className="stat-skeleton"></div>
              ) : (
                <p className="stat-value">{stats.citasPendientes}</p>
              )}
            </div>
          </div>

          <div className="stat-card purple">
            <div className="stat-icon">📄</div>
            <div className="stat-content">
              <h3>Historias Clínicas</h3>
              {loading ? (
                <div className="stat-skeleton"></div>
              ) : (
                <p className="stat-value">{stats.totalHistorias}</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Acciones Rápidas</h2>
          <div className="actions-grid">
            <button className="action-button">
              <span>➕</span>
              <p>Nueva Cita</p>
            </button>
            <button className="action-button">
              <span>📝</span>
              <p>Nueva Historia</p>
            </button>
            <button className="action-button">
              <span>🔍</span>
              <p>Buscar</p>
            </button>
            <button className="action-button" onClick={loadStats}>
              <span>🔄</span>
              <p>Actualizar</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
