# 🦾 Jotform AI Review Timer

Bu proje, Jotform AI Review aracında form inceleme sürelerini takip etmek için geliştirilmiş bir Tampermonkey scriptidir.

## 📁 Mimari
- **assets.js**: Medya kütüphanesi (görseller, sesler).
- **core.js**: Network Sniper, UI Helper ve Timestamp Motoru.
- **main.js**: Tampermonkey üzerinde çalışan birleştirilmiş dosya.

## 🚀 Özellikler
- **Timestamp Persistence**: Sayfa yenilense de süre kaldığı yerden devam eder.
- **Sniper Mechanism**: Network üzerinden threshold verisini otomatik yakalar.
- **Dual Mute**: Hem kalıcı hem anlık sessize alma seçeneği.
- **Library Selection**: ALL veya PODO modları arasında geçiş imkanı.