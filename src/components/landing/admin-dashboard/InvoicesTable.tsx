'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FileText, Send, RefreshCw } from 'lucide-react'

interface Invoice {
  id: string
  invoice_number: string
  amount: number
  total_amount: number
  status: 'generated' | 'sent' | 'failed'
  generated_at: string
  sent_at: string | null
  invoice_url: string | null
  user: {
    username: string
    whatsapp_no: string
    email: string
  }
  payment: {
    amount: number
    status: string
    paid_at: string
  }
  subscription: {
    plan: {
      name: string
    }
  }
}

export default function InvoicesTable() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchInvoices()
  }, [statusFilter, page])

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        page: page.toString(),
        limit: '50',
      })
      const response = await fetch(`/api/admin/invoices?${params}`)
      const data = await response.json()
      setInvoices(data.invoices || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async (invoiceId: string) => {
    try {
      const response = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend', invoice_id }),
      })
      if (response.ok) {
        fetchInvoices()
      }
    } catch (error) {
      console.error('Failed to resend invoice:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800">Sent</Badge>
      case 'generated':
        return <Badge className="bg-blue-100 text-blue-800">Generated</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Invoices</CardTitle>
          <div className="flex gap-2">
            <Input
              placeholder="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40"
            />
            <Button variant="outline" size="icon" onClick={fetchInvoices}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading invoices...</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>
                      {new Date(invoice.generated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{invoice.user?.username || 'N/A'}</TableCell>
                    <TableCell>{invoice.user?.whatsapp_no || 'N/A'}</TableCell>
                    <TableCell>₹{invoice.total_amount}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      {invoice.subscription?.plan?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {invoice.sent_at
                        ? new Date(invoice.sent_at).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResend(invoice.id)}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Resend
                        </Button>
                        {invoice.invoice_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(invoice.invoice_url, '_blank')}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        )}
                      </div>
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
