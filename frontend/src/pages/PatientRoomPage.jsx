import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { createSocket } from '../services/socket';
import useWebRTC from '../hooks/useWebRTC';
import VideoPlayer from '../components/VideoPlayer';
import VideoControls from '../components/VideoControls';
import toast from 'react-hot-toast';
import { Video, AlertCircle, Shield, Wifi, Monitor } from 'lucide-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export default function PatientRoomPage() {
  const { token } = useParams();
  const [state, setState] = useState('validating');
  const [appointment, setAppointment] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const socketRef = useRef(null);

  const { remoteStream, connectionState, endCall } = useWebRTC({
    socket,
    roomId: appointment?.appointment_id?.toString(),
    localStream,
  });

  useEffect(() => {
    api.get(`/room/validate/${token}`)
      .then(({ data }) => {
        setAppointment(data);
        setState('waiting');
      })
      .catch((err) => {
        setErrorMsg(err.response?.data?.message || 'El enlace de la cita no es valido o ha expirado.');
        setState('error');
      });
  }, [token]);

  const handleJoin = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Su navegador no permite acceder a camara/microfono. Acceda desde localhost o HTTPS.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);

      const { data } = await api.post(`/room/join/${token}`);
      setAppointment(data);

      const s = createSocket({ patientToken: token });
      socketRef.current = s;
      setSocket(s);

      s.on('connect', () => {
        s.emit('room:join', { roomId: data.appointment_id.toString(), role: 'patient' });
      });

      s.on('room:participant-joined', ({ role }) => {
        if (role === 'professional') {
          // Professional joined - they will send the offer
        }
      });

      s.on('room:participant-left', ({ role }) => {
        if (role === 'professional') {
          toast('El profesional ha salido de la sala');
        }
      });

      s.on('call:ended', () => {
        endCall();
        stream.getTracks().forEach((t) => t.stop());
        setState('ended');
      });

      s.on('room:error', ({ message }) => {
        toast.error(message);
      });

      setState('in-call');
    } catch (err) {
      console.error('Patient join error:', err);
      if (err.name === 'NotAllowedError') {
        toast.error('Permita el acceso a camara y microfono en su navegador.');
      } else if (err.name === 'NotFoundError' || err.name === 'NotReadableError') {
        toast.error('No se encontro camara o microfono disponible. Verifique que no esten en uso por otra aplicacion.');
      } else if (err.name === 'TypeError' && !navigator.mediaDevices) {
        toast.error('Su navegador no soporta videollamadas. Asegurese de acceder por HTTPS o localhost.');
      } else {
        toast.error(err.response?.data?.message || err.message || 'Error al ingresar a la sala');
      }
    }
  };

  useEffect(() => {
    return () => {
      if (localStream) localStream.getTracks().forEach((t) => t.stop());
      if (socketRef.current) {
        socketRef.current.emit('room:leave', { roomId: appointment?.appointment_id?.toString() });
        socketRef.current.disconnect();
      }
    };
  }, []);

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
      }
    }
  };

  // Error state
  if (state === 'error') {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <div
          className="max-w-md text-center animate-fade-in-up"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-modal)',
            boxShadow: 'var(--shadow-lg)',
            padding: '2.5rem',
          }}
        >
          <div
            className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-5"
            style={{ backgroundColor: '#FFF1F2' }}
          >
            <AlertCircle className="h-8 w-8" style={{ color: 'var(--color-error)' }} />
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
            Enlace no valido
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>{errorMsg}</p>
          <p className="text-sm mt-4" style={{ color: 'var(--color-text-muted)' }}>
            Si cree que esto es un error, contacte a la IPS para que le reenvien el enlace.
          </p>
        </div>
      </div>
    );
  }

  // Validating state
  if (state === 'validating') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl" style={{ backgroundColor: 'var(--color-primary-50)' }}>
            <Video className="h-8 w-8" style={{ color: 'var(--color-primary)', animation: 'float 2s ease-in-out infinite' }} />
          </div>
          <div
            className="h-8 w-8 rounded-full border-2 animate-spin"
            style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }}
          />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Validando enlace...</p>
        </div>
      </div>
    );
  }

  // Ended state
  if (state === 'ended') {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <div
          className="max-w-md text-center animate-fade-in-up"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-modal)',
            boxShadow: 'var(--shadow-lg)',
            padding: '2.5rem',
          }}
        >
          <div
            className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-5"
            style={{ backgroundColor: 'var(--color-primary-50)' }}
          >
            <Video className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
            Consulta finalizada
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            La teleconsulta ha finalizado. Puede cerrar esta ventana.
          </p>
          <button
            onClick={() => window.close()}
            className="mt-6 px-6 py-2.5 text-white font-medium text-sm transition-all"
            style={{
              backgroundColor: 'var(--color-primary)',
              borderRadius: 'var(--radius-button)',
              transitionDuration: 'var(--duration-fast)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // Waiting state
  if (state === 'waiting') {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-50) 0%, #E0F7FA 50%, #F0FDFA 100%)',
        }}
      >
        <div
          className="max-w-md w-full animate-fade-in-up"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-modal)',
            boxShadow: 'var(--shadow-lg)',
            padding: '2rem',
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
              <Video className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
              Teleconsulta IPS
            </h1>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm">
              <span style={{ color: 'var(--color-text-muted)' }}>Profesional:</span>
              <span className="font-medium" style={{ color: 'var(--color-text)' }}>{appointment.professional_name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span style={{ color: 'var(--color-text-muted)' }}>Fecha:</span>
              <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                {dayjs(appointment.scheduled_at).tz('America/Bogota').format('DD/MM/YYYY HH:mm')}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span style={{ color: 'var(--color-text-muted)' }}>Tipo:</span>
              <span className="font-medium" style={{ color: 'var(--color-text)' }}>{appointment.consultation_type}</span>
            </div>
          </div>

          <div
            className="p-4 mb-6"
            style={{
              backgroundColor: 'var(--color-primary-50)',
              borderRadius: 'var(--radius-card)',
              borderLeft: '3px solid var(--color-primary)',
            }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>Antes de ingresar:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-primary-dark)' }}>
                <Wifi className="h-3.5 w-3.5 shrink-0" />
                <span>Asegurese de tener buena conexion a internet</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-primary-dark)' }}>
                <Monitor className="h-3.5 w-3.5 shrink-0" />
                <span>Permita el acceso a camara y microfono</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-primary-dark)' }}>
                <Shield className="h-3.5 w-3.5 shrink-0" />
                <span>Busque un lugar tranquilo y bien iluminado</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleJoin}
            className="w-full py-3 text-white font-medium transition-all"
            style={{
              backgroundColor: 'var(--color-success)',
              borderRadius: 'var(--radius-button)',
              transitionDuration: 'var(--duration-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.opacity = '1';
            }}
          >
            Ingresar a la Sala
          </button>
        </div>
      </div>
    );
  }

  // In-call state
  const statusDotStyle = connectionState === 'connected'
    ? { backgroundColor: '#10B981', animation: 'glow 2s ease-in-out infinite' }
    : connectionState === 'connecting'
    ? { backgroundColor: 'var(--color-warning)' }
    : { backgroundColor: '#64748B' };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--color-dark-bg)' }}>
      <div
        className="px-6 py-3 flex items-center justify-between glass-dark"
        style={{ borderBottom: '1px solid var(--color-dark-border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: 'rgba(13,148,136,0.2)' }}>
            <Video className="h-4 w-4" style={{ color: 'var(--color-primary-light)' }} />
          </div>
          <span className="text-white font-semibold text-sm" style={{ fontFamily: 'var(--font-display)' }}>Teleconsulta</span>
        </div>
        <div className="text-sm">
          <span style={{ color: 'var(--color-text-muted)' }}>Profesional: </span>
          <span className="text-white font-medium">{appointment?.professional_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={statusDotStyle} />
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {connectionState === 'connected' ? 'Conectado' : 'Conectando...'}
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative">
        <div className="flex-1 max-w-4xl">
          <VideoPlayer
            stream={remoteStream}
            label={`Profesional: ${appointment?.professional_name || ''}`}
          />
        </div>
        <div
          className="absolute bottom-20 right-8 w-48"
          style={{
            borderRadius: 'var(--radius-card)',
            boxShadow: connectionState === 'connected' ? '0 0 12px rgba(13,148,136,0.3)' : 'none',
          }}
        >
          <VideoPlayer stream={localStream} muted={true} label="Usted" />
        </div>
      </div>

      <div className="glass-dark" style={{ borderTop: '1px solid var(--color-dark-border)' }}>
        <VideoControls
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          onToggleMute={toggleMute}
          onToggleCamera={toggleCamera}
          isEndCallEnabled={false}
        />
      </div>
    </div>
  );
}
