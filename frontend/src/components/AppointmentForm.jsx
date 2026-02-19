import { useState, useEffect } from 'react';
import { User, FileText, Phone, Mail, Calendar, Clock, Stethoscope, StickyNote } from 'lucide-react';

const DOC_TYPES = [
  { value: 'CC', label: 'CC - Cedula de Ciudadania' },
  { value: 'CE', label: 'CE - Cedula de Extranjeria' },
  { value: 'TI', label: 'TI - Tarjeta de Identidad' },
  { value: 'PP', label: 'PP - Pasaporte' },
  { value: 'RC', label: 'RC - Registro Civil' },
];

const DURATIONS = [15, 30, 45, 60];

const initialFormState = {
  professional_id: '',
  patient_name: '',
  patient_document_type: 'CC',
  patient_document: '',
  patient_phone: '',
  patient_email: '',
  scheduled_at: '',
  duration_minutes: 30,
  consultation_type: 'General',
  notes: '',
};

const inputClass = `w-full px-3.5 py-2.5 text-sm transition-all border outline-none`;
const inputStyle = {
  borderColor: 'var(--color-border)',
  borderRadius: 'var(--radius-input)',
  color: 'var(--color-text)',
  transitionDuration: 'var(--duration-fast)',
  transitionTimingFunction: 'var(--ease-out)',
};
const inputFocusHandlers = {
  onFocus: (e) => {
    e.target.style.borderColor = 'var(--color-border-focus)';
    e.target.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.1)';
  },
  onBlur: (e) => {
    e.target.style.borderColor = 'var(--color-border)';
    e.target.style.boxShadow = 'none';
  },
};

export default function AppointmentForm({ initialData, professionals = [], onSubmit, loading }) {
  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    if (initialData) {
      setForm({ ...initialFormState, ...initialData });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-fade-in-up"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border)',
        padding: '1.5rem',
      }}
    >
      {/* Section: Professional */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Stethoscope className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
            Profesional y Consulta
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Profesional</label>
            <select
              name="professional_id"
              value={form.professional_id}
              onChange={handleChange}
              required
              className={inputClass}
              style={inputStyle}
              {...inputFocusHandlers}
            >
              <option value="">Seleccione un profesional</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} {p.specialty ? `- ${p.specialty}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Tipo de Consulta</label>
            <input
              name="consultation_type"
              value={form.consultation_type}
              onChange={handleChange}
              className={inputClass}
              style={inputStyle}
              {...inputFocusHandlers}
            />
          </div>
        </div>
      </div>

      {/* Section: Patient Info */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
            Informacion del Paciente
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Nombre del Paciente</label>
            <input
              name="patient_name"
              value={form.patient_name}
              onChange={handleChange}
              required
              className={inputClass}
              style={inputStyle}
              {...inputFocusHandlers}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Tipo de Documento</label>
            <select
              name="patient_document_type"
              value={form.patient_document_type}
              onChange={handleChange}
              required
              className={inputClass}
              style={inputStyle}
              {...inputFocusHandlers}
            >
              {DOC_TYPES.map((dt) => (
                <option key={dt.value} value={dt.value}>{dt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Numero de Documento</label>
            <input
              name="patient_document"
              value={form.patient_document}
              onChange={handleChange}
              required
              className={inputClass}
              style={inputStyle}
              {...inputFocusHandlers}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Telefono</label>
            <input
              name="patient_phone"
              type="tel"
              value={form.patient_phone}
              onChange={handleChange}
              required
              className={inputClass}
              style={inputStyle}
              {...inputFocusHandlers}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
            <input
              name="patient_email"
              type="email"
              value={form.patient_email}
              onChange={handleChange}
              required
              className={inputClass}
              style={inputStyle}
              {...inputFocusHandlers}
            />
          </div>
        </div>
      </div>

      {/* Section: Schedule */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
            Programacion
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Fecha y Hora</label>
            <input
              name="scheduled_at"
              type="datetime-local"
              value={form.scheduled_at}
              onChange={handleChange}
              required
              className={inputClass}
              style={inputStyle}
              {...inputFocusHandlers}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Duracion (minutos)</label>
            <select
              name="duration_minutes"
              value={form.duration_minutes}
              onChange={handleChange}
              className={inputClass}
              style={inputStyle}
              {...inputFocusHandlers}
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>{d} minutos</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section: Notes */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <StickyNote className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
            Notas Adicionales
          </h3>
        </div>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={3}
          className={inputClass}
          style={inputStyle}
          placeholder="Notas adicionales (opcional)"
          {...inputFocusHandlers}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2.5 text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        style={{
          backgroundColor: 'var(--color-primary)',
          borderRadius: 'var(--radius-button)',
          transitionDuration: 'var(--duration-fast)',
        }}
        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; }}
      >
        {loading ? 'Guardando...' : 'Guardar Cita'}
      </button>
    </form>
  );
}
