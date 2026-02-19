import { useRef, useEffect } from 'react';
import { VideoOff } from 'lucide-react';

export default function VideoPlayer({ stream, muted = false, label = '' }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className="relative overflow-hidden aspect-video"
      style={{
        backgroundColor: 'var(--color-dark-bg)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--color-dark-border)',
      }}
    >
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full animate-fade-in" style={{ color: 'var(--color-text-muted)' }}>
          <VideoOff size={48} />
          <p className="mt-2 text-sm">Esperando conexion...</p>
        </div>
      )}
      {label && (
        <div
          className="absolute bottom-3 left-3 glass-dark text-white text-xs px-3 py-1.5 rounded-lg font-medium"
        >
          {label}
        </div>
      )}
    </div>
  );
}
