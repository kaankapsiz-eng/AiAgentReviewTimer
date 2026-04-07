/* ========================================== 
   CORE.JS - CIKO AI REVIEWER (v19.0 - SPA Routing Destekli) 
   ========================================== */
console.log("%c[Ciko-Core] 🚀 Sistem Başlatılıyor (SPA Mode Aktif)!", "color: #00ff41; font-weight: bold;");

// ==========================================
// 1. CONFIG & ASSETS
// ==========================================
const COLOR_OBIWAN = '#c19a6b';
const COLOR_PAPOI = '#fff000';
const PODO_IMG = 'https://cdn.jotfor.ms/assets/img/ai-agent/podoAvatars/podo-with-yarn.png';

const IMAGE_LIBRARY = [
    { url: 'https://gcdnb.pbrd.co/images/SVPsrA9niTqT.jpg?o=1', color: '#00ff41' },
    { url: 'https://gcdnb.pbrd.co/images/aeXkVuv0CcQQ.png?o=1', color: '#ff003c' },
    { url: PODO_IMG, color: '#007bff' },
    { url: 'https://i0.wp.com/day2daygallery.fr/wp-content/uploads/2024/04/PortraitofObiwan.jpeg?fit=981%2C981&ssl=1', color: COLOR_OBIWAN },
    { url: 'https://gcdnb.pbrd.co/images/kFjPbqAGh6z7.png?o=1', color: COLOR_PAPOI } 
];

const SOUND_LIBRARY = [
    { name: 'RABBIT', url: 'https://www.myinstants.com/media/sounds/meme-rabbit-clocks.mp3' },
    { name: 'FAAAH', url: 'https://www.myinstants.com/media/sounds/faaah.mp3' },
    { name: 'LO SIENTO WILSON', url: 'https://www.myinstants.com/media/sounds/lo-siento-wilson.mp3' },
    { name: 'TALL GUY', url: 'https://www.myinstants.com/media/sounds/rtee.mp3' },
    { name: 'PTSD', url: 'https://www.myinstants.com/media/sounds/kerosene.mp3' },
    { name: 'PATRICK DUMB', url: 'https://www.myinstants.com/media/sounds/ia-ia-ahh-yeye-yeye-lovely-sad.mp3' },
    { name: 'DEXTER', url: 'https://www.myinstants.com/media/sounds/dexter-meme.mp3' },
    { name: 'BIR DAKIKA', url: 'https://www.myinstants.com/media/sounds/yetersiz-bakiye-iett.mp3' },
    { name: 'NE DIYOO', url: 'https://www.myinstants.com/media/sounds/ne-diyooo-oglum.mp3' },
    { name: 'HARAMBALL', url: 'https://www.myinstants.com/media/sounds/haramball_ZFfRyh2.mp3' }
];

// --- Global Durum ---
let timerInterval = null;
let initTimestamp = Date.now();
let isMutedGlobal = localStorage.getItem('cyberTimerMuted') === 'true';
let userLibraryPref = localStorage.getItem('ciko_lib_pref') || 'ALL'; 
let currentThemeColor = '#00ff41';
let audioPlayedFinal = false;
let currentAudio = new Audio();
currentAudio.volume = 0.5;

// --- Helpers ---
function deepSearch(obj, key) { 
    if (obj && typeof obj === 'object') { 
        if (obj.hasOwnProperty(key)) return obj[key]; 
        for (let k in obj) { 
            let found = deepSearch(obj[k], key); 
            if (found) return found; 
        } 
    } 
    return null;
}

function format(ms) { 
    if (ms < 0) return "00:00"; 
    const totalSec = Math.floor(ms / 1000); 
    const m = Math.floor(totalSec / 60); 
    const s = totalSec % 60; 
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// --- Route Kontrolü ---
function checkRoute() {
    const match = location.pathname.match(/\/report-assistant\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
}
let currentReviewId = checkRoute();

// --- UI Engine ---
function buildUI() { 
    if (document.getElementById('cyber-timer-wrapper')) return;  

    const selectors = [ 
        '.flex.items-center.gap-4 .flex.items-center.gap-2.relative', 
        '.flex.items-center.gap-3.relative', 
        'header .flex.items-center.gap-4', 
        '[class*="Header"] [class*="Container"]' 
    ];

    let target = null; 
    for (const sel of selectors) { 
        target = document.querySelector(sel); 
        if (target) break; 
    }

    if (!target) return;

    console.log("%c[Ciko-UI] 🏗️ Sayaç kuruluyor...", "color: #00ff41;");

    let selected = (userLibraryPref === 'PODO')  
        ? { url: PODO_IMG, color: '#007bff' }  
        : IMAGE_LIBRARY[Math.floor(Math.random() * IMAGE_LIBRARY.length)];  
    
    currentThemeColor = selected.color;

    if (!document.getElementById('cyber-style')) { 
        const s = document.createElement('style'); 
        s.id = 'cyber-style'; 
        s.innerHTML = ` 
            @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap'); 
            #cyber-timer-wrapper { display: flex; flex-direction: column; align-items: flex-start; position: relative; margin-right: 25px; z-index: 9999; font-family: 'Share Tech Mono', monospace; } 
            #cyber-main-container { display: flex; align-items: center; } 
            #cyber-mute-btn { width: 34px; height: 34px; cursor: pointer; margin-right: 15px; border: 2px solid ${currentThemeColor}; border-radius: 6px; display: flex; align-items: center; justify-content: center; background: #000; position: relative; overflow: hidden; } 
            #cyber-mute-btn svg { width: 18px; fill: ${currentThemeColor}; } 
            #cyber-mute-btn.muted::after { content: ''; position: absolute; width: 2px; height: 25px; background: ${currentThemeColor}; transform: rotate(45deg); } 
            #cyber-timer-box { display: flex; align-items: center; justify-content: center; background: #000; border: 2px solid ${currentThemeColor}; border-radius: 4px; padding: 0 45px 0 20px; height: 40px; min-width: 130px; box-shadow: 0 0 15px ${currentThemeColor}44; position: relative; } 
            #timer-num { font-size: 26px; color: ${currentThemeColor}; text-shadow: 0 0 10px ${currentThemeColor}; font-weight: bold; } 
            #timer-img { position: absolute; right: -15px; bottom: -5px; width: 52px; height: 52px; object-fit: cover; border-radius: 6px; border: 2px solid ${currentThemeColor}; background: #000; } 
            #stop-sound-ani { position: absolute; top: -22px; left: 50%; transform: translateX(-50%); background: #ff003c; color: #fff; border: none; font-size: 10px; padding: 2px 8px; cursor: pointer; display: none; border-radius: 2px; font-weight: bold; } 
            #lib-switcher { width: 70px; background: #000; color: ${currentThemeColor}; font-size: 9px; text-align: center; cursor: pointer; border: 1px solid ${currentThemeColor}; border-top: none; padding: 1px 0; opacity: 0.7; transition: 0.3s; border-bottom-left-radius: 4px; border-bottom-right-radius: 4px; margin-left: 5px; } 
            #lib-switcher:hover { opacity: 1; background: #111; text-shadow: 0 0 5px ${currentThemeColor}; } 
            .critical #cyber-timer-box, .critical #lib-switcher { border-color: #ff003c !important; } 
            .critical #timer-num { color: #ff003c !important; } 
            .critical #timer-img { border-color: #ff003c !important; } 
            .critical #lib-switcher { color: #ff003c !important; } 
        `; 
        document.head.appendChild(s); 
    }

    const wrapper = document.createElement('div'); 
    wrapper.id = 'cyber-timer-wrapper'; 
    wrapper.innerHTML = ` 
        <div id="cyber-main-container"> 
            <div id="cyber-mute-btn" class="${isMutedGlobal ? 'muted' : ''}"><svg viewBox="0 0 24 24"><path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.03C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/></svg></div> 
            <div style="position: relative; display: flex; flex-direction: column;"> 
                <div id="cyber-timer-box"> 
                    <button id="stop-sound-ani">MUTE ALARM</button> 
                    <span id="timer-num">--:--</span> 
                    <img id="timer-img" src="${selected.url}"> 
                </div> 
                <div id="lib-switcher">LIB: ${userLibraryPref}</div> 
            </div> 
        </div> 
    `;  
    target.parentNode.insertBefore(wrapper, target);

    // Etkileşimler
    document.getElementById('cyber-mute-btn').onclick = () => { 
        isMutedGlobal = !isMutedGlobal; 
        localStorage.setItem('cyberTimerMuted', isMutedGlobal); 
        document.getElementById('cyber-mute-btn').classList.toggle('muted', isMutedGlobal); 
    }; 
    document.getElementById('stop-sound-ani').onclick = () => { 
        currentAudio.pause();
        currentAudio.currentTime = 0;
        document.getElementById('stop-sound-ani').style.display = 'none'; 
    }; 
    document.getElementById('lib-switcher').onclick = () => { 
        userLibraryPref = (userLibraryPref === 'ALL') ? 'PODO' : 'ALL'; 
        localStorage.setItem('ciko_lib_pref', userLibraryPref); 
        
        wrapper.remove();
        document.getElementById('cyber-style')?.remove();
        buildUI(); 
    };
}

// --- Reset ---
function systemReset() { 
    console.log("%c[Ciko-Logic] Eski veriler temizleniyor...", "color: #ffaa00;");
    localStorage.removeItem('ciko_timer_end'); 
    localStorage.removeItem('ciko_last_url'); 
    const existing = document.getElementById('cyber-timer-wrapper'); 
    if (existing) existing.remove(); 
    audioPlayedFinal = false; 
    currentAudio.pause();
    currentAudio.currentTime = 0;
    if (timerInterval) clearInterval(timerInterval);
    initTimestamp = Date.now(); 
}

// ==========================================
// SPA ROUTE DEĞİŞİMİNİ YAKALAYICI (HISTORY API)
// ==========================================
function handleRouteChange() {
    const newReviewId = checkRoute();
    if (newReviewId !== currentReviewId) {
        console.log(`%c[Ciko-Router] URL değişti! Eski: ${currentReviewId || 'Yok'} -> Yeni: ${newReviewId || 'Yok'}`, "color: #00ffff;");
        currentReviewId = newReviewId;
        
        // Görev değiştiğinde (Assign Next vb.) sistemi anında sıfırla. 
        // Böylece UI temizlenir ve arka plandan gelecek yeni network isteğine yer açılır.
        systemReset();
    }
}

// pushState ve replaceState interceptor'ları
const originalPushState = history.pushState;
history.pushState = function() {
    originalPushState.apply(this, arguments);
    handleRouteChange();
};
const originalReplaceState = history.replaceState;
history.replaceState = function() {
    originalReplaceState.apply(this, arguments);
    handleRouteChange();
};
window.addEventListener('popstate', handleRouteChange);

// --- Network Sniper ---
const processResponse = (url, data, status) => { 
    if (status !== 200) {
        if (status === 404 && url.includes('/project/ALL/')) {
            console.log(`%c[Ciko-Network] 404 - Proje verisi bulunamadı.`, "color: #ffaa00;");
        }
        return; 
    }

    if (url.includes('/reviewer-status')) {
        const username = deepSearch(data, 'username');
        if (username) {
            localStorage.setItem('ciko_username', username);
            console.log(`%c[Ciko-Network] Username yakalandı: ${username}`, "color: #00ff41;");
        }
    }

    if (!checkRoute()) return;

    const threshold = deepSearch(data, 'auto_resolve_threshold');  
    if (threshold) { 
        console.log(`%c[Ciko-Sniper] 🎯 THRESHOLD BULUNDU! Değer: ${threshold}s`, "background: #00ff41; color: #000; font-weight: bold; padding: 4px;"); 
        
        // Yeni görev için sıfırlanmış initTimestamp'in üzerine threshold eklenir.
        const endTime = initTimestamp + (parseInt(threshold) * 1000); 
        localStorage.setItem('ciko_timer_end', endTime); 
        localStorage.setItem('ciko_last_url', window.location.href); 
        audioPlayedFinal = false;   
        
        buildUI(); 
        runTimerEngine();  
    }
};

// Global Interceptors
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(m, u) { 
    this.addEventListener('load', function() { 
        try {  
            const resp = JSON.parse(this.responseText); 
            processResponse(u, resp, this.status);  
        } catch (e) {} 
    }); 
    return originalOpen.apply(this, arguments);
};

const originalFetch = window.fetch;
window.fetch = async (...args) => { 
    const response = await originalFetch(...args); 
    const url = args[0] instanceof Request ? args[0].url : args[0]; 
    response.clone().json().then(data => processResponse(url, data, response.status)).catch(() => {}); 
    return response;
};

// --- Timer Engine ---
function runTimerEngine() { 
    if (timerInterval) clearInterval(timerInterval); 
    
    timerInterval = setInterval(() => { 
        const endTimeStr = localStorage.getItem('ciko_timer_end'); 
        if (!endTimeStr || !checkRoute()) { 
            clearInterval(timerInterval); 
            const wrapper = document.getElementById('cyber-timer-wrapper');
            if (wrapper) wrapper.remove();
            return; 
        }

        const endTime = parseInt(endTimeStr);
        const remaining = endTime - Date.now(); 
        const display = document.getElementById('timer-num');  
        const wrapper = document.getElementById('cyber-timer-wrapper');

        if (display) { 
            display.innerText = format(remaining); 
        }

        // Süre dolduğunda...
        if (remaining <= 0) { 
            if (display) display.innerText = "00:00"; 
            if (wrapper) wrapper.classList.add('critical'); 
            
            if (!audioPlayedFinal) { 
                if (!isMutedGlobal) { 
                    const s = SOUND_LIBRARY[Math.floor(Math.random() * SOUND_LIBRARY.length)]; 
                    currentAudio.src = s.url; 
                    currentAudio.play().catch(() => {}); 
                    const muteBtn = document.getElementById('stop-sound-ani'); 
                    if(muteBtn) muteBtn.style.display = 'block'; 
                } 
                audioPlayedFinal = true; 
            }
        } else {
            if (wrapper) wrapper.classList.remove('critical'); 
        }
    }, 1000);
}

// UI Bekçisi
setInterval(() => { 
    const hasData = localStorage.getItem('ciko_timer_end'); 
    const uiMissing = !document.getElementById('cyber-timer-wrapper'); 
    if (hasData && uiMissing && checkRoute()) { 
        buildUI(); 
        runTimerEngine(); 
    } 
}, 2000);

// İlk yükleme kontrolü
if (checkRoute()) {
    if(localStorage.getItem('ciko_timer_end')) { 
        buildUI(); 
        runTimerEngine();
    }
} else {
    systemReset();
}