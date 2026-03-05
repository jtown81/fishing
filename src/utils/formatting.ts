/**
 * Formatting utilities for display
 */

import type { TeamMember } from '@models/tournament'

export function formatWeight(pounds: number, decimals = 2): string {
  return `${pounds.toFixed(decimals)} lbs`
}

export function formatTeamMembers(members: TeamMember[]): string {
  return members.map(m => `${m.firstName} ${m.lastName}`).join(' & ')
}

export function formatDate(date: Date, format: 'short' | 'long' = 'short'): string {
  if (format === 'short') {
    return new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    }).format(date)
  }

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date)
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date, 'short')} ${formatTime(date)}`
}

export function formatRankChange(rankChange: number | undefined): string {
  if (rankChange === undefined || rankChange === 0) return '—'
  if (rankChange > 0) return `↑ ${rankChange}`
  return `↓ ${Math.abs(rankChange)}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function formatNumber(num: number, decimals?: number): string {
  if (decimals !== undefined) {
    return parseFloat(num.toFixed(decimals)).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  }
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatPercent(percent: number, decimals = 1): string {
  return `${percent.toFixed(decimals)}%`
}
