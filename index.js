require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const cron = require('node-cron');
const moment = require('moment');
const path = require('path');
const fs = require('fs');

// Veritabanı kurulumu
const adapter = new FileSync(process.env.DB_FILE || './data/users.json');
const db = low(adapter);

// Veritabanı klasörünü oluştur
const dataDir = path.dirname(process.env.DB_FILE || './data/users.json');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Veritabanı varsayılan değerleri
db.defaults({ users: {} }).write();

// Bot kurulumu
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Motivasyon mesajları
const motivationMessages = [
    "🚭 Bugün hiç sigara içmedin! Sen harikasın!",
    "💪 Her gün daha güçlü oluyorsun. Devam et!",
    "🌟 Sigarasız bir gün daha! Akciğerlerin sana teşekkür ediyor.",
    "🎉 Bir gün daha başardın! Sen gerçekten inanılmazsın!",
    "🌱 Bugün sağlıklı bir karar verdin. Seni gururlandırıyoruz!",
    "💎 Her sigarasız gün, hayatına değer katıyor.",
    "🏆 Sen bir kahramansın! Sigarayı bırakmak kolay değil ama sen yapıyorsun!",
    "🌈 Sigarasız gelecek seni bekliyor. Devam et!",
    "💚 Akciğerlerin temizleniyor, kalbin mutlu!",
    "🎯 Hedefine odaklan! Her gün daha yakınsın."
];

// Kriz anı mesajları
const crisisMessages = [
    "🫁 Derin nefes al... 1... 2... 3... 4... 5... Şimdi yavaşça ver.",
    "💧 Bir bardak su iç. Sigara isteği genelde susuzluktan kaynaklanır.",
    "🚶‍♂️ 5 dakika yürüyüş yap. Hareket etmek isteği azaltır.",
    "🧘‍♀️ Meditasyon yap. 2 dakika gözlerini kapat ve nefesine odaklan.",
    "📞 Bir arkadaşını ara. Konuşmak isteği azaltır.",
    "🎵 Müzik aç ve dans et. Endorfin salgıla!",
    "🍎 Bir elma ye. Ağız aktivitesi sigara isteğini azaltır.",
    "✍️ Duygularını yaz. Neden sigara içmek istiyorsun?",
    "🛁 Ilık bir duş al. Rahatlatıcı etkisi var.",
    "🎯 Hatırla: Bu istek 3-5 dakika sonra geçecek. Dayan!"
];

// Görevler
const dailyTasks = [
    { id: 1, task: "Bugün 2 litre su iç", points: 10 },
    { id: 2, task: "10 dakika yürüyüş yap", points: 15 },
    { id: 3, task: "5 dakika derin nefes egzersizi yap", points: 10 },
    { id: 4, task: "Bir arkadaşınla konuş", points: 5 },
    { id: 5, task: "Günde 3 kez 2 dakika meditasyon yap", points: 20 },
    { id: 6, task: "Bir meyve ye", points: 5 },
    { id: 7, task: "30 dakika kitap oku", points: 15 },
    { id: 8, task: "Bir hobi aktivitesi yap", points: 10 },
    { id: 9, task: "Günde 3 kez 10 şınav yap", points: 20 },
    { id: 10, task: "Birine yardım et", points: 10 }
];

// Kullanıcı verilerini al
function getUserData(userId) {
    return db.get('users').get(userId.toString()).value() || null;
}

// Kullanıcı verilerini kaydet
function saveUserData(userId, data) {
    db.get('users').set(userId.toString(), data).write();
}

// Yeni kullanıcı oluştur
function createUser(userId, username) {
    const userData = {
        id: userId,
        username: username,
        quitDate: moment().format('YYYY-MM-DD'),
        lastActive: moment().format('YYYY-MM-DD HH:mm:ss'),
        totalCigarettesAvoided: 0,
        totalMoneySaved: 0,
        totalLifeGained: 0,
        currentStreak: 0,
        longestStreak: 0,
        completedTasks: [],
        triggers: [],
        crisisCount: 0,
        points: 0,
        level: 1
    };
    saveUserData(userId, userData);
    return userData;
}

// İstatistikleri hesapla
function calculateStats(userData) {
    const quitDate = moment(userData.quitDate);
    const today = moment();
    const daysSinceQuit = today.diff(quitDate, 'days');
    
    const cigarettesAvoided = daysSinceQuit * parseInt(process.env.DAILY_CIGARETTE_COUNT || 20);
    const moneySaved = cigarettesAvoided * parseFloat(process.env.CIGARETTE_PRICE || 25);
    const lifeGained = cigarettesAvoided * 11; // Her sigara 11 dakika ömürden çalar
    
    return {
        daysSinceQuit,
        cigarettesAvoided,
        moneySaved,
        lifeGained
    };
}

// Ana menü oluştur
function createMainMenu() {
    return {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '📊 İstatistiklerim', callback_data: 'menu_stats' },
                    { text: '🎯 Bugünün Görevi', callback_data: 'menu_task' }
                ],
                [
                    { text: '🚨 Kriz Anı', callback_data: 'menu_crisis' },
                    { text: '⚙️ Tetikleyiciler', callback_data: 'menu_triggers' }
                ],
                [
                    { text: '🏆 Başarılarım', callback_data: 'menu_achievements' },
                    { text: '📝 Günlük Yaz', callback_data: 'menu_diary' }
                ]
            ]
        }
    };
}

// Kriz anı menüsü
function createCrisisMenu() {
    return {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🫁 Nefes Egzersizi', callback_data: 'crisis_breathing' }],
                [{ text: '💧 Su İç', callback_data: 'crisis_water' }],
                [{ text: '🚶‍♂️ Yürüyüş Yap', callback_data: 'crisis_walk' }],
                [{ text: '🧘‍♀️ Meditasyon', callback_data: 'crisis_meditation' }],
                [{ text: '📞 Arkadaş Ara', callback_data: 'crisis_call' }],
                [{ text: '🎵 Müzik Dinle', callback_data: 'crisis_music' }]
            ]
        }
    };
}

// /start komutu
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || msg.from.first_name;
    
    let userData = getUserData(userId);
    
    if (!userData) {
        userData = createUser(userId, username);
        await bot.sendMessage(chatId, 
            `🎉 Hoş geldin ${username}! Sigara bırakma yolculuğuna başladın!\n\n` +
            `📅 Bugün sigara bırakma günün: ${moment().format('DD.MM.YYYY')}\n\n` +
            `🚭 Artık seninle birlikteyiz! Her gün daha güçlü olacaksın.`
        );
    } else {
        await bot.sendMessage(chatId, 
            `👋 Tekrar hoş geldin ${username}!\n\n` +
            `🚭 Sigara bırakma yolculuğuna devam ediyoruz!`
        );
    }
    
    await bot.sendMessage(chatId, 
        "🎯 Ne yapmak istiyorsun?",
        createMainMenu()
    );
});

// İstatistikler - Bu kısmı kaldırıyoruz çünkü artık callback kullanıyoruz
// bot.onText(/Istatistiklerim/, async (msg) => { ... });

// Kriz anı - Bu kısmı kaldırıyoruz çünkü artık callback kullanıyoruz  
// bot.onText(/Kriz Ani/, async (msg) => { ... });

// Bugünün görevi - Bu kısmı kaldırıyoruz çünkü artık callback kullanıyoruz
// bot.onText(/Bugunun Gorevi/, async (msg) => { ... });

// Tetikleyiciler - Bu kısmı kaldırıyoruz çünkü artık callback kullanıyoruz
// bot.onText(/Tetikleyiciler/, async (msg) => { ... });

// Başarılarım - Bu kısmı kaldırıyoruz çünkü artık callback kullanıyoruz
// bot.onText(/Basariarim/, async (msg) => { ... });

// Günlük yazma - Bu kısmı kaldırıyoruz çünkü artık callback kullanıyoruz
// bot.onText(/Gunluk Yaz/, async (msg) => { ... });

// Kriz anı callback'leri
bot.on('callback_query', async (query) => {
    console.log('🔔 Callback received:', query.data); // Debug log
    
    const chatId = query.message.chat.id;
    const data = query.data;
    
    try {
        // Menü callback'leri
        if (data === 'menu_stats') {
            console.log('📊 İstatistikler menüsü seçildi'); // Debug log
            const userId = query.from.id;
            const userData = getUserData(userId);
            
            if (!userData) {
                await bot.answerCallbackQuery(query.id, "❌ Önce /start komutunu kullanmalısın!");
                return;
            }
            
            const stats = calculateStats(userData);
            const randomMotivation = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];
            
            const message = 
                `📊 **İstatistiklerin**\n\n` +
                `📅 **${stats.daysSinceQuit}** gündür sigara içmiyorsun!\n\n` +
                `🚭 **${stats.cigarettesAvoided}** sigara içmedin\n` +
                `💰 **${stats.moneySaved.toFixed(2)}** TL tasarruf ettin\n` +
                `⏰ **${Math.floor(stats.lifeGained / 60)}** saat ömrüne ömür kattın\n\n` +
                `🏆 En uzun seri: **${userData.longestStreak}** gün\n` +
                `🎯 Toplam puan: **${userData.points}**\n` +
                `🚨 Kriz anı sayısı: **${userData.crisisCount}**\n\n` +
                `💪 ${randomMotivation}`;
            
            await bot.answerCallbackQuery(query.id);
            await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        }
        
        else if (data === 'menu_task') {
            console.log('🎯 Görev menüsü seçildi'); // Debug log
            const userId = query.from.id;
            const userData = getUserData(userId);
            
            if (!userData) {
                await bot.answerCallbackQuery(query.id, "❌ Önce /start komutunu kullanmalısın!");
                return;
            }
            
            const todayTask = dailyTasks[Math.floor(Math.random() * dailyTasks.length)];
            
            await bot.answerCallbackQuery(query.id);
            await bot.sendMessage(chatId, 
                `🎯 **Bugünün Görevi**\n\n` +
                `📋 **${todayTask.task}**\n\n` +
                `⭐ Bu görevi tamamlarsan **${todayTask.points}** puan kazanacaksın!\n\n` +
                `✅ Görevi tamamladığında "✅ Tamamladım" butonuna bas!`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '✅ Tamamladım', callback_data: `task_complete_${todayTask.id}` }],
                            [{ text: '🔄 Yeni Görev', callback_data: 'new_task' }]
                        ]
                    }
                }
            );
        }
        
        else if (data === 'menu_crisis') {
            console.log('🚨 Kriz menüsü seçildi'); // Debug log
            const userId = query.from.id;
            const userData = getUserData(userId);
            
            if (!userData) {
                await bot.answerCallbackQuery(query.id, "❌ Önce /start komutunu kullanmalısın!");
                return;
            }
            
            // Kriz sayısını artır
            userData.crisisCount++;
            saveUserData(userId, userData);
            
            const randomCrisis = crisisMessages[Math.floor(Math.random() * crisisMessages.length)];
            
            await bot.answerCallbackQuery(query.id);
            await bot.sendMessage(chatId, 
                `🚨 **Kriz Anı Desteği**\n\n` +
                `💪 Bu istek geçici! Sen güçlüsün!\n\n` +
                `${randomCrisis}\n\n` +
                `🎯 Aşağıdaki seçeneklerden birini dene:`,
                createCrisisMenu()
            );
        }
        
        else if (data === 'menu_triggers') {
            console.log('⚙️ Tetikleyiciler menüsü seçildi'); // Debug log
            const userId = query.from.id;
            const userData = getUserData(userId);
            
            if (!userData) {
                await bot.answerCallbackQuery(query.id, "❌ Önce /start komutunu kullanmalısın!");
                return;
            }
            
            await bot.answerCallbackQuery(query.id);
            await bot.sendMessage(chatId, 
                `⚙️ **Tetikleyiciler**\n\n` +
                `🔍 Seni en çok sigara içmeye ne teşvik ediyor?\n\n` +
                `📝 Örnek tetikleyiciler:\n` +
                `• Kahve içtikten sonra\n` +
                `• Dışarı çıkınca\n` +
                `• Stresli anlarda\n` +
                `• Yemek sonrası\n` +
                `• Araba kullanırken\n\n` +
                `💬 Tetikleyicilerini yaz, sana özel uyarılar göndereyim!`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '➕ Tetikleyici Ekle', callback_data: 'add_trigger' }],
                            [{ text: '📋 Mevcut Tetikleyiciler', callback_data: 'list_triggers' }]
                        ]
                    }
                }
            );
        }
        
        else if (data === 'menu_achievements') {
            console.log('🏆 Başarılar menüsü seçildi'); // Debug log
            const userId = query.from.id;
            const userData = getUserData(userId);
            
            if (!userData) {
                await bot.answerCallbackQuery(query.id, "❌ Önce /start komutunu kullanmalısın!");
                return;
            }
            
            const stats = calculateStats(userData);
            const achievements = [];
            
            // Başarı rozetleri
            if (stats.daysSinceQuit >= 1) achievements.push("🥇 İlk Gün - İlk adımı attın!");
            if (stats.daysSinceQuit >= 3) achievements.push("🥈 3 Gün - İlk hafta zor ama sen yapıyorsun!");
            if (stats.daysSinceQuit >= 7) achievements.push("🥉 1 Hafta - Harika! İlk haftayı tamamladın!");
            if (stats.daysSinceQuit >= 14) achievements.push("🏅 2 Hafta - Nikotin vücuttan çıkıyor!");
            if (stats.daysSinceQuit >= 30) achievements.push("🎖️ 1 Ay - Muhteşem! Artık bağımlılık azalıyor!");
            if (stats.daysSinceQuit >= 90) achievements.push("👑 3 Ay - Akciğerlerin iyileşiyor!");
            if (stats.daysSinceQuit >= 365) achievements.push("💎 1 Yıl - Sen bir kahramansın!");
            
            if (stats.moneySaved >= 100) achievements.push("💰 100 TL Tasarruf - Para birikiyor!");
            if (stats.moneySaved >= 500) achievements.push("💰 500 TL Tasarruf - Tatil parası!");
            if (stats.moneySaved >= 1000) achievements.push("💰 1000 TL Tasarruf - Büyük tasarruf!");
            
            if (userData.points >= 50) achievements.push("⭐ 50 Puan - Aktif kullanıcı!");
            if (userData.points >= 100) achievements.push("⭐ 100 Puan - Görev ustası!");
            if (userData.points >= 500) achievements.push("⭐ 500 Puan - Motivasyon ustası!");
            
            if (userData.crisisCount >= 5) achievements.push("🚨 5 Kriz - Kriz yönetimi uzmanı!");
            if (userData.crisisCount >= 10) achievements.push("🚨 10 Kriz - Dayanıklılık ustası!");
            
            const message = 
                `🏆 **Başarıların**\n\n` +
                `📊 **${stats.daysSinceQuit}** gündür sigara içmiyorsun!\n` +
                `💰 **${stats.moneySaved.toFixed(2)}** TL tasarruf ettin!\n` +
                `⏰ **${Math.floor(stats.lifeGained / 60)}** saat ömrüne ömür kattın!\n` +
                `🎯 Toplam puan: **${userData.points}**\n` +
                `🚨 Kriz anı sayısı: **${userData.crisisCount}**\n\n` +
                `🏅 **Kazanılan Rozetler:**\n` +
                `${achievements.length > 0 ? achievements.join('\n') : 'Henüz rozet kazanmadın. Devam et!'}\n\n` +
                `💪 Her gün yeni başarılar seni bekliyor!`;
            
            await bot.answerCallbackQuery(query.id);
            await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        }
        
        else if (data === 'menu_diary') {
            console.log('📝 Günlük menüsü seçildi'); // Debug log
            const userId = query.from.id;
            const userData = getUserData(userId);
            
            if (!userData) {
                await bot.answerCallbackQuery(query.id, "❌ Önce /start komutunu kullanmalısın!");
                return;
            }
            
            await bot.answerCallbackQuery(query.id);
            await bot.sendMessage(chatId, 
                `📝 **Günlük Yaz**\n\n` +
                `💭 Bugün nasıldı? Duygularını paylaş:\n\n` +
                `📝 Örnek konular:\n` +
                `• Bugün nasıl hissettin?\n` +
                `• Sigara isteği geldi mi?\n` +
                `• Neler yaptın?\n` +
                `• Hedeflerin neler?\n\n` +
                `✍️ Mesajını yaz, ben kaydedeyim!`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '📋 Geçmiş Günlükler', callback_data: 'view_diary' }],
                            [{ text: '❌ İptal', callback_data: 'cancel_diary' }]
                        ]
                    }
                }
            );
        }
        
        // Mevcut callback'ler devam ediyor...
        else if (data.startsWith('crisis_')) {
            const crisisType = data.replace('crisis_', '');
            let response = '';
            
            switch (crisisType) {
                case 'breathing':
                    response = "🫁 **Nefes Egzersizi**\n\n" +
                        "1. Rahat bir pozisyonda otur\n" +
                        "2. Burnundan 4 saniye nefes al\n" +
                        "3. 4 saniye tut\n" +
                        "4. Ağzından 6 saniye ver\n" +
                        "5. Bu döngüyü 5 kez tekrarla\n\n" +
                        "💪 Bu egzersiz seni rahatlatacak!";
                    break;
                case 'water':
                    response = "💧 **Su İç**\n\n" +
                        "🚰 Bir bardak su iç ve yavaşça yudumla.\n\n" +
                        "💡 Sigara isteği genelde susuzluktan kaynaklanır.\n" +
                        "🌊 Su içmek hem susuzluğu giderir hem de ağız aktivitesi sağlar.";
                    break;
                case 'walk':
                    response = "🚶‍♂️ **Yürüyüş Yap**\n\n" +
                        "🏃‍♂️ 5-10 dakika yürüyüş yap.\n\n" +
                        "💪 Hareket etmek endorfin salgılar ve sigara isteğini azaltır.\n" +
                        "🌳 Mümkünse açık havada yürü!";
                    break;
                case 'meditation':
                    response = "🧘‍♀️ **Meditasyon**\n\n" +
                        "1. Gözlerini kapat\n" +
                        "2. Nefesine odaklan\n" +
                        "3. 2-3 dakika bu şekilde kal\n" +
                        "4. Düşüncelerini gözlemle ama takılma\n\n" +
                        "🧠 Bu seni sakinleştirecek!";
                    break;
                case 'call':
                    response = "📞 **Arkadaş Ara**\n\n" +
                        "👥 Bir arkadaşını ara ve konuş.\n\n" +
                        "💬 Konuşmak hem dikkatini dağıtır hem de sosyal destek sağlar.\n" +
                        "🤗 Seni seven biriyle konuşmak her zaman iyidir!";
                    break;
                case 'music':
                    response = "🎵 **Müzik Dinle**\n\n" +
                        "🎶 Sevdiğin müziği aç ve dans et!\n\n" +
                        "💃 Dans etmek endorfin salgılar ve sigara isteğini azaltır.\n" +
                        "🎧 Kulaklıkla dinlemek daha etkili olabilir!";
                    break;
            }
            
            await bot.answerCallbackQuery(query.id);
            await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
        }
        
        // Görev tamamlama callback'i
        else if (data.startsWith('task_complete_')) {
            const taskId = parseInt(data.replace('task_complete_', ''));
            const userId = query.from.id;
            const userData = getUserData(userId);
            
            if (userData) {
                const task = dailyTasks.find(t => t.id === taskId);
                if (task) {
                    userData.points += task.points;
                    userData.completedTasks.push({
                        taskId: taskId,
                        completedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                        points: task.points
                    });
                    saveUserData(userId, userData);
                    
                    await bot.answerCallbackQuery(query.id, `🎉 +${task.points} puan kazandın!`);
                    await bot.sendMessage(chatId, 
                        `🎉 **Görev Tamamlandı!**\n\n` +
                        `✅ ${task.task}\n\n` +
                        `⭐ +${task.points} puan kazandın!\n` +
                        `🏆 Toplam puanın: ${userData.points}\n\n` +
                        `💪 Harika iş çıkardın! Devam et!`
                    );
                }
            }
        } 
        
        // Yeni görev callback'i
        else if (data === 'new_task') {
            const todayTask = dailyTasks[Math.floor(Math.random() * dailyTasks.length)];
            await bot.editMessageText(
                `🎯 **Yeni Görev**\n\n` +
                `📋 **${todayTask.task}**\n\n` +
                `⭐ Bu görevi tamamlarsan **${todayTask.points}** puan kazanacaksın!\n\n` +
                `✅ Görevi tamamladığında "✅ Tamamladım" butonuna bas!`,
                {
                    chat_id: chatId,
                    message_id: query.message.message_id,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '✅ Tamamladım', callback_data: `task_complete_${todayTask.id}` }],
                            [{ text: '🔄 Yeni Görev', callback_data: 'new_task' }]
                        ]
                    }
                }
            );
        }
        
        // Günlük callback'leri
        else if (data === 'view_diary') {
            const userId = query.from.id;
            const userData = getUserData(userId);
            
            if (userData && userData.diary && userData.diary.length > 0) {
                let diaryText = `📝 **Günlük Geçmişin**\n\n`;
                
                // Son 5 günlük kaydı göster
                const recentEntries = userData.diary.slice(-5);
                
                recentEntries.forEach((entry, index) => {
                    const date = moment(entry.date).format('DD.MM.YYYY HH:mm');
                    diaryText += `📅 **${date}**\n${entry.entry}\n\n`;
                });
                
                if (userData.diary.length > 5) {
                    diaryText += `... ve ${userData.diary.length - 5} kayıt daha`;
                }
                
                await bot.editMessageText(diaryText, {
                    chat_id: chatId,
                    message_id: query.message.message_id,
                    parse_mode: 'Markdown'
                });
            } else {
                await bot.editMessageText(
                    `📝 **Günlük Geçmişin**\n\n` +
                    `❌ Henüz günlük kaydın yok.\n\n` +
                    `✍️ İlk günlük kaydını yaz!`,
                    {
                        chat_id: chatId,
                        message_id: query.message.message_id
                    }
                );
            }
        } 
        
        else if (data === 'cancel_diary') {
            await bot.editMessageText(
                `❌ **İptal Edildi**\n\n` +
                `📝 Günlük yazma iptal edildi.\n\n` +
                `💭 İstediğin zaman tekrar deneyebilirsin!`,
                {
                    chat_id: chatId,
                    message_id: query.message.message_id
                }
            );
        }
        
        // Tetikleyici callback'leri
        else if (data === 'add_trigger') {
            const userId = query.from.id;
            const userData = getUserData(userId);
            
            if (userData) {
                // Tetikleyici ekleme modunu başlat
                userData.triggerMode = true;
                saveUserData(userId, userData);
                
                await bot.editMessageText(
                    `➕ **Tetikleyici Ekle**\n\n` +
                    `📝 Seni sigara içmeye teşvik eden durumu yaz:\n\n` +
                    `💡 Örnekler:\n` +
                    `• "Kahve içtikten sonra"\n` +
                    `• "Dışarı çıkınca"\n` +
                    `• "Stresli anlarda"\n` +
                    `• "Yemek sonrası"\n` +
                    `• "Araba kullanırken"\n\n` +
                    `✍️ Tetikleyicini yaz:`,
                    {
                        chat_id: chatId,
                        message_id: query.message.message_id
                    }
                );
            }
        } 
        
        else if (data === 'list_triggers') {
            const userId = query.from.id;
            const userData = getUserData(userId);
            
            if (userData && userData.triggers && userData.triggers.length > 0) {
                let triggerText = `📋 **Tetikleyicilerin**\n\n`;
                
                userData.triggers.forEach((trigger, index) => {
                    triggerText += `${index + 1}. ${trigger}\n`;
                });
                
                triggerText += `\n❌ Tetikleyici silmek için "Sil" butonuna bas!`;
                
                await bot.editMessageText(triggerText, {
                    chat_id: chatId,
                    message_id: query.message.message_id,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🗑️ Tetikleyici Sil', callback_data: 'delete_trigger' }],
                            [{ text: '➕ Yeni Tetikleyici', callback_data: 'add_trigger' }]
                        ]
                    }
                });
            } else {
                await bot.editMessageText(
                    `📋 **Tetikleyicilerin**\n\n` +
                    `❌ Henüz tetikleyici eklemedin.\n\n` +
                    `➕ İlk tetikleyicini ekle!`,
                    {
                        chat_id: chatId,
                        message_id: query.message.message_id,
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '➕ Tetikleyici Ekle', callback_data: 'add_trigger' }]
                            ]
                        }
                    }
                );
            }
        } 
        
        else if (data === 'delete_trigger') {
            const userId = query.from.id;
            const userData = getUserData(userId);
            
            if (userData && userData.triggers && userData.triggers.length > 0) {
                let triggerText = `🗑️ **Tetikleyici Sil**\n\n`;
                
                userData.triggers.forEach((trigger, index) => {
                    triggerText += `${index + 1}. ${trigger}\n`;
                });
                
                triggerText += `\n❌ Silmek istediğin tetikleyicinin numarasını yaz:`;
                
                // Silme modunu başlat
                userData.deleteTriggerMode = true;
                saveUserData(userId, userData);
                
                await bot.editMessageText(triggerText, {
                    chat_id: chatId,
                    message_id: query.message.message_id
                });
            }
        }
    } catch (error) {
        console.error('Error handling callback query:', error);
        await bot.answerCallbackQuery(query.id, 'Bir hata oluştu.');
    }
});

// Tetikleyici mesajlarını yakala
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;
    
    const userData = getUserData(userId);
    if (!userData) return;
    
    // Tetikleyici ekleme modu
    if (userData.triggerMode && text && !text.startsWith('/')) {
        if (!userData.triggers) userData.triggers = [];
        
        userData.triggers.push(text);
        userData.triggerMode = false;
        saveUserData(userId, userData);
        
        await bot.sendMessage(chatId, 
            `✅ **Tetikleyici Eklendi!**\n\n` +
            `📝 "${text}" tetikleyicisi eklendi.\n\n` +
            `🔔 Bu durumda sana özel uyarılar göndereceğim!\n` +
            `💪 Tetikleyicilerini tanımak başarı şansını artırır.`
        );
    }
    
    // Tetikleyici silme modu
    else if (userData.deleteTriggerMode && text && !text.startsWith('/')) {
        const index = parseInt(text) - 1;
        
        if (userData.triggers && userData.triggers[index]) {
            const deletedTrigger = userData.triggers[index];
            userData.triggers.splice(index, 1);
            userData.deleteTriggerMode = false;
            saveUserData(userId, userData);
            
            await bot.sendMessage(chatId, 
                `🗑️ **Tetikleyici Silindi!**\n\n` +
                `❌ "${deletedTrigger}" tetikleyicisi silindi.\n\n` +
                `✅ Artık bu durumda uyarı almayacaksın.`
            );
        } else {
            await bot.sendMessage(chatId, 
                `❌ **Hata!**\n\n` +
                `�� Geçerli bir numara yaz (1, 2, 3...)\n\n` +
                `🔢 Mevcut tetikleyici sayısı: ${userData.triggers ? userData.triggers.length : 0}`
            );
        }
    }
    
    // Normal günlük yazma (mevcut kod)
    else if (text && !text.startsWith('/') && !text.includes('📊') && !text.includes('🎯') && 
        !text.includes('🚨') && !text.includes('⚙️') && !text.includes('🏆') && !text.includes('📝')) {
        
        if (userData) {
            // Günlük kaydı ekle
            if (!userData.diary) userData.diary = [];
            
            userData.diary.push({
                date: moment().format('YYYY-MM-DD HH:mm:ss'),
                entry: text
            });
            
            saveUserData(userId, userData);
            
            await bot.sendMessage(chatId, 
                `📝 **Günlük Kaydedildi!**\n\n` +
                `✅ Mesajın kaydedildi.\n\n` +
                `💭 Duygularını paylaştığın için teşekkürler!\n` +
                `💪 Bu yolculukta her adım önemli.`
            );
        }
    }
});

// Günlük callback'leri
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    
    if (data === 'view_diary') {
        const userId = query.from.id;
        const userData = getUserData(userId);
        
        if (userData && userData.diary && userData.diary.length > 0) {
            let diaryText = `📝 **Günlük Geçmişin**\n\n`;
            
            // Son 5 günlük kaydı göster
            const recentEntries = userData.diary.slice(-5);
            
            recentEntries.forEach((entry, index) => {
                const date = moment(entry.date).format('DD.MM.YYYY HH:mm');
                diaryText += `📅 **${date}**\n${entry.entry}\n\n`;
            });
            
            if (userData.diary.length > 5) {
                diaryText += `... ve ${userData.diary.length - 5} kayıt daha`;
            }
            
            await bot.editMessageText(diaryText, {
                chat_id: chatId,
                message_id: query.message.message_id,
                parse_mode: 'Markdown'
            });
        } else {
            await bot.editMessageText(
                `📝 **Günlük Geçmişin**\n\n` +
                `❌ Henüz günlük kaydın yok.\n\n` +
                `✍️ İlk günlük kaydını yaz!`,
                {
                    chat_id: chatId,
                    message_id: query.message.message_id
                }
            );
        }
    } else if (data === 'cancel_diary') {
        await bot.editMessageText(
            `❌ **İptal Edildi**\n\n` +
            `📝 Günlük yazma iptal edildi.\n\n` +
            `💭 İstediğin zaman tekrar deneyebilirsin!`,
            {
                chat_id: chatId,
                message_id: query.message.message_id
            }
        );
    }
});

// Günlük hatırlatmalar
cron.schedule('0 8 * * *', async () => {
    // Sabah motivasyon mesajı
    const users = db.get('users').value();
    
    for (const [userId, userData] of Object.entries(users)) {
        const stats = calculateStats(userData);
        const randomMotivation = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];
        
        await bot.sendMessage(userId, 
            `🌅 **Günaydın!**\n\n` +
            `🚭 Bugün sigarasız bir gün daha!\n\n` +
            `${randomMotivation}\n\n` +
            `📊 **${stats.daysSinceQuit}** gündür sigara içmiyorsun!\n` +
            `💰 **${stats.moneySaved.toFixed(2)}** TL tasarruf ettin!\n\n` +
            `💪 Bugün de harika olacak!`
        );
    }
});

cron.schedule('0 20 * * *', async () => {
    // Akşam özet mesajı
    const users = db.get('users').value();
    
    for (const [userId, userData] of Object.entries(users)) {
        const stats = calculateStats(userData);
        
        await bot.sendMessage(userId, 
            `🌙 **Günün Özeti**\n\n` +
            `✅ Bugün hiç sigara içmedin!\n\n` +
            `🚭 **${stats.daysSinceQuit}** gündür sigara içmiyorsun!\n` +
            `💰 **${stats.moneySaved.toFixed(2)}** TL tasarruf ettin!\n` +
            `⏰ **${Math.floor(stats.lifeGained / 60)}** saat ömrüne ömür kattın!\n\n` +
            `🌙 İyi uykular! Yarın da birlikteyiz! 💪`
        );
    }
});

// Kriz anı hatırlatmaları
const crisisHours = (process.env.CRISIS_REMINDER_HOURS || '10,14,16,18').split(',').map(h => parseInt(h));

crisisHours.forEach(hour => {
    cron.schedule(`0 ${hour} * * *`, async () => {
        const users = db.get('users').value();
        
        for (const [userId, userData] of Object.entries(users)) {
            await bot.sendMessage(userId, 
                `⚠️ **Kriz Saati Uyarısı**\n\n` +
                `🕐 Bu saatlerde sigara isteği artabilir.\n\n` +
                `💪 Sen güçlüsün! Bu istek geçici.\n\n` +
                `🚨 Kriz anı desteği için "🚨 Kriz Anı" butonuna bas!`
            );
        }
    });
});

console.log('🚭 Quit Smoke Bot başlatıldı!'); 