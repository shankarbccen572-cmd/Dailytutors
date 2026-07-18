export function slugify(str = '') {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Convert mongoose docs / ObjectIds / Dates into plain JSON-safe objects
// so they can be passed from Server Components to Client Components.
export function serialize(value) {
  return JSON.parse(JSON.stringify(value))
}

// Turn a pasted video URL (YouTube / Vimeo / direct link) into an embeddable
// iframe src. Returns '' if there's no URL.
export function toEmbedUrl(url = '') {
  if (!url) return ''
  const yt =
    url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return url
}

// True when the URL points at a direct media file (e.g. an uploaded .mp4 on
// Cloudinary) that should play in a native <video> tag rather than an iframe.
export function isDirectVideo(url = '') {
  if (!url) return false
  if (/youtube\.com|youtu\.be|vimeo\.com/.test(url)) return false
  return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url) || /\/video\/upload\//.test(url)
}

const COURSE_FIELDS = [
  'title',
  'description',
  'thumbnail',
  'previewVideo',
  'categoryId',
  'category',
  'examTarget',
  'language',
  'originalPrice',
  'discountPrice',
  'instructorName',
  'instructorBio',
  'whatYouLearn',
  'status',
  'curriculumPublished',
  'importantQuestionsPublished',
  'badgeLabel',
  'badgeColor',
  'premiumBadgeLabel',
  'premiumBadgeColor',
  'premiumFeatureText',
  'cardBorderColor',
  'exploreButtonColor',
  'buyNowButtonColor',
  'expirationDays',
]

// Whitelist incoming body fields so clients can't set arbitrary keys.
export function pickCourse(body = {}) {
  const out = {}
  for (const f of COURSE_FIELDS) {
    if (body[f] !== undefined) out[f] = body[f]
  }
  return out
}

const QUIZ_FIELDS = [
  'title',
  'description',
  'instructions',
  'timeLimit',
  'passingScore',
  'shuffleQuestions',
  'order',
  'status',
]

export function pickQuiz(body = {}) {
  const out = {}
  for (const f of QUIZ_FIELDS) {
    if (body[f] !== undefined) out[f] = body[f]
  }
  return out
}

const LESSON_FIELDS = [
  'title',
  'videoUrl',
  'duration',
  'order',
  'isFreePreview',
  'resources',
  'quizIds',
]

// Whitelist + normalize incoming lesson fields. Keeps resources/quizIds clean
// so clients can't inject arbitrary keys.
export function pickLesson(body: any = {}) {
  const out: any = {}
  for (const f of LESSON_FIELDS) {
    if (body[f] === undefined) continue
    if (f === 'resources' && Array.isArray(body.resources)) {
      out.resources = body.resources
        .map((r) => ({
          type: ['pdf', 'video', 'file', 'link'].includes(r?.type)
            ? r.type
            : 'file',
          name: (r?.name || '').toString().trim(),
          url: (r?.url || '').toString().trim(),
        }))
        .filter((r) => r.url)
    } else if (f === 'quizIds' && Array.isArray(body.quizIds)) {
      out.quizIds = body.quizIds.filter(Boolean)
    } else {
      out[f] = body[f]
    }
  }
  return out
}

const QUESTION_FIELDS = [
  'type',
  'text',
  'options',
  'correctAnswer',
  'explanation',
  'marks',
  'order',
]

export function pickQuestion(body = {}) {
  const out = {}
  for (const f of QUESTION_FIELDS) {
    if (body[f] !== undefined) out[f] = body[f]
  }
  return out
}
