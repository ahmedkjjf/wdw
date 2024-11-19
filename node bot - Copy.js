const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const fs = require('fs');
require('dotenv').config(); // تحميل المتغيرات من ملف .env

// إعداد البوت
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const TOKEN = process.env.DISCORD_TOKEN; // جلب التوكن من ملف .env
let streakData = {};

// تحميل بيانات الستريك من ملف JSON
if (fs.existsSync('./streaks.json')) {
    streakData = JSON.parse(fs.readFileSync('./streaks.json', 'utf-8'));
}

// حفظ البيانات إلى الملف
function saveStreakData() {
    fs.writeFileSync('./streaks.json', JSON.stringify(streakData, null, 4));
}

// عند تشغيل البوت
client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    startDailyReminder();
});

// التعامل مع الرسائل
client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // تجاهل رسائل البوتات

    const userId = message.author.id;
    const today = new Date().toISOString().split('T')[0]; // تاريخ اليوم بصيغة YYYY-MM-DD

    // التحقق من وجود صورة أو فيديو فقط
    const hasImage = message.attachments.some(attachment => attachment.contentType && attachment.contentType.startsWith('image/'));
    const hasVideo = message.attachments.some(attachment => attachment.contentType && attachment.contentType.startsWith('video/'));

    if (!hasImage && !hasVideo) {
        return; // تجاهل الرسائل التي لا تحتوي على صورة أو فيديو
    }

    if (!streakData[userId]) {
        // إذا كان المستخدم جديدًا
        streakData[userId] = {
            streak: 1,
            lastDate: today
        };
        saveStreakData();
        return message.channel.send(`🎉 بدأت ستريك جديد! طرش كل يوم عشان ما يروح: 1`);
    }

    const userStreak = streakData[userId];
    if (userStreak.lastDate === today) {
        // إذا كان المستخدم قد سجل اليوم
        return message.channel.send(`🔥 انته الحين ف ستريك! عدد الأيام الحالية: ${userStreak.streak}`);
    }

    const lastDate = new Date(userStreak.lastDate);
    const currentDate = new Date(today);
    const differenceInDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

    if (differenceInDays === 1) {
        // إذا كان المستخدم يستمر في الستريك
        userStreak.streak += 1;
        userStreak.lastDate = today;
        saveStreakData();
        return message.channel.send(`🔥 حافظت على الستريك! عدد الأيام الحالية: ${userStreak.streak}`);
    } else {
        // إذا تخلف المستخدم عن الستريك
        userStreak.streak = 1;
        userStreak.lastDate = today;
        saveStreakData();
        return message.channel.send(`😢 خسرت الستريك. بترجع بتسوي مره ثانيه ستريك: 1`);
    }
});

// وظيفة التذكير اليومي
function startDailyReminder() {
    // يتم تشغيل التذكيرات يوميًا
    setInterval(() => {
        const today = new Date().toISOString().split('T')[0];

        for (const userId in streakData) {
            const userStreak = streakData[userId];

            if (userStreak.lastDate !== today) {
                const user = client.users.cache.get(userId);
                if (user) {
                    user.send(`🔥 لديك ستريك حالي بعدد ${userStreak.streak} أيام! تأكد من إرسال صورة أو فيديو اليوم للحفاظ عليه.`)
                        .catch(err => console.log(`❌ لم أستطع إرسال رسالة إلى ${userId}. تأكد من السماح للرسائل الخاصة.`));
                }
            }
        }
    }, 24 * 60 * 60 * 1000); // 24 ساعة
}

// تشغيل البوت
client.login(TOKEN);
const http = require('http');
http.createServer((req, res) => {
  res.write("I'm alive");
  res.end();
}).listen(8080);
