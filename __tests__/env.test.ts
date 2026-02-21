import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockGetCloudflareContext = vi.hoisted(() => vi.fn());

vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: mockGetCloudflareContext,
}));

import { getSupabaseRuntimeEnv } from '../lib/env';

const VALID_CF_ENV = {
  SUPABASE_URL: 'https://cf.supabase.co',
  SUPABASE_ANON_KEY: 'cf-anon-key',
};

describe('getSupabaseRuntimeEnv', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    mockGetCloudflareContext.mockReset();
    // process.env の値を確実に消す
    process.env.SUPABASE_URL = '';
    process.env.SUPABASE_ANON_KEY = '';
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('CF context が有効 → CF env を返す', async () => {
    mockGetCloudflareContext.mockResolvedValue({ env: VALID_CF_ENV });

    const result = await getSupabaseRuntimeEnv();

    expect(result.SUPABASE_URL).toBe(VALID_CF_ENV.SUPABASE_URL);
    expect(result.SUPABASE_ANON_KEY).toBe(VALID_CF_ENV.SUPABASE_ANON_KEY);
  });

  it('CF context が throw → process.env にフォールバック', async () => {
    mockGetCloudflareContext.mockRejectedValue(new Error('CF not available'));
    vi.stubEnv('SUPABASE_URL', 'https://process.supabase.co');
    vi.stubEnv('SUPABASE_ANON_KEY', 'process-anon-key');

    const result = await getSupabaseRuntimeEnv();

    expect(result.SUPABASE_URL).toBe('https://process.supabase.co');
    expect(result.SUPABASE_ANON_KEY).toBe('process-anon-key');
  });

  it('CF env の SUPABASE_URL が空文字 → process.env にフォールバック', async () => {
    mockGetCloudflareContext.mockResolvedValue({
      env: { SUPABASE_URL: '', SUPABASE_ANON_KEY: 'cf-key' },
    });
    vi.stubEnv('SUPABASE_URL', 'https://process.supabase.co');
    vi.stubEnv('SUPABASE_ANON_KEY', 'process-anon-key');

    const result = await getSupabaseRuntimeEnv();

    expect(result.SUPABASE_URL).toBe('https://process.supabase.co');
  });

  it('CF env が両方空文字 → process.env にフォールバック', async () => {
    mockGetCloudflareContext.mockResolvedValue({
      env: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
    });
    vi.stubEnv('SUPABASE_URL', 'https://process.supabase.co');
    vi.stubEnv('SUPABASE_ANON_KEY', 'process-anon-key');

    const result = await getSupabaseRuntimeEnv();

    expect(result.SUPABASE_URL).toBe('https://process.supabase.co');
    expect(result.SUPABASE_ANON_KEY).toBe('process-anon-key');
  });

  it('CF も process.env も無効 → エラーをスロー', async () => {
    mockGetCloudflareContext.mockRejectedValue(new Error('CF not available'));
    // process.env は beforeEach で空文字にクリア済み

    await expect(getSupabaseRuntimeEnv()).rejects.toThrow();
  });

  it('SUPABASE_URL のみ未設定 → エラーをスロー', async () => {
    mockGetCloudflareContext.mockRejectedValue(new Error('CF not available'));
    vi.stubEnv('SUPABASE_ANON_KEY', 'process-anon-key');
    // SUPABASE_URL は設定しない

    await expect(getSupabaseRuntimeEnv()).rejects.toThrow();
  });

  it('SUPABASE_ANON_KEY のみ未設定 → エラーをスロー', async () => {
    mockGetCloudflareContext.mockRejectedValue(new Error('CF not available'));
    vi.stubEnv('SUPABASE_URL', 'https://process.supabase.co');
    // SUPABASE_ANON_KEY は設定しない

    await expect(getSupabaseRuntimeEnv()).rejects.toThrow();
  });
});
