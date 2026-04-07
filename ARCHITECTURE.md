# Architecture

## Dosyalar

### `loader.user.js`
Tampermonkey tarafındaki tek giriş noktasıdır. GitHub raw üzerinden `core.js` dosyasını çeker ve `eval` ile çalıştırır.

### `init/core.js`
Tüm runtime mantığı burada bulunur.

## Runtime akışı

### Route tespiti
Kod yalnızca `admn/ai-review-tool` altında çalışır. Path içinden ikinci segment olarak `review_id` okunur:

```text
/admn/ai-review-tool/<tool-name>/<review_id>
```

Örnek:

```text
/admn/ai-review-tool/report-assistant/019d67f53be07cf5bdc2718adf374e98e391
```

### Cache mantığı
Kullanılan localStorage anahtarları:

- `ciko_ai_reviewer_active_review_id`
- `ciko_ai_reviewer_username`
- `ciko_ai_reviewer_session_started_at`
- `ciko_ai_reviewer_auto_resolve_threshold_seconds`
- `ciko_ai_reviewer_end_timestamp`
- `ciko_ai_reviewer_sound_milestones`
- `ciko_lib_pref`
- `cyberTimerMuted`

### Network dinleme
İki endpoint dinlenir:

- `/API/ai-reviewer/reviewer-status`
- `/API/ai-reviewer/project/ALL/{username}`

Hem `fetch` hem de `XMLHttpRequest` patch edilir.

### Timer hesaplama
Bitiş zamanı şu formülle üretilir:

```text
endTimestamp = sessionStartedAt + auto_resolve_threshold * 1000
```

Sayaç kalan süreyi bu `endTimestamp` üzerinden hesaplar.

### UI akışı
Timer header'a enjekte edilir. UI şunları içerir:

- süre göstergesi
- mute butonu
- random asset görseli
- `ALL / PODO` library switcher
- kritik sürede kırmızı tema

### Temizleme kuralları
Şu durumlarda review cache temizlenir:

- URL'de `review_id` kalmazsa
- başka bir `review_id`'ye geçilirse

Bu durumda timer durur, ses kapanır ve UI kaldırılır.
