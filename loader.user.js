// ==UserScript==
// @name         Ciko AI Reviewer - Live Loader
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  GitHub'dan core.js'i her seferinde en güncel haliyle çeker ve çalıştırır.
// @author       Ciko
// @match        https://*.jotform.com/admn/ai-review-tool/*
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/kaankapsiz-eng/AiAgentReviewTimer/refs/heads/feat/AiAgentReviewTimer/init/core.js';

    console.log('%c[Ciko-Loader] GitHub\'dan güncel kod çekiliyor...', 'color: #00ffff; font-weight: bold;');

    GM_xmlhttpRequest({
        method: 'GET',
        url: `${GITHUB_RAW_URL}?nocache=${Date.now()}`,
        onload: function (response) {
            if (response.status !== 200) {
                console.error('[Ciko-Loader] GitHub raw dosyasına ulaşılamadı. HTTP Status:', response.status);
                return;
            }

            try {
                eval(response.responseText);
                console.log('%c[Ciko-Loader] core.js başarıyla enjekte edildi ve çalışıyor!', 'color: #00ff41; font-weight: bold;');
            } catch (error) {
                console.error('[Ciko-Loader] Kod çalıştırılırken hata oluştu:', error);
            }
        },
        onerror: function (error) {
            console.error('[Ciko-Loader] İstek atılamadı:', error);
        }
    });
})();
