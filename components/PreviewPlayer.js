'use client'

import { useState } from 'react'
import { PlayCircle } from 'lucide-react'
import { toEmbedUrl, isDirectVideo } from '@/lib/utils'

// Authenticated free-preview player for a course's `previewVideo`. This is only
// ever rendered on the course detail page, which sits behind the middleware
// auth gate — so reaching it already implies a logged-in user. Click-to-play
// keeps the poster clean and avoids autoplay. Full premium lesson videos are
// NOT served here; they remain behind the enrollment gate on /learn.
export default function PreviewPlayer({ url, poster = '', title = 'Course preview' }) {
  const [playing, setPlaying] = useState(false)
  if (!url) return null

  const direct = isDirectVideo(url)
  const embed = toEmbedUrl(url)

  return (
    <section className="mt-8">
      <h2 className="font-heading text-xl font-bold text-brand-textPrimary">
        Free preview
      </h2>
      <p className="mt-1 text-sm text-brand-textSecondary">
        Watch a sample before you enroll.
      </p>
      <div className="mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-brand-border bg-black shadow-card">
        {!playing ? (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group relative flex h-full w-full items-center justify-center"
            aria-label="Play preview"
          >
            {poster ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={poster} alt={title} className="h-full w-full object-cover opacity-70" />
            ) : (
              <div className="h-full w-full bg-brand-textPrimary/90" />
            )}
            <span className="absolute inset-0 flex items-center justify-center">
              <PlayCircle className="h-16 w-16 text-white transition-transform group-hover:scale-110" />
            </span>
          </button>
        ) : direct ? (
          <video src={url} controls autoPlay controlsList="nodownload" className="h-full w-full">
            Your browser does not support the video tag.
          </video>
        ) : (
          <iframe
            src={embed}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        )}
      </div>
    </section>
  )
}
