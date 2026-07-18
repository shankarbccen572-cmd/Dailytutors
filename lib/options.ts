// Central place to edit the dropdown choices shown in the course form.
// Add / remove items here and they update everywhere.

// Course categories, grouped for the <optgroup> dropdown. NOTE: the course
// form now loads the authoritative category list from the DB (/api/categories);
// this grouping is a static fallback / reference that mirrors lib/categories.ts.
export const CATEGORY_GROUPS = [
  {
    group: 'Competitive Exams',
    items: ['NEET', 'KCET'],
  },
  {
    group: 'School',
    items: ['8th Standard', '9th Standard', '10th Standard', '11th Standard', '12th Standard'],
  },
]

// Flat list of all category values (handy for validation / "is this known?").
export const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap((g) => g.items)

// Exam targets shown for each category (the "Exam target" dropdown cascades
// off the selected Category). Legacy keys are retained so editing an older
// course never drops its saved exam target.
export const TARGETS_BY_CATEGORY: Record<string, string[]> = {
  NEET: ['NEET UG', 'NEET PG'],
  KCET: ['KCET', 'COMEDK', 'State CET'],
  '8th Standard': ['CBSE', 'ICSE', 'State Board'],
  '9th Standard': ['CBSE', 'ICSE', 'State Board'],
  '10th Standard': ['CBSE', 'ICSE', 'State Board'],
  '11th Standard': ['CBSE – Science', 'CBSE – Commerce', 'CBSE – Arts', 'ICSE', 'State Board'],
  '12th Standard': ['CBSE – Science', 'CBSE – Commerce', 'CBSE – Arts', 'ICSE', 'State Board'],
  // Legacy (pre-migration) category keys.
  CET: ['KCET', 'COMEDK', 'State CET'],
  'Class 8': ['CBSE', 'ICSE', 'State Board'],
  'Class 9': ['CBSE', 'ICSE', 'State Board'],
  'Class 10': ['CBSE', 'ICSE', 'State Board'],
  'Class 12': ['CBSE – Science', 'CBSE – Commerce', 'CBSE – Arts', 'ICSE', 'State Board'],
}

// Course languages.
export const LANGUAGES = [
  'English',
  'Hindi',
  'Kannada',
  'Telugu',
  'Tamil',
  'Hinglish',
]
