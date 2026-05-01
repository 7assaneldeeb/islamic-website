// ===== QURAN =====
const surahNames = [
    'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة',
    'الأنعام', 'الأعراف', 'الأنفال', 'التوبة', 'يونس',
    'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر',
    'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه',
    'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان',
    'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم',
    'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر',
    'يس', 'الصافات', 'ص', 'الزمر', 'غافر',
    'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية',
    'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق',
    'الذاريات', 'الطور', 'النجم', 'القمر', 'الرحمن',
    'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة',
    'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق',
    'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج',
    'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة',
    'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس',
    'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج',
    'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد',
    'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين',
    'العلق', 'القدر', 'البينة', 'الزلزلة', 'العاديات',
    'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل',
    'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر',
    'المسد', 'الإخلاص', 'الفلق', 'الناس'
];

// ملء قائمة السور
function initSurahSelect() {
    const select = document.getElementById('surah-select');
    if (!select) return;
    select.innerHTML = '';
    surahNames.forEach((name, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = `${index + 1}. سورة ${name}`;
        select.appendChild(option);
    });
}

// تحميل السورة
async function loadSurah() {
    const select = document.getElementById('surah-select');
    const display = document.getElementById('quran-display');
    if (!select || !display) return;

    const surahNum = select.value;

    display.innerHTML = `
        <div style="text-align:center; padding:40px; color:#1a8c3e">
            <p style="font-size:1.5rem">⏳ جاري تحميل السورة...</p>
        </div>`;

    try {
        // API بديل أكثر استقراراً
        const res = await fetch(
            `https://api.alquran.cloud/v1/surah/${surahNum}/quran-uthmani`
        );

        if (!res.ok) throw new Error('فشل التحميل');

        const data = await res.json();
        const surah = data.data;

        let html = `
            <div style="
                background:linear-gradient(135deg,#1a8c3e,#156b30);
                color:white;
                padding:20px;
                border-radius:15px;
                text-align:center;
                margin-bottom:20px">
                <h3 style="font-size:1.8rem;margin-bottom:5px">
                    سورة ${surah.name}
                </h3>
                <p style="opacity:0.8">
                    ${surah.numberOfAyahs} آية | 
                    ${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                </p>
            </div>`;

        if (surahNum != 9) {
            html += `
                <p style="
                    text-align:center;
                    font-family:'Amiri',serif;
                    font-size:1.8rem;
                    margin-bottom:25px;
                    color:#1a8c3e;
                    padding:15px;
                    background:#f0fff4;
                    border-radius:10px">
                    بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                </p>`;
        }

        surah.ayahs.forEach(ayah => {
            html += `
                <div style="
                    padding:20px;
                    margin-bottom:15px;
                    border-radius:10px;
                    background:white;
                    box-shadow:0 2px 10px rgba(0,0,0,0.05);
                    border-right:4px solid #1a8c3e">
                    <span style="
                        display:inline-block;
                        background:#1a8c3e;
                        color:white;
                        width:35px;
                        height:35px;
                        border-radius:50%;
                        text-align:center;
                        line-height:35px;
                        margin-left:10px;
                        font-size:0.85rem;
                        float:left">
                        ${ayah.numberInSurah}
                    </span>
                    <p style="
                        font-family:'Amiri',serif;
                        font-size:1.6rem;
                        line-height:2.5;
                        color:#1a1a2e;
                        text-align:right">
                        ${ayah.text}
                    </p>
                </div>`;
        });

        display.innerHTML = html;

    } catch (error) {
        display.innerHTML = `
            <div style="text-align:center;padding:40px">
                <p style="color:red;font-size:1.2rem">
                    ❌ تعذر تحميل السورة
                </p>
                <p style="color:#666;margin-top:10px">
                    تأكد من اتصال الإنترنت وحاول مرة أخرى
                </p>
                <button onclick="loadSurah()" style="
                    margin-top:15px;
                    padding:10px 25px;
                    background:#1a8c3e;
                    color:white;
                    border:none;
                    border-radius:25px;
                    cursor:pointer;
                    font-size:1rem">
                    🔄 إعادة المحاولة
                </button>
            </div>`;
    }
}

// ===== PRAYER TIMES =====
async function getPrayerTimes() {
    const citySelect = document.getElementById('city-select');
    if (!citySelect) return;
    const city = citySelect.value;

    const cityCountry = {
        'Cairo': 'Egypt',
        'Mecca': 'Saudi Arabia',
        'Medina': 'Saudi Arabia',
        'Riyadh': 'Saudi Arabia',
        'Dubai': 'UAE',
        'Kuwait City': 'Kuwait',
        'Amman': 'Jordan',
        'Beirut': 'Lebanon',
        'Baghdad': 'Iraq',
        'Tunis': 'Tunisia',
        'Algiers': 'Algeria',
        'Casablanca': 'Morocco'
    };

    const country = cityCountry[city] || 'Egypt';

    try {
        const res = await fetch(
            `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=5`
        );
        const data = await res.json();
        const timings = data.data.timings;

        document.getElementById('fajr-time').textContent = timings.Fajr;
        document.getElementById('sunrise-time').textContent = timings.Sunrise;
        document.getElementById('dhuhr-time').textContent = timings.Dhuhr;
        document.getElementById('asr-time').textContent = timings.Asr;
        document.getElementById('maghrib-time').textContent = timings.Maghrib;
        document.getElementById('isha-time').textContent = timings.Isha;

        const hijri = data.data.date.hijri;
        const hijriEl = document.getElementById('hijri-date');
        if (hijriEl) {
            hijriEl.textContent =
                `${hijri.day} ${hijri.month.ar} ${hijri.year} هـ`;
        }

        startCountdown(timings);

    } catch (error) {
        console.error('خطأ في أوقات الصلاة:', error);
    }
}

function startCountdown(timings) {
    const prayers = [
        { name: 'الفجر', time: timings.Fajr },
        { name: 'الظهر', time: timings.Dhuhr },
        { name: 'العصر', time: timings.Asr },
        { name: 'المغرب', time: timings.Maghrib },
        { name: 'العشاء', time: timings.Isha }
    ];

    function update() {
        const now = new Date();
        const cur = now.getHours() * 60 + now.getMinutes();
        let next = null;

        for (let p of prayers) {
            const [h, m] = p.time.split(':').map(Number);
            if (cur < h * 60 + m) {
                next = { name: p.name, total: h * 60 + m };
                break;
            }
        }

        const el = document.getElementById('countdown');
        if (next && el) {
            const diff = next.total - cur;
            const hh = Math.floor(diff / 60);
            const mm = diff % 60;
            const ss = 59 - now.getSeconds();
            el.textContent =
                `${next.name} - ${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
        }
    }

    update();
    setInterval(update, 1000);
}

// ===== HADITH =====
const hadiths = [
    {
        text: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
        source: "صحيح البخاري"
    },
    {
        text: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
        source: "صحيح البخاري ومسلم"
    },
    {
        text: "لا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
        source: "صحيح البخاري ومسلم"
    },
    {
        text: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ",
        source: "صحيح البخاري"
    },
    {
        text: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
        source: "صحيح البخاري"
    },
    {
        text: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ",
        source: "صحيح مسلم"
    },
    {
        text: "الدِّينُ النَّصِيحَةُ",
        source: "صحيح مسلم"
    },
    {
        text: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا",
        source: "سنن الترمذي"
    }
];

function getNewHadith() {
    const i = Math.floor(Math.random() * hadiths.length);
    const h = hadiths[i];
    const textEl = document.getElementById('hadith-text');
    const srcEl = document.getElementById('hadith-source');
    if (!textEl || !srcEl) return;

    textEl.style.opacity = '0';
    setTimeout(() => {
        textEl.textContent = h.text;
        srcEl.textContent = `📖 ${h.source}`;
        textEl.style.opacity = '1';
        textEl.style.transition = 'opacity 0.5s';
    }, 300);
}

// ===== AZKAR =====
const azkarData = {
    morning: [
        { text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", repeat: 1 },
        { text: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ", repeat: 1 },
        { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", repeat: 100 },
        { text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", repeat: 10 },
        { text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ", repeat: 1, note: "سيد الاستغفار" }
    ],
    evening: [
        { text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", repeat: 1 },
        { text: "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ", repeat: 1 },
        { text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي اللَّهُمَّ عَافِنِي فِي سَمْعِي اللَّهُمَّ عَافِنِي فِي بَصَرِي", repeat: 3 },
        { text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ", repeat: 3 }
    ],
    sleep: [
        { text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", repeat: 1 },
        { text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ", repeat: 3 },
        { text: "سُبْحَانَ اللَّهِ", repeat: 33 },
        { text: "الْحَمْدُ لِلَّهِ", repeat: 33 },
        { text: "اللَّهُ أَكْبَرُ", repeat: 34 }
    ]
};

let azkarCounters = {};

function showAzkar(type) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    renderAzkar(type);
}

function renderAzkar(type) {
    const container = document.getElementById('azkar-container');
    if (!container) return;
    const list = azkarData[type];
    azkarCounters = {};
    list.forEach((z, i) => azkarCounters[i] = 0);

    container.innerHTML = list.map((z, i) => `
        <div class="zikr-card" id="zikr-${i}">
            <p class="zikr-text">${z.text}</p>
            ${z.note ? `<small style="color:#c9a227;display:block;margin-bottom:8px">${z.note}</small>` : ''}
            <div style="display:flex;justify-content:space-between;align-items:center;margin:10px 0">
                <span class="zikr-repeat">× ${z.repeat}</span>
                <span id="cnt-${i}" style="color:#c9a227;font-weight:700;font-size:1.2rem">
                    0 / ${z.repeat}
                </span>
            </div>
            <button class="zikr-counter-btn" onclick="countZikr(${i},${z.repeat})">
                ✋ اضغط للتسبيح
            </button>
        </div>
    `).join('');
}

function countZikr(i, max) {
    if (azkarCounters[i] < max) {
        azkarCounters[i]++;
        document.getElementById(`cnt-${i}`).textContent =
            `${azkarCounters[i]} / ${max}`;
        if (azkarCounters[i] >= max) {
            const card = document.getElementById(`zikr-${i}`);
            card.style.background = 'rgba(26,140,62,0.3)';
            card.style.borderColor = '#1a8c3e';
        }
    }
}

// ===== TASBIH =====
let tasbihCount = 0;

function countTasbih() {
    tasbihCount++;
    const el = document.getElementById('tasbih-count');
    if (!el) return;
    el.textContent = tasbihCount;
    el.style.transform = 'scale(1.3)';
    setTimeout(() => {
        el.style.transform = 'scale(1)';
        el.style.transition = 'transform 0.2s';
    }, 150);
}

function resetTasbih() {
    tasbihCount = 0;
    const el = document.getElementById('tasbih-count');
    if (el) el.textContent = '0';
}

function changeTasbih(text) {
    const el = document.getElementById('tasbih-text');
    if (el) el.textContent = text;
    resetTasbih();
}

// ===== FACTS =====
const facts = [
    "🌟 القرآن الكريم نزل على مدى 23 سنة وهو محفوظ بحفظ الله",
    "🕌 المسجد الحرام في مكة المكرمة هو أكبر مسجد في العالم",
    "📿 كلمة الله ذُكرت في القرآن الكريم 2699 مرة",
    "🌙 رمضان المبارك هو الشهر التاسع في التقويم الهجري",
    "⭐ عدد سور القرآن 114 سورة وعدد آياته 6236 آية",
    "🕋 الكعبة المشرفة هي أول بيت وُضع للناس على وجه الأرض",
    "📖 أطول سورة في القرآن هي البقرة بـ 286 آية",
    "🌟 أقصر سورة في القرآن هي الكوثر بـ 3 آيات",
    "✨ الصلاة فُرضت على المسلمين في ليلة المعراج",
    "🌿 شجرة الزيتون ذُكرت في القرآن 7 مرات"
];

let factIndex = 0;

function showFact() {
    const el = document.getElementById('facts-container');
    if (!el) return;
    el.style.opacity = '0';
    setTimeout(() => {
        el.textContent = facts[factIndex];
        el.style.opacity = '1';
        el.style.transition = 'opacity 0.5s';
        factIndex = (factIndex + 1) % facts.length;
    }, 400);
}

// ===== MENU =====
function toggleMenu() {
    const nav = document.querySelector('.nav-links');
    if (nav) nav.classList.toggle('active');
}

// ===== SCROLL =====
window.addEventListener('scroll', () => {
    const btn = document.getElementById('scroll-top');
    if (btn) btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const t = document.querySelector(a.getAttribute('href'));
        if (t) t.scrollIntoView({ behavior: 'smooth' });
    });
});

// ===== START =====
document.addEventListener('DOMContentLoaded', () => {
    initSurahSelect();
    loadSurah();
    getPrayerTimes();
    getNewHadith();
    renderAzkar('morning');
    showFact();
    setInterval(showFact, 10000);
});