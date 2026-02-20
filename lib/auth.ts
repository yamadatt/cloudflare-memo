import { cache } from 'react';
import type { User } from '@supabase/supabase-js';
import { createSupabaseServerClient } from './supabase/server';

async function fetchCurrentUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export const getCurrentUser = cache(fetchCurrentUser);
