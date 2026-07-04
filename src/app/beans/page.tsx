import { createSupabaseClient } from '@/lib/supabase'
import { BEANS, BEAN_COVER_IMAGE_BY_ID } from '@/data/beans'
import type { Bean } from '@/data/beans'
import BeansClient from './BeansClient'

// Without this the page is prerendered at build time, freezing Supabase data
// (admin bean edits would never appear until the next deploy).
// 이 설정이 없으면 빌드 시점에 정적 생성되어 Supabase 데이터가 배포 시점으로 고정된다.
export const dynamic = 'force-dynamic'

interface DatabaseBean {
  id: string
  name: string
  name_en: string
  origin: string
  region: string
  variety: string
  process: string
  roast: string
  notes: string[]
  body: string
  acidity: string
  description: string
  flag: string
  image_url?: string | null
  special: string | null
}

function toBean(row: DatabaseBean): Bean {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    origin: row.origin,
    region: row.region,
    variety: row.variety,
    process: row.process as Bean['process'],
    roast: row.roast as Bean['roast'],
    notes: row.notes,
    body: row.body,
    acidity: row.acidity,
    desc: row.description,
    flag: row.flag,
    image: row.image_url ?? BEAN_COVER_IMAGE_BY_ID[row.id],
    special: row.special ?? undefined,
  }
}

async function fetchBeans(): Promise<Bean[]> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('beans')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data as DatabaseBean[]).map(toBean)
  } catch {
    return BEANS
  }
}

export default async function BeansPage() {
  const beans = await fetchBeans()
  return <BeansClient initialBeans={beans} />
}
