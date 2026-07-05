// Central place to edit the dropdown choices shown in the course form.
// Add / remove items here and they update everywhere.

// Course categories, grouped for the <optgroup> dropdown.
export const CATEGORY_GROUPS = [
  {
    group: 'Competitive Exams',
    items: ['UPSC', 'KAS', 'IAS', 'CA', 'NEET', 'CET'],
  },
  {
    group: 'School',
    items: ['Class 8', 'Class 9', 'Class 10', 'Class 12'],
  },
]

// Flat list of all category values (handy for validation / "is this known?").
export const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap((g) => g.items)

// Exam targets shown for each category (the "Exam target" dropdown cascades
// off the selected Category).
export const TARGETS_BY_CATEGORY: Record<string, string[]> = {
  UPSC: [
    'UPSC CSE – Prelims',
    'UPSC CSE – Mains',
    'UPSC CSE – Full Course',
    'CDS',
    'NDA',
    'CAPF',
  ],
  KAS: ['KAS – Prelims', 'KAS – Mains', 'KAS – Full Course', 'Gazetted Probationers'],
  IAS: ['Prelims', 'Mains', 'Interview', 'Full Course'],
  CA: ['CA Foundation', 'CA Intermediate', 'CA Final'],
  NEET: ['NEET UG', 'NEET PG'],
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
