/**
 * Unit tests for sync-engine.ts
 * Supabase and Dexie are mocked — no real network or DB calls.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock @lib/supabase — controlled per-test via supabaseMock
let supabaseMock: unknown = null
vi.mock('@lib/supabase', () => ({
  get supabase() { return supabaseMock },
  get isCloudEnabled() { return !!supabaseMock }
}))

// Mock auth store — user set per-test
let authUserMock: { email: string } | null = null
vi.mock('@modules/auth/auth-store', () => ({
  useAuthStore: {
    getState: () => ({ user: authUserMock })
  }
}))

// Fake syncQueue with in-memory storage
const fakeQueue: Array<{ id: number; synced: boolean; retryCount: number; timestamp: Date; entityType: string; entityId: string; action: string; payload: object }> = []
let nextId = 1

vi.mock('@db/database', () => ({
  db: {
    syncQueue: {
      add: vi.fn(async (op: object) => {
        const id = nextId++
        fakeQueue.push({ id, ...op } as typeof fakeQueue[0])
        return id
      }),
      where: vi.fn((field: string) => ({
        equals: vi.fn((val: number) => ({
          toArray: vi.fn(async () =>
            fakeQueue.filter((op) => {
              if (field === 'synced') return op.synced === (val === 1)
              return true
            })
          ),
          count: vi.fn(async () =>
            fakeQueue.filter((op) => {
              if (field === 'synced') return op.synced === (val === 1)
              return true
            }).length
          ),
          reverse: vi.fn(() => ({
            sortBy: vi.fn(async () =>
              fakeQueue
                .filter((op) => {
                  if (field === 'synced') return op.synced === (val === 1)
                  return true
                })
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            )
          }))
        }))
      })),
      update: vi.fn(async (id: number, changes: Partial<{ synced: boolean; retryCount: number }>) => {
        const item = fakeQueue.find(op => op.id === id)
        if (item) Object.assign(item, changes)
      })
    }
  }
}))

// ---------------------------------------------------------------------------
// Test target
// ---------------------------------------------------------------------------

import { resolveConflict, enqueueMutation, flushSyncQueue, getPendingCount } from '@modules/sync/sync-engine'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('resolveConflict', () => {
  it('returns local when local is newer', () => {
    const local = { id: '1', updatedAt: new Date('2024-06-02') }
    const remote = { id: '1', updatedAt: new Date('2024-06-01') }
    expect(resolveConflict(local, remote)).toBe(local)
  })

  it('returns remote when remote is newer', () => {
    const local = { id: '1', updatedAt: new Date('2024-06-01') }
    const remote = { id: '1', updatedAt: new Date('2024-06-02') }
    expect(resolveConflict(local, remote)).toBe(remote)
  })

  it('returns local on equal timestamps', () => {
    const ts = new Date('2024-06-01')
    const local = { id: '1', updatedAt: ts }
    const remote = { id: '1', updatedAt: ts }
    expect(resolveConflict(local, remote)).toBe(local)
  })
})

describe('enqueueMutation — local-only mode (supabase === null)', () => {
  beforeEach(() => {
    supabaseMock = null
    authUserMock = null
    fakeQueue.length = 0
  })

  it('stores op in syncQueue when supabase is null', async () => {
    await enqueueMutation({
      entityType: 'weighIn',
      entityId: 'w-1',
      action: 'upsert',
      payload: { id: 'w-1' },
      timestamp: new Date()
    })

    expect(fakeQueue).toHaveLength(1)
    expect(fakeQueue[0].synced).toBe(false)
    expect(fakeQueue[0].entityId).toBe('w-1')
  })

  it('stores op in syncQueue when user not signed in', async () => {
    supabaseMock = {} // configured but not signed in
    authUserMock = null

    await enqueueMutation({
      entityType: 'team',
      entityId: 't-1',
      action: 'upsert',
      payload: { id: 't-1' },
      timestamp: new Date()
    })

    expect(fakeQueue).toHaveLength(1)
    expect(fakeQueue[0].synced).toBe(false)
  })
})

describe('enqueueMutation — online + signed in', () => {
  beforeEach(() => {
    authUserMock = { email: 'test@example.com' }
    fakeQueue.length = 0
  })

  afterEach(() => {
    supabaseMock = null
  })

  it('marks as synced=true when push succeeds', async () => {
    supabaseMock = {
      from: vi.fn(() => ({
        upsert: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }

    await enqueueMutation({
      entityType: 'weighIn',
      entityId: 'w-2',
      action: 'upsert',
      payload: { id: 'w-2' },
      timestamp: new Date()
    })

    expect(fakeQueue).toHaveLength(1)
    expect(fakeQueue[0].synced).toBe(true)
  })

  it('enqueues as synced=false when push fails', async () => {
    supabaseMock = {
      from: vi.fn(() => ({
        upsert: vi.fn(() => Promise.resolve({ error: { message: 'Network error' } }))
      }))
    }

    await enqueueMutation({
      entityType: 'weighIn',
      entityId: 'w-3',
      action: 'upsert',
      payload: { id: 'w-3' },
      timestamp: new Date()
    })

    expect(fakeQueue).toHaveLength(1)
    expect(fakeQueue[0].synced).toBe(false)
  })
})

describe('flushSyncQueue', () => {
  beforeEach(() => {
    fakeQueue.length = 0
    nextId = 1
    authUserMock = { email: 'test@example.com' }
  })

  afterEach(() => {
    supabaseMock = null
    authUserMock = null
  })

  it('is a no-op when supabase is null', async () => {
    supabaseMock = null
    fakeQueue.push({ id: 1, synced: false, retryCount: 0, entityType: 'weighIn', entityId: 'w-1', action: 'upsert', payload: {}, timestamp: new Date() })

    await flushSyncQueue()

    expect(fakeQueue[0].synced).toBe(false)
  })

  it('is a no-op when user not signed in', async () => {
    authUserMock = null
    supabaseMock = {}
    fakeQueue.push({ id: 1, synced: false, retryCount: 0, entityType: 'weighIn', entityId: 'w-1', action: 'upsert', payload: {}, timestamp: new Date() })

    await flushSyncQueue()

    expect(fakeQueue[0].synced).toBe(false)
  })

  it('marks ops as synced=true on success', async () => {
    supabaseMock = {
      from: vi.fn(() => ({
        upsert: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }

    const t1 = new Date('2024-01-01T10:00:00Z')
    const t2 = new Date('2024-01-01T10:01:00Z')
    fakeQueue.push({ id: 1, synced: false, retryCount: 0, entityType: 'tournament', entityId: 't-1', action: 'upsert', payload: { id: 't-1' }, timestamp: t1 })
    fakeQueue.push({ id: 2, synced: false, retryCount: 0, entityType: 'team', entityId: 'tm-1', action: 'upsert', payload: { id: 'tm-1' }, timestamp: t2 })

    await flushSyncQueue()

    expect(fakeQueue[0].synced).toBe(true)
    expect(fakeQueue[1].synced).toBe(true)
  })

  it('increments retryCount on failure', async () => {
    supabaseMock = {
      from: vi.fn(() => ({
        upsert: vi.fn(() => Promise.resolve({ error: { message: 'error' } }))
      }))
    }

    fakeQueue.push({ id: 1, synced: false, retryCount: 0, entityType: 'team', entityId: 'tm-1', action: 'upsert', payload: { id: 'tm-1' }, timestamp: new Date() })

    await flushSyncQueue()

    expect(fakeQueue[0].synced).toBe(false)
    expect(fakeQueue[0].retryCount).toBe(1)
  })

  it('skips ops at max retry count', async () => {
    const upsertFn = vi.fn(() => Promise.resolve({ error: null }))
    supabaseMock = { from: vi.fn(() => ({ upsert: upsertFn })) }

    fakeQueue.push({ id: 1, synced: false, retryCount: 3, entityType: 'team', entityId: 'tm-1', action: 'upsert', payload: { id: 'tm-1' }, timestamp: new Date() })

    await flushSyncQueue()

    expect(upsertFn).not.toHaveBeenCalled()
  })
})

describe('getPendingCount', () => {
  beforeEach(() => {
    fakeQueue.length = 0
    nextId = 1
  })

  it('returns count of unsynced ops', async () => {
    fakeQueue.push({ id: 1, synced: false, retryCount: 0, entityType: 'weighIn', entityId: 'w-1', action: 'upsert', payload: {}, timestamp: new Date() })
    fakeQueue.push({ id: 2, synced: false, retryCount: 0, entityType: 'weighIn', entityId: 'w-2', action: 'upsert', payload: {}, timestamp: new Date() })
    fakeQueue.push({ id: 3, synced: true, retryCount: 0, entityType: 'weighIn', entityId: 'w-3', action: 'upsert', payload: {}, timestamp: new Date() })

    const count = await getPendingCount()
    expect(count).toBe(2)
  })

  it('returns 0 when all synced', async () => {
    fakeQueue.push({ id: 1, synced: true, retryCount: 0, entityType: 'weighIn', entityId: 'w-1', action: 'upsert', payload: {}, timestamp: new Date() })

    const count = await getPendingCount()
    expect(count).toBe(0)
  })
})
