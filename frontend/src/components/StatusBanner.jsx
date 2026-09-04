export function ErrorBanner({ message }) {
  if (!message) return null;
  return <div className="error-banner">{message}</div>;
}

export function Loading({ label = 'Loading…' }) {
  return <p className="muted">{label}</p>;
}
