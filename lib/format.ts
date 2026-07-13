export function formatDate(d: string, fallback = '—') {
  if (!d) return fallback;
  try {
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return d;
  }
}
