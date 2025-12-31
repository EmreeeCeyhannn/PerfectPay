# KYC/AML Technical Documentation
## PerfectPay Compliance & Security Framework

---

## Table of Contents
1. [Overview](#overview)
2. [KYC (Know Your Customer) Flow](#kyc-flow)
3. [AML (Anti-Money Laundering) Rules](#aml-rules)
4. [Blacklist Management](#blacklist-management)
5. [Admin Guide](#admin-guide)
6. [API Reference](#api-reference)
7. [Implementation Details](#implementation-details)
8. [Testing & Validation](#testing-validation)

---

## 1. Overview

PerfectPay implements a comprehensive KYC/AML compliance framework to prevent fraud, money laundering, and unauthorized transactions. The system operates on three security layers:

### Security Layers
```
┌─────────────────────────────────────────┐
│  Layer 1: KYC Verification             │
│  - Identity verification                │
│  - Document validation                  │
│  - Risk profiling                       │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Layer 2: AML Monitoring                │
│  - Transaction pattern analysis         │
│  - Suspicious activity detection        │
│  - Blacklist checking                   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Layer 3: Fraud Detection Engine        │
│  - Real-time risk scoring (0-100)       │
│  - Rule-based blocking                  │
│  - Automated actions                    │
└─────────────────────────────────────────┘
```

### Key Features
- ✅ Multi-level user verification
- ✅ Real-time transaction monitoring
- ✅ Automated blacklist checking
- ✅ Suspicious activity flagging
- ✅ Admin review & override system
- ✅ Audit logging for all compliance actions

---

## 2. KYC (Know Your Customer) Flow

### 2.1 KYC Status Levels

| Status | Description | Transaction Limits | Verification Required |
|--------|-------------|-------------------|----------------------|
| **Unverified** | New account, no documents submitted | ❌ No transactions allowed | Email verification only |
| **Pending** | Documents submitted, awaiting review | ⚠️ Limited (max $100/day) | ID + Proof of address |
| **Approved** | Full verification complete | ✅ Full access | All documents verified |
| **Rejected** | Verification failed | ❌ Account suspended | Re-submission required |
| **Suspended** | Compliance issue detected | ❌ Account locked | Admin investigation |

### 2.2 Verification Process Flow

```
User Registration
      ↓
Email Verification
      ↓
[Unverified Status]
      ↓
Submit KYC Documents → Admin Review Queue
      ↓                        ↓
[Pending Status]          Document Check
      ↓                        ↓
Automated Checks        Identity Verification
  - Name matching             ↓
  - Document validity    Fraud Check (AML)
  - Age verification          ↓
      ↓                  Manual Review (if needed)
      ↓                        ↓
[Approved Status] ←─── Admin Approval
```

### 2.3 Required Documents

#### Tier 1: Basic Verification (Required for all users)
- ✅ Government-issued photo ID (Passport, Driver's License, National ID)
- ✅ Clear selfie (for face matching)

#### Tier 2: Enhanced Verification (For transactions > $10,000)
- ✅ Proof of address (Utility bill, Bank statement - max 3 months old)
- ✅ Source of funds declaration

#### Tier 3: Business Accounts
- ✅ Business registration documents
- ✅ Tax identification number
- ✅ Authorized signatory list

### 2.4 KYC Database Schema

```sql
-- Users table includes KYC status
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    kyc_status VARCHAR(50) DEFAULT 'unverified',
    kyc_submitted_at TIMESTAMP,
    kyc_approved_at TIMESTAMP,
    kyc_rejected_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- KYC Documents (Future enhancement)
CREATE TABLE kyc_documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    document_type VARCHAR(50), -- 'id', 'address_proof', 'selfie'
    file_path VARCHAR(500),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.5 Transaction Limits by KYC Status

| KYC Status | Daily Limit | Monthly Limit | Single Transaction Limit |
|------------|-------------|---------------|--------------------------|
| Unverified | $0 | $0 | $0 |
| Pending | $100 | $500 | $50 |
| Approved | $10,000 | $50,000 | $5,000 |
| Business | $100,000 | $500,000 | $50,000 |

---

## 3. AML (Anti-Money Laundering) Rules

### 3.1 Suspicious Activity Indicators

The system automatically flags transactions matching any of these patterns:

#### High-Risk Patterns
1. **Structuring (Smurfing)**
   - Multiple transactions just below reporting threshold ($10,000)
   - Example: 5 transactions of $9,900 in one day
   - Action: Auto-flag + Admin review

2. **Rapid Movement**
   - Funds deposited and immediately withdrawn
   - Example: $50,000 in, $48,000 out within 24 hours
   - Action: Hold funds for 72 hours

3. **Unusual Volume**
   - Transaction volume significantly exceeds user's historical average
   - Example: Average $500/month → Suddenly $50,000
   - Action: Request source of funds documentation

4. **Geographic Anomalies**
   - Transactions from/to high-risk jurisdictions
   - Example: Large transfers to sanctioned countries
   - Action: Enhanced due diligence

5. **Round Number Transactions**
   - Suspicious pattern of round amounts
   - Example: $10,000, $20,000, $50,000 (not typical user behavior)
   - Action: Pattern analysis flag

6. **Third-Party Payments**
   - Frequent payments to unrelated accounts
   - Example: User A pays 20 different recipients daily
   - Action: Verify business purpose

### 3.2 AML Risk Scoring Matrix

```javascript
// Automated AML Risk Score Calculation
function calculateAMLRisk(transaction, userHistory) {
    let riskScore = 0;
    
    // Factor 1: Transaction amount vs. user average
    if (transaction.amount > userHistory.avgAmount * 10) {
        riskScore += 25;
    }
    
    // Factor 2: Frequency (transactions per hour)
    if (userHistory.txCountLastHour > 5) {
        riskScore += 30;
    }
    
    // Factor 3: Geographic risk
    if (isHighRiskCountry(transaction.destination)) {
        riskScore += 20;
    }
    
    // Factor 4: New account activity
    const accountAgeDays = getAccountAge(transaction.userId);
    if (accountAgeDays < 7 && transaction.amount > 1000) {
        riskScore += 15;
    }
    
    // Factor 5: Blacklist check
    if (isBlacklisted(transaction.recipientId)) {
        riskScore = 100; // Immediate block
    }
    
    return riskScore;
}
```

### 3.3 Risk Score Actions

| Score Range | Risk Level | Automated Action | Human Review Required |
|-------------|------------|------------------|----------------------|
| 0-20 | **LOW** | ✅ Process normally | ❌ No |
| 21-40 | **MODERATE** | ⚠️ Add to monitoring list | ❌ No (periodic review) |
| 41-60 | **ELEVATED** | 🔍 Enhanced logging | ⚠️ Weekly review |
| 61-80 | **HIGH** | ⏸️ Hold for 24h review | ✅ Yes (within 24h) |
| 81-100 | **CRITICAL** | 🚫 Block immediately | ✅ Yes (immediate) |

### 3.4 Reporting Thresholds

PerfectPay automatically generates compliance reports for:

1. **Currency Transaction Reports (CTR)**
   - Any transaction ≥ $10,000
   - Aggregated transactions > $10,000 in 24 hours

2. **Suspicious Activity Reports (SAR)**
   - Structuring attempts
   - Unusual patterns detected by AI
   - Transactions involving blacklisted entities

3. **Large Cash Transaction Reports**
   - Cash deposits > $5,000
   - Multiple cash transactions totaling > $5,000

---

## 4. Blacklist Management

### 4.1 Blacklist Types

```sql
CREATE TABLE blacklist (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50), -- 'user', 'email', 'phone', 'ip', 'card', 'bank_account'
    entity_value VARCHAR(500) NOT NULL,
    reason TEXT NOT NULL,
    severity VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
    source VARCHAR(100), -- 'manual', 'automated', 'external_feed'
    added_by INTEGER REFERENCES users(id),
    expires_at TIMESTAMP, -- NULL for permanent
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Blacklist check log
CREATE TABLE blacklist_checks (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(id),
    entity_checked VARCHAR(500),
    is_match BOOLEAN,
    matched_rule_id INTEGER REFERENCES blacklist(id),
    checked_at TIMESTAMP DEFAULT NOW()
);
```

### 4.2 Blacklist Sources

1. **Internal Blacklist** (Manual admin additions)
   - Confirmed fraud cases
   - Repeat offenders
   - Chargeback abusers

2. **External Feeds** (Automated imports)
   - OFAC Sanctions List
   - EU Sanctions List
   - Interpol Red Notices
   - PEP (Politically Exposed Persons) lists

3. **AI-Generated** (System recommendations)
   - Pattern-based detection
   - ML model predictions
   - Behavioral analysis flags

### 4.3 Blacklist Checking Flow

```
New Transaction Request
         ↓
Extract Identifiers
  - User ID
  - Email
  - Phone
  - IP Address
  - Card Number (hashed)
         ↓
Check Against Blacklist
         ↓
    Match Found? ──NO──→ Continue to Fraud Engine
         │
        YES
         ↓
Log Blacklist Hit
         ↓
Severity Level?
    ├─ Low/Medium → Hold for Review
    └─ High/Critical → Block Immediately
         ↓
Notify Admin + User
         ↓
Create Investigation Ticket
```

### 4.4 Admin Blacklist Actions

```javascript
// API Endpoints for Blacklist Management

// Add to blacklist
POST /api/admin/blacklist
Body: {
    entity_type: "email",
    entity_value: "suspicious@example.com",
    reason: "Multiple fraud attempts",
    severity: "high",
    expires_at: null // permanent
}

// Remove from blacklist
DELETE /api/admin/blacklist/:id

// Update blacklist entry
PUT /api/admin/blacklist/:id
Body: {
    is_active: false,
    reason: "False positive - user verified"
}

// Search blacklist
GET /api/admin/blacklist?search=email@example.com
```

---

## 5. Admin Guide

### 5.1 Daily Admin Workflow

#### Morning Tasks (Priority: HIGH)
1. **Review Overnight Alerts**
   ```
   Dashboard → Alerts Tab
   - Check high-risk transactions
   - Review new KYC submissions
   - Investigate blacklist hits
   ```

2. **KYC Queue Review**
   ```
   Admin Panel → Users → KYC Pending
   - Review submitted documents
   - Approve/Reject with notes
   - Request additional info if needed
   ```

3. **Suspicious Transaction Review**
   ```
   Dashboard → Transactions → Flagged
   - Review AML risk scores > 60
   - Check fraud detection logs
   - Release or escalate holds
   ```

#### Ongoing Monitoring
- **Real-time Dashboard**: Monitor live transaction feed
- **Alert System**: Respond to critical notifications within 15 minutes
- **User Support**: Handle KYC-related inquiries

#### End-of-Day Tasks
1. Generate compliance summary report
2. Update blacklist from external feeds
3. Review pending cases needing escalation

### 5.2 Admin Decision Matrix

| Scenario | Evidence Required | Action | Timeline |
|----------|------------------|--------|----------|
| KYC Approval | Valid ID + Clear selfie + Address proof | Approve | < 24 hours |
| KYC Rejection | Missing docs / Poor quality / Mismatch | Reject with reason | < 48 hours |
| Transaction Hold | AML score 60-80 | Request documentation | < 24 hours |
| Transaction Block | AML score > 80 or Blacklist hit | Permanent block + Report | Immediate |
| Account Suspension | Multiple violations | Suspend + Investigation | < 4 hours |
| Blacklist Addition | Confirmed fraud / Law enforcement request | Add to blacklist | Immediate |

### 5.3 Admin Panel Navigation

```
┌─────────────────────────────────────────────────┐
│  PerfectPay Admin Dashboard                     │
├─────────────────────────────────────────────────┤
│  [Overview] [Users] [Transactions] [Security]   │
└─────────────────────────────────────────────────┘

Overview Tab:
  - Total Users by KYC Status
  - Flagged Transactions (Last 24h)
  - Pending KYC Reviews
  - Blacklist Hit Count
  - AML Score Distribution Chart

Users Tab:
  - User List with KYC Status
  - Search by Email/ID/Phone
  - Filters: KYC Status, Risk Level
  - Actions: View Profile, Approve KYC, Suspend

Transactions Tab:
  - All Transactions
  - Filters: Status, Risk Score, Date Range
  - Flagged Transactions Queue
  - Actions: View Details, Release Hold, Block

Security Tab:
  - Blacklist Management
  - Fraud Detection Logs
  - AML Reports
  - Audit Logs
```

### 5.4 Admin API Endpoints

```javascript
// Get KYC pending queue
GET /api/admin/kyc/pending
Response: [
    {
        user_id: 123,
        email: "user@example.com",
        full_name: "John Doe",
        kyc_submitted_at: "2025-12-30T10:00:00Z",
        documents: [...]
    }
]

// Approve KYC
POST /api/admin/kyc/approve
Body: {
    user_id: 123,
    notes: "All documents verified"
}

// Reject KYC
POST /api/admin/kyc/reject
Body: {
    user_id: 123,
    reason: "ID document expired"
}

// Get flagged transactions
GET /api/admin/transactions/flagged
Query: ?risk_level=high&status=pending

// Release transaction hold
POST /api/admin/transactions/:id/release
Body: {
    reason: "User provided valid source of funds documentation"
}

// Get compliance summary
GET /api/admin/compliance/summary?date=2025-12-30
Response: {
    total_transactions: 1523,
    flagged_count: 47,
    blocked_count: 3,
    blacklist_hits: 2,
    kyc_approvals: 12,
    kyc_rejections: 1
}
```

---

## 6. API Reference

### 6.1 User-Facing KYC Endpoints

#### Submit KYC Documents
```http
POST /api/user/kyc
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
    "full_name": "John Doe",
    "date_of_birth": "1990-01-01",
    "address": "123 Main St, City, Country",
    "id_number": "AB123456",
    "id_type": "passport"
}

Response (200):
{
    "message": "KYC submitted successfully",
    "user": {
        "id": 123,
        "kyc_status": "pending",
        "kyc_submitted_at": "2025-12-30T10:00:00Z"
    }
}

Response (400):
{
    "error": "Missing required fields"
}
```

#### Check KYC Status
```http
GET /api/user/profile
Authorization: Bearer <token>

Response (200):
{
    "id": 123,
    "email": "user@example.com",
    "kyc_status": "approved",
    "kyc_approved_at": "2025-12-25T14:30:00Z",
    "transaction_limits": {
        "daily": 10000,
        "monthly": 50000,
        "single": 5000
    }
}
```

### 6.2 Admin Endpoints

#### Get All Users with KYC Status
```http
GET /api/admin/users
Authorization: Bearer <admin_token>

Response (200):
[
    {
        "id": 123,
        "email": "user@example.com",
        "full_name": "John Doe",
        "kyc_status": "pending",
        "created_at": "2025-12-01T10:00:00Z"
    },
    ...
]
```

#### Get Blacklist
```http
GET /api/admin/blacklist
Authorization: Bearer <admin_token>

Response (200):
[
    {
        "id": 1,
        "entity_type": "email",
        "entity_value": "fraud@example.com",
        "reason": "Confirmed fraud case",
        "severity": "critical",
        "is_active": true,
        "created_at": "2025-12-01T10:00:00Z"
    },
    ...
]
```

---

## 7. Implementation Details

### 7.1 Backend Service Architecture

```
src/
├── controllers/
│   ├── UserController.js          # KYC submission endpoint
│   ├── AdminController.js          # Admin KYC management
│   └── BlacklistController.js      # Blacklist CRUD operations
├── services/
│   ├── KYCService.js              # KYC verification logic
│   ├── AMLService.js              # AML pattern detection
│   ├── BlacklistService.js        # Blacklist checking
│   └── PaymentOrchestrationService.js  # Integrates all checks
├── middleware/
│   ├── auth.js                    # JWT authentication
│   ├── kycCheck.js                # Verify KYC before transactions
│   └── blacklistCheck.js          # Check against blacklist
└── models/
    ├── User.js                    # User + KYC status
    ├── Transaction.js             # Transaction logging
    └── Blacklist.js               # Blacklist queries
```

### 7.2 Current Implementation Status

✅ **Implemented:**
- User KYC status field in database
- Basic KYC submission endpoint (`POST /api/user/kyc`)
- Admin user listing with KYC status
- Profile display of KYC status
- Transaction limits (logic needs enforcement)

⚠️ **Partially Implemented:**
- Blacklist table exists (needs admin UI)
- Fraud detection engine (exists but separate from AML)
- Audit logging (basic level only)

❌ **Not Yet Implemented:**
- KYC document upload functionality
- Automated KYC verification
- Admin KYC approval/rejection endpoints
- AML pattern detection service
- Blacklist auto-checking in payment flow
- External sanctions list integration
- Compliance reporting dashboard

### 7.3 Integration Points

```javascript
// PaymentOrchestrationService.js
async initiateMoneyTransfer(transferData) {
    // Step 1: Check user KYC status
    const user = await User.findById(transferData.userId);
    if (user.kyc_status !== 'approved') {
        throw new Error('KYC verification required');
    }
    
    // Step 2: Check transaction limits
    const limits = this.getTransactionLimits(user.kyc_status);
    if (transferData.amount > limits.single) {
        throw new Error('Transaction exceeds limit');
    }
    
    // Step 3: Blacklist check
    const isBlacklisted = await BlacklistService.check({
        userId: transferData.userId,
        recipientEmail: transferData.recipientEmail
    });
    if (isBlacklisted) {
        await this.logSecurityEvent('BLACKLIST_HIT', transferData);
        throw new Error('Transaction blocked - security check failed');
    }
    
    // Step 4: AML risk assessment
    const amlScore = await AMLService.calculateRisk(transferData, user);
    if (amlScore > 80) {
        await this.flagTransaction(transferData, 'HIGH_AML_RISK');
        throw new Error('Transaction requires manual review');
    }
    
    // Step 5: Fraud detection
    const fraudAssessment = await FraudDetectionEngine.assessRisk(transferData);
    if (fraudAssessment.action === 'DECLINE') {
        throw new Error('Transaction declined - fraud risk');
    }
    
    // Step 6: Proceed with payment if all checks pass
    return await this.processPayment(transferData);
}
```

---

## 8. Testing & Validation

### 8.1 Test Scenarios

#### KYC Flow Tests
```javascript
// Test 1: New user cannot transact
const newUser = await createTestUser({ kyc_status: 'unverified' });
const result = await attemptTransaction(newUser.id, 100);
expect(result.error).toBe('KYC verification required');

// Test 2: Pending user has limits
const pendingUser = await createTestUser({ kyc_status: 'pending' });
const result1 = await attemptTransaction(pendingUser.id, 50);  // Should pass
const result2 = await attemptTransaction(pendingUser.id, 200); // Should fail
expect(result2.error).toContain('exceeds limit');

// Test 3: Approved user full access
const approvedUser = await createTestUser({ kyc_status: 'approved' });
const result = await attemptTransaction(approvedUser.id, 5000);
expect(result.status).toBe('success');
```

#### Blacklist Tests
```javascript
// Test 1: Email blacklist
await addToBlacklist({ entity_type: 'email', entity_value: 'fraud@example.com' });
const result = await attemptTransaction({ 
    recipientEmail: 'fraud@example.com' 
});
expect(result.error).toContain('blocked');

// Test 2: IP blacklist
await addToBlacklist({ entity_type: 'ip', entity_value: '192.168.1.100' });
const result = await attemptTransaction({ userIp: '192.168.1.100' });
expect(result.status).toBe('blocked');
```

#### AML Pattern Tests
```javascript
// Test 1: Rapid transactions (structuring)
const user = await createTestUser();
for (let i = 0; i < 10; i++) {
    await attemptTransaction(user.id, 9900); // Just below $10k threshold
}
const flags = await getAMLFlags(user.id);
expect(flags).toContain('STRUCTURING_SUSPECTED');

// Test 2: Unusual volume
const avgUser = await createTestUser({ avgMonthlyVolume: 500 });
const result = await attemptTransaction(avgUser.id, 50000);
expect(result.status).toBe('held_for_review');
```

### 8.2 Manual Testing Checklist

#### For Admins
- [ ] Log in to admin panel
- [ ] Navigate to Users → KYC Pending
- [ ] Review a pending KYC submission
- [ ] Approve a KYC request
- [ ] Reject a KYC request with reason
- [ ] Add an email to blacklist
- [ ] Check transaction flagging for high-risk transaction
- [ ] Release a held transaction
- [ ] Generate compliance report
- [ ] Verify audit logs are recording admin actions

#### For Users
- [ ] Register new account
- [ ] Attempt transaction before KYC (should fail)
- [ ] Submit KYC documents
- [ ] Check KYC status in profile
- [ ] Attempt transaction after KYC approval (should succeed)
- [ ] Test transaction limits based on KYC tier

---

## 9. Compliance Best Practices

### 9.1 Data Retention
- **KYC Documents**: Retain for 7 years after account closure
- **Transaction Logs**: Retain for 5 years
- **AML Reports**: Retain for 5 years
- **Audit Logs**: Retain for 3 years

### 9.2 Privacy & GDPR
- Encrypt all KYC documents at rest
- Implement right-to-be-forgotten (with compliance exceptions)
- Log all data access for audit purposes
- Limit admin access to need-to-know basis

### 9.3 Regular Audits
- **Weekly**: Review flagged transactions
- **Monthly**: Update blacklist from external sources
- **Quarterly**: System security audit
- **Annually**: External compliance audit

---

## 10. Future Enhancements

### Phase 2 (Q1 2026)
- [ ] AI-powered KYC document verification
- [ ] Biometric verification (facial recognition)
- [ ] Real-time sanctions list integration
- [ ] Automated AML report generation

### Phase 3 (Q2 2026)
- [ ] Machine learning fraud prediction models
- [ ] Graph analysis for money laundering detection
- [ ] Integration with government KYC databases
- [ ] Blockchain-based identity verification

---

## Support & Contact

**Compliance Team Email**: compliance@perfectpay.com  
**Security Incidents**: security@perfectpay.com  
**Admin Support**: admin-support@perfectpay.com

**Emergency Hotline**: +1-800-PERFECTPAY (24/7)

---

*Last Updated: December 30, 2025*  
*Document Version: 1.0*  
*Prepared by: PerfectPay Compliance Team*

