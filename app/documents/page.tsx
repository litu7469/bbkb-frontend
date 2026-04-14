'use client';

import { useState, useEffect, useCallback } from 'react';
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
  language:         string | null;
}

const ISSUING_BODIES = ['BB', 'NBR', 'BSEC', 'BFIU', 'Ministry of Law', 'International'];

const BB_DEPARTMENTS = [
  'BRPD','DOS','DFIM','FEPD','BFIU','PSD','MPD','SME',
  'SDAD','DMD','SPCD','SFD','FEOD','FEID','ACD','CIB',
  'FICSD','ISMD','FSD','FININCLD','GBCSRD',
];

const TOPIC_TAGS = [
  'loan classification','capital adequacy','AML/CFT','KYC',
  'foreign exchange','mobile banking','digital banking',
  'SME','agricultural credit','Islamic banking',
  'interest rate','monetary policy','payment system',
  'financial inclusion','green banking','excise duty',
  'VAT','income tax','customs','IPO','stock exchange',
  'margin loan','corporate governance',
  'negotiable instruments', 'cheque dishonour', 'loan recovery',
  'mortgage', 'collateral', 'bankruptcy', 'limitation period',
  'UCP 600', 'letter of credit', 'bank guarantee', 'URDG',
  'Incoterms', 'Basel III', 'FATF', 'trade finance',
  'contract', 'company law', 'stamp duty',
];

const SORT_OPTIONS = [
  { value: 'date_desc', label: '📅 Newest First' },
  { value: 'date_asc',  label: '📅 Oldest First' },
  { value: 'title_asc', label: '🔤 Title A–Z'    },
];

function formatDate(d: string) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  } catch { return d; }
}

function DocCard({ doc }: { doc: Document }) {
  const hasBangla = doc.title_bn && doc.title_bn.length > 3;
  return (
    <div style={{
      background: 'white', borderRadius: 12,
      padding: '1.125rem 1.25rem',
      border: '1px solid #f1f5f9',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      marginBottom: '0.5rem',
    }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* English title */}
          <div style={{
            fontWeight: 600, color: '#1e293b',
            fontSize: 14, lineHeight: 1.5, marginBottom: 3,
          }}>
            {doc.title_en}
          </div>

          {/* Bangla title */}
          {hasBangla && (
            <div style={{
              fontSize: 13, color: '#64748b', marginBottom: 6,
              fontFamily: 'Noto Sans Bengali, sans-serif',
            }}>
              {doc.title_bn}
            </div>
          )}

          {/* Tags row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: 7 }}>
            {doc.circular_ref && (
              <span className="tag" style={{ fontSize: 11 }}>{doc.circular_ref}</span>
            )}
            <span className="tag tag-grey" style={{ fontSize: 11 }}>{doc.issuing_body}</span>
            {doc.department && doc.department !== doc.issuing_body && (
              <span style={{
                background: '#dbeafe', color: '#1e40af', fontSize: 11,
                fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: 999,
              }}>{doc.department}</span>
            )}
            <span className="tag tag-grey" style={{ fontSize: 11 }}>
              {formatDate(doc.issue_date)}
            </span>
            <span className={`tag ${doc.status === 'active' ? 'tag-green' : 'tag-red'}`}
                  style={{ fontSize: 11 }}>
              {doc.status === 'active' ? '✓ Active' : 'Superseded'}
            </span>
            {doc.language && doc.language !== 'english' && (
              <span className="tag" style={{
                fontSize: 11, background: '#fef3c7', color: '#92400e',
              }}>বাংলা</span>
            )}
          </div>

          {/* Topic pills */}
          {doc.topic_tags && doc.topic_tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
              {doc.topic_tags.slice(0, 5).map(tag => (
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
        <div style={{
          display: 'flex', flexDirection: 'column',
          gap: '0.4rem', flexShrink: 0,
        }}>
          <a href={doc.primary_url} target="_blank" rel="noopener noreferrer"
            style={{
              background: '#1d4ed8', color: 'white',
              fontSize: 12, fontWeight: 700,
              padding: '0.4rem 0.875rem', borderRadius: 6,
              textDecoration: 'none', textAlign: 'center',
              whiteSpace: 'nowrap',
            }}>
            📄 View
          </a>
          <Link href={`/ask?q=${encodeURIComponent(doc.circular_ref || doc.title_en)}`}
            style={{
              background: 'white', color: '#7c3aed',
              fontSize: 12, fontWeight: 700,
              padding: '0.4rem 0.875rem', borderRadius: 6,
              textDecoration: 'none', textAlign: 'center',
              border: '1px solid #e2e8f0', whiteSpace: 'nowrap',
            }}>
            🤖 Ask AI
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const [body,        setBody]        = useState('');
  const [dept,        setDept]        = useState('');
  const [status,      setStatus]      = useState('');
  const [yearFrom,    setYearFrom]    = useState('');
  const [yearTo,      setYearTo]      = useState('');
  const [activeTopic, setActiveTopic] = useState('');
  const [sortBy,      setSortBy]      = useState('date_desc');
  const [showFilters, setShowFilters] = useState(false);
  const [searchText,  setSearchText]  = useState('');
  const [documents,   setDocuments]   = useState<Document[]>([]);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [loading,     setLoading]     = useState(true);
  const PAGE_SIZE = 20;

  // Read URL params on initial load
  useEffect(() => {
    const params    = new URLSearchParams(window.location.search);
    const bodyParam = params.get('body');
    if (bodyParam) setBody(bodyParam);
  }, []);

  const fetchDocuments = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit',  String(PAGE_SIZE));
      params.set('offset', String((p - 1) * PAGE_SIZE));
      if (body)        params.set('issuing_body', body);
      if (dept)        params.set('department',   dept);
      if (status)      params.set('status',       status);
      if (activeTopic) params.set('topic',        activeTopic);
      if (yearFrom)    params.set('date_from',    `${yearFrom}-01-01`);
      if (yearTo)      params.set('date_to',      `${yearTo}-12-31`);
      if (sortBy === 'date_desc') params.set('order', 'issue_date.desc');
      if (sortBy === 'date_asc')  params.set('order', 'issue_date.asc');
      if (sortBy === 'title_asc') params.set('order', 'title_en.asc');

      const res  = await fetch(`${API_URL}/api/v1/documents/?${params}`);
      const data = await res.json();
      setDocuments(data.documents || data.items || []);
      setTotal(data.total || 0);
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [body, dept, status, activeTopic, yearFrom, yearTo, sortBy]);

  useEffect(() => { fetchDocuments(1); }, [fetchDocuments]);

  function applyFilters() {
    fetchDocuments(1);
    setShowFilters(false);
  }

  function clearFilters() {
    setBody(''); setDept(''); setStatus('');
    setYearFrom(''); setYearTo(''); setActiveTopic('');
  }

  const activeFilterCount = [body, dept, status, activeTopic, yearFrom, yearTo]
    .filter(Boolean).length;

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Client-side quick search within loaded page
  const filtered = searchText.trim()
    ? documents.filter(d =>
        d.title_en?.toLowerCase().includes(searchText.toLowerCase()) ||
        d.circular_ref?.toLowerCase().includes(searchText.toLowerCase()) ||
        (d.title_bn || '').includes(searchText)
      )
    : documents;

  // Correct stats
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end   = Math.min(page * PAGE_SIZE, total);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>
          Document Library
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          {total > 0
            ? `${total.toLocaleString()} regulatory circulars from BB, NBR, BSEC and BFIU`
            : 'Loading documents...'}
        </p>
      </div>

      {/* Issuing Body Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {['', ...ISSUING_BODIES].map(b => (
          <button key={b} onClick={() => setBody(b)}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: 8,
              border: '1.5px solid',
              borderColor: body === b ? '#1d4ed8' : '#e2e8f0',
              background:  body === b ? '#1d4ed8' : 'white',
              color:       body === b ? 'white'   : '#475569',
              fontWeight:  body === b ? 700       : 500,
              fontSize: 14, cursor: 'pointer', transition: 'all 0.15s',
            }}>
            {b || 'All Bodies'}
          </button>
        ))}
      </div>

      {/* Search + Filter + Sort row */}
      <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="Quick search by title or reference..."
          style={{
            flex: 1, minWidth: 200,
            padding: '0.625rem 1rem',
            border: '1.5px solid #e2e8f0',
            borderRadius: 8, fontSize: 14,
            color: '#1e293b', outline: 'none', background: 'white',
          }}
        />
        <button onClick={() => setShowFilters(!showFilters)}
          style={{
            padding: '0.625rem 1.125rem', borderRadius: 8,
            border: '1.5px solid',
            borderColor: activeFilterCount > 0 ? '#1d4ed8' : '#e2e8f0',
            background:  activeFilterCount > 0 ? '#eff6ff' : 'white',
            color:       activeFilterCount > 0 ? '#1d4ed8' : '#64748b',
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
          ⚙ Filters
          {activeFilterCount > 0 && (
            <span style={{
              background: '#1d4ed8', color: 'white',
              borderRadius: '50%', width: 20, height: 20,
              fontSize: 11, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{activeFilterCount}</span>
          )}
        </button>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="sort-select">
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="filter-chips">
          {body        && <button className="filter-chip" onClick={() => setBody('')}>{body} ✕</button>}
          {dept        && <button className="filter-chip" onClick={() => setDept('')}>{dept} ✕</button>}
          {status      && <button className="filter-chip" onClick={() => setStatus('')}>
            {status === 'active' ? '✓ Active' : 'Superseded'} ✕
          </button>}
          {activeTopic && <button className="filter-chip" onClick={() => setActiveTopic('')}>{activeTopic} ✕</button>}
          {yearFrom    && <button className="filter-chip" onClick={() => setYearFrom('')}>From {yearFrom} ✕</button>}
          {yearTo      && <button className="filter-chip" onClick={() => setYearTo('')}>To {yearTo} ✕</button>}
          <button className="filter-clear" onClick={clearFilters}>✕ Clear all</button>
        </div>
      )}

      {/* Advanced Filter Panel */}
      {showFilters && (
        <div className="filter-panel" style={{ marginBottom: '1rem' }}>
          <div className="filter-grid">

            <div>
              <label className="filter-label">🏢 BB Department</label>
              <select value={dept} onChange={e => setDept(e.target.value)}
                className="filter-select">
                <option value="">All Departments</option>
                {BB_DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="filter-label">📌 Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="filter-select">
                <option value="">All Status</option>
                <option value="active">✓ Active Only</option>
                <option value="superseded">Superseded Only</option>
              </select>
            </div>

            <div>
              <label className="filter-label">📅 Year From</label>
              <input
                type="number"
                value={yearFrom}
                onChange={e => setYearFrom(e.target.value)}
                placeholder="e.g. 2015"
                min="1990" max="2026"
                className="filter-input"
              />
            </div>

            <div>
              <label className="filter-label">📅 Year To</label>
              <input
                type="number"
                value={yearTo}
                onChange={e => setYearTo(e.target.value)}
                placeholder="e.g. 2026"
                min="1990" max="2026"
                className="filter-input"
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="filter-label">🏷 Topic / Category</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 6 }}>
                {TOPIC_TAGS.map(tag => (
                  <button key={tag}
                    className={`topic-pill ${activeTopic === tag ? 'active' : ''}`}
                    onClick={() => setActiveTopic(activeTopic === tag ? '' : tag)}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-actions">
              <button className="filter-clear" onClick={clearFilters}>
                ✕ Clear all filters
              </button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setShowFilters(false)}
                  style={{
                    fontSize: 13, fontWeight: 600,
                    background: 'white', color: '#64748b',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 8, padding: '0.5rem 1rem',
                    cursor: 'pointer',
                  }}>
                  Cancel
                </button>
                <button className="filter-apply" onClick={applyFilters}>
                  Apply Filters ✓
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Stats bar */}
      {!loading && (
        <div className="stats-bar">
          {total === 0 ? (
            <span>No documents found matching your filters</span>
          ) : searchText.trim() ? (
            <>
              <span>Found <strong>{filtered.length}</strong> matching &quot;{searchText}&quot;</span>
              <span style={{ color: '#7dd3fc' }}>·</span>
              <span>from <strong>{total.toLocaleString()}</strong> total</span>
            </>
          ) : (
            <>
              <span>Showing <strong>{start}–{end}</strong> of <strong>{total.toLocaleString()}</strong> documents</span>
              {body        && <><span style={{ color: '#7dd3fc' }}>·</span><span>Body: <strong>{body}</strong></span></>}
              {dept        && <><span style={{ color: '#7dd3fc' }}>·</span><span>Dept: <strong>{dept}</strong></span></>}
              {activeTopic && <><span style={{ color: '#7dd3fc' }}>·</span><span>Topic: <strong>{activeTopic}</strong></span></>}
              {(yearFrom || yearTo) && (
                <><span style={{ color: '#7dd3fc' }}>·</span>
                <span>Years: <strong>{yearFrom || '1990'}–{yearTo || '2026'}</strong></span></>
              )}
            </>
          )}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{
              background: '#f8fafc', borderRadius: 12,
              padding: '1.25rem', marginBottom: '0.5rem',
              border: '1px solid #f1f5f9',
            }}>
              <div style={{
                height: 16, background: '#e2e8f0', borderRadius: 4,
                width: '70%', marginBottom: 10,
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
              <div style={{
                height: 12, background: '#e2e8f0',
                borderRadius: 4, width: '40%',
              }} />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'white', borderRadius: 16,
          border: '1px solid #f1f5f9',
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📭</div>
          <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
            No documents found
          </p>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: '1.5rem' }}>
            Try adjusting your filters or search terms
          </p>
          <button onClick={clearFilters}
            style={{
              background: '#1d4ed8', color: 'white',
              border: 'none', borderRadius: 8,
              padding: '0.625rem 1.5rem',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>
            Clear All Filters
          </button>
        </div>
      )}

      {/* Document list */}
      {!loading && filtered.map(doc => <DocCard key={doc.id} doc={doc} />)}

      {/* Pagination */}
      {!loading && totalPages > 1 && !searchText.trim() && (
        <div style={{
          display: 'flex', justifyContent: 'center',
          alignItems: 'center', gap: '0.375rem',
          marginTop: '2rem', flexWrap: 'wrap',
        }}>
          {page > 2 && (
            <button onClick={() => fetchDocuments(1)}
              style={{
                padding: '0.5rem 0.875rem', borderRadius: 8,
                border: '1.5px solid #e2e8f0', background: 'white',
                color: '#374151', cursor: 'pointer', fontSize: 13,
              }}>
              « First
            </button>
          )}

          <button onClick={() => fetchDocuments(page - 1)} disabled={page === 1}
            style={{
              padding: '0.5rem 0.875rem', borderRadius: 8,
              border: '1.5px solid #e2e8f0',
              background: page === 1 ? '#f8fafc' : 'white',
              color:      page === 1 ? '#cbd5e1' : '#374151',
              cursor:     page === 1 ? 'not-allowed' : 'pointer',
              fontWeight: 600, fontSize: 13,
            }}>
            ← Prev
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let p = i + 1;
            if (totalPages > 5) {
              if      (page <= 3)               p = i + 1;
              else if (page >= totalPages - 2)  p = totalPages - 4 + i;
              else                              p = page - 2 + i;
            }
            if (p < 1 || p > totalPages) return null;
            return (
              <button key={p} onClick={() => fetchDocuments(p)}
                style={{
                  padding: '0.5rem 0.875rem', borderRadius: 8,
                  border: '1.5px solid',
                  borderColor: p === page ? '#1d4ed8' : '#e2e8f0',
                  background:  p === page ? '#1d4ed8' : 'white',
                  color:       p === page ? 'white'   : '#374151',
                  fontWeight:  p === page ? 800       : 500,
                  cursor: 'pointer', fontSize: 13, minWidth: 36,
                }}>
                {p}
              </button>
            );
          })}

          <button onClick={() => fetchDocuments(page + 1)} disabled={page === totalPages}
            style={{
              padding: '0.5rem 0.875rem', borderRadius: 8,
              border: '1.5px solid #e2e8f0',
              background: page === totalPages ? '#f8fafc' : 'white',
              color:      page === totalPages ? '#cbd5e1' : '#374151',
              cursor:     page === totalPages ? 'not-allowed' : 'pointer',
              fontWeight: 600, fontSize: 13,
            }}>
            Next →
          </button>

          {page < totalPages - 1 && (
            <button onClick={() => fetchDocuments(totalPages)}
              style={{
                padding: '0.5rem 0.875rem', borderRadius: 8,
                border: '1.5px solid #e2e8f0', background: 'white',
                color: '#374151', cursor: 'pointer', fontSize: 13,
              }}>
              Last »
            </button>
          )}

          <span style={{ fontSize: 13, color: '#94a3b8', marginLeft: '0.5rem' }}>
            Page {page} of {totalPages}
          </span>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}