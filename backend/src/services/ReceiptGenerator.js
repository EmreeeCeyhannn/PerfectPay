// Smart Receipt Generator - Generates HTML/PDF receipts for transactions
const fs = require('fs');
const path = require('path');

class ReceiptGenerator {
    constructor() {
        this.receiptTemplate = this.getDefaultTemplate();
        this.outputDir = path.join(__dirname, '../../receipts');
        this.ensureOutputDir();
    }

    ensureOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    getDefaultTemplate() {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PerfectPay Receipt - {{transactionId}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
        .receipt { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { font-size: 24px; margin-bottom: 5px; }
        .header .subtitle { opacity: 0.9; font-size: 14px; }
        .status { padding: 15px 30px; background: #e8f5e9; border-left: 4px solid #4caf50; margin: 20px; border-radius: 4px; }
        .status.failed { background: #ffebee; border-left-color: #f44336; }
        .status h3 { color: #2e7d32; font-size: 16px; }
        .status.failed h3 { color: #c62828; }
        .details { padding: 20px 30px; }
        .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #666; font-size: 14px; }
        .detail-value { font-weight: 600; color: #333; font-size: 14px; }
        .amount-section { background: #f8f9fa; padding: 20px 30px; margin-top: 10px; }
        .amount-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .total-row { border-top: 2px solid #667eea; margin-top: 10px; padding-top: 15px; }
        .total-row .detail-value { font-size: 20px; color: #667eea; }
        .footer { text-align: center; padding: 20px 30px; color: #999; font-size: 12px; border-top: 1px solid #eee; }
        .footer a { color: #667eea; text-decoration: none; }
        .qr-section { text-align: center; padding: 20px; }
        .transaction-id { font-family: monospace; background: #f0f0f0; padding: 8px 12px; border-radius: 4px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <h1>💳 PerfectPay</h1>
            <div class="subtitle">Payment Receipt</div>
        </div>
        
        <div class="status {{statusClass}}">
            <h3>{{statusIcon}} {{statusText}}</h3>
        </div>
        
        <div class="details">
            <div class="detail-row">
                <span class="detail-label">Transaction ID</span>
                <span class="detail-value transaction-id">{{transactionId}}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date & Time</span>
                <span class="detail-value">{{dateTime}}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Payment Provider</span>
                <span class="detail-value">{{pspName}}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Sender</span>
                <span class="detail-value">{{senderEmail}}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Recipient</span>
                <span class="detail-value">{{recipientEmail}}</span>
            </div>
        </div>
        
        <div class="amount-section">
            <div class="amount-row">
                <span class="detail-label">Amount</span>
                <span class="detail-value">{{amount}} {{fromCurrency}}</span>
            </div>
            <div class="amount-row">
                <span class="detail-label">Exchange Rate</span>
                <span class="detail-value">1 {{fromCurrency}} = {{fxRate}} {{toCurrency}}</span>
            </div>
            <div class="amount-row">
                <span class="detail-label">Commission</span>
                <span class="detail-value">{{commission}} {{fromCurrency}}</span>
            </div>
            <div class="amount-row total-row">
                <span class="detail-label">Total Received</span>
                <span class="detail-value">{{totalReceived}} {{toCurrency}}</span>
            </div>
        </div>
        
        <div class="footer">
            <p>Thank you for using PerfectPay!</p>
            <p>Questions? Contact us at <a href="mailto:support@perfectpay.com">support@perfectpay.com</a></p>
            <p style="margin-top: 10px;">© 2025 PerfectPay - All rights reserved</p>
        </div>
    </div>
</body>
</html>
`;
    }

    generateReceipt(transactionData) {
        const {
            transactionId,
            amount,
            fromCurrency = 'TRY',
            toCurrency = 'USD',
            fxRate = 1,
            commission = 0,
            selectedPSP = 'Unknown',
            senderEmail = 'N/A',
            recipientEmail = 'N/A',
            status = 'completed',
            createdAt = new Date()
        } = transactionData;

        const isSuccess = status === 'completed' || status === 'success';
        const totalReceived = ((amount - commission) * fxRate).toFixed(2);

        const receiptData = {
            transactionId,
            dateTime: new Date(createdAt).toLocaleString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            amount: amount.toFixed(2),
            fromCurrency,
            toCurrency,
            fxRate: fxRate.toFixed(4),
            commission: commission.toFixed(2),
            totalReceived,
            pspName: selectedPSP,
            senderEmail,
            recipientEmail,
            statusClass: isSuccess ? '' : 'failed',
            statusIcon: isSuccess ? '✅' : '❌',
            statusText: isSuccess ? 'Payment Successful' : 'Payment Failed'
        };

        let html = this.receiptTemplate;
        Object.keys(receiptData).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(regex, receiptData[key]);
        });

        return {
            html,
            data: receiptData,
            transactionId
        };
    }

    async saveReceipt(transactionData) {
        const receipt = this.generateReceipt(transactionData);
        const filename = `receipt_${receipt.transactionId}_${Date.now()}.html`;
        const filepath = path.join(this.outputDir, filename);

        try {
            fs.writeFileSync(filepath, receipt.html, 'utf8');
            console.log(`[ReceiptGenerator] Receipt saved: ${filepath}`);
            return {
                success: true,
                filepath,
                filename,
                html: receipt.html,
                data: receipt.data
            };
        } catch (error) {
            console.error(`[ReceiptGenerator] Error saving receipt: ${error.message}`);
            return {
                success: false,
                error: error.message,
                html: receipt.html,
                data: receipt.data
            };
        }
    }

    getReceiptAsJSON(transactionData) {
        const receipt = this.generateReceipt(transactionData);
        return {
            transactionId: receipt.transactionId,
            generatedAt: new Date().toISOString(),
            receiptData: receipt.data,
            format: 'HTML',
            htmlContent: receipt.html
        };
    }
}

// Singleton instance
const receiptGenerator = new ReceiptGenerator();

module.exports = receiptGenerator;
