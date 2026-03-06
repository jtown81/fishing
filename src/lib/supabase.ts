/**
 * Supabase client singleton.
 * Returns null when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set,
 * allowing the app to run in fully local-only mode with zero behavior change.
 */
/// <reference types="vite/client" />
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null

export const isCloudEnabled: boolean = !!supabase
