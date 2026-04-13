'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

type Language = 'auto' | 'en' | 'bn';

interface Citation {
  document_id:  string;
  title_en:     string;
  title_bn:     string | null;
  circular_ref: string | null;
  issuing_body: string;
  issue_date:   string;
  primary_url:  string;
  status:       string;
  language:     string | null;
}

interface QueryResult {
  answer:                  string;
  citations:               Citation[];
  model_used:              string;
  latency_ms:              number;
  query_language:          string;
  disclaimer:              string;
  has_superseded_citation: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const SAMPLES_EN = [
  'What is the single borrower exposure limit for banks?',
  'What are the AML requirements for banks in Bangladesh?',
  'What documents are needed to open an NRB account?',
  'What are the capital adequacy requirements under Basel III?',
  'What are the guidelines for mobile financial services?',
  'What is the loan rescheduling policy?',
];

const SAMPLES_BN = [
  'ঋণ শ্রেণীবিন্যাসের নির্দেশিকা কী?',
  'একক ঋণগ্রহীতার সর্বোচ্চ ঋণসীমা কত?',
  'মোবাইল ব্যাংকিং বিধিমালা কী?',
  'এনআরবি অ্যাকাউন্ট খুলতে কী কী কাগজপত্র লাগে?',
  'সন্দেহজনক লেনদেন রিপোর্ট কীভাবে করতে হয়?',
  'বাংলাদেশ ব্যাংকের মূলধন পর্যাপ্ততার নিয়ম কী?',
];

function AskContent() {
  const searchParams = useSearchParams();
  const [query,   setQuery]   = useState('');
  const [lang,    setLang]    = useState<Language>('auto');
  const [result,  setResult]  = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { setQuery(q); submitQuery(q); }
  }, []);

  async function submitQuery(overrideText?: string) {
    const text = (overrideText || query).trim();
    if (!text || loading) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/query/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query_text: text, language: lang }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setResult(await res.json());
    } catch (err) {
      console.error(err);
      setError('Failed to get answer. Please make sure the backend is running at localhost:8000');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitQuery(); }
  }

  function reset() { setResult(null); setQuery(''); setError(''); }

  const isBn = result?.query_language === 'bn';

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '2.5rem 1rem' }}>

      {/* Header */}
      <div className="center" style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🤖</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
          Ask the AI Assistant
        </h1>
        <p style={{ color: '#64748b', fontSize: 15, maxWidth: 520, margin: '0 auto' }}>
          Ask in <strong>English</strong> or <strong>বাংলা</strong> — get instant answers
          with citations from real Bangladesh Bank circulars.
        </p>
      </div>

      {/* Form */}
      <div className="card mb-4">
        <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <label style={{ fontWeight: 700, color: '#1e293b', fontSize: 14 }}>
            Your Question / আপনার প্রশ্ন
          </label>
          <div className="lang-toggle">
            {(['auto', 'en', 'bn'] as Language[]).map(l => (
              <button key={l} type="button" onClick={() => setLang(l)}
                className={`lang-btn${lang === l ? ' active' : ''}`}>
                {l === 'auto' ? 'Auto' : l === 'en' ? 'English' : 'বাংলা'}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={lang === 'bn' ? 'যেমন: বাংলাদেশে একক ঋণগ্রহীতার ঋণসীমা কত?' : 'e.g. What is the single borrower exposure limit?'}
          rows={3}
          className="bangla"
          style={{ width: '100%', padding: '0.875rem 1rem', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 15, color: '#1e293b', resize: 'none', outline: 'none', lineHeight: 1.6, boxSizing: 'border-box' }}
        />

        <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: '0.875rem' }}>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>{query.length}/2000 · Press Enter to submit</span>
          <button onClick={() => submitQuery()} disabled={!query.trim() || loading} className="btn-primary">
            {loading ? 'Searching...' : 'Ask Question'}
          </button>
        </div>
      </div>

      {/* Sample Questions */}
      {!result && !loading && (
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Try in English
          </p>
          <div className="flex flex-wrap gap-2" style={{ marginBottom: '1rem' }}>
            {SAMPLES_EN.map(q => (
              <button key={q} onClick={() => { setQuery(q); setResult(null); }} className="sample-btn sample-btn-en">{q}</button>
            ))}
          </div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            বাংলায় জিজ্ঞেস করুন
          </p>
          <div className="flex flex-wrap gap-2">
            {SAMPLES_BN.map(q => (
              <button key={q} onClick={() => { setQuery(q); setResult(null); }} className="sample-btn sample-btn-bn">{q}</button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && <div className="alert-error">&#9888; {error}</div>}

      {/* Loading */}
      {loading && (
        <div className="card center" style={{ padding: '3rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>&#128269;</div>
          <p style={{ color: '#475569', fontWeight: 600 }}>Searching knowledge base and generating answer...</p>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 6 }}>Usually takes 1&#8211;3 seconds</p>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div>

          {/* Superseded Warning */}
          {result.has_superseded_citation && (
            <div className="alert-warning bangla">
              &#9888;&nbsp;{isBn ? 'একটি বা একাধিক উদ্ধৃত দলিল পুরানো হতে পারে।' : 'One or more cited documents may be superseded. Please verify.'}
            </div>
          )}

          {/* Answer Card */}
          <div className="card mb-4">
            <div className="flex" style={{ alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.25rem' }}>&#128161;</span>
              <h2 style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.1rem', margin: 0 }} className="bangla">
                {isBn ? 'উত্তর' : 'Answer'}
              </h2>
              <span className={`tag ${isBn ? 'tag-green bangla' : ''}`}>
                {isBn ? 'বাংলা' : 'English'}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8' }}>
                {result.latency_ms}ms
              </span>
            </div>
            <p className="bangla" style={{ color: '#374151', lineHeight: 1.8, fontSize: 15, whiteSpace: 'pre-wrap', margin: 0 }}>
              {result.answer}
            </p>
          </div>

          {/* Citations */}
          {result.citations.length > 0 && (
            <div className="card mb-4">
              <h2 className="bangla" style={{ fontWeight: 700, color: '#1e293b', marginBottom: '1rem', fontSize: '1rem' }}>
                &#128196;&nbsp;{isBn ? `উৎস দলিল (${result.citations.length}টি)` : `Source Documents (${result.citations.length})`}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {result.citations.map((c, i) => (
                  <div key={c.document_id} className="citation-card">
                    <div className="citation-number">{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>

                      {/* Title */}
                      <div className="bangla" style={{ fontWeight: 600, color: '#1e293b', fontSize: 14, marginBottom: 4 }}>
                        {isBn && c.title_bn ? c.title_bn : c.title_en}
                      </div>

                      {/* Alternate title */}
                      {isBn && c.title_en && (
                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{c.title_en}</div>
                      )}
                      {!isBn && c.title_bn && (
                        <div className="bangla" style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{c.title_bn}</div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2" style={{ marginBottom: 8 }}>
                        {c.circular_ref && <span className="tag">{c.circular_ref}</span>}
                        <span className="tag tag-grey">{c.issuing_body}</span>
                        <span className="tag tag-grey">{c.issue_date}</span>
                        <span className={`tag ${c.status === 'active' ? 'tag-green' : 'tag-red'}`}>
                          {c.status === 'active' ? 'Active' : 'Superseded'}
                        </span>
                        {c.language && c.language !== 'english' && (
                          <span className="tag tag-bangla">বাংলা</span>
                        )}
                      </div>

                      {/* Link */}
                      <a href={c.primary_url} target="_blank" rel="noopener noreferrer"
                        className="bangla"
                        style={{ color: '#1d4ed8', fontSize: 13, textDecoration: 'underline', wordBreak: 'break-all' }}>
                        {isBn ? 'মূল দলিল দেখুন' : 'View original document'}
                      </a>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Citations */}
          {result.citations.length === 0 && (
            <div className="alert-warning bangla">
              &#9888;&nbsp;{isBn ? 'এই বিষয়ে কোনো দলিল পাওয়া যায়নি।' : 'No matching documents found. Try rephrasing your question.'}
            </div>
          )}

          {/* Disclaimer */}
          <div className="alert-info mb-4">&#8505;&nbsp;{result.disclaimer}</div>

          {/* Action Buttons */}
          <div className="flex center" style={{ gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={reset} className="btn-secondary bangla">
              {isBn ? 'নতুন প্রশ্ন করুন' : 'Ask Another Question'}
            </button>
            <a href="/documents" className="btn-secondary bangla">
              {isBn ? 'সব দলিল দেখুন' : 'Browse Documents'}
            </a>
          </div>

        </div>
      )}
    </div>
  );
}

export default function AskPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading...</div>}>
      <AskContent />
    </Suspense>
  );
}