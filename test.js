// Test dosyası - Bot fonksiyonlarını test etmek için
const moment = require('moment');

// Test verileri
const testUserData = {
    id: 123456789,
    username: "test_user",
    quitDate: moment().subtract(5, 'days').format('YYYY-MM-DD'),
    lastActive: moment().format('YYYY-MM-DD HH:mm:ss'),
    totalCigarettesAvoided: 0,
    totalMoneySaved: 0,
    totalLifeGained: 0,
    currentStreak: 5,
    longestStreak: 5,
    completedTasks: [],
    triggers: ["Kahve sonrası", "Stresli anlarda"],
    crisisCount: 3,
    points: 75,
    level: 1
};

// İstatistik hesaplama testi
function testCalculateStats() {
    const quitDate = moment(testUserData.quitDate);
    const today = moment();
    const daysSinceQuit = today.diff(quitDate, 'days');
    
    const cigarettesAvoided = daysSinceQuit * 20; // Günlük 20 sigara
    const moneySaved = cigarettesAvoided * 25; // Sigara fiyatı 25 TL
    const lifeGained = cigarettesAvoided * 11; // Her sigara 11 dakika
    
    console.log('📊 Test İstatistikleri:');
    console.log(`📅 ${daysSinceQuit} gündür sigara içmiyor`);
    console.log(`🚭 ${cigarettesAvoided} sigara içmedi`);
    console.log(`💰 ${moneySaved.toFixed(2)} TL tasarruf etti`);
    console.log(`⏰ ${Math.floor(lifeGained / 60)} saat ömrüne ömür kattı`);
    console.log(`🎯 ${testUserData.points} puan`);
    console.log(`🚨 ${testUserData.crisisCount} kriz anı`);
}

// Başarı rozetleri testi
function testAchievements() {
    const stats = {
        daysSinceQuit: 5,
        moneySaved: 2500,
        points: 75,
        crisisCount: 3
    };
    
    const achievements = [];
    
    if (stats.daysSinceQuit >= 1) achievements.push("🥇 İlk Gün");
    if (stats.daysSinceQuit >= 3) achievements.push("🥈 3 Gün");
    if (stats.daysSinceQuit >= 7) achievements.push("🥉 1 Hafta");
    if (stats.daysSinceQuit >= 14) achievements.push("🏅 2 Hafta");
    if (stats.daysSinceQuit >= 30) achievements.push("🎖️ 1 Ay");
    if (stats.daysSinceQuit >= 90) achievements.push("👑 3 Ay");
    if (stats.daysSinceQuit >= 365) achievements.push("💎 1 Yıl");
    
    if (stats.moneySaved >= 100) achievements.push("💰 100 TL Tasarruf");
    if (stats.moneySaved >= 500) achievements.push("💰 500 TL Tasarruf");
    if (stats.moneySaved >= 1000) achievements.push("💰 1000 TL Tasarruf");
    
    if (stats.points >= 50) achievements.push("⭐ 50 Puan");
    if (stats.points >= 100) achievements.push("⭐ 100 Puan");
    if (stats.points >= 500) achievements.push("⭐ 500 Puan");
    
    if (stats.crisisCount >= 5) achievements.push("🚨 5 Kriz");
    if (stats.crisisCount >= 10) achievements.push("🚨 10 Kriz");
    
    console.log('\n🏆 Test Başarıları:');
    achievements.forEach(achievement => {
        console.log(`✅ ${achievement}`);
    });
}

// Görev testi
function testTasks() {
    const dailyTasks = [
        { id: 1, task: "Bugün 2 litre su iç", points: 10 },
        { id: 2, task: "10 dakika yürüyüş yap", points: 15 },
        { id: 3, task: "5 dakika derin nefes egzersizi yap", points: 10 },
        { id: 4, task: "Bir arkadaşınla konuş", points: 5 },
        { id: 5, task: "Günde 3 kez 2 dakika meditasyon yap", points: 20 }
    ];
    
    const randomTask = dailyTasks[Math.floor(Math.random() * dailyTasks.length)];
    
    console.log('\n🎯 Test Görevi:');
    console.log(`📋 ${randomTask.task}`);
    console.log(`⭐ ${randomTask.points} puan`);
}

// Motivasyon mesajları testi
function testMotivation() {
    const motivationMessages = [
        "🚭 Bugün hiç sigara içmedin! Sen harikasın!",
        "💪 Her gün daha güçlü oluyorsun. Devam et!",
        "🌟 Sigarasız bir gün daha! Akciğerlerin sana teşekkür ediyor.",
        "🎉 Bir gün daha başardın! Sen gerçekten inanılmazsın!",
        "🌱 Bugün sağlıklı bir karar verdin. Seni gururlandırıyoruz!"
    ];
    
    const randomMotivation = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];
    
    console.log('\n💪 Test Motivasyon Mesajı:');
    console.log(randomMotivation);
}

// Ana test fonksiyonu
function runTests() {
    console.log('🧪 Quit Smoke Bot Test Sonuçları\n');
    console.log('=' * 50);
    
    testCalculateStats();
    testAchievements();
    testTasks();
    testMotivation();
    
    console.log('\n' + '=' * 50);
    console.log('✅ Tüm testler tamamlandı!');
}

// Testleri çalıştır
runTests(); 