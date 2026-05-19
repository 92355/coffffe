'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  resultCount: number
  className?: string
}

export default function SearchBar({ value, onChange, resultCount, className = '' }: SearchBarProps) {
  return (
    <div className={`rounded-2xl border border-[#eee4d8] bg-white shadow-[0_10px_30px_rgba(80,54,28,0.08)] ${className}`}>
      <label className="flex h-12 items-center gap-3 px-4">
        <Search size={18} className="shrink-0 text-[#8b6f57]" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="카페, 지역, 메뉴 검색"
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#2c2118] outline-none placeholder:text-[#b8aa9b]"
          type="search"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f4eee7] text-[#8b6f57] transition-colors hover:bg-[#eadfd4]"
            aria-label="검색어 지우기"
          >
            <X size={14} />
          </button>
        ) : (
          <span className="shrink-0 rounded-full bg-[#f4eee7] px-2.5 py-1 text-xs font-black text-[#8a4a16]">
            {resultCount}
          </span>
        )}
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#6f4a2b] transition-colors hover:bg-[#f4eee7]"
          aria-label="상세 필터"
        >
          <SlidersHorizontal size={17} />
        </button>
      </label>
    </div>
  )
}
