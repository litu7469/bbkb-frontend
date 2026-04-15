'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-b1ff6.up.railway.app';

function StatCard({ label, value, color = '#0D2B5E', sub }: {
  label: string; value: string | number; color?: string; sub?: string;
}) {
  return (
    <div style={{
      background: 'white', borderRadius: 12, padding: '1.25rem',
      border: '1px solid #f1f5f9',
    }}>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {sub && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function AdminPage() {
  const [session,   setSession]   = useState<any>(null);
  const [stats,     setStats]     = useState<any>(null);
  const [queries,   setQueries]   = useState<any[]>([]);
  const [jobs,      setJobs]      = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [running,   setRunning]   = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'queries' | 'scrapers' | 'documents'>('overview');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = '/admin/login';
      } else {
        setSession(session);
        loadData(session.access_token);
      }
    });
  }, []);

  async function loadData(token: string) {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, queriesRes, jobsRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/admin/stats`,        { headers }),
        fetch(`${API_URL}/api/v1/admin/queries`,       { headers }),
        fetch(`${API_URL}/api/v1/admin/scraper-jobs`,  { headers }),
      ]);
      const [statsData, queriesData, jobsData] = await Promise.all([
        statsRes.json(), queriesRes.json(), jobsRes.json(),
      ]);
      setStats(statsData);
      setQueries(queriesData.queries || []);
      setJobs(jobsData.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function runScraper(source: string) {
    if (!session || running) return;
    setRunning(source);
    try {
      await fetch(`${API_URL}/api/v1/admin/scraper/run?source=${source}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      setTimeout(() => {
        loadData(session.access_token);
        setRunning(null);
      }, 3000);
    } catch (err) {
      console.error(err);
      setRunning(null);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  }

  function formatDate(d: string) {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
      Loading dashboard...
    </div>
  );

  const SCRAPERS = [
    { key: 'bb',    label: 'Bangladesh Bank',  color: '#0D2B5E' },
    { key: 'nbr',   label: 'NBR',              color: '#16a34a' },
    { key: 'bsec',  label: 'BSEC',             color: '#7c3aed' },
    { key: 'embed', label: 'Re-embed New Docs', color: '#b45309' },
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '1.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem',
        }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0D2B5E', margin: 0 }}>
              Admin Dashboard
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: '2px 0 0' }}>
              BBKB — Bangladesh Banking Knowledge Base
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%' }} />
              <span style={{ fontSize: 12, color: '#64748b' }}>Backend online</span>
            </div>
            <button onClick={() => loadData(session?.access_token)}
              style={{
                fontSize: 12, fontWeight: 600,
                background: 'white', color: '#0D2B5E',
                border: '1.5px solid #e2e8f0', borderRadius: 8,
                padding: '6px 14px', cursor: 'pointer',
              }}>
              Refresh
            </button>
            <button onClick={handleLogout}
              style={{
                fontSize: 12, fontWeight: 600,
                background: '#fee2e2', color: '#dc2626',
                border: 'none', borderRadius: 8,
                padding: '6px 14px', cursor: 'pointer',
              }}>
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {(['overview', 'queries', 'scrapers', 'documents'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.5rem 1.25rem', borderRadius: 8,
                border: '1.5px solid',
                borderColor: activeTab === tab ? '#0D2B5E' : '#e2e8f0',
                background:  activeTab === tab ? '#0D2B5E' : 'white',
                color:       activeTab === tab ? 'white'   : '#475569',
                fontWeight:  activeTab === tab ? 700       : 500,
                fontSize: 13, cursor: 'pointer', textTransform: 'capitalize',
              }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '0.875rem', marginBottom: '1.5rem',
            }}>
              <StatCard label="Total Documents"  value={stats.total_documents}  color="#0D2B5E" />
              <StatCard label="Total Embeddings" value={stats.total_embeddings} color="#1d4ed8" />
              <StatCard label="New Today"        value={stats.new_today}        color="#16a34a" />
              <StatCard label="Queries Today"    value={stats.queries_today}    color="#7c3aed" />
              <StatCard label="Total Queries"    value={stats.total_queries}    color="#b45309" />
            </div>

            {/* By body */}
            <div style={{
              background: 'white', borderRadius: 12,
              padding: '1.25rem', border: '1px solid #f1f5f9',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
                Documents by Source
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {Object.entries(stats.by_body || {}).map(([body, count]: [string, any]) => (
                  <div key={body}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: 13, marginBottom: 4,
                    }}>
                      <span style={{ color: '#374151', fontWeight: 500 }}>{body}</span>
                      <span style={{ color: '#64748b' }}>{count.toLocaleString()}</span>
                    </div>
                    <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3 }}>
                      <div style={{
                        height: 6, borderRadius: 3, background: '#0D2B5E',
                        width: `${Math.round((count / stats.total_documents) * 100)}%`,
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Queries Tab */}
        {activeTab === 'queries' && (
          <div style={{
            background: 'white', borderRadius: 12,
            padding: '1.25rem', border: '1px solid #f1f5f9',
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
              Recent AI Queries ({queries.length})
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #f1f5f9' }}>
                    <th style={{ textAlign: 'left', padding: '8px 12px', color: '#64748b', fontWeight: 600 }}>Query</th>
                    <th style={{ textAlign: 'left', padding: '8px 12px', color: '#64748b', fontWeight: 600 }}>Lang</th>
                    <th style={{ textAlign: 'left', padding: '8px 12px', color: '#64748b', fontWeight: 600 }}>Latency</th>
                    <th style={{ textAlign: 'left', padding: '8px 12px', color: '#64748b', fontWeight: 600 }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {queries.map((q, i) => (
                    <tr key={q.id} style={{ borderBottom: i < queries.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                      <td style={{ padding: '8px 12px', color: '#1e293b', maxWidth: 400 }}>
                        <div style={{
                          overflow: 'hidden', textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap', fontFamily: q.query_language === 'bn' ? 'Noto Sans Bengali, sans-serif' : 'inherit',
                        }}>
                          {q.query_text}
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{
                          background: q.query_language === 'bn' ? '#fef3c7' : '#eff6ff',
                          color:      q.query_language === 'bn' ? '#92400e' : '#1e40af',
                          fontSize: 11, fontWeight: 700,
                          padding: '2px 8px', borderRadius: 999,
                        }}>
                          {q.query_language?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{
                          color: q.latency_ms < 2000 ? '#16a34a' : q.latency_ms < 4000 ? '#b45309' : '#dc2626',
                          fontWeight: 600,
                        }}>
                          {q.latency_ms ? `${(q.latency_ms / 1000).toFixed(1)}s` : '—'}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {formatDate(q.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Scrapers Tab */}
        {activeTab === 'scrapers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Scraper controls */}
            <div style={{
              background: 'white', borderRadius: 12,
              padding: '1.25rem', border: '1px solid #f1f5f9',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
                Run Scrapers
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {SCRAPERS.map(s => (
                  <button key={s.key}
                    onClick={() => runScraper(s.key)}
                    disabled={!!running}
                    style={{
                      padding: '0.875rem 1rem',
                      background: running === s.key ? '#f1f5f9' : s.color,
                      color: running === s.key ? '#94a3b8' : 'white',
                      border: 'none', borderRadius: 10,
                      fontWeight: 700, fontSize: 13, cursor: running ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}>
                    {running === s.key ? '⏳ Running...' : `▶ Run ${s.label}`}
                  </button>
                ))}
              </div>
              {running && (
                <div style={{
                  marginTop: '1rem', padding: '0.75rem 1rem',
                  background: '#eff6ff', borderRadius: 8,
                  fontSize: 13, color: '#1e40af',
                }}>
                  Scraper is running in the background. Page will refresh in 3 seconds...
                </div>
              )}
            </div>

            {/* Job history */}
            <div style={{
              background: 'white', borderRadius: 12,
              padding: '1.25rem', border: '1px solid #f1f5f9',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
                Scraper Job History
              </div>
              {jobs.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: 13 }}>No scraper jobs found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {jobs.map(job => (
                    <div key={job.id} style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', padding: '0.75rem 1rem',
                      background: job.status === 'completed' ? '#f0fdf4' : job.status === 'running' ? '#eff6ff' : '#fef2f2',
                      borderRadius: 8,
                      border: `1px solid ${job.status === 'completed' ? '#bbf7d0' : job.status === 'running' ? '#bfdbfe' : '#fecaca'}`,
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                          {job.source}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                          {formatDate(job.started_at)}
                          {job.docs_new !== null && ` · +${job.docs_new} new docs`}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                        background: job.status === 'completed' ? '#dcfce7' : job.status === 'running' ? '#dbeafe' : '#fee2e2',
                        color:      job.status === 'completed' ? '#15803d' : job.status === 'running' ? '#1e40af' : '#dc2626',
                      }}>
                        {job.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div style={{
            background: 'white', borderRadius: 12,
            padding: '1.25rem', border: '1px solid #f1f5f9',
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
              Recent Documents
            </div>
            <p style={{ fontSize: 13, color: '#64748b' }}>
              Use the public Documents page to browse and filter all documents.
              Admin document management (status updates, bulk actions) coming soon.
            </p>
            <a href="/documents" target="_blank"
              style={{
                display: 'inline-block', marginTop: '0.75rem',
                background: '#0D2B5E', color: 'white',
                fontSize: 13, fontWeight: 700,
                padding: '0.625rem 1.25rem', borderRadius: 8,
                textDecoration: 'none',
              }}>
              Open Documents Library →
            </a>
          </div>
        )}

      </div>
    </div>
  );
}