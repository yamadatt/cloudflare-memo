import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockHeadersGet = vi.hoisted(() => vi.fn());
const mockHeaders = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ get: mockHeadersGet })
);

const mockSignInWithOAuth = vi.hoisted(() => vi.fn());
const mockSignOut = vi.hoisted(() => vi.fn());
const mockCreateSupabaseServerClient = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
    },
  })
);

const mockRedirect = vi.hoisted(() => vi.fn());

vi.mock('next/headers', () => ({ headers: mockHeaders }));
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: mockCreateSupabaseServerClient,
}));
vi.mock('next/navigation', () => ({ redirect: mockRedirect }));

import { signInWithGoogle, signOutAction } from '../lib/auth-actions';

describe('signInWithGoogle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateSupabaseServerClient.mockResolvedValue({
      auth: {
        signInWithOAuth: mockSignInWithOAuth,
        signOut: mockSignOut,
      },
    });
    // デフォルト: origin ヘッダーあり
    mockHeadersGet.mockImplementation((key: string) => {
      if (key === 'origin') return 'https://example.com';
      return null;
    });
  });

  it('OAuth エラー → /login?error=auth_failed へリダイレクト', async () => {
    mockSignInWithOAuth.mockResolvedValue({
      data: { url: null },
      error: new Error('oauth error'),
    });

    await signInWithGoogle();

    expect(mockRedirect).toHaveBeenCalledWith('/login?error=auth_failed');
  });

  it('data.url が null → /login?error=auth_failed へリダイレクト', async () => {
    mockSignInWithOAuth.mockResolvedValue({
      data: { url: null },
      error: null,
    });

    await signInWithGoogle();

    expect(mockRedirect).toHaveBeenCalledWith('/login?error=auth_failed');
  });

  it('成功 → OAuth URL へリダイレクト', async () => {
    const oauthUrl = 'https://accounts.google.com/o/oauth2/auth?...';
    mockSignInWithOAuth.mockResolvedValue({
      data: { url: oauthUrl },
      error: null,
    });

    await signInWithGoogle();

    expect(mockRedirect).toHaveBeenCalledWith(oauthUrl);
  });

  it('origin ヘッダーなし → host ヘッダーで redirectTo を構築', async () => {
    mockHeadersGet.mockImplementation((key: string) => {
      if (key === 'host') return 'myapp.example.com';
      return null; // origin は null
    });
    mockSignInWithOAuth.mockResolvedValue({
      data: { url: 'https://accounts.google.com/o/oauth2/auth' },
      error: null,
    });

    await signInWithGoogle();

    const callArg = mockSignInWithOAuth.mock.calls[0]?.[0] as {
      options: { redirectTo: string };
    };
    expect(callArg.options.redirectTo).toBe('https://myapp.example.com/auth/callback');
  });
});

describe('signOutAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateSupabaseServerClient.mockResolvedValue({
      auth: {
        signInWithOAuth: mockSignInWithOAuth,
        signOut: mockSignOut,
      },
    });
  });

  it('signOut を呼び出して / へリダイレクト', async () => {
    mockSignOut.mockResolvedValue({});

    await signOutAction();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockRedirect).toHaveBeenCalledWith('/');
  });
});
