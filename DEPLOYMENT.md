# 🚀 Deployment Rehberi

Bu rehber, Quit Smoke Bot'u farklı platformlarda nasıl deploy edeceğinizi açıklar.

## 📋 Ön Gereksinimler

1. **Telegram Bot Token**: [@BotFather](https://t.me/botfather) ile bot oluşturun
2. **Node.js**: v14 veya üzeri
3. **Git**: Repository'yi klonlamak için

## 🔧 Yerel Kurulum

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd quit-smoke-bot
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Çevre Değişkenlerini Ayarlayın
```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:
```env
BOT_TOKEN=your_telegram_bot_token_here
DB_FILE=./data/users.json
MORNING_REMINDER_HOUR=8
EVENING_REMINDER_HOUR=20
CRISIS_REMINDER_HOURS=10,14,16,18
CIGARETTE_PRICE=25
DAILY_CIGARETTE_COUNT=20
```

### 4. Botu Çalıştırın
```bash
# Geliştirme modu
npm run dev

# Prodüksiyon modu
npm start
```

## 🐳 Docker ile Deployment

### 1. Docker Image Oluşturun
```bash
docker build -t quit-smoke-bot .
```

### 2. Docker Compose ile Çalıştırın
```bash
# Environment variable'ı ayarlayın
export BOT_TOKEN=your_telegram_bot_token_here

# Docker Compose ile başlatın
docker-compose up -d
```

### 3. Logları Kontrol Edin
```bash
docker-compose logs -f
```

## ☁️ Cloud Platformları

### Vercel (Önerilen)

1. **Vercel CLI Kurulumu**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Environment Variables**
Vercel dashboard'da şu environment variables'ları ekleyin:
- `BOT_TOKEN`
- `DB_FILE`
- `MORNING_REMINDER_HOUR`
- `EVENING_REMINDER_HOUR`
- `CRISIS_REMINDER_HOURS`
- `CIGARETTE_PRICE`
- `DAILY_CIGARETTE_COUNT`

### Render

1. **Render.com'da Yeni Web Service Oluşturun**
2. **GitHub Repository'nizi Bağlayın**
3. **Build Settings:**
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Environment Variables Ekleyin**
5. **Deploy Edin**

### Railway

1. **Railway.app'te Yeni Proje Oluşturun**
2. **GitHub Repository'nizi Bağlayın**
3. **Environment Variables Ekleyin**
4. **Deploy Edin**

### Heroku

1. **Heroku CLI Kurulumu**
```bash
npm install -g heroku
```

2. **Heroku App Oluşturun**
```bash
heroku create your-app-name
```

3. **Environment Variables Ekleyin**
```bash
heroku config:set BOT_TOKEN=your_token
heroku config:set DB_FILE=./data/users.json
```

4. **Deploy Edin**
```bash
git push heroku main
```

## 🔍 Monitoring ve Logs

### Logları Kontrol Edin
```bash
# Docker
docker-compose logs -f

# Heroku
heroku logs --tail

# Vercel
vercel logs
```

### Health Check
Bot'un çalışıp çalışmadığını kontrol etmek için:
```bash
curl https://your-app-url.vercel.app/health
```

## 🔧 Troubleshooting

### Yaygın Sorunlar

1. **Bot Token Hatası**
   - BotFather'dan doğru token'ı aldığınızdan emin olun
   - Token'ın geçerli olduğunu kontrol edin

2. **Veritabanı Hatası**
   - `data` klasörünün yazma izni olduğundan emin olun
   - Disk alanını kontrol edin

3. **Zamanlanmış Görevler Çalışmıyor**
   - Timezone ayarlarını kontrol edin
   - Cron job'ların doğru çalıştığından emin olun

4. **Memory Kullanımı**
   - Node.js memory limit'ini artırın
   - Garbage collection ayarlarını optimize edin

### Performance Optimizasyonu

1. **Database Optimizasyonu**
   - Büyük veritabanları için SQLite yerine PostgreSQL kullanın
   - Regular backup'lar alın

2. **Memory Management**
   - Node.js heap size'ını artırın
   - Garbage collection'ı optimize edin

3. **Caching**
   - Redis cache ekleyin
   - Frequently accessed data'yı cache'leyin

## 🔒 Güvenlik

### Environment Variables
- Asla token'ları kod içinde hardcode etmeyin
- Production'da `.env` dosyasını git'e commit etmeyin

### Data Protection
- Kullanıcı verilerini şifreleyin
- GDPR uyumluluğunu sağlayın
- Regular backup'lar alın

### Rate Limiting
- API rate limiting ekleyin
- Spam koruması implement edin

## 📊 Monitoring

### Metrics to Track
- Active users
- Daily messages
- Crisis button usage
- Task completion rate
- User retention

### Alerts
- Bot downtime
- High error rates
- Database issues
- Memory usage

## 🔄 Backup ve Recovery

### Database Backup
```bash
# SQLite backup
cp data/users.json data/users.backup.json

# Automated backup script
#!/bin/bash
cp data/users.json "data/users.$(date +%Y%m%d_%H%M%S).json"
```

### Disaster Recovery
1. **Backup'ları düzenli olarak alın**
2. **Multiple environment'lar kullanın**
3. **Rollback planı hazırlayın**

## 📞 Support

Sorunlarınız için:
1. GitHub Issues açın
2. Documentation'ı kontrol edin
3. Community forum'ları kullanın

---

**🚭 Sigara bırakma yolculuğunda herkesin yanındayız! 💪** 