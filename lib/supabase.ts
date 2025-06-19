import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface UniversityData {
  id?: number
  组名: string
  院校名: string
  组号: string
  投档线: string
  语文数学合计: number | null
  外语: number | null
  选考最高: number | null
  选考次高: number | null
  选考最低: number | null
  加分: number | null
  最低排名: number | null
  年份: number
  created_at?: string
}

export interface UserFavorite {
  id?: number
  user_id: string
  university_name: string
  university_group: string
  created_at?: string
}

// Database functions
export async function getUniversityData() {
  const { data, error } = await supabase
    .from('university_data')
    .select('*')
    .order('年份', { ascending: false })
  
  if (error) throw error
  return data
}

export async function searchUniversities(searchTerm: string, year?: number) {
  let query = supabase
    .from('university_data')
    .select('*')
    .ilike('院校名', `%${searchTerm}%`)
  
  if (year) {
    query = query.eq('年份', year)
  }
  
  const { data, error } = await query.limit(50)
  
  if (error) throw error
  return data
}

export async function getUserFavorites(userId: string) {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('*')
    .eq('user_id', userId)
  
  if (error) throw error
  return data
}

export async function addToFavorites(userId: string, universityName: string, universityGroup: string) {
  const { data, error } = await supabase
    .from('user_favorites')
    .insert([
      {
        user_id: userId,
        university_name: universityName,
        university_group: universityGroup
      }
    ])
  
  if (error) throw error
  return data
}

export async function removeFromFavorites(userId: string, universityName: string) {
  const { data, error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('university_name', universityName)
  
  if (error) throw error
  return data
} 