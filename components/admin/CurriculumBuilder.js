'use client'

import { useState } from 'react'
import MediaUpload from './MediaUpload'
import { QuizCard } from './QuizBuilder'

const inputCls =
  'w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-accent'

const RESOURCE_TYPES = [
  { value: 'pdf', label: 'PDF / Notes', accept: '.pdf,application/pdf' },
  { value: 'video', label: 'Video', accept: 'video/*' },
  { value: 'file', label: 'File', accept: '*/*' },
  { value: 'link', label: 'Link', accept: '*/*' },
]

// Expanded editor for a single lesson: video, resources, linked quizzes.
function LessonEditor({
  lesson,
  quizzes,
  courseId,
  onCreateQuiz,
  onDeleteQuiz,
  onSave,
  onCancel,
}) {
  const [title, setTitle] = useState(lesson.title || '')
  const [duration, setDuration] = useState(lesson.duration || '')
  const [free, setFree] = useState(Boolean(lesson.isFreePreview))
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl || '')
  const [resources, setResources] = useState(lesson.resources || [])
  const [quizIds, setQuizIds] = useState(
    (lesson.quizIds || []).map((q) => (typeof q === 'string' ? q : q._id))
  )
  const [addingQuiz, setAddingQuiz] = useState(false)
  const [newQuizTitle, setNewQuizTitle] = useState('')
  const [creatingQuiz, setCreatingQuiz] = useState(false)
  const [saving, setSaving] = useState(false)
  // Count of in-flight uploads across the video + resource fields. Save is
  // blocked until they all finish so we never save an empty/half-uploaded URL.
  const [uploads, setUploads] = useState(0)
  const onUploading = (b) => setUploads((n) => Math.max(0, n + (b ? 1 : -1)))

  function setResource(i, patch) {
    setResources((p) => p.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }
  function addResource() {
    setResources((p) => [...p, { type: 'pdf', name: '', url: '' }])
  }
  function removeResource(i) {
    setResources((p) => p.filter((_, idx) => idx !== i))
  }
  function toggleQuiz(id) {
    setQuizIds((p) => (p.includes(id) ? p.filter((q) => q !== id) : [...p, id]))
  }

  async function createQuiz() {
    if (!newQuizTitle.trim()) return
    setCreatingQuiz(true)
    const quiz = await onCreateQuiz(newQuizTitle.trim())
    setCreatingQuiz(false)
    if (quiz) {
      // Link the freshly-created quiz to this lesson. The link is persisted
      // when the admin clicks "Save lesson" below (same as resources).
      setQuizIds((p) => [...p, quiz._id])
      setNewQuizTitle('')
      setAddingQuiz(false)
    }
  }

  async function removeQuiz(id) {
    if (!confirm('Delete this quiz and all its questions?')) return
    const ok = await onDeleteQuiz(id)
    if (ok) setQuizIds((p) => p.filter((q) => q !== id))
  }

  async function save() {
    setSaving(true)
    await onSave(lesson._id, {
      title: title.trim(),
      duration: duration.trim(),
      isFreePreview: free,
      videoUrl: videoUrl.trim(),
      resources: resources.filter((r) => r.url.trim()),
      quizIds,
    })
    setSaving(false)
  }

  return (
    <div className="mt-2 space-y-4 rounded-lg border border-brand-border bg-brand-primary p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-textSecondary">
            Lesson title
          </label>
          <input
            className={inputCls}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-textSecondary">
            Duration (e.g. 9min)
          </label>
          <input
            className={inputCls}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-brand-textPrimary">
        <input
          type="checkbox"
          checked={free}
          onChange={(e) => setFree(e.target.checked)}
        />
        Free preview (playable without enrolling)
      </label>

      {/* Main lesson video */}
      <div>
        <label className="mb-1 block text-xs font-medium text-brand-textSecondary">
          Lesson video (upload or paste YouTube / Vimeo / file URL)
        </label>
        <MediaUpload
          value={videoUrl}
          onChange={setVideoUrl}
          onUploadingChange={onUploading}
          accept="video/*"
          label="video"
        />
        {videoUrl && (
          <p className="mt-1 truncate text-xs text-brand-success">
            ✓ Video set — remember to click <b>Save lesson</b> below.
          </p>
        )}
      </div>

      {/* Resources */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-medium text-brand-textSecondary">
            Resources (PDF notes, extra videos, files, links)
          </label>
          <button
            type="button"
            onClick={addResource}
            className="rounded-md border border-brand-border px-2 py-1 text-xs font-medium text-brand-accent hover:bg-brand-accentLight"
          >
            + Add resource
          </button>
        </div>
        {resources.length === 0 && (
          <p className="text-xs text-brand-textSecondary">No resources yet.</p>
        )}
        <div className="space-y-3">
          {resources.map((r, i) => {
            const cfg =
              RESOURCE_TYPES.find((t) => t.value === r.type) || RESOURCE_TYPES[0]
            return (
              <div
                key={i}
                className="space-y-2 rounded-lg border border-dashed border-brand-border p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={r.type}
                    onChange={(e) => setResource(i, { type: e.target.value })}
                    className="rounded-lg border border-brand-border px-2 py-1.5 text-sm outline-none focus:border-brand-accent"
                  >
                    {RESOURCE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <input
                    className={`${inputCls} flex-1`}
                    value={r.name}
                    onChange={(e) => setResource(i, { name: e.target.value })}
                    placeholder="Display name (e.g. Lecture notes)"
                  />
                  <button
                    type="button"
                    onClick={() => removeResource(i)}
                    className="text-xs font-medium text-brand-accent hover:underline"
                  >
                    Remove
                  </button>
                </div>
                {r.type === 'link' ? (
                  <input
                    type="url"
                    className={inputCls}
                    value={r.url}
                    onChange={(e) => setResource(i, { url: e.target.value })}
                    placeholder="https://…"
                  />
                ) : (
                  <MediaUpload
                    value={r.url}
                    onChange={(url) => setResource(i, { url })}
                    onUploadingChange={onUploading}
                    accept={cfg.accept}
                    label={cfg.label}
                    compact
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Tests & Quizzes for this lesson */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-medium text-brand-textSecondary">
            Tests &amp; Quizzes (create a quiz and add its questions)
          </label>
          <button
            type="button"
            onClick={() => setAddingQuiz((v) => !v)}
            className="rounded-md border border-brand-border px-2 py-1 text-xs font-medium text-brand-accent hover:bg-brand-accentLight"
          >
            {addingQuiz ? 'Cancel' : '+ Add quiz'}
          </button>
        </div>

        {/* Create a new quiz, linked to this lesson */}
        {addingQuiz && (
          <div className="mb-3 flex flex-col gap-2 rounded-lg border border-dashed border-brand-border p-3 sm:flex-row">
            <input
              className={`${inputCls} flex-1`}
              value={newQuizTitle}
              onChange={(e) => setNewQuizTitle(e.target.value)}
              placeholder="New test/quiz title (e.g. Chapter 1 Test)"
              onKeyDown={(e) => e.key === 'Enter' && createQuiz()}
            />
            <button
              type="button"
              onClick={createQuiz}
              disabled={creatingQuiz || !newQuizTitle.trim()}
              className="shrink-0 rounded-md bg-brand-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-accentDark disabled:opacity-50"
            >
              {creatingQuiz ? 'Creating…' : 'Create quiz'}
            </button>
          </div>
        )}

        {/* Quizzes linked to this lesson — full editor for each */}
        {quizIds.length === 0 && !addingQuiz && (
          <p className="text-xs text-brand-textSecondary">
            No quizzes yet. Click <b>+ Add quiz</b> to create one.
          </p>
        )}
        <div className="space-y-3">
          {quizzes
            .filter((q) => quizIds.includes(q._id))
            .map((q) => (
              <QuizCard
                key={q._id}
                quiz={q}
                courseId={courseId}
                onDelete={removeQuiz}
              />
            ))}
        </div>

        {/* Attach an existing course quiz that isn't linked yet */}
        {quizzes.some((q) => !quizIds.includes(q._id)) && (
          <div className="mt-3">
            <p className="mb-2 text-xs font-medium text-brand-textSecondary">
              Or attach an existing quiz:
            </p>
            <div className="flex flex-wrap gap-3">
              {quizzes
                .filter((q) => !quizIds.includes(q._id))
                .map((q) => (
                  <label
                    key={q._id}
                    className="flex items-center gap-2 rounded-lg border border-brand-border px-3 py-1.5 text-sm text-brand-textPrimary"
                  >
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => toggleQuiz(q._id)}
                    />
                    {q.title}
                  </label>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-brand-border px-4 py-1.5 text-sm font-medium text-brand-textSecondary hover:bg-brand-accentLight"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving || uploads > 0}
          className="rounded-md bg-brand-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-accentDark disabled:opacity-50"
        >
          {uploads > 0
            ? 'Uploading… please wait'
            : saving
              ? 'Saving…'
              : 'Save lesson'}
        </button>
      </div>
    </div>
  )
}

function SectionCard({
  section,
  quizzes,
  courseId,
  onCreateQuiz,
  onDeleteQuiz,
  onDeleteSection,
  onAddLesson,
  onDeleteLesson,
  onSaveLesson,
}) {
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState('')
  const [free, setFree] = useState(false)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)

  async function add() {
    if (!title.trim()) return
    setAdding(true)
    await onAddLesson(section._id, {
      title: title.trim(),
      duration: duration.trim(),
      isFreePreview: free,
    })
    setAdding(false)
    setTitle('')
    setDuration('')
    setFree(false)
  }

  return (
    <div className="rounded-xl border border-brand-border bg-brand-primary p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-heading text-base font-semibold text-brand-textPrimary">
          {section.title}
          <span className="ml-2 text-xs font-normal text-brand-textSecondary">
            {section.lessons.length} lessons
          </span>
        </h3>
        <button
          type="button"
          onClick={() => onDeleteSection(section._id)}
          className="rounded-md border border-brand-border px-3 py-1 text-xs font-medium text-brand-accent hover:bg-brand-accentLight"
        >
          Delete section
        </button>
      </div>

      {/* Lessons */}
      <ul className="mt-4 space-y-2">
        {section.lessons.length === 0 && (
          <li className="text-sm text-brand-textSecondary">No lessons yet.</li>
        )}
        {section.lessons.map((lesson, i) => (
          <li key={lesson._id}>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-brand-border bg-brand-accentLight/30 px-3 py-2">
              <span className="flex flex-wrap items-center gap-2 text-sm text-brand-textPrimary">
                <span className="text-brand-textSecondary">{i + 1}.</span>
                {lesson.title}
                {lesson.duration && (
                  <span className="text-xs text-brand-textSecondary">
                    · {lesson.duration}
                  </span>
                )}
                {lesson.videoUrl && (
                  <span className="text-xs text-brand-textSecondary">· 🎬 video</span>
                )}
                {lesson.resources?.length > 0 && (
                  <span className="text-xs text-brand-textSecondary">
                    · 📎 {lesson.resources.length}
                  </span>
                )}
                {lesson.quizIds?.length > 0 && (
                  <span className="text-xs text-brand-textSecondary">
                    · 📝 {lesson.quizIds.length}
                  </span>
                )}
                {lesson.isFreePreview && (
                  <span className="rounded-full bg-brand-success/15 px-2 py-0.5 text-xs font-medium text-brand-success">
                    Free preview
                  </span>
                )}
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setEditingId((p) => (p === lesson._id ? null : lesson._id))
                  }
                  className="text-xs font-medium text-brand-accent hover:underline"
                >
                  {editingId === lesson._id ? 'Close' : 'Edit'}
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteLesson(section._id, lesson._id)}
                  className="text-xs font-medium text-brand-accent hover:underline"
                >
                  Delete
                </button>
              </span>
            </div>
            {editingId === lesson._id && (
              <LessonEditor
                lesson={lesson}
                quizzes={quizzes}
                courseId={courseId}
                onCreateQuiz={onCreateQuiz}
                onDeleteQuiz={onDeleteQuiz}
                onCancel={() => setEditingId(null)}
                onSave={async (id, payload) => {
                  await onSaveLesson(section._id, id, payload)
                  setEditingId(null)
                }}
              />
            )}
          </li>
        ))}
      </ul>

      {/* Add lesson */}
      <div className="mt-4 space-y-3 rounded-lg border border-dashed border-brand-border p-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={inputCls}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Lesson title"
          />
          <input
            className={inputCls}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Duration (e.g. 9min)"
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-brand-textPrimary">
            <input
              type="checkbox"
              checked={free}
              onChange={(e) => setFree(e.target.checked)}
            />
            Free preview
          </label>
          <span className="text-xs text-brand-textSecondary">
            Add the lesson, then click <b>Edit</b> to attach video, resources &amp;
            quizzes.
          </span>
          <button
            type="button"
            onClick={add}
            disabled={adding || !title.trim()}
            className="ml-auto rounded-md bg-brand-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-accentDark disabled:opacity-50"
          >
            {adding ? 'Adding…' : '+ Add lesson'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CurriculumBuilder({
  courseId,
  initialSections = [],
  quizzes: initialQuizzes = [],
}) {
  const [sections, setSections] = useState(initialSections)
  const [quizzes, setQuizzes] = useState(initialQuizzes)
  const [newSection, setNewSection] = useState('')
  const [busy, setBusy] = useState(false)

  // Create a quiz for this course and return it so the lesson editor can link
  // it. Returns null on failure.
  async function createQuiz(title) {
    const res = await fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, title }),
    })
    if (!res.ok) {
      alert('Could not create quiz')
      return null
    }
    const quiz = await res.json()
    const withQuestions = { ...quiz, questions: [] }
    setQuizzes((p) => [...p, withQuestions])
    return withQuestions
  }

  // Delete a quiz (and its questions). Returns true on success.
  async function deleteQuiz(id) {
    const res = await fetch(`/api/quizzes/${id}`, { method: 'DELETE' })
    if (!res.ok) return false
    setQuizzes((p) => p.filter((q) => q._id !== id))
    return true
  }

  async function addSection() {
    if (!newSection.trim()) return
    setBusy(true)
    const res = await fetch('/api/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, title: newSection.trim() }),
    })
    setBusy(false)
    if (res.ok) {
      const s = await res.json()
      setSections((p) => [...p, { ...s, lessons: [] }])
      setNewSection('')
    } else {
      alert('Could not add section')
    }
  }

  async function deleteSection(id) {
    if (!confirm('Delete this section and all its lessons?')) return
    const res = await fetch(`/api/sections/${id}`, { method: 'DELETE' })
    if (res.ok) setSections((p) => p.filter((s) => s._id !== id))
  }

  async function addLesson(sectionId, payload) {
    const res = await fetch('/api/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, sectionId, ...payload }),
    })
    if (res.ok) {
      const lesson = await res.json()
      setSections((p) =>
        p.map((s) =>
          s._id === sectionId ? { ...s, lessons: [...s.lessons, lesson] } : s
        )
      )
    } else {
      alert('Could not add lesson')
    }
  }

  async function saveLesson(sectionId, id, payload) {
    const res = await fetch(`/api/lessons/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const lesson = await res.json()
      setSections((p) =>
        p.map((s) =>
          s._id === sectionId
            ? {
                ...s,
                lessons: s.lessons.map((l) => (l._id === id ? lesson : l)),
              }
            : s
        )
      )
    } else {
      alert('Could not save lesson')
    }
  }

  async function deleteLesson(sectionId, id) {
    const res = await fetch(`/api/lessons/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setSections((p) =>
        p.map((s) =>
          s._id === sectionId
            ? { ...s, lessons: s.lessons.filter((l) => l._id !== id) }
            : s
        )
      )
    }
  }

  return (
    <div className="space-y-5">
      {sections.length === 0 && (
        <p className="text-sm text-brand-textSecondary">
          No sections yet. Add your first section below.
        </p>
      )}

      {sections.map((section) => (
        <SectionCard
          key={section._id}
          section={section}
          quizzes={quizzes}
          courseId={courseId}
          onCreateQuiz={createQuiz}
          onDeleteQuiz={deleteQuiz}
          onDeleteSection={deleteSection}
          onAddLesson={addLesson}
          onSaveLesson={saveLesson}
          onDeleteLesson={deleteLesson}
        />
      ))}

      {/* Add section */}
      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-brand-border bg-brand-primary p-4 sm:flex-row">
        <input
          className={inputCls}
          value={newSection}
          onChange={(e) => setNewSection(e.target.value)}
          placeholder="New section title (e.g. Introduction)"
          onKeyDown={(e) => e.key === 'Enter' && addSection()}
        />
        <button
          type="button"
          onClick={addSection}
          disabled={busy || !newSection.trim()}
          className="shrink-0 rounded-lg bg-brand-accent px-6 py-2 font-medium text-white hover:bg-brand-accentDark disabled:opacity-50"
        >
          + Add section
        </button>
      </div>
    </div>
  )
}
