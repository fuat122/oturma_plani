# Design System & UI Guidelines
## Akıllı Sınıf - Görsel Standartlar & Tasarım Sistemi

### 1. Tasarım Felsefesi
Akıllı Sınıf; Türk Millî Eğitim Bakanlığı resmi standartlarına ve çağdaş pedagojik ergonomiye uygun, yüksek yoğunluklu, dikkat dağıtmayan, saygın bir eğitim teknolojisi arayüzü sunar.
- **Sıfır Yapay Zeka Klişesi (Anti-AI Slop):** Anlamsız devasa mor geçişler veya süs amaçlı robot emojileri yerine, gerçek sınıf mimarisi (Tahta, Kapı, Cam, 3 Bloklu Sıra) esas alınır.
- **Yüksek Kontrast & Tipografik Hiyerarşi:** Okunabilir büyük numaralar, net öğrenci isimleri, açık cinsiyet ve durum rozetleri.

---

### 2. Renk Paleti & Semantik Belirteçler (Tokens)

| Alan / Rol | Standart HEX / RGB | Tailwind CSS Eşleniği | Kullanım Amacı |
| :--- | :--- | :--- | :--- |
| **Arka Plan (Canvas)** | `#f8fafc` | `bg-slate-50` | Ana sayfa arka planı |
| **Kartlar & Paneller** | `#ffffff` | `bg-white` | Kart ve modül yüzeyleri |
| **Birincil Vurgu (Primary)** | `#2563eb` | `bg-blue-600` / `text-blue-600` | Butonlar, seçili sekmeler, erkek öğrenci |
| **Orta Blok (Emerald)** | `#10b981` | `border-emerald-300` / `bg-emerald-50` | Orta sıra bloğu, başarı durumları |
| **Duvar Kenarı (Amber)** | `#f59e0b` | `border-amber-300` / `bg-amber-50` | Duvar kenarı bloğu, kapı, uyarılar |
| **Cam Kenarı (Sky)** | `#0284c7` | `border-sky-300` / `bg-sky-50` | Cam kenarı bloğu, dış cephe pencereleri |
| **Kız Öğrenci (Rose)** | `#e11d48` | `bg-rose-50` / `border-rose-200` | Kız öğrenci kartları ve rozetleri |
| **Koyu Zemin & Akıllı Tahta**| `#0f172a` | `bg-slate-900` | Akıllı tahta, üst başlık, koyu butonlar |
| **Metin - Ana** | `#020617` | `text-slate-950` | Sınıf başlıkları, öğrenci adları |
| **Metin - İkincil** | `#64748b` | `text-slate-500` | Numaralar, alt başlıklar, etiketler |

> **Önemli Not (PDF Uyumluluğu):** PDF üretim motorunda CSS `oklch()` formatı yerine yukarıdaki standart HEX renk kodları zorunludur.

---

### 3. Tipografi Hiyerarşisi
- **Yazı Tipi Ailesi:** `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Öğrenci Numaraları & Kodlar:** `font-mono font-bold` (Tekdüze genişlikte sayısal okunabilirlik)
- **Ana Başlıklar:** `text-xl sm:text-2xl md:text-3xl font-black tracking-tight`
- **Etiketler & Rozetler:** `text-[10px] sm:text-xs font-bold uppercase tracking-wider`

---

### 4. Bileşen Standartları & Ölçüler

#### 4.1. Mobil Dokunma Alanı (Touch Targets)
- Tüm tıklanabilir butonlar, açılır kutular (select) ve ana aksiyon alanları mobilde **minimum 44px (`min-h-[44px]`)** yüksekliğe sahip olmalıdır.

#### 4.2. Sıra Kartı (StudentDeskCard)
- **Minimum Yükseklik:** `min-h-[74px]`
- **Köşe Yuvarlama:** `rounded-xl`
- **Kenarlık:** `border` (Dolu sırada 1.5px katı, boş sırada 2px kesikli `border-dashed`)
- **Etkileşim Geri Bildirimi:**
  - Taşınmak üzere seçildiğinde: `ring-2 ring-blue-500 shadow-md animate-pulse`
  - Dokunarak üzerine gelindiğinde (Drop Target): `ring-2 ring-emerald-500 shadow-md bg-emerald-50`

#### 4.3. Sıra Düzeni Izgarası (SeatingPlanGrid)
- Mobilde sıraların sıkışıp okunmaz hale gelmesini engellemek için yatay kaydırma kapsayıcısı:
  `overflow-x-auto touch-pan-x` ve iç ızgara genişliği `min-w-[860px] lg:min-w-0`.

#### 4.4. Modal Pencereler (ReportModal, NewClassModal vb.)
- Maksimum Yükseklik: `max-h-[85vh]`
- İçerik Kaydırma: `overflow-y-auto`
- Mobil Güvenli Kaydırma Boşluğu: `pb-20` (Listenin en altındaki öğrencilerin veya butonların ekran altında kesilmesini önler).

---

### 5. Animasyon & Geçiş Standartları
- Masaüstünde hover efektleri: `transition-all duration-200 ease-in-out hover:-translate-y-0.5`
- Mobilde dokunma geri bildirimi: `active:scale-[0.98]` ve `navigator.vibrate(40)` desteği.
- Gereksiz, göz yoran sürekli animasyonlardan kaçınılmalı; yalnızca durum bildiren zarif geçişler kullanılmalıdır.
