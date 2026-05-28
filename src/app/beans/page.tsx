import { createSupabaseClient } from '@/lib/supabase'
import { BEANS, BEAN_COVER_IMAGE_BY_ID } from '@/data/beans'
import type { Bean } from '@/data/beans'
import BeansClient from './BeansClient'

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
