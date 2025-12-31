# Proje Raporu

Bu rapor, PerfectPay projesinin teknik detaylarını, iş akışlarını ve güvenlik mekanizmalarını açıklamaktadır.

## 1. Backend Teknolojileri ve Kullanım Nedenleri

Projenin backend tarafında aşağıdaki teknolojiler kullanılmıştır:

- **Node.js:** Yüksek performanslı, olay tabanlı (event-driven) ve non-blocking I/O yapısı sayesinde ölçeklenebilir ağ uygulamaları geliştirmek için tercih edilmiştir.
    - **Nerede:** `backend/src/index.js` (Sunucu giriş noktası), `package.json` (Scriptler).
    - **Nasıl:** Uygulamanın çalışma zamanı ortamı (runtime) olarak kullanılır.
- **Express.js:** Node.js üzerinde çalışan, minimal ve esnek bir web uygulama çatısıdır. RESTful API endpoint'lerini hızlı ve düzenli bir şekilde oluşturmak, middleware yapılarını yönetmek (auth, logging vb.) için kullanılmıştır.
    - **Nerede:** `backend/src/index.js`, `backend/src/routes/*.js`.
    - **Nasıl:** `const app = express()` ile uygulama oluşturulur, `app.use()` ile middleware eklenir ve `router.get()` gibi metodlarla API rotaları tanımlanır.
- **PostgreSQL (pg):** Güvenilir, sağlam ve gelişmiş özelliklere sahip açık kaynaklı bir ilişkisel veritabanı yönetim sistemidir. Finansal verilerin (işlemler, kullanıcı bakiyeleri) tutarlılığı (ACID uyumluluğu) ve güvenliği için tercih edilmiştir.
    - **Nerede:** `backend/src/config/database.js`, `backend/src/models/*.js`.
    - **Nasıl:** `pg` kütüphanesinin `Pool` sınıfı ile bağlantı havuzu oluşturulur ve `pool.query()` ile SQL sorguları çalıştırılır.
- **bcryptjs:** Kullanıcı şifrelerinin veritabanında düz metin (plain text) olarak saklanmaması, güvenli bir şekilde hash'lenerek (tuzlama/salting ile) saklanması için kullanılmıştır.
    - **Nerede:** `backend/src/models/User.js`.
    - **Nasıl:** `bcrypt.hash()` ile şifreleme ve `bcrypt.compare()` ile şifre doğrulama işlemlerinde kullanılır.
- **jsonwebtoken (JWT):** Kullanıcı kimlik doğrulaması (authentication) ve yetkilendirmesi (authorization) için kullanılmıştır. Stateless (durumsuz) yapısı sayesinde sunucu yükünü azaltır ve güvenli oturum yönetimi sağlar.
    - **Nerede:** `backend/src/middleware/auth.js`.
    - **Nasıl:** `verifyToken()` fonksiyonu ile gelen isteklerdeki token doğrulanır ve kullanıcı kimliği elde edilir.
- **Stripe SDK:** Ödeme işlemlerini gerçekleştirmek için Stripe ödeme ağ geçidi ile entegrasyon sağlamak amacıyla kullanılmıştır.
    - **Nerede:** `backend/src/psp/StripePSP.js`.
    - **Nasıl:** Stripe API ile iletişim kurarak kart doğrulama ve ödeme alma işlemlerini yönetir.
- **Helmet:** HTTP başlıklarını (headers) güvenli bir şekilde ayarlayarak uygulamayı yaygın web zafiyetlerine karşı korumak için kullanılmıştır.
    - **Nerede:** `backend/src/index.js`.
    - **Nasıl:** `app.use(helmet())` şeklinde middleware olarak eklenir.
- **Cors:** Farklı kökenlerden (origin) gelen istekleri yönetmek ve frontend uygulamasının backend API'sine güvenli erişimini sağlamak için kullanılmıştır.
    - **Nerede:** `backend/src/index.js`.
    - **Nasıl:** `app.use(cors())` şeklinde middleware olarak eklenir.
- **Dotenv:** Hassas konfigürasyon bilgilerini (API anahtarları, veritabanı şifreleri vb.) koddan ayrı olarak çevre değişkenlerinde (.env dosyası) saklamak için kullanılmıştır.
    - **Nerede:** `backend/src/index.js`, `backend/src/config/database.js`.
    - **Nasıl:** `require("dotenv").config()` ile `.env` dosyasındaki değişkenleri `process.env` içine yükler.

## 2. Profil Akışında Gerekli Alanlar

Kullanıcı kayıt ve profil oluşturma sürecinde veritabanı şemasına (`users` tablosu) ve kayıt akışına göre aşağıdaki alanlar gereklidir:

- **Email (E-posta):** Kullanıcının benzersiz kimliği ve iletişim adresi. (Zorunlu, Unique)
- **Password (Şifre):** Hesaba giriş için gerekli güvenlik anahtarı. (Zorunlu, Hash'lenerek saklanır)
- **Full Name (Ad Soyad):** Kullanıcının yasal adı. (Zorunlu)
- **Phone (Telefon):** İletişim ve doğrulama için telefon numarası. (Opsiyonel/Zorunlu duruma göre değişebilir, şemada `VARCHAR(20)` olarak tanımlı)
- **KYC Status (KYC Durumu):** "Müşterini Tanı" (Know Your Customer) durumu. Varsayılan olarak 'approved' (onaylı) atanır, ancak 'pending' veya 'rejected' olabilir.

## 3. Integration Test (Entegrasyon Testi) Neyi Test Ediyor?

Projedeki entegrasyon testleri (`backend/test-*.js` dosyaları), sistemin farklı bileşenlerinin birbiriyle uyumlu çalışıp çalışmadığını doğrular. Temel olarak şunları test eder:

1.  **API Endpoint'leri:** `/api/auth/register`, `/api/auth/login`, `/api/transactions` gibi uç noktaların doğru yanıt verip vermediği.
2.  **Veritabanı İşlemleri:** Kullanıcı oluşturma, bakiye güncelleme, işlem kaydetme gibi veritabanı operasyonlarının doğruluğu.
3.  **Ödeme Entegrasyonu:** Stripe ve Mock PSP servislerinin simüle edilmiş senaryolarda (başarılı, başarısız, yetersiz bakiye) doğru çalışıp çalışmadığı.
4.  **Fraud Tespiti:** Şüpheli işlem senaryolarının (hızlı işlemler, yüksek tutar vb.) fraud motoru tarafından yakalanıp yakalanmadığı.

## 4. Fraud Kuralları ve Puanlama

`FraudDetectionEngine.js` içerisinde tanımlanan kurallar ve risk puanları şöyledir:

- **Rapid Transaction (Hızlı İşlem):** Kısa süre içinde çok sayıda işlem yapılması. (0-40 Puan)
- **Unusual Amount (Olağandışı Tutar):** Kullanıcının geçmiş ortalamasından çok yüksek tutarda işlem yapması. (0-25 Puan)
- **Geolocation Anomaly (Konum Anomalisi):** İşlemin farklı veya riskli bir ülkeden yapılması. (0-30 Puan)
- **Device Mismatch (Cihaz Uyuşmazlığı):** Farklı cihazlardan işlem yapılması. (0-20 Puan)
- **High-Risk Country Pair (Yüksek Riskli Ülke Çifti):** Gönderici ve alıcı ülkelerin riskli kombinasyonu. (0-15 Puan)
- **Card Velocity (Kart Hızı):** Aynı kartın çok sık kullanılması. (0-20 Puan)
- **Time-of-Day Anomaly (Zaman Anomalisi):** Kullanıcının alışık olmadığı saatlerde işlem yapması. (0-10 Puan)

**Risk Seviyeleri:**
- **LOW (Düşük):** < 30
- **MEDIUM (Orta):** 30 - 70
- **HIGH (Yüksek):** > 70 (İşlem reddedilir)

## 5. Blacklist (Kara Liste) Yapısı

Sistemde şüpheli veya yasaklı kullanıcıları engellemek için bir kara liste mekanizması bulunur.

- **Tablo:** `blacklist`
- **Alanlar:** `identifier` (Email veya IP), `reason` (Sebep), `created_at` (Tarih).
- **İşleyiş:**
    - Yönetici panelinden manuel olarak kullanıcı eklenebilir (`AdminController.addToBlacklist`).
    - Fraud motoru çok yüksek riskli bir işlem tespit ettiğinde otomatik olarak ekleyebilir.
    - Giriş (Login) ve Kayıt (Register) işlemleri sırasında `User.isBlacklisted` kontrolü yapılır; eğer kullanıcı kara listedeyse işlem engellenir.
