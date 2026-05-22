import { BarChart3 } from 'lucide-react'

export default function StatsAdminPage() {
  return (
    <div className="px-5 py-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 size={20} className="text-[#5a2e11]" />
        <h1 className="text-xl font-black text-[#3f2618]">통계</h1>
      </div>

      <div className="rounded-lg border border-dashed border-[#d8c8b8] bg-white px-6 py-12 text-center shadow-sm">
        <BarChart3 size={32} className="mx-auto mb-3 text-[#d8c8b8]" />
        <p className="text-sm font-bold text-[#8b7a68]">통계 기능은 준비 중입니다.</p>
      </div>
    </div>
  )
}
