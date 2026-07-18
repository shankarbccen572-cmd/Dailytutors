'use client'

import { useState, useMemo } from 'react'
import CourseCard from '@/components/CourseCard'
import { BookOpen } from 'lucide-react'

// Category-aware catalog: renders filter tabs and the filtered course grid.
// A course matches a category by its linked categoryId (preferred) or, for
// not-yet-migrated rows, by its denormalized category name.
export default function CourseCatalog({ courses = [], categories = [] }) {
  const [active, setActive] = useState('all')

  const counts = useMemo(() => {
    const map = { all: courses.length }
    for (const cat of categories) {
      map[cat._id] = courses.filter(
        (c) => c.categoryId === cat._id || c.category === cat.name
      ).length
    }
    return map
  }, [courses, categories])

  const filtered = useMemo(() => {
    if (active === 'all') return courses
    const cat = categories.find((c) => c._id === active)
    if (!cat) return courses
    return courses.filter(
      (c) => c.categoryId === cat._id || c.category === cat.name
    )
  }, [active, courses, categories])

  const tabCls = (isActive) =>
    `rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
      isActive
        ? 'border-brand-accent bg-brand-accent text-white'
        : 'border-brand-border bg-white text-brand-textSecondary hover:bg-brand-accentLight'
    }`

  return (
    <div>
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button type="button" onClick={() => setActive('all')} className={tabCls(active === 'all')}>
            All <span className="ml-1 opacity-70">{counts.all}</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => setActive(cat._id)}
              className={tabCls(active === cat._id)}
            >
              {cat.name}
              <span className="ml-1 opacity-70">{counts[cat._id] || 0}</span>
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-brand-border bg-white p-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-accentLight text-brand-accent">
            <BookOpen className="h-7 w-7" />
          </span>
          <p className="text-lg font-semibold text-brand-textPrimary">
            No courses in this category yet
          </p>
          <p className="max-w-sm text-sm text-brand-textSecondary">
            Try another category — new courses are added regularly.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CourseCard key={c._id} course={c} />
          ))}
        </div>
      )}
    </div>
  )
}
