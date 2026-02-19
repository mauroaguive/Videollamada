import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import StatusBadge from './StatusBadge';
import { Eye, Calendar } from 'lucide-react';

dayjs.extend(utc);
dayjs.extend(timezone);

export default function AppointmentList({ appointments, loading, onRowClick }) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div
          className="h-10 w-10 rounded-full border-2 animate-spin"
          style={{
            borderColor: 'var(--color-border)',
            borderTopColor: 'var(--color-primary)',
          }}
        />
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div
          className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: 'var(--color-primary-50)' }}
        >
          <Calendar className="h-7 w-7" style={{ color: 'var(--color-primary)' }} />
        </div>
        <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          No hay citas programadas
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Las citas apareceran aqui cuando sean creadas
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface-hover)' }}>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Fecha/Hora</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Paciente</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Documento</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Profesional</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt, idx) => (
              <tr
                key={appt.id}
                className={`cursor-pointer animate-fade-in-up stagger-${Math.min(idx + 1, 6)}`}
                style={{
                  borderBottom: '1px solid var(--color-border)',
                  transitionDuration: 'var(--duration-fast)',
                }}
                onClick={() => onRowClick(appt.id)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {dayjs(appt.scheduled_at).tz('America/Bogota').format('DD/MM/YYYY HH:mm')}
                </td>
                <td className="px-4 py-3.5 text-sm font-medium" style={{ color: 'var(--color-text)' }}>{appt.patient_name}</td>
                <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                  {appt.patient_document_type} {appt.patient_document}
                </td>
                <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{appt.consultation_type}</td>
                <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {appt.professional_first_name} {appt.professional_last_name}
                </td>
                <td className="px-4 py-3.5"><StatusBadge status={appt.status} /></td>
                <td className="px-4 py-3.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); onRowClick(appt.id); }}
                    className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                    style={{ color: 'var(--color-primary)', transitionDuration: 'var(--duration-fast)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-dark)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                  >
                    <Eye className="h-4 w-4" /> Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3 p-3">
        {appointments.map((appt, idx) => (
          <div
            key={appt.id}
            onClick={() => onRowClick(appt.id)}
            className={`cursor-pointer transition-all animate-fade-in-up stagger-${Math.min(idx + 1, 6)}`}
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-card)',
              padding: '1rem',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--color-border)',
              transitionDuration: 'var(--duration-fast)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{appt.patient_name}</span>
              <StatusBadge status={appt.status} />
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {dayjs(appt.scheduled_at).tz('America/Bogota').format('DD/MM/YYYY HH:mm')}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Dr. {appt.professional_first_name} {appt.professional_last_name}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{appt.consultation_type}</p>
          </div>
        ))}
      </div>
    </>
  );
}
