import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockGetUser = vi.hoisted(() => vi.fn());
const mockCreateServerClient = vi.hoisted(() =>
  vi.fn(() => ({
    auth: { getUser: mockGetUser },
  }))
);
const mockGetSupabaseRuntimeEnv = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
  })
);

vi.mock('@supabase/ssr', () => ({
  createServerClient: mockCreateServerClient,
}));

vi.mock('@/lib/env', () => ({
  getSupabaseRuntimeEnv: mockGetSupabaseRuntimeEnv,
}));

import { middleware } from '../middleware';

describe('middleware ルート保護', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSupabaseRuntimeEnv.mockResolvedValue({
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_ANON_KEY: 'test-anon-key',
    });
    mockCreateServerClient.mockImplementation(() => ({
      auth: { getUser: mockGetUser },
    }));
  });

  describe('未認証ユーザー', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
    });

    it('/notes/new へのアクセス → /login にリダイレクト', async () => {
      const request = new NextRequest('http://localhost/notes/new');

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost/login');
    });

    it('/notes/:id/edit へのアクセス → /login にリダイレクト', async () => {
      const request = new NextRequest('http://localhost/notes/abc-123/edit');

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost/login');
    });

    it('/ へのアクセス → リダイレクトしない', async () => {
      const request = new NextRequest('http://localhost/');

      const response = await middleware(request);

      expect(response.status).not.toBe(307);
    });

    it('/notes/:id（詳細）へのアクセス → リダイレクトしない', async () => {
      const request = new NextRequest('http://localhost/notes/abc-123');

      const response = await middleware(request);

      expect(response.status).not.toBe(307);
    });

    it('/login へのアクセス → リダイレクトしない', async () => {
      const request = new NextRequest('http://localhost/login');

      const response = await middleware(request);

      expect(response.status).not.toBe(307);
    });
  });

  describe('認証済みユーザー', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'user@example.com' } } });
    });

    it('/notes/new へのアクセス → リダイレクトしない', async () => {
      const request = new NextRequest('http://localhost/notes/new');

      const response = await middleware(request);

      expect(response.status).not.toBe(307);
    });

    it('/notes/:id/edit へのアクセス → リダイレクトしない', async () => {
      const request = new NextRequest('http://localhost/notes/abc-123/edit');

      const response = await middleware(request);

      expect(response.status).not.toBe(307);
    });
  });
});
