/** Compact relative time for last-message stamps: "now", "5m", "3h", "2d". */
export function relativeTime(iso: string | null, now: Date = new Date()): string {
  if (!iso) return '';
  const diffMs = now.getTime() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'now';
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  return `${Math.floor(hr / 24)}d`;
}
