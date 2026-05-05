'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { loadScript } from '@/lib/razorpay'

interface Plan {
  id: string
  name: string
  price: number
  duration_months: number
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  plan: Plan | null
  userId: string
}

export default function PaymentModal({ isOpen, onClose, plan, userId }: PaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load Razorpay script when modal opens
    if (isOpen) {
      loadScript('https://checkout.razorpay.com/v1/checkout.js')
    }
  }, [isOpen])

  const handlePayment = async () => {
    if (!plan || !userId) return

    setLoading(true)
    setError(null)

    try {
      // Initiate payment
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          plan_id: plan.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment')
      }

      // Open Razorpay checkout
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'Bright Star Fitness',
        description: `${plan.name} Plan`,
        order_id: data.order_id,
        handler: async (response: any) => {
          // Verify payment
          const verifyResponse = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              user_id: userId,
              plan_id: plan.id,
            }),
          })

          const verifyData = await verifyResponse.json()

          if (verifyData.success) {
            // Payment successful
            onClose()
            // TODO: Show success message or redirect
            alert('Payment successful! Subscription activated.')
          } else {
            setError('Payment verification failed')
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#3B82F6',
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err: any) {
      setError(err.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upgrade to {plan?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Plan:</span>
              <span className="font-semibold">{plan?.name}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-700">Amount:</span>
              <span className="font-semibold text-2xl">₹{plan?.price}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-700">Duration:</span>
              <span className="font-semibold">{plan?.duration_months} {plan?.duration_months === 1 ? 'month' : plan?.duration_months === 3 ? 'months' : 'year'}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handlePayment} disabled={loading} className="flex-1">
              {loading ? 'Processing...' : 'Pay Now'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
