'use client'

import type { ReactNode } from 'react'
import type { FilterState, RoastLevel, BeanOrigin, BrewMethod } from '@/types/cafe'
import { ROAST_LABELS, ORIGIN_LABELS, BREW_LABELS } from '@/types/cafe'

interface FilterBarProps {
  filters: FilterState
  onChange: (next: FilterState) => void
  layout?: 'row' | 'stack'
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

function FilterGroup({
  label,
  children,
  layout,
}: {
  label: string
  children: ReactNode
  layout: 'row' | 'stack'
}) {
  if (layout === 'row') {
    return (
      <>
        <span className="shrink-0 text-xs font-semibold text-gray-400 dark:text-gray-500">{label}</span>
        {children}
      </>
    )
  }

  return (
    <div>
      <p className="mb-2 text-xs font-bold text-neutral-500 dark:text-neutral-400">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

export default function FilterBar({ filters, onChange, layout = 'row' }: FilterBarProps) {
  const toggle = <T extends string>(key: keyof FilterState, value: T, current: T | null) => {
    onChange({ ...filters, [key]: current === value ? null : value })
  }

  return (
    <div className={layout === 'row' ? 'flex items-center gap-2 overflow-x-auto px-4 py-2.5 scrollbar-hide' : 'space-y-3'}>
      <FilterGroup label="로스팅" layout={layout}>
        {(Object.keys(ROAST_LABELS) as RoastLevel[]).map(r => (
          <Chip key={r} label={ROAST_LABELS[r]} active={filters.roastLevel === r}
            onClick={() => toggle('roastLevel', r, filters.roastLevel)} />
        ))}
      </FilterGroup>
      {layout === 'row' && <Divider />}
      <FilterGroup label="산지" layout={layout}>
        {(Object.keys(ORIGIN_LABELS) as BeanOrigin[]).map(o => (
          <Chip key={o} label={ORIGIN_LABELS[o]} active={filters.beanOrigin === o}
            onClick={() => toggle('beanOrigin', o, filters.beanOrigin)} />
        ))}
      </FilterGroup>
      {layout === 'row' && <Divider />}
      <FilterGroup label="추출" layout={layout}>
        {(Object.keys(BREW_LABELS) as BrewMethod[]).map(m => (
          <Chip key={m} label={BREW_LABELS[m]} active={filters.brewMethod === m}
            onClick={() => toggle('brewMethod', m, filters.brewMethod)} />
        ))}
      </FilterGroup>
    </div>
  )
}
