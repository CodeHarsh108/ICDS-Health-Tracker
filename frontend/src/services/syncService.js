import api from '../api/axios';
import { getAllPending, removeFromQueue, getQueueCount } from './offlineQueue';

let isSyncing = false;

export const syncPendingRequests = async () => {
  if (isSyncing) return { success: false, message: 'Sync already in progress' };
  
  const pending = await getAllPending();
  if (pending.length === 0) return { success: true, message: 'Nothing to sync' };

  isSyncing = true;
  let successCount = 0;
  let failCount = 0;

  try {
    // Group requests by type? For simplicity, send each individually
    for (const req of pending) {
      try {
        // Convert the stored data back to the expected format
        await api.request({
          url: req.url,
          method: req.method,
          data: req.data
        });
        await removeFromQueue(req.id);
        successCount++;
      } catch (err) {
        console.error(`Failed to sync ${req.url}:`, err);
        failCount++;
        // Optional: increment retryCount and re-save later
        // For simplicity, we keep it in queue
      }
    }
  } finally {
    isSyncing = false;
  }

  return {
    success: failCount === 0,
    synced: successCount,
    failed: failCount,
    remaining: await getQueueCount()
  };
};

// Listen for online event to trigger sync
export const initSyncListener = () => {
  window.addEventListener('online', () => {
    console.log('🟢 Online detected – syncing offline queue');
    syncPendingRequests().then(result => {
      console.log('Sync result:', result);
    });
  });
};