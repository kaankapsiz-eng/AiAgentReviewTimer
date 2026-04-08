(function () {
    'use strict';

    const LOG_PREFIX = '[Ciko-Core]';

    console.log('%c[Ciko-Assets] Yükleme başladı...', 'color: #ff00ff; font-weight: bold;');

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

    console.log('%c[Ciko-Assets] Kütüphaneler tanımlandı.', 'color: #ff00ff;');

    const CACHE_KEYS = {
        activeReviewId: 'ciko_ai_reviewer_active_review_id',
        username: 'ciko_ai_reviewer_username',
        sessionStartedAt: 'ciko_ai_reviewer_session_started_at',
        autoResolveThresholdSeconds: 'ciko_ai_reviewer_auto_resolve_threshold_seconds',
        endTimestamp: 'ciko_ai_reviewer_end_timestamp',
        soundMilestones: 'ciko_ai_reviewer_sound_milestones',
        libraryPreference: 'ciko_lib_pref',
        isMuted: 'cyberTimerMuted'
    };

    const ROUTE_PREFIX = '/admn/ai-review-tool';
    const REVIEWER_STATUS_PATH = '/API/ai-reviewer/reviewer-status';
    const PROJECT_ALL_PATH = '/API/ai-reviewer/project/ALL/';
    const TIMER_WRAPPER_ID = 'cyber-timer-wrapper';
    const TIMER_STYLE_ID = 'cyber-style';

    const runtimeState = {
        currentReviewId: null,
        currentAudioInstance: null,
        timerIntervalId: null,
        routeSyncTimeoutId: null,
        uiEnsureIntervalId: null,
        lastSelectedVisualAsset: null,
        currentThemeColor: '#00ff41',
        hasPlayedCompletionSound: false,
        isMutedGlobal: localStorage.getItem(CACHE_KEYS.isMuted) === 'true',
        userLibraryPreference: localStorage.getItem(CACHE_KEYS.libraryPreference) || 'ALL',
        areNetworkInterceptorsInstalled: false,
        areRouteListenersInstalled: false,
        bootstrapStartedAt: Date.now()
    };

    function logInfo(message, payload) {
        if (payload !== undefined) {
            console.log(`%c${LOG_PREFIX} ${message}`, 'color: #00ff41; font-weight: bold;', payload);
            return;
        }
        console.log(`%c${LOG_PREFIX} ${message}`, 'color: #00ff41; font-weight: bold;');
    }

    function logWarn(message, payload) {
        if (payload !== undefined) {
            console.warn(`%c${LOG_PREFIX} ${message}`, 'color: #fff000; font-weight: bold;', payload);
            return;
        }
        console.warn(`%c${LOG_PREFIX} ${message}`, 'color: #fff000; font-weight: bold;');
    }

    function logError(message, payload) {
        if (payload !== undefined) {
            console.error(`%c${LOG_PREFIX} ${message}`, 'color: #ff003c; font-weight: bold;', payload);
            return;
        }
        console.error(`%c${LOG_PREFIX} ${message}`, 'color: #ff003c; font-weight: bold;');
    }

    function isAiReviewToolPage() {
        return window.location.pathname.includes(ROUTE_PREFIX);
    }

    function getCurrentReviewIdFromLocation() {
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        const aiReviewToolSegmentIndex = pathSegments.indexOf('ai-review-tool');

        if (aiReviewToolSegmentIndex === -1) {
            return null;
        }

        const segmentsAfterTool = pathSegments.slice(aiReviewToolSegmentIndex + 1);

        if (segmentsAfterTool.length < 2) {
            return null;
        }

        const possibleReviewId = segmentsAfterTool[1];

        if (!possibleReviewId || possibleReviewId === 'undefined' || possibleReviewId === 'null') {
            return null;
        }

        return possibleReviewId;
    }

    function safelyParseJson(textToParse) {
        try {
            return JSON.parse(textToParse);
        } catch (error) {
            return null;
        }
    }

    function normalizeUrlForMatching(urlLikeValue) {
        if (!urlLikeValue) {
            return '';
        }

        try {
            return new URL(urlLikeValue, window.location.origin).href;
        } catch (error) {
            return String(urlLikeValue);
        }
    }

    function getCachedNumber(cacheKeyName) {
        const numericValue = Number(localStorage.getItem(cacheKeyName) || 0);
        return Number.isFinite(numericValue) ? numericValue : 0;
    }

    function persistSessionStartedAtIfMissing() {
        // ESKİ: Sadece sayfada olmayı kontrol ediyordu.
        // YENİ: Hem sayfada olmalı hem de aktif bir review_id bulunmalı.
        const currentId = getCurrentReviewIdFromLocation();

        if (!isAiReviewToolPage() || !currentId) {
            return;
        }

        const existingSessionStartedAt = getCachedNumber(CACHE_KEYS.sessionStartedAt);
        if (existingSessionStartedAt) {
            return;
        }

        const sessionStartedAt = Date.now();
        localStorage.setItem(CACHE_KEYS.sessionStartedAt, String(sessionStartedAt));
        logInfo('AI Review Tool ve aktif Review tespit edildi. Session başlangıç timestamp alındı.', {
            reviewId: currentId,
            sessionStartedAt
        });
    }

    function resetSessionStartedAt() {
        localStorage.removeItem(CACHE_KEYS.sessionStartedAt);
        logInfo('Session başlangıç timestamp temizlendi.');
    }

    function removeTimerUi() {
        const timerWrapperElement = document.getElementById(TIMER_WRAPPER_ID);
        if (timerWrapperElement) {
            timerWrapperElement.remove();
        }
    }

    function stopTimerLoop() {
        if (runtimeState.timerIntervalId) {
            clearInterval(runtimeState.timerIntervalId);
            runtimeState.timerIntervalId = null;
        }
    }

    function stopCurrentAudioPlayback() {
        if (runtimeState.currentAudioInstance) {
            try {
                runtimeState.currentAudioInstance.pause();
                runtimeState.currentAudioInstance.currentTime = 0;
            } catch (error) {
                logWarn('Ses durdurulurken sorun oluştu.', error);
            }
            runtimeState.currentAudioInstance = null;
        }

        const stopSoundAnimationButton = document.getElementById('stop-sound-ani');
        if (stopSoundAnimationButton) {
            stopSoundAnimationButton.style.display = 'none';
        }
    }

    function clearReviewCache(reasonMessage) {
        localStorage.removeItem(CACHE_KEYS.activeReviewId);
        localStorage.removeItem(CACHE_KEYS.username);
        localStorage.removeItem(CACHE_KEYS.autoResolveThresholdSeconds);
        localStorage.removeItem(CACHE_KEYS.endTimestamp);
        localStorage.removeItem(CACHE_KEYS.soundMilestones);

        runtimeState.currentReviewId = null;
        runtimeState.hasPlayedCompletionSound = false;
        runtimeState.lastSelectedVisualAsset = null;

        stopTimerLoop();
        stopCurrentAudioPlayback();
        removeTimerUi();

        if (reasonMessage) {
            logInfo(`Review cache temizlendi: ${reasonMessage}`);
        }
    }

    function getStoredSoundMilestones() {
        try {
            const parsedValue = JSON.parse(localStorage.getItem(CACHE_KEYS.soundMilestones) || '[]');
            return Array.isArray(parsedValue) ? parsedValue : [];
        } catch (error) {
            return [];
        }
    }

    function hasPlayedMilestone(milestoneKey) {
        return getStoredSoundMilestones().includes(milestoneKey);
    }

    function persistSoundMilestone(milestoneKey) {
        const alreadyPlayedMilestones = getStoredSoundMilestones();
        if (!alreadyPlayedMilestones.includes(milestoneKey)) {
            alreadyPlayedMilestones.push(milestoneKey);
            localStorage.setItem(CACHE_KEYS.soundMilestones, JSON.stringify(alreadyPlayedMilestones));
        }
    }

    function selectVisualAssetForCurrentPreference() {
        if (runtimeState.userLibraryPreference === 'PODO') {
            return { url: PODO_IMG, color: '#007bff' };
        }

        const randomIndex = Math.floor(Math.random() * IMAGE_LIBRARY.length);
        return IMAGE_LIBRARY[randomIndex];
    }

    function getOrCreateVisualAsset() {
        if (runtimeState.lastSelectedVisualAsset) {
            return runtimeState.lastSelectedVisualAsset;
        }

        runtimeState.lastSelectedVisualAsset = selectVisualAssetForCurrentPreference();
        return runtimeState.lastSelectedVisualAsset;
    }

    function renderStyles() {
        const selectedVisualAsset = getOrCreateVisualAsset();
        runtimeState.currentThemeColor = selectedVisualAsset.color;

        let styleElement = document.getElementById(TIMER_STYLE_ID);
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = TIMER_STYLE_ID;
            document.head.appendChild(styleElement);
        }

        styleElement.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
            #${TIMER_WRAPPER_ID} {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                position: relative;
                margin-right: 25px;
                z-index: 9999;
                font-family: 'Share Tech Mono', monospace;
            }
            #cyber-main-container {
                display: flex;
                align-items: center;
            }
            #cyber-mute-btn {
                width: 34px;
                height: 34px;
                cursor: pointer;
                margin-right: 15px;
                border: 2px solid ${runtimeState.currentThemeColor};
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #000;
                position: relative;
                overflow: hidden;
                box-sizing: border-box;
                flex-shrink: 0;
            }
            #cyber-mute-btn svg {
                width: 18px;
                fill: ${runtimeState.currentThemeColor};
            }
            #cyber-mute-btn.muted::after {
                content: '';
                position: absolute;
                width: 2px;
                height: 25px;
                background: ${runtimeState.currentThemeColor};
                transform: rotate(45deg);
            }
            #cyber-timer-box {
                display: flex;
                align-items: center;
                justify-content: center;
                background: #000;
                border: 2px solid ${runtimeState.currentThemeColor};
                border-radius: 4px;
                padding: 0 45px 0 20px;
                height: 40px;
                min-width: 130px;
                box-shadow: 0 0 15px ${runtimeState.currentThemeColor}44;
                position: relative;
                box-sizing: border-box;
            }
            #timer-num {
                font-size: 26px;
                color: ${runtimeState.currentThemeColor};
                text-shadow: 0 0 10px ${runtimeState.currentThemeColor};
                font-weight: bold;
            }
            #timer-img {
                position: absolute;
                right: -15px;
                bottom: -5px;
                width: 52px;
                height: 52px;
                object-fit: cover;
                border-radius: 6px;
                border: 2px solid ${runtimeState.currentThemeColor};
                background: #000;
                box-sizing: border-box;
            }
            #stop-sound-ani {
                position: absolute;
                top: -22px;
                left: 50%;
                transform: translateX(-50%);
                background: #ff003c;
                color: #fff;
                border: none;
                font-size: 10px;
                padding: 2px 8px;
                cursor: pointer;
                display: none;
                border-radius: 2px;
                font-weight: bold;
            }
            #lib-switcher {
                width: 70px;
                background: #000;
                color: ${runtimeState.currentThemeColor};
                font-size: 9px;
                text-align: center;
                cursor: pointer;
                border: 1px solid ${runtimeState.currentThemeColor};
                border-top: none;
                padding: 1px 0;
                opacity: 0.7;
                transition: 0.3s;
                border-bottom-left-radius: 4px;
                border-bottom-right-radius: 4px;
                margin-left: 5px;
                user-select: none;
                box-sizing: border-box;
            }
            #lib-switcher:hover {
                opacity: 1;
                background: #111;
                text-shadow: 0 0 5px ${runtimeState.currentThemeColor};
            }
            #${TIMER_WRAPPER_ID}.critical #cyber-timer-box,
            #${TIMER_WRAPPER_ID}.critical #lib-switcher {
                border-color: #ff003c !important;
            }
            #${TIMER_WRAPPER_ID}.critical #timer-num {
                color: #ff003c !important;
            }
            #${TIMER_WRAPPER_ID}.critical #timer-img {
                border-color: #ff003c !important;
            }
            #${TIMER_WRAPPER_ID}.critical #lib-switcher {
                color: #ff003c !important;
            }
        `;
    }

    function buildUi() {
        if (!runtimeState.currentReviewId) {
            return;
        }

        if (document.getElementById(TIMER_WRAPPER_ID)) {
            return;
        }

        const targetSelectors = [
            '.flex.items-center.gap-4 .flex.items-center.gap-2.relative',
            '.flex.items-center.gap-3.relative',
            'header .flex.items-center.gap-4',
            '[class*="Header"] [class*="Container"]'
        ];

        let targetElement = null;
        for (const selector of targetSelectors) {
            targetElement = document.querySelector(selector);
            if (targetElement) {
                break;
            }
        }

        if (!targetElement || !targetElement.parentNode) {
            return;
        }

        logInfo('Sayaç ilk kez kuruluyor...');

        renderStyles();
        const selectedVisualAsset = getOrCreateVisualAsset();

        const wrapperElement = document.createElement('div');
        wrapperElement.id = TIMER_WRAPPER_ID;
        wrapperElement.innerHTML = `
            <div id="cyber-main-container">
                <div id="cyber-mute-btn" title="Mute / Unmute">
                    <svg viewBox="0 0 24 24">
                        <path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.03C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/>
                    </svg>
                </div>
                <div style="position: relative; display: flex; flex-direction: column;">
                    <div id="cyber-timer-box">
                        <button id="stop-sound-ani">MUTE</button>
                        <span id="timer-num">--:--</span>
                        <img id="timer-img" src="${selectedVisualAsset.url}" alt="timer-asset">
                    </div>
                    <div id="lib-switcher">LIB: ${runtimeState.userLibraryPreference}</div>
                </div>
            </div>
        `;

        targetElement.parentNode.insertBefore(wrapperElement, targetElement);

        const muteButtonElement = document.getElementById('cyber-mute-btn');
        const stopSoundAnimationButton = document.getElementById('stop-sound-ani');
        const librarySwitcherElement = document.getElementById('lib-switcher');

        if (muteButtonElement) {
            muteButtonElement.onclick = function () {
                runtimeState.isMutedGlobal = !runtimeState.isMutedGlobal;
                localStorage.setItem(CACHE_KEYS.isMuted, String(runtimeState.isMutedGlobal));
                muteButtonElement.classList.toggle('muted', runtimeState.isMutedGlobal);

                if (runtimeState.isMutedGlobal) {
                    stopCurrentAudioPlayback();
                }
            };

            if (runtimeState.isMutedGlobal) {
                muteButtonElement.classList.add('muted');
            }
        }

        if (stopSoundAnimationButton) {
            stopSoundAnimationButton.onclick = function () {
                stopCurrentAudioPlayback();
            };
        }

        if (librarySwitcherElement) {
            librarySwitcherElement.onclick = function () {
                runtimeState.userLibraryPreference = runtimeState.userLibraryPreference === 'ALL' ? 'PODO' : 'ALL';
                runtimeState.lastSelectedVisualAsset = null;
                localStorage.setItem(CACHE_KEYS.libraryPreference, runtimeState.userLibraryPreference);
                location.reload();
            };
        }
    }

    function formatRemainingMilliseconds(remainingMilliseconds) {
        const safeMilliseconds = Math.max(0, remainingMilliseconds);
        const remainingTotalSeconds = Math.floor(safeMilliseconds / 1000);
        const remainingMinutes = Math.floor(remainingTotalSeconds / 60);
        const remainingSeconds = remainingTotalSeconds % 60;

        return `${String(remainingMinutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    function playRandomSound(soundReason) {
        if (runtimeState.isMutedGlobal) {
            return;
        }

        stopCurrentAudioPlayback();

        const randomSoundIndex = Math.floor(Math.random() * SOUND_LIBRARY.length);
        const selectedSound = SOUND_LIBRARY[randomSoundIndex];
        const audioInstance = new Audio(selectedSound.url);

        audioInstance.volume = 0.7;
        runtimeState.currentAudioInstance = audioInstance;

        const stopSoundAnimationButton = document.getElementById('stop-sound-ani');
        if (stopSoundAnimationButton) {
            stopSoundAnimationButton.style.display = 'block';
        }

        audioInstance.onended = function () {
            if (stopSoundAnimationButton) {
                stopSoundAnimationButton.style.display = 'none';
            }
            runtimeState.currentAudioInstance = null;
        };

        audioInstance.onerror = function (error) {
            logWarn('Ses oynatılırken hata oluştu.', { soundReason, selectedSound, error });
            if (stopSoundAnimationButton) {
                stopSoundAnimationButton.style.display = 'none';
            }
            runtimeState.currentAudioInstance = null;
        };

        audioInstance.play().then(function () {
            logInfo('Ses çalındı.', { soundReason, sound: selectedSound.name });
        }).catch(function (error) {
            logWarn('Ses autoplay tarafından engellendi veya oynatılamadı.', { soundReason, error });
            if (stopSoundAnimationButton) {
                stopSoundAnimationButton.style.display = 'none';
            }
            runtimeState.currentAudioInstance = null;
        });
    }

    function updateTimerUi() {
        const timerNumberElement = document.getElementById('timer-num');
        const timerWrapperElement = document.getElementById(TIMER_WRAPPER_ID);
        const cachedEndTimestamp = getCachedNumber(CACHE_KEYS.endTimestamp);

        if (!timerNumberElement || !timerWrapperElement || !cachedEndTimestamp) {
            return;
        }

        const remainingMilliseconds = cachedEndTimestamp - Date.now();
        timerNumberElement.textContent = formatRemainingMilliseconds(remainingMilliseconds);
        timerWrapperElement.classList.toggle('critical', remainingMilliseconds <= 30000);

        const remainingSeconds = Math.max(0, Math.ceil(remainingMilliseconds / 1000));

        if (remainingSeconds <= 60 && !hasPlayedMilestone('under_60_seconds')) {
            persistSoundMilestone('under_60_seconds');
            playRandomSound('under_60_seconds');
        }

        if (remainingSeconds <= 30 && !hasPlayedMilestone('under_30_seconds')) {
            persistSoundMilestone('under_30_seconds');
            playRandomSound('under_30_seconds');
        }

        if (remainingSeconds <= 10 && !hasPlayedMilestone('under_10_seconds')) {
            persistSoundMilestone('under_10_seconds');
            playRandomSound('under_10_seconds');
        }

        if (remainingMilliseconds <= 0 && !runtimeState.hasPlayedCompletionSound) {
            runtimeState.hasPlayedCompletionSound = true;
            persistSoundMilestone('completed');
            playRandomSound('completed');
            logWarn('Timer süresi doldu.');
        }
    }

    function startTimerLoopIfReady() {
        const cachedEndTimestamp = getCachedNumber(CACHE_KEYS.endTimestamp);
        if (!runtimeState.currentReviewId || !cachedEndTimestamp) {
            return;
        }

        stopTimerLoop();
        updateTimerUi();
        runtimeState.timerIntervalId = window.setInterval(updateTimerUi, 250);
    }

    function ensureUiAndTimerLoop() {
        if (!runtimeState.currentReviewId) {
            return;
        }

        buildUi();
        startTimerLoopIfReady();

        if (!runtimeState.uiEnsureIntervalId) {
            runtimeState.uiEnsureIntervalId = window.setInterval(function () {
                if (!runtimeState.currentReviewId) {
                    return;
                }

                if (!document.getElementById(TIMER_WRAPPER_ID)) {
                    buildUi();
                }

                if (!runtimeState.timerIntervalId && getCachedNumber(CACHE_KEYS.endTimestamp)) {
                    startTimerLoopIfReady();
                }
            }, 500);
        }
    }

    function computeAndPersistEndTimestamp(autoResolveThresholdSeconds) {
        const sessionStartedAt = getCachedNumber(CACHE_KEYS.sessionStartedAt);
        const thresholdAsNumber = Number(autoResolveThresholdSeconds);

        if (!sessionStartedAt) {
            logWarn('Session başlangıç timestamp bulunamadı. End time hesaplanamadı.');
            return;
        }

        if (!Number.isFinite(thresholdAsNumber) || thresholdAsNumber <= 0) {
            logWarn('auto_resolve_threshold geçersiz geldi.', { autoResolveThresholdSeconds });
            return;
        }

        const computedEndTimestamp = sessionStartedAt + (thresholdAsNumber * 1000);
        localStorage.setItem(CACHE_KEYS.autoResolveThresholdSeconds, String(thresholdAsNumber));
        localStorage.setItem(CACHE_KEYS.endTimestamp, String(computedEndTimestamp));
        runtimeState.hasPlayedCompletionSound = false;

        logInfo('End timestamp hesaplandı ve cache’e yazıldı.', {
            sessionStartedAt,
            thresholdAsNumber,
            computedEndTimestamp
        });

        ensureUiAndTimerLoop();
    }

    function handleReviewerStatusPayload(payload) {
        if (!runtimeState.currentReviewId) {
            logInfo('reviewer-status yakalandı ama aktif review yok. İşlem yapılmadı.');
            return;
        }

        if (!payload || payload.responseCode !== 200) {
            logWarn('reviewer-status 200 dönmedi. İşlem yapılmadı.', payload);
            return;
        }

        const reviewerUsername = payload && payload.content && payload.content.username;
        if (!reviewerUsername) {
            logWarn('reviewer-status içinde username bulunamadı.', payload);
            return;
        }

        localStorage.setItem(CACHE_KEYS.username, reviewerUsername);
        logInfo('Username cache’e yazıldı.', { reviewerUsername });
    }

    function handleProjectPayload(payload) {
        if (!runtimeState.currentReviewId) {
            logInfo('project payload yakalandı ama aktif review yok. İşlem yapılmadı.');
            return;
        }

        if (!payload || payload.responseCode !== 200) {
            logWarn('project endpoint 200 dönmedi. İşlem yapılmadı.', payload);
            return;
        }

        const reviewEntries = payload && payload.content && Array.isArray(payload.content.reviews)
            ? payload.content.reviews
            : [];

        if (!reviewEntries.length) {
            logWarn('project endpoint 200 döndü ama reviews boş geldi.', payload);
            return;
        }

        const firstReviewEntry = reviewEntries[0];
        const autoResolveThreshold = firstReviewEntry && firstReviewEntry.project_settings
            ? firstReviewEntry.project_settings.auto_resolve_threshold
            : null;

        if (autoResolveThreshold === undefined || autoResolveThreshold === null) {
            logWarn('auto_resolve_threshold bulunamadı.', payload);
            return;
        }

        computeAndPersistEndTimestamp(autoResolveThreshold);
    }

    function inspectApiResponse(urlLikeValue, responsePayload) {
        const normalizedUrl = normalizeUrlForMatching(urlLikeValue);
        if (!normalizedUrl || !responsePayload) {
            return;
        }

        if (normalizedUrl.includes(REVIEWER_STATUS_PATH)) {
            handleReviewerStatusPayload(responsePayload);
            return;
        }

        if (normalizedUrl.includes(PROJECT_ALL_PATH)) {
            handleProjectPayload(responsePayload);
        }
    }

    function installFetchInterceptor() {
        const originalFetch = window.fetch;
        if (!originalFetch || originalFetch.__cikoWrapped) {
            return;
        }

        const wrappedFetch = async function () {
            const response = await originalFetch.apply(this, arguments);

            try {
                const requestUrl = typeof arguments[0] === 'string'
                    ? arguments[0]
                    : arguments[0] && arguments[0].url;
                const normalizedUrl = normalizeUrlForMatching(requestUrl);

                if (!normalizedUrl.includes(REVIEWER_STATUS_PATH) && !normalizedUrl.includes(PROJECT_ALL_PATH)) {
                    return response;
                }

                response.clone().text().then(function (responseText) {
                    const parsedPayload = safelyParseJson(responseText);
                    inspectApiResponse(normalizedUrl, parsedPayload);
                }).catch(function (error) {
                    logWarn('Fetch response parse edilemedi.', { normalizedUrl, error });
                });
            } catch (error) {
                logWarn('Fetch interceptor hata verdi.', error);
            }

            return response;
        };

        wrappedFetch.__cikoWrapped = true;
        window.fetch = wrappedFetch;
    }

    function installXmlHttpRequestInterceptor() {
        if (XMLHttpRequest.prototype.open.__cikoWrapped) {
            return;
        }

        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function (method, url) {
            this.__cikoRequestUrl = normalizeUrlForMatching(url);
            return originalOpen.apply(this, arguments);
        };

        XMLHttpRequest.prototype.send = function () {
            this.addEventListener('load', function () {
                try {
                    const requestUrl = this.__cikoRequestUrl || '';
                    if (!requestUrl.includes(REVIEWER_STATUS_PATH) && !requestUrl.includes(PROJECT_ALL_PATH)) {
                        return;
                    }

                    inspectApiResponse(requestUrl, safelyParseJson(this.responseText));
                } catch (error) {
                    logWarn('XHR interceptor hata verdi.', error);
                }
            }, { once: true });

            return originalSend.apply(this, arguments);
        };

        XMLHttpRequest.prototype.open.__cikoWrapped = true;
    }

    function installRouteWatchers() {
        if (runtimeState.areRouteListenersInstalled) {
            return;
        }

        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        function scheduleRouteSync() {
            clearTimeout(runtimeState.routeSyncTimeoutId);
            runtimeState.routeSyncTimeoutId = window.setTimeout(syncCurrentRouteState, 50);
        }

        history.pushState = function () {
            const result = originalPushState.apply(this, arguments);
            scheduleRouteSync();
            return result;
        };

        history.replaceState = function () {
            const result = originalReplaceState.apply(this, arguments);
            scheduleRouteSync();
            return result;
        };

        window.addEventListener('popstate', scheduleRouteSync);
        window.addEventListener('hashchange', scheduleRouteSync);

        runtimeState.areRouteListenersInstalled = true;
    }

    function initializeReviewContext(currentReviewId) {
        const previouslyCachedReviewId = localStorage.getItem(CACHE_KEYS.activeReviewId);

        if (!currentReviewId) {
            // Eğer URL'de review_id yoksa her şeyi temizle ve bekle.
            if (previouslyCachedReviewId) {
                clearReviewCache('URL üzerinde review_id kalmadı.');
            } else {
                stopTimerLoop();
                removeTimerUi();
            }

            // Burası kritik: ID yoksa timestamp'i siliyoruz ki yeni review'da sıfırdan başlasın.
            resetSessionStartedAt();
            return;
        }

        // Eğer yeni bir review'a geçildiyse (ID değiştiyse)
        if (previouslyCachedReviewId && previouslyCachedReviewId !== currentReviewId) {
            clearReviewCache(`Review değişti. Eski: ${previouslyCachedReviewId}, Yeni: ${currentReviewId}`);
            resetSessionStartedAt();
        }

        // Sadece geçerli bir review_id varken timestamp oluştur.
        if (!getCachedNumber(CACHE_KEYS.sessionStartedAt)) {
            const now = Date.now();
            localStorage.setItem(CACHE_KEYS.sessionStartedAt, String(now));
            logInfo('Aktif review için yeni session timestamp oluşturuldu.', { currentReviewId, now });
        }

        localStorage.setItem(CACHE_KEYS.activeReviewId, currentReviewId);
        runtimeState.currentReviewId = currentReviewId;

        logInfo('Aktif review context hazırlandı.', { currentReviewId });
        ensureUiAndTimerLoop();
    }

    function syncCurrentRouteState() {
        persistSessionStartedAtIfMissing();

        const detectedReviewId = getCurrentReviewIdFromLocation();
        if (!detectedReviewId) {
            initializeReviewContext(null);
            return;
        }

        if (runtimeState.currentReviewId !== detectedReviewId) {
            logInfo('Yeni review_id tespit edildi.', { detectedReviewId });
        }

        initializeReviewContext(detectedReviewId);
    }

    function installNetworkInterceptors() {
        if (runtimeState.areNetworkInterceptorsInstalled) {
            return;
        }

        installFetchInterceptor();
        installXmlHttpRequestInterceptor();
        runtimeState.areNetworkInterceptorsInstalled = true;
        logInfo('Fetch ve XHR dinleyicileri kuruldu.');
    }

    function bootstrap() {
        logInfo('Bootstrap başladı.', { bootstrapStartedAt: runtimeState.bootstrapStartedAt });

        installNetworkInterceptors();
        installRouteWatchers();
        syncCurrentRouteState();

        document.addEventListener('DOMContentLoaded', function () {
            logInfo('DOMContentLoaded tetiklendi.');
            syncCurrentRouteState();
            ensureUiAndTimerLoop();
        });

        window.setInterval(function () {
            if (!isAiReviewToolPage()) {
                return;
            }

            const liveReviewId = getCurrentReviewIdFromLocation();
            const cachedReviewId = localStorage.getItem(CACHE_KEYS.activeReviewId);

            if (liveReviewId !== cachedReviewId) {
                syncCurrentRouteState();
                return;
            }

            if (liveReviewId && !document.getElementById(TIMER_WRAPPER_ID)) {
                buildUi();
            }
        }, 1000);
    }

    bootstrap();
})();
