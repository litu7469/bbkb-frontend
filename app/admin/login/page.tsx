'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminLoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = '/admin';
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f8fafc',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: 'white', borderRadius: 16,
        border: '1px solid #e2e8f0',
        padding: '2.5rem', width: '100%', maxWidth: 400,
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 48, height: 48, background: '#0D2B5E',
            borderRadius: 12, margin: '0 auto 1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#F5A623', fontSize: 22, fontWeight: 900 }}>B</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0D2B5E', margin: 0 }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            BBKB — Bangladesh Banking Knowledge Base
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              fontSize: 12, fontWeight: 700, color: '#374151',
              display: 'block', marginBottom: 6,
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              style={{
                width: '100%', padding: '0.75rem 1rem',
                border: '1.5px solid #e2e8f0', borderRadius: 8,
                fontSize: 14, color: '#1e293b', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              fontSize: 12, fontWeight: 700, color: '#374151',
              display: 'block', marginBottom: 6,
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', padding: '0.75rem 1rem',
                border: '1.5px solid #e2e8f0', borderRadius: 8,
                fontSize: 14, color: '#1e293b', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 8, padding: '0.75rem 1rem',
              fontSize: 13, color: '#dc2626', marginBottom: '1rem',
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '0.875rem',
              background: loading ? '#94a3b8' : '#0D2B5E',
              color: 'white', fontWeight: 800, fontSize: 14,
              border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer',
            }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  );
}