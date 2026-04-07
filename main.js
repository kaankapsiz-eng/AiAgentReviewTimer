// GitHub'daki main.js
(async function() {
    const BASE_URL = "https://raw.githubusercontent.com/kaankapsiz-eng/AiAgentReviewTimer/feat/AiAgentReviewTimer/init/";
    const files = ["assets.js", "core.js"];

    console.log("%c[Ciko-Main] Parçalar getiriliyor...", "color: #fff000;");

    for (const file of files) {
        try {
            const response = await fetch(BASE_URL + file + "?t=" + Date.now());
            if (!response.ok) throw new Error(`${file} yüklenemedi!`);
            
            const code = await response.text();
            
            // Kodları enjekte et
            const script = document.createElement('script');
            script.textContent = code;
            document.head.appendChild(script);
            
            console.log(`%c[Ciko-Main] ✅ ${file} sisteme dahil edildi.`, "color: #00ff41;");
        } catch (err) {
            console.error("[Ciko-Main] Hata:", err);
        }
    }
    console.log("%c[Ciko-Main] Tüm sistem online!", "color: #00ff41; font-weight: bold; text-shadow: 0 0 10px #00ff41;");
})();