import { useState, useEffect } from 'react';
import { getQueueCount } from '../services/offlineQueue';
import { syncPendingRequests } from '../services/syncService';
import toast from 'react-hot-toast';
import './SyncStatus.css';

export default function SyncStatus() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  const updateCount = async () => {
    const count = await getQueueCount();
    setPendingCount(count);
  };

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    const result = await syncPendingRequests();
    setSyncing(false);
    await updateCount();
    if (result.synced > 0) toast.success(`Synced ${result.synced} offline records`);
    if (result.failed > 0) toast.error(`${result.failed} records failed to sync`);
  };

  useEffect(() => {
    updateCount();
    const handleOnline = () => {
      setIsOnline(true);
      handleSync(); // auto sync when online
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline || pendingCount === 0) return null;

  return (
    <div className="sync-status">
      <div className="sync-badge">
        <span className="material-symbols-outlined">cloud_queue</span>
        <span className="sync-count">{pendingCount}</span>
        <span>offline</span>
        <button onClick={handleSync} disabled={syncing} className="sync-btn">
          {syncing ? 'Syncing...' : 'Sync now'}
        </button>
      </div>
    </div>
  );
}