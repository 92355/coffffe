'use client'

import type { FilterState, RoastLevel, BeanOrigin, BrewMethod } from '@/types/cafe'
import { ROAST_LABELS, ORIGIN_LABELS, BREW_LABELS } from '@/types/cafe'

interface FilterBarProps {
  filters: FilterState
  onChange: (next: FilterState) => void
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 h-8 rounded-full px-3 text-sm font-medium transition-colors ${
        active
          ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700'
      }`}
    >
      {label}
    </button>
  )
}

function Divider() {
  return <div className="shrink-0 w-px h-5 bg-gray-200 dark:bg-gray-700 self-center mx-0.5" />
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const toggle = <T extends string>(key: keyof FilterState, value: T, current: T | null) => {
    onChange({ ...filters, [key]: current === value ? null : value })
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto px-4 py-2.5 scrollbar-hide">
      <span className="shrink-0 text-xs font-semibold text-gray-400 dark:text-gray-500">로스팅</span>
      {(Object.keys(ROAST_LABELS) as RoastLevel[]).map(r => (
        <Chip key={r} label={ROAST_LABELS[r]} active={filters.roastLevel === r}
          onClick={() => toggle('roastLevel', r, filters.roastLevel)} />
      ))}
      <Divider />
      <span className="shrink-0 text-xs font-semibold text-gray-400 dark:text-gray-500">산지</span>
      {(Object.keys(ORIGIN_LABELS) as BeanOrigin[]).map(o => (
        <Chip key={o} label={ORIGIN_LABELS[o]} active={filters.beanOrigin === o}
          onClick={() => toggle('beanOrigin', o, filters.beanOrigin)} />
      ))}
      <Divider />
      <span className="shrink-0 text-xs font-semibold text-gray-400 dark:text-gray-500">추출</span>
      {(Object.keys(BREW_LABELS) as BrewMethod[]).map(m => (
        <Chip key={m} label={BREW_LABELS[m]} active={filters.brewMethod === m}
          onClick={() => toggle('brewMethod', m, filters.brewMethod)} />
      ))}
    </div>
  )
}
