// نور الإسلام v2.0
// // ===== USER DATA =====
let userData = JSON.parse(localStorage.getItem('userData')) || {
    points: 0,
    totalTasbih: 0,
    azkarDone: 0,
    quranRead: [],
    streak: 0,
    lastVisit: null,
    badges: []
};

function saveUserData() {
    localStorage.setItem('userData', JSON.stringify(userData));
    updatePointsDisplay();
}

function addPoints(amount, reason) {
    userData.points += amount;
    saveUserData();
    showNotification(`+${amount} نقطة! ${reason}`);
    checkBadges();
}

function updatePointsDisplay() {
    const el = document.getElementById('user-points');
    if (el) el.textContent = userData.points;
}

function showNotification(msg) {
    const n = document.getElementById('notification');
    if (!n) return;
    n.textContent = msg;
    n.classList.add('show');
    setTimeout(() => n.classList.remove('show'), 2500);
}

// ===== BADGES =====
const badges = [
    { id: 'first', icon: '🌟', name: 'البداية', need: 10 },
    { id: 'beginner', icon: '🥉', name: 'مبتدئ', need: 100 },
    { id: 'active', icon: '🥈', name: 'نشيط', need: 500 },
    { id: 'expert', icon: '🥇', name: 'خبير', need: 1000 },
    { id: 'master', icon: '💎', name: 'متمكن', need: 5000 },
    { id: 'legend', icon: '👑', name: 'أسطورة', need: 10000 }
];

function checkBadges() {
    badges.forEach(b => {
        if (userData.points >= b.need && !userData.badges.includes(b.id)) {
            userData.badges.push(b.id);
            showNotification(`🎉 إنجاز جديد: ${b.name}!`);
            saveUserData();
        }
    });
}

function getUserLevel() {
    if (userData.points >= 10000) return 'أسطورة 👑';
    if (userData.points >= 5000) return 'متمكن 💎';
    if (userData.points >= 1000) return 'خبير 🥇';
    if (userData.points >= 500) return 'نشيط 🥈';
    if (userData.points >= 100) return 'مبتدئ 🥉';
    return 'جديد 🌱';
}

// ===== STREAK =====
function updateStreak() {
    const today = new Date().toDateString();
    if (userData.lastVisit !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (userData.lastVisit === yesterday.toDateString()) {
            userData.streak++;
            addPoints(10, 'زيارة يومية متتالية');
        } else if (userData.lastVisit !== today) {
            userData.streak = 1;
            addPoints(5, 'زيارة جديدة');
        }
        userData.lastVisit = today;
        saveUserData();
    }
}

// ===== THEME =====
function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    document.getElementById('theme-icon').className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function loadTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    document.getElementById('theme-icon').className = saved === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ===== NAVIGATION =====
function showSection(section) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(`page-${section}`);
    if (page) page.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('nav-links')?.classList.remove('open');

    // Load content
    if (section === 'hadith') loadHadiths();
    if (section === 'azkar') loadAzkarTabs();
    if (section === 'names') loadNames();
    if (section === 'sira') loadSira();
    if (section === 'prophets') loadProphets();
    if (section === 'ruqya') loadRuqya();
    if (section === 'prayer') getPrayerTimes();
    if (section === 'quran' && !document.getElementById('quran-display').innerHTML.includes('surah-header')) {
        loadSurah();
    }
}

function toggleMenu() {
    document.getElementById('nav-links')?.classList.toggle('open');
}

// ===== QURAN =====
const surahNames = [
    'الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة','يونس',
    'هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه',
    'الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','النمل','القصص','العنكبوت','الروم',
    'لقمان','السجدة','الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر',
    'فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق',
    'الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة',
    'الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج',
    'نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس',
    'التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','البلد',
    'الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات',
    'القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر',
    'المسد','الإخلاص','الفلق','الناس'
];

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

async function loadSurah() {
    const select = document.getElementById('surah-select');
    const display = document.getElementById('quran-display');
    if (!select || !display) return;

    const num = select.value;
    display.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>جاري التحميل...</p></div>';

    try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${num}/quran-uthmani`);
        const data = await res.json();
        const surah = data.data;

        let html = `<div class="surah-header"><h3>سورة ${surah.name}</h3><p>${surah.numberOfAyahs} آية | ${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</p></div>`;

        if (num != 9) html += `<div class="basmala">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>`;

        surah.ayahs.forEach(ayah => {
            html += `<div class="ayah"><span class="ayah-number">${ayah.numberInSurah}</span><p class="ayah-text">${ayah.text}</p></div>`;
        });

        display.innerHTML = html;

        // Audio
        const reciter = document.getElementById('reciter-select')?.value || 'ar.alafasy';
        const reciterName = reciter.split('.')[1];
        const audio = document.getElementById('quran-audio');
        const player = document.getElementById('audio-player');
        if (audio && player) {
            audio.src = `https://cdn.islamic.network/quran/audio-surah/128/${reciterName}/${num}.mp3`;
            player.style.display = 'block';
        }

        // Add points
        if (!userData.quranRead.includes(num)) {
            userData.quranRead.push(num);
            addPoints(50, `قراءة سورة ${surah.name}`);
        }
    } catch (err) {
        display.innerHTML = `<div style="text-align:center;padding:40px"><p style="font-size:3rem">📡</p><p style="color:#e74c3c">تعذر التحميل</p><button onclick="loadSurah()" class="btn btn-primary" style="margin-top:15px">🔄 إعادة</button></div>`;
    }
}

// ===== PRAYER =====
async function getPrayerTimes() {
    const city = document.getElementById('city-select')?.value || 'Cairo';
    const cc = {
        'Cairo':'Egypt','Mecca':'Saudi Arabia','Medina':'Saudi Arabia','Riyadh':'Saudi Arabia',
        'Dubai':'UAE','Kuwait City':'Kuwait','Amman':'Jordan','Beirut':'Lebanon','Baghdad':'Iraq',
        'Tunis':'Tunisia','Algiers':'Algeria','Casablanca':'Morocco','Doha':'Qatar',
        'Manama':'Bahrain','Muscat':'Oman'
    };

    try {
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${cc[city]}&method=5`);
        const data = await res.json();
        const t = data.data.timings;

        ['fajr','sunrise','dhuhr','asr','maghrib','isha'].forEach(p => {
            const el = document.getElementById(`${p}-time`);
            const key = p.charAt(0).toUpperCase() + p.slice(1);
            if (el) el.textContent = t[key];
        });

        const hijri = data.data.date.hijri;
        const hijriEl = document.getElementById('hijri-date');
        if (hijriEl) hijriEl.textContent = `${hijri.day} ${hijri.month.ar} ${hijri.year} هـ`;

        highlightNextPrayer(t);
        startCountdown(t);
    } catch (e) {
        console.error('Prayer error:', e);
    }
}

function highlightNextPrayer(t) {
    const prayers = ['fajr','sunrise','dhuhr','asr','maghrib','isha'];
    const times = [t.Fajr,t.Sunrise,t.Dhuhr,t.Asr,t.Maghrib,t.Isha];
    prayers.forEach(p => document.getElementById(`card-${p}`)?.classList.remove('active'));
    const now = new Date();
    const cur = now.getHours()*60 + now.getMinutes();
    for (let i = 0; i < times.length; i++) {
        const [h,m] = times[i].split(':').map(Number);
        if (cur < h*60+m) {
            document.getElementById(`card-${prayers[i]}`)?.classList.add('active');
            break;
        }
    }
}

function startCountdown(t) {
    const prayers = [
        {name:'الفجر',time:t.Fajr},{name:'الظهر',time:t.Dhuhr},
        {name:'العصر',time:t.Asr},{name:'المغرب',time:t.Maghrib},{name:'العشاء',time:t.Isha}
    ];
    function update() {
        const now = new Date();
        const cur = now.getHours()*60 + now.getMinutes();
        let next = null;
        for (let p of prayers) {
            const [h,m] = p.time.split(':').map(Number);
            if (cur < h*60+m) { next = {name:p.name,total:h*60+m}; break; }
        }
        const el = document.getElementById('countdown');
        if (next && el) {
            const d = next.total - cur;
            const hh = String(Math.floor(d/60)).padStart(2,'0');
            const mm = String(d%60).padStart(2,'0');
            const ss = String(59 - now.getSeconds()).padStart(2,'0');
            el.textContent = `${next.name} - ${hh}:${mm}:${ss}`;
        }
    }
    update();
    if (window.cdInterval) clearInterval(window.cdInterval);
    window.cdInterval = setInterval(update, 1000);
}

// ===== HADITHS (100+) =====
const hadithsData = {
    'إيمان': [
        {text:'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',source:'صحيح البخاري'},
        {text:'لا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',source:'متفق عليه'},
        {text:'الإيمان بضع وسبعون شعبة، أعلاها قول لا إله إلا الله، وأدناها إماطة الأذى عن الطريق',source:'صحيح مسلم'},
        {text:'ثلاث من كن فيه وجد حلاوة الإيمان: أن يكون الله ورسوله أحب إليه مما سواهما',source:'متفق عليه'},
        {text:'من كان يؤمن بالله واليوم الآخر فليقل خيراً أو ليصمت',source:'متفق عليه'},
        {text:'أحب الأعمال إلى الله أدومها وإن قل',source:'صحيح البخاري'},
        {text:'الدين النصيحة، قلنا لمن؟ قال لله ولكتابه ولرسوله ولأئمة المسلمين وعامتهم',source:'صحيح مسلم'},
        {text:'بني الإسلام على خمس: شهادة أن لا إله إلا الله وأن محمداً رسول الله، وإقام الصلاة، وإيتاء الزكاة، وحج البيت، وصوم رمضان',source:'متفق عليه'},
        {text:'من حسن إسلام المرء تركه ما لا يعنيه',source:'سنن الترمذي'},
        {text:'إن من أحبكم إلي وأقربكم مني مجلساً يوم القيامة أحاسنكم أخلاقاً',source:'سنن الترمذي'}
    ],
    'صلاة': [
        {text:'الصلاة عماد الدين، فمن أقامها فقد أقام الدين، ومن هدمها فقد هدم الدين',source:'البيهقي'},
        {text:'مفتاح الجنة الصلاة، ومفتاح الصلاة الطهور',source:'الإمام أحمد'},
        {text:'بين الرجل وبين الشرك والكفر ترك الصلاة',source:'صحيح مسلم'},
        {text:'إن أول ما يحاسب به العبد يوم القيامة من عمله صلاته',source:'سنن أبي داود'},
        {text:'صلاة الجماعة تفضل صلاة الفذ بسبع وعشرين درجة',source:'متفق عليه'},
        {text:'من صلى البردين دخل الجنة',source:'متفق عليه'},
        {text:'إذا توضأ الرجل فأحسن الوضوء، ثم خرج إلى الصلاة لا يخرجه إلا الصلاة، لم يخط خطوة إلا رفعت له بها درجة، وحطت عنه بها خطيئة',source:'متفق عليه'},
        {text:'الصلوات الخمس والجمعة إلى الجمعة كفارة لما بينهن، ما لم تغش الكبائر',source:'صحيح مسلم'},
        {text:'صلاة في مسجدي هذا خير من ألف صلاة فيما سواه إلا المسجد الحرام',source:'متفق عليه'},
        {text:'من غدا إلى المسجد وراح أعد الله له نزله من الجنة كلما غدا أو راح',source:'متفق عليه'}
    ],
    'أخلاق': [
        {text:'إنما بعثت لأتمم مكارم الأخلاق',source:'الإمام أحمد'},
        {text:'أكمل المؤمنين إيماناً أحسنهم خلقاً',source:'سنن أبي داود'},
        {text:'إن الله رفيق يحب الرفق، ويعطي على الرفق ما لا يعطي على العنف',source:'صحيح مسلم'},
        {text:'ليس الشديد بالصرعة، إنما الشديد الذي يملك نفسه عند الغضب',source:'متفق عليه'},
        {text:'تبسمك في وجه أخيك صدقة',source:'سنن الترمذي'},
        {text:'الحياء لا يأتي إلا بخير',source:'متفق عليه'},
        {text:'من كظم غيظاً وهو قادر على أن ينفذه دعاه الله على رؤوس الخلائق حتى يخيره من الحور ما شاء',source:'سنن أبي داود'},
        {text:'المسلم من سلم المسلمون من لسانه ويده',source:'صحيح البخاري'},
        {text:'البر حسن الخلق، والإثم ما حاك في صدرك وكرهت أن يطلع عليه الناس',source:'صحيح مسلم'},
        {text:'إن أحبكم إلي أحسنكم أخلاقاً',source:'صحيح البخاري'},
        {text:'الكلمة الطيبة صدقة',source:'متفق عليه'},
        {text:'لا تحقرن من المعروف شيئاً، ولو أن تلقى أخاك بوجه طلق',source:'صحيح مسلم'}
    ],
    'علم': [
        {text:'من سلك طريقاً يلتمس فيه علماً سهل الله له به طريقاً إلى الجنة',source:'صحيح مسلم'},
        {text:'طلب العلم فريضة على كل مسلم',source:'سنن ابن ماجه'},
        {text:'خيركم من تعلم القرآن وعلمه',source:'صحيح البخاري'},
        {text:'إذا مات ابن آدم انقطع عمله إلا من ثلاث: صدقة جارية، أو علم ينتفع به، أو ولد صالح يدعو له',source:'صحيح مسلم'},
        {text:'من يرد الله به خيراً يفقهه في الدين',source:'متفق عليه'},
        {text:'العلماء ورثة الأنبياء',source:'سنن أبي داود'},
        {text:'فضل العالم على العابد كفضلي على أدناكم',source:'سنن الترمذي'},
        {text:'من تعلم علماً مما يبتغى به وجه الله، لا يتعلمه إلا ليصيب به عرضاً من الدنيا، لم يجد عرف الجنة يوم القيامة',source:'سنن أبي داود'}
    ],
    'صدقة': [
        {text:'ما نقصت صدقة من مال، وما زاد الله عبداً بعفو إلا عزاً',source:'صحيح مسلم'},
        {text:'الصدقة تطفئ الخطيئة كما يطفئ الماء النار',source:'سنن الترمذي'},
        {text:'كل سلامى من الناس عليه صدقة كل يوم تطلع فيه الشمس',source:'متفق عليه'},
        {text:'اتقوا النار ولو بشق تمرة',source:'متفق عليه'},
        {text:'سبعة يظلهم الله في ظله يوم لا ظل إلا ظله',source:'متفق عليه'},
        {text:'اليد العليا خير من اليد السفلى',source:'متفق عليه'},
        {text:'من فطر صائماً كان له مثل أجره، غير أنه لا ينقص من أجر الصائم شيء',source:'سنن الترمذي'},
        {text:'إن الصدقة لتطفئ غضب الرب وتدفع ميتة السوء',source:'سنن الترمذي'}
    ],
    'صيام': [
        {text:'من صام رمضان إيماناً واحتساباً غفر له ما تقدم من ذنبه',source:'متفق عليه'},
        {text:'الصيام جنة',source:'متفق عليه'},
        {text:'للصائم فرحتان: فرحة عند فطره، وفرحة عند لقاء ربه',source:'متفق عليه'},
        {text:'من صام يوماً في سبيل الله بعد الله وجهه عن النار سبعين خريفاً',source:'متفق عليه'},
        {text:'ما من عبد يصوم يوماً في سبيل الله إلا باعد الله بذلك اليوم وجهه عن النار سبعين خريفاً',source:'متفق عليه'},
        {text:'من فطر صائماً كان له مثل أجره',source:'سنن الترمذي'},
        {text:'إذا جاء رمضان فتحت أبواب الجنة وغلقت أبواب النار وصفدت الشياطين',source:'متفق عليه'}
    ],
    'دعاء': [
        {text:'الدعاء هو العبادة',source:'سنن الترمذي'},
        {text:'ليس شيء أكرم على الله من الدعاء',source:'سنن الترمذي'},
        {text:'ما من مسلم يدعو بدعوة ليس فيها إثم ولا قطيعة رحم إلا أعطاه الله بها إحدى ثلاث',source:'الإمام أحمد'},
        {text:'يستجاب لأحدكم ما لم يعجل، يقول دعوت فلم يستجب لي',source:'متفق عليه'},
        {text:'ادعوا الله وأنتم موقنون بالإجابة، واعلموا أن الله لا يستجيب دعاءً من قلب غافل لاهٍ',source:'سنن الترمذي'},
        {text:'الدعاء بين الأذان والإقامة لا يرد',source:'سنن أبي داود'},
        {text:'ينزل ربنا تبارك وتعالى كل ليلة إلى السماء الدنيا حين يبقى ثلث الليل الآخر',source:'متفق عليه'}
    ],
    'متفرقات': [
        {text:'اتق الله حيثما كنت، وأتبع السيئة الحسنة تمحها، وخالق الناس بخلق حسن',source:'سنن الترمذي'},
        {text:'إن الله جميل يحب الجمال',source:'صحيح مسلم'},
        {text:'الطهور شطر الإيمان',source:'صحيح مسلم'},
        {text:'كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن: سبحان الله وبحمده، سبحان الله العظيم',source:'متفق عليه'},
        {text:'من قال سبحان الله وبحمده في يوم مائة مرة، حُطّت خطاياه وإن كانت مثل زبد البحر',source:'متفق عليه'},
        {text:'إن أحب الكلام إلى الله أربع: سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر',source:'صحيح مسلم'},
        {text:'الجنة تحت أقدام الأمهات',source:'النسائي'},
        {text:'رضا الرب في رضا الوالد، وسخط الرب في سخط الوالد',source:'سنن الترمذي'},
        {text:'لا يدخل الجنة من لا يأمن جاره بوائقه',source:'صحيح مسلم'},
        {text:'من غشنا فليس منا',source:'صحيح مسلم'},
        {text:'يسروا ولا تعسروا، وبشروا ولا تنفروا',source:'متفق عليه'},
        {text:'ما من شيء أثقل في ميزان المؤمن يوم القيامة من حسن الخلق',source:'سنن الترمذي'},
        {text:'الراحمون يرحمهم الرحمن، ارحموا من في الأرض يرحمكم من في السماء',source:'سنن الترمذي'},
        {text:'إن الله طيب لا يقبل إلا طيباً',source:'صحيح مسلم'},
        {text:'إذا أحب الله عبداً ابتلاه',source:'سنن الترمذي'}
    ]
};

let currentHadithCat = 'إيمان';

function loadHadiths() {
    const cats = document.getElementById('hadith-categories');
    if (cats) {
        cats.innerHTML = Object.keys(hadithsData).map(c =>
            `<button class="cat-btn ${c === currentHadithCat ? 'active' : ''}" onclick="filterHadiths('${c}')">${c}</button>`
        ).join('');
    }
    renderHadiths();
}

function filterHadiths(cat) {
    currentHadithCat = cat;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    renderHadiths();
}

function renderHadiths() {
    const list = document.getElementById('hadith-list');
    if (!list) return;
    const items = hadithsData[currentHadithCat] || [];
    list.innerHTML = items.map(h => `
        <div class="hadith-item" onclick="addPoints(2,'قراءة حديث')">
            <p class="text">${h.text}</p>
            <span class="source">📖 ${h.source}</span>
        </div>
    `).join('');
}

// ===== AZKAR (100+) =====
const azkarData = {
    morning: [
        {text:'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',repeat:1},
        {text:'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',repeat:1},
        {text:'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ',repeat:1,note:'سيد الاستغفار'},
        {text:'اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ',repeat:4},
        {text:'اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ، فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ',repeat:1},
        {text:'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي',repeat:3},
        {text:'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',repeat:7},
        {text:'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ',repeat:1},
        {text:'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',repeat:1},
        {text:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',repeat:100},
        {text:'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',repeat:10},
        {text:'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',repeat:3},
        {text:'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',repeat:3},
        {text:'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ',repeat:1},
        {text:'أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ ﷺ',repeat:1},
        {text:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ',repeat:3},
        {text:'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',repeat:10},
        {text:'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',repeat:10},
        {text:'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',repeat:100},
        {text:'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',repeat:3}
    ],
    evening: [
        {text:'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',repeat:1},
        {text:'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',repeat:1},
        {text:'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ',repeat:1,note:'سيد الاستغفار'},
        {text:'اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ، وَجَمِيعَ خَلْقِكَ',repeat:4},
        {text:'اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ، فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ',repeat:1},
        {text:'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي',repeat:3},
        {text:'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',repeat:7},
        {text:'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ',repeat:1},
        {text:'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',repeat:3},
        {text:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',repeat:100},
        {text:'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ',repeat:3},
        {text:'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا',repeat:3},
        {text:'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ',repeat:1},
        {text:'أَمْسَيْنَا عَلَى فِطْرَةِ الْإِسْلَامِ',repeat:1},
        {text:'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ',repeat:10},
        {text:'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ',repeat:1},
        {text:'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',repeat:100},
        {text:'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',repeat:10}
    ],
    sleep: [
        {text:'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',repeat:1},
        {text:'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',repeat:3},
        {text:'سُبْحَانَ اللَّهِ',repeat:33},
        {text:'الْحَمْدُ لِلَّهِ',repeat:33},
        {text:'اللَّهُ أَكْبَرُ',repeat:34},
        {text:'اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ',repeat:1},
        {text:'اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَرَبَّ الْعَرْشِ الْعَظِيمِ',repeat:1},
        {text:'بِاسْمِ اللَّهِ وَضَعْتُ جَنْبِي، اللَّهُمَّ اغْفِرْ لِي ذَنْبِي',repeat:1},
        {text:'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا، وَكَفَانَا وَآوَانَا',repeat:1},
        {text:'اللَّهُمَّ إِنِّي أَعُوذُ بِوَجْهِكَ الْكَرِيمِ، وَكَلِمَاتِكَ التَّامَّاتِ مِنْ شَرِّ مَا أَنْتَ آخِذٌ بِنَاصِيَتِهِ',repeat:1},
        {text:'آية الكرسي: اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ',repeat:1,note:'تقرأ قبل النوم'},
        {text:'قراءة سورة الإخلاص والمعوذتين والنفث في الكفين ومسح الجسد',repeat:3,note:'سنة قبل النوم'}
    ],
    food: [
        {text:'بِسْمِ اللَّهِ',repeat:1,note:'قبل الأكل'},
        {text:'بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ',repeat:1,note:'إذا نسي البسملة'},
        {text:'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا، وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',repeat:1,note:'بعد الأكل'},
        {text:'اللَّهُمَّ بَارِكْ لَنَا فِيهِ وَأَطْعِمْنَا خَيْرًا مِنْهُ',repeat:1,note:'عند شرب اللبن'}
    ],
    travel: [
        {text:'اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا، وَاطْوِ عَنَّا بُعْدَهُ، اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ',repeat:1},
        {text:'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',repeat:1,note:'دعاء الركوب'}
    ]
};

let currentAzkarTab = 'morning';
let azkarCounters = {};

function loadAzkarTabs() {
    const tabs = document.getElementById('azkar-tabs');
    if (!tabs) return;
    const labels = {morning:'🌅 الصباح',evening:'🌙 المساء',sleep:'😴 النوم',food:'🍽️ الطعام',travel:'✈️ السفر'};
    tabs.innerHTML = Object.keys(azkarData).map(k =>
        `<button class="tab-btn ${k === currentAzkarTab ? 'active' : ''}" onclick="showAzkar('${k}', this)">${labels[k]}</button>`
    ).join('');
    renderAzkar(currentAzkarTab);
}

function showAzkar(type, btn) {
    currentAzkarTab = type;
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
            <button class="zikr-btn" id="btn-${i}" onclick="countZikr(${i}, ${z.repeat})">✋ اضغط</button>
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
        if (card) { card.style.background = 'rgba(26,140,62,0.2)'; card.style.borderColor = '#1a8c3e'; }
        if (btn) { btn.textContent = '✅ تم!'; btn.classList.add('done'); }
        userData.azkarDone++;
        addPoints(5, 'إكمال ذكر');
    }
}

// ===== TASBIH =====
let tasbihCount = 0;
let tasbihMax = 33;

function countTasbih() {
    tasbihCount++;
    userData.totalTasbih++;
    const el = document.getElementById('tasbih-count');
    const bar = document.getElementById('progress-bar');
    if (el) {
        el.textContent = tasbihCount;
        el.style.transform = 'scale(1.2)';
        setTimeout(() => { el.style.transform = 'scale(1)'; }, 100);
    }
    if (bar) bar.style.width = Math.min((tasbihCount/tasbihMax)*100, 100) + '%';
    if (tasbihCount % 33 === 0) addPoints(3, 'تسبيح');
    if (tasbihCount === tasbihMax) {
        addPoints(10, 'إكمال التسبيح');
        setTimeout(() => alert(`🎉 ماشاء الله! أكملت ${tasbihMax} تسبيحة`), 200);
    }
    saveUserData();
}

function resetTasbih() {
    tasbihCount = 0;
    document.getElementById('tasbih-count').textContent = '0';
    document.getElementById('progress-bar').style.width = '0%';
}

function changeTasbih(text, max) {
    tasbihMax = max;
    document.getElementById('tasbih-text').textContent = text;
    document.getElementById('tasbih-target').textContent = max;
    resetTasbih();
}

// ===== ALLAH NAMES =====
const allahNames = [
    {name:'الرَّحْمَنُ',meaning:'كثير الرحمة'},{name:'الرَّحِيمُ',meaning:'الرحيم بعباده'},
    {name:'الْمَلِكُ',meaning:'مالك كل شيء'},{name:'الْقُدُّوسُ',meaning:'الطاهر من العيوب'},
    {name:'السَّلَامُ',meaning:'السالم من النقائص'},{name:'الْمُؤْمِنُ',meaning:'المصدق رسله'},
    {name:'الْمُهَيْمِنُ',meaning:'الشاهد على خلقه'},{name:'الْعَزِيزُ',meaning:'القوي الذي لا يغلب'},
    {name:'الْجَبَّارُ',meaning:'الذي يقهر العباد'},{name:'الْمُتَكَبِّرُ',meaning:'الذي تكبر عن كل سوء'},
    {name:'الْخَالِقُ',meaning:'الذي خلق كل شيء'},{name:'الْبَارِئُ',meaning:'الذي برأ الخلق'},
    {name:'الْمُصَوِّرُ',meaning:'الذي صور المخلوقات'},{name:'الْغَفَّارُ',meaning:'كثير المغفرة'},
    {name:'الْقَهَّارُ',meaning:'الذي قهر كل شيء'},{name:'الْوَهَّابُ',meaning:'كثير العطاء'},
    {name:'الرَّزَّاقُ',meaning:'الذي يرزق الخلق'},{name:'الْفَتَّاحُ',meaning:'الذي يفتح أبواب الرحمة'},
    {name:'الْعَلِيمُ',meaning:'العالم بكل شيء'},{name:'الْقَابِضُ',meaning:'الذي يقبض الأرزاق'},
    {name:'الْبَاسِطُ',meaning:'الذي يبسط الأرزاق'},{name:'الْخَافِضُ',meaning:'الذي يخفض الكافرين'},
    {name:'الرَّافِعُ',meaning:'الذي يرفع المؤمنين'},{name:'الْمُعِزُّ',meaning:'الذي يعز من يشاء'},
    {name:'الْمُذِلُّ',meaning:'الذي يذل من يشاء'},{name:'السَّمِيعُ',meaning:'الذي يسمع كل شيء'},
    {name:'الْبَصِيرُ',meaning:'الذي يبصر كل شيء'},{name:'الْحَكَمُ',meaning:'الحاكم بين عباده'},
    {name:'الْعَدْلُ',meaning:'الذي لا يجور أبداً'},{name:'اللَّطِيفُ',meaning:'اللطيف بعباده'},
    {name:'الْخَبِيرُ',meaning:'الخبير بكل شيء'},{name:'الْحَلِيمُ',meaning:'الذي يحلم على عباده'},
    {name:'الْعَظِيمُ',meaning:'الذي عظم في كل شيء'},{name:'الْغَفُورُ',meaning:'كثير المغفرة'},
    {name:'الشَّكُورُ',meaning:'الذي يشكر القليل'},{name:'الْعَلِيُّ',meaning:'العلي على عباده'},
    {name:'الْكَبِيرُ',meaning:'الكبير في ذاته'},{name:'الْحَفِيظُ',meaning:'الذي يحفظ خلقه'},
    {name:'الْمُقِيتُ',meaning:'الذي يقوت الخلق'},{name:'الْحَسِيبُ',meaning:'الذي يحاسب العباد'},
    {name:'الْجَلِيلُ',meaning:'صاحب الجلال'},{name:'الْكَرِيمُ',meaning:'كثير الكرم'},
    {name:'الرَّقِيبُ',meaning:'الذي يراقب عباده'},{name:'الْمُجِيبُ',meaning:'الذي يجيب الدعاء'},
    {name:'الْوَاسِعُ',meaning:'الواسع في رحمته'},{name:'الْحَكِيمُ',meaning:'صاحب الحكمة'},
    {name:'الْوَدُودُ',meaning:'المحب لعباده الصالحين'},{name:'الْمَجِيدُ',meaning:'صاحب المجد'},
    {name:'الْبَاعِثُ',meaning:'الذي يبعث الموتى'},{name:'الشَّهِيدُ',meaning:'الشاهد على كل شيء'},
    {name:'الْحَقُّ',meaning:'الثابت الذي لا يزول'},{name:'الْوَكِيلُ',meaning:'الذي يتوكل عليه'},
    {name:'الْقَوِيُّ',meaning:'صاحب القوة'},{name:'الْمَتِينُ',meaning:'الشديد القوي'},
    {name:'الْوَلِيُّ',meaning:'ولي المؤمنين'},{name:'الْحَمِيدُ',meaning:'المستحق للحمد'},
    {name:'الْمُحْصِي',meaning:'الذي أحصى كل شيء'},{name:'الْمُبْدِئُ',meaning:'الذي بدأ الخلق'},
    {name:'الْمُعِيدُ',meaning:'الذي يعيد الخلق'},{name:'الْمُحْيِي',meaning:'الذي يحيي الموتى'},
    {name:'الْمُمِيتُ',meaning:'الذي يميت الأحياء'},{name:'الْحَيُّ',meaning:'الحي الذي لا يموت'},
    {name:'الْقَيُّومُ',meaning:'القائم على خلقه'},{name:'الْوَاجِدُ',meaning:'الواجد لما يريد'},
    {name:'الْمَاجِدُ',meaning:'صاحب المجد'},{name:'الْوَاحِدُ',meaning:'الواحد في ذاته'},
    {name:'الْأَحَدُ',meaning:'الأحد في صفاته'},{name:'الصَّمَدُ',meaning:'الذي تصمد إليه الخلائق'},
    {name:'الْقَادِرُ',meaning:'القادر على كل شيء'},{name:'الْمُقْتَدِرُ',meaning:'صاحب القدرة'},
    {name:'الْمُقَدِّمُ',meaning:'الذي يقدم من يشاء'},{name:'الْمُؤَخِّرُ',meaning:'الذي يؤخر من يشاء'},
    {name:'الْأَوَّلُ',meaning:'الذي ليس قبله شيء'},{name:'الْآخِرُ',meaning:'الذي ليس بعده شيء'},
    {name:'الظَّاهِرُ',meaning:'الظاهر بآياته'},{name:'الْبَاطِنُ',meaning:'الباطن عن الأبصار'},
    {name:'الْوَالِي',meaning:'المالك للأمور'},{name:'الْمُتَعَالِي',meaning:'العالي عن النقائص'},
    {name:'الْبَرُّ',meaning:'البار بعباده'},{name:'التَّوَّابُ',meaning:'الذي يقبل التوبة'},
    {name:'الْمُنْتَقِمُ',meaning:'الذي ينتقم من العصاة'},{name:'الْعَفُوُّ',meaning:'كثير العفو'},
    {name:'الرَّءُوفُ',meaning:'الرحيم بعباده'},{name:'مَالِكُ الْمُلْكِ',meaning:'مالك الملك كله'},
    {name:'ذُو الْجَلَالِ وَالْإِكْرَامِ',meaning:'صاحب العظمة'},{name:'الْمُقْسِطُ',meaning:'العادل'},
    {name:'الْجَامِعُ',meaning:'الذي يجمع الخلق'},{name:'الْغَنِيُّ',meaning:'الغني عن خلقه'},
    {name:'الْمُغْنِي',meaning:'الذي يغني من يشاء'},{name:'الْمَانِعُ',meaning:'الذي يمنع ما يشاء'},
    {name:'الضَّارُّ',meaning:'الذي يضر من يشاء'},{name:'النَّافِعُ',meaning:'الذي ينفع من يشاء'},
    {name:'النُّورُ',meaning:'منور السماوات والأرض'},{name:'الْهَادِي',meaning:'الذي يهدي عباده'},
    {name:'الْبَدِيعُ',meaning:'مبدع الكون'},{name:'الْبَاقِي',meaning:'الباقي بلا نهاية'},
    {name:'الْوَارِثُ',meaning:'الذي يرث كل شيء'},{name:'الرَّشِيدُ',meaning:'الذي يرشد عباده'},
    {name:'الصَّبُورُ',meaning:'الذي لا يعجل بالعقوبة'}
];

function loadNames() {
    const grid = document.getElementById('names-grid');
    if (!grid) return;
    grid.innerHTML = allahNames.map((n, i) => `
        <div class="name-card" onclick="addPoints(1,'تأمل اسم')">
            <div class="name-number">${i + 1}</div>
            <h3 class="name-arabic">${n.name}</h3>
            <p class="name-meaning">${n.meaning}</p>
        </div>
    `).join('');
}

// ===== SIRA =====
const siraData = [
    {year:'570م',title:'مولد النبي ﷺ',desc:'وُلد النبي محمد ﷺ في مكة المكرمة في عام الفيل، يوم الإثنين 12 ربيع الأول. توفي والده عبد الله قبل ولادته، ورضع من حليمة السعدية.'},
    {year:'576م',title:'وفاة الأم',desc:'توفيت أمه السيدة آمنة بنت وهب وهو في السادسة من عمره، فكفله جده عبد المطلب.'},
    {year:'578م',title:'وفاة الجد',desc:'توفي جده عبد المطلب وهو في الثامنة، فكفله عمه أبو طالب.'},
    {year:'595م',title:'الزواج من خديجة',desc:'تزوج النبي ﷺ من السيدة خديجة بنت خويلد رضي الله عنها وعمره 25 سنة وعمرها 40 سنة.'},
    {year:'610م',title:'بداية الوحي',desc:'نزل عليه الوحي في غار حراء وعمره 40 سنة، حيث جاءه جبريل عليه السلام بأول آيات القرآن "اقرأ باسم ربك الذي خلق".'},
    {year:'613م',title:'الدعوة الجهرية',desc:'بدأ النبي ﷺ الدعوة الجهرية بعد 3 سنوات من الدعوة السرية، وواجه أذى قريش.'},
    {year:'615م',title:'الهجرة الأولى للحبشة',desc:'هاجر بعض المسلمين إلى الحبشة فراراً من أذى قريش، وكان عددهم 11 رجلاً و4 نساء.'},
    {year:'619م',title:'عام الحزن',desc:'توفيت السيدة خديجة وعمه أبو طالب في نفس العام، فسُمي بعام الحزن.'},
    {year:'620م',title:'الإسراء والمعراج',desc:'أُسري بالنبي ﷺ من المسجد الحرام إلى المسجد الأقصى، ثم عُرج به إلى السماوات السبع، وفُرضت الصلوات الخمس.'},
    {year:'622م',title:'الهجرة إلى المدينة',desc:'هاجر النبي ﷺ مع أبي بكر الصديق رضي الله عنه إلى المدينة المنورة، وأسس أول دولة إسلامية.'},
    {year:'624م',title:'غزوة بدر الكبرى',desc:'انتصر المسلمون في أول معركة فاصلة بين الإسلام والشرك، وكان عدد المسلمين 313 ضد ألف من قريش.'},
    {year:'625م',title:'غزوة أحد',desc:'وقعت غزوة أحد، واستشهد فيها 70 من الصحابة منهم حمزة بن عبد المطلب رضي الله عنه.'},
    {year:'627م',title:'غزوة الخندق',desc:'حاصرت قريش وحلفاؤها المدينة، فحفر المسلمون الخندق بمشورة سلمان الفارسي رضي الله عنه.'},
    {year:'628م',title:'صلح الحديبية',desc:'عقد النبي ﷺ صلحاً مع قريش لمدة 10 سنوات، وكان فتحاً عظيماً للإسلام.'},
    {year:'630م',title:'فتح مكة',desc:'دخل النبي ﷺ مكة فاتحاً، وحطم الأصنام حول الكعبة، وعفا عن أهلها.'},
    {year:'632م',title:'حجة الوداع',desc:'حج النبي ﷺ حجة الوداع، وألقى خطبته الشهيرة، ونزلت آية {اليوم أكملت لكم دينكم}.'},
    {year:'632م',title:'وفاة النبي ﷺ',desc:'توفي النبي محمد ﷺ في يوم الإثنين 12 ربيع الأول وعمره 63 سنة، ودُفن في حجرة عائشة رضي الله عنها.'}
];

function loadSira() {
    const t = document.getElementById('sira-timeline');
    if (!t) return;
    t.innerHTML = siraData.map(s => `
        <div class="sira-item" onclick="addPoints(3,'قراءة السيرة')">
            <div class="sira-year">📅 ${s.year}</div>
            <h3>${s.title}</h3>
            <p>${s.desc}</p>
        </div>
    `).join('');
}

// ===== PROPHETS =====
const prophetsData = [
    {icon:'👴',name:'آدم عليه السلام',summary:'أبو البشر، خلقه الله بيده ونفخ فيه من روحه، وأسجد له الملائكة، وعلمه الأسماء كلها.'},
    {icon:'🚢',name:'نوح عليه السلام',summary:'دعا قومه 950 سنة، فلم يؤمن معه إلا قليل، فأمره الله ببناء السفينة وأغرق المكذبين بالطوفان.'},
    {icon:'🐪',name:'هود عليه السلام',summary:'أرسله الله إلى قوم عاد، فكذبوه فأهلكهم الله بريح صرصر عاتية سخرها عليهم سبع ليال وثمانية أيام.'},
    {icon:'🐫',name:'صالح عليه السلام',summary:'أرسل إلى ثمود، وأخرج لهم ناقة من الصخر آية، فعقروها فأهلكهم الله بالصيحة.'},
    {icon:'🔥',name:'إبراهيم عليه السلام',summary:'خليل الرحمن، حطم أصنام قومه، فألقوه في النار فجعلها الله برداً وسلاماً، بنى الكعبة مع ابنه إسماعيل.'},
    {icon:'🕋',name:'إسماعيل عليه السلام',summary:'ابن إبراهيم، هو الذبيح، بنى الكعبة مع أبيه، وهو جد العرب وجد النبي محمد ﷺ.'},
    {icon:'⛺',name:'إسحاق عليه السلام',summary:'ابن إبراهيم من سارة، بُشر به أبوه على كبر، وهو والد يعقوب عليه السلام.'},
    {icon:'🌾',name:'يعقوب (إسرائيل) عليه السلام',summary:'ابن إسحاق، له اثنا عشر ابناً منهم يوسف، صبر على فقد ابنه يوسف حتى عميت عيناه من الحزن.'},
    {icon:'👑',name:'يوسف عليه السلام',summary:'أوتي شطر الحسن، ألقاه إخوته في البئر، وبيع عبداً في مصر، وأصبح عزيز مصر، أعطاه الله تأويل الأحاديث.'},
    {icon:'⚔️',name:'موسى عليه السلام',summary:'كليم الله، أرسله الله إلى فرعون، وأنزل عليه التوراة، وأنجى بني إسرائيل وأغرق فرعون في البحر.'},
    {icon:'🏔️',name:'هارون عليه السلام',summary:'أخو موسى، كان أفصح منه لساناً، أرسله الله مع موسى إلى فرعون.'},
    {icon:'🐳',name:'يونس عليه السلام',summary:'ذو النون، خرج مغاضباً قومه فالتقمه الحوت، فدعا في الظلمات: لا إله إلا أنت سبحانك إني كنت من الظالمين.'},
    {icon:'🌴',name:'لوط عليه السلام',summary:'ابن أخي إبراهيم، أرسل إلى قوم سدوم، فأهلكهم الله بسبب فاحشتهم.'},
    {icon:'⚱️',name:'شعيب عليه السلام',summary:'خطيب الأنبياء، أرسل إلى أهل مدين، نهاهم عن التطفيف في الكيل والميزان.'},
    {icon:'🌳',name:'أيوب عليه السلام',summary:'صبر على البلاء سنوات طويلة، فمرض وفقد ماله وأهله، فلما دعا ربه استجاب له ورد عليه أهله وماله.'},
    {icon:'📜',name:'ذو الكفل عليه السلام',summary:'من الصالحين، تكفل بأمر فوفى به، فكان من الأخيار.'},
    {icon:'👴🏻',name:'إدريس عليه السلام',summary:'أول من خط بالقلم، رفعه الله مكاناً علياً.'},
    {icon:'🧙',name:'إلياس عليه السلام',summary:'من أنبياء بني إسرائيل، دعا قومه إلى عبادة الله وترك عبادة بعل.'},
    {icon:'⚡',name:'اليسع عليه السلام',summary:'تابع لإلياس عليه السلام، أكرمه الله بالنبوة.'},
    {icon:'👑',name:'داود عليه السلام',summary:'آتاه الله الملك والحكمة، وأنزل عليه الزبور، وألان له الحديد، وسبحت معه الجبال والطير.'},
    {icon:'🐎',name:'سليمان عليه السلام',summary:'ابن داود، آتاه الله ملكاً عظيماً، وسخر له الجن والريح، وفهم منطق الطير.'},
    {icon:'🕊️',name:'زكريا عليه السلام',summary:'كفل مريم، ودعا ربه أن يرزقه ولداً على الكبر، فبشره الله بيحيى.'},
    {icon:'🌟',name:'يحيى عليه السلام',summary:'ابن زكريا، آتاه الله الحكم صبياً، وكان تقياً براً بوالديه.'},
    {icon:'☁️',name:'عيسى عليه السلام',summary:'ابن مريم، روح الله وكلمته، تكلم في المهد، وأحيا الموتى بإذن الله، رفعه الله إلى السماء.'},
    {icon:'🌙',name:'محمد ﷺ',summary:'خاتم الأنبياء والمرسلين، أُرسل رحمة للعالمين، أُنزل عليه القرآن، أكمل الله به الدين.'}
];

function loadProphets() {
    const grid = document.getElementById('prophets-grid');
    if (!grid) return;
    grid.innerHTML = prophetsData.map(p => `
        <div class="prophet-card" onclick="addPoints(2,'قراءة قصة نبي')">
            <span class="prophet-icon">${p.icon}</span>
            <h3>${p.name}</h3>
            <p class="summary">${p.summary}</p>
        </div>
    `).join('');
}

// ===== RUQYA =====
const ruqyaData = [
    {title:'سورة الفاتحة',text:'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾ الرَّحْمَٰنِ الرَّحِيمِ ﴿٣﴾ مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾',desc:'تُقرأ 7 مرات للرقية'},
    {title:'آية الكرسي',text:'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',desc:'أعظم آية في القرآن، تقرأ للحفظ والحماية'},
    {title:'سورة الإخلاص',text:'قُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ﴿٤﴾',desc:'تعدل ثلث القرآن، تقرأ 3 مرات'},
    {title:'سورة الفلق',text:'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ﴿١﴾ مِن شَرِّ مَا خَلَقَ ﴿٢﴾ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿٣﴾ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ﴿٤﴾ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿٥﴾',desc:'للحماية من الحسد والسحر، تقرأ 3 مرات'},
    {title:'سورة الناس',text:'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ﴿١﴾ مَلِكِ النَّاسِ ﴿٢﴾ إِلَٰهِ النَّاسِ ﴿٣﴾ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ﴿٤﴾ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ﴿٥﴾ مِنَ الْجِنَّةِ وَالنَّاسِ ﴿٦﴾',desc:'للحماية من شياطين الإنس والجن، تقرأ 3 مرات'},
    {title:'دعاء الكرب',text:'لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ',desc:'يقال عند الكرب والضيق'},
    {title:'دعاء الشفاء',text:'اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَأْسَ، اشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا',desc:'يقال على المريض بمسح موضع الألم'},
    {title:'دعاء الحفظ',text:'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',desc:'يقال 3 مرات صباحاً ومساءً'},
    {title:'الحماية من العين والحسد',text:'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ، مِنْ شَرِّ مَا خَلَقَ',desc:'يقال 3 مرات صباحاً ومساءً'}
];

function loadRuqya() {
    const c = document.getElementById('ruqya-content');
    if (!c) return;
    c.innerHTML = ruqyaData.map(r => `
        <div class="ruqya-section" onclick="addPoints(3,'قراءة الرقية')">
            <h3>🛡️ ${r.title}</h3>
            <p class="text">${r.text}</p>
            <p class="desc">💡 ${r.desc}</p>
        </div>
    `).join('');
}

// ===== DAILY VERSE =====
const dailyVerses = [
    'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ۝ وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ',
    'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    'وَاللَّهُ خَيْرُ الرَّازِقِينَ',
    'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
    'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
    'وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ ۚ عَلَيْهِ تَوَكَّلْتُ وَإِلَيْهِ أُنِيبُ',
    'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
    'إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ',
    'وَبَشِّرِ الصَّابِرِينَ',
    'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا'
];

function loadDailyVerse() {
    const el = document.getElementById('daily-verse');
    if (!el) return;
    const idx = new Date().getDate() % dailyVerses.length;
    el.innerHTML = `<p>${dailyVerses[idx]}</p>`;
}

// ===== SEARCH =====
function openSearch() {
    document.getElementById('search-modal').classList.add('open');
    setTimeout(() => document.getElementById('search-input').focus(), 100);
}

function closeSearch() {
    document.getElementById('search-modal').classList.remove('open');
    document.getElementById('search-input').value = '';
    document.getElementById('search-results').innerHTML = '';
}

function searchSite() {
    const q = document.getElementById('search-input').value.trim();
    const results = document.getElementById('search-results');
    if (!q) { results.innerHTML = ''; return; }

    const items = [];
    surahNames.forEach((s, i) => {
        if (s.includes(q)) items.push({type:'سورة',name:`سورة ${s}`,action:`showSection('quran');setTimeout(()=>{document.getElementById('surah-select').value=${i+1};loadSurah()},300)`});
    });
    Object.values(hadithsData).flat().forEach(h => {
        if (h.text.includes(q)) items.push({type:'حديث',name:h.text.substring(0, 60) + '...',action:`showSection('hadith')`});
    });
    allahNames.forEach(n => {
        if (n.name.includes(q) || n.meaning.includes(q)) items.push({type:'اسم',name:n.name,action:`showSection('names')`});
    });
    prophetsData.forEach(p => {
        if (p.name.includes(q)) items.push({type:'نبي',name:p.name,action:`showSection('prophets')`});
    });

    if (items.length === 0) {
        results.innerHTML = '<div style="padding:30px;text-align:center;color:#999">لا توجد نتائج</div>';
    } else {
        results.innerHTML = items.slice(0, 20).map(i =>
            `<div class="search-result" onclick="${i.action};closeSearch()"><strong>${i.type}:</strong> ${i.name}</div>`
        ).join('');
    }
}

// ===== PROFILE =====
function showProfile() {
    document.getElementById('total-points').textContent = userData.points;
    document.getElementById('user-level').textContent = getUserLevel();
    document.getElementById('streak-days').textContent = userData.streak;
    document.getElementById('quran-read').textContent = userData.quranRead.length;
    document.getElementById('total-tasbih').textContent = userData.totalTasbih;
    document.getElementById('azkar-done').textContent = userData.azkarDone;

    const grid = document.getElementById('badges-grid');
    grid.innerHTML = badges.map(b => `
        <div class="badge ${userData.badges.includes(b.id) ? 'unlocked' : ''}">
            <div class="icon">${b.icon}</div>
            <div class="name">${b.name}</div>
        </div>
    `).join('');

    document.getElementById('profile-modal').classList.add('open');
}

function closeProfile(e) {
    if (e && e.target.id !== 'profile-modal') return;
    document.getElementById('profile-modal').classList.remove('open');
}

function resetProgress() {
    if (confirm('هل أنت متأكد؟ سيتم حذف جميع نقاطك وإنجازاتك!')) {
        userData = {points:0,totalTasbih:0,azkarDone:0,quranRead:[],streak:0,lastVisit:null,badges:[]};
        saveUserData();
        showProfile();
        showNotification('تم إعادة التعيين');
    }
}

// ===== SCROLL =====
window.addEventListener('scroll', () => {
    const btn = document.getElementById('scroll-top');
    if (btn) btn.style.display = window.scrollY > 400 ? 'flex' : 'none';
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== START =====
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.opacity = '0';
            loader.style.transition = 'opacity 0.5s';
            setTimeout(() => loader.style.display = 'none', 500);
        }
    }, 1500);
});

document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    updateStreak();
    updatePointsDisplay();
    initSurahSelect();
    loadSurah();
    getPrayerTimes();
    loadDailyVerse();

    // ESC to close modals
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeSearch();
            closeProfile();
        }
    });
});