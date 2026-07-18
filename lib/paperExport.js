// Server-side generation of professional question papers as real .docx and
// .pdf files from a persisted QuestionPaper + its resolved Bank questions.
//
// DOCX (via `docx`) is fully Unicode-capable, so Kannada/Hindi/math symbols
// render correctly. PDF (via `pdf-lib` with the standard Helvetica font) only
// supports the WinAnsi character set, so non-Latin text is sanitized to keep
// exports from crashing — full Indic/Unicode PDF needs an embedded TTF font
// (tracked as a follow-up). Prefer DOCX for non-English papers.

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  Footer,
  PageNumber,
} from 'docx'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

// The answer for a question, formatted for the answer key.
export function answerFor(q) {
  if (!q) return ''
  if (q.type === 'assertion-reason') {
    const c = q.options?.find((o) => o.isCorrect)
    return c ? c.text : ''
  }
  if (q.options?.length) {
    const letters = q.options
      .map((o, i) => (o.isCorrect ? LETTERS[i] : null))
      .filter(Boolean)
    if (letters.length) return letters.join(', ')
  }
  return q.correctAnswer || q.modelAnswer || ''
}

// The visible stem for a question (handles assertion-reason).
function stemOf(q) {
  if (q.text) return q.text
  if (q.assertion) return `Assertion (A): ${q.assertion}   Reason (R): ${q.reason || ''}`
  return ''
}

// Compute totals from the referenced questions (authoritative, at export time).
export function computeTotals(sections, qmap) {
  let totalMarks = 0
  let totalQuestions = 0
  let seconds = 0
  for (const s of sections || []) {
    for (const id of s.questionIds || []) {
      const q = qmap[String(id)]
      if (!q) continue
      totalMarks += Number(q.marks) || 0
      seconds += Number(q.expectedTimeSeconds) || 0
      totalQuestions += 1
    }
  }
  return { totalMarks, totalQuestions, estMinutes: Math.round(seconds / 60) }
}

// Resolve section question ids into ordered question docs.
export function resolveSections(paper, qmap) {
  return (paper.sections || []).map((s) => ({
    title: s.title || '',
    instructions: s.instructions || '',
    questions: (s.questionIds || []).map((id) => qmap[String(id)]).filter(Boolean),
  }))
}

function metaLine(paper, totals) {
  return [
    paper.subject,
    paper.category,
    `Time: ${paper.timeMinutes} min`,
    `Max Marks: ${totals.totalMarks}`,
  ]
    .filter(Boolean)
    .join('     |     ')
}

// ------------------------------------------------------------------ DOCX

export async function buildDocx(paper, qmap, { includeAnswerKey = false } = {}) {
  const sections = resolveSections(paper, qmap)
  const totals = computeTotals(paper.sections, qmap)
  const children = []

  const center = (text, opts = {}) =>
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, ...opts })] })

  if (paper.institution) children.push(center(paper.institution, { bold: true, size: 26 }))
  children.push(center(paper.title || 'Question Paper', { bold: true, size: 32 }))
  if (paper.examName) children.push(center(paper.examName, { size: 22 }))
  if (paper.headerText) children.push(center(paper.headerText, { size: 20 }))
  children.push(center(metaLine(paper, totals), { size: 20 }))
  children.push(
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '999999' } },
      children: [],
    })
  )
  if (paper.instructions) {
    children.push(
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({ text: `Instructions: ${paper.instructions}`, italics: true, size: 20 })],
      })
    )
  }

  let n = 1
  for (const sec of sections) {
    children.push(
      new Paragraph({
        spacing: { before: 240, after: 60 },
        children: [new TextRun({ text: sec.title, bold: true, size: 24 })],
      })
    )
    if (sec.instructions) {
      children.push(new Paragraph({ children: [new TextRun({ text: sec.instructions, italics: true, size: 20 })] }))
    }
    for (const q of sec.questions) {
      children.push(
        new Paragraph({
          spacing: { before: 120 },
          children: [
            new TextRun({ text: `${n}. `, bold: true }),
            new TextRun({ text: stemOf(q) }),
            q.marks ? new TextRun({ text: `   [${q.marks}]`, bold: true }) : new TextRun(''),
          ],
        })
      )
      if (q.intro) {
        children.push(new Paragraph({ indent: { left: 300 }, children: [new TextRun({ text: q.intro, size: 20 })] }))
      }
      if (q.options?.length) {
        q.options.forEach((o, i) => {
          children.push(
            new Paragraph({
              indent: { left: 400 },
              children: [new TextRun({ text: `(${LETTERS[i].toLowerCase()}) ${o.text}` })],
            })
          )
        })
      }
      n++
    }
  }

  if (includeAnswerKey) {
    children.push(
      new Paragraph({
        pageBreakBefore: true,
        spacing: { after: 120 },
        children: [new TextRun({ text: 'Answer Key', bold: true, size: 28 })],
      })
    )
    let m = 1
    for (const sec of sections) {
      for (const q of sec.questions) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `${m}. `, bold: true }), new TextRun({ text: answerFor(q) })],
          })
        )
        m++
      }
    }
  }

  const footerRuns = [
    new TextRun({ text: paper.footerText ? `${paper.footerText}    ` : '' }),
    new TextRun({ children: ['Page ', PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES] }),
  ]

  const doc = new Document({
    sections: [
      {
        properties: {},
        footers: {
          default: new Footer({
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: footerRuns })],
          }),
        },
        children,
      },
    ],
  })

  return Packer.toBuffer(doc)
}

// ------------------------------------------------------------------ PDF

// Replace characters outside pdf-lib's WinAnsi range so exports never throw.
function winAnsiSafe(text) {
  return String(text ?? '')
    .replace(/₹/g, 'Rs.')
    .replace(/[–—]/g, '-')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...')
    // Drop anything else above basic Latin-1 that Helvetica can't encode.
    .replace(/[^\x00-\xFF]/g, '?')
}

export async function buildPdf(paper, qmap, { includeAnswerKey = false } = {}) {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

  const A4 = [595.28, 841.89]
  const margin = 50
  let page = pdf.addPage(A4)
  let { width, height } = page.getSize()
  let y = height - margin

  const newPage = () => {
    page = pdf.addPage(A4)
    y = page.getSize().height - margin
  }
  const ensure = (space) => {
    if (y - space < margin + 24) newPage()
  }
  const wrap = (text, f, size, maxW) => {
    const words = winAnsiSafe(text).replace(/\s+/g, ' ').trim().split(' ')
    const lines = []
    let cur = ''
    for (const w of words) {
      const t = cur ? `${cur} ${w}` : w
      if (f.widthOfTextAtSize(t, size) > maxW) {
        if (cur) lines.push(cur)
        cur = w
      } else cur = t
    }
    if (cur) lines.push(cur)
    return lines.length ? lines : ['']
  }
  const draw = (text, { f = font, size = 11, indent = 0, gap = 4, color } = {}) => {
    const maxW = width - margin * 2 - indent
    for (const ln of wrap(text, f, size, maxW)) {
      ensure(size + gap)
      page.drawText(ln, { x: margin + indent, y: y - size, size, font: f, color: color || rgb(0, 0, 0) })
      y -= size + gap
    }
  }
  const center = (text, { f = bold, size = 16, gap = 6 } = {}) => {
    ensure(size + gap)
    const t = winAnsiSafe(text)
    const w = f.widthOfTextAtSize(t, size)
    page.drawText(t, { x: (width - w) / 2, y: y - size, size, font: f })
    y -= size + gap
  }

  const totals = computeTotals(paper.sections, qmap)
  if (paper.institution) center(paper.institution, { size: 14 })
  center(paper.title || 'Question Paper', { size: 18 })
  if (paper.examName) center(paper.examName, { f: font, size: 11 })
  if (paper.headerText) center(paper.headerText, { f: font, size: 10 })
  center(metaLine(paper, totals), { f: font, size: 10, gap: 10 })
  if (paper.instructions) draw(`Instructions: ${paper.instructions}`, { f: font, size: 10, gap: 8 })
  y -= 4

  const sections = resolveSections(paper, qmap)
  let n = 1
  for (const sec of sections) {
    ensure(20)
    draw(sec.title, { f: bold, size: 13, gap: 6 })
    if (sec.instructions) draw(sec.instructions, { f: font, size: 10 })
    for (const q of sec.questions) {
      const marksTxt = q.marks ? `   [${q.marks}]` : ''
      draw(`${n}. ${stemOf(q)}${marksTxt}`, { size: 11, gap: 5 })
      if (q.intro) draw(q.intro, { f: font, size: 10, indent: 16 })
      if (q.options?.length) {
        q.options.forEach((o, i) => draw(`(${LETTERS[i].toLowerCase()}) ${o.text}`, { f: font, size: 10, indent: 16 }))
      }
      n++
    }
  }

  if (includeAnswerKey) {
    newPage()
    center('Answer Key', { size: 16 })
    let m = 1
    for (const sec of sections) {
      for (const q of sec.questions) {
        draw(`${m}. ${answerFor(q)}`, { size: 11, gap: 4 })
        m++
      }
    }
  }

  // Footer + page numbers on every page.
  const pages = pdf.getPages()
  pages.forEach((p, idx) => {
    const txt = winAnsiSafe(`${paper.footerText ? `${paper.footerText}    ` : ''}Page ${idx + 1} of ${pages.length}`)
    const size = 8
    const w = font.widthOfTextAtSize(txt, size)
    p.drawText(txt, { x: (p.getSize().width - w) / 2, y: 25, size, font, color: rgb(0.4, 0.4, 0.4) })
  })

  return pdf.save() // Uint8Array
}
