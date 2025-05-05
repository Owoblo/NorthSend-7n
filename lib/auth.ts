import { supabase } from './supabaseClient'
import { User } from '@supabase/supabase-js'

export async function signUp(email: string, password: string, firstName: string, lastName: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error }
  }
}

export async function getCurrentUser(): Promise<{ user: User | null; error: any }> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return { user, error: null }
  } catch (error) {
    return { user: null, error }
  }
}

// Email verification types
export type VerificationCode = {
  code: string;
  email: string;
  expires_at: string;
  verified: boolean;
}

// Generate a random 6-digit code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store verification code in database
export async function storeVerificationCode(email: string): Promise<string> {
  const code = generateVerificationCode();
  const expires_at = new Date(Date.now() + 15 * 60000); // 15 minutes from now

  const { error } = await supabase
    .from('verification_codes')
    .insert({
      email,
      code,
      expires_at: expires_at.toISOString(),
      verified: false
    });

  if (error) throw error;
  return code;
}

// Send verification code via email
export async function sendVerificationCode(email: string): Promise<void> {
  const code = await storeVerificationCode(email);
  
  // TODO: Replace with your email service (SendGrid, AWS SES, etc.)
  const { error } = await supabase.functions.invoke('send-email', {
    body: {
      to: email,
      subject: 'Verify your Interac e-Transfer email',
      html: `
        <h1>Verify your Interac e-Transfer email</h1>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in 15 minutes.</p>
      `
    }
  });

  if (error) throw error;
}

// Verify email code
export async function verifyEmailCode(email: string, code: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('verification_codes')
    .select('*')
    .eq('email', email)
    .eq('code', code)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) return false;

  // Mark code as verified
  await supabase
    .from('verification_codes')
    .update({ verified: true })
    .eq('id', data.id);

  // Update user's Interac email
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ interac_email: email })
    .eq('user_id', (await getCurrentUser()).user?.id);

  if (updateError) throw updateError;
  return true;
}

// Get user's verified Interac email
export async function getInteracEmail(): Promise<string | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('interac_email')
    .eq('user_id', (await getCurrentUser()).user?.id)
    .single();

  if (error) throw error;
  return data?.interac_email || null;
} 