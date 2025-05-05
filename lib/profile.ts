import { supabase } from '@/lib/supabase'

export type Profile = {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  city: string
  province: string
  postal_code: string
  created_at: string
  updated_at: string
}

export async function getProfile(userId: string): Promise<{ profile: Profile | null; error: any }> {
  try {
    console.log('Fetching profile for user:', userId)
    
    if (!userId) {
      console.error('No userId provided to getProfile')
      return { profile: null, error: 'No userId provided' }
    }

    // Query the profiles table directly
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Supabase error fetching profile:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        error
      })
      return { profile: null, error }
    }

    console.log('Successfully fetched profile:', profile)
    return { profile, error: null }
  } catch (err) {
    console.error('Unexpected error in getProfile:', err)
    return { profile: null, error: err }
  }
}

export async function updateProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ profile: Profile | null; error: any }> {
  try {
    console.log('Updating profile for user:', userId, 'with updates:', updates)

    if (!userId) {
      console.error('No userId provided to updateProfile')
      return { profile: null, error: 'No userId provided' }
    }

    // First check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking profile existence:', checkError)
      return { profile: null, error: checkError }
    }

    let result
    if (!existingProfile) {
      // Create new profile
      console.log('Creating new profile for user:', userId)
      result = await supabase
        .from('profiles')
        .insert([{
          user_id: userId,
          ...updates,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()
    } else {
      // Update existing profile
      console.log('Updating existing profile for user:', userId)
      result = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()
    }

    if (result.error) {
      console.error('Supabase error updating profile:', {
        code: result.error.code,
        message: result.error.message,
        details: result.error.details,
        hint: result.error.hint,
        error: result.error
      })
      return { profile: null, error: result.error }
    }

    console.log('Successfully updated profile:', result.data)
    return { profile: result.data, error: null }
  } catch (err) {
    console.error('Unexpected error in updateProfile:', err)
    return { profile: null, error: err }
  }
} 