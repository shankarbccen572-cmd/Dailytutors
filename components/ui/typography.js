function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function PageTitle({ className = '', ...props }) {
  return <h1 className={cn('font-heading text-3xl font-semibold tracking-tight text-brand-textPrimary sm:text-4xl', className)} {...props} />
}

export function SectionTitle({ className = '', ...props }) {
  return <h2 className={cn('font-heading text-xl font-semibold text-brand-textPrimary', className)} {...props} />
}

export function SectionText({ className = '', ...props }) {
  return <p className={cn('text-base leading-8 text-brand-textSecondary', className)} {...props} />
}

export function MutedText({ className = '', ...props }) {
  return <p className={cn('text-sm leading-7 text-brand-textSecondary', className)} {...props} />
}

export function ListItem({ className = '', ...props }) {
  return <li className={cn('text-base leading-8 text-brand-textSecondary', className)} {...props} />
}
