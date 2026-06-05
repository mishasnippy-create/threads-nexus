export const API_URL =
  "https://script.google.com/macros/s/AKfycbxwrs9NQX7I0FIEDsjwGZctu-NjLFepd3A6i_WfCWza30nnksESxwqlR-CuHNc15zxu/exec";

export function fmt(n: number | string | undefined): string {
  const num = Number(n) || 0;
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return String(num);
}

export function timeAgo(ts: string | undefined): string {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return diff + "s ago";
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    return Math.floor(diff / 86400) + "d ago";
  } catch {
    return ts;
  }
}
