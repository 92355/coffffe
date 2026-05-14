'use client'

import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  resultCount: number
  className?: string
}

export default function SearchBar({ value, onChange, resultCount, className = '' }: SearchBarProps) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/95 shadow-lg shadow-black/10 backdrop-blur dark:bg-neutral-900/95 ${className}`}>
      <label className="flex h-12 items-center gap-3 px-4">
        <Search size={18} className="shrink-0 text-amber-700 dark:text-amber-400" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="카페명 검색"
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100"
          type="search"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            aria-label="검색어 지우기"
          >
            <X size={14} />
          </button>
        )}
        <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
          {resultCount}
        </span>
      </label>
    </div>
  )
}
