import Link from 'next/link'
import { Bean, Coffee, LayoutDashboard, MessageSquare, Users } from 'lucide-react'
import { createSupabaseAdminClient } from '@/lib/supabase'

async function getCounts() {
  try {
    const supabase = createSupabaseAdminClient()
    const [cafes, beans, reports, members] = await Promise.all([
      supabase.from('cafes').select('*', { count: 'exact', head: true }),
      supabase.from('beans').select('*', { count: 'exact', head: true }),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('users').select('*', { count: 'exact', head: true }),
    ])
    return {
      cafes: cafes.count ?? 0,
      beans: beans.count ?? 0,
      reports: reports.count ?? 0,
      members: members.count ?? 0,
    }
  } catch {
    return { cafes: 0, beans: 0, reports: 0, members: 0 }
  }
}

export default async function AdminDashboard() {
  const counts = await getCounts()

  const cards = [
    { label: '등록 카페', value: counts.cafes, icon: Coffee, href: '/admin/cafes', color: '#d66612' },
    { label: '등록 원두', value: counts.beans, icon: Bean, href: '/admin/beans', color: '#8FAE5A' },
    { label: '미처리 제보', value: counts.reports, icon: MessageSquare, href: '/admin/reports', color: '#9a4f0f' },
    { label: '가입 회원', value: counts.members, icon: Users, href: '/admin/members', color: '#5a2e11' },
  ]

  return (
    <div className="px-5 py-6">
      <div className="flex items-center gap-2 mb-6">
        <LayoutDashboard size={20} className="text-[#5a2e11]" />
        <h1 className="text-xl font-black text-[#3f2618]">대시보드</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => {
          const Icon = card.icon
          return (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-lg border border-[#eadfd3] bg-white p-5 shadow-sm hover:shadow-md transition-shadow no-underline block"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: card.color + '18' }}
                >
                  <Icon size={16} style={{ color: card.color }} />
                </div>
                <span className="text-sm font-bold text-[#7a6654]">{card.label}</span>
              </div>
              <span className="text-3xl font-black text-[#3f2618]">{card.value}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
