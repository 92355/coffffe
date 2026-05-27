'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BarChart3, Bean, Coffee, LayoutDashboard, Menu, MessageCircle, MessageSquare, Users, X } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard, exact: true },
  { href: '/admin/cafes', label: '카페 관리', icon: Coffee, exact: false },
  { href: '/admin/reports', label: '제보 관리', icon: MessageSquare, exact: false },
  { href: '/admin/reviews', label: '한줄평 관리', icon: MessageCircle, exact: false },
  { href: '/admin/beans', label: '원두 관리', icon: Bean, exact: false },
  { href: '/admin/members', label: '회원 관리', icon: Users, exact: false },
  { href: '/admin/stats', label: '통계', icon: BarChart3, exact: false },
]

// 모바일 하단 탭바에 노출할 핵심 메뉴 (최대 5개)
const MOBILE_BOTTOM_ITEMS = [
  NAV_ITEMS[0], // 대시보드
  NAV_ITEMS[1], // 카페
  NAV_ITEMS[2], // 제보
  NAV_ITEMS[4], // 원두
  NAV_ITEMS[5], // 회원
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

function BottomTab({ item }: { item: typeof NAV_ITEMS[0] }) {
  const pathname = usePathname()
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-black transition-colors no-underline ${
        active ? 'text-[#5a2e11]' : 'text-[#7a6654]'
      }`}
    >
      <Icon size={18} strokeWidth={active ? 2.4 : 2} />
      <span className="truncate text-[10px] leading-tight">{item.label.replace(' 관리', '')}</span>
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
        <div className="border-t border-[#eadfd3] p-2">
          <Link
            href="/home"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-bold text-[#5f4634] hover:bg-[#f7eee5] no-underline"
          >
            <ArrowLeft size={16} />사이트로
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 h-14 flex items-center px-4 bg-white border-b border-[#eadfd3]">
        <Link href="/home" className="flex items-center gap-1 text-[#5f4634]" aria-label="사이트로">
          <ArrowLeft size={18} />
        </Link>
        <span className="ml-3 text-base font-black text-[#3f2618]">
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
      <div className="flex-1 lg:ml-56 pt-14 lg:pt-0 pb-16 lg:pb-0 min-h-dvh">
        {children}
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 flex h-16 items-center border-t border-[#eadfd3] bg-white pb-[env(safe-area-inset-bottom)]">
        {MOBILE_BOTTOM_ITEMS.map(item => (
          <BottomTab key={item.href} item={item} />
        ))}
      </nav>
    </div>
  )
}
