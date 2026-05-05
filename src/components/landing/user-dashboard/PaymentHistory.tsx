'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

interface Payment {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paid_at: string
  created_at: string
  subscription: {
    plan: {
      name: string
      duration_months: number
    }
  }
  invoice: {
    invoice_number: string
    status: string
  }
}

interface PaymentHistoryProps {
  userId: string
}

export default function PaymentHistory({ userId }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [userId])

  const fetchPayments = async () => {
    try {
      const response = await fetch(`/api/payments/user/${userId}`)
      const data = await response.json()
      setPayments(data.payments || [])
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-800">Refunded</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading payment history...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No payment history found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {new Date(payment.paid_at || payment.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {payment.subscription?.plan?.name || 'N/A'}
                  </TableCell>
                  <TableCell>₹{payment.amount}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>
                    {payment.invoice?.invoice_number || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
