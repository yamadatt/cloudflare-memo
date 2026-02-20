import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function createSupabaseServerClient() {
  const { env } = await getCloudflareContext({ async: true });
  const cookieStore = await cookies();
  return createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
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
