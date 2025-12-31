# Environment Profiles Guide

## 📋 Overview

PerfectPay projesi için farklı ortam profillerinin (development, test, production) yapılandırılması ve yönetimi.

---

## 🎯 Environment Types

### 1. Development (Geliştirme)
- **Amaç:** Lokal geliştirme
- **Database:** `perfectpay_dev`
- **Port:** Backend 3000, Frontend 5173
- **Logging:** Debug level
- **PSP:** Mock/Test keys

### 2. Test (Test)
- **Amaç:** Otomatik testler ve QA
- **Database:** `perfectpay_test`
- **Port:** Backend 3001, Frontend 5174
- **Logging:** Warn level
- **PSP:** Mock/Sandbox

### 3. Production (Üretim)
- **Amaç:** Canlı ortam
- **Database:** `perfectpay_prod` (remote)
- **Port:** Backend 3000 (nginx reverse proxy)
- **Logging:** Error level only
- **PSP:** Live keys

---

## 📁 Profile Structure

```
proje/
├── backend/
│   ├── .env                      # Active environment (gitignored)
│   ├── .env.example             # Template
│   ├── .env.development         # Development config
│   ├── .env.test                # Test config
│   ├── .env.production          # Production config (gitignored)
│   └── scripts/
│       ├── switch-env.sh        # Environment switcher
│       └── setup-env.js         # Environment setup script
├── frontend/
│   ├── .env                      # Active environment (gitignored)
│   ├── .env.example             # Template
│   ├── .env.development         # Development config
│   ├── .env.test                # Test config
│   └── .env.production          # Production config (gitignored)
└── database/
    ├── seeds/
    │   ├── dev-seed.sql         # Development sample data
    │   ├── test-seed.sql        # Test data
    │   └── prod-seed.sql        # Production initial data
    └── migrations/
        └── ...
```

---

## ⚙️ Profile Configuration Files

### Backend - .env.development

```bash
# Development Environment
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=perfectpay_dev
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=dev-secret-only-for-local-use
JWT_EXPIRY=7d

# PSP (Test Keys)
STRIPE_SECRET_KEY=sk_test_51xxxxx
PAYPAL_MODE=sandbox

# Logging
LOG_LEVEL=debug

# CORS
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173

# Features
FRAUD_DETECTION_ENABLED=true
RATE_LIMIT_ENABLED=false
```

### Backend - .env.test

```bash
# Test Environment
NODE_ENV=test
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=perfectpay_test
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=test-secret-key
JWT_EXPIRY=1h

# PSP (Mock)
STRIPE_SECRET_KEY=sk_test_mock
PAYPAL_MODE=sandbox

# Logging
LOG_LEVEL=warn

# CORS
FRONTEND_URL=http://localhost:5174
ALLOWED_ORIGINS=http://localhost:5174

# Features
FRAUD_DETECTION_ENABLED=true
RATE_LIMIT_ENABLED=false
```

### Backend - .env.production

```bash
# Production Environment
NODE_ENV=production
PORT=3000

# Database (Use connection string for security)
DB_HOST=production-db.example.com
DB_PORT=5432
DB_NAME=perfectpay_prod
DB_USER=prod_user
DB_PASSWORD=STRONG_SECURE_PASSWORD_HERE

# Or use connection string:
# DATABASE_URL=postgresql://prod_user:password@host:5432/perfectpay_prod?sslmode=require

# JWT (MUST use strong secret)
JWT_SECRET=GENERATE_STRONG_SECRET_HERE_32_CHARS_MIN
JWT_EXPIRY=24h

# PSP (Live Keys - SECURE!)
STRIPE_SECRET_KEY=sk_live_xxxxx
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=LIVE_CLIENT_ID
PAYPAL_SECRET=LIVE_SECRET

# Logging
LOG_LEVEL=error

# CORS
FRONTEND_URL=https://perfectpay.com
ALLOWED_ORIGINS=https://perfectpay.com,https://www.perfectpay.com

# Features
FRAUD_DETECTION_ENABLED=true
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# SSL
DB_SSL=true
FORCE_HTTPS=true
```

---

### Frontend - .env.development

```bash
# Development
VITE_API_URL=http://localhost:3000/api
VITE_ENV=development
VITE_APP_NAME=PerfectPay Dev
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_ANALYTICS=false
```

### Frontend - .env.test

```bash
# Test
VITE_API_URL=http://localhost:3001/api
VITE_ENV=test
VITE_APP_NAME=PerfectPay Test
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_ANALYTICS=false
```

### Frontend - .env.production

```bash
# Production
VITE_API_URL=https://api.perfectpay.com/api
VITE_ENV=production
VITE_APP_NAME=PerfectPay
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=true
```

---

## 🔄 Switching Environments

### Manual Method

**Linux/Mac:**
```bash
# Backend
cd backend
cp .env.development .env
npm run dev

# Frontend
cd frontend
cp .env.development .env
npm run dev
```

**Windows:**
```powershell
# Backend
cd backend
Copy-Item .env.development .env
npm run dev

# Frontend
cd frontend
Copy-Item .env.development .env
npm run dev
```

---

### Automated Scripts

#### switch-env.sh (Linux/Mac)

Create: `scripts/switch-env.sh`

```bash
#!/bin/bash

# Usage: ./scripts/switch-env.sh development
# Usage: ./scripts/switch-env.sh test
# Usage: ./scripts/switch-env.sh production

ENV=$1

if [ -z "$ENV" ]; then
    echo "Usage: ./switch-env.sh [development|test|production]"
    exit 1
fi

echo "🔄 Switching to $ENV environment..."

# Backend
if [ -f "backend/.env.$ENV" ]; then
    cp "backend/.env.$ENV" "backend/.env"
    echo "✅ Backend switched to $ENV"
else
    echo "❌ backend/.env.$ENV not found"
fi

# Frontend
if [ -f "frontend/.env.$ENV" ]; then
    cp "frontend/.env.$ENV" "frontend/.env"
    echo "✅ Frontend switched to $ENV"
else
    echo "❌ frontend/.env.$ENV not found"
fi

echo "✨ Environment switch complete!"
echo "📝 Remember to restart your servers"
```

Make executable:
```bash
chmod +x scripts/switch-env.sh
```

Usage:
```bash
# Switch to development
./scripts/switch-env.sh development

# Switch to test
./scripts/switch-env.sh test

# Switch to production
./scripts/switch-env.sh production
```

---

#### switch-env.ps1 (Windows)

Create: `scripts/switch-env.ps1`

```powershell
# Usage: .\scripts\switch-env.ps1 development
# Usage: .\scripts\switch-env.ps1 test
# Usage: .\scripts\switch-env.ps1 production

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("development", "test", "production")]
    [string]$Environment
)

Write-Host "🔄 Switching to $Environment environment..." -ForegroundColor Cyan

# Backend
$backendEnv = "backend\.env.$Environment"
if (Test-Path $backendEnv) {
    Copy-Item $backendEnv "backend\.env" -Force
    Write-Host "✅ Backend switched to $Environment" -ForegroundColor Green
} else {
    Write-Host "❌ $backendEnv not found" -ForegroundColor Red
}

# Frontend
$frontendEnv = "frontend\.env.$Environment"
if (Test-Path $frontendEnv) {
    Copy-Item $frontendEnv "frontend\.env" -Force
    Write-Host "✅ Frontend switched to $Environment" -ForegroundColor Green
} else {
    Write-Host "❌ $frontendEnv not found" -ForegroundColor Red
}

Write-Host "✨ Environment switch complete!" -ForegroundColor Green
Write-Host "📝 Remember to restart your servers" -ForegroundColor Yellow
```

Usage:
```powershell
# Switch to development
.\scripts\switch-env.ps1 development

# Switch to test
.\scripts\switch-env.ps1 test

# Switch to production
.\scripts\switch-env.ps1 production
```

---

### Using npm scripts

Add to `package.json`:

**Backend:**
```json
{
  "scripts": {
    "dev": "NODE_ENV=development nodemon src/index.js",
    "dev:test": "NODE_ENV=test nodemon src/index.js",
    "start": "NODE_ENV=production node src/index.js",
    "env:dev": "cp .env.development .env",
    "env:test": "cp .env.test .env",
    "env:prod": "cp .env.production .env"
  }
}
```

**Frontend:**
```json
{
  "scripts": {
    "dev": "vite --mode development",
    "test": "vite --mode test",
    "build": "vite build --mode production",
    "env:dev": "cp .env.development .env",
    "env:test": "cp .env.test .env",
    "env:prod": "cp .env.production .env"
  }
}
```

Usage:
```bash
# Set environment
npm run env:dev
npm run dev

# Or combined
npm run env:test && npm run dev:test
```

---

## 🗄️ Database Setup per Environment

### Development Database

```bash
# Create database
createdb perfectpay_dev

# Run migrations
psql -U postgres -d perfectpay_dev -f database/complete-setup.sql

# Seed dev data
psql -U postgres -d perfectpay_dev -f database/seeds/dev-seed.sql
```

### Test Database

```bash
# Create database
createdb perfectpay_test

# Run migrations
psql -U postgres -d perfectpay_test -f database/complete-setup.sql

# Seed test data
psql -U postgres -d perfectpay_test -f database/seeds/test-seed.sql
```

### Production Database

```bash
# Usually managed by hosting provider
# Run migrations only (no seed data)
psql -U prod_user -h production-host -d perfectpay_prod -f database/complete-setup.sql
```

---

## 🧪 Testing Environment

### Automated Test Setup

Create: `backend/scripts/setup-test-env.js`

```javascript
const { exec } = require('child_process');
const fs = require('fs');

// Copy test environment
fs.copyFileSync('.env.test', '.env');

// Reset test database
exec('psql -U postgres -d perfectpay_test -f ../database/reset-and-seed.sql', 
  (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    console.log('✅ Test environment ready');
  }
);
```

Add to `package.json`:
```json
{
  "scripts": {
    "test:setup": "node scripts/setup-test-env.js",
    "test": "npm run test:setup && jest"
  }
}
```

---

## 🔒 Security Checklist

### Development
- [ ] Use weak secrets (OK for dev)
- [ ] Use test PSP keys
- [ ] Enable debug logging
- [ ] Disable rate limiting

### Test
- [ ] Use separate test database
- [ ] Use mock PSP providers
- [ ] Enable all fraud checks
- [ ] Test with sanitized data

### Production
- [ ] **STRONG** secrets (32+ chars)
- [ ] Live PSP keys in secrets manager
- [ ] Error-only logging
- [ ] Enable all security features
- [ ] SSL/TLS required
- [ ] Rate limiting enabled
- [ ] Backup strategy in place
- [ ] Monitoring enabled

---

## 📝 Best Practices

1. **Never commit .env files**
   ```bash
   # .gitignore
   .env
   .env.local
   .env.production
   .env.*.local
   ```

2. **Use different secrets per environment**
   - Dev: Simple secrets OK
   - Test: Different secrets
   - Prod: Strong, unique secrets

3. **Document environment variables**
   - Keep `.env.example` updated
   - Document in README
   - Use descriptive names

4. **Automate environment switching**
   - Use scripts
   - Add to CI/CD pipeline
   - Test automation

5. **Separate databases**
   - Dev: `perfectpay_dev`
   - Test: `perfectpay_test`
   - Prod: `perfectpay_prod`

---

## 🚀 Quick Reference

```bash
# Development
npm run env:dev && npm run dev

# Test
npm run env:test && npm test

# Production
npm run env:prod && npm start
```

---

**Son Güncelleme:** Aralık 2024  
**Versiyon:** 1.0.0

