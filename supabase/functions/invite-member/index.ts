/**
 * invite-member Edge Function
 * Allows an Org-tier tournament owner to invite a user by email.
 *
 * POST /functions/v1/invite-member
 * Body: { tournamentId: string, email: string, role: 'operator' | 'viewer' }
 * Auth: Bearer JWT (caller must be tournament owner with org subscription)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Use service role client for admin operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    // Verify JWT and get caller identity
    const { data: { user: caller }, error: authErr } = await adminClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authErr || !caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { tournamentId, email, role } = await req.json() as {
      tournamentId: string
      email: string
      role: 'operator' | 'viewer'
    }

    if (!tournamentId || !email || !['operator', 'viewer'].includes(role)) {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verify caller owns this tournament
    const { data: tournament, error: tErr } = await adminClient
      .from('tournaments')
      .select('owner_id')
      .eq('id', tournamentId)
      .single()

    if (tErr || !tournament || tournament.owner_id !== caller.id) {
      return new Response(JSON.stringify({ error: 'Forbidden — not tournament owner' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verify caller has org subscription
    const { data: sub } = await adminClient
      .from('user_subscriptions')
      .select('tier')
      .eq('user_id', caller.id)
      .single()

    if (!sub || sub.tier !== 'org') {
      return new Response(JSON.stringify({ error: 'Org subscription required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Look up the invited user by email
    const { data: inviteData, error: lookupErr } = await adminClient.auth.admin.getUserByEmail(email)
    if (lookupErr || !inviteData?.user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const invitedUserId = inviteData.user.id

    // Upsert tournament_members row
    const { error: memberErr } = await adminClient
      .from('tournament_members')
      .upsert(
        {
          tournament_id: tournamentId,
          user_id: invitedUserId,
          role,
          invited_by: caller.id,
          invited_at: new Date().toISOString()
        },
        { onConflict: 'tournament_id,user_id' }
      )

    if (memberErr) {
      return new Response(JSON.stringify({ error: memberErr.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ success: true, userId: invitedUserId }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
