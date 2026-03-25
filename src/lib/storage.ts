export async function checkStorageUsage(): Promise<{ used: number; quota: number; percentage: number }> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const used = estimate.usage || 0;
    const quota = estimate.quota || 0;
    return { used, quota, percentage: quota > 0 ? (used / quota) * 100 : 0 };
  }
  return { used: 0, quota: 0, percentage: 0 };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

const STORAGE_WARNING_MB = 500;

export async function checkStorageWarning(): Promise<boolean> {
  const { used } = await checkStorageUsage();
  return used > STORAGE_WARNING_MB * 1024 * 1024;
}
