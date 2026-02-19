import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Plus, Users, LogOut, Video, Menu, X } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Agenda', icon: Calendar, end: true },
  { to: '/citas/nueva', label: 'Nueva Cita', icon: Plus },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const allNav = isAdmin
    ? [...navItems, { to: '/usuarios', label: 'Usuarios', icon: Users }]
    : navItems;

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
    : '';

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', backgroundColor: 'rgba(15,23,42,0.4)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(180deg, #0F766E 0%, #0D5F58 100%)',
          transitionDuration: 'var(--duration-fast)',
          transitionTimingFunction: 'var(--ease-out)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
            <Video className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Teleconsulta
          </span>
          <button
            className="ml-auto lg:hidden text-white/70 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {allNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'text-white'
                    : 'text-white/70 hover:text-white'
                }`
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : undefined,
                transitionDuration: 'var(--duration-fast)',
              })}
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator bar */}
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all"
                    style={{
                      height: isActive ? '60%' : '0%',
                      backgroundColor: 'var(--color-primary-light)',
                      transitionDuration: 'var(--duration-fast)',
                      transitionTimingFunction: 'var(--ease-out)',
                    }}
                  />
                  <Icon className="h-5 w-5" />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="flex items-center gap-3 px-4 py-2 mb-1">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: 'var(--color-primary-light)' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-white/50">
                {user?.role === 'ADMIN' ? 'Administrador' : 'Profesional'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-white/70 hover:text-white transition-all"
            style={{
              transitionDuration: 'var(--duration-fast)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className="px-6 py-4 flex items-center"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <button
            className="lg:hidden mr-4"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" style={{ color: 'var(--color-text-secondary)' }} />
          </button>
          <div className="flex-1">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {user?.role === 'ADMIN' ? 'Administrador' : 'Profesional'}
            </p>
          </div>
          <div
            className="flex items-center justify-center w-9 h-9 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {initials}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: 'var(--color-bg)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
