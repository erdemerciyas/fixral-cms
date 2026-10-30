# Fixral — Marka Sistemi v2

Tüm SVG'ler `build.mjs` içindeki tek geometriden üretiliyor. Elle SVG düzenleme;
`build.mjs` değiştirilip yeniden çalıştırılır:

```
node brand/logo-v2/build.mjs
```

## Geometri

- X kutusu 200×160, 45° bıçaklar, yatay kalınlık 40 (dik ≈ 28.3)
- F kutusu 118×160, gövde 28, kollar 45° kesilir
- F'in üst kolu x=90'da X'in kuzeybatı bıçağına tam akar
- Turuncu yalnızca X'in güneybatı kolunda

## Konseptler

| Dosya | Ne için |
|---|---|
| `fx-blade` | Ana marka |
| `fx-apex` | İkon / avatar (yalnız X) |
| `fx-slice` | Slicer, 3D baskı |
| `fx-cloud` | 3D tarama, nokta bulutu |
| `fx-mesh` | Tersine mühendislik, tel kafes |
| `fx-scan` | Lazer tarama (animasyona uygun) |
| `fx-bracket` | Sosyal medya kartı |
| `fx-core` | App icon 512, yuvarlatılmış kare |
| `fx-stack` | Derinlik / üretim |
| `fx-trace` | PCB, ESP32, otomotiv elektroniği |
| `fx-lockup-h` | Yatay kilit — varsayılan |
| `fx-lockup-v` | Dikey kilit |
| `fixral-wordmark` | Kelime markası tek başına |

Her biri 4 varyant: `.svg` (koyu+turuncu), `-white`, `-mono`, `-mono-white`.

## Renkler

`#101828` Ink · `#3A3F46` Graphite · `#F97316` Torch · `#F3F4F6` Paper · `#FFFFFF` White

## Tipografi

Space Grotesk (başlık) · Inter (gövde) · JetBrains Mono (teknik veri)

Kelime markası outline path — font kurulumu gerektirmez.
