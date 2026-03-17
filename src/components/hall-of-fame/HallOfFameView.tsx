/**
 * Hall of Fame View
 * Displays all-time tournament records with trophy showcase
 */

import { useState } from 'react'
import { useHallOfFame } from '@hooks/useHallOfFame'
import { useThemeStore } from '@store/theme-store'
import { AnimatedSpeciesIcon } from '@components/icons/AnimatedSpeciesIcon'
import RecordCard from './RecordCard'
import { RecordCategory } from '@modules/hall-of-fame'

const CATEGORY_FILTERS: { id: RecordCategory; label: string; icon: string }[] = [
  { id: 'biggestFish', label: 'Biggest Fish', icon: '🐟' },
  { id: 'bestTeamTotal', label: 'Best Team Total', icon: '⚖️' },
  { id: 'mostConsistent', label: 'Most Consistent', icon: '📊' }
]

export default function HallOfFameView() {
  const { records, isLoading, isEmpty } = useHallOfFame()
  const { currentTheme } = useThemeStore()
  const [selectedCategory, setSelectedCategory] = useState<RecordCategory | 'all'>('all')

  const filteredRecords =
    selectedCategory === 'all'
      ? records
      : records.filter((r) => r.category === selectedCategory)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <AnimatedSpeciesIcon variant="loading" size={80} />
          <p className="text-lg font-semibold">Loading Hall of Fame...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-transparent to-transparent p-6 md:p-8 border-b-2" style={{ borderColor: currentTheme.colors.accent }}>
        <div className="max-w-6xl mx-auto flex items-center gap-6">
          <AnimatedSpeciesIcon variant="hero" size={72} />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: currentTheme.colors.primary }}>
              Hall of Fame
            </h1>
            <p className="text-gray-600 mt-2">All-time tournament records and legendary achievements</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b-2 p-4 md:p-6" style={{ borderColor: currentTheme.colors.border }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedCategory === 'all' ? 'opacity-100 font-bold' : 'opacity-60 hover:opacity-80'
              }`}
              style={{
                backgroundColor: selectedCategory === 'all' ? currentTheme.colors.accent : 'transparent',
                color: selectedCategory === 'all' ? currentTheme.colors.text : currentTheme.colors.text,
                border: `2px solid ${currentTheme.colors.border}`
              }}
            >
              All Records
            </button>
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  selectedCategory === cat.id ? 'opacity-100 font-bold' : 'opacity-60 hover:opacity-80'
                }`}
                style={{
                  backgroundColor: selectedCategory === cat.id ? currentTheme.colors.accent : 'transparent',
                  color: selectedCategory === cat.id ? currentTheme.colors.text : currentTheme.colors.text,
                  border: `2px solid ${currentTheme.colors.border}`
                }}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {isEmpty ? (
            <div className="text-center py-12">
              <p className="text-lg opacity-75 mb-4">No records yet. Participate in tournaments to build the Hall of Fame!</p>
              <AnimatedSpeciesIcon variant="idle" size={80} className="inline-block opacity-50" />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg opacity-75">No records in this category yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record, idx) => (
                <RecordCard key={`${record.category}-${record.teamNumber}`} record={record} rank={idx + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
