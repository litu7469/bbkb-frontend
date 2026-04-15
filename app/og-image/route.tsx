import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#0D2B5E', padding: '60px',
      }}>
        {/* Logo row */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '24px', marginBottom: '40px',
        }}>
          <div style={{
            width: 80, height: 80,
            background: '#F5A623', borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 44, fontWeight: 900, color: '#0D2B5E' }}>B</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 56, fontWeight: 900, color: 'white', lineHeight: 1 }}>
              BBKB
            </span>
            <span style={{ fontSize: 20, color: '#93c5fd', marginTop: 4 }}>
              Bangladesh Banking Knowledge Base
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 32, color: 'white', textAlign: 'center',
          fontWeight: 700, marginBottom: 24, lineHeight: 1.3,
        }}>
          AI-Powered Regulatory Intelligence
        </div>

        <div style={{
          fontSize: 20, color: '#bfdbfe', textAlign: 'center', lineHeight: 1.6,
        }}>
          Search 5,000+ Bangladesh Bank, NBR, BSEC & BFIU circulars
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex', gap: '40px', marginTop: '48px',
        }}>
          {[
            { n: '5,337', l: 'Documents' },
            { n: '41',    l: 'BB Depts'  },
            { n: 'EN+BN', l: 'Bilingual' },
            { n: 'Free',  l: 'No Login'  },
          ].map(s => (
            <div key={s.l} style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 12, padding: '16px 24px',
            }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: '#F5A623' }}>{s.n}</span>
              <span style={{ fontSize: 14, color: '#93c5fd', marginTop: 4 }}>{s.l}</span>
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{
          marginTop: 48, fontSize: 18,
          color: '#64748b',
        }}>
          bbkb-frontend.vercel.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}