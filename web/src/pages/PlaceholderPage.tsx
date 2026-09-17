import { apiBaseUrl } from '@/api';

export function PlaceholderPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <section style={{ maxWidth: '36rem', textAlign: 'center' }}>
        <p style={{ fontWeight: 600, letterSpacing: '0.04em', color: '#4f46e5' }}>CreditFast</p>
        <h1 style={{ marginTop: '0.5rem', fontSize: '1.875rem' }}>React app scaffold</h1>
        <p style={{ marginTop: '1rem' }}>
          Screens are not migrated yet. Existing HTML/CSS/JS stay at the repository root. This app
          is ready to receive the Laravel API.
        </p>
        <p style={{ marginTop: '0.75rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
          API: {apiBaseUrl}
        </p>
      </section>
    </main>
  );
}
