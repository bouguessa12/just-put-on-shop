import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Auth helpers
export async function signUpWithEmail(email, password) {
  return supabase.auth.signUp({ email, password });
}
export async function signInWithEmail(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}
export async function signOut() {
  return supabase.auth.signOut();
}
export function getCurrentUser() {
  return supabase.auth.getUser();
}
