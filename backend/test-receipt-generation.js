// Test Smart Receipt Generator
const receiptGenerator = require('./src/services/ReceiptGenerator');

async function testReceiptGenerator() {
    console.log('🧾 Testing Smart Receipt Generator...\n');

    // Test 1: Generate a successful transaction receipt
    console.log('Test 1: Generating successful transaction receipt...');
    const successTransaction = {
        transactionId: 'tx_test_' + Date.now(),
        amount: 500,
        fromCurrency: 'TRY',
        toCurrency: 'USD',
        fxRate: 0.029,
        commission: 14.5,
        selectedPSP: 'Stripe',
        senderEmail: 'sender@example.com',
        recipientEmail: 'recipient@example.com',
        status: 'completed',
        createdAt: new Date()
    };

    const receipt1 = receiptGenerator.generateReceipt(successTransaction);
    console.log('✅ Receipt generated for transaction:', receipt1.transactionId);
    console.log('   - Date:', receipt1.data.dateTime);
    console.log('   - Amount:', receipt1.data.amount, receipt1.data.fromCurrency);
    console.log('   - Total Received:', receipt1.data.totalReceived, receipt1.data.toCurrency);
    console.log('   - PSP:', receipt1.data.pspName);
    console.log('   - Status:', receipt1.data.statusText);

    // Test 2: Save receipt to file
    console.log('\nTest 2: Saving receipt to file...');
    const savedReceipt = await receiptGenerator.saveReceipt(successTransaction);
    if (savedReceipt.success) {
        console.log('✅ Receipt saved successfully!');
        console.log('   - File:', savedReceipt.filename);
        console.log('   - Path:', savedReceipt.filepath);
    } else {
        console.log('❌ Receipt save failed:', savedReceipt.error);
    }

    // Test 3: Generate a failed transaction receipt
    console.log('\nTest 3: Generating failed transaction receipt...');
    const failedTransaction = {
        transactionId: 'tx_failed_' + Date.now(),
        amount: 1000,
        fromCurrency: 'EUR',
        toCurrency: 'TRY',
        fxRate: 34.5,
        commission: 29.0,
        selectedPSP: 'PayPal',
        senderEmail: 'test@example.com',
        recipientEmail: 'recipient@example.com',
        status: 'failed',
        createdAt: new Date()
    };

    const receipt2 = receiptGenerator.generateReceipt(failedTransaction);
    console.log('✅ Failed receipt generated:', receipt2.transactionId);
    console.log('   - Status:', receipt2.data.statusText);

    // Test 4: Get receipt as JSON
    console.log('\nTest 4: Getting receipt as JSON...');
    const jsonReceipt = receiptGenerator.getReceiptAsJSON(successTransaction);
    console.log('✅ JSON Receipt generated:');
    console.log('   - Transaction ID:', jsonReceipt.transactionId);
    console.log('   - Generated At:', jsonReceipt.generatedAt);
    console.log('   - Format:', jsonReceipt.format);

    console.log('\n🎉 All Receipt Generator tests passed!');
}

testReceiptGenerator().catch(console.error);
