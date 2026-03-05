/**
 * Zod validation schemas for all domain models
 */

import { z } from 'zod'

export const TeamMemberSchema = z.object({
  firstName: z.string().min(1, 'First name required').max(50),
  lastName: z.string().min(1, 'Last name required').max(50)
})

export const TournamentRulesSchema = z.object({
  maxFish: z.number().int().min(1),
  releaseBonus: z.number().positive(),
  teamSize: z.number().int().min(1),
  days: z.number().int().min(1).max(7)
})

export const TournamentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Tournament name required').max(100),
  year: z.number().int().min(1900).max(2100),
  location: z.string().min(1, 'Location required').max(100),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  logoId: z.string().optional(),
  rules: TournamentRulesSchema,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
})

export const TeamSchema = z.object({
  id: z.string().optional(),
  tournamentId: z.string(),
  teamNumber: z.number().int().min(1),
  members: z.array(TeamMemberSchema).min(1),
  status: z.enum(['active', 'inactive', 'disqualified']),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
})

export const WeighInSchema = z.object({
  id: z.string().optional(),
  tournamentId: z.string(),
  teamId: z.string(),
  teamNumber: z.number().int().min(1),
  day: z.enum(['1', '2']).transform(v => parseInt(v) as 1 | 2),
  fishCount: z.number().int().min(0),
  rawWeight: z.number().nonnegative(),
  fishReleased: z.number().int().min(0),
  bigFishWeight: z.number().nonnegative().optional(),
  receivedBy: z.string().min(1, 'Received by required'),
  issuedBy: z.string().min(1, 'Issued by required'),
  timestamp: z.coerce.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
})

export const CalcuttaGroupSchema = z.object({
  id: z.string().optional(),
  tournamentId: z.string(),
  groupNumber: z.number().int().min(1),
  teams: z.array(z.number().int().min(1)),
  winningTeamId: z.string().optional(),
  soldPrice: z.number().optional()
})

export type Tournament = z.infer<typeof TournamentSchema>
export type Team = z.infer<typeof TeamSchema>
export type WeighIn = z.infer<typeof WeighInSchema>
export type CalcuttaGroup = z.infer<typeof CalcuttaGroupSchema>
export type TeamMember = z.infer<typeof TeamMemberSchema>
