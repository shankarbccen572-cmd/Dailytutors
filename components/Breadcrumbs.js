import Link from 'next/link'

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Breadcrumbs({ items = [] }) {
  if (!items.length) return null

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-brand-textSecondary">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href} className="transition hover:text-brand-accent">
                  {item.label}
                </Link>
              ) : (
                <span className={cn(isLast ? 'font-medium text-brand-textPrimary' : '')}>{item.label}</span>
              )}
              {!isLast ? <span aria-hidden="true">/</span> : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
