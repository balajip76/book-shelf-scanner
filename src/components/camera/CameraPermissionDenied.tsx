import { useNavigate } from 'react-router-dom';

export function CameraPermissionDenied() {
  const navigate = useNavigate();
  return (
    <div
      data-testid="camera-permission-denied"
      className="flex flex-col items-center justify-center gap-6 p-6 min-h-[60dvh] text-center"
    >
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(239,68,68,0.1)' }}
      >
        <svg className="w-10 h-10" style={{ color: 'var(--color-danger)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Camera Access Denied</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          To scan books, allow camera access in your browser settings, then reload the page.
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 rounded-xl font-medium text-white"
          style={{ background: 'var(--color-primary)', minHeight: 44 }}
        >
          Reload Page
        </button>
        <button
          onClick={() => navigate('/collection')}
          className="w-full py-3 rounded-xl font-medium"
          style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)', minHeight: 44 }}
        >
          Add Books Manually
        </button>
      </div>
    </div>
  );
}
