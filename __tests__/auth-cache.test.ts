import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('getCurrentUser キャッシュ回帰防止', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('同一処理内で複数回呼んでも内部の getUser は1回だけ実行される', async () => {
    const mockGetUser = vi.fn().mockResolvedValue({
      data: { user: { id: 'user-1' } },
    });
    const mockCreateClient = vi.fn().mockResolvedValue({
      auth: { getUser: mockGetUser },
    });

    vi.doMock('react', () => ({
      cache: <T extends (...args: any[]) => Promise<any>>(fn: T) => {
        let hasValue = false;
        let value: Awaited<ReturnType<T>>;
        return (async (...args: Parameters<T>) => {
          if (!hasValue) {
            value = await fn(...args);
            hasValue = true;
          }
          return value;
        }) as T;
      },
    }));

    vi.doMock('@/lib/supabase/server', () => ({
      createSupabaseServerClient: mockCreateClient,
    }));

    const { getCurrentUser } = await import('@/lib/auth');

    const first = await getCurrentUser();
    const second = await getCurrentUser();

    expect(first).toEqual({ id: 'user-1' });
    expect(second).toEqual({ id: 'user-1' });
    expect(mockCreateClient).toHaveBeenCalledTimes(1);
    expect(mockGetUser).toHaveBeenCalledTimes(1);
  });
});
