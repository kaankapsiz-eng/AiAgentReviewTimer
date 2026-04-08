(function () {
    'use strict';

    console.log('%c[Ciko-Core] Init...', 'color:#00ff41');

    // ======================
    // ASSETS
    // ======================

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
        { name: 'DEXTER', url: 'https://www.myinstants.com/media/sounds/dexter-meme.mp3' }
    ];

    // ======================
    // CACHE KEYS
    // ======================

    const K = {
        reviewId: 'ciko_review_id',
        username: 'ciko_username',
        sessionStart: 'ciko_session_start',
        threshold: 'ciko_threshold',
        end: 'ciko_end',
        milestones: 'ciko_milestones',
        muted: 'ciko_muted',
        lib: 'ciko_lib'
    };

    // ======================
    // STATE
    // ======================

    let currentReviewId = null;
    let timer = null;
    let currentAudio = null;
    let hasFinished = false;

    let isMuted = localStorage.getItem(K.muted) === 'true';
    let libPref = localStorage.getItem(K.lib) || 'ALL';

    let themeColor = '#00ff41';
    let selectedAsset = null;

    // ======================
    // HELPERS
    // ======================

    const log = (...a) => console.log('%c[Ciko]', 'color:#00ff41', ...a);
    const warn = (...a) => console.warn('%c[Ciko]', 'color:#fff000', ...a);

    const num = k => Number(localStorage.getItem(k) || 0);

    const parseJSON = t => {
        try { return JSON.parse(t); } catch { return null; }
    };

    // ======================
    // REVIEW DETECT
    // ======================

    function getReviewId() {
        const parts = location.pathname.split('/').filter(Boolean);
        const idx = parts.indexOf('ai-review-tool');
        if (idx === -1) return null;
        return parts[idx + 2] || null;
    }

    // ======================
    // SESSION LOGIC (FIXED)
    // ======================

    function ensureSession(reviewId) {
        if (!reviewId) return;

        const cachedReview = localStorage.getItem(K.reviewId);
        const existing = num(K.sessionStart);

        if (!existing) {
            const now = Date.now();
            localStorage.setItem(K.sessionStart, now);
            log('Session START (first review)', reviewId);
            return;
        }

        if (cachedReview && cachedReview !== reviewId) {
            const now = Date.now();
            localStorage.setItem(K.sessionStart, now);
            log('Session RESET (review changed)', reviewId);
        }
    }

    function clearAll(reason) {
        log('CLEAR:', reason);

        Object.values(K).forEach(k => localStorage.removeItem(k));

        clearInterval(timer);
        timer = null;

        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }

        document.getElementById('cyber-timer-wrapper')?.remove();

        hasFinished = false;
        selectedAsset = null;
    }

    // ======================
    // NETWORK INTERCEPT
    // ======================

    function handleResponse(url, data) {

        if (!currentReviewId) return;

        if (url.includes('reviewer-status')) {

            if (data?.responseCode !== 200) {
                warn('status != 200');
                return;
            }

            const username = data?.content?.username;
            if (username) {
                localStorage.setItem(K.username, username);
                log('username cached:', username);
            }
        }

        if (url.includes('/project/ALL/')) {

            if (data?.responseCode !== 200) {
                warn('project != 200');
                return;
            }

            const t = data?.content?.reviews?.[0]?.project_settings?.auto_resolve_threshold;

            if (!t) {
                warn('threshold missing');
                return;
            }

            const start = num(K.sessionStart);
            if (!start) {
                warn('NO SESSION → skip timer');
                return;
            }

            const end = start + (Number(t) * 1000);

            localStorage.setItem(K.threshold, t);
            localStorage.setItem(K.end, end);

            log('END SET:', new Date(end));

            startTimer();
        }
    }

    function patchFetch() {
        const orig = fetch;
        window.fetch = async function () {
            const res = await orig.apply(this, arguments);
            try {
                const url = arguments[0]?.url || arguments[0];
                if (!url.includes('/ai-reviewer/')) return res;

                res.clone().text().then(t => {
                    handleResponse(url, parseJSON(t));
                });
            } catch { }
            return res;
        };
    }

    function patchXHR() {
        const open = XMLHttpRequest.prototype.open;

        XMLHttpRequest.prototype.open = function (m, url) {
            this._url = url;
            this.addEventListener('load', () => {
                if (!url.includes('/ai-reviewer/')) return;
                handleResponse(url, parseJSON(this.responseText));
            });
            return open.apply(this, arguments);
        };
    }

    // ======================
    // UI
    // ======================

    function pickAsset() {
        if (selectedAsset) return selectedAsset;

        selectedAsset = libPref === 'PODO'
            ? { url: PODO_IMG, color: '#007bff' }
            : IMAGE_LIBRARY[Math.floor(Math.random() * IMAGE_LIBRARY.length)];

        themeColor = selectedAsset.color;
        return selectedAsset;
    }

    function buildUI() {

        if (document.getElementById('cyber-timer-wrapper')) return;

        const target = document.querySelector('header');
        if (!target) return;

        const a = pickAsset();

        const el = document.createElement('div');
        el.id = 'cyber-timer-wrapper';
        el.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;">
                <button id="mute">🔊</button>
                <span id="t">--:--</span>
                <img src="${a.url}" style="width:40px;">
            </div>
        `;

        target.appendChild(el);

        document.getElementById('mute').onclick = () => {
            isMuted = !isMuted;
            localStorage.setItem(K.muted, isMuted);
        };
    }

    // ======================
    // SOUND
    // ======================

    function play() {
        if (isMuted) return;

        if (currentAudio) currentAudio.pause();

        const s = SOUND_LIBRARY[Math.floor(Math.random() * SOUND_LIBRARY.length)];
        currentAudio = new Audio(s.url);
        currentAudio.play().catch(() => { });
    }

    // ======================
    // TIMER
    // ======================

    function fmt(ms) {
        const s = Math.max(0, Math.floor(ms / 1000));
        return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    }

    function startTimer() {
        if (timer) return;

        timer = setInterval(() => {
            const end = num(K.end);
            if (!end) return;

            const diff = end - Date.now();

            document.getElementById('t')?.textContent = fmt(diff);

            if (diff < 30000) document.getElementById('cyber-timer-wrapper')?.classList.add('critical');

            if (diff <= 0 && !hasFinished) {
                hasFinished = true;
                play();
                log('FINISHED');
            }

        }, 250);
    }

    // ======================
    // ROUTE
    // ======================

    function sync() {
        const rid = getReviewId();

        if (!rid) {
            if (currentReviewId) clearAll('no review');
            currentReviewId = null;
            return;
        }

        if (currentReviewId !== rid) {
            clearAll('new review');
            currentReviewId = rid;

            localStorage.setItem(K.reviewId, rid);
            ensureSession(rid);

            buildUI();
        }
    }

    function watchRoute() {
        const push = history.pushState;
        history.pushState = function () {
            push.apply(this, arguments);
            setTimeout(sync, 50);
        };
        window.addEventListener('popstate', sync);
    }

    // ======================
    // INIT
    // ======================

    function init() {
        patchFetch();
        patchXHR();
        watchRoute();

        setInterval(sync, 1000);
        sync();

        log('READY');
    }

    init();

})();