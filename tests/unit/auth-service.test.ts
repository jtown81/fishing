/**
 * Unit tests for auth-service.ts
 * Supabase is mocked — no real network calls.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock @lib/supabase
// ---------------------------------------------------------------------------
let supabaseMock: Record<string, unknown> | null = null

vi.mock('@lib/supabase', () => ({
  get supabase() { return supabaseMock },
  get isCloudEnabled() { return !!supabaseMock }
}))

// ---------------------------------------------------------------------------
// Test target (imported after mock registration)
// ---------------------------------------------------------------------------
import { getSession, signIn, signUp, signOut, onAuthChange } from '@modules/auth/auth-service'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('getSession', () => {
  beforeEach(() => { supabaseMock = null })

  it('returns null when supabase is not configured', async () => {
    const session = await getSession()
    expect(session).toBeNull()
  })

  it('returns session from Supabase when configured', async () => {
    const fakeSession = { user: { id: 'u-1', email: 'test@example.com' } }
    supabaseMock = {
      auth: {
        getSession: vi.fn(async () => ({ data: { session: fakeSession } }))
      }
    }

    const session = await getSession()
    expect(session).toEqual(fakeSession)
  })
})

describe('signIn', () => {
  beforeEach(() => { supabaseMock = null })

  it('returns error when supabase is not configured', async () => {
    const result = await signIn('test@example.com', 'password')
    expect(result.error).toBe('Cloud sync not configured')
  })

  it('returns empty object on success', async () => {
    supabaseMock = {
      auth: {
        signInWithPassword: vi.fn(async () => ({ error: null }))
      }
    }

    const result = await signIn('test@example.com', 'password')
    expect(result).toEqual({})
    expect(result.error).toBeUndefined()
  })

  it('returns error message on auth failure', async () => {
    supabaseMock = {
      auth: {
        signInWithPassword: vi.fn(async () => ({
          error: { message: 'Invalid login credentials' }
        }))
      }
    }

    const result = await signIn('test@example.com', 'wrong')
    expect(result.error).toBe('Invalid login credentials')
  })
})

describe('signUp', () => {
  beforeEach(() => { supabaseMock = null })

  it('returns error when supabase is not configured', async () => {
    const result = await signUp('test@example.com', 'password')
    expect(result.error).toBe('Cloud sync not configured')
  })

  it('returns empty object on success', async () => {
    supabaseMock = {
      auth: {
        signUp: vi.fn(async () => ({ error: null }))
      }
    }

    const result = await signUp('new@example.com', 'password123')
    expect(result).toEqual({})
  })

  it('returns error message on failure', async () => {
    supabaseMock = {
      auth: {
        signUp: vi.fn(async () => ({
          error: { message: 'Email rate limit exceeded' }
        }))
      }
    }

    const result = await signUp('test@example.com', 'password')
    expect(result.error).toBe('Email rate limit exceeded')
  })
})

describe('signOut', () => {
  it('is a no-op when supabase is null', async () => {
    supabaseMock = null
    await expect(signOut()).resolves.not.toThrow()
  })

  it('calls supabase.auth.signOut when configured', async () => {
    const signOutFn = vi.fn(async () => {})
    supabaseMock = { auth: { signOut: signOutFn } }

    await signOut()
    expect(signOutFn).toHaveBeenCalledOnce()
  })
})

describe('onAuthChange', () => {
  it('returns no-op function when supabase is null', () => {
    supabaseMock = null
    const unsub = onAuthChange(() => {})
    expect(typeof unsub).toBe('function')
    expect(() => unsub()).not.toThrow()
  })

  it('registers listener and returns unsubscribe when supabase is configured', () => {
    const unsubFn = vi.fn()
    supabaseMock = {
      auth: {
        onAuthStateChange: vi.fn((_event: unknown, _cb: unknown) => ({
          data: { subscription: { unsubscribe: unsubFn } }
        }))
      }
    }

    const cb = vi.fn()
    const unsub = onAuthChange(cb)
    expect(typeof unsub).toBe('function')

    unsub()
    expect(unsubFn).toHaveBeenCalledOnce()
  })
})
