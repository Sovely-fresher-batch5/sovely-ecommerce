import { Invoice } from '../models/Invoice.js';
import { Order } from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getInvoice = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findOne({
        _id: req.params.id,
        userId: req.user._id,
    }).populate('orderId');

    if (!invoice) throw new ApiError(404, 'Invoice not found');

    return res.status(200).json(new ApiResponse(200, invoice, 'Invoice details fetched'));
});

export const listMyInvoices = asyncHandler(async (req, res) => {
    const invoices = await Invoice.find({ userId: req.user._id })
        .populate('orderId')
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, invoices, 'Invoices fetched successfully'));
});

export const getAllInvoices = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || '';
    const status = req.query.status || 'ALL';

    const query = {};

    if (status !== 'ALL') {
        if (status === 'OVERDUE') {
            query.status = 'UNPAID';
            query.dueDate = { $lt: new Date() };
        } else {
            query.status = status;
        }
    }

    if (search) {
        query['$or'] = [
            { invoiceNumber: { $regex: search, $options: 'i' } },
            { 'buyerDetails.companyName': { $regex: search, $options: 'i' } },
            { 'buyerDetails.gstin': { $regex: search, $options: 'i' } }
        ];
    }

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
        .populate('orderId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return res.status(200).json(
        new ApiResponse(
            200,
            { data: invoices, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } },
            'All invoices fetched'
        )
    );
});

export const markAsPaidManual = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) throw new ApiError(404, 'Invoice not found');

    if (invoice.status === 'PAID') {
        throw new ApiError(400, 'Invoice is already paid');
    }

    invoice.status = 'PAID';
    await invoice.save();

    if (invoice.invoiceType === 'ORDER_BILL' && invoice.orderId) {
        await Order.findByIdAndUpdate(invoice.orderId, { status: 'COMPLETED' });
    }

    return res.status(200).json(new ApiResponse(200, invoice, 'Invoice marked as paid manually'));
});

const amountToWords = (amount) => {
    return `Rupees ${Math.floor(amount)} Only`;
};

export const generateInvoicePDF = async (req, res, next) => {
    try {
        const query = { _id: req.params.id };
if (req.user.role !== 'ADMIN') query.userId = req.user._id;

const invoice = await Invoice.findOne(query).populate('orderId');

        if (!invoice) throw new ApiError(404, 'Invoice not found');

        const doc = new PDFDocument({ margin: 40, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=Tax_Invoice_${invoice.invoiceNumber}.pdf`
        );

        doc.pipe(res);
        doc.on('error', (err) => {
            console.error('PDF Generation Error:', err);
            if (!res.headersSent) {
                next(new ApiError(500, 'Failed to generate PDF'));
            }
        });

        const logoPath = path.join(__dirname, '../../public/images/sovely-logo.png');
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 40, 30, { width: 120 });
        } else {

            doc.fontSize(20).font('Helvetica-Bold').text('SOVELY', 40, 40);
        }

        doc.fontSize(16).font('Helvetica-Bold').text('TAX INVOICE', 0, 40, { align: 'right', width: 555 });
        doc.moveDown(2);

        const topY = doc.y;

        doc.fontSize(10).font('Helvetica-Bold').text('Sold By:', 40, topY);
        doc.font('Helvetica').text('Sovely E-Commerce Pvt. Ltd.');
        doc.text('123 Commerce St., Indiranagar');
        doc.text('Bengaluru, Karnataka, 560038');
        doc.font('Helvetica-Bold')
            .text('GSTIN: ', { continued: true })
            .font('Helvetica')
            .text('29ABCDE1234F1Z5');
        doc.text('State Code: 29 (Karnataka)');

        doc.font('Helvetica-Bold').text('Billed To:', 320, topY);
        doc.font('Helvetica').text(invoice.buyerDetails?.companyName || req.user.name);
        if(invoice.buyerDetails?.gstin && invoice.buyerDetails?.gstin !== 'UNREGISTERED') {
             doc.font('Helvetica-Bold')
                .text('GSTIN: ', { continued: true })
                .font('Helvetica')
                .text(invoice.buyerDetails.gstin);
        }
        doc.text(req.user.email);
        doc.text('Place of Supply: Karnataka');

        doc.moveDown(2);

        const metaY = doc.y;
        doc.rect(40, metaY - 5, 515, 45).stroke('#cccccc');

        doc.font('Helvetica-Bold')
            .fontSize(9)
            .text('Invoice Number: ', 50, metaY)
            .font('Helvetica')
            .text(invoice.invoiceNumber, 130, metaY);
        doc.font('Helvetica-Bold')
            .text('Invoice Date: ', 50, metaY + 15)
            .font('Helvetica')
            .text(new Date(invoice.createdAt).toLocaleDateString('en-IN'), 130, metaY + 15);

        if (invoice.orderId) {
            doc.font('Helvetica-Bold')
                .text('Order Ref: ', 320, metaY)
                .font('Helvetica')
                .text(invoice.orderId.orderId || 'N/A', 380, metaY);
            doc.font('Helvetica-Bold')
                .text('Order Date: ', 320, metaY + 15)
                .font('Helvetica')
                .text(
                    new Date(invoice.orderId.orderDate || invoice.createdAt).toLocaleDateString(
                        'en-IN'
                    ),
                    380,
                    metaY + 15
                );
        }

        doc.moveDown(3);

        if (invoice.invoiceType === 'ORDER_BILL' && invoice.orderId) {
            let y = doc.y;

            const drawHeaders = (currentY) => {
                doc.font('Helvetica-Bold').fontSize(8);
                doc.rect(40, currentY - 5, 515, 20).fillAndStroke('#f0f0f0', '#cccccc');
                doc.fillColor('#000000');
                doc.text('S.No', 45, currentY);
                doc.text('Product', 75, currentY);
                doc.text('HSN', 230, currentY);
                doc.text('Qty', 270, currentY);
                doc.text('Base Price', 300, currentY);
                doc.text('Tax Rate', 370, currentY);
                doc.text('Tax Amt', 430, currentY);
                doc.text('Total (Rs)', 490, currentY);
                doc.font('Helvetica').fontSize(8);
                return currentY + 20;
            };

            y = drawHeaders(y);

            let index = 1;

            for (const item of invoice.orderId.items) {
                if (y > 700) {
                    doc.addPage();
                    y = 50;
                    y = drawHeaders(y);
                }

                const displayTitle = item.title.length > 30 ? item.title.substring(0, 27) + '...' : item.title;
                const baseTotal = item.basePrice * item.qty;
                const taxTotal = item.taxAmountPerUnit * item.qty;
                const finalTotal = item.totalItemPrice;

                doc.text(index.toString(), 45, y);
                doc.text(displayTitle, 75, y);
                doc.text(item.hsnCode || '0000', 230, y);
                doc.text(item.qty.toString(), 270, y);
                doc.text(baseTotal.toFixed(2), 300, y);
                doc.text(`${item.taxSlab || 18}%`, 370, y);
                doc.text(taxTotal.toFixed(2), 430, y);
                doc.text(finalTotal.toFixed(2), 490, y);

                y += 20;
                index++;
            }

            if (y > 680) {
                doc.addPage();
                y = 50;
            }

            doc.moveTo(40, y - 5)
                .lineTo(555, y - 5)
                .stroke('#cccccc');
            y += 5;

            doc.font('Helvetica-Bold').fontSize(9);
            doc.text('Subtotal (Base Value):', 360, y);
            doc.text(`Rs. ${invoice.subTotal?.toFixed(2) || '0.00'}`, 480, y, { align: 'right' });
            y += 15;

            if (invoice.taxBreakdown?.igstTotal > 0) {
                 doc.text('IGST Amount:', 360, y);
                 doc.text(`Rs. ${invoice.taxBreakdown.igstTotal.toFixed(2)}`, 480, y, { align: 'right' });
                 y += 15;
            } else {
                 doc.text('CGST Amount:', 360, y);
                 doc.text(`Rs. ${invoice.taxBreakdown?.cgstTotal?.toFixed(2) || '0.00'}`, 480, y, { align: 'right' });
                 y += 15;
                 doc.text('SGST Amount:', 360, y);
                 doc.text(`Rs. ${invoice.taxBreakdown?.sgstTotal?.toFixed(2) || '0.00'}`, 480, y, { align: 'right' });
                 y += 15;
            }

            doc.fontSize(11).text('Grand Total:', 360, y);
            doc.text(`Rs. ${invoice.grandTotal?.toFixed(2) || invoice.totalAmount.toFixed(2)}`, 480, y, { align: 'right' });

            doc.moveDown(2);

            doc.fontSize(9).font('Helvetica-Bold').text('Amount in Words:');
            doc.font('Helvetica').text(amountToWords(invoice.grandTotal || invoice.totalAmount));
        }

        doc.moveDown(2);

        const footerY = doc.y;

        try {
            const upiString = `upi://pay?pa=sovely@upi&pn=Sovely+ECommerce&tr=${invoice.invoiceNumber}&am=${(invoice.grandTotal || invoice.totalAmount).toFixed(2)}&cu=INR`;
            const qrImage = await QRCode.toDataURL(upiString);

            doc.image(qrImage, 40, footerY, { width: 70 });
            doc.fontSize(8)
                .font('Helvetica')
                .text('Scan to Pay via UPI', 40, footerY + 75);
        } catch (err) {
            console.error('QR Code generation failed', err);
        }

        doc.font('Helvetica-Bold')
            .fontSize(10)
            .text('For Sovely E-Commerce Pvt. Ltd.', 350, footerY, { align: 'right' });
        doc.moveDown(3);
        doc.font('Helvetica')
            .fontSize(8)
            .text('Authorized Signatory', 350, doc.y, { align: 'right' });

        doc.moveDown(3);
        doc.fontSize(7)
            .fillColor('#666666')
            .text(
                'Declaration: We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct. This is a computer-generated invoice and does not require a physical signature.',
                40,
                doc.y,
                { width: 515, align: 'justify' }
            );

        doc.end();
    } catch (error) {
        next(error);
    }
};