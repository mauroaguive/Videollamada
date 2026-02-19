import { Mic, MicOff, Camera, CameraOff, PhoneOff } from 'lucide-react';

export default function VideoControls({ isMuted, isCameraOff, onToggleMute, onToggleCamera, onEndCall, isEndCallEnabled = false }) {
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <button
        onClick={onToggleMute}
        className="p-4 rounded-full transition-all"
        style={{
          backgroundColor: isMuted ? 'var(--color-error)' : 'var(--color-dark-surface)',
          color: isMuted ? 'white' : '#CBD5E1',
          backdropFilter: 'blur(8px)',
          transitionDuration: 'var(--duration-fast)',
        }}
        onMouseEnter={(e) => {
          if (!isMuted) e.currentTarget.style.backgroundColor = 'var(--color-dark-border)';
        }}
        onMouseLeave={(e) => {
          if (!isMuted) e.currentTarget.style.backgroundColor = 'var(--color-dark-surface)';
        }}
      >
        {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
      </button>

      <button
        onClick={onToggleCamera}
        className="p-4 rounded-full transition-all"
        style={{
          backgroundColor: isCameraOff ? 'var(--color-error)' : 'var(--color-dark-surface)',
          color: isCameraOff ? 'white' : '#CBD5E1',
          backdropFilter: 'blur(8px)',
          transitionDuration: 'var(--duration-fast)',
        }}
        onMouseEnter={(e) => {
          if (!isCameraOff) e.currentTarget.style.backgroundColor = 'var(--color-dark-border)';
        }}
        onMouseLeave={(e) => {
          if (!isCameraOff) e.currentTarget.style.backgroundColor = 'var(--color-dark-surface)';
        }}
      >
        {isCameraOff ? <CameraOff className="h-6 w-6" /> : <Camera className="h-6 w-6" />}
      </button>

      {isEndCallEnabled && (
        <button
          onClick={onEndCall}
          className="p-4 rounded-full text-white transition-all group"
          style={{
            backgroundColor: '#DC2626',
            transitionDuration: 'var(--duration-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#B91C1C';
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(220,38,38,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#DC2626';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <PhoneOff className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
