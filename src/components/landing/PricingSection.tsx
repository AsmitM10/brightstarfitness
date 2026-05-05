'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'
import PaymentModal from './PaymentModal'

interface Plan {
  id: string
  name: string
  price: number
  duration_months: number
  features: string[]
}

export default function PricingSection() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchPlans()
    // Check if user is logged in by checking localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsed = JSON.parse(userData)
        setUserId(parsed.id || null)
      } catch (e) {
        console.error('Failed to parse user data:', e)
      }
    }
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/payment-plans')
      const data = await response.json()
      setPlans(data.plans || [])
    } catch (error) {
      console.error('Failed to fetch plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = (plan: Plan) => {
    if (!userId) {
      // Redirect to registration if not logged in
      window.location.href = '/#join-form'
      return
    }
    setSelectedPlan(plan)
    setIsPaymentModalOpen(true)
  }

  if (loading) {
    return <div className="text-center py-12">Loading pricing plans...</div>
  }

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
          <p className="text-xl text-gray-600">Start your fitness journey with our flexible pricing options</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={plan.id} className={`relative ${index === 1 ? 'border-blue-500 shadow-xl scale-105' : ''}`}>
              {index === 1 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                  <span className="text-gray-600">/{plan.duration_months === 1 ? 'month' : plan.duration_months === 3 ? 'quarter' : 'year'}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade(plan)}
                  variant={index === 1 ? 'default' : 'outline'}
                >
                  Get Started
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        plan={selectedPlan}
        userId={userId || ''}
      />
    </section>
  )
}
