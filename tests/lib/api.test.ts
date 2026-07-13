import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  askQuestion,
  checkHealth,
  getDocument,
  getDocuments,
  searchDocuments,
} from '@/lib/api';

// `lib/api.ts` reads `process.env.NEXT_PUBLIC_API_URL` at module load time.
// No env var is set in the test environment, so the module falls back to
// the default base URL below.
const BASE_URL = 'http://localhost:8000';

function mockFetch(response: Partial<Response> & { json?: () => unknown }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({}),
    ...response,
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function lastUrl(fetchMock: ReturnType<typeof vi.fn>): string {
  return fetchMock.mock.calls[0][0] as string;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('searchDocuments', () => {
  it('hits the search endpoint with an encoded query', async () => {
    const payload = { items: [{ id: '1' }] };
    const fetchMock = mockFetch({ json: async () => payload });

    const result = await searchDocuments('capital adequacy & basel');

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(lastUrl(fetchMock)).toBe(
      `${BASE_URL}/api/v1/documents/search?q=capital%20adequacy%20%26%20basel`
    );
  });

  it('throws when the response is not ok', async () => {
    mockFetch({ ok: false });
    await expect(searchDocuments('x')).rejects.toThrow('Search failed');
  });
});

describe('getDocuments', () => {
  it('requests without query params when none are supplied', async () => {
    const fetchMock = mockFetch({ json: async () => ({ items: [] }) });

    await getDocuments();

    expect(lastUrl(fetchMock)).toBe(`${BASE_URL}/api/v1/documents/?`);
  });

  it('serializes all provided filter params', async () => {
    const fetchMock = mockFetch({ json: async () => ({ items: [] }) });

    await getDocuments({
      issuing_body: 'BB',
      category: 'aml',
      status: 'superseded',
      page: 2,
      limit: 50,
    });

    const url = new URL(lastUrl(fetchMock));
    expect(url.pathname).toBe('/api/v1/documents/');
    expect(url.searchParams.get('issuing_body')).toBe('BB');
    expect(url.searchParams.get('category')).toBe('aml');
    expect(url.searchParams.get('status')).toBe('superseded');
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('limit')).toBe('50');
  });

  it('omits falsy params such as page 0', async () => {
    const fetchMock = mockFetch({ json: async () => ({ items: [] }) });

    await getDocuments({ page: 0, issuing_body: '' });

    const url = new URL(lastUrl(fetchMock));
    expect(url.searchParams.has('page')).toBe(false);
    expect(url.searchParams.has('issuing_body')).toBe(false);
  });

  it('throws when the response is not ok', async () => {
    mockFetch({ ok: false });
    await expect(getDocuments()).rejects.toThrow('Failed to fetch documents');
  });
});

describe('getDocument', () => {
  it('fetches a single document by id', async () => {
    const doc = { id: 'abc-123' };
    const fetchMock = mockFetch({ json: async () => doc });

    const result = await getDocument('abc-123');

    expect(result).toEqual(doc);
    expect(lastUrl(fetchMock)).toBe(`${BASE_URL}/api/v1/documents/abc-123`);
  });

  it('throws when the document is missing', async () => {
    mockFetch({ ok: false });
    await expect(getDocument('missing')).rejects.toThrow('Document not found');
  });
});

describe('askQuestion', () => {
  it('POSTs the query text with a JSON body', async () => {
    const answer = { answer: 'hello', citations: [] };
    const fetchMock = mockFetch({ json: async () => answer });

    const result = await askQuestion('What is the SBL?');

    expect(result).toEqual(answer);
    expect(lastUrl(fetchMock)).toBe(`${BASE_URL}/api/v1/query/`);

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(init.body as string)).toEqual({
      query_text: 'What is the SBL?',
      language: 'en',
    });
  });

  it('throws when the query fails', async () => {
    mockFetch({ ok: false });
    await expect(askQuestion('x')).rejects.toThrow('Query failed');
  });
});

describe('checkHealth', () => {
  it('returns the parsed health payload', async () => {
    const health = { status: 'ok' };
    const fetchMock = mockFetch({ json: async () => health });

    const result = await checkHealth();

    expect(result).toEqual(health);
    expect(lastUrl(fetchMock)).toBe(`${BASE_URL}/health`);
  });

  it('does not throw on a non-ok response (no status check)', async () => {
    mockFetch({ ok: false, json: async () => ({ status: 'degraded' }) });
    await expect(checkHealth()).resolves.toEqual({ status: 'degraded' });
  });
});
