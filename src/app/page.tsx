import HomeHeader from '@/components/home/HomeHeader'
import HomeContent from '@/components/home/HomeContent'

export default function AppHomePage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(143,174,90,0.22),transparent_28%),radial-gradient(circle_at_90%_12%,rgba(192,138,90,0.26),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.76),rgba(240,229,218,0.68))] dark:bg-[radial-gradient(circle_at_10%_6%,rgba(160,192,104,0.16),transparent_30%),radial-gradient(circle_at_92%_14%,rgba(192,138,90,0.18),transparent_28%),linear-gradient(180deg,rgba(12,12,12,0.98),rgba(24,21,18,0.94))]"
      />
      <HomeHeader />
      <HomeContent />
    </main>
  )
}
