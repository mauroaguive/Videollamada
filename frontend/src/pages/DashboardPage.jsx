import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AppointmentList from '../components/AppointmentList';
import toast from 'react-hot-toast';
import { CalendarDays, CheckCircle2, XCircle, Clock, Plus, Filter } from 'lucide-react';

export default function DashboardPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', status: '' });
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      if (filters.status) params.status = filters.status;

      const { data } = await api.get('/appointments', { params });
      setAppointments(data.data || []);
    } catch (err) {
      toast.error('Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchAppointments();
  };

  const stats = {
    total: appointments.length,
    programadas: appointments.filter((a) => a.status === 'PROGRAMADA').length,
    finalizadas: appointments.filter((a) => a.status === 'FINALIZADA').length,
    canceladas: appointments.filter((a) => a.status === 'CANCELADA').length,
  };

  const statCards = [
    {
      label: 'Total citas',
      value: stats.total,
      icon: CalendarDays,
      iconBg: 'var(--color-primary-50)',
      iconColor: 'var(--color-primary)',
    },
    {
      label: 'Programadas',
      value: stats.programadas,
      icon: Clock,
      iconBg: '#F0FDFA',
      iconColor: 'var(--color-primary-light)',
    },
    {
      label: 'Finalizadas',
      value: stats.finalizadas,
      icon: CheckCircle2,
      iconBg: '#ECFDF5',
      iconColor: 'var(--color-success)',
    },
    {
      label: 'Canceladas',
      value: stats.canceladas,
      icon: XCircle,
      iconBg: '#FFF1F2',
      iconColor: 'var(--color-error)',
    },
  ];

  const inputStyle = {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-input)',
    color: 'var(--color-text)',
    backgroundColor: 'var(--color-surface)',
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
          Agenda de Citas
        </h1>
        <button
          onClick={() => navigate('/citas/nueva')}
          className="flex items-center gap-2 px-5 py-2.5 text-white font-medium text-sm transition-all"
          style={{
            backgroundColor: 'var(--color-accent)',
            borderRadius: 'var(--radius-button)',
            transitionDuration: 'var(--duration-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-accent-dark)';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-accent)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Plus className="h-4 w-4" /> Nueva Cita
        </button>
      </div>

      {/* Filters */}
      <form
        onSubmit={handleFilter}
        className="flex flex-wrap gap-3 items-end mb-6 p-4 animate-fade-in-up stagger-1"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-2 mr-2">
          <Filter className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Filtros</span>
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Desde</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="px-3 py-2 text-sm"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Hasta</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="px-3 py-2 text-sm"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Estado</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 text-sm"
            style={inputStyle}
          >
            <option value="">Todas</option>
            <option value="PROGRAMADA">Programada</option>
            <option value="EN_SALA">En Sala</option>
            <option value="FINALIZADA">Finalizada</option>
            <option value="CANCELADA">Cancelada</option>
            <option value="NO_ASISTE">No Asiste</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2 text-white text-sm font-medium transition-all"
          style={{
            backgroundColor: 'var(--color-primary)',
            borderRadius: 'var(--radius-button)',
            transitionDuration: 'var(--duration-fast)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
        >
          Filtrar
        </button>
      </form>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`p-4 animate-fade-in-up stagger-${idx + 2}`}
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-xl"
                  style={{ backgroundColor: card.iconBg }}
                >
                  <Icon className="h-5 w-5" style={{ color: card.iconColor }} />
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
                    {card.value}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{card.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Appointment list */}
      <div
        className="animate-fade-in-up stagger-6"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
        }}
      >
        <AppointmentList
          appointments={appointments}
          loading={loading}
          onRowClick={(id) => navigate(`/citas/${id}`)}
        />
      </div>
    </div>
  );
}
