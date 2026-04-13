const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Documents ────────────────────────────────────────────────
export async function searchDocuments(query: string) {
  const res = await fetch(
    `${API_URL}/api/v1/documents/search?q=${encodeURIComponent(query)}`
  );
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function getDocuments(params: {
  issuing_body?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
} = {}) {
  const query = new URLSearchParams();
  if (params.issuing_body) query.set('issuing_body', params.issuing_body);
  if (params.category)     query.set('category',     params.category);
  if (params.status)       query.set('status',        params.status || 'active');
  if (params.page)         query.set('page',           String(params.page));
  if (params.limit)        query.set('limit',          String(params.limit || 20));

  const res = await fetch(`${API_URL}/api/v1/documents/?${query}`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function getDocument(id: string) {
  const res = await fetch(`${API_URL}/api/v1/documents/${id}`);
  if (!res.ok) throw new Error('Document not found');
  return res.json();
}

// ── AI Query ─────────────────────────────────────────────────
export async function askQuestion(queryText: string) {
  const res = await fetch(`${API_URL}/api/v1/query/`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ query_text: queryText, language: 'en' }),
  });
  if (!res.ok) throw new Error('Query failed');
  return res.json();
}

// ── Health ───────────────────────────────────────────────────
export async function checkHealth() {
  const res = await fetch(`${API_URL}/health`);
  return res.json();
}