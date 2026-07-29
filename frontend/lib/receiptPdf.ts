import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Ticket {
  tier: string
  quantity: number
  unitPrice: number
  paymentRef: string
  updatedAt: string
  status: string
}

const PDF_ACCENT: [number, number, number] = [255, 69, 0]

export function downloadReceiptPDF(ticket: Ticket, buyerName: string, buyerEmail: string) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header
  doc.setFillColor(...PDF_ACCENT)
  doc.rect(0, 0, pageWidth, 90, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('NEXUS 2025', 40, 45)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Payment Receipt', 40, 65)

  // Buyer + order info
  doc.setTextColor(20, 20, 20)
  doc.setFontSize(11)
  let y = 120
  doc.setFont('helvetica', 'bold')
  doc.text('Billed to:', 40, y)
  doc.setFont('helvetica', 'normal')
  doc.text(buyerName, 40, y + 16)
  doc.text(buyerEmail, 40, y + 32)

  doc.setFont('helvetica', 'bold')
  doc.text('Receipt date:', 350, y)
  doc.setFont('helvetica', 'normal')
  doc.text(new Date(ticket.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), 350, y + 16)

  doc.setFont('helvetica', 'bold')
  doc.text('Reference:', 350, y + 32)
  doc.setFont('helvetica', 'normal')
  doc.text(ticket.paymentRef, 350, y + 48)

  if (ticket.status === 'refunded') {
    doc.setTextColor(220, 38, 38)
    doc.setFont('helvetica', 'bold')
    doc.text('REFUNDED', 350, y + 64)
    doc.setTextColor(20, 20, 20)
  }

  // Table
  autoTable(doc, {
    startY: y + 80,
    head: [['Description', 'Qty', 'Unit Price', 'Total']],
    body: [[
      `${ticket.tier} Ticket — NEXUS 2025`,
      String(ticket.quantity),
      `$${ticket.unitPrice.toLocaleString()}`,
      `$${(ticket.unitPrice * ticket.quantity).toLocaleString()}`,
    ]],
    theme: 'striped',
    headStyles: { fillColor: PDF_ACCENT, textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 8 },
    margin: { left: 40, right: 40 },
  })

  const finalY = (doc as any).lastAutoTable.finalY + 20
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(`Total paid: $${(ticket.unitPrice * ticket.quantity).toLocaleString()}`, pageWidth - 40, finalY, { align: 'right' })

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.setFont('helvetica', 'normal')
  doc.text('NEXUS 2025 — This receipt was generated automatically and does not require a signature.', 40, doc.internal.pageSize.getHeight() - 30)

  doc.save(`NEXUS-2025-Receipt-${ticket.paymentRef}.pdf`)
}