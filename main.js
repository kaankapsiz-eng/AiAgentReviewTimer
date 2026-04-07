// main.js

(async function() {
    const GITHUB_BASE = "https://raw.githubusercontent.com/kaankapsiz-eng/AiAgentReviewTimer/main/";
    const files = ["assets.js", "core.js"];

    for (const file of files) {
        const response = await fetch(GITHUB_BASE + file + "?t=" + Date.now());
        const code = await response.text();
        const script = document.createElement('script');
        script.textContent = code;
        document.head.appendChild(script);
    }
    
    console.log("%c[Main] Bütün parçalar birleşti, sistem aktif.", "color: #00ff41; font-weight: bold;");
})();