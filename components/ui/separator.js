function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function Separator({ className = '' }) {
  return <div className={cn('h-px w-full bg-gradient-to-r from-transparent via-brand-border to-transparent', className)} />
}
