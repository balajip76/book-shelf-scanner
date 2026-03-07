interface Props {
  onCapture: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function CaptureButton({ onCapture, disabled, isLoading }: Props) {
  return (
    <button
      data-testid="capture-button"
      onClick={onCapture}
      disabled={disabled || isLoading}
      aria-label="Capture photo"
      className="relative flex items-center justify-center rounded-full transition-transform active:scale-95 disabled:opacity-50"
      style={{
        width: 72,
        height: 72,
        background: isLoading ? 'var(--color-surface-3)' : '#fff',
        border: '4px solid var(--color-primary)',
        minWidth: 44,
        minHeight: 44,
      }}
    >
      {isLoading ? (
        <div
          className="animate-spin w-6 h-6 rounded-full border-2"
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
        />
      ) : (
        <div className="w-12 h-12 rounded-full" style={{ background: 'var(--color-primary)' }} />
      )}
    </button>
  );
}
