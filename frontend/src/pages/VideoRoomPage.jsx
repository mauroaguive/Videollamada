import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { createSocket } from '../services/socket';
import useWebRTC from '../hooks/useWebRTC';
import VideoPlayer from '../components/VideoPlayer';
import VideoControls from '../components/VideoControls';
import toast from 'react-hot-toast';
import { Video, Link, Copy, X } from 'lucide-react';

export default function VideoRoomPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [participantJoined, setParticipantJoined] = useState(false);
  const [showLinkPanel, setShowLinkPanel] = useState(false);
  const socketRef = useRef(null);

  const { remoteStream, connectionState, startCall, endCall } = useWebRTC({
    socket,
    roomId: appointmentId,
    localStream,
  });

  useEffect(() => {
    api.get(`/appointments/${appointmentId}`)
      .then(({ data }) => setAppointment(data))
      .catch(() => {
        toast.error('Error al cargar la cita');
        navigate('/');
      });
  }, [appointmentId, navigate]);

  useEffect(() => {
    let stream = null;

    const init = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);

        await api.post(`/room/professional/join/${appointmentId}`);

        const s = createSocket({ token: localStorage.getItem('accessToken') });
        socketRef.current = s;
        setSocket(s);

        s.on('connect', () => {
          s.emit('room:join', { roomId: appointmentId, role: 'professional' });
        });

        s.on('room:participant-joined', ({ role }) => {
          if (role === 'patient') {
            setParticipantJoined(true);
            setTimeout(() => startCall(), 500);
          }
        });

        s.on('room:participant-left', ({ role }) => {
          if (role === 'patient') {
            setParticipantJoined(false);
          }
        });

        s.on('room:error', ({ message }) => {
          toast.error(message);
        });
      } catch (err) {
        toast.error('Error al acceder a camara/microfono. Verifique los permisos.');
        console.error(err);
      }
    };

    init();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (socketRef.current) {
        socketRef.current.emit('room:leave', { roomId: appointmentId });
        socketRef.current.disconnect();
      }
    };
  }, [appointmentId]);

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

  const handleEndCall = () => {
    if (socket) {
      socket.emit('call:end', { roomId: appointmentId });
    }
    endCall();
    if (localStream) localStream.getTracks().forEach((t) => t.stop());
    navigate(`/citas/${appointmentId}`);
  };

  const statusDotStyle = connectionState === 'connected'
    ? { backgroundColor: '#10B981', animation: 'glow 2s ease-in-out infinite' }
    : connectionState === 'connecting'
    ? { backgroundColor: 'var(--color-warning)' }
    : { backgroundColor: '#64748B' };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--color-dark-bg)' }}>
      {/* Top bar with glassmorphism */}
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

        {appointment && (
          <div className="text-sm hidden md:block">
            <span style={{ color: 'var(--color-text-muted)' }}>Paciente: </span>
            <span className="text-white font-medium">{appointment.patient_name}</span>
            <span className="mx-3" style={{ color: 'var(--color-dark-border)' }}>|</span>
            <span style={{ color: 'var(--color-text-muted)' }}>Tipo: </span>
            <span className="text-white">{appointment.consultation_type}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          {appointment?.patient_link && (
            <button
              onClick={() => setShowLinkPanel(!showLinkPanel)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: showLinkPanel ? 'var(--color-primary)' : 'var(--color-dark-surface)',
                color: showLinkPanel ? 'white' : '#94A3B8',
                border: `1px solid ${showLinkPanel ? 'var(--color-primary)' : 'var(--color-dark-border)'}`,
                transitionDuration: 'var(--duration-fast)',
              }}
            >
              <Link className="h-3.5 w-3.5" />
              Link paciente
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={statusDotStyle} />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {connectionState === 'connected' ? 'Conectado' :
               connectionState === 'connecting' ? 'Conectando...' :
               participantJoined ? 'Estableciendo conexion...' : 'Esperando paciente...'}
            </span>
          </div>
        </div>
      </div>

      {/* Patient link panel */}
      {showLinkPanel && appointment?.patient_link && (
        <div
          className="px-6 py-3 flex items-center gap-3 glass-dark animate-fade-in"
          style={{ borderBottom: '1px solid var(--color-dark-border)' }}
        >
          <Link className="h-4 w-4 shrink-0" style={{ color: 'var(--color-primary-light)' }} />
          <input
            type="text"
            readOnly
            value={appointment.patient_link}
            className="flex-1 px-3 py-1.5 text-sm select-all outline-none"
            style={{
              backgroundColor: 'var(--color-dark-bg)',
              border: '1px solid var(--color-dark-border)',
              borderRadius: 'var(--radius-input)',
              color: '#CBD5E1',
            }}
            onClick={(e) => e.target.select()}
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(appointment.patient_link);
              toast.success('Enlace copiado');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-white text-sm font-medium shrink-0 transition-all"
            style={{
              backgroundColor: 'var(--color-primary)',
              borderRadius: 'var(--radius-button)',
              transitionDuration: 'var(--duration-fast)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
          >
            <Copy className="h-3.5 w-3.5" /> Copiar
          </button>
          <button
            onClick={() => setShowLinkPanel(false)}
            className="shrink-0 transition-colors"
            style={{ color: '#64748B', transitionDuration: 'var(--duration-fast)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Video area */}
      <div className="flex-1 flex items-center justify-center p-4 gap-4 relative">
        <div className="flex-1 max-w-4xl">
          <VideoPlayer
            stream={remoteStream}
            label={appointment ? `Paciente: ${appointment.patient_name}` : 'Paciente'}
          />
        </div>

        {/* PiP local video with glow */}
        <div
          className="absolute bottom-20 right-8 w-48 transition-all"
          style={{
            borderRadius: 'var(--radius-card)',
            boxShadow: connectionState === 'connected' ? '0 0 12px rgba(13,148,136,0.3)' : 'none',
          }}
        >
          <VideoPlayer stream={localStream} muted={true} label="Usted" />
        </div>
      </div>

      {/* Controls with glassmorphism */}
      <div className="glass-dark" style={{ borderTop: '1px solid var(--color-dark-border)' }}>
        <VideoControls
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          onToggleMute={toggleMute}
          onToggleCamera={toggleCamera}
          onEndCall={handleEndCall}
          isEndCallEnabled={true}
        />
      </div>
    </div>
  );
}
