'use client';
// BBKB v1.0 — fresh build

import './globals.css';
import { useState } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  { href: '/',          label: 'Home'      },
  { href: '/search',    label: 'Search'    },
  { href: '/documents', label: 'Documents' },
];

function Logo() {
  return (
    <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 34, height: 34, background: '#F5A623',
        borderRadius: 8, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="4" width="16" height="2" rx="1" fill="#0D2B5E"/>
          <rect x="2" y="8" width="12" height="2" rx="1" fill="#0D2B5E"/>
          <rect x="2" y="12" width="14" height="2" rx="1" fill="#0D2B5E"/>
          <circle cx="15" cy="14" r="4" fill="#0D2B5E"/>
          <path d="M13.5 14l1 1 2-2" stroke="#F5A623" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: 'white', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
          BBKB
        </div>
        <div style={{
          fontSize: 12, color: '#93c5fd', lineHeight: 1.2,
          fontFamily: 'Noto Sans Bengali, sans-serif',
        }}>
          বাংলাদেশ ব্যাংকিং জ্ঞানভাণ্ডার
        </div>
      </div>
    </Link>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Bangladesh's AI-powered regulatory intelligence platform. Search 5,000+ Bangladesh Bank, NBR, BSEC and BFIU circulars instantly in English or বাংলা." />
        <meta property="og:title" content="BBKB — Bangladesh Banking Knowledge Base" />
        <meta property="og:description" content="AI-powered search for Bangladesh banking regulations, circulars and laws." />
        <title>BBKB — Bangladesh Banking Knowledge Base</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>

        {/* Navbar */}
        <nav style={{
          background: '#0D2B5E',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 0 rgba(255,255,255,0.06)',
        }}>
          <Logo />

          {/* Desktop links */}
          <div className="navbar-links" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} style={{
                color: '#bfdbfe', textDecoration: 'none',
                fontSize: 14, fontWeight: 500,
                transition: 'color 0.15s',
              }}>
                {l.label}
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href="/ask" style={{
              background: '#F5A623', color: '#1c1917',
              fontWeight: 800, fontSize: 13,
              padding: '7px 16px', borderRadius: 7,
              textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
              Ask AI
            </Link>

            {/* Hamburger */}
            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'none' }}>
              <div style={{ width: 20, height: 2, background: 'white', borderRadius: 2, marginBottom: 4,
                transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none', transition: 'all 0.2s' }} />
              <div style={{ width: 20, height: 2, background: 'white', borderRadius: 2, marginBottom: 4,
                opacity: menuOpen ? 0 : 1, transition: 'all 0.2s' }} />
              <div style={{ width: 20, height: 2, background: 'white', borderRadius: 2,
                transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none', transition: 'all 0.2s' }} />
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{
            background: '#0D2B5E', borderBottom: '1px solid #1e3a8a',
            padding: '0.5rem 0', zIndex: 99,
          }}>
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block', color: '#bfdbfe',
                  textDecoration: 'none', fontSize: 15,
                  padding: '0.875rem 1.5rem',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                {l.label}
              </Link>
            ))}
            <Link href="/ask" onClick={() => setMenuOpen(false)}
              style={{
                display: 'block', color: '#F5A623',
                textDecoration: 'none', fontSize: 15, fontWeight: 700,
                padding: '0.875rem 1.5rem',
              }}>
              Ask AI
            </Link>
          </div>
        )}

        <main style={{ minHeight: 'calc(100vh - 56px)' }}>{children}</main>

        {/* Footer */}
        <footer style={{ background: '#0D2B5E', color: 'white', padding: '3rem 1.5rem 2rem' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '2rem', marginBottom: '2rem',
            }}>

              {/* Brand */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{
                    width: 28, height: 28, background: '#F5A623',
                    borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                      <rect x="2" y="4" width="16" height="2" rx="1" fill="#0D2B5E"/>
                      <rect x="2" y="8" width="12" height="2" rx="1" fill="#0D2B5E"/>
                      <rect x="2" y="12" width="14" height="2" rx="1" fill="#0D2B5E"/>
                      <circle cx="15" cy="14" r="4" fill="#0D2B5E"/>
                      <path d="M13.5 14l1 1 2-2" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>BBKB</div>
                    <div style={{ fontSize: 12, color: '#93c5fd', fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                      বাংলাদেশ ব্যাংকিং জ্ঞানভাণ্ডার
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7, margin: 0 }}>
                  AI-powered regulatory intelligence for Bangladesh's banking and financial sector.
                </p>
              </div>

              {/* Platform */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#93c5fd', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Platform
                </div>
                {[
                  { href: '/',          label: 'Home'           },
                  { href: '/search',    label: 'Search'         },
                  { href: '/documents', label: 'Documents'      },
                  { href: '/ask',       label: 'Ask AI'         },
                ].map(l => (
                  <Link key={l.href} href={l.href}
                    style={{ display: 'block', fontSize: 13, color: '#94a3b8', textDecoration: 'none', marginBottom: 6 }}>
                    {l.label}
                  </Link>
                ))}
              </div>

              {/* Sources */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#93c5fd', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Regulatory Sources
                </div>
                {['Bangladesh Bank (BB)', 'Natl. Board of Revenue (NBR)', 'BSEC', 'BFIU', 'Ministry of Law', 'International Standards'].map(s => (
                  <div key={s} style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>{s}</div>
                ))}
              </div>

              {/* Disclaimer */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#93c5fd', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Disclaimer
                </div>
                <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7, margin: 0 }}>
                  This platform is for informational purposes only and does not constitute legal advice.
                  Always verify with the original regulatory authority.
                </p>
              </div>
            </div>

            {/* Bottom bar */}
            <div style={{
              borderTop: '1px solid #1e3a8a',
              paddingTop: '1.5rem',
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem',
            }}>
              <div style={{ fontSize: 12, color: '#475569' }}>
                © 2026 BBKB — Bangladesh Banking Knowledge Base. All rights reserved.
              </div>
              <div style={{ fontSize: 12, color: '#475569', fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                তথ্যের উৎস: বাংলাদেশ ব্যাংক · এনবিআর · বিএসইসি · বিএফআইইউ
              </div>
            </div>
          </div>
        </footer>

        {/* Mobile responsive styles */}
        <style>{`
          @media (max-width: 768px) {
            .navbar-links { display: none !important; }
            .hamburger { display: flex !important; flex-direction: column; }
          }
        `}</style>

      </body>
    </html>
  );
}