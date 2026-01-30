import { createClient } from '@supabase/supabase-js'

// Ganti dengan URL dan KEY dari dashboard Supabase Anda
const supabaseUrl = 'https://tksscddcchnfwceuntkh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrc3NjZGRjY2huZndjZXVudGtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MTEwMDgsImV4cCI6MjA4NDk4NzAwOH0.d7WXO1RImT2cdSrIvQlVcaWVhoSoMxZfc8oqNkAxCSI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
})