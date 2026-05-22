'use client'

import { startTransition, useEffect, useRef, useState } from 'react'
import { Pencil, Trash2, Users, X, Check, Upload } from 'lucide-react'

interface Member {
  id: string
  kakao_id: string
  site_nickname: string | null
  site_animal: string | null
  nickname: string | null
  profile_image_url: string | null
  created_at: string
  cbti_type: string | null
}

type EditForm = {
  site_nickname: string
  site_animal: string
  profile_image_url: string
  cbti_type: string
}

const CBTI_TYPES = [
  'LSEH', 'LSEC', 'LSFH', 'LSFC',
  'LBEH', 'LBEC', 'LBFH', 'LBFC',
  'DSEH', 'DSEC', 'DSFH', 'DSFC',
  'DBEH', 'DBEC', 'DBFH', 'DBFC',
]

async function readApiError(res: Response): Promise<string> {
  try {
    const b = await res.json() as { error?: unknown }
    return typeof b.error === 'string' ? b.error : `Error ${res.status}`
  } catch { return `Error ${res.status}` }
}

export default function MembersAdminPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({ site_nickname: '', site_animal: '', profile_image_url: '', cbti_type: '' })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function loadMembers() {
    const res = await fetch('/api/admin/members', { cache: 'no-store', credentials: 'same-origin' })
    if (!res.ok) throw new Error(await readApiError(res))
    setMembers(await res.json() as Member[])
  }

  useEffect(() => {
    startTransition(() => {
      void loadMembers().catch(err => { console.error(err); setMessage('회원 목록을 불러오지 못했습니다.') })
    })
  }, [])

  function startEdit(member: Member) {
    setEditingId(member.id)
    setEditForm({
      site_nickname: member.site_nickname ?? '',
      site_animal: member.site_animal ?? '',
      profile_image_url: member.profile_image_url ?? '',
      cbti_type: member.cbti_type ?? '',
    })
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(id: string) {
    setMessage('저장 중...')
    const res = await fetch('/api/admin/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({
        id,
        site_nickname: editForm.site_nickname.trim(),
        site_animal: editForm.site_animal.trim(),
        profile_image_url: editForm.profile_image_url.trim(),
        cbti_type: editForm.cbti_type || null,
      }),
    })
    if (!res.ok) { setMessage(`저장 실패: ${await readApiError(res)}`); return }
    setEditingId(null)
    await loadMembers()
    setMessage('저장했습니다.')
  }

  async function deleteMember(id: string, nickname: string | null) {
    if (!confirm(`"${nickname ?? id}" 회원을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return
    setMessage('삭제 중...')
    const res = await fetch(`/api/admin/members?id=${encodeURIComponent(id)}`, {
      method: 'DELETE', credentials: 'same-origin',
    })
    if (!res.ok) { setMessage(`삭제 실패: ${await readApiError(res)}`); return }
    await loadMembers()
    setMessage('삭제했습니다.')
  }

  function f(key: keyof EditForm, value: string) {
    setEditForm(prev => ({ ...prev, [key]: value }))
  }

  async function uploadAvatar(file: File) {
    if (!editingId) return
    setUploading(true)
    setMessage('이미지 업로드 중...')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('userId', editingId)
    const res = await fetch('/api/admin/members/avatar', { method: 'POST', credentials: 'same-origin', body: fd })
    setUploading(false)
    if (!res.ok) { setMessage(`업로드 실패: ${await readApiError(res)}`); return }
    const { url } = await res.json() as { url: string }
    setEditForm(prev => ({ ...prev, profile_image_url: url }))
    await loadMembers()
    setMessage('이미지를 업로드했습니다.')
  }

  return (
    <div className="px-5 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Users size={20} className="text-[#5a2e11]" />
        <h1 className="text-xl font-black text-[#3f2618]">회원 관리</h1>
        <span className="ml-1 rounded-full bg-[#f7eee5] px-3 py-1 text-xs font-black text-[#8b5a32]">{members.length}명</span>
      </div>

      {message && <p className="mb-4 text-sm font-bold text-[#8b5a32]">{message}</p>}

      <div className="rounded-lg border border-[#eadfd3] bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#eadfd3] bg-[#faf7f3]">
              <th className="px-4 py-3 text-left text-xs font-black text-[#7a6654]">프로필</th>
              <th className="px-4 py-3 text-left text-xs font-black text-[#7a6654]">닉네임 / 동물</th>
              <th className="px-4 py-3 text-left text-xs font-black text-[#7a6654]">카카오 닉네임</th>
              <th className="px-4 py-3 text-left text-xs font-black text-[#7a6654]">CBTI</th>
              <th className="px-4 py-3 text-left text-xs font-black text-[#7a6654]">가입일</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {members.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm font-bold text-[#7a6654]">
                  가입한 회원이 없습니다.
                </td>
              </tr>
            )}
            {members.map(member => (
              <>
                <tr key={member.id} className="border-b border-[#eadfd3] last:border-0 hover:bg-[#faf7f3]">
                  {/* Avatar */}
                  <td className="px-4 py-3">
                    {member.profile_image_url ? (
                      <img
                        src={member.profile_image_url}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover border border-[#eadfd3]"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-[#f7eee5] border border-[#eadfd3] flex items-center justify-center text-sm">
                        {(member.site_nickname ?? member.nickname ?? '?')[0]}
                      </div>
                    )}
                  </td>
                  {/* Nickname + animal */}
                  <td className="px-4 py-3">
                    <span className="font-semibold text-[#3f2618]">{member.site_nickname ?? '-'}</span>
                    {member.site_animal && (
                      <span className="ml-1 text-xs text-[#8b7a68]">({member.site_animal})</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#5f4634]">{member.nickname ?? '-'}</td>
                  <td className="px-4 py-3">
                    {member.cbti_type
                      ? <span className="rounded-full bg-[#f7eee5] px-2 py-0.5 text-xs font-black text-[#8b5a32]">{member.cbti_type}</span>
                      : <span className="text-xs text-[#bbb]">-</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-xs text-[#8b7a68]">
                    {new Date(member.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => editingId === member.id ? cancelEdit() : startEdit(member)}
                        className="rounded-md p-2 text-[#5a2e11] hover:bg-[#f7eee5]"
                      >
                        {editingId === member.id ? <X size={15} /> : <Pencil size={15} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteMember(member.id, member.site_nickname)}
                        className="rounded-md p-2 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Inline edit row */}
                {editingId === member.id && (
                  <tr key={`${member.id}-edit`} className="border-b border-[#eadfd3] bg-[#fdf8f4]">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                        <label className="block text-xs font-black text-[#5f4634]">
                          사이트 닉네임
                          <input
                            value={editForm.site_nickname}
                            onChange={e => f('site_nickname', e.target.value)}
                            className="mt-1 h-9 w-full rounded-md border border-[#d8c8b8] px-3 text-sm font-semibold outline-none focus:border-[#d66612]"
                          />
                        </label>
                        <label className="block text-xs font-black text-[#5f4634]">
                          동물
                          <input
                            value={editForm.site_animal}
                            onChange={e => f('site_animal', e.target.value)}
                            placeholder="고양이"
                            className="mt-1 h-9 w-full rounded-md border border-[#d8c8b8] px-3 text-sm font-semibold outline-none focus:border-[#d66612]"
                          />
                        </label>
                        <label className="block text-xs font-black text-[#5f4634]">
                          CBTI 유형
                          <select
                            value={editForm.cbti_type}
                            onChange={e => f('cbti_type', e.target.value)}
                            className="mt-1 h-9 w-full rounded-md border border-[#d8c8b8] px-3 text-sm font-semibold outline-none focus:border-[#d66612] bg-white"
                          >
                            <option value="">없음</option>
                            {CBTI_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </label>
                        <div className="block text-xs font-black text-[#5f4634]">
                          프로필 이미지
                          <div className="mt-1 flex items-center gap-2">
                            {editForm.profile_image_url ? (
                              <img src={editForm.profile_image_url} alt="" className="h-9 w-9 rounded-full object-cover border border-[#eadfd3] shrink-0" />
                            ) : (
                              <div className="h-9 w-9 rounded-full bg-[#f7eee5] border border-[#eadfd3] shrink-0" />
                            )}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploading}
                              className="flex items-center gap-1.5 rounded-md border border-[#d8c8b8] px-3 h-9 text-xs font-black text-[#5f4634] hover:bg-[#f7eee5] disabled:opacity-50"
                            >
                              <Upload size={13} />
                              {uploading ? '업로드 중...' : '파일 선택'}
                            </button>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="hidden"
                              onChange={e => { const f = e.target.files?.[0]; if (f) void uploadAvatar(f) }}
                            />
                            {editForm.profile_image_url && (
                              <button
                                type="button"
                                onClick={() => f('profile_image_url', '')}
                                className="text-xs text-red-600 hover:underline"
                              >
                                제거
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => void saveEdit(member.id)}
                          className="flex items-center gap-1.5 rounded-md bg-[#d66612] px-4 py-2 text-xs font-black text-white"
                        >
                          <Check size={13} />저장
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-md border border-[#eadfd3] px-4 py-2 text-xs font-black text-[#5f4634]"
                        >
                          취소
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
