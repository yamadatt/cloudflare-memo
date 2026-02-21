import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockExchangeCodeForSession = vi.hoisted(() => vi.fn());
const mockCreateSupabaseServerClient = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    auth: { exchangeCodeForSession: mockExchangeCodeForSession },
  })
);

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: mockCreateSupabaseServerClient,
}));

import { GET } from '../app/auth/callback/route';

describe('GET /auth/callback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateSupabaseServerClient.mockResolvedValue({
      auth: { exchangeCodeForSession: mockExchangeCodeForSession },
    });
  });

  it('code なし → / へリダイレクト', async () => {
    const request = new Request('http://localhost/auth/callback');

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/');
  });

  it('code なし → exchangeCodeForSession が呼び出されない', async () => {
    const request = new Request('http://localhost/auth/callback');

    await GET(request);

    expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
  });

  it('code あり + 交換成功 → / へリダイレクト', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
    const request = new Request('http://localhost/auth/callback?code=valid-code');

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/');
  });

  it('code あり + 交換失敗 → /login?error=auth_failed へリダイレクト', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: new Error('invalid code') });
    const request = new Request('http://localhost/auth/callback?code=bad-code');

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/login?error=auth_failed');
  });
});
