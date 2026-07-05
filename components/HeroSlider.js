'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function HeroSlider({ banners = [] }) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!banners.length) return
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [banners.length])

  if (!banners.length) {
    return null
  }

  const activeBanner = banners[activeIndex]

  return (
    <section className="relative overflow-hidden w-full">
      <div
        className="relative h-[220px] overflow-hidden bg-cover bg-center sm:h-[260px] md:h-[300px]"
        style={{ backgroundColor: activeBanner.bgColor || '#D92F2F' }}
      >
        {activeBanner.imageUrl ? (
          <img
            src={activeBanner.imageUrl}
            alt={activeBanner.title || 'Hero banner'}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 mx-auto flex h-full items-center justify-center px-4 text-center sm:px-6 lg:px-8">
          <div className="relative w-full max-w-3xl px-5 py-6 sm:px-8 sm:py-8">
            {activeBanner.ctaText ? (
              <Link
                href={activeBanner.ctaHref || '/'}
                className="absolute inset-0 z-10"
                aria-label={activeBanner.ctaText}
              />
            ) : null}
            <div className="relative z-20">
              <div className="mb-4 inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white">
                Featured Course
              </div>
              <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
                {activeBanner.title}
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/85 sm:text-base lg:text-lg">
                {activeBanner.subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setActiveIndex((activeIndex + banners.length - 1) % banners.length)}
            className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-black shadow-lg shadow-black/10 transition hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setActiveIndex((activeIndex + 1) % banners.length)}
            className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-black shadow-lg shadow-black/10 transition hover:bg-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                index === activeIndex ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
