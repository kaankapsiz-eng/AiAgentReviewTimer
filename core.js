let currentUrl = window.location.href;
let timerInterval = null;
let isMutedGlobal = localStorage.getItem('cyberTimerMuted') === 'true';
let userLibraryPref = localStorage.getItem('ciko_lib_pref') || 'ALL'; 
let currentThemeColor = '#00ff41';
let audioPlayedFinal = false;
let currentAudio = new Audio();
currentAudio.volume = 0.2;

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

function buildUI() {
    if (document.getElementById('cyber-timer-wrapper')) return;
    const target = document.querySelector('.flex.items-center.gap-4 .flex.items-center.gap-2.relative');
    if (!target) return;

    let selected = (userLibraryPref === 'PODO') 
        ? { url: PODO_IMG, color: '#007bff' } 
        : IMAGE_LIBRARY[Math.floor(Math.random() * IMAGE_LIBRARY.length)];
    
    currentThemeColor = selected.color;

    const s = document.createElement('style');
    s.id = 'cyber-style';
    s.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        #cyber-timer-wrapper { display: flex; flex-direction: column; align-items: flex-start; position: relative; margin-right: 25px; z-index: 1000; font-family: 'Share Tech Mono', monospace; }
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

    const wrapper = document.createElement('div');
    wrapper.id = 'cyber-timer-wrapper';
    wrapper.innerHTML = `
        <div id="cyber-main-container">
            <div id="cyber-mute-btn"><svg viewBox="0 0 24 24"><path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.03C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/></svg></div>
            <div style="position: relative; display: flex; flex-direction: column;">
                <div id="cyber-timer-box">
                    <button id="stop-sound-ani">MUTE</button>
                    <span id="timer-num">--:--</span>
                    <img id="timer-img" src="${selected.url}">
                </div>
                <div id="lib-switcher">LIB: ${userLibraryPref}</div>
            </div>
        </div>
    `;
    target.parentNode.insertBefore(wrapper, target);

    document.getElementById('cyber-mute-btn').onclick = () => {
        isMutedGlobal = !isMutedGlobal;
        localStorage.setItem('cyberTimerMuted', isMutedGlobal);
        document.getElementById('cyber-mute-btn').classList.toggle('muted', isMutedGlobal);
    };
    document.getElementById('stop-sound-ani').onclick = () => {
        currentAudio.pause();
        document.getElementById('stop-sound-ani').style.display = 'none';
    };
    document.getElementById('lib-switcher').onclick = () => {
        userLibraryPref = (userLibraryPref === 'ALL') ? 'PODO' : 'ALL';
        localStorage.setItem('ciko_lib_pref', userLibraryPref);
        location.reload(); 
    };

    if (isMutedGlobal) document.getElementById('cyber-mute-btn').classList.add('muted');
    runTimerEngine();
}

const processResponse = (url, data, status) => {
    if (status !== 200 || localStorage.getItem('ciko_timer_end')) return;
    const foundUser = deepSearch(data, 'username');
    if (foundUser) window.currentReviewer = foundUser;
    if (window.currentReviewer && url.includes(window.currentReviewer)) {
        const threshold = deepSearch(data, 'auto_resolve_threshold');
        if (threshold) {
            const now = Date.now();
            const endTime = now + (parseInt(threshold) * 1000);
            localStorage.setItem('ciko_timer_end', endTime);
            localStorage.setItem('ciko_last_url', window.location.href);
            buildUI(); 
        }
    }
};

const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(m, u) {
    this.addEventListener('load', function() {
        try { processResponse(u, JSON.parse(this.responseText), this.status); } catch (e) {}
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

function runTimerEngine() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (window.location.href !== localStorage.getItem('ciko_last_url')) {
            localStorage.removeItem('ciko_timer_end');
            localStorage.removeItem('ciko_last_url');
            location.reload();
            return;
        }

        const endTime = localStorage.getItem('ciko_timer_end');
        if (!endTime) return;

        const remaining = endTime - Date.now();
        const display = document.getElementById('timer-num');
        if (display) display.innerText = format(remaining);

        if (remaining <= 10000 && remaining > 0 && !audioPlayedFinal) {
            if (!isMutedGlobal) {
                const s = SOUND_LIBRARY[Math.floor(Math.random() * SOUND_LIBRARY.length)];
                currentAudio.src = s.url;
                currentAudio.play();
                document.getElementById('stop-sound-ani').style.display = 'block';
            }
            audioPlayedFinal = true;
            document.getElementById('cyber-timer-wrapper').classList.add('critical');
        }

        if (remaining <= 0) {
            clearInterval(timerInterval);
            if (display) display.innerText = "DONE";
            document.getElementById('cyber-timer-wrapper').classList.remove('critical');
        }
    }, 1000);
}

// Bootstrapper
if (localStorage.getItem('ciko_timer_end')) buildUI();