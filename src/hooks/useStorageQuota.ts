import { useState, useEffect } from 'react';

export interface StorageQuota {
  usagePercent: number;
  isNearFull: boolean;
  quota: number;
  usage: number;
}

export function useStorageQuota(): StorageQuota {
  const [quota, setQuota] = useState<StorageQuota>({
    usagePercent: 0,
    isNearFull: false,
    quota: 0,
    usage: 0,
  });

  useEffect(() => {
    async function check() {
      if (!navigator.storage?.estimate) return;
      const { quota: q = 0, usage: u = 0 } = await navigator.storage.estimate();
      const pct = q > 0 ? (u / q) * 100 : 0;
      setQuota({ quota: q, usage: u, usagePercent: pct, isNearFull: pct >= 80 });
    }
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, []);

  return quota;
}
