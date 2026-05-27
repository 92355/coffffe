'use client'

import { type KeyboardEvent, useRef, useState } from 'react'
import { X } from 'lucide-react'

interface TagInputProps {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
}

export default function TagInput({ label, values, onChange, placeholder, className }: TagInputProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function addTag(value: string) {
    const trimmed = value.trim()
    if (!trimmed || values.includes(trimmed)) return
    onChange([...values, trimmed])
    setInput('')
  }

  function removeTag(tag: string) {
    onChange(values.filter(v => v !== tag))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && values.length > 0) {
      removeTag(values[values.length - 1])
    }
  }

  return (
    <label className={`block text-sm font-bold text-[#5f4634] ${className ?? ''}`}>
      {label}
      <div
        className="mt-1 flex min-h-10 cursor-text flex-wrap gap-1.5 rounded-md border border-[#d8c8b8] px-2 py-1.5 focus-within:border-[#d66612]"
        onClick={() => inputRef.current?.focus()}
      >
        {values.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-[#f7eee5] px-2 py-0.5 text-xs font-bold text-[#5a2e11]"
          >
            {tag}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); removeTag(tag) }}
              className="text-[#8b5a32] hover:text-[#5a2e11]"
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(input)}
          placeholder={values.length === 0 ? placeholder : ''}
          className="min-w-20 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-[#bbb]"
        />
      </div>
    </label>
  )
}
