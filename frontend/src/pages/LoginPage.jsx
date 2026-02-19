import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Video, Shield, Wifi, Clock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel — Branding */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #14B8A6 100%)',
        }}
      >
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full" style={{ border: '2px solid white' }} />
          <div className="absolute top-40 left-40 w-48 h-48 rounded-full" style={{ border: '2px solid white' }} />
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full" style={{ border: '2px solid white' }} />
          <div className="absolute bottom-40 right-40 w-32 h-32 rounded-full" style={{ border: '2px solid white' }} />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full" style={{ backgroundColor: 'white' }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <Video className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Teleconsulta IPS
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Atencion medica<br />de calidad, sin<br />importar la distancia
          </h2>
          <p className="text-white/70 text-lg max-w-md">
            Conecte con sus pacientes de forma segura, rapida y profesional desde cualquier lugar.
          </p>

          <div className="flex gap-6 pt-4">
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Shield className="h-4 w-4" />
              <span>Seguro</span>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Wifi className="h-4 w-4" />
              <span>En tiempo real</span>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Clock className="h-4 w-4" />
              <span>24/7</span>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/40 text-sm">Teleconsulta IPS &copy; {new Date().getFullYear()}</p>
        </div>
      </div>

      {/* Right panel — Form */}
      <div
        className="flex items-center justify-center p-8"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
              <Video className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
              Teleconsulta IPS
            </span>
          </div>

          <div className="animate-fade-in-up">
            <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
              Bienvenido de vuelta
            </h1>
            <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>
              Ingrese sus credenciales para continuar
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="animate-fade-in-up stagger-1">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Correo electronico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-sm outline-none transition-all"
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-input)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    transitionDuration: 'var(--duration-fast)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-border-focus)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--color-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div className="animate-fade-in-up stagger-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Contrasena
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-sm outline-none transition-all"
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-input)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    transitionDuration: 'var(--duration-fast)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-border-focus)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--color-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="********"
                />
              </div>

              <div className="animate-fade-in-up stagger-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: 'var(--radius-button)',
                    transitionDuration: 'var(--duration-fast)',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {loading ? 'Ingresando...' : 'Iniciar Sesion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
