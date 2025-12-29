import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Type declaration for autoTable return value
interface AutoTableResult {
  finalY: number;
}

interface PayoutData {
  id: string;
  venue: {
    name: string;
    city: string;
    address: string | null;
    ownerName: string | null;
    phone: string | null;
    email: string | null;
    bankAccount: string | null;
    ifscCode: string | null;
  } | null;
  payoutAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  periodStartDate: string;
  periodEndDate: string;
  status: string;
  paymentMethod: string;
  transactionId: string | null;
  transactionDate: string | null;
  processedBy: string | null;
  processedAt: string | null;
  bookingCount: number;
  totalRevenue: number;
  createdAt: string;
}

export function generatePayoutPDF(payout: PayoutData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("PAYOUT SETTLEMENT SLIP", pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("ClubRadar - Venue Payment Settlement", pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  // Payout Details Box
  doc.setDrawColor(0, 0, 0);
  doc.setFillColor(245, 245, 245);
  doc.rect(10, yPos, pageWidth - 20, 50, "FD");
  
  yPos += 8;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Payout Details", 15, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Payout ID: ${payout.id}`, 15, yPos);
  yPos += 6;
  doc.text(`Status: ${payout.status.toUpperCase()}`, 15, yPos);
  yPos += 6;
  doc.text(`Period: ${new Date(payout.periodStartDate).toLocaleDateString()} - ${new Date(payout.periodEndDate).toLocaleDateString()}`, 15, yPos);
  yPos += 6;
  doc.text(`Generated: ${new Date(payout.createdAt).toLocaleString()}`, 15, yPos);
  yPos += 15;

  // Venue Information
  if (payout.venue) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Venue Information", 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Venue Name: ${payout.venue.name}`, 15, yPos);
    yPos += 6;
    doc.text(`City: ${payout.venue.city}`, 15, yPos);
    yPos += 6;
    if (payout.venue.address) {
      doc.text(`Address: ${payout.venue.address}`, 15, yPos);
      yPos += 6;
    }
    if (payout.venue.ownerName) {
      doc.text(`Owner: ${payout.venue.ownerName}`, 15, yPos);
      yPos += 6;
    }
    if (payout.venue.phone) {
      doc.text(`Phone: ${payout.venue.phone}`, 15, yPos);
      yPos += 6;
    }
    if (payout.venue.email) {
      doc.text(`Email: ${payout.venue.email}`, 15, yPos);
      yPos += 6;
    }
    yPos += 5;
  }

  // Financial Summary
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Financial Summary", 15, yPos);
  yPos += 8;

  const financialData = [
    ["Description", "Amount (₹)"],
    ["Total Revenue", payout.totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })],
    [`Platform Commission (${payout.commissionRate}%)`, `-${payout.commissionAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ["Net Payout Amount", payout.netAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })],
  ];

  // Use autoTable as a function (v5.x API) - pass doc as first parameter
  autoTable(doc, {
    startY: yPos,
    head: [financialData[0]],
    body: financialData.slice(1),
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 60, halign: "right" },
    },
  });

  // Get final Y position from the last autoTable call
  const finalY = (doc as any).lastAutoTable?.finalY || yPos + 30;
  yPos = finalY + 10;

  // Booking Details
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Booking Details", 15, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Bookings: ${payout.bookingCount}`, 15, yPos);
  yPos += 6;
  doc.text(`Average Booking Value: ₹${(payout.totalRevenue / payout.bookingCount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 15, yPos);
  yPos += 10;

  // Bank Details
  if (payout.venue?.bankAccount) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Bank Account Details", 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Account Holder: ${payout.venue.ownerName || "N/A"}`, 15, yPos);
    yPos += 6;
    doc.text(`Account Number: ${payout.venue.bankAccount}`, 15, yPos);
    yPos += 6;
    if (payout.venue.ifscCode) {
      doc.text(`IFSC Code: ${payout.venue.ifscCode}`, 15, yPos);
      yPos += 6;
    }
    yPos += 5;
  }

  // Transaction Details (if processed)
  if (payout.status === "processed" && payout.transactionId) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Transaction Details", 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Transaction ID: ${payout.transactionId}`, 15, yPos);
    yPos += 6;
    if (payout.transactionDate) {
      doc.text(`Transaction Date: ${new Date(payout.transactionDate).toLocaleString()}`, 15, yPos);
      yPos += 6;
    }
    if (payout.processedBy) {
      doc.text(`Processed By: ${payout.processedBy}`, 15, yPos);
      yPos += 6;
    }
    if (payout.processedAt) {
      doc.text(`Processed At: ${new Date(payout.processedAt).toLocaleString()}`, 15, yPos);
      yPos += 6;
    }
    yPos += 5;
  }

  // Footer
  const footerY = pageHeight - 20;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("This is a computer-generated document. No signature required.", pageWidth / 2, footerY, { align: "center" });
  doc.text("For queries, contact: support@clubradar.in", pageWidth / 2, footerY + 5, { align: "center" });

  // Save PDF
  const fileName = `Payout_${payout.venue?.name || "Venue"}_${payout.periodStartDate}_${payout.periodEndDate}.pdf`;
  doc.save(fileName);
}

