import { forwardRef } from 'react'

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

const Card = forwardRef(function Card({ className = '', ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-3xl border border-brand-border bg-white/95 shadow-card backdrop-blur-sm',
        className,
      )}
      {...props}
    />
  )
})

const CardHeader = ({ className = '', ...props }) => (
  <div className={cn('p-6 sm:p-8', className)} {...props} />
)

const CardTitle = ({ className = '', ...props }) => (
  <h3 className={cn('font-heading text-xl font-semibold text-brand-textPrimary', className)} {...props} />
)

const CardDescription = ({ className = '', ...props }) => (
  <p className={cn('mt-2 text-sm leading-7 text-brand-textSecondary', className)} {...props} />
)

const CardContent = ({ className = '', ...props }) => (
  <div className={cn('p-6 pt-0 sm:p-8 sm:pt-0', className)} {...props} />
)

export { Card, CardHeader, CardTitle, CardDescription, CardContent, cn }
