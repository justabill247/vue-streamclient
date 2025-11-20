export function formatTimeHrsMins(totalSeconds) {
  const hours   = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (totalSeconds < 3600) return `${(totalSeconds / 60)}m`;
  return `${hours}h ${minutes}m`;
}

