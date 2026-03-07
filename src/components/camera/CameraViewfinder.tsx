import { useRef } from 'react';
import type { UseCameraResult } from '../../hooks/useCamera';

interface Props {
  cameraState: UseCameraResult['state'];
  videoRef: React.RefObject<HTMLVideoElement | null>;
  usingFallback: boolean;
  onFileSelected: (blob: Blob) => void;
}

export function CameraViewfinder({ cameraState, videoRef, usingFallback, onFileSelected }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  };

  if (usingFallback || cameraState === 'fallback') {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 rounded-xl p-8"
        style={{ background: 'var(--color-surface-2)', minHeight: 280, border: '2px dashed var(--color-surface-3)' }}
      >
        <svg className="w-16 h-16" style={{ color: 'var(--color-text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Tap below to open camera
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-3 rounded-xl font-medium text-white"
          style={{ background: 'var(--color-primary)', minHeight: 44 }}
        >
          Open Camera
        </button>
        <input
          ref={fileInputRef}
          data-testid="file-input-camera"
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    );
  }

  if (cameraState === 'loading') {
    return (
      <div className="flex items-center justify-center rounded-xl" style={{ background: 'var(--color-surface-2)', minHeight: 280 }}>
        <div className="animate-spin w-8 h-8 rounded-full border-2" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ background: '#000', minHeight: 280 }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
        style={{ minHeight: 280, maxHeight: '60dvh' }}
      />
      <div className="absolute inset-0 pointer-events-none" style={{ border: '2px solid rgba(255,255,255,0.2)', borderRadius: '0.75rem' }} />
    </div>
  );
}
