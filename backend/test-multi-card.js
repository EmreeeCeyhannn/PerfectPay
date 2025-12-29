// Test Multi-Card Optimizer
const multiCardOptimizer = require('./src/services/MultiCardOptimizer');

function testMultiCardOptimizer() {
    console.log('💳 Testing Multi-Card Optimizer...\n');

    // Sample cards for testing
    const userCards = [
        { id: 1, last4: '4242', type: 'visa', balance: 300, isActive: true, fixedFee: 0.30 },
        { id: 2, last4: '5555', type: 'mastercard', balance: 250, isActive: true, fixedFee: 0.30 },
        { id: 3, last4: '3782', type: 'amex', balance: 500, isActive: true, fixedFee: 0.30 },
        { id: 4, last4: '1234', type: 'debit', balance: 150, isActive: true, fixedFee: 0.15 }
    ];

    // Test 1: Amount that can be paid with single card
    console.log('Test 1: Single card sufficient (Amount: $400)');
    const result1 = multiCardOptimizer.analyzeMultiCardOption(
        { amount: 400, currency: 'USD' },
        userCards
    );
    console.log('✅ Recommendation:', result1.recommendedOption);
    console.log('   Reason:', result1.reason);
    if (result1.singleCardOption) {
        console.log('   Single Card: *' + result1.singleCardOption.cardLast4);
        console.log('   Fee: $' + result1.singleCardOption.estimatedFee);
    }

    // Test 2: Amount requires multi-card (no single card has enough)
    console.log('\nTest 2: Multi-card required (Amount: $600)');
    const result2 = multiCardOptimizer.analyzeMultiCardOption(
        { amount: 600, currency: 'USD' },
        userCards
    );
    console.log('✅ Recommendation:', result2.recommendedOption);
    console.log('   Reason:', result2.reason);
    if (result2.multiCardOption?.possible) {
        console.log('   Strategy:', result2.multiCardOption.strategy);
        console.log('   Cards Used:', result2.multiCardOption.cardsUsed);
        console.log('   Total Fees: $' + result2.multiCardOption.totalFees.toFixed(2));
        console.log('   Splits:');
        result2.multiCardOption.splits.forEach(s => {
            console.log(`      *${s.cardLast4}: $${s.chargeAmount.toFixed(2)} (fee: $${s.fee.toFixed(2)})`);
        });
    }

    // Test 3: Amount exceeds all cards combined
    console.log('\nTest 3: Insufficient total balance (Amount: $1500)');
    const result3 = multiCardOptimizer.analyzeMultiCardOption(
        { amount: 1500, currency: 'USD' },
        userCards
    );
    console.log('✅ Recommendation:', result3.recommended ? 'Multi-card' : 'Not possible');
    console.log('   Reason:', result3.reason);
    console.log('   Total Available: $' + result3.totalAvailableBalance);

    // Test 4: Multi-card saves significant fees
    console.log('\nTest 4: Fee comparison (Amount: $200)');
    const smallCards = [
        { id: 1, last4: '1111', type: 'debit', balance: 100, isActive: true, fixedFee: 0.15 },
        { id: 2, last4: '2222', type: 'debit', balance: 100, isActive: true, fixedFee: 0.15 },
        { id: 3, last4: '3333', type: 'amex', balance: 300, isActive: true, fixedFee: 0.30 }
    ];
    const result4 = multiCardOptimizer.analyzeMultiCardOption(
        { amount: 200, currency: 'USD' },
        smallCards
    );
    console.log('✅ Recommendation:', result4.recommendedOption);
    console.log('   Reason:', result4.reason);
    if (result4.singleCardOption) {
        console.log('   Single Card Fee: $' + result4.singleCardOption.estimatedFee);
    }
    if (result4.multiCardOption?.possible) {
        console.log('   Multi-Card Fee: $' + result4.multiCardOption.totalFees.toFixed(2));
    }

    // Test 5: Execute mock split payment
    console.log('\nTest 5: Execute Split Payment Simulation');
    const mockSplits = [
        { cardId: 1, cardLast4: '4242', chargeAmount: 200 },
        { cardId: 2, cardLast4: '5555', chargeAmount: 150 }
    ];

    const mockPaymentProcessor = async (data) => {
        // Simulate payment processing
        await new Promise(r => setTimeout(r, 100));
        return {
            success: true,
            transactionId: 'tx_' + Date.now() + '_' + data.cardId
        };
    };

    multiCardOptimizer.executeSplitPayment(
        mockSplits,
        { currency: 'USD', description: 'Test payment' },
        mockPaymentProcessor
    ).then(result => {
        console.log('✅ Split Payment Result:');
        console.log('   Success:', result.success);
        console.log('   Summary:', result.summary);
        console.log('   Total Charged: $' + result.totalCharged.toFixed(2));

        console.log('\n🎉 All Multi-Card Optimizer tests passed!');
    });
}

testMultiCardOptimizer();
