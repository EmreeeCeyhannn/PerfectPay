# PerfectPay Documentation

## 📚 Documentation Index

# Frontend'i durdur (Ctrl+C)
>> # Sonra:
>> echo "VITE_API_URL=http://localhost:3000/api" | Out-File -FilePath ".env" -Encoding utf8
>> npm run dev

backendde
npm run dev



### Setup & Configuration
1. **[Configuration Guide](CONFIGURATION_GUIDE.md)** - Tüm konfigürasyon ayarları
2. **[Environment Variables](../ENV_VARIABLES.md)** - Ortam değişkenleri referansı
3. **[Environment Profiles](ENVIRONMENT_PROFILES.md)** - Development/Test/Production profilleri

### Database
4. **[Database Schema](../database/DATABASE.md)** - Tablo yapıları ve açıklamalar
5. **[ER Diagram](../database/ER_DIAGRAM.md)** - Entity Relationship diyagramı

### Features
6. **[Fraud Detection](../FRAUD_TEST_GUIDE.md)** - Fraud detection sistemi
7. **[Manual PSP Selection](../MANUAL_PSP_SELECTION.md)** - PSP seçim sistemi
8. **[Transparency Map](../TRANSPARENCY_MAP_IMPLEMENTATION.md)** - Transaction map görselleştirme

### Compliance & Security
9. **[KYC/AML Guide](KYC_AML_GUIDE.md)** - Teknik KYC/AML dokümantasyonu
10. **[Admin Compliance Summary](ADMIN_COMPLIANCE_SUMMARY.md)** - Admin için KYC/AML özet kılavuzu

### Project
11. **[Project Document](../project_document.md)** - Ana proje dokümantasyonu

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# 1. Clone repository
git clone <repo-url>
cd proje

# 2. Setup Backend
cd backend
cp .env.example .env
# Edit .env file with your settings
npm install

# 3. Setup Frontend  
cd ../frontend
cp .env.example .env
# Edit .env file
npm install

# 4. Setup Database
cd ../database
psql -U postgres -h localhost -f create-db.sql
psql -U postgres -h localhost -d perfectpay_db -f complete-setup.sql

# 5. Run Backend (Terminal 1)
cd ../backend
npm run dev

# 6. Run Frontend (Terminal 2)
cd ../frontend
npm run dev
```

### Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- Health Check: http://localhost:3000/health

### Default Test Users
- Email: `test1@example.com` / Password: `password`
- Email: `test2@example.com` / Password: `password`
- Email: `test3@example.com` / Password: `password`

---

## 📁 Project Structure

```
proje/
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── fraud/          # Fraud detection engine
│   │   ├── psp/            # Payment provider plugins
│   │   └── routing/        # Optimal routing engine
│   └── package.json
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── context/       # React context
│   │   └── styles/        # CSS styles
│   └── package.json
├── database/              # Database schemas and seeds
│   ├── complete-setup.sql
│   ├── seed-data.sql
│   ├── DATABASE.md
│   └── ER_DIAGRAM.md
├── docs/                  # Documentation
│   ├── README.md
│   ├── CONFIGURATION_GUIDE.md
│   ├── ENVIRONMENT_PROFILES.md
│   └── ...
└── scripts/              # Utility scripts
    ├── switch-env.ps1    # Environment switcher (Windows)
    └── switch-env.sh     # Environment switcher (Linux/Mac)
```

---

## 🔧 Environment Management

### Switch Environments

**Windows (PowerShell):**
```powershell
.\scripts\switch-env.ps1 development
.\scripts\switch-env.ps1 test
.\scripts\switch-env.ps1 production
```

**Linux/Mac (Bash):**
```bash
chmod +x scripts/switch-env.sh
./scripts/switch-env.sh development
./scripts/switch-env.sh test
./scripts/switch-env.sh production
```

### Environment Files

```
backend/
├── .env                  # Active (gitignored)
├── .env.example         # Template
├── .env.development     # Dev settings
├── .env.test           # Test settings
└── .env.production     # Prod settings (gitignored)
```

See [Environment Profiles](ENVIRONMENT_PROFILES.md) for details.

---

## 🗄️ Database Management

### Create Database
```bash
psql -U postgres -h localhost -f database/create-db.sql
```

### Setup Schema & Seed Data
```bash
psql -U postgres -h localhost -d perfectpay_db -f database/complete-setup.sql
```

### Reset Database
```bash
psql -U postgres -h localhost -f database/reset-and-seed.sql
```

See [Database Schema](../database/DATABASE.md) for table structure.

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## 🔐 Security & Compliance

### KYC/AML Framework
PerfectPay implements a comprehensive compliance system:
- **KYC Verification**: Multi-tier user verification with document validation
- **AML Monitoring**: Real-time transaction pattern analysis
- **Blacklist Management**: Automated watchlist checking
- **Fraud Detection**: Rule-based risk scoring (0-100)
- **Admin Tools**: Review queues, reporting, and audit logs

See [KYC/AML Guide](KYC_AML_GUIDE.md) for technical details.  
See [Admin Compliance Summary](ADMIN_COMPLIANCE_SUMMARY.md) for admin quick reference.

### Production Checklist
- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable SSL/TLS
- [ ] Restrict CORS origins
- [ ] Enable rate limiting
- [ ] Use secrets manager for API keys
- [ ] Enable fraud detection
- [ ] Enable KYC verification
- [ ] Set up blacklist monitoring
- [ ] Set up database backups
- [ ] Configure monitoring

See [Configuration Guide](CONFIGURATION_GUIDE.md) for security best practices.

---

## 📖 API Documentation

Base URL: `http://localhost:3000/api`

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Payments
- `POST /api/payment/transfer` - Create P2P transfer
- `POST /api/card/payment` - Create card payment
- `GET /api/history` - Get transaction history

### Admin
- `GET /api/admin/transactions` - List all transactions
- `GET /api/admin/users` - List all users
- `GET /api/analytics/psp` - PSP analytics

See [Project Document](../project_document.md) for complete API reference.

---

## 🎯 Key Features

### 1. Optimal Routing Engine
Automatically selects the best PSP based on cost, speed, and reliability.

### 2. Fraud Detection
Real-time fraud scoring system with configurable rules.

### 3. Payment Plugin Store
Modular PSP integration system (Stripe, PayPal, Wise, Iyzico).

### 4. Transaction Transparency
Visual map showing transaction flow and routing.

### 5. Multi-PSP Support
Unified API for multiple payment providers.

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL status
# Windows
Get-Service postgresql*

# Linux/Mac
sudo systemctl status postgresql
```

### Port Already in Use
```bash
# Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### CORS Error
Check `FRONTEND_URL` in backend `.env`:
```bash
FRONTEND_URL=http://localhost:5173
```

See [Configuration Guide](CONFIGURATION_GUIDE.md#troubleshooting) for more.

---

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [Vite Documentation](https://vitejs.dev/)

---

## 📝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Update documentation
5. Submit pull request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Team

Team 11 - GAZI University

---

**Last Updated:** December 2024  
**Version:** 1.0.0

