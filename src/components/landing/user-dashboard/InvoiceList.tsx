'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, FileText } from 'lucide-react'

interface Invoice {
  id: string
  invoice_number: string
  amount: number
  total_amount: number
  status: 'generated' | 'sent' | 'failed'
  generated_at: string
  invoice_url: string | null
}

interface InvoiceListProps {
  userId: string
}

export default function InvoiceList({ userId }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoices()
  }, [userId])

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`/api/invoices/user/${userId}`)
      const data = await response.json()
      setInvoices(data.invoices || [])
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (invoice: Invoice) => {
    if (invoice.invoice_url) {
      window.open(invoice.invoice_url, '_blank')
    } else {
      // TODO: Generate PDF on the fly
      alert('Invoice PDF will be available soon.')
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

  if (loading) {
    return <div className="text-center py-8">Loading invoices...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No invoices found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>
                    {new Date(invoice.generated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>₹{invoice.total_amount}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(invoice)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
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
