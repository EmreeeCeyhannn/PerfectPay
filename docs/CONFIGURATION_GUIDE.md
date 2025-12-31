# PerfectPay - Configuration Guide

##  Overview

Bu doküman PerfectPay projesi için tüm konfigürasyon ayarlarını, ortam değişkenlerini ve yapılandırma profillerini açıklar.

---

##  Configuration Files

### Backend Configuration

```
backend/
├── .env                    # Ortam değişkenleri (git'e eklenmez)
├── .env.example           # Örnek konfigürasyon şablonu
├── src/
│   └── config/
│       ├── database.js    # PostgreSQL bağlantı ayarları
│       └── jwt.js         # JWT authentication ayarları
```

### Frontend Configuration

```
frontend/
├── .env                   # Ortam değişkenleri (git'e eklenmez)
├── .env.example          # Örnek konfigürasyon şablonu
├── vite.config.js        # Vite build ayarları
└── src/
    └── services/
        └── api.js         # API client konfigürasyonu
```

---

##  Environment Variables

### Backend (.env)

#### Database Configuration
```bash
# PostgreSQL Connection
DB_HOST=localhost              # Veritabanı host adresi
DB_PORT=5432                  # PostgreSQL port (varsayılan: 5432)
DB_NAME=perfectpay_db         # Veritabanı adı
DB_USER=postgres              # Veritabanı kullanıcı adı
DB_PASSWORD=postgres          # Veritabanı şifresi
```

#### Server Configuration
```bash
# Server Settings
PORT=3000                     # Backend server portu (varsayılan: 3000)
NODE_ENV=development          # Ortam: development, test, production
```

#### Authentication Configuration
```bash
# JWT Settings
JWT_SECRET=your-secret-key-here    # JWT imza için gizli anahtar (değiştir!)
JWT_EXPIRY=7d                      # Token geçerlilik süresi (7 gün)
```

#### Payment Provider API Keys (Optional)
```bash
# PSP API Keys
STRIPE_SECRET_KEY=sk_test_xxxxx    # Stripe secret key
PAYPAL_CLIENT_ID=xxxxx             # PayPal client ID
PAYPAL_SECRET=xxxxx                # PayPal secret
WISE_API_KEY=xxxxx                 # Wise API key
IYZICO_API_KEY=xxxxx               # Iyzico API key
IYZICO_SECRET_KEY=xxxxx            # Iyzico secret key
```

### Frontend (.env)

```bash
# API Configuration
VITE_API_URL=http://localhost:3000/api    # Backend API URL
VITE_APP_NAME=PerfectPay                  # Uygulama adı
VITE_ENV=development                       # Ortam
```

---

##  Configuration Profiles

### Development (Geliştirme)

**Dosya:** `.env.development`

```bash
# Backend Development
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=perfectpay_dev
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRY=7d
LOG_LEVEL=debug

# Frontend Development
VITE_API_URL=http://localhost:3000/api
VITE_ENV=development
```

**Özellikler:**
- Detaylı logging aktif
- Hot reload etkin
- Hata mesajları detaylı
- CORS tüm origin'lere açık

### Test (Test Ortamı)

**Dosya:** `.env.test`

```bash
# Backend Test
PORT=3001
NODE_ENV=test
DB_HOST=localhost
DB_PORT=5432
DB_NAME=perfectpay_test
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=test-secret-key
JWT_EXPIRY=1h
LOG_LEVEL=warn

# Frontend Test
VITE_API_URL=http://localhost:3001/api
VITE_ENV=test
```

**Özellikler:**
- Ayrı test veritabanı
- Kısa token süresi
- Minimal logging
- Mock PSP'ler aktif

### Production (Üretim)

**Dosya:** `.env.production`

```bash
# Backend Production
PORT=3000
NODE_ENV=production
DB_HOST=production-db-host.com
DB_PORT=5432
DB_NAME=perfectpay_prod
DB_USER=prod_user
DB_PASSWORD=STRONG_PASSWORD_HERE
JWT_SECRET=STRONG_RANDOM_SECRET_HERE
JWT_EXPIRY=24h
LOG_LEVEL=error

# Frontend Production
VITE_API_URL=https://api.perfectpay.com/api
VITE_ENV=production
```

**Özellikler:**
- SSL/TLS zorunlu
- Güçlü şifreler
- Sadece error logging
- CORS kısıtlı
- Rate limiting aktif

---

## 📦 Database Configuration

### Connection Pool Settings

**Dosya:** `backend/src/config/database.js`

```javascript
const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "perfectpay_db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    
    // Pool Settings
    max: 20,                    // Maksimum bağlantı sayısı
    min: 5,                     // Minimum bağlantı sayısı
    idleTimeoutMillis: 30000,   // Boşta bekleme süresi
    connectionTimeoutMillis: 2000, // Bağlantı timeout
});
```

### Connection String Alternative

```javascript
// URI formatı (alternatif)
const connectionString = 
    `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const pool = new Pool({
    connectionString: connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

---

## 🔑 JWT Configuration

**Dosya:** `backend/src/config/jwt.js`

```javascript
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";

// Token generation
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { 
        expiresIn: JWT_EXPIRY,
        issuer: 'perfectpay-api',
        audience: 'perfectpay-client'
    });
};
```

### Security Best Practices

1. **Secret Key:** En az 32 karakter, rastgele
   ```bash
   # Generate strong secret
   openssl rand -base64 32
   ```

2. **Token Expiry:** 
   - Development: 7d (7 gün)
   - Production: 24h (24 saat)
   - Refresh token: 30d (30 gün)

3. **Algorithm:** HS256 (HMAC + SHA-256)

---

## 🌐 API Client Configuration

**Dosya:** `frontend/src/services/api.js`

```javascript
import axios from "axios";

const API_BASE_URL = 
    import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,                    // 10 saniye timeout
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor - Token ekleme
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor - Hata yönetimi
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired - redirect to login
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default apiClient;
```

---

## 🚀 Quick Start

### İlk Kurulum

1. **Environment dosyalarını oluştur:**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # .env dosyasını düzenle
   
   # Frontend
   cd ../frontend
   cp .env.example .env
   # .env dosyasını düzenle
   ```

2. **Veritabanını kur:**
   ```bash
   cd database
   psql -U postgres -h localhost -f create-db.sql
   psql -U postgres -h localhost -d perfectpay_db -f complete-setup.sql
   ```

3. **Dependencies yükle:**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

4. **Servisleri başlat:**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run dev
   
   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

---

## 🔧 Troubleshooting

### Database Connection Error

**Problem:** `ECONNREFUSED` veya `Connection refused`

**Çözüm:**
1. PostgreSQL servisinin çalıştığını kontrol et
2. `.env` dosyasındaki `DB_HOST`, `DB_PORT` değerlerini kontrol et
3. Kullanıcı adı ve şifrenin doğru olduğundan emin ol

```bash
# PostgreSQL durumunu kontrol et
# Windows
Get-Service postgresql*

# Linux/Mac
sudo systemctl status postgresql
```

### JWT Token Error

**Problem:** `Invalid token` veya `Token expired`

**Çözüm:**
1. `JWT_SECRET` değerinin backend ve frontend'de aynı olduğundan emin ol
2. Token'ı localStorage'dan sil ve yeniden login ol
3. `.env` dosyasında `JWT_SECRET` değişkenini kontrol et

### CORS Error

**Problem:** `Access-Control-Allow-Origin` hatası

**Çözüm:**
Backend `index.js` dosyasında CORS ayarlarını kontrol et:

```javascript
const cors = require("cors");

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));
```

---

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Best Practices](https://jwt.io/introduction)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Axios Configuration](https://axios-http.com/docs/config_defaults)

---

## 📝 Checklist

Deployment öncesi kontrol listesi:

- [ ] `.env` dosyalarında production değerleri güncellendi
- [ ] `JWT_SECRET` güçlü ve benzersiz
- [ ] Database şifreleri güçlü
- [ ] API keys gerçek PSP'lerden alındı
- [ ] CORS production domain'e kısıtlandı
- [ ] SSL/TLS aktif
- [ ] Environment variables güvenli şekilde saklanıyor (secrets manager)
- [ ] Log level production için ayarlandı
- [ ] Database backup ayarlandı

---

**Son Güncelleme:** Aralık 2024  
**Versiyon:** 1.0.0  
**Proje:** PerfectPay Payment Orchestration Platform

