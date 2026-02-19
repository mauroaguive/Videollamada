import { Link } from 'react-router-dom';
import { Home, Video } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="text-center animate-fade-in-up">
        {/* Animated 404 with gradient text */}
        <div className="relative mb-8">
          <h1
            className="text-[10rem] font-bold leading-none select-none"
            style={{
              fontFamily: 'var(--font-display)',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            404
          </h1>

          {/* Decorative animated elements */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full opacity-20"
            style={{
              border: '3px dashed var(--color-primary)',
              animation: 'spin-slow 12s linear infinite',
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full opacity-10"
            style={{
              border: '2px dashed var(--color-accent)',
              animation: 'spin-slow 20s linear infinite reverse',
            }}
          />

          {/* Signal lost animation */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ animation: 'float 3s ease-in-out infinite' }}
          >
            <Video className="h-12 w-12" style={{ color: 'var(--color-primary)', opacity: 0.3, animation: 'signal-lost 3s ease-in-out infinite' }} />
          </div>
        </div>

        <h2
          className="text-2xl font-bold mb-3 animate-fade-in-up stagger-1"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
        >
          Pagina no encontrada
        </h2>
        <p
          className="mb-8 max-w-md mx-auto animate-fade-in-up stagger-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          La pagina que busca no existe o fue movida. Verifique la URL o regrese al inicio.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 text-white font-medium transition-all animate-fade-in-up stagger-3"
          style={{
            backgroundColor: 'var(--color-primary)',
            borderRadius: 'var(--radius-button)',
            transitionDuration: 'var(--duration-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Home className="h-4 w-4" /> Volver al inicio
        </Link>
      </div>
    </div>
  );
}
