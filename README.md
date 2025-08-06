# 🚭 Quit Smoke Bot

Sigara bırakmaya çalışan kullanıcılar için motivasyon, takip ve destek sağlayan Telegram botu.

## 🌟 Özellikler

### 📅 Günlük Hatırlatmalar
- **Sabah Motivasyonu**: Her sabah 08:00'de motivasyon mesajı
- **Akşam Özeti**: Her akşam 20:00'de günlük başarı özeti
- **Kriz Saati Uyarıları**: Belirli saatlerde (10:00, 14:00, 16:00, 18:00) kriz anı uyarıları

### 📊 İstatistik Takibi
- Kaç gündür sigara içmediği
- Kaç sigara içmediği
- Kaç TL tasarruf ettiği
- Kaç saat ömrüne ömür kattığı
- En uzun sigarasız seri
- Toplam puan sistemi

### 🚨 Kriz Anı Desteği
- Derin nefes alma egzersizi
- Su içme hatırlatması
- Yürüyüş önerisi
- Meditasyon rehberi
- Arkadaş arama önerisi
- Müzik dinleme önerisi

### 🎯 Görev Sistemi
- Günlük sağlıklı görevler
- Puan sistemi
- Motivasyon mesajları
- Görev tamamlama takibi

### ⚙️ Tetikleyici Takibi
- Kişisel tetikleyici tanıma
- Tetikleyici bazlı uyarılar
- Özelleştirilmiş destek mesajları

## 🚀 Kurulum

### 1. Gereksinimler
- Node.js (v14 veya üzeri)
- Telegram Bot Token (BotFather'dan alınacak)

### 2. Proje Kurulumu
```bash
# Projeyi klonlayın
git clone <repository-url>
cd quit-smoke-bot

# Bağımlılıkları yükleyin
npm install

# Çevre değişkenlerini ayarlayın
cp .env.example .env
```

### 3. Telegram Bot Oluşturma
1. Telegram'da [@BotFather](https://t.me/botfather) ile konuşun
2. `/newbot` komutunu kullanın
3. Bot adını ve kullanıcı adını belirleyin
4. Size verilen token'ı `.env` dosyasına ekleyin

### 4. Çevre Değişkenleri
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

### 5. Botu Çalıştırma
```bash
# Geliştirme modu
npm run dev

# Prodüksiyon modu
npm start
```

## 📱 Bot Komutları

### Ana Komutlar
- `/start` - Botu başlat ve kayıt ol
- `/istatistik` - İstatistiklerini görüntüle
- `/kriz` - Kriz anı desteği
- `/görev` - Bugünün görevini al
- `/tetikleyici` - Tetikleyici ayarları

### Menü Butonları
- **📊 İstatistiklerim** - Detaylı istatistikler
- **🎯 Bugünün Görevi** - Günlük sağlıklı görev
- **🚨 Kriz Anı** - Acil durum desteği
- **⚙️ Tetikleyiciler** - Kişisel tetikleyici ayarları
- **🏆 Başarılarım** - Başarı geçmişi
- **📝 Günlük Yaz** - Günlük kayıt

## 🏗️ Teknik Detaylar

### Kullanılan Teknolojiler
- **Node.js** - Runtime environment
- **node-telegram-bot-api** - Telegram Bot API wrapper
- **lowdb** - JSON tabanlı veritabanı
- **node-cron** - Zamanlanmış görevler
- **moment.js** - Tarih işlemleri

### Veritabanı Yapısı
```json
{
  "users": {
    "user_id": {
      "id": "user_id",
      "username": "username",
      "quitDate": "YYYY-MM-DD",
      "lastActive": "YYYY-MM-DD HH:mm:ss",
      "totalCigarettesAvoided": 0,
      "totalMoneySaved": 0,
      "totalLifeGained": 0,
      "currentStreak": 0,
      "longestStreak": 0,
      "completedTasks": [],
      "triggers": [],
      "crisisCount": 0,
      "points": 0,
      "level": 1
    }
  }
}
```

### Zamanlanmış Görevler
- **08:00** - Sabah motivasyon mesajı
- **20:00** - Akşam özet mesajı
- **10:00, 14:00, 16:00, 18:00** - Kriz saati uyarıları

## 🚀 Deployment

### Vercel (Önerilen)
```bash
# Vercel CLI kurulumu
npm i -g vercel

# Deploy
vercel
```

### Render
1. Render.com'da yeni Web Service oluşturun
2. GitHub repository'nizi bağlayın
3. Build Command: `npm install`
4. Start Command: `npm start`

### Railway
1. Railway.app'te yeni proje oluşturun
2. GitHub repository'nizi bağlayın
3. Environment variables ekleyin
4. Deploy edin

## 🔧 Geliştirme

### Yeni Özellik Ekleme
1. `index.js` dosyasında ilgili fonksiyonu ekleyin
2. Gerekirse veritabanı şemasını güncelleyin
3. Test edin ve deploy edin

### Özelleştirme
- Motivasyon mesajları: `motivationMessages` array'ini düzenleyin
- Kriz mesajları: `crisisMessages` array'ini düzenleyin
- Görevler: `dailyTasks` array'ini düzenleyin
- Hatırlatma saatleri: `.env` dosyasından ayarlayın

## 📊 İstatistik Hesaplamaları

### Para Tasarrufu
```
Günlük Tasarruf = Günlük Sigara Sayısı × Sigara Fiyatı
Toplam Tasarruf = Günlük Tasarruf × Sigarasız Gün Sayısı
```

### Ömür Kazancı
```
Günlük Kazanç = Günlük Sigara Sayısı × 11 dakika
Toplam Kazanç = Günlük Kazanç × Sigarasız Gün Sayısı
```

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🙏 Teşekkürler

- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)
- [lowdb](https://github.com/typicode/lowdb)
- [node-cron](https://github.com/node-cron/node-cron)
- [moment.js](https://momentjs.com/)

## 📞 İletişim

Sorularınız için issue açabilir veya pull request gönderebilirsiniz.

---

**🚭 Sigara bırakma yolculuğunda herkesin yanındayız! 💪** 