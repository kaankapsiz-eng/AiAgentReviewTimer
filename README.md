# Ciko AI Reviewer - Live Loader

Minimal repo yapısı:

```text
ciko-ai-reviewer-live-loader/
├── README.md
├── ARCHITECTURE.md
├── loader.user.js
└── init/
    └── core.js
```

## Ne yapıyor

`loader.user.js`, GitHub raw link üzerinden `init/core.js` dosyasını her sayfa açılışında en güncel haliyle çeker ve çalıştırır.

`init/core.js` şu akışı izler:

- `/admn/ai-review-tool/` açılınca session başlangıç timestamp alır
- URL içinden `review_id` tespit eder
- `review_id` yoksa review cache temizlenir ve timer UI kaldırılır
- `reviewer-status` cevabından `username` alınır
- `/API/ai-reviewer/project/ALL/{username}` cevabından `auto_resolve_threshold` alınır
- `sessionStart + auto_resolve_threshold` ile `endTimestamp` hesaplanır
- Header içine timer UI basılır
- Route değiştiğinde, review değiştiğinde veya URL'den review kalktığında cache temizlenir
- `fetch`, `XMLHttpRequest`, `pushState`, `replaceState`, `popstate` ve `hashchange` dinlenir

## Kurulum

Repo'yu GitHub'a koy.

Ardından `loader.user.js` içindeki şu alanı kendi raw link'inle değiştir:

```js
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/<USER>/<REPO>/<BRANCH>/init/core.js';
```

Sonra Tampermonkey'e sadece `loader.user.js` script'ini ekle.

## Notlar

- Yapı bilerek küçük tutuldu
- UI sadece `review_id` bulunan route'larda görünür
- Sesler mute edilebilir
- `LIB: ALL / PODO` seçimi localStorage ile hatırlanır
- Style her UI kurulumunda aktif asset rengine göre yeniden yazılır
