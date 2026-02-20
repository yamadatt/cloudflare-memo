import { getCloudflareContext } from '@opennextjs/cloudflare';

type SupabaseRuntimeEnv = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function ensureSupabaseEnv(
  source: Partial<SupabaseRuntimeEnv>
): SupabaseRuntimeEnv | null {
  if (
    isNonEmptyString(source.SUPABASE_URL) &&
    isNonEmptyString(source.SUPABASE_ANON_KEY)
  ) {
    return {
      SUPABASE_URL: source.SUPABASE_URL,
      SUPABASE_ANON_KEY: source.SUPABASE_ANON_KEY,
    };
  }
  return null;
}

export async function getSupabaseRuntimeEnv(): Promise<SupabaseRuntimeEnv> {
  const contextEnv = await (async () => {
    try {
      const { env } = await getCloudflareContext({ async: true });
      return ensureSupabaseEnv({
        SUPABASE_URL: env?.SUPABASE_URL,
        SUPABASE_ANON_KEY: env?.SUPABASE_ANON_KEY,
      });
    } catch {
      return null;
    }
  })();

  if (contextEnv) {
    return contextEnv;
  }

  const processEnv = ensureSupabaseEnv({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  });

  if (processEnv) {
    return processEnv;
  }

  throw new Error(
    'SUPABASE_URL と SUPABASE_ANON_KEY が未設定です。.dev.vars または .env.local を設定してください。'
  );
}
