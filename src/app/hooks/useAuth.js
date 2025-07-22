import { supabase } from '@/lib/supabaseClient';

export async function signUpWithEmail(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  // Insert into users table
  if (data.user) {
    await supabase.from('users').upsert({ id: data.user.id, email, full_name: fullName });
  }
  return { data, error };
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  let userInfo = null;
  if (data.user) {
    const { data: userData } = await supabase.from('users').select('*').eq('id', data.user.id).single();
    userInfo = userData;
  }
  return { data, userInfo, error };
}

export async function isAdmin(userId) {
  const { data } = await supabase.from('admins').select('user_id').eq('user_id', userId).single();
  return !!data;
} 