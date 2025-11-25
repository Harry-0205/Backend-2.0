import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import UserManagement from '../components/UserManagement';
import VeterinariaManagement from '../components/VeterinariaManagement';
import MascotaManagement from '../components/MascotaManagement';
import CitaManagement from '../components/CitaManagement';
import HistoriaClinicaManagement from '../components/HistoriaClinicaManagement';
import ReporteManagement from '../components/ReporteManagement';
import DashboardHome from '../components/DashboardHome';
import authService from '../services/authService';
import { 
  FaHome, 
  FaUsers, 
  FaDog, 
  FaCalendarAlt, 
  FaFileMedicalAlt, 
  FaHospital, 
  FaChartLine,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import '../styles/Dashboard.css';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Definir menú según roles
  const menuItems: MenuItem[] = [
    {
      id: 'home',
      label: 'Inicio',
      icon: <FaHome />,
      path: '/dashboard',
      roles: ['ROLE_ADMIN', 'ROLE_VETERINARIO', 'ROLE_RECEPCIONISTA', 'ROLE_CLIENTE']
    },
    {
      id: 'usuarios',
      label: 'Gestión de Usuarios',
      icon: <FaUsers />,
      path: '/dashboard/usuarios',
      roles: ['ROLE_ADMIN', 'ROLE_RECEPCIONISTA']
    },
    {
      id: 'veterinarias',
      label: 'Gestión de Veterinarias',
      icon: <FaHospital />,
      path: '/dashboard/veterinarias',
      roles: ['ROLE_ADMIN']
    },
    {
      id: 'mascotas',
      label: authService.isCliente() ? 'Mis Mascotas' : 'Gestión de Mascotas',
      icon: <FaDog />,
      path: '/dashboard/mascotas',
      roles: ['ROLE_ADMIN', 'ROLE_VETERINARIO', 'ROLE_RECEPCIONISTA', 'ROLE_CLIENTE']
    },
    {
      id: 'citas',
      label: authService.isCliente() ? 'Mis Citas' : 'Gestión de Citas',
      icon: <FaCalendarAlt />,
      path: '/dashboard/citas',
      roles: ['ROLE_ADMIN', 'ROLE_VETERINARIO', 'ROLE_RECEPCIONISTA', 'ROLE_CLIENTE']
    },
    {
      id: 'historias',
      label: 'Historias Clínicas',
      icon: <FaFileMedicalAlt />,
      path: '/dashboard/historias',
      roles: ['ROLE_ADMIN', 'ROLE_VETERINARIO', 'ROLE_RECEPCIONISTA', 'ROLE_CLIENTE']
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: <FaChartLine />,
      path: '/dashboard/reportes',
      roles: ['ROLE_ADMIN']
    }
  ];

  // Filtrar menú según roles del usuario
  const currentUser = authService.getCurrentUser();
  const userRoles = currentUser?.roles || [];
  
  const filteredMenu = menuItems.filter(item => 
    item.roles.some(role => userRoles.includes(role))
  );

  const handleMenuClick = (path: string) => {
    navigate(path);
    // En móviles, cerrar el sidebar después de navegar
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    return location.pathname === path;
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <FaHospital className="logo-icon" />
            {sidebarOpen && <span className="logo-text">VetSystem</span>}
          </div>
        </div>

        <nav className="sidebar-nav">
          {filteredMenu.map(item => (
            <button
              key={item.id}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.path)}
              title={!sidebarOpen ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="toggle-btn" onClick={toggleSidebar}>
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Mobile Header */}
        <div className="mobile-header">
          <button className="mobile-menu-btn" onClick={toggleSidebar}>
            <FaBars />
          </button>
          <h1 className="mobile-title">Dashboard</h1>
        </div>

        {/* Content Area */}
        <div className="dashboard-content">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/usuarios" element={<UserManagement />} />
            <Route path="/veterinarias" element={<VeterinariaManagement />} />
            <Route path="/mascotas" element={<MascotaManagement />} />
            <Route path="/citas" element={<CitaManagement />} />
            <Route path="/historias" element={<HistoriaClinicaManagement />} />
            <Route path="/reportes" element={<ReporteManagement />} />
          </Routes>
        </div>
      </main>

      {/* Overlay para móviles */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;