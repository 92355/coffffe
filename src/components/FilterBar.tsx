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
    <label className="relative flex-1">
      <span className="sr-only">{label}</span>
      <select
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value ? (event.target.value as T) : null)}
        className="h-9 w-full appearance-none rounded-full border border-[#eadfd3] bg-white py-0 pl-3.5 pr-8 text-xs font-black text-[#5f4634] outline-none shadow-sm transition-all hover:border-[#c9a87e] hover:shadow-md focus:border-[#b56a2a] focus:shadow-[0_0_0_3px_rgba(181,106,42,0.12)]"
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
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <FilterSelect<RoastLevel>
          label="로스팅"
          value={filters.roastLevel}
          options={ROAST_LABELS}
          onChange={(roastLevel) => onChange({ ...filters, roastLevel })}
        />
        <FilterSelect<BeanOrigin>
          label="원두"
          value={filters.beanOrigin}
          options={ORIGIN_LABELS}
          onChange={(beanOrigin) => onChange({ ...filters, beanOrigin })}
        />
        <FilterSelect<BrewMethod>
          label="추출"
          value={filters.brewMethod}
          options={BREW_LABELS}
          onChange={(brewMethod) => onChange({ ...filters, brewMethod })}
        />
      </div>
      <button
        type="button"
        onClick={resetFilters}
        className="flex h-8 w-full items-center justify-center gap-1.5 rounded-full border border-[#eadfd3] bg-white text-xs font-bold text-[#8b6f57] transition-all hover:border-[#c9a87e] hover:shadow-sm"
      >
        <RotateCcw size={13} />
        필터 초기화
      </button>
    </div>
  )
}
