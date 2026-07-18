'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { toEmbedUrl, isDirectVideo } from '@/lib/utils'
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Folder,
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
  Paperclip,
  Link2,
  ClipboardList,
} from 'lucide-react'

const RES_ICONS = { pdf: FileText, video: Video, file: Paperclip, link: Link2 }

function ResIcon({ type, className = 'h-4 w-4' }) {
  const Icon = RES_ICONS[type] || Paperclip
  return <Icon className={className} />
}

// Sum the "9min" / "12:30" style durations into a rough section total label.
function sectionMeta(lessons, completedSet) {
  const done = lessons.filter((l) => completedSet.has(l._id)).length
  // Try to add up minute counts when durations look like "9min".
  let mins = 0
  let parsed = true
  for (const l of lessons) {
    const m = (l.duration || '').match(/(\d+)\s*min/i)
    if (m) mins += Number(m[1])
    else if (l.duration) parsed = false
  }
  const label = parsed && mins > 0 ? `${mins}min` : ''
  return { done, total: lessons.length, label }
}

function ResourcesDropdown({ lesson }) {
  const [open, setOpen] = useState(false)
  const resources = lesson.resources || []
  if (resources.length === 0) return null

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((p) => !p)
        }}
        className="flex items-center gap-1 rounded-md border border-brand-accent px-2 py-1 text-xs font-medium text-brand-accent hover:bg-brand-accentLight"
      >
        <Folder className="h-3.5 w-3.5" /> Resources
        {open ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-56 overflow-hidden rounded-lg border border-brand-border bg-brand-primary shadow-lg">
          <ul className="max-h-64 overflow-y-auto py-1 text-sm">
            {resources.map((r, i) => (
              <li key={`r${i}`}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-brand-textPrimary hover:bg-brand-accentLight"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ResIcon type={r.type} />
                  <span className="flex-1 truncate">{r.name || r.url}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Resolve a lesson's linked quizzes (published only, deduped) from the map.
function lessonQuizzes(lesson, quizMap) {
  const seen = new Set()
  return (lesson.quizIds || [])
    .map((id) => quizMap[typeof id === 'string' ? id : id?._id])
    .filter((q) => q && !seen.has(q._id) && seen.add(q._id))
}

const WATCHED_THRESHOLD = 0.8

function parseDurationInSeconds(duration) {
  if (!duration) return 0
  const minutesMatch = duration.match(/(\d+)\s*min/i)
  if (minutesMatch) return Number(minutesMatch[1]) * 60
  const timeMatch = duration.match(/^(\d+):(\d{2})$/)
  if (timeMatch) return Number(timeMatch[1]) * 60 + Number(timeMatch[2])
  return 0
}

export default function CoursePlayer({
  course,
  sections,
  quizzes,
  curriculumPublished = true,
  importantCount = 0,
  initialCompleted = [],
}) {
  const allLessons = useMemo(
    () => sections.flatMap((s) => s.lessons),
    [sections]
  )
  const quizMap = useMemo(() => {
    const m = {}
    for (const q of quizzes) m[q._id] = q
    return m
  }, [quizzes])

  const [activeId, setActiveId] = useState(allLessons[0]?._id || null)
  const [completed, setCompleted] = useState(() => new Set(initialCompleted))
  const [autoCompleteSet, setAutoCompleteSet] = useState(new Set())
  const [activeTimer, setActiveTimer] = useState(null)
  // Sections expanded by default so the first lesson is visible (like Udemy).
  const [openSections, setOpenSections] = useState(
    () => new Set(sections.map((s) => s._id))
  )

  const unlinkedQuizzes = useMemo(() => {
    const linked = new Set()
    for (const l of allLessons)
      for (const id of l.quizIds || [])
        linked.add(typeof id === 'string' ? id : id?._id)
    return quizzes.filter((q) => !linked.has(q._id))
  }, [allLessons, quizzes])

  const active = allLessons.find((l) => l._id === activeId) || null

  // Premium video URLs are never in the page payload — fetch on demand from the
  // enrollment-gated endpoint whenever the active lesson changes.
  const [videoSrc, setVideoSrc] = useState('')
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoError, setVideoError] = useState('')

  useEffect(() => {
    if (!activeId) {
      setVideoSrc('')
      return
    }
    let alive = true
    setVideoLoading(true)
    setVideoError('')
    setVideoSrc('')
    fetch(`/api/lessons/${activeId}/video`)
      .then((r) =>
        r.ok ? r.json() : r.json().then((e) => Promise.reject(new Error(e.error || 'Video locked')))
      )
      .then((data) => {
        if (alive) setVideoSrc(data.url || '')
      })
      .catch((e) => {
        if (alive) setVideoError(e.message)
      })
      .finally(() => {
        if (alive) setVideoLoading(false)
      })
    return () => {
      alive = false
    }
  }, [activeId])

  const embed = videoSrc ? toEmbedUrl(videoSrc) : ''
  const nativeVideo = videoSrc ? isDirectVideo(videoSrc) : false

  // Count only completions for lessons that still exist (a deleted lesson can
  // linger in the saved set), and never exceed the total.
  const completedInCourse = allLessons.filter((l) => completed.has(l._id)).length
  const progress =
    allLessons.length > 0
      ? Math.min(100, Math.round((completedInCourse / allLessons.length) * 100))
      : 0

  function toggleSection(id) {
    setOpenSections((p) => {
      const n = new Set(p)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  async function completeLesson(lesson) {
    if (completed.has(lesson._id)) return
    setCompleted((p) => new Set(p).add(lesson._id))
    try {
      const res = await fetch(`/api/lessons/${lesson._id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setCompleted(new Set(data.completedLessons))
    } catch {
      setCompleted((p) => {
        const n = new Set(p)
        n.delete(lesson._id)
        return n
      })
    }
  }

  function handleVideoTimeUpdate(e) {
    if (!active || completed.has(active._id)) return
    const currentTime = e.currentTarget.currentTime
    const durationSeconds = e.currentTarget.duration || parseDurationInSeconds(active.duration)
    if (!durationSeconds || durationSeconds === Infinity) return

    if (currentTime >= durationSeconds * WATCHED_THRESHOLD) {
      completeLesson(active)
    }
  }

  function handleVideoEnded() {
    if (active && !completed.has(active._id)) {
      completeLesson(active)
    }
  }

  function startEmbedTimer(lesson) {
    const durationSeconds = parseDurationInSeconds(lesson.duration)
    if (!durationSeconds || completed.has(lesson._id)) return
    const target = Math.max(10, Math.round(durationSeconds * WATCHED_THRESHOLD))
    if (autoCompleteSet.has(lesson._id)) return

    if (activeTimer) {
      clearTimeout(activeTimer)
      setActiveTimer(null)
    }

    const timer = window.setTimeout(() => {
      setAutoCompleteSet((prev) => new Set(prev).add(lesson._id))
      completeLesson(lesson)
    }, target * 1000)
    setActiveTimer(timer)
  }

  useEffect(() => {
    // Embedded (YouTube/Vimeo) players can't report progress, so once the
    // source is known and it's an embed, auto-mark watched after ~80% of the
    // stated duration. Native <video> uses onTimeUpdate/onEnded instead.
    if (active && videoSrc && !isDirectVideo(videoSrc)) {
      if (activeTimer) {
        clearTimeout(activeTimer)
        setActiveTimer(null)
      }
      if (!completed.has(active._id)) {
        startEmbedTimer(active)
      }
    }
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, videoSrc, completed])

  return (
    <div className="min-h-screen bg-brand-accentLight/20">
      {/* Top bar */}
      <header className="border-b border-brand-border bg-brand-primary">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link href="/dashboard" className="shrink-0">
              <img
                src="/logo-full.png"
                alt="Daily Tutors"
                style={{ width: '200px', height: 'auto' }}
              />
            </Link>
            <h1 className="truncate font-heading text-lg font-semibold text-brand-textPrimary">
              {course.title}
            </h1>
          </div>
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-1.5 text-sm text-brand-textSecondary hover:text-brand-textPrimary"
          >
            <ArrowLeft className="h-4 w-4" /> My Learning
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-3">
        {/* Player */}
        <div className="lg:col-span-2">
          <div className="aspect-video w-full overflow-hidden rounded-xl border border-brand-border bg-black">
            {videoLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-white/70">
                Loading video…
              </div>
            ) : active && nativeVideo && videoSrc ? (
              <video
                src={videoSrc}
                controls
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                className="h-full w-full"
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleVideoEnded}
              />
            ) : embed ? (
              <iframe
                src={embed}
                title={active?.title}
                allow="accelerated-playback; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-white/70">
                {videoError
                  ? videoError
                  : active
                  ? active.hasVideo
                    ? 'Video unavailable.'
                    : 'No video added for this lesson yet.'
                  : 'Select a lesson to begin.'}
              </div>
            )}
          </div>
          {active && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl font-bold text-brand-textPrimary">
                  {active.title}
                </h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-brand-textSecondary">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                      completed.has(active._id)
                        ? 'bg-brand-success/10 text-brand-success'
                        : 'bg-brand-accentLight text-brand-accentDark'
                    }`}
                  >
                    {completed.has(active._id) ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Watched
                      </>
                    ) : (
                      'Watching'
                    )}
                  </span>
                </p>
              </div>
            </div>
          )}
          {/* Resources for the active lesson, inline below the player */}
          {active &&
            (active.resources?.length > 0 || active.quizIds?.length > 0) && (
              <div className="mt-4 rounded-xl border border-brand-border bg-brand-primary p-4">
                <h3 className="mb-2 font-heading text-sm font-bold uppercase tracking-wide text-brand-textSecondary">
                  Resources for this lesson
                </h3>
                <ul className="space-y-1 text-sm">
                  {(active.resources || []).map((r, i) => (
                    <li key={`ar${i}`}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-brand-accent hover:underline"
                      >
                        <ResIcon type={r.type} />
                        {r.name || r.url}
                      </a>
                    </li>
                  ))}
                  {(active.quizIds || [])
                    .map((id) => quizMap[typeof id === 'string' ? id : id?._id])
                    .filter(Boolean)
                    .map((q) => (
                      <li key={`aq${q._id}`}>
                        <Link
                          href={`/learn/${course._id}/quiz/${q._id}`}
                          className="inline-flex items-center gap-2 text-brand-accent hover:underline"
                        >
                          <ClipboardList className="h-4 w-4" />
                          {q.title} <span className="text-xs">(Quiz)</span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            )}
        </div>

        {/* Sidebar: course content */}
        <aside className="lg:col-span-1">
          <div className="rounded-xl border border-brand-border bg-brand-primary">
            <div className="border-b border-brand-border p-4">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-brand-textSecondary">
                Course content
              </h3>
              <div className="mt-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-accentLight">
                  <div
                    className="h-full rounded-full bg-brand-accent transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-brand-textSecondary">
                  {completedInCourse} of {allLessons.length} complete · {progress}%
                </p>
              </div>
            </div>

            <div className="max-h-[65vh] overflow-y-auto">
              {sections.map((s) => {
                const meta = sectionMeta(s.lessons, completed)
                const isOpen = openSections.has(s._id)
                return (
                  <div key={s._id} className="border-b border-brand-border last:border-0">
                    <button
                      type="button"
                      onClick={() => toggleSection(s._id)}
                      className="flex w-full items-center justify-between gap-2 bg-brand-accentLight/30 px-4 py-3 text-left hover:bg-brand-accentLight/60"
                    >
                      <span>
                        <span className="block text-sm font-semibold text-brand-textPrimary">
                          {s.title}
                        </span>
                        <span className="block text-xs text-brand-textSecondary">
                          {meta.done} / {meta.total}
                          {meta.label && ` | ${meta.label}`}
                        </span>
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 shrink-0 text-brand-textSecondary" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-brand-textSecondary" />
                      )}
                    </button>

                    {isOpen && (
                      <ul>
                        {s.lessons.map((l) => {
                          const isActive = l._id === activeId
                          const isDone = completed.has(l._id)
                          const lQuizzes = lessonQuizzes(l, quizMap)
                          return (
                            <li
                              key={l._id}
                              className="border-t border-brand-border"
                            >
                              <div
                                className={`flex items-start gap-2 px-3 py-2 ${
                                  isActive ? 'bg-brand-accentLight/40' : ''
                                }`}
                              >
                                <span className="mt-1 flex h-4 w-4 items-center justify-center rounded-full border border-brand-border text-brand-accent text-xs">
                                  {isDone ? '✓' : ''}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setActiveId(l._id)}
                                  className="flex flex-1 items-start gap-2 text-left"
                                >
                                  <span className="flex-1 text-sm text-brand-textPrimary">
                                    {l.title}
                                    <span className="mt-0.5 flex items-center gap-1.5 text-xs text-brand-textSecondary">
                                      <Play className="h-3 w-3" />
                                      {l.duration || '—'}
                                      {l.isFreePreview && (
                                        <span className="text-brand-success">
                                          Free
                                        </span>
                                      )}
                                    </span>
                                  </span>
                                </button>
                                <ResourcesDropdown lesson={l} />
                              </div>

                              {/* Quizzes for this session/topic — shown right
                                  under the lesson they belong to. */}
                              {lQuizzes.map((q) => (
                                <Link
                                  key={q._id}
                                  href={`/learn/${course._id}/quiz/${q._id}`}
                                  className="flex items-center gap-2 border-t border-brand-border bg-brand-surface/60 py-2 pl-9 pr-3 text-sm text-brand-textPrimary hover:bg-brand-accentLight"
                                >
                                  <ClipboardList className="h-4 w-4 shrink-0 text-brand-accent" />
                                  <span className="flex-1 truncate">{q.title}</span>
                                  <span className="rounded-full bg-brand-accentLight px-2 py-0.5 text-xs font-medium text-brand-accentDark">
                                    Quiz
                                  </span>
                                </Link>
                              ))}
                            </li>
                          )
                        })}
                        {s.lessons.length === 0 && (
                          <li className="px-4 py-2 text-xs text-brand-textSecondary">
                            No lessons yet.
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                )
              })}
              {allLessons.length === 0 && (
                <p className="px-4 py-3 text-sm text-brand-textSecondary">
                  {curriculumPublished
                    ? 'No lessons added yet.'
                    : 'The curriculum is being prepared and will appear here once published.'}
                </p>
              )}
            </div>
          </div>

          {/* Chapter-wise important questions practice */}
          {importantCount > 0 && (
            <Link
              href={`/learn/${course._id}/important`}
              className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-brand-accent bg-brand-accentLight/40 px-4 py-3 text-sm font-medium text-brand-accentDark hover:bg-brand-accentLight"
            >
              <span className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-brand-accent" /> Important
                Questions (chapter-wise)
              </span>
              <span className="text-xs font-medium text-brand-accent">
                {importantCount} · Practice →
              </span>
            </Link>
          )}

          {/* General tests not tied to a specific lesson */}
          {unlinkedQuizzes.length > 0 && (
            <div className="mt-4 rounded-xl border border-brand-border bg-brand-primary">
              <div className="border-b border-brand-border p-4">
                <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-brand-textSecondary">
                  More tests
                </h3>
              </div>
              <ul className="p-2">
                {unlinkedQuizzes.map((q) => (
                  <li key={q._id}>
                    <Link
                      href={`/learn/${course._id}/quiz/${q._id}`}
                      className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm text-brand-textPrimary hover:bg-brand-accentLight"
                    >
                      <span className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-brand-accent" /> {q.title}
                      </span>
                      <span className="text-xs font-medium text-brand-accent">
                        Start →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
