'use client'

import { FormEvent, startTransition, useEffect, useState } from 'react'
import { Bean, Pencil, Trash2 } from 'lucide-react'
import type { Bean as BeanType } from '@/data/beans'
import { ROAST_LABEL } from '@/data/beans'

type BeanForm = {
  id: string; name: string; nameEn: string; origin: string; region: string
  variety: string; process: string; roast: string; notes: string
  body: string; acidity: string; desc: string; flag: string; special: string
}

const EMPTY_FORM: BeanForm = {
  id: '', name: '', nameEn: '', origin: '', region: '',
  variety: '', process: '워시드', roast: 'light', notes: '',
  body: '', acidity: '', desc: '', flag: '', special: '',
}

const PROCESS_OPTIONS = ['워시드', '내추럴', '허니', '웻헐드', '무산소']
const ROAST_OPTIONS = ['light', 'medium', 'medium-dark', 'dark'] as const

async function readApiError(res: Response): Promise<string> {
  try {
    const b = await res.json() as { error?: unknown }
    return typeof b.error === 'string' ? b.error : `Error ${res.status}`
  } catch { return `Error ${res.status}` }
}

function formToPayload(f: BeanForm) {
  return {
    id: f.id.trim(),
    name: f.name.trim(),
    nameEn: f.nameEn.trim(),
    origin: f.origin.trim(),
    region: f.region.trim(),
    variety: f.variety.trim(),
    process: f.process,
    roast: f.roast,
    notes: f.notes.split(',').map(n => n.trim()).filter(Boolean),
    body: f.body.trim(),
    acidity: f.acidity.trim(),
    desc: f.desc.trim(),
    flag: f.flag.trim(),
    special: f.special.trim() || undefined,
  }
}

export default function BeansAdminPage() {
  const [beans, setBeans] = useState<BeanType[]>([])
  const [form, setForm] = useState<BeanForm>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  async function loadBeans() {
    const res = await fetch('/api/beans', { cache: 'no-store' })
    if (!res.ok) throw new Error('원두 목록 로드 실패')
    setBeans(await res.json() as BeanType[])
  }

  useEffect(() => {
    startTransition(() => {
      void loadBeans().catch(err => { console.error(err); setMessage('원두 목록을 불러오지 못했습니다.') })
    })
  }, [])

  function f(key: keyof BeanForm, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function startEdit(bean: BeanType) {
    setEditingId(bean.id)
    setForm({
      id: bean.id,
      name: bean.name,
      nameEn: bean.nameEn,
      origin: bean.origin,
      region: bean.region,
      variety: bean.variety,
      process: bean.process,
      roast: bean.roast,
      notes: bean.notes.join(', '),
      body: bean.body,
      acidity: bean.acidity,
      desc: bean.desc,
      flag: bean.flag,
      special: bean.special ?? '',
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  async function saveBean(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('저장 중...')
    const payload = formToPayload(form)
    const res = await fetch('/api/admin/beans', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    })
    if (!res.ok) { setMessage(`저장 실패: ${await readApiError(res)}`); return }
    await loadBeans()
    setForm(EMPTY_FORM)
    setEditingId(null)
    setMessage('저장했습니다.')
  }

  async function deleteBean(id: string) {
    if (!confirm(`"${id}" 원두를 삭제하시겠습니까?`)) return
    setMessage('삭제 중...')
    const res = await fetch(`/api/admin/beans?id=${encodeURIComponent(id)}`, {
      method: 'DELETE', credentials: 'same-origin',
    })
    if (!res.ok) { setMessage(`삭제 실패: ${await readApiError(res)}`); return }
    await loadBeans()
    setMessage('삭제했습니다.')
  }

  return (
    <div className="px-5 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Bean size={20} className="text-[#5a2e11]" />
        <h1 className="text-xl font-black text-[#3f2618]">원두 관리</h1>
      </div>

      {message && <p className="mb-4 text-sm font-bold text-[#8b5a32]">{message}</p>}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Form */}
        <form onSubmit={saveBean} className="rounded-lg border border-[#eadfd3] bg-white p-5 shadow-sm">
          <h2 className="text-base font-black text-[#3f2618] mb-4">{editingId ? '원두 수정' : '원두 추가'}</h2>

          <div className="grid gap-3 md:grid-cols-2">
            <BeanInput label="ID (slug)" value={form.id} onChange={v => f('id', v)} disabled={!!editingId} />
            <BeanInput label="국기 이모지" value={form.flag} onChange={v => f('flag', v)} placeholder="🇵🇦" />
            <BeanInput label="한국어 이름" value={form.name} onChange={v => f('name', v)} />
            <BeanInput label="영문 이름" value={form.nameEn} onChange={v => f('nameEn', v)} />
            <BeanInput label="원산지 (국가)" value={form.origin} onChange={v => f('origin', v)} placeholder="파나마" />
            <BeanInput label="세부 지역" value={form.region} onChange={v => f('region', v)} placeholder="보케테 (Boquete)" />
            <BeanInput label="품종" value={form.variety} onChange={v => f('variety', v)} placeholder="게이샤 (Gesha)" />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="block text-sm font-bold text-[#5f4634]">
              가공 방식
              <select value={form.process} onChange={e => f('process', e.target.value)} className="mt-1 h-10 w-full rounded-md border border-[#d8c8b8] px-3 text-sm font-semibold outline-none focus:border-[#d66612] bg-white">
                {PROCESS_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            <label className="block text-sm font-bold text-[#5f4634]">
              로스팅
              <select value={form.roast} onChange={e => f('roast', e.target.value)} className="mt-1 h-10 w-full rounded-md border border-[#d8c8b8] px-3 text-sm font-semibold outline-none focus:border-[#d66612] bg-white">
                {ROAST_OPTIONS.map(r => <option key={r} value={r}>{ROAST_LABEL[r]}</option>)}
              </select>
            </label>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <BeanInput label="바디" value={form.body} onChange={v => f('body', v)} placeholder="가벼움" />
            <BeanInput label="산미" value={form.acidity} onChange={v => f('acidity', v)} placeholder="밝고 산뜻한 산미" />
          </div>

          <label className="mt-3 block text-sm font-bold text-[#5f4634]">
            향미 노트 (, 구분)
            <input value={form.notes} onChange={e => f('notes', e.target.value)} placeholder="자스민, 복숭아, 얼그레이" className="mt-1 h-10 w-full rounded-md border border-[#d8c8b8] px-3 text-sm font-semibold outline-none focus:border-[#d66612]" />
          </label>

          <label className="mt-3 block text-sm font-bold text-[#5f4634]">
            설명
            <textarea value={form.desc} onChange={e => f('desc', e.target.value)} rows={3} placeholder="한 줄 설명" className="mt-1 w-full rounded-md border border-[#d8c8b8] px-3 py-2 text-sm font-semibold outline-none focus:border-[#d66612]" />
          </label>

          <BeanInput label="특이사항 (선택)" value={form.special} onChange={v => f('special', v)} placeholder="세계 최고가 원두 중 하나" />

          <div className="mt-5 flex gap-3">
            <button type="submit" className="flex-1 h-11 rounded-md bg-[#d66612] text-sm font-black text-white">저장</button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="rounded-md border border-[#eadfd3] px-4 text-sm font-black text-[#5f4634]">취소</button>
            )}
          </div>
        </form>

        {/* Bean list */}
        <div className="rounded-lg border border-[#eadfd3] bg-white p-4 shadow-sm">
          <h2 className="text-base font-black text-[#3f2618] mb-4">등록된 원두 ({beans.length})</h2>
          <div className="space-y-2">
            {beans.map(bean => (
              <article key={bean.id} className="rounded-md border border-[#eadfd3] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl shrink-0">{bean.flag}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">{bean.name}</p>
                      <p className="text-xs text-[#7a6654] font-semibold">{ROAST_LABEL[bean.roast]}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button type="button" onClick={() => startEdit(bean)} className="rounded-md p-2 text-[#5a2e11] hover:bg-[#f7eee5]">
                      <Pencil size={15} />
                    </button>
                    <button type="button" onClick={() => void deleteBean(bean.id)} className="rounded-md p-2 text-red-700 hover:bg-red-50">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function BeanInput({ label, value, onChange, placeholder, disabled }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean
}) {
  return (
    <label className="block text-sm font-bold text-[#5f4634]">
      {label}
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="mt-1 h-10 w-full rounded-md border border-[#d8c8b8] px-3 text-sm font-semibold outline-none focus:border-[#d66612] disabled:opacity-50 disabled:bg-[#f7f4f0]"
      />
    </label>
  )
}
