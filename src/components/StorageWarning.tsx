import { useStorageQuota } from '../hooks/useStorageQuota';

export function StorageWarning() {
  const { isNearFull } = useStorageQuota();
  if (!isNearFull) return null;
  return (
    <div className="px-4 py-2 text-sm text-center" style={{ background: 'var(--color-warning)', color: '#000' }}>
      Storage is nearly full. Consider exporting your collection.
    </div>
  );
}
