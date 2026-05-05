'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react'

interface Payment {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paid_at: string
  created_at: string
  user: {
    username: string
    whatsapp_no: string
    email: string
  }
  subscription: {
    plan: {
      name: string
    }
  }
  invoice: {
    invoice_number: string
    status: string
  }
}

export default function PaymentsTable() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchPayments()
  }, [statusFilter, page])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        page: page.toString(),
        limit: '50',
      })
      const response = await fetch(`/api/admin/payments?${params}`)
      const data = await response.json()
      setPayments(data.payments || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (paymentId: string) => {
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', payment_id }),
      })
      if (response.ok) {
        fetchPayments()
      }
    } catch (error) {
      console.error('Failed to approve payment:', error)
    }
  }

  const handleReject = async (paymentId: string) => {
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', payment_id }),
      })
      if (response.ok) {
        fetchPayments()
      }
    } catch (error) {
      console.error('Failed to reject payment:', error)
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Payments</CardTitle>
          <div className="flex gap-2">
            <Input
              placeholder="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40"
            />
            <Button variant="outline" size="icon" onClick={fetchPayments}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading payments...</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{payment.user?.username || 'N/A'}</TableCell>
                    <TableCell>{payment.user?.whatsapp_no || 'N/A'}</TableCell>
                    <TableCell>₹{payment.amount}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      {payment.subscription?.plan?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {payment.invoice?.invoice_number || '-'}
                    </TableCell>
                    <TableCell>
                      {payment.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(payment.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(payment.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="py-2">Page {page} of {totalPages}</span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
