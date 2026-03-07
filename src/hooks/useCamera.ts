import { useState, useEffect, useRef, useCallback } from 'react';

export type CameraState = 'idle' | 'loading' | 'streaming' | 'denied' | 'fallback' | 'error';

export interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  state: CameraState;
  error: string | null;
  usingFallback: boolean;
  captureFrame: () => Promise<Blob | null>;
  stopCamera: () => void;
}

async function getRearCameraStream(): Promise<MediaStream> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    const rearDevice = videoDevices.find(d =>
      d.label.toLowerCase().includes('back') ||
      d.label.toLowerCase().includes('rear') ||
      d.label.toLowerCase().includes('environment')
    ) ?? videoDevices[videoDevices.length - 1];

    if (rearDevice?.deviceId) {
      return await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: rearDevice.deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
    }
  } catch {
    // Fall through to facingMode
  }

  return navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
    audio: false,
  });
}

export function useCamera(): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setState('idle');
  }, []);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setUsingFallback(true);
      setState('fallback');
      return;
    }

    setState('loading');
    getRearCameraStream()
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setState('streaming');
      })
      .catch(err => {
        const name = (err as Error).name;
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          setState('denied');
          setError('Camera access denied');
        } else {
          setUsingFallback(true);
          setState('fallback');
        }
      });

    return () => { stopCamera(); };
  }, [stopCamera]);

  const captureFrame = useCallback(async (): Promise<Blob | null> => {
    const video = videoRef.current;
    if (!video || state !== 'streaming') return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
  }, [state]);

  return { videoRef, state, error, usingFallback, captureFrame, stopCamera };
}
