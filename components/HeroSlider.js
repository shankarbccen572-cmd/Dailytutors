'use client'

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

export default function HeroSlider({ banners = [] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!banners.length || paused) return
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length, paused])

  if (!banners.length) return null

  const go = (i) => setActiveIndex((i + banners.length) % banners.length)

  return (
    <section
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {/* Height scales gently from phone → desktop. Content is never cropped. */}
      <div className="relative h-[240px] w-full xs:h-[280px] sm:h-[360px] lg:h-[460px]">
        {banners.map((banner, index) => {
          const isActive = index === activeIndex
          const hasImage = Boolean(banner.imageUrl)
          return (
            <div
              key={index}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                isActive ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
              style={{ backgroundColor: banner.bgColor || '#B22222' }}
            >
              {hasImage ? (
                <>
                  {/* Blurred fill so the full (contained) image never sits on flat bars */}
                  <img
                    src={banner.imageUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl"
                  />
                  {/* The actual banner — always fully visible, never cropped */}
                  <img
                    src={banner.imageUrl}
                    alt={banner.title || 'Featured banner'}
                    className={`absolute inset-0 mx-auto h-full w-full object-contain transition-transform duration-[6000ms] ease-out ${
                      isActive ? 'scale-[1.02]' : 'scale-100'
                    }`}
                  />
                  {banner.ctaHref ? (
                    <Link
                      href={banner.ctaHref}
                      className="absolute inset-0 z-10"
                      aria-label={banner.ctaText || banner.title || 'Open banner'}
                    />
                  ) : null}
                </>
              ) : (
                <>
                  {/* Depth overlays keep text legible on any background color */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

                  <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-5 sm:px-8 lg:px-10">
                    <div
                      className={`max-w-2xl transition-all duration-700 ${
                        isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                      }`}
                    >
                      <span className="inline-flex rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur sm:px-4 sm:py-1.5 sm:text-xs">
                        Featured
                      </span>
                      <h1
                        className="mt-3 font-heading text-xl font-bold leading-[1.15] text-white drop-shadow-sm sm:mt-4 sm:text-4xl lg:text-5xl"
                        style={{ color: banner.textColor || '#FFFFFF' }}
                      >
                        {banner.title}
                      </h1>
                      <p className="mt-2 line-clamp-3 max-w-xl text-xs leading-5 text-white/90 sm:mt-4 sm:text-base sm:leading-6 lg:text-lg">
                        {banner.subtitle}
                      </p>
                      {banner.ctaText ? (
                        <Link
                          href={banner.ctaHref || '/'}
                          className="group mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-brand-textPrimary shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5 sm:mt-7 sm:px-6 sm:py-3 sm:text-sm"
                        >
                          {banner.ctaText}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        })}

        {/* Prev / next — smaller & tighter on phones */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 items-center justify-between px-2 sm:px-5">
          <button
            type="button"
            onClick={() => go(activeIndex - 1)}
            aria-label="Previous slide"
            className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-brand-textPrimary shadow-lg shadow-black/10 backdrop-blur transition hover:scale-105 hover:bg-white sm:h-11 sm:w-11"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(activeIndex + 1)}
            aria-label="Next slide"
            className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-brand-textPrimary shadow-lg shadow-black/10 backdrop-blur transition hover:scale-105 hover:bg-white sm:h-11 sm:w-11"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center gap-1.5 sm:bottom-5 sm:gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => go(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeIndex ? 'w-6 bg-white sm:w-7' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
