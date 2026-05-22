'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import type { Cafe } from '@/types/cafe'

interface Props {
  cafes: Cafe[]
}

export default function FeaturedCafesSection({ cafes }: Props) {
  return (
    <section className="bg-[#f3ede4] px-5 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="text-[11px] font-black uppercase tracking-widest text-[#b45a12]">FEATURED</p>
          <h2 className="mt-2 text-3xl font-black text-[#2a1d14]">지금 추천하는 카페</h2>
        </div>

        <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cafes.map((cafe, i) => (
            <motion.div
              key={cafe.id}
              className="flex"
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: i * 0.13, ease: [0.34, 1.2, 0.64, 1] }}
              viewport={{ once: true, margin: '-40px' }}
            >
              <Link
                href={`/cafes/${cafe.id}`}
                className="group flex w-full flex-col overflow-hidden rounded-3xl border border-[#e5d5c0] bg-white no-underline shadow-[0_8px_24px_rgba(90,46,17,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(90,46,17,0.16)]"
              >
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden bg-[#eddfc9]">
                  {cafe.images?.[0] ? (
                    <Image
                      src={cafe.images[0]}
                      alt={cafe.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      unoptimized
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl text-[#c09060]">
                      ☕
                    </div>
                  )}
                  <div className="absolute left-3 top-3 flex flex-wrap gap-1">
                    {cafe.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-black/35 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 text-xs font-black text-white backdrop-blur-sm">
                    <Star size={11} fill="currentColor" /> {cafe.qualityScore}
                  </span>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-black text-[#2a1d14]">{cafe.name}</h3>
                  <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-5 text-[#7d6149]">
                    {cafe.shortDescription}
                  </p>
                  <p className="mt-3 text-[10px] font-bold text-[#b0916d]">{cafe.openHours}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/map"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[#8fae5a] bg-[#8fae5a] px-7 text-sm font-black text-white no-underline transition-all hover:border-[#5a2e11] hover:bg-[#5a2e11]"
          >
            전체 카페 보기 →
          </Link>
        </div>
      </div>
    </section>
  )
}
