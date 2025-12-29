// Multi-Card Optimizer - Splits transactions across multiple cards/wallets
// for optimal fee reduction or when single card has insufficient balance

class MultiCardOptimizer {
    constructor() {
        this.splitStrategies = ['equal', 'proportional', 'fee-optimal'];
        this.maxCardsPerTransaction = 4;
        this.minSplitAmount = 10; // Minimum amount per card to avoid micro-transactions
    }

    /**
     * Analyze if multi-card split would be beneficial
     * @param {Object} transactionData - Transaction details
     * @param {Array} availableCards - User's available cards with balances
     * @returns {Object} Analysis result with recommendation
     */
    analyzeMultiCardOption(transactionData, availableCards) {
        const { amount, currency } = transactionData;

        if (!availableCards || availableCards.length === 0) {
            return {
                recommended: false,
                reason: 'No cards available',
                singleCardOption: null,
                multiCardOption: null
            };
        }

        // Sort cards by balance (descending)
        const sortedCards = [...availableCards].sort((a, b) => b.balance - a.balance);

        // Check if single card can cover the amount
        const singleCardOption = this.findSingleCardOption(sortedCards, amount);

        // Check if multi-card is needed or beneficial
        const multiCardOption = this.calculateOptimalSplit(sortedCards, amount, currency);

        // Determine recommendation
        const recommendation = this.compareOptions(singleCardOption, multiCardOption, amount);

        return {
            transactionAmount: amount,
            currency,
            totalAvailableBalance: sortedCards.reduce((sum, c) => sum + c.balance, 0),
            singleCardOption,
            multiCardOption,
            ...recommendation
        };
    }

    /**
     * Find best single card option
     */
    findSingleCardOption(cards, amount) {
        const eligibleCard = cards.find(c => c.balance >= amount && c.isActive);

        if (!eligibleCard) {
            return null;
        }

        return {
            cardId: eligibleCard.id,
            cardLast4: eligibleCard.last4,
            cardType: eligibleCard.type,
            balance: eligibleCard.balance,
            chargeAmount: amount,
            estimatedFee: this.estimateFee(amount, eligibleCard),
            remainingBalance: eligibleCard.balance - amount
        };
    }

    /**
     * Calculate optimal multi-card split
     */
    calculateOptimalSplit(cards, amount, currency) {
        const activeCards = cards.filter(c => c.isActive && c.balance > this.minSplitAmount);

        if (activeCards.length < 2) {
            return null;
        }

        const totalAvailable = activeCards.reduce((sum, c) => sum + c.balance, 0);

        if (totalAvailable < amount) {
            return {
                possible: false,
                reason: 'Insufficient total balance across all cards',
                totalAvailable,
                shortfall: amount - totalAvailable
            };
        }

        // Strategy 1: Proportional split based on card balances
        const proportionalSplit = this.proportionalSplit(activeCards, amount);

        // Strategy 2: Fee-optimal split (minimize total fees)
        const feeOptimalSplit = this.feeOptimalSplit(activeCards, amount);

        // Strategy 3: Equal split
        const equalSplit = this.equalSplit(activeCards, amount);

        // Choose best strategy based on total fees
        const strategies = [proportionalSplit, feeOptimalSplit, equalSplit].filter(s => s.possible);

        if (strategies.length === 0) {
            return {
                possible: false,
                reason: 'Cannot create valid split with available cards'
            };
        }

        const bestStrategy = strategies.reduce((best, current) =>
            current.totalFees < best.totalFees ? current : best
        );

        return {
            possible: true,
            strategy: bestStrategy.strategy,
            splits: bestStrategy.splits,
            totalFees: bestStrategy.totalFees,
            feesSaved: proportionalSplit.totalFees - bestStrategy.totalFees,
            cardsUsed: bestStrategy.splits.length
        };
    }

    /**
     * Proportional split based on card balances
     */
    proportionalSplit(cards, amount) {
        const totalBalance = cards.reduce((sum, c) => sum + c.balance, 0);
        const splits = [];
        let remaining = amount;

        for (const card of cards) {
            if (remaining <= 0) break;

            const proportion = card.balance / totalBalance;
            let chargeAmount = Math.min(
                Math.round(amount * proportion * 100) / 100,
                card.balance,
                remaining
            );

            // Ensure minimum amount
            if (chargeAmount < this.minSplitAmount && remaining >= this.minSplitAmount) {
                chargeAmount = Math.min(this.minSplitAmount, remaining);
            }

            if (chargeAmount >= this.minSplitAmount) {
                splits.push({
                    cardId: card.id,
                    cardLast4: card.last4,
                    cardType: card.type,
                    chargeAmount,
                    fee: this.estimateFee(chargeAmount, card)
                });
                remaining -= chargeAmount;
            }
        }

        // Handle any remaining amount due to rounding
        if (remaining > 0 && splits.length > 0) {
            splits[0].chargeAmount += remaining;
            splits[0].fee = this.estimateFee(splits[0].chargeAmount, cards[0]);
        }

        return {
            possible: splits.length > 0 && remaining <= 0.01,
            strategy: 'proportional',
            splits,
            totalFees: splits.reduce((sum, s) => sum + s.fee, 0)
        };
    }

    /**
     * Fee-optimal split - minimize transaction fees
     */
    feeOptimalSplit(cards, amount) {
        // Strategy: Use cards with lowest fee rates first
        const cardsByFeeRate = [...cards].sort((a, b) => {
            const feeRateA = this.getFeeRate(a);
            const feeRateB = this.getFeeRate(b);
            return feeRateA - feeRateB;
        });

        const splits = [];
        let remaining = amount;

        for (const card of cardsByFeeRate) {
            if (remaining <= 0) break;
            if (splits.length >= this.maxCardsPerTransaction) break;

            const chargeAmount = Math.min(card.balance, remaining);

            if (chargeAmount >= this.minSplitAmount) {
                splits.push({
                    cardId: card.id,
                    cardLast4: card.last4,
                    cardType: card.type,
                    chargeAmount,
                    fee: this.estimateFee(chargeAmount, card)
                });
                remaining -= chargeAmount;
            }
        }

        return {
            possible: remaining <= 0.01,
            strategy: 'fee-optimal',
            splits,
            totalFees: splits.reduce((sum, s) => sum + s.fee, 0)
        };
    }

    /**
     * Equal split across all cards
     */
    equalSplit(cards, amount) {
        const eligibleCards = cards.filter(c => c.balance >= this.minSplitAmount);
        const numCards = Math.min(eligibleCards.length, this.maxCardsPerTransaction);

        if (numCards === 0) {
            return { possible: false, strategy: 'equal', splits: [], totalFees: 0 };
        }

        const baseAmount = Math.floor(amount / numCards * 100) / 100;
        const remainder = amount - (baseAmount * numCards);

        const splits = eligibleCards.slice(0, numCards).map((card, index) => {
            const chargeAmount = index === 0 ? baseAmount + remainder : baseAmount;

            if (chargeAmount > card.balance) {
                return null;
            }

            return {
                cardId: card.id,
                cardLast4: card.last4,
                cardType: card.type,
                chargeAmount,
                fee: this.estimateFee(chargeAmount, card)
            };
        }).filter(s => s !== null);

        const totalCharged = splits.reduce((sum, s) => sum + s.chargeAmount, 0);

        return {
            possible: Math.abs(totalCharged - amount) < 0.01,
            strategy: 'equal',
            splits,
            totalFees: splits.reduce((sum, s) => sum + s.fee, 0)
        };
    }

    /**
     * Estimate transaction fee for a card
     */
    estimateFee(amount, card) {
        const baseRate = this.getFeeRate(card);
        const fixedFee = card.fixedFee || 0.30;
        return Math.round((amount * baseRate + fixedFee) * 100) / 100;
    }

    /**
     * Get fee rate for a card type
     */
    getFeeRate(card) {
        const feeRates = {
            'visa': 0.029,
            'mastercard': 0.029,
            'amex': 0.035,
            'discover': 0.029,
            'debit': 0.015,
            'wallet': 0.01,
            'default': 0.029
        };
        return feeRates[card.type?.toLowerCase()] || feeRates.default;
    }

    /**
     * Compare single vs multi-card options
     */
    compareOptions(singleCard, multiCard, amount) {
        if (!singleCard && !multiCard?.possible) {
            return {
                recommended: false,
                reason: 'Insufficient balance on all cards',
                action: 'ADD_FUNDS'
            };
        }

        if (!singleCard && multiCard?.possible) {
            return {
                recommended: true,
                recommendedOption: 'multi-card',
                reason: 'Single card insufficient, multi-card split required',
                action: 'USE_MULTI_CARD'
            };
        }

        if (singleCard && !multiCard?.possible) {
            return {
                recommended: false,
                recommendedOption: 'single-card',
                reason: 'Single card is sufficient and optimal',
                action: 'USE_SINGLE_CARD'
            };
        }

        // Both options available - compare fees
        const singleCardFee = singleCard.estimatedFee;
        const multiCardFee = multiCard.totalFees;

        if (multiCardFee < singleCardFee - 0.50) { // Multi-card saves at least $0.50
            return {
                recommended: true,
                recommendedOption: 'multi-card',
                reason: `Multi-card saves $${(singleCardFee - multiCardFee).toFixed(2)} in fees`,
                action: 'USE_MULTI_CARD',
                savings: singleCardFee - multiCardFee
            };
        }

        return {
            recommended: false,
            recommendedOption: 'single-card',
            reason: 'Single card is simpler with similar fees',
            action: 'USE_SINGLE_CARD'
        };
    }

    /**
     * Execute multi-card split payment
     * @param {Array} splits - Split configuration
     * @param {Object} transactionData - Transaction details
     * @param {Function} processPayment - Payment processing function
     */
    async executeSplitPayment(splits, transactionData, processPayment) {
        const results = [];
        let totalSuccess = 0;
        let totalFailed = 0;

        console.log(`💳 Executing multi-card payment with ${splits.length} cards...`);

        for (const split of splits) {
            try {
                console.log(`  Processing ${split.cardLast4}: $${split.chargeAmount}`);

                const result = await processPayment({
                    ...transactionData,
                    amount: split.chargeAmount,
                    cardId: split.cardId,
                    partOfMultiCard: true
                });

                results.push({
                    cardId: split.cardId,
                    cardLast4: split.cardLast4,
                    amount: split.chargeAmount,
                    success: result.success,
                    transactionId: result.transactionId,
                    error: result.error
                });

                if (result.success) {
                    totalSuccess += split.chargeAmount;
                } else {
                    totalFailed += split.chargeAmount;
                }
            } catch (error) {
                results.push({
                    cardId: split.cardId,
                    cardLast4: split.cardLast4,
                    amount: split.chargeAmount,
                    success: false,
                    error: error.message
                });
                totalFailed += split.chargeAmount;
            }
        }

        const allSuccessful = totalFailed === 0;

        return {
            success: allSuccessful,
            multiCard: true,
            totalCharged: totalSuccess,
            totalFailed,
            splitResults: results,
            summary: allSuccessful
                ? `Successfully charged ${splits.length} cards for total $${totalSuccess.toFixed(2)}`
                : `Partial success: $${totalSuccess.toFixed(2)} charged, $${totalFailed.toFixed(2)} failed`
        };
    }
}

// Singleton instance
const multiCardOptimizer = new MultiCardOptimizer();

module.exports = multiCardOptimizer;
