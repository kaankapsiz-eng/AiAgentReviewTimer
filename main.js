// GitHub'daki main.js içeriği
(async function() {
    // BASE_URL'i branch ismine göre tam olarak tanımlıyoruz
    const BASE_URL = "https://raw.githubusercontent.com/kaankapsiz-eng/AiAgentReviewTimer/feat/AiAgentReviewTimer/init/";
    const files = ["assets.js", "core.js"];

    console.log("%c[Ciko-Main] Logic ve Assetler yükleniyor...", "color: #fff000;");

    for (const file of files) {
        try {
            const response = await fetch(BASE_URL + file + "?t=" + Date.now());
            if (!response.ok) throw new Error(`${file} bulunamadı! Status: ${response.status}`);
            
            const code = await response.text();
            
            // Kodları sayfaya basıyoruz
            const script = document.createElement('script');
            script.textContent = code;
            document.head.appendChild(script);
            
            console.log(`%c[Ciko-Main] ✅ ${file} aktif.`, "color: #00ff41;");
        } catch (err) {
            console.error("[Ciko-Main] Kritik hata:", err);
        }
    }
    console.log("%c[Ciko-Main] Sistem %100 online.", "color: #00ff41; font-weight: bold;");
})();