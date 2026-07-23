// Single source of truth for public-page content defaults. Used to seed the DB,
// as the admin editor's initial state, and as the render-time fallback — so the
// three never drift. Every field here is editable in /admin/site-settings.

export const SITE_DEFAULTS = {
  navbarLinks: [
    { label: 'Courses', href: '/courses' },
    { label: 'Learn', href: '/learn' },
    { label: 'Login', href: '/login' },
  ],

  heroBanners: [
    { title: '8 AM IST • Every Morning', subtitle: 'Start your day with curated current affairs from The Hindu, PIB, and Indian Express.', imageUrl: '', bgColor: '#8B0000', textColor: '#FFFFFF', ctaText: "Read Today's Brief", ctaHref: '/courses', size: 'medium', position: 1 },
    { title: 'Live Classes Every Day', subtitle: 'Stay on top of your syllabus with live sessions and doubt solving every day.', imageUrl: '', bgColor: '#B22222', textColor: '#FFFFFF', ctaText: 'Join Live Now', ctaHref: '/learn', size: 'medium', position: 2 },
    { title: 'Practice with Mock Tests', subtitle: 'Build confidence with daily mock tests, quizzes, and performance tracking.', imageUrl: '', bgColor: '#C00000', textColor: '#FFFFFF', ctaText: 'Start Practice', ctaHref: '/courses', size: 'medium', position: 3 },
    { title: 'Expert Mentorship', subtitle: 'Learn from experienced tutors who guide your prep with strategy and clarity.', imageUrl: '', bgColor: '#DC143C', textColor: '#FFFFFF', ctaText: 'Meet Mentors', ctaHref: '/login', size: 'medium', position: 4 },
    { title: 'Track Progress Effortlessly', subtitle: 'Get daily analytics, scorecards, and study plans tailored for your goals.', imageUrl: '', bgColor: '#B22234', textColor: '#FFFFFF', ctaText: 'View Dashboard', ctaHref: '/dashboard', size: 'medium', position: 5 },
  ],

  heroStats: [
    { value: '10k+', label: 'Active learners' },
    { value: '200+', label: 'Video lessons' },
    { value: '95%', label: 'Success mindset' },
  ],

  highlights: [
    { icon: 'Video', title: 'Daily Live', sub: 'Live Classes' },
    { icon: 'ClipboardList', title: '10 Million +', sub: 'Practice Content' },
    { icon: 'Brain', title: '24 x 7', sub: 'Doubt Support' },
  ],

  examBadge: 'Courses by exam',
  examHeading: 'Find the right exam for you',
  examSubheading: 'Pick your goal and explore structured courses, test series and resources.',
  examCategories: [
    { icon: 'School', title: 'Class 8 – 10', tags: ['CBSE', 'ICSE', 'State'], href: '/courses' },
    { icon: 'GraduationCap', title: 'Class 11 – 12', tags: ['Boards', 'Foundation'], href: '/courses' },
    { icon: 'Stethoscope', title: 'NEET', tags: ['Class 11', 'Class 12', 'Dropper'], href: '/courses' },
    { icon: 'Atom', title: 'JEE / CET', tags: ['Class 11', 'Class 12', 'Dropper'], href: '/courses' },
  ],

  whyBadge: 'Why choose Daily Tutors?',
  whyHeading: 'Learn beyond books. Learn with strategy.',
  whySubheading: 'We focus on structured learning, consistency and results — everything you need to stay on track every single day.',
  featureLabels: [
    'Expert Faculty with Real Experience',
    'Live & Recorded Classes',
    'Daily Practice Tests',
    'Personalized Mentorship',
    'Performance Tracking',
    'Doubt Clearing Sessions',
    'Study Materials & Notes',
  ],

  ctaHeading: 'Start learning smarter, today.',
  ctaSubtitle: 'Join thousands of students preparing every day with live classes, practice tests and mentorship.',
  ctaPrimaryLabel: 'Start learning today',
  ctaSecondaryLabel: 'Browse courses',
  ctaSecondaryHref: '/courses',

  coursesBadge: 'Catalog',
  coursesTitle: 'Explore courses',
  coursesSubtitle: 'Courses crafted to help you learn smarter, every single day.',

  footerAbout: "India's smart learning platform — live classes, daily practice and mentorship for boards, NEET, JEE, CET and PUC.",
  footerColumns: [
    { title: 'Explore', links: [{ label: 'Courses', href: '/courses' }, { label: 'Learn', href: '/learn' }, { label: 'Dashboard', href: '/dashboard' }] },
    { title: 'Exams', links: [{ label: 'NEET', href: '/courses' }, { label: 'JEE / CET', href: '/courses' }, { label: 'Boards 8–12', href: '/courses' }] },
    { title: 'Company', links: [{ label: 'Sign in', href: '/login' }, { label: 'About', href: '/' }, { label: 'Contact', href: '/' }] },
  ],
  socialLinks: [
    { type: 'instagram', href: 'https://www.instagram.com' },
    { type: 'linkedin', href: 'https://www.linkedin.com' },
    { type: 'youtube', href: 'https://www.youtube.com' },
    { type: 'mail', href: 'mailto:support@dailytutors.in' },
  ],

  footerText: '© 2026 Daily Tutors. All rights reserved.',
}

export const SOCIAL_TYPES = ['instagram', 'linkedin', 'youtube', 'twitter', 'facebook', 'whatsapp', 'mail']

// Fill any missing/empty field from defaults so older DB rows (and partial
// saves) still render complete content. Empty arrays fall back to defaults.
export function mergeSiteSettings(settings) {
  const merged = { ...SITE_DEFAULTS, ...(settings || {}) }
  for (const key of Object.keys(SITE_DEFAULTS)) {
    const val = settings?.[key]
    const isEmptyArray = Array.isArray(val) && val.length === 0 && Array.isArray(SITE_DEFAULTS[key])
    if (val === undefined || val === null || val === '' || isEmptyArray) {
      merged[key] = SITE_DEFAULTS[key]
    }
  }
  return merged
}
