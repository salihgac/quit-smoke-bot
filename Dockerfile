FROM node:18-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm ci --only=production

# Uygulama dosyalarını kopyala
COPY . .

# Veri klasörünü oluştur
RUN mkdir -p data

# Port'u aç
EXPOSE 3000

# Uygulamayı başlat
CMD ["npm", "start"] 