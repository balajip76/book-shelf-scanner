import { useState } from 'react';
import { useStorageQuota } from '../hooks/useStorageQuota';

export function StorageWarning() {
  const { isNearFull, usagePercent } = useStorageQuota();
  const [dismissed, setDismissed] = useState(false);

  if (!isNearFull || dismissed) return null;

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
      style={{ background: 'rgba(245,158,11,0.15)', borderBottom: '1px solid rgba(245,158,11,0.3)' }}
      role="alert"
    >
      <span style={{ color: 'var(--color-warning)' }}>
        Storage {Math.round(usagePercent)}% full -- export your collection soon
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 text-xs px-2 py-1 rounded"
        style={{ color: 'var(--color-warning)', minHeight: 32 }}
        aria-label="Dismiss storage warning"
      >
        X
      </button>
    </div>
  );
}
