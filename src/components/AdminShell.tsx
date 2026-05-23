'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { BarChart3, Bean, Coffee, LayoutDashboard, Menu, MessageCircle, MessageSquare, Users, X } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard, exact: true },
  { href: '/admin/cafes', label: '카페 관리', icon: Coffee, exact: false },
  { href: '/admin/reports', label: '제보 관리', icon: MessageSquare, exact: false },
  { href: '/admin/reviews', label: '한줄평 관리', icon: MessageCircle, exact: false },
  { href: '/admin/beans', label: '원두 관리', icon: Bean, exact: false },
  { href: '/admin/members', label: '회원 관리', icon: Users, exact: false },
  { href: '/admin/stats', label: '통계', icon: BarChart3, exact: false },
]

function NavLink({ item, onClick }: { item: typeof NAV_ITEMS[0]; onClick?: () => void }) {
  const pathname = usePathname()
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors no-underline ${
        active ? 'bg-[#5a2e11] text-white' : 'text-[#5f4634] hover:bg-[#f7eee5]'
      }`}
    >
      <Icon size={16} />
      {item.label}
    </Link>
  )
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-dvh bg-[#f3eee7] text-[#2c2118]">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-white border-r border-[#eadfd3] fixed top-0 left-0 bottom-0 z-10">
        <div className="h-14 flex items-center px-4 border-b border-[#eadfd3] shrink-0">
          <span className="text-base font-black text-[#3f2618]">
            <span className="text-[#3f2618]">원</span><span className="text-[#8FAE5A]">두</span><span className="text-[#3f2618]">로</span>
          </span>
          <span className="ml-1.5 text-xs font-bold text-[#8b7a68]">관리자</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
          {NAV_ITEMS.map(item => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 h-14 flex items-center px-4 bg-white border-b border-[#eadfd3]">
        <span className="text-base font-black text-[#3f2618]">
          <span className="text-[#3f2618]">원</span><span className="text-[#8FAE5A]">두</span><span className="text-[#3f2618]">로</span>
        </span>
        <span className="ml-1.5 text-xs font-bold text-[#8b7a68]">관리자</span>
        <button
          type="button"
          onClick={() => setMobileOpen(v => !v)}
          className="ml-auto rounded-md p-2 text-[#5f4634] hover:bg-[#f7eee5]"
          aria-label="메뉴"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-20 bg-black/20"
            onClick={() => setMobileOpen(false)}
          />
          <div className="lg:hidden fixed top-14 left-0 right-0 z-30 bg-white border-b border-[#eadfd3] shadow-lg">
            <nav className="px-3 py-2 flex flex-col gap-0.5">
              {NAV_ITEMS.map(item => (
                <NavLink key={item.href} item={item} onClick={() => setMobileOpen(false)} />
              ))}
            </nav>
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-56 pt-14 lg:pt-0 min-h-dvh">
        {children}
      </div>
    </div>
  )
}
