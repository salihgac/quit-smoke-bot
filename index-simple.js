const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

// Bot token'ı al
const token = process.env.BOT_TOKEN;
if (!token) {
    console.error('❌ BOT_TOKEN environment variable bulunamadı!');
    process.exit(1);
}

console.log('🔧 Bot token alındı:', token.substring(0, 10) + '...');

// Bot'u oluştur
const bot = new TelegramBot(token, { polling: false });

// Basit kullanıcı veritabanı (memory)
const users = {};

// Basit komutlar
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || msg.from.first_name;
    
    // Kullanıcıyı kaydet
    users[userId] = {
        id: userId,
        username: username,
        quitDate: new Date().toISOString().split('T')[0],
        lastActive: new Date().toISOString()
    };
    
    console.log('👤 Yeni kullanıcı kaydedildi:', username);
    
    await bot.sendMessage(chatId, 
        `🚭 **Hoş geldin ${username}!**\n\n` +
        `✅ Sigara bırakma yolculuğuna başladın!\n\n` +
        `📊 Bugün sigara bırakma günün: **${users[userId].quitDate}**\n\n` +
        `💪 Sen güçlüsün! Bu bot sana yardım edecek.`
    );
});

bot.onText(/\/test/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, '✅ Bot çalışıyor!');
});

// Webhook endpoint'i
app.post('/webhook', (req, res) => {
    console.log('📨 Webhook mesajı alındı');
    bot.handleUpdate(req.body);
    res.sendStatus(200);
});

// Health check
app.get('/', (req, res) => {
    res.json({ 
        status: 'Bot is running!',
        users: Object.keys(users).length,
        timestamp: new Date().toISOString()
    });
});

// Test endpoint'i
app.get('/test', (req, res) => {
    res.json({ 
        message: 'Bot test endpoint çalışıyor!',
        token: token ? 'Token var' : 'Token yok',
        users: Object.keys(users).length
    });
});

// Server'ı başlat
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚭 Basit Bot başlatıldı! Port: ${port}`);
    console.log(`🌐 Health check: http://localhost:${port}/`);
    console.log(`🧪 Test endpoint: http://localhost:${port}/test`);
});

// Webhook'u ayarla (Vercel URL'i varsa)
const vercelUrl = process.env.VERCEL_URL;
if (vercelUrl) {
    const webhookUrl = `https://${vercelUrl}/webhook`;
    console.log('🌐 Webhook URL ayarlanıyor:', webhookUrl);
    
    bot.setWebHook(webhookUrl)
        .then(() => {
            console.log('✅ Webhook başarıyla ayarlandı!');
        })
        .catch((error) => {
            console.error('❌ Webhook ayarlama hatası:', error.message);
        });
} else {
    console.log('⚠️ VERCEL_URL bulunamadı, webhook ayarlanmadı');
} 