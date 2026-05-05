'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface Subscription {
  id: string
  status: 'active' | 'expired' | 'cancelled'
  start_date: string
  end_date: string
  plan: {
    name: string
    duration_months: number
  }
}

interface SubscriptionBannerProps {
  userId: string
}

export default function SubscriptionBanner({ userId }: SubscriptionBannerProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscription()
  }, [userId])

  const fetchSubscription = async () => {
    try {
      const response = await fetch(`/api/subscriptions/user/${userId}`)
      const data = await response.json()
      setSubscription(data.subscription || null)
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return null
  }

  if (!subscription) {
    return (
      <Card className="bg-linear-to-r from-blue-500 to-blue-600 text-white p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6" />
            <div>
              <h3 className="font-semibold text-lg">Start Your Free Trial</h3>
              <p className="text-blue-100">7 days free access to all sessions</p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => {/* TODO: Open pricing modal */}}>
            Upgrade Now
          </Button>
        </div>
      </Card>
    )
  }

  const isExpiringSoon = new Date(subscription.end_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const isExpired = new Date(subscription.end_date) < new Date()

  if (subscription.status === 'active' && !isExpired) {
    return (
      <Card className={`p-6 mb-6 ${isExpiringSoon ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className={`h-6 w-6 ${isExpiringSoon ? 'text-yellow-600' : 'text-green-600'}`} />
            <div>
              <h3 className={`font-semibold text-lg ${isExpiringSoon ? 'text-yellow-800' : 'text-green-800'}`}>
                {isExpiringSoon ? 'Subscription Expiring Soon' : 'Active Subscription'}
              </h3>
              <p className={isExpiringSoon ? 'text-yellow-700' : 'text-green-700'}>
                {subscription.plan.name} Plan • Expires on {new Date(subscription.end_date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button onClick={() => {/* TODO: Open pricing modal for renewal */}}>
            {isExpiringSoon ? 'Renew Now' : 'Upgrade Plan'}
          </Button>
        </div>
      </Card>
    )
  }

  if (subscription.status === 'expired' || isExpired) {
    return (
      <Card className="bg-red-50 border-red-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-lg text-red-800">Subscription Expired</h3>
              <p className="text-red-700">
                Your {subscription.plan.name} plan expired on {new Date(subscription.end_date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button onClick={() => {/* TODO: Open pricing modal */}}>
            Renew Now
          </Button>
        </div>
      </Card>
    )
  }

  return null
}
