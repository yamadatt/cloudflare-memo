import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseRuntimeEnv } from '../env';

export async function createSupabaseServerClient() {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = await getSupabaseRuntimeEnv();
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component からの呼び出しは無視
        }
      },
    },
  });
}
