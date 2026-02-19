const statusConfig = {
  PROGRAMADA: {
    label: 'Programada',
    bg: 'var(--color-primary-50)',
    text: 'var(--color-primary-dark)',
    dot: 'var(--color-primary)',
    pulse: false,
  },
  EN_SALA: {
    label: 'En sala',
    bg: '#ECFDF5',
    text: '#065F46',
    dot: 'var(--color-success)',
    pulse: true,
  },
  FINALIZADA: {
    label: 'Finalizada',
    bg: '#F1F5F9',
    text: '#475569',
    dot: '#94A3B8',
    pulse: false,
  },
  CANCELADA: {
    label: 'Cancelada',
    bg: '#FFF1F2',
    text: '#9F1239',
    dot: 'var(--color-error)',
    pulse: false,
  },
  NO_ASISTE: {
    label: 'No asiste',
    bg: '#FFFBEB',
    text: '#92400E',
    dot: 'var(--color-warning)',
    pulse: false,
  },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || {
    label: status,
    bg: '#F1F5F9',
    text: '#475569',
    dot: '#94A3B8',
    pulse: false,
  };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: config.bg,
        color: config.text,
        fontFamily: 'var(--font-mono)',
      }}
    >
      <span
        className="relative flex h-2 w-2"
      >
        {config.pulse && (
          <span
            className="absolute inset-0 rounded-full"
            style={{
              backgroundColor: config.dot,
              animation: 'pulse-dot 2s ease-in-out infinite',
              opacity: 0.4,
            }}
          />
        )}
        <span
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ backgroundColor: config.dot }}
        />
      </span>
      {config.label}
    </span>
  );
}
