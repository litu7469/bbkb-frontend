'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-b1ff6.up.railway.app';

interface Document {
  id:               string;
  title_en:         string;
  title_bn:         string | null;
  circular_ref:     string | null;
  issuing_body:     string;
  department:       string | null;
  issue_date:       string;
  status:           string;
  primary_url:      string;
  category_primary: string | null;
  topic_tags:       string[] | null;
  summary_en:       string | null;
  similarity?:      number;
  _source?:         string;
}

interface SearchResult {
  items:          Document[];
  total:          number;
  semantic_count: number;
  keyword_count:  number;
  query:          string;
  mode:           string;
}

type SearchMode = 'hybrid' | 'semantic' | 'keyword';

const ISSUING_BODIES = ['BB', 'NBR', 'BSEC', 'BFIU'];
const BB_DEPTS = [
  'BRPD', 'DOS', 'DFIM', 'FEPD', 'BFIU', 'PSD', 'MPD',
  'SME', 'SDAD', 'DMD', 'SPCD', 'GBCSRD', 'FININCLD',
  'ACD', 'CIB', 'FEOD', 'FEID', 'SFD',
];

const SAMPLE_QUERIES = [
  'loan classification and provisioning rules',
  'capital adequacy Basel III requirements',
  'mobile banking regulations fintech',
  'anti money laundering compliance',
  'foreign exchange remittance NRB account',
  'single borrower exposure limit',
  'interest rate policy repo rate',
  'agricultural credit rural finance',
];

function formatDate(d: string) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  } catch { return d; }
}

function SourceBadge({ source }: { source?: string }) {
  if (!source) return null;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '0.1rem 0.4rem',
      borderRadius: 4,
      background: source === 'semantic' ? '#f0fdf4' : '#eff6ff',
      color:      source === 'semantic' ? '#15803d' : '#1d4ed8',
    }}>
      {source === 'semantic' ? 'AI' : 'KW'}
    </span>
  );
}

function DocCard({ doc }: { doc: Document }) {
  const isBangla = doc.title_bn && doc.issuing_body !== 'BB';
  const title    = isBangla ? doc.title_bn! : doc.title_en;

  return (
    <div style={{
      background: 'white', borderRadius: 12, padding: '1.25rem 1.5rem',
      border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      marginBottom: '0.75rem',
    }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Title */}
          <div style={{
            fontWeight: 600, color: '#1e293b', fontSize: 14,
            lineHeight: 1.5, marginBottom: 6,
            fontFamily: isBangla ? 'Noto Sans Bengali, sans-serif' : 'inherit',
          }}>
            {title}
          </div>

          {/* Alternate title */}
          {isBangla && doc.title_en && (
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>
              {doc.title_en}
            </div>
          )}

          {/* Tags row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: 8 }}>
            {doc.circular_ref && (
              <span className="tag" style={{ fontSize: 11 }}>{doc.circular_ref}</span>
            )}
            <span className="tag tag-grey" style={{ fontSize: 11 }}>{doc.issuing_body}</span>
            {doc.department && doc.department !== doc.issuing_body && (
              <span style={{
                background: '#dbeafe', color: '#1e40af',
                fontSize: 11, fontWeight: 600,
                padding: '0.1rem 0.5rem', borderRadius: 999,
              }}>{doc.department}</span>
            )}
            <span className="tag tag-grey" style={{ fontSize: 11 }}>
              {formatDate(doc.issue_date)}
            </span>
            <span className={`tag ${doc.status === 'active' ? 'tag-green' : 'tag-red'}`}
                  style={{ fontSize: 11 }}>
              {doc.status === 'active' ? 'Active' : 'Superseded'}
            </span>
            <SourceBadge source={doc._source} />
          </div>

          {/* Topic tags */}
          {doc.topic_tags && doc.topic_tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {doc.topic_tags.slice(0, 4).map(tag => (
                <span key={tag} style={{
                  background: '#f8fafc', color: '#64748b',
                  fontSize: 11, padding: '0.1rem 0.5rem',
                  borderRadius: 999, border: '1px solid #e2e8f0',
                }}>{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
          <a href={doc.primary_url} target="_blank" rel="noopener noreferrer"
            style={{
              background: '#1d4ed8', color: 'white', fontSize: 12,
              fontWeight: 600, padding: '0.4rem 0.875rem', borderRadius: 6,
              textDecoration: 'none', textAlign: 'center', whiteSpace: 'nowrap',
            }}>
            View PDF
          </a>
          <Link href={`/ask?q=${encodeURIComponent('Tell me about ' + (doc.circular_ref || doc.title_en))}`}
            style={{
              background: 'white', color: '#7c3aed', fontSize: 12,
              fontWeight: 600, padding: '0.4rem 0.875rem', borderRadius: 6,
              textDecoration: 'none', textAlign: 'center', whiteSpace: 'nowrap',
              border: '1px solid #e2e8f0',
            }}>
            Ask AI
          </Link>
        </div>
      </div>
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const [query,       setQuery]       = useState(searchParams.get('q') || '');
  const [mode,        setMode]        = useState<SearchMode>('hybrid');
  const [body,        setBody]        = useState('');
  const [dept,        setDept]        = useState('');
  const [dateFrom,    setDateFrom]    = useState('');
  const [dateTo,      setDateTo]      = useState('');
  const [result,      setResult]      = useState<SearchResult | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { setQuery(q); doSearch(q); }
  }, []);

  async function doSearch(q?: string) {
    const text = (q || query).trim();
    if (!text || loading) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({ q: text, mode, limit: '20' });
      if (body)     params.set('issuing_body', body);
      if (dept)     params.set('department',   dept);
      if (dateFrom) params.set('date_from',    dateFrom);
      if (dateTo)   params.set('date_to',      dateTo);

      const res  = await fetch(`${API_URL}/api/v1/search/?${params}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 950, margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Header */}
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>
        Smart Search
      </h1>

      {/* Search Bar */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            placeholder="Search using natural language e.g. 'loan default rules for banks'..."
            style={{
              flex: 1, padding: '0.875rem 1.25rem',
              border: '1px solid #e2e8f0', borderRadius: 10,
              fontSize: 15, color: '#1e293b', outline: 'none',
              fontFamily: 'Noto Sans Bengali, system-ui, sans-serif',
            }}
          />
          <button onClick={() => doSearch()} className="btn-primary"
                  style={{ whiteSpace: 'nowrap', padding: '0.875rem 1.75rem' }}>
            Search
          </button>
        </div>

        {/* Mode + Filter Row */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>

          {/* Search Mode */}
          <div style={{
            display: 'flex', background: '#f1f5f9',
            padding: '0.25rem', borderRadius: 8, gap: '0.25rem',
          }}>
            {([
              { v: 'hybrid',   l: '🔀 Hybrid',   tip: 'AI + Keyword (Recommended)' },
              { v: 'semantic', l: '🧠 AI Search', tip: 'Finds related concepts'     },
              { v: 'keyword',  l: '🔤 Keyword',   tip: 'Exact keyword matching'     },
            ] as { v: SearchMode; l: string; tip: string }[]).map(opt => (
              <button key={opt.v} onClick={() => setMode(opt.v)} title={opt.tip}
                style={{
                  padding: '0.35rem 0.875rem', borderRadius: 6, border: 'none',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: mode === opt.v ? '#1d4ed8' : 'transparent',
                  color:      mode === opt.v ? 'white'   : '#64748b',
                }}>
                {opt.l}
              </button>
            ))}
          </div>

          {/* Filter Toggle */}
          <button onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '0.4rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0',
              background: showFilters ? '#eff6ff' : 'white',
              color: showFilters ? '#1d4ed8' : '#64748b',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
            ⚙ Filters {showFilters ? '▲' : '▼'}
          </button>

          {/* Active filter indicators */}
          {body && (
            <span style={{ fontSize: 12, background: '#dbeafe', color: '#1e40af',
                           padding: '0.2rem 0.625rem', borderRadius: 999, fontWeight: 600 }}>
              {body} ✕
            </span>
          )}
          {dept && (
            <span style={{ fontSize: 12, background: '#dbeafe', color: '#1e40af',
                           padding: '0.2rem 0.625rem', borderRadius: 999, fontWeight: 600 }}>
              {dept} ✕
            </span>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div style={{
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: 10, padding: '1rem', marginTop: '0.75rem',
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem',
          }}>

            {/* Issuing Body */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                Issuing Body
              </label>
              <select value={body} onChange={e => setBody(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 6,
                         border: '1px solid #e2e8f0', fontSize: 13, color: '#374151' }}>
                <option value="">All Bodies</option>
                {ISSUING_BODIES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Department */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                BB Department
              </label>
              <select value={dept} onChange={e => setDept(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 6,
                         border: '1px solid #e2e8f0', fontSize: 13, color: '#374151' }}>
                <option value="">All Departments</option>
                {BB_DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                From Date
              </label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 6,
                         border: '1px solid #e2e8f0', fontSize: 13, color: '#374151' }} />
            </div>

            {/* Date To */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                To Date
              </label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 6,
                         border: '1px solid #e2e8f0', fontSize: 13, color: '#374151' }} />
            </div>

            {/* Clear Filters */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => { setBody(''); setDept(''); setDateFrom(''); setDateTo(''); }}
                style={{ fontSize: 12, color: '#dc2626', background: 'none',
                         border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sample Queries */}
      {!result && !loading && (
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8',
                      textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Try these searches
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {SAMPLE_QUERIES.map(q => (
              <button key={q} onClick={() => { setQuery(q); doSearch(q); }}
                style={{
                  background: '#eff6ff', color: '#1d4ed8', border: 'none',
                  padding: '0.4rem 0.875rem', borderRadius: 8,
                  cursor: 'pointer', fontSize: 13,
                }}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔍</div>
          <p style={{ fontWeight: 600 }}>
            {mode === 'semantic' ? 'Running AI semantic search...' : 'Searching...'}
          </p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div>
          {/* Results summary */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem',
          }}>
            <div>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>
                {result.total} results
              </span>
              <span style={{ color: '#64748b', fontSize: 13, marginLeft: 8 }}>
                for &quot;{result.query}&quot;
              </span>
              {result.mode === 'hybrid' && (
                <span style={{ color: '#94a3b8', fontSize: 12, marginLeft: 8 }}>
                  ({result.semantic_count} AI + {result.keyword_count} keyword)
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: 12 }}>
              <span style={{ color: '#94a3b8' }}>Mode:</span>
              <span style={{
                background: '#eff6ff', color: '#1d4ed8',
                padding: '0.2rem 0.625rem', borderRadius: 999, fontWeight: 600,
              }}>
                {result.mode === 'hybrid' ? '🔀 Hybrid' :
                 result.mode === 'semantic' ? '🧠 AI Search' : '🔤 Keyword'}
              </span>
            </div>
          </div>

          {/* No results */}
          {result.items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <p style={{ color: '#64748b', fontWeight: 600 }}>No documents found</p>
              <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 8 }}>
                Try different keywords or{' '}
                <Link href="/ask" style={{ color: '#1d4ed8' }}>ask the AI assistant</Link>
              </p>
            </div>
          )}

          {/* Document cards */}
          {result.items.map(doc => <DocCard key={doc.id} doc={doc} />)}

          {/* Ask AI CTA */}
          {result.items.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #1d4ed8, #1e3a8a)',
              borderRadius: 12, padding: '1.5rem',
              textAlign: 'center', color: 'white', marginTop: '1.5rem',
            }}>
              <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
                Want a detailed answer about these regulations?
              </p>
              <Link href={`/ask?q=${encodeURIComponent(query)}`}
                style={{
                  background: 'white', color: '#1d4ed8', fontWeight: 700,
                  padding: '0.625rem 1.5rem', borderRadius: 8,
                  textDecoration: 'none', display: 'inline-block', fontSize: 14,
                }}>
                Ask AI Assistant →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}