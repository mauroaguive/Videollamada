import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { ArrowLeft, Video, XCircle, Clock, Send, RefreshCw, User, Phone, Mail, FileText, Calendar, Copy, Link } from 'lucide-react';

dayjs.extend(utc);
dayjs.extend(timezone);

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAppointment = async () => {
    try {
      const { data } = await api.get(`/appointments/${id}`);
      setAppointment(data);
    } catch (err) {
      toast.error('Error al cargar la cita');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointment(); }, [id]);

  const handleAction = async (action, confirmMsg) => {
    if (!window.confirm(confirmMsg)) return;
    try {
      if (action === 'cancel') await api.patch(`/appointments/${id}/cancel`);
      else if (action === 'no-show') await api.patch(`/appointments/${id}/no-show`);
      else if (action === 'finish') await api.patch(`/appointments/${id}/finish`);
      else if (action === 'resend') await api.post(`/appointments/${id}/resend-link`);
      else if (action === 'revoke') await api.post(`/appointments/${id}/revoke-token`);
      toast.success('Accion realizada correctamente');
      fetchAppointment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al realizar la accion');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div
          className="h-10 w-10 rounded-full border-2 animate-spin"
          style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }}
        />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
        Cita no encontrada
      </div>
    );
  }

  const a = appointment;
  const dateFormatted = dayjs(a.scheduled_at).tz('America/Bogota').format('DD/MM/YYYY HH:mm');
  const initials = a.patient_name
    ? a.patient_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-sm font-medium mb-6 transition-colors"
        style={{ color: 'var(--color-text-muted)', transitionDuration: 'var(--duration-fast)' }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
      >
        <ArrowLeft className="h-4 w-4" /> Volver a la agenda
      </button>

      {/* Header */}
      <div
        className="flex items-center justify-between mb-6 p-5 animate-fade-in-up"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-border)',
        }}
      >
        <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
          Cita #{a.id}
        </h1>
        <StatusBadge status={a.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Patient info card */}
        <div
          className="p-6 animate-fade-in-up stagger-1"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center gap-4 mb-5">
            <div
              className="flex items-center justify-center w-14 h-14 rounded-full text-lg font-bold text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {initials}
            </div>
            <div>
              <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                {a.patient_name}
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Paciente</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <FileText className="h-4 w-4 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
              <span style={{ color: 'var(--color-text-secondary)' }}>Documento:</span>
              <span className="font-medium" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                {a.patient_document_type} {a.patient_document}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
              <span style={{ color: 'var(--color-text-secondary)' }}>Telefono:</span>
              <span className="font-medium" style={{ color: 'var(--color-text)' }}>{a.patient_phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
              <span style={{ color: 'var(--color-text-secondary)' }}>Email:</span>
              <span className="font-medium" style={{ color: 'var(--color-text)' }}>{a.patient_email}</span>
            </div>
          </div>
        </div>

        {/* Appointment info card */}
        <div
          className="p-6 animate-fade-in-up stagger-2"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
            <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
              Informacion de la Cita
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <User className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'var(--color-text-muted)' }} />
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>Profesional</span>
                <p className="font-medium" style={{ color: 'var(--color-text)' }}>{a.professional_first_name} {a.professional_last_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Clock className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'var(--color-text-muted)' }} />
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>Fecha y Hora</span>
                <p className="font-medium" style={{ color: 'var(--color-text)' }}>{dateFormatted}</p>
              </div>
            </div>
            <div className="text-sm">
              <span style={{ color: 'var(--color-text-secondary)' }}>Duracion: </span>
              <span className="font-medium" style={{ color: 'var(--color-text)' }}>{a.duration_minutes} minutos</span>
            </div>
            <div className="text-sm">
              <span style={{ color: 'var(--color-text-secondary)' }}>Tipo: </span>
              <span className="font-medium" style={{ color: 'var(--color-text)' }}>{a.consultation_type}</span>
            </div>
            {a.notes && (
              <div className="text-sm">
                <span style={{ color: 'var(--color-text-secondary)' }}>Notas: </span>
                <span style={{ color: 'var(--color-text)' }}>{a.notes}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Patient link */}
      {a.patient_link && (a.status === 'PROGRAMADA' || a.status === 'EN_SALA') && (
        <div
          className="p-5 mb-6 animate-fade-in-up stagger-3"
          style={{
            backgroundColor: 'var(--color-primary-50)',
            borderRadius: 'var(--radius-card)',
            borderLeft: '4px solid var(--color-primary)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Link className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-primary-dark)' }}>
              Enlace del Paciente
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={a.patient_link}
              className="flex-1 px-3 py-2 text-sm select-all outline-none"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-input)',
                color: 'var(--color-text-secondary)',
              }}
              onClick={(e) => e.target.select()}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(a.patient_link);
                toast.success('Enlace copiado al portapapeles');
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-medium transition-all shrink-0"
              style={{
                backgroundColor: 'var(--color-primary)',
                borderRadius: 'var(--radius-button)',
                transitionDuration: 'var(--duration-fast)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
            >
              <Copy className="h-4 w-4" /> Copiar
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--color-primary)' }}>
            Comparta este enlace con el paciente para que pueda ingresar a la teleconsulta.
          </p>
        </div>
      )}

      {/* Actions */}
      <div
        className="p-5 animate-fade-in-up stagger-4"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="flex flex-wrap gap-3">
          {(a.status === 'PROGRAMADA' || a.status === 'EN_SALA') && (
            <button
              onClick={() => navigate(`/sala/${a.id}`)}
              className="flex items-center gap-2 px-5 py-2.5 text-white font-medium text-sm transition-all"
              style={{
                backgroundColor: 'var(--color-success)',
                borderRadius: 'var(--radius-button)',
                transitionDuration: 'var(--duration-fast)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <Video className="h-4 w-4" /> Entrar a Sala
            </button>
          )}

          {a.status === 'PROGRAMADA' && (
            <>
              <button
                onClick={() => handleAction('resend', 'Reenviar enlace al paciente?')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all"
                style={{
                  border: '1px solid var(--color-primary)',
                  color: 'var(--color-primary)',
                  borderRadius: 'var(--radius-button)',
                  transitionDuration: 'var(--duration-fast)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary-50)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <Send className="h-4 w-4" /> Reenviar Link
              </button>
              <button
                onClick={() => handleAction('revoke', 'Revocar token y enviar nuevo enlace?')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all"
                style={{
                  border: '1px solid var(--color-warning)',
                  color: 'var(--color-warning)',
                  borderRadius: 'var(--radius-button)',
                  transitionDuration: 'var(--duration-fast)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FFFBEB'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <RefreshCw className="h-4 w-4" /> Revocar y Reenviar
              </button>

              <div className="w-px mx-1" style={{ backgroundColor: 'var(--color-border)' }} />

              <button
                onClick={() => handleAction('no-show', 'Marcar como no asistio?')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all"
                style={{
                  backgroundColor: 'var(--color-warning)',
                  color: 'white',
                  borderRadius: 'var(--radius-button)',
                  transitionDuration: 'var(--duration-fast)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <Clock className="h-4 w-4" /> No Asistio
              </button>
              <button
                onClick={() => handleAction('cancel', 'Cancelar esta cita?')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all"
                style={{
                  backgroundColor: 'var(--color-error)',
                  color: 'white',
                  borderRadius: 'var(--radius-button)',
                  transitionDuration: 'var(--duration-fast)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <XCircle className="h-4 w-4" /> Cancelar
              </button>
            </>
          )}

          {a.status === 'EN_SALA' && (
            <button
              onClick={() => handleAction('finish', 'Finalizar esta consulta?')}
              className="flex items-center gap-2 px-5 py-2.5 text-white font-medium text-sm transition-all"
              style={{
                backgroundColor: 'var(--color-primary)',
                borderRadius: 'var(--radius-button)',
                transitionDuration: 'var(--duration-fast)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
            >
              Finalizar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
