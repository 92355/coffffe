import HomeHeader from '@/components/home/HomeHeader'
import HomeContent from '@/components/home/HomeContent'

export default function AppHomePage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-[#fcf9f8] text-[#1b1c1c] dark:bg-[#161616] dark:text-[#f3f0ef]">
      <HomeHeader />
      <HomeContent />
    </main>
  )
}
