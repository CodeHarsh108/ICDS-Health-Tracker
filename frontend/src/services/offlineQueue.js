import Dexie from 'dexie';

const db = new Dexie('AnganwadiOfflineDB');
db.version(1).stores({
  pendingRequests: '++id, url, method, timestamp, retryCount'  // auto-increment id
});

// Add a request to the queue
export const addToQueue = async (config) => {
  const pending = {
    url: config.url,
    method: config.method,
    data: config.data,
    timestamp: new Date().toISOString(),
    retryCount: 0
  };
  await db.pendingRequests.add(pending);
  console.log('📦 Offline: Request queued', pending.url);
};

// Get all pending requests (ordered by oldest first)
export const getAllPending = async () => {
  return await db.pendingRequests.orderBy('timestamp').toArray();
};

// Remove a request from queue after successful sync
export const removeFromQueue = async (id) => {
  await db.pendingRequests.delete(id);
};

// Clear entire queue (if needed)
export const clearQueue = async () => {
  await db.pendingRequests.clear();
};

// Get queue count
export const getQueueCount = async () => {
  return await db.pendingRequests.count();
};