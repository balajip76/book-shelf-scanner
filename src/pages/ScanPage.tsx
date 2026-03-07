import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCamera } from '../hooks/useCamera';
import { CameraViewfinder } from '../components/camera/CameraViewfinder';
import { CaptureButton } from '../components/camera/CaptureButton';
import { CameraPermissionDenied } from '../components/camera/CameraPermissionDenied';
import type { ScanResult } from '../types';
import { runScan } from '../agents/orchestrator';

type PageState = 'ready' | 'scanning' | 'error-no-books' | 'error-scan';

export function ScanPage() {
  const navigate = useNavigate();
  const camera = useCamera();
  const [pageState, setPageState] = useState<PageState>('ready');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processBlob = useCallback(async (blob: Blob) => {
    try {
      const sessionId = crypto.randomUUID();
      const result: ScanResult = await runScan(blob, sessionId);

      if (result.books.length === 0) {
        setPageState('error-no-books');
        return;
      }

      camera.stopCamera();
      navigate('/review', { state: { scanResult: result } });
    } catch (err) {
      setPageState('error-scan');
      setErrorMsg(String(err));
    }
  }, [camera, navigate]);

  const handleCapture = useCallback(async () => {
    setPageState('scanning');
    try {
      if (camera.usingFallback || camera.state === 'fallback') {
        return;
      }
      const blob = await camera.captureFrame();
      if (!blob) {
        setPageState('error-scan');
        setErrorMsg('Could not capture image. Please try again.');
        return;
      }
      await processBlob(blob);
    } catch (err) {
      setPageState('error-scan');
      setErrorMsg(String(err));
    }
  }, [camera, processBlob]);

  const handleFileSelected = useCallback(async (blob: Blob) => {
    setPageState('scanning');
    await processBlob(blob);
  }, [processBlob]);

  if (camera.state === 'denied') {
    return (
      <div data-testid="scan-page">
        <CameraPermissionDenied />
      </div>
    );
  }

  return (
    <div data-testid="scan-page" className="flex flex-col gap-4 p-4">
      <div className="text-center pt-2">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>Scan Bookshelf</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Point camera at your books and tap capture</p>
      </div>

      <CameraViewfinder
        cameraState={camera.state}
        videoRef={camera.videoRef}
        usingFallback={camera.usingFallback}
        onFileSelected={handleFileSelected}
      />

      {pageState === 'error-no-books' && (
        <div className="rounded-lg p-4 text-center" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid var(--color-warning)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--color-warning)' }}>No books detected</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Try better lighting or move closer to the shelf</p>
          <button
            onClick={() => setPageState('ready')}
            className="mt-3 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)', minHeight: 44 }}
          >
            Retake Photo
          </button>
        </div>
      )}

      {pageState === 'error-scan' && (
        <div className="rounded-lg p-4 text-center" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid var(--color-danger)' }}>
          <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{errorMsg ?? 'Scan failed. Please try again.'}</p>
          <button
            onClick={() => setPageState('ready')}
            className="mt-3 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)', minHeight: 44 }}
          >
            Try Again
          </button>
        </div>
      )}

      {!camera.usingFallback && camera.state !== 'fallback' && pageState !== 'error-no-books' && (
        <div className="flex justify-center py-4">
          <CaptureButton
            onCapture={handleCapture}
            disabled={camera.state !== 'streaming' || pageState === 'scanning'}
            isLoading={pageState === 'scanning'}
          />
        </div>
      )}

      {pageState === 'scanning' && (
        <p className="text-center text-sm animate-pulse" style={{ color: 'var(--color-text-muted)' }}>
          Analyzing bookshelf...
        </p>
      )}
    </div>
  );
}
