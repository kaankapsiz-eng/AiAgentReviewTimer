// GitHub -> main.js
(async function() {
    const BASE_URL = "https://raw.githubusercontent.com/kaankapsiz-eng/AiAgentReviewTimer/feat/AiAgentReviewTimer/init/";
    const files = ["assets.js", "core.js"];

    console.log("%c[Ciko-Main] 🛠️ Hibrit motor başlatılıyor...", "color: #fff000; font-weight: bold;");

    try {
        let megaCode = "";

        for (const file of files) {
            // Cache'i delmek için her seferinde farklı URL (?t=...)
            const response = await fetch(BASE_URL + file + "?t=" + Date.now());
            if (!response.ok) throw new Error(`${file} indirilemedi!`);
            
            const code = await response.text();
            megaCode += `\n/* --- Start of ${file} --- */\n` + code + `\n/* --- End of ${file} --- */\n`;
            console.log(`%c[Ciko-Main] 📦 ${file} paketlendi.`, "color: #00ff41;");
        }

        // Bütün kodu tek seferde enjekte et
        const script = document.createElement('script');
        script.textContent = megaCode;
        document.head.appendChild(script);
        
        console.log("%c[Ciko-Main] 🚀 TÜM SİSTEM ATEŞLENDİ!", "color: #00ff41; font-weight: bold; text-shadow: 0 0 10px #00ff41;");

    } catch (err) {
        console.error("[Ciko-Main] ❌ Kritik hata:", err);
    }
})();