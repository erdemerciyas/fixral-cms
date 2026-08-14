'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="tr">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            background: 'linear-gradient(135deg, #161a22 0%, #0e1117 100%)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                fontSize: '3.5rem',
                fontWeight: 700,
                color: '#c4ff00',
                margin: 0,
              }}
            >
              Hata
            </h1>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e8eaed', marginTop: '1rem' }}>
              Bir şeyler ters gitti
            </h2>
            <p style={{ color: '#9aa3b0', marginTop: '1rem', fontSize: '1.125rem' }}>
              Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: '2rem',
                padding: '0.75rem 2rem',
                background: '#c4ff00',
                color: '#12141a',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Tekrar Dene
            </button>
            <div style={{ marginTop: '1.5rem' }}>
              <a href="/" style={{ color: '#c4ff00', textDecoration: 'none' }}>
                Ana Sayfaya Dön
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
