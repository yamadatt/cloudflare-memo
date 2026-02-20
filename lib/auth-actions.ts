'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createSupabaseServerClient } from './supabase/server';

export async function signInWithGoogle(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const headersList = await headers();
  const origin = headersList.get('origin') ?? '';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect('/login?error=auth_failed');
  }

  redirect(data.url);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/');
}
