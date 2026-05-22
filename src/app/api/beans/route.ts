import { NextResponse } from 'next/server'
import type { Bean } from '@/data/beans'
import { BEANS } from '@/data/beans'
import { createSupabaseClient } from '@/lib/supabase'

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
    special: row.special ?? undefined,
  }
}

export async function GET() {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('beans')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json((data as DatabaseBean[]).map(toBean))
  } catch {
    return NextResponse.json(BEANS)
  }
}
