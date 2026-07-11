'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EnrollButton({ courseId, enrolled, className = '', price = 0, courseTitle = '' }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [statusTone, setStatusTone] = useState('')
  const isPaid = useMemo(() => Number(price) > 0, [price])

  if (enrolled) {
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={() => router.push(`/learn/${courseId}`)}
          className={className}
        >
          Go to course →
        </button>
      </div>
    )
  }

  async function loadRazorpayScript() {
    if (typeof window === 'undefined') return false
    if (window.Razorpay) return true

    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  async function handlePurchase() {
    setBusy(true)
    setStatusMessage('')
    setStatusTone('')

    try {
      if (!isPaid) {
        const res = await fetch('/api/enrollment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId }),
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(data.error || 'Could not enroll into this course.')
        }

        setStatusMessage('Enrollment completed. Opening your course now…')
        setStatusTone('success')
        router.push(`/learn/${courseId}`)
        return
      }

      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })

      const orderData = await orderRes.json().catch(() => ({}))
      if (!orderRes.ok || !orderData.ok) {
        throw new Error(orderData.error || 'Unable to start payment right now.')
      }

      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Razorpay checkout could not be loaded. Please try again.')
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.order_id,
        name: 'Daily Tutors',
        description: `Purchase ${courseTitle || 'this course'}`,
        image: '/logo-full.png',
        handler: async function (response) {
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                courseId,
              }),
            })

            const verifyData = await verifyRes.json().catch(() => ({}))
            if (!verifyRes.ok || !verifyData.ok) {
              throw new Error(verifyData.error || 'Payment verification failed.')
            }

            setStatusMessage('Payment successful. Unlocking your course…')
            setStatusTone('success')
            router.push(verifyData.redirectTo || '/dashboard')
          } catch (error) {
            setBusy(false)
            setStatusMessage(error.message || 'Payment verification failed.')
            setStatusTone('error')
          }
        },
        modal: {
          ondismiss: async function () {
            try {
              await fetch('/api/payments/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: orderData.order_id }),
              })
            } catch (error) {
              console.error('Payment cancellation failed:', error)
            }

            setBusy(false)
            setStatusMessage('Payment was cancelled. You can try again anytime.')
            setStatusTone('error')
          },
        },
        theme: { color: '#FF3131' },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
      setBusy(false)
    } catch (error) {
      setBusy(false)
      setStatusMessage(error.message || 'Something went wrong while starting the purchase.')
      setStatusTone('error')
    }
  }

  return (
    <div className="w-full">
      <button type="button" onClick={handlePurchase} disabled={busy} className={className}>
        {busy ? (isPaid ? 'Processing…' : 'Enrolling…') : isPaid ? 'Buy now' : 'Enroll now'}
      </button>
      {isPaid && !busy ? (
        <p className="mt-2 text-sm text-brand-textSecondary">
          If Razorpay opens a UPI QR, scan it with your UPI app. To pay by card, choose the "Cards" tab in the checkout modal.
        </p>
      ) : null}
      {statusMessage ? (
        <p className={`mt-2 text-sm ${statusTone === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {statusMessage}
        </p>
      ) : null}
    </div>
  )
}
