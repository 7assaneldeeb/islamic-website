// ===== QURAN DATA =====
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

// ===== INIT SURAH SELECT =====
function initSurahSelect() {
    const select = document.getElementById('surah-select');
    if (!select) return;
    select.innerHTML = '';
    surahNames.forEach((name, i) => {
        const opt = document.createElement('option');
        opt.value = i + 1;
        opt.textContent = `${i + 1}. سورة ${name}`;
        select.appendChild(opt);
    });
}

// ===== LOAD QURAN =====
async function loadSurah() {
    const select = document.getElementById('surah-select');
    const display = document.getElementById('quran-display');
    if (!select || !display) return;

    const num = select.value;
    display.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>جاري تحميل السورة...</p>
        </div>`;

    // جرب APIs متعددة
    const apis = [
        `https://api.alquran.cloud/v1/surah/${num}/quran-uthmani`,
        `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${num}`,
        `https://cdn.jsdelivr.net/gh/islamic-network/cdn@1.0.0/info/all_quran_simple.json`
    ];

    try {
        const res = await fetch(apis[0]);
        if (!res.ok) throw new Error('API 1 failed');
        const data = await res.json();
        renderSurah(data.data, num);
    } catch (e1) {
        try {
            const res2 = await fetch(apis[1]);
            if (!res2.ok) throw new Error('API 2 failed');
            const data2 = await res2.json();
            renderSurahV2(data2, num);
        } catch (e2) {
            display.innerHTML = `
                <div style="text-align:center;padding:40px">
                    <p style="font-size:3rem">📡</p>
                    <p style="color:#e74c3c;font-size:1.1rem;margin-bottom:10px">
                        تعذر تحميل السورة
                    </p>
                    <p style="color:#666;margin-bottom:20px">
                        تأكد من اتصال الإنترنت
                    </p>
                    <button onclick="loadSurah()" style="
                        padding:10px 25px;
                        background:#1a8c3e;
                        color:white;
                        border:none;
                        border-radius:25px;
                        cursor:pointer;
                        font-family:Cairo,sans-serif;
                        font-size:1rem">
                        🔄 إعادة المحاولة
                    </button>
                </div>`;
        }
    }
}

function renderSurah(surah, num) {
    const display = document.getElementById('quran-display');
    let html = `
        <div class="surah-header">
            <h3>سورة ${surah.name}</h3>
            <p>${surah.numberOfAyahs} آية | 
            ${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</p>
        </div>`;

    if (num != 9) {
        html += `<div class="basmala">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>`;
    }

    surah.ayahs.forEach(ayah => {
        html += `
            <div class="ayah">
                <span class="ayah-number">${ayah.numberInSurah}</span>
                <p class="ayah-text">${ayah.text}</p>
            </div>`;
    });

    display.innerHTML = html;

    // تشغيل الصوت
    const reciter = document.getElementById('reciter-select')?.value || 'ar.alafasy';
    const reciterName = reciter.split('.')[1];
    const audio = document.getElementById('quran-audio');
    const player = document.getElementById('audio-player');
    if (audio && player) {
        audio.src = `https://cdn.islamic.network/quran/audio-surah/128/${reciterName}/${num}.mp3`;
        player.style.display = 'block';
    }
}

function renderSurahV2(data, num) {
    const display = document.getElementById('quran-display');
    let html = `
        <div class="surah-header">
            <h3>سورة ${surahNames[num-1]}</h3>
        </div>`;

    if (num != 9) {
        html += `<div class="basmala">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>`;
    }

    data.verses.forEach(v => {
        html += `
            <div class="ayah">
                <span class="ayah-number">${v.verse_number}</span>
                <p class="ayah-text">${v.text_uthmani}</p>
            </div>`;
    });

    display.innerHTML = html;
}

// ===== PRAYER TIMES =====
async function getPrayerTimes() {
    const city = document.getElementById('city-select')?.value || 'Cairo';
    const cityCountry = {
        'Cairo': 'Egypt', 'Mecca': 'Saudi Arabia',
        'Medina': 'Saudi Arabia', 'Riyadh': 'Saudi Arabia',
        'Dubai': 'UAE', 'Kuwait City': 'Kuwait',
        'Amman': 'Jordan', 'Beirut': 'Lebanon',
        'Baghdad': 'Iraq', 'Tunis': 'Tunisia',
        'Algiers': 'Algeria', 'Casablanca': 'Morocco'
    };
    const country = cityCountry[city] || 'Egypt';

    try {
        const res = await fetch(
            `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=5`
        );
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        const t = data.data.timings;

        // تحديث الأوقات
        const times = {
            'fajr': t.Fajr, 'sunrise': t.Sunrise,
            'dhuhr': t.Dhuhr, 'asr': t.Asr,
            'maghrib': t.Maghrib, 'isha': t.Isha
        };

        Object.entries(times).forEach(([key, val]) => {
            const el = document.getElementById(`${key}-time`);
            if (el) el.textContent = val;
        });

        // التاريخ الهجري
        const hijri = data.data.date.hijri;
        const hijriEl = document.getElementById('hijri-date');
        if (hijriEl) {
            hijriEl.textContent = `${hijri.day} ${hijri.month.ar} ${hijri.year} هـ`;
        }

        // تمييز أقرب صلاة
        highlightNextPrayer(t);
        startCountdown(t);

    } catch (err) {
        // عرض أوقات افتراضية لو فشل الـ API
        const defaults = {
            'fajr-time': '04:30', 'sunrise-time': '06:00',
            'dhuhr-time': '12:00', 'asr-time': '15:30',
            'maghrib-time': '18:00', 'isha-time': '19:30'
        };
        Object.entries(defaults).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        });
        console.log('استخدام أوقات افتراضية');
    }
}

function highlightNextPrayer(timings) {
    const prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const prayerTimes = [
        timings.Fajr, timings.Sunrise, timings.Dhuhr,
        timings.Asr, timings.Maghrib, timings.Isha
    ];

    prayers.forEach(p => {
        const card = document.getElementById(`card-${p}`);
        if (card) card.classList.remove('active');
    });

    const now = new Date();
    const cur = now.getHours() * 60 + now.getMinutes();

    for (let i = 0; i < prayerTimes.length; i++) {
        const [h, m] = prayerTimes[i].split(':').map(Number);
        if (cur < h * 60 + m) {
            const card = document.getElementById(`card-${prayers[i]}`);
            if (card) card.classList.add('active');
            break;
        }
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
            const hh = String(Math.floor(diff / 60)).padStart(2, '0');
            const mm = String(diff % 60).padStart(2, '0');
            const ss = String(59 - now.getSeconds()).padStart(2, '0');
            el.textContent = `${next.name} - ${hh}:${mm}:${ss}`;
        }
    }

    update();
    setInterval(update, 1000);
}

// ===== HADITH =====
const hadiths = [
    { text: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى", source: "صحيح البخاري" },
    { text: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ", source: "صحيح البخاري ومسلم" },
    { text: "لا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", source: "صحيح البخاري ومسلم" },
    { text: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ", source: "صحيح البخاري" },
    { text: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", source: "صحيح البخاري" },
    { text: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ", source: "صحيح مسلم" },
    { text: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا", source: "سنن الترمذي" },
    { text: "الدِّينُ النَّصِيحَةُ", source: "صحيح مسلم" },
    { text: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", source: "صحيح البخاري ومسلم" },
    { text: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ", source: "صحيح البخاري" }
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
        { text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", repeat: 1 },
        { text: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ", repeat: 1 },
        { text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ", repeat: 1, note: "سيد الاستغفار" },
        { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", repeat: 100 },
        { text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", repeat: 10 }
    ],
    evening: [
        { text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", repeat: 1 },
        { text: "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ", repeat: 1 },
        { text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي", repeat: 3 },
        { text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ", repeat: 3 },
        { text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", repeat: 3 }
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

function showAzkar(type, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
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
            ${z.note ? `<span class="zikr-note">✨ ${z.note}</span>` : ''}
            <div class="zikr-footer">
                <span class="zikr-repeat">× ${z.repeat}</span>
                <span class="zikr-counter" id="cnt-${i}">0 / ${z.repeat}</span>
            </div>
            <button class="zikr-btn" id="btn-${i}" onclick="countZikr(${i}, ${z.repeat})">
                ✋ اضغط للتسبيح
            </button>
        </div>
    `).join('');
}

function countZikr(i, max) {
    if (azkarCounters[i] >= max) return;
    azkarCounters[i]++;
    document.getElementById(`cnt-${i}`).textContent = `${azkarCounters[i]} / ${max}`;

    if (azkarCounters[i] >= max) {
        const card = document.getElementById(`zikr-${i}`);
        const btn = document.getElementById(`btn-${i}`);
        if (card) {
            card.style.background = 'rgba(26,140,62,0.2)';
            card.style.borderColor = '#1a8c3e';
        }
        if (btn) {
            btn.textContent = '✅ تم!';
            btn.classList.add('done');
        }
    }
}

// ===== TASBIH =====
let tasbihCount = 0;
let tasbihMax = 33;

function countTasbih() {
    tasbihCount++;
    const el = document.getElementById('tasbih-count');
    const bar = document.getElementById('progress-bar');

    if (el) {
        el.textContent = tasbihCount;
        el.style.transform = 'scale(1.2)';
        setTimeout(() => {
            el.style.transform = 'scale(1)';
            el.style.transition = 'transform 0.15s';
        }, 150);
    }

    if (bar) {
        const pct = Math.min((tasbihCount / tasbihMax) * 100, 100);
        bar.style.width = pct + '%';
    }

    if (tasbihCount === tasbihMax) {
        setTimeout(() => {
            alert(`🎉 ماشاء الله! أكملت ${tasbihMax} تسبيحة`);
        }, 200);
    }
}

function resetTasbih() {
    tasbihCount = 0;
    const el = document.getElementById('tasbih-count');
    const bar = document.getElementById('progress-bar');
    if (el) el.textContent = '0';
    if (bar) bar.style.width = '0%';
}

function changeTasbih(text, max) {
    tasbihMax = max;
    const textEl = document.getElementById('tasbih-text');
    const targetEl = document.getElementById('tasbih-target');
    if (textEl) textEl.textContent = text;
    if (targetEl) targetEl.textContent = max;
    resetTasbih();
}

// ===== FACTS =====
const facts = [
    "🌟 القرآن الكريم نزل على مدى 23 سنة وهو محفوظ بحفظ الله إلى يوم القيامة",
    "🕌 المسجد الحرام في مكة المكرمة هو أكبر مسجد في العالم ويستوعب ملايين المصلين",
    "📿 كلمة الله ذُكرت في القرآن الكريم 2699 مرة",
    "🌙 شهر رمضان المبارك هو الشهر التاسع في التقويم الهجري",
    "⭐ عدد سور القرآن 114 سورة وعدد آياته 6236 آية",
    "🕋 الكعبة المشرفة هي أول بيت وُضع للناس على وجه الأرض",
    "📖 أطول سورة في القرآن هي البقرة بـ 286 آية",
    "🌟 أقصر سورة في القرآن هي الكوثر بـ 3 آيات فقط",
    "✨ الصلاة فُرضت على المسلمين في ليلة المعراج",
    "🌿 شجرة الزيتون ذُكرت في القرآن الكريم 7 مرات",
    "💫 النبي محمد ﷺ وُلد في مكة المكرمة عام 570 ميلادي",
    "🌍 الإسلام هو الدين الأسرع انتشاراً في العالم"
];

let factIndex = 0;

function showFact() {
    const el = document.getElementById('facts-container');
    if (!el) return;
    el.style.opacity = '0';
    setTimeout(() => {
        el.innerHTML = `<p>${facts[factIndex]}</p><small style="color:#999;font-size:0.8rem;margin-top:10px;display:block">اضغط لمعلومة جديدة 👆</small>`;
        el.style.opacity = '1';
        el.style.transition = 'opacity 0.5s';
        factIndex = (factIndex + 1) % facts.length;
    }, 400);
}

// ===== MENU =====
function toggleMenu() {
    const nav = document.getElementById('nav-links');
    const ham = document.getElementById('hamburger');
    if (nav) nav.classList.toggle('open');
    if (ham) ham.classList.toggle('open');
}

// إغلاق القائمة عند النقر على رابط
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-links a').forEach(a => {
        a.addEventListener('click', () => {
            document.getElementById('nav-links')?.classList.remove('open');
        });
    });
});

// ===== SCROLL =====
window.addEventListener('scroll', () => {
    const btn = document.getElementById('scroll-top');
    if (btn) btn.style.display = window.scrollY > 400 ? 'flex' : 'none';

    // Navbar effect
    const header = document.getElementById('header');
    if (header) {
        header.style.boxShadow = window.scrollY > 50
            ? '0 5px 30px rgba(0,0,0,0.3)'
            : 'none';
    }
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
            const offset = 70;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
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
    setInterval(showFact, 15000);
    setInterval(getPrayerTimes, 60000 * 30);
});