/**
 * API Service — Manages REST API keys and rate limiting
 * Integrates with Supabase for API key storage and validation
 *
 * Third-party applications can authenticate via X-API-Key header
 * and access tournament data via REST endpoints.
 *
 * Rate Limits:
 * - Free tier: 100 requests/day
 * - Pro tier: 1,000 requests/day
 * - Org tier: 10,000 requests/day
 */

import { supabase } from '@lib/supabase'
import { useAuthStore } from '@modules/auth'

export interface APIKey {
  id: string
  name: string
  createdAt: Date
  lastUsedAt?: Date | null
}

export interface APIRequest {
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  timestamp: Date
  userId: string
  apiKeyId: string
  ipAddress?: string
  statusCode: number
}

/**
 * Generate a new API key for the current user
 */
export async function generateAPIKey(name: string): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const user = useAuthStore.getState().user
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Generate a random API key
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let key = 'fta_' // fta = fishing tournament app
  for (let i = 0; i < 40; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  // Store in Supabase
  const { data, error } = await supabase.from('api_keys').insert({
    user_id: user.id,
    key_hash: hashAPIKey(key),
    name,
    created_at: new Date().toISOString()
  }).select('id')

  if (error) throw error
  if (!data) throw new Error('Failed to create API key')

  return key
}

/**
 * Validate an API key and return user/rate limit info
 */
export async function validateAPIKey(apiKey: string): Promise<{
  userId: string
  rateLimit: number
  requestsToday: number
} | null> {
  if (!supabase) return null

  const keyHash = hashAPIKey(apiKey)

  const { data, error } = await supabase
    .from('api_keys')
    .select('user_id, created_at')
    .eq('key_hash', keyHash)
    .eq('active', true)
    .single()

  if (error || !data) return null

  // Get user's subscription tier to determine rate limit
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('tier')
    .eq('user_id', data.user_id)
    .single()

  const tier = subscription?.tier || 'free'
  const rateLimits = {
    free: 100,
    pro: 1000,
    org: 10000
  }

  return {
    userId: data.user_id,
    rateLimit: rateLimits[tier as keyof typeof rateLimits] || 100,
    requestsToday: 0 // Would be queried from daily_api_requests table in real implementation
  }
}

/**
 * Log an API request for rate limiting and analytics
 */
export async function logAPIRequest(
  userId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  ipAddress?: string
): Promise<void> {
  if (!supabase) return

  await supabase.from('api_requests').insert({
    user_id: userId,
    endpoint,
    method,
    status_code: statusCode,
    ip_address: ipAddress,
    created_at: new Date().toISOString()
  })
}

/**
 * Delete an API key
 */
export async function deleteAPIKey(keyId: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { error } = await supabase
    .from('api_keys')
    .update({ active: false })
    .eq('id', keyId)

  if (error) throw error
}

/**
 * Get all API keys for the current user
 */
export async function listAPIKeys(): Promise<APIKey[]> {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const user = useAuthStore.getState().user
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, name, created_at, last_used_at')
    .eq('user_id', user.id)
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    createdAt: new Date(item.created_at),
    lastUsedAt: item.last_used_at ? new Date(item.last_used_at) : null
  }))
}

/**
 * Hash an API key for secure storage
 * In production, use bcrypt or argon2
 */
function hashAPIKey(key: string): string {
  // Simple hash for demo purposes
  // In production, use: await bcrypt.hash(key, 10)
  return Buffer.from(key).toString('base64').slice(0, 32)
}
