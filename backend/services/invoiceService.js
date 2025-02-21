const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Thermal printer standard width (58mm = ~219 points in PDF)
const PAPER_WIDTH = 219;
const MARGIN = 10;
const CONTENT_WIDTH = PAPER_WIDTH - (MARGIN * 2);

class InvoiceService {
  constructor() {
    this.doc = null;
  }

  async generateInvoice(order) {
    return new Promise((resolve, reject) => {
      try {
        // Initialize PDF document
        this.doc = new PDFDocument({
          size: [PAPER_WIDTH, 0], // Auto height
          margin: MARGIN,
          autoFirstPage: true,
          bufferPages: true
        });

        // Create a buffer to store the PDF data
        const chunks = [];
        this.doc.on('data', chunk => chunks.push(chunk));
        this.doc.on('end', () => {
          const result = Buffer.concat(chunks);
          resolve(result);
        });

        // Set up the document
        this.setupDocument();

        // Generate invoice content
        this.generateHeader();
        this.generateOrderInfo(order);
        this.generateItemsTable(order.items);
        this.generateTotals(order);
        this.generateFooter(order);

        // Finalize the PDF
        this.doc.end();
      } catch (error) {
        console.error('Error generating invoice:', error);
        reject(error);
      }
    });
  }

  setupDocument() {
    this.doc.font('Helvetica');
    this.doc.fontSize(8); // Small font size for thermal printing
  }

  generateHeader() {
    this.doc
      .fontSize(10)
      .text('RESTAURANT NAME', { align: 'center' })
      .fontSize(8)
      .text('123 Restaurant Street')
      .text('City, State 12345')
      .text('Tel: (123) 456-7890')
      .moveDown();
  }

  generateOrderInfo(order) {
    this.doc
      .text(`Order #: ${order.orderNumber}`)
      .text(`Date: ${new Date(order.createdAt).toLocaleString()}`)
      .text(`Type: ${order.type}`)
      .text(`Server: ${order.server.name}`)
      .moveDown();

    if (order.type === 'dine-in') {
      this.doc.text(`Table: ${order.table}`);
    } else if (order.customer) {
      this.doc
        .text(`Customer: ${order.customer.name}`)
        .text(`Phone: ${order.customer.phone}`);
      if (order.type === 'delivery') {
        this.doc.text(`Address: ${order.customer.address}`);
      }
    }
    this.doc.moveDown();
  }

  generateItemsTable(items) {
    this.doc.fontSize(8);
    
    // Headers
    this.doc
      .text('Item', MARGIN, this.doc.y, { width: CONTENT_WIDTH * 0.5, align: 'left' })
      .text('Qty', MARGIN + CONTENT_WIDTH * 0.5, this.doc.y - this.doc.currentLineHeight(), 
        { width: CONTENT_WIDTH * 0.2, align: 'center' })
      .text('Price', MARGIN + CONTENT_WIDTH * 0.7, this.doc.y - this.doc.currentLineHeight(), 
        { width: CONTENT_WIDTH * 0.3, align: 'right' })
      .moveDown();

    // Items
    items.forEach(item => {
      const y = this.doc.y;
      this.doc
        .text(item.menuItem.name, MARGIN, y, 
          { width: CONTENT_WIDTH * 0.5, align: 'left' })
        .text(item.quantity.toString(), MARGIN + CONTENT_WIDTH * 0.5, y, 
          { width: CONTENT_WIDTH * 0.2, align: 'center' })
        .text(`$${item.price.toFixed(2)}`, MARGIN + CONTENT_WIDTH * 0.7, y, 
          { width: CONTENT_WIDTH * 0.3, align: 'right' });
      
      if (item.notes) {
        this.doc
          .fontSize(7)
          .text(`Note: ${item.notes}`, MARGIN, this.doc.y, { width: CONTENT_WIDTH })
          .fontSize(8);
      }
    });

    this.doc.moveDown();
  }

  generateTotals(order) {
    const { subtotal, tax, total } = order;
    
    this.doc
      .text('Subtotal:', MARGIN, this.doc.y, 
        { width: CONTENT_WIDTH * 0.7, align: 'right' })
      .text(`$${subtotal.toFixed(2)}`, MARGIN + CONTENT_WIDTH * 0.7, this.doc.y - this.doc.currentLineHeight(), 
        { width: CONTENT_WIDTH * 0.3, align: 'right' })
      .text('Tax:', MARGIN, this.doc.y, 
        { width: CONTENT_WIDTH * 0.7, align: 'right' })
      .text(`$${tax.toFixed(2)}`, MARGIN + CONTENT_WIDTH * 0.7, this.doc.y - this.doc.currentLineHeight(), 
        { width: CONTENT_WIDTH * 0.3, align: 'right' })
      .fontSize(10)
      .text('Total:', MARGIN, this.doc.y, 
        { width: CONTENT_WIDTH * 0.7, align: 'right' })
      .text(`$${total.toFixed(2)}`, MARGIN + CONTENT_WIDTH * 0.7, this.doc.y - this.doc.currentLineHeight(), 
        { width: CONTENT_WIDTH * 0.3, align: 'right' })
      .fontSize(8)
      .moveDown();

    // Payment information
    if (order.paymentLogs && order.paymentLogs.length > 0) {
      order.paymentLogs.forEach(payment => {
        this.doc
          .text(`Paid (${payment.method}):`, MARGIN, this.doc.y, 
            { width: CONTENT_WIDTH * 0.7, align: 'right' })
          .text(`$${payment.amount.toFixed(2)}`, MARGIN + CONTENT_WIDTH * 0.7, 
            this.doc.y - this.doc.currentLineHeight(), 
            { width: CONTENT_WIDTH * 0.3, align: 'right' });

        if (payment.method === 'card_machine') {
          this.doc
            .fontSize(7)
            .text(`Card: **** ${payment.cardLastDigits}`, 
              { align: 'right' })
            .text(`Receipt: ${payment.receiptNumber}`, 
              { align: 'right' })
            .fontSize(8);
        }
      });
    }
  }

  generateFooter(order) {
    this.doc
      .moveDown()
      .fontSize(7)
      .text('Thank you for your business!', { align: 'center' })
      .text(`Printed: ${new Date().toLocaleString()}`, { align: 'center' })
      .text(`Order ID: ${order._id}`, { align: 'center' });
  }
}

module.exports = new InvoiceService();