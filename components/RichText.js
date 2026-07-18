'use client'

import { useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

// Lightweight, XSS-safe rich renderer for question content. Faculty author in a
// plain textarea using a small, familiar syntax; this renders it for preview,
// the bank browser and (eventually) exports:
//   $...$ / $$...$$  → math (KaTeX)
//   **bold**  *italic*  `code`
//   ![alt](url)      → image (http/https/data-image only)
//   | a | b |        → table rows
//   newlines         → line breaks
//
// Safety: ALL user text is HTML-escaped first; only KaTeX output (trusted) and
// our own generated tags with sanitized attributes are injected. No raw user
// HTML is ever rendered.

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function safeUrl(u) {
  return /^(https?:\/\/|data:image\/)/i.test(u.trim()) ? u.trim() : '#'
}

function renderMath(tex, display) {
  try {
    return katex.renderToString(tex, { displayMode: display, throwOnError: false, output: 'html' })
  } catch {
    return escapeHtml(display ? `$$${tex}$$` : `$${tex}$`)
  }
}

function inlineMd(escaped) {
  return escaped
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, url) =>
      `<img src="${safeUrl(url)}" alt="${escapeHtml(alt)}" class="my-1 inline-block max-h-60 rounded border border-brand-border" />`
    )
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code class="rounded bg-brand-surface px-1">$1</code>')
}

function renderBlock(escapedText) {
  const lines = escapedText.split('\n')
  const out = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    // Pipe table: a run of lines that contain a '|'.
    if (line.includes('|') && line.trim() !== '') {
      const tableLines = []
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
        tableLines.push(lines[i])
        i++
      }
      const rows = tableLines
        .filter((l) => !/^\s*\|?[\s:-]*\|[\s:|-]*$/.test(l)) // drop --- separator rows
        .map((l) =>
          l
            .replace(/^\s*\|/, '')
            .replace(/\|\s*$/, '')
            .split('|')
            .map((c) => `<td class="border border-brand-border px-2 py-1">${inlineMd(c.trim())}</td>`)
            .join('')
        )
        .map((cells) => `<tr>${cells}</tr>`)
        .join('')
      out.push(`<table class="my-2 border-collapse text-sm"><tbody>${rows}</tbody></table>`)
      continue
    }
    out.push(inlineMd(line))
    i++
  }
  return out.join('<br />')
}

function render(text) {
  if (!text) return ''
  // 1) Extract math to placeholders so escaping/markdown never touches TeX.
  const math = []
  const withTokens = String(text)
    .replace(/\$\$([\s\S]+?)\$\$/g, (_m, tex) => {
      math.push(renderMath(tex, true))
      return `@@MATH${math.length - 1}@@`
    })
    .replace(/\$([^$\n]+?)\$/g, (_m, tex) => {
      math.push(renderMath(tex, false))
      return `@@MATH${math.length - 1}@@`
    })
  // 2) Escape, then apply block + inline markdown.
  let html = renderBlock(escapeHtml(withTokens))
  // 3) Restore math (placeholders survive escaping unchanged).
  html = html.replace(/@@MATH(\d+)@@/g, (_m, n) => math[Number(n)] || '')
  return html
}

export default function RichText({ text, className = '' }) {
  const html = useMemo(() => render(text), [text])
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
