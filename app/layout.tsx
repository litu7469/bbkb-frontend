'use client';

import type { Metadata } from 'next';
import './globals.css';
import { useState } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <nav className="navbar">
          <a href="/" className="navbar-brand">
            <div className="navbar-logo">BB</div>
            <div>
              <div className="navbar-title">Bangladesh Banking</div>
              <div className="navbar-sub">Knowledge Base</div>
            </div>
          </a>

          {/* Desktop links */}
          <div className="navbar-links">
            <a href="/">Home</a>
            <a href="/search">Search</a>
            <a href="/documents">Documents</a>
            <a href="/ask">Ask AI</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <a href="/ask" className="navbar-cta">Ask AI</a>
            {/* Hamburger */}
            <button
              className="hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu">
              <span style={{ transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
              <span style={{ opacity: menuOpen ? 0 : 1 }} />
              <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
            </button>
          </div>
        </nav>

        {/* Mobile dropdown menu */}
        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          <a href="/"          onClick={() => setMenuOpen(false)}>🏠 Home</a>
          <a href="/search"    onClick={() => setMenuOpen(false)}>🔍 Search</a>
          <a href="/documents" onClick={() => setMenuOpen(false)}>📄 Documents</a>
          <a href="/ask"       onClick={() => setMenuOpen(false)}>🤖 Ask AI</a>
        </div>

        <main style={{ minHeight: 'calc(100vh - 56px)' }}>{children}</main>

        <footer className="footer">
          <div className="footer-title">Bangladesh Banking Knowledge Base</div>
          <div className="footer-sub">
            AI-powered regulatory intelligence for the Bangladesh financial sector.
          </div>
          <div className="footer-note">
            Information only — not legal advice. Always verify with original regulatory documents.
          </div>
        </footer>
      </body>
    </html>
  );
}