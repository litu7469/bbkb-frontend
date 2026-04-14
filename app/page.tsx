'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-b1ff6.up.railway.app';

interface Stats {
  total:       number;
  by_body:     Record<string, number>;
  by_dept:     Record<string, number>;
  date_range:  { oldest: string; newest: string };
}

interface RecentDoc {
  id:           string;
  title_en:     string;
  circular_ref: string | null;
  issuing_body: string;
  department:   string | null;
  issue_date:   string;
  primary_url:  string;
  topic_tags:   string[] | null;
}

const FEATURES = [
  {
    icon: '🧠',
    title: 'AI Semantic Search',
    desc:  'Ask questions in plain English or Bangla — the AI understands meaning, not just keywords.',
    color: '#eff6ff',
    border: '#bfdbfe',
  },
  {
    icon: '📚',
    title: '5,000+ Circulars',
    desc:  'Complete archive of BB, NBR, BSEC and BFIU regulatory documents dating back to 2008.',
    color: '#f0fdf4',
    border: '#bbf7d0',
  },
  {
    icon: '🌐',
    title: 'Bilingual Support',
    desc:  'Ask in বাংলা or English — get accurate answers in the same language you asked.',
    color: '#fdf4ff',
    border: '#e9d5ff',
  },
  {
    icon: '📋',
    title: 'Source Citations',
    desc:  'Every answer includes exact circular references so you can verify with the original document.',
    color: '#fff7ed',
    border: '#fed7aa',
  },
  {
    icon: '⚡',
    title: 'Instant Results',
    desc:  'Vector-powered semantic search returns relevant circulars in under 2 seconds.',
    color: '#fefce8',
    border: '#fde68a',
  },
  {
    icon: '🛡️',
    title: 'Always Verified',
    desc:  'Data sourced directly from official regulatory websites — BB, NBR, SEC, BFIU.',
    color: '#f0f9ff',
    border: '#bae6fd',
  },
];

const QUICK_QUERIES = [
  { label: 'Loan Classification Rules',      q: 'What are the loan classification and provisioning rules?' },
  { label: 'Single Borrower Limit',          q: 'What is the single borrower exposure limit for banks?' },
  { label: 'Mobile Banking Guidelines',      q: 'What are the guidelines for mobile financial services?' },
  { label: 'Capital Adequacy (Basel III)',   q: 'What are the capital adequacy requirements under Basel III?' },
  { label: 'AML Compliance Requirements',   q: 'What are the AML reporting requirements for banks?' },
  { label: 'NRB Account Documents',         q: 'What documents are needed to open an NRB account?' },
  { label: 'ঋণ শ্রেণীবিন্যাস নিয়ম',        q: 'ঋণ শ্রেণীবিন্যাসের নিয়ম কী?' },
  { label: 'মোবাইল ব্যাংকিং বিধিমালা',     q: 'মোবাইল ব্যাংকিং বিধিমালা কী?' },
];

const REGULATORS = [
  { code: 'BB',              name: 'Bangladesh Bank',                        color: '#1d4ed8', bg: '#eff6ff' },
  { code: 'NBR',             name: 'National Board of Revenue',             color: '#16a34a', bg: '#f0fdf4' },
  { code: 'BSEC',            name: 'Bangladesh Securities & Exchange Comm.', color: '#7c3aed', bg: '#fdf4ff' },
  { code: 'BFIU',            name: 'Bangladesh Financial Intelligence Unit', color: '#b45309', bg: '#fffbeb' },
  { code: 'Ministry of Law', name: 'Bangladesh Banking Laws & Acts',         color: '#0f766e', bg: '#f0fdfa' },
  { code: 'International',   name: 'International Banking Standards',        color: '#be185d', bg: '#fdf2f8' },
];

function formatDate(d: string) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  } catch { return d; }
}

function StatCard({ label, value, sub, color }: {
  label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div style={{
      background: 'white', borderRadius: 14,
      padding: '1.5rem', textAlign: 'center',
      border: '1px solid #f1f5f9',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      <div style={{ fontSize: '2rem', fontWeight: 900, color, lineHeight: 1, marginBottom: 4 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 2 }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#94a3b8' }}>{sub}</div>}
    </div>
  );
}

export default function HomePage() {
  const [stats,      setStats]      = useState<Stats | null>(null);
  const [recent,     setRecent]     = useState<RecentDoc[]>([]);
  const [query,      setQuery]      = useState('');
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
  setHeroLoaded(true);

  async function loadData() {
    try {
      // Single request for total count
      const totalRes = await fetch(`${API_URL}/api/v1/documents/?limit=1`);
      const totalData = await totalRes.json();
      const total = totalData.total || 0;

      // Recent documents
      const recentRes  = await fetch(`${API_URL}/api/v1/documents/?limit=6&order=issue_date.desc`);
      const recentData = await recentRes.json();
      setRecent(recentData.documents || recentData.items || []);

      // Body counts — sequential with small delays to avoid connection drops
      const by_body: Record<string, number> = {};
      for (const body of ['BB', 'NBR', 'BSEC', 'BFIU']) {
        try {
          await new Promise(r => setTimeout(r, 150)); // 150ms gap
          const res  = await fetch(`${API_URL}/api/v1/documents/?limit=1&issuing_body=${body}`);
          const data = await res.json();
          by_body[body] = data.total || 0;
        } catch {
          by_body[body] = 0;
        }
      }

      setStats({
        total,
        by_body,
        by_dept:    {},
        date_range: { oldest: '2008', newest: '2026' },
      });

    } catch (err) {
      console.error('Home page data load error:', err);
    }
  }

  loadData();
}, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>

      {/* ── Hero Section ─────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0D2B5E 0%, #1e3a8a 50%, #1d4ed8 100%)',
        padding: '4rem 1rem 5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 320, height: 320, borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -60,
          width: 240, height: 240, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }} />

        <div style={{
          maxWidth: 760, margin: '0 auto', textAlign: 'center',
          opacity: heroLoaded ? 1 : 0,
          transform: heroLoaded ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s ease',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 999, padding: '0.35rem 1rem',
            fontSize: 12, fontWeight: 700, color: '#bfdbfe',
            letterSpacing: '0.05em', marginBottom: '1.5rem',
          }}>
            🇧🇩 BANGLADESH BANKING KNOWLEDGE BASE
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
            fontWeight: 900, color: 'white',
            lineHeight: 1.2, marginBottom: '1rem',
            letterSpacing: '-0.02em',
          }}>
            AI-Powered Regulatory<br />
            Intelligence Platform
          </h1>

          <p style={{
            fontSize: 'clamp(14px, 2.5vw, 17px)',
            color: '#bfdbfe', lineHeight: 1.7,
            marginBottom: '2.5rem',
            maxWidth: 580, margin: '0 auto 2.5rem',
          }}>
            Search <strong style={{ color: 'white' }}>5,000+ regulatory circulars</strong> from
            Bangladesh Bank, NBR, BSEC and BFIU.
            Ask questions in <strong style={{ color: 'white' }}>English or বাংলা</strong> — get
            instant AI answers with source citations.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{
            display: 'flex', gap: '0.5rem',
            maxWidth: 600, margin: '0 auto 2rem',
            flexWrap: 'wrap',
          }}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search regulations e.g. 'loan classification rules'..."
              style={{
                flex: 1, minWidth: 200,
                padding: '0.875rem 1.25rem',
                borderRadius: 10, border: 'none',
                fontSize: 15, outline: 'none',
                color: '#1e293b',
                fontFamily: 'Noto Sans Bengali, system-ui, sans-serif',
              }}
            />
            <button type="submit"
              style={{
                background: '#f59e0b', color: '#1c1917',
                fontWeight: 800, fontSize: 15,
                padding: '0.875rem 1.75rem',
                borderRadius: 10, border: 'none',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
              Search →
            </button>
          </form>

          {/* Quick action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/ask"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: 'white', fontWeight: 700, fontSize: 14,
                padding: '0.625rem 1.25rem', borderRadius: 8,
                textDecoration: 'none', display: 'flex',
                alignItems: 'center', gap: '0.4rem',
              }}>
              🤖 Ask AI Assistant
            </Link>
            <Link href="/documents"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: 'white', fontWeight: 700, fontSize: 14,
                padding: '0.625rem 1.25rem', borderRadius: 8,
                textDecoration: 'none', display: 'flex',
                alignItems: 'center', gap: '0.4rem',
              }}>
              📄 Browse Documents
            </Link>
          </div>
        </div>
      </div>

      {/* ── Live Stats Bar ───────────────────────────── */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #f1f5f9',
        padding: '1.5rem 1rem',
      }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem',
        }}>
          <StatCard
            label="Total Documents"
            value={stats?.total || '—'}
            sub="circulars & guidelines"
            color="#1d4ed8"
          />
          <StatCard
            label="Bangladesh Bank"
            value={stats?.by_body?.BB || '—'}
            sub="from 41 departments"
            color="#0D2B5E"
          />
          <StatCard
            label="NBR"
            value={stats?.by_body?.NBR || '—'}
            sub="tax regulations"
            color="#16a34a"
          />
          <StatCard
            label="BSEC"
            value={stats?.by_body?.BSEC || '—'}
            sub="securities laws"
            color="#7c3aed"
          />
          <StatCard
            label="Years Covered"
            value="2008–2026"
            sub="complete archive"
            color="#b45309"
          />
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 1rem' }}>

        {/* ── Regulators ───────────────────────────────── */}
        <div style={{ marginBottom: '3.5rem' }}>
          <h2 style={{
            fontSize: '1.35rem', fontWeight: 800,
            color: '#1e293b', marginBottom: '0.375rem',
          }}>
            Regulatory Bodies Covered
          </h2>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: '1.25rem' }}>
            Sourced directly from official government websites
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.875rem',
          }}>
            {REGULATORS.map(r => (
              <Link key={r.code}
                href={`/documents?body=${r.code}`}
                style={{ textDecoration: 'none' }}>
                <div style={{
                  background: r.bg,
                  border: `1.5px solid ${r.color}22`,
                  borderRadius: 12, padding: '1.125rem 1.25rem',
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'none';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: r.color, color: 'white',
                    fontWeight: 900, fontSize: 13,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {r.code}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 13 }}>
                      {r.name}
                    </div>
                    <div style={{ fontSize: 12, color: r.color, fontWeight: 600, marginTop: 2 }}>
                      {stats?.by_body?.[r.code]
                        ? `${stats.by_body[r.code].toLocaleString()} documents`
                        : 'Loading...'
                      }
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Quick AI Queries ──────────────────────────── */}
        <div style={{ marginBottom: '3.5rem' }}>
          <h2 style={{
            fontSize: '1.35rem', fontWeight: 800,
            color: '#1e293b', marginBottom: '0.375rem',
          }}>
            Popular Queries
          </h2>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: '1.25rem' }}>
            Click any question to get an instant AI answer
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '0.625rem',
          }}>
            {QUICK_QUERIES.map(q => (
              <Link key={q.q} href={`/ask?q=${encodeURIComponent(q.q)}`}
                style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'white', border: '1.5px solid #e2e8f0',
                  borderRadius: 10, padding: '0.875rem 1rem',
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  cursor: 'pointer', transition: 'all 0.15s',
                  fontFamily: 'Noto Sans Bengali, system-ui, sans-serif',
                }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = '#3b82f6';
                    el.style.background  = '#eff6ff';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = '#e2e8f0';
                    el.style.background  = 'white';
                  }}>
                  <span style={{ fontSize: 16 }}>🤖</span>
                  <span style={{ fontSize: 13, color: '#374151', fontWeight: 500, flex: 1 }}>
                    {q.label}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: 14 }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Recent Circulars ──────────────────────────── */}
        {recent.length > 0 && (
          <div style={{ marginBottom: '3.5rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: '1.25rem',
              flexWrap: 'wrap', gap: '0.5rem',
            }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e293b', marginBottom: 2 }}>
                  Latest Circulars
                </h2>
                <p style={{ color: '#64748b', fontSize: 14 }}>Most recently published regulatory documents</p>
              </div>
              <Link href="/documents"
                style={{
                  fontSize: 13, fontWeight: 700, color: '#1d4ed8',
                  textDecoration: 'none', padding: '0.5rem 1rem',
                  border: '1.5px solid #bfdbfe', borderRadius: 8,
                  background: '#eff6ff',
                }}>
                View All →
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recent.map(doc => (
                <div key={doc.id} style={{
                  background: 'white', borderRadius: 10,
                  padding: '1rem 1.25rem',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  display: 'flex', gap: '1rem', alignItems: 'flex-start',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 600, color: '#1e293b',
                      fontSize: 13, lineHeight: 1.5, marginBottom: 5,
                    }}>
                      {doc.title_en}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {doc.circular_ref && (
                        <span className="tag" style={{ fontSize: 10 }}>{doc.circular_ref}</span>
                      )}
                      <span className="tag tag-grey" style={{ fontSize: 10 }}>{doc.issuing_body}</span>
                      {doc.department && doc.department !== doc.issuing_body && (
                        <span style={{
                          background: '#dbeafe', color: '#1e40af',
                          fontSize: 10, fontWeight: 700,
                          padding: '0.1rem 0.45rem', borderRadius: 999,
                        }}>{doc.department}</span>
                      )}
                      <span className="tag tag-grey" style={{ fontSize: 10 }}>
                        {formatDate(doc.issue_date)}
                      </span>
                      {doc.topic_tags?.slice(0, 2).map(tag => (
                        <span key={tag} style={{
                          background: '#f1f5f9', color: '#64748b',
                          fontSize: 10, padding: '0.1rem 0.45rem',
                          borderRadius: 999, border: '1px solid #e2e8f0',
                        }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                    <a href={doc.primary_url} target="_blank" rel="noopener noreferrer"
                      style={{
                        background: '#1d4ed8', color: 'white',
                        fontSize: 11, fontWeight: 700,
                        padding: '0.35rem 0.75rem', borderRadius: 6,
                        textDecoration: 'none', whiteSpace: 'nowrap',
                      }}>
                      View
                    </a>
                    <Link href={`/ask?q=${encodeURIComponent(doc.circular_ref || doc.title_en)}`}
                      style={{
                        background: 'white', color: '#7c3aed',
                        fontSize: 11, fontWeight: 700,
                        padding: '0.35rem 0.75rem', borderRadius: 6,
                        textDecoration: 'none', whiteSpace: 'nowrap',
                        border: '1px solid #e2e8f0',
                      }}>
                      Ask AI
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Feature Cards ─────────────────────────────── */}
        <div style={{ marginBottom: '3.5rem' }}>
          <h2 style={{
            fontSize: '1.35rem', fontWeight: 800,
            color: '#1e293b', marginBottom: '0.375rem',
          }}>
            Platform Features
          </h2>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: '1.25rem' }}>
            Everything you need for Bangladesh regulatory compliance
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '0.875rem',
          }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                background: f.color,
                border: `1.5px solid ${f.border}`,
                borderRadius: 12, padding: '1.25rem',
              }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.625rem' }}>{f.icon}</div>
                <div style={{
                  fontWeight: 800, color: '#1e293b',
                  fontSize: 14, marginBottom: 6,
                }}>{f.title}</div>
                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA Banner ────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #0D2B5E, #1d4ed8)',
          borderRadius: 16, padding: '2.5rem',
          textAlign: 'center', color: 'white',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🚀</div>
          <h2 style={{
            fontSize: '1.4rem', fontWeight: 900,
            marginBottom: '0.5rem',
          }}>
            Ready to search Bangladesh regulations?
          </h2>
          <p style={{
            color: '#bfdbfe', fontSize: 14,
            marginBottom: '1.5rem', lineHeight: 1.7,
          }}>
            Ask the AI assistant a question or browse 5,000+ circulars directly.
            Available in English and বাংলা.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/ask"
              style={{
                background: '#f59e0b', color: '#1c1917',
                fontWeight: 800, fontSize: 15,
                padding: '0.75rem 2rem', borderRadius: 10,
                textDecoration: 'none',
              }}>
              🤖 Ask AI Now
            </Link>
            <Link href="/search"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1.5px solid rgba(255,255,255,0.3)',
                color: 'white', fontWeight: 700, fontSize: 15,
                padding: '0.75rem 2rem', borderRadius: 10,
                textDecoration: 'none',
              }}>
              🔍 Search Documents
            </Link>
          </div>
        </div>

      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 640px) {
          .hero-search { flex-direction: column; }
          .hero-search input,
          .hero-search button { width: 100%; }
        }
      `}</style>
    </div>
  );
}