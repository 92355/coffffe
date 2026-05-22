import type { Cafe, RoastLevel, BeanOrigin, BrewMethod } from '@/types/cafe'
import { createSupabaseAdminClient } from '@/lib/supabase'
import HomeExperience from '@/components/home/HomeExperience'

async function getFeaturedCafes(): Promise<Cafe[]> {
  try {
    const { data, error } = await createSupabaseAdminClient()
      .from('cafes')
      .select('*')
      .order('quality_score', { ascending: false })
      .limit(3)
    if (error || !data) return []
    return data.map((d) => ({
      id: d.id,
      name: d.name,
      shortDescription: d.short_description,
      fullDescription: d.full_description,
      address: d.address,
      lat: d.lat,
      lng: d.lng,
      roastLevels: d.roast_levels as RoastLevel[],
      beanOrigins: d.bean_origins as BeanOrigin[],
      brewMethods: d.brew_methods as BrewMethod[],
      qualityScore: d.quality_score,
      tags: d.tags,
      openHours: d.open_hours,
      closedDays: d.closed_days,
      images: d.images,
      phone: d.phone ?? undefined,
      instagramHandle: d.instagram_handle ?? undefined,
      kakaoPlaceId: d.kakao_place_id ?? undefined,
      updatedAt: d.updated_at,
    }))
  } catch {
    return []
  }
}

export default async function HomePage() {
  const featuredCafes = await getFeaturedCafes()

  return <HomeExperience featuredCafes={featuredCafes} />
}
