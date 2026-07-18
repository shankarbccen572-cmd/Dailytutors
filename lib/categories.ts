// Single source of truth for the course/question-bank category taxonomy.
// The seven canonical categories the business teaches. The `Category`
// collection is seeded from this list (scripts/migrate-categories.mjs) and the
// API validates course category assignments against it.

export type CategoryKind = 'school' | 'exam'

export interface CanonicalCategory {
  name: string
  slug: string
  kind: CategoryKind
  order: number
}

export const CATEGORIES: CanonicalCategory[] = [
  { name: '8th Standard', slug: '8th-standard', kind: 'school', order: 1 },
  { name: '9th Standard', slug: '9th-standard', kind: 'school', order: 2 },
  { name: '10th Standard', slug: '10th-standard', kind: 'school', order: 3 },
  { name: '11th Standard', slug: '11th-standard', kind: 'school', order: 4 },
  { name: '12th Standard', slug: '12th-standard', kind: 'school', order: 5 },
  { name: 'NEET', slug: 'neet', kind: 'exam', order: 6 },
  { name: 'KCET', slug: 'kcet', kind: 'exam', order: 7 },
]

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name)
export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug)

// Maps a legacy free-text Course.category value onto a canonical name so the
// migration script can back-fill categoryId without losing data.
export const LEGACY_CATEGORY_MAP: Record<string, string> = {
  'Class 8': '8th Standard',
  'Class 9': '9th Standard',
  'Class 10': '10th Standard',
  'Class 11': '11th Standard',
  'Class 12': '12th Standard',
  '8th Standard': '8th Standard',
  '9th Standard': '9th Standard',
  '10th Standard': '10th Standard',
  '11th Standard': '11th Standard',
  '12th Standard': '12th Standard',
  NEET: 'NEET',
  CET: 'KCET',
  KCET: 'KCET',
}

// Resolve any incoming category string (legacy or canonical) to a canonical
// name, or null if it is unknown.
export function toCanonicalCategory(value?: string | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (CATEGORY_NAMES.includes(trimmed)) return trimmed
  return LEGACY_CATEGORY_MAP[trimmed] || null
}
