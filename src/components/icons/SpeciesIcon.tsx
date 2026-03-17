/**
 * Species Icon Component
 * SVG illustrations for each fish species with theme awareness
 */

import { useThemeStore } from '@store/theme-store'
import React from 'react'

interface SpeciesIconProps {
  size?: number
  animated?: boolean
  className?: string
}

export function WalleyeIcon({ size = 48, animated = false, className = '' }: SpeciesIconProps) {
  const { currentTheme } = useThemeStore()
  const color = currentTheme.colors.primary

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={animated ? 'animate-pulse' : className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body */}
      <ellipse cx="24" cy="24" rx="18" ry="12" fill={color} opacity="0.8" />
      {/* Head */}
      <circle cx="32" cy="24" r="10" fill={color} />
      {/* Eye (large, characteristic of walleye) */}
      <circle cx="35" cy="22" r="4" fill="white" />
      <circle cx="35" cy="22" r="2" fill="#000" />
      {/* Mouth */}
      <path d="M 38 24 Q 42 24 40 26" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Tail */}
      <path
        d="M 8 24 Q 4 20 2 16 Q 4 24 2 32 Q 4 28 8 24"
        fill={color}
        opacity="0.6"
      />
      {/* Fin */}
      <path d="M 20 14 Q 22 8 24 14" stroke={color} strokeWidth="1.5" fill="none" />
    </svg>
  )
}

export function BassIcon({ size = 48, animated = false, className = '' }: SpeciesIconProps) {
  const { currentTheme } = useThemeStore()
  const color = currentTheme.colors.primary

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={animated ? 'animate-bounce' : className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body */}
      <ellipse cx="24" cy="24" rx="16" ry="14" fill={color} />
      {/* Head with mouth open */}
      <path d="M 36 20 Q 40 22 38 26 Q 36 24 36 20" fill={color} />
      {/* Eye */}
      <circle cx="38" cy="22" r="3" fill="white" />
      <circle cx="38" cy="22" r="1.5" fill="#000" />
      {/* Gills */}
      <path d="M 28 18 L 28 30" stroke={color} strokeWidth="1.5" opacity="0.5" />
      {/* Tail - forked */}
      <path
        d="M 8 18 L 2 10 M 8 24 L 2 24 M 8 30 L 2 38"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Dorsal fin - prominent */}
      <path d="M 18 12 L 22 6 L 26 12" fill={color} opacity="0.7" />
    </svg>
  )
}

export function PikeIcon({ size = 48, animated = false, className = '' }: SpeciesIconProps) {
  const { currentTheme } = useThemeStore()
  const color = currentTheme.colors.primary

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={animated ? 'animate-pulse' : className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sleek body */}
      <ellipse cx="24" cy="24" rx="18" ry="10" fill={color} />
      {/* Pointed head */}
      <path d="M 40 24 L 44 22 L 42 24 L 44 26 Z" fill={color} />
      {/* Sharp teeth lines */}
      <line x1="42" y1="22" x2="44" y2="20" stroke={color} strokeWidth="1" opacity="0.6" />
      <line x1="42" y1="26" x2="44" y2="28" stroke={color} strokeWidth="1" opacity="0.6" />
      {/* Eye */}
      <circle cx="39" cy="24" r="2.5" fill="white" />
      <circle cx="39" cy="24" r="1.2" fill="#000" />
      {/* Aggressive fin */}
      <path d="M 22 16 L 18 8 L 20 16" fill={color} opacity="0.7" />
      {/* Tail */}
      <path
        d="M 6 20 L 0 16 M 6 24 L 0 24 M 6 28 L 0 32"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function MuskyIcon({ size = 48, animated = false, className = '' }: SpeciesIconProps) {
  const { currentTheme } = useThemeStore()
  const color = currentTheme.colors.primary

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={animated ? 'animate-pulse' : className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Large body */}
      <ellipse cx="24" cy="24" rx="19" ry="11" fill={color} />
      {/* Elongated head */}
      <path d="M 40 24 L 46 22 L 44 24 L 46 26 Z" fill={color} />
      {/* Large eye - trophy worthy */}
      <circle cx="41" cy="24" r="3.5" fill="white" />
      <circle cx="41" cy="24" r="1.8" fill="#000" />
      {/* Multiple fins - ornate */}
      <path d="M 20 14 L 18 6 L 22 14" fill={color} opacity="0.8" />
      <path d="M 28 34 L 26 42 L 30 34" fill={color} opacity="0.8" />
      {/* Large tail - powerful */}
      <path
        d="M 5 18 L -2 12 M 5 24 L -2 24 M 5 30 L -2 36"
        stroke={color}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Gill marks - detailed */}
      <path d="M 30 18 L 32 12 M 30 30 L 32 36" stroke={color} strokeWidth="1.5" opacity="0.6" />
    </svg>
  )
}

export function SalmonIcon({ size = 48, animated = false, className = '' }: SpeciesIconProps) {
  const { currentTheme } = useThemeStore()
  const color = currentTheme.colors.primary

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={animated ? 'animate-pulse' : className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body - curved upward (jumping pose) */}
      <path
        d="M 24 32 Q 20 20 28 10 Q 32 18 30 32"
        fill={color}
        stroke={color}
        strokeWidth="1.5"
      />
      {/* Head */}
      <circle cx="28" cy="10" r="6" fill={color} />
      {/* Eye */}
      <circle cx="31" cy="9" r="2" fill="white" />
      <circle cx="31" cy="9" r="1" fill="#000" />
      {/* Mouth (hooked - characteristic of spawning salmon) */}
      <path d="M 32 12 Q 34 14 32 15" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Dorsal fin - flowing */}
      <path d="M 22 16 Q 20 10 24 8 Q 28 10 26 16" fill={color} opacity="0.7" />
      {/* Tail - flowing and dynamic */}
      <path
        d="M 22 32 Q 16 30 14 36 M 22 32 Q 16 34 14 28"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Side stripe (characteristic of salmon) */}
      <path d="M 26 18 Q 25 22 24 28" stroke={color} strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

interface ActionIconProps {
  size?: number
  className?: string
  type: 'jump' | 'strike' | 'trophy' | 'improve' | 'big-fish'
}

export function ActionIcon({ size = 32, className = '', type }: ActionIconProps) {
  const { currentTheme } = useThemeStore()
  const color = currentTheme.colors.accent

  const icons: Record<string, React.ReactNode> = {
    jump: (
      <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        {/* Fish jumping arc */}
        <path d="M 6 20 Q 16 4 26 20" stroke={color} strokeWidth="2" fill="none" />
        {/* Water splash */}
        <circle cx="4" cy="24" r="1.5" fill={color} opacity="0.7" />
        <circle cx="6" cy="26" r="1.2" fill={color} opacity="0.6" />
        <circle cx="26" cy="24" r="1.5" fill={color} opacity="0.7" />
        <circle cx="28" cy="26" r="1.2" fill={color} opacity="0.6" />
      </svg>
    ),
    strike: (
      <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        {/* Explosive strike lines */}
        <path d="M 16 4 L 16 28" stroke={color} strokeWidth="2" />
        <path d="M 6 14 L 26 14" stroke={color} strokeWidth="2" />
        <path d="M 8 8 L 24 24" stroke={color} strokeWidth="1.5" opacity="0.7" />
        <path d="M 24 8 L 8 24" stroke={color} strokeWidth="1.5" opacity="0.7" />
      </svg>
    ),
    trophy: (
      <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        {/* Trophy cup */}
        <rect x="8" y="6" width="16" height="12" rx="2" fill="none" stroke={color} strokeWidth="1.5" />
        <circle cx="10" cy="10" r="2" fill="none" stroke={color} strokeWidth="1.5" />
        <circle cx="22" cy="10" r="2" fill="none" stroke={color} strokeWidth="1.5" />
        {/* Stem */}
        <rect x="14" y="18" width="4" height="6" fill={color} opacity="0.7" />
        {/* Base */}
        <rect x="6" y="24" width="20" height="2" fill={color} opacity="0.7" />
        {/* Star on top */}
        <path d="M 16 2 L 18 6 L 22 6 L 19 9 L 20 13 L 16 10 L 12 13 L 13 9 L 10 6 L 14 6 Z" fill={color} />
      </svg>
    ),
    improve: (
      <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        {/* Upward arrow */}
        <path d="M 16 28 L 16 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M 16 6 L 10 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M 16 6 L 22 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
        {/* Progress bars */}
        <rect x="4" y="14" width="8" height="2" fill={color} opacity="0.5" />
        <rect x="4" y="18" width="12" height="2" fill={color} opacity="0.7" />
        <rect x="4" y="22" width="16" height="2" fill={color} />
      </svg>
    ),
    'big-fish': (
      <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        {/* Large fish silhouette */}
        <ellipse cx="16" cy="16" rx="12" ry="8" fill={color} opacity="0.8" />
        <path d="M 4 16 L 0 12 L 2 16 L 0 20 Z" fill={color} />
        <circle cx="22" cy="14" r="2.5" fill="white" opacity="0.8" />
        <circle cx="22" cy="14" r="1.2" fill={color} />
      </svg>
    ),
  }

  return <div className={className}>{icons[type]}</div>
}
