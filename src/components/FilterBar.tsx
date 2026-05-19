'use client'

import { ChevronDown, RotateCcw } from 'lucide-react'
import type { BeanOrigin, BrewMethod, FilterState, RoastLevel } from '@/types/cafe'
import { BREW_LABELS, ORIGIN_LABELS, ROAST_LABELS } from '@/types/cafe'

interface FilterBarProps {
  filters: FilterState
  onChange: (next: FilterState) => void
  layout?: 'row' | 'stack'
}

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T | null
  options: Record<T, string>
  onChange: (value: T | null) => void
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value ? (event.target.value as T) : null)}
        className="h-9 min-w-[78px] appearance-none rounded-xl border border-[#eadfd3] bg-white py-0 pl-3 pr-8 text-xs font-black text-[#5f4634] outline-none transition-colors hover:border-[#d9c1ad] focus:border-[#b56a2a]"
      >
        <option value="">{label}</option>
        {Object.entries(options).map(([key, optionLabel]) => (
          <option key={key} value={key}>
            {optionLabel as string}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9a806a]"
      />
    </label>
  )
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const resetFilters = () => {
    onChange({ roastLevel: null, beanOrigin: null, brewMethod: null })
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
      <FilterSelect<RoastLevel>
        label="지역"
        value={filters.roastLevel}
        options={ROAST_LABELS}
        onChange={(roastLevel) => onChange({ ...filters, roastLevel })}
      />
      <FilterSelect<BeanOrigin>
        label="분위기"
        value={filters.beanOrigin}
        options={ORIGIN_LABELS}
        onChange={(beanOrigin) => onChange({ ...filters, beanOrigin })}
      />
      <FilterSelect<BrewMethod>
        label="가격대"
        value={filters.brewMethod}
        options={BREW_LABELS}
        onChange={(brewMethod) => onChange({ ...filters, brewMethod })}
      />
      <button
        type="button"
        onClick={resetFilters}
        className="ml-auto flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-2 text-xs font-bold text-[#8b6f57] transition-colors hover:bg-white"
      >
        <RotateCcw size={13} />
        필터 초기화
      </button>
    </div>
  )
}
