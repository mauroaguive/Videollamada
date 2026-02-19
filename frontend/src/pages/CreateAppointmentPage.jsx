import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AppointmentForm from '../components/AppointmentForm';
import toast from 'react-hot-toast';
import { ArrowLeft, CalendarPlus } from 'lucide-react';

export default function CreateAppointmentPage() {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/users')
      .then(({ data }) => {
        setProfessionals(data.filter((u) => u.role === 'PROFESIONAL'));
      })
      .catch(() => toast.error('Error al cargar profesionales'));
  }, []);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await api.post('/appointments', formData);
      toast.success('Cita creada exitosamente');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear la cita');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-sm font-medium mb-4 transition-colors"
        style={{ color: 'var(--color-text-muted)', transitionDuration: 'var(--duration-fast)' }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
      >
        <ArrowLeft className="h-4 w-4" /> Volver a la agenda
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl"
          style={{ backgroundColor: 'var(--color-primary-50)' }}
        >
          <CalendarPlus className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
            Nueva Cita
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Complete los datos para programar una teleconsulta
          </p>
        </div>
      </div>

      <AppointmentForm
        professionals={professionals}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}
