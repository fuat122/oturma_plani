# Tek Sayfa A4 Yatay PDF / Çıktı & Mobil Çift Yöntemli Sıra Yönetimi Planı

Bu plan; sınıf oturma düzeni çıktısı ve PDF indirme işleminde aynı sınıfın iki sayfaya bölünmesini engelleyip **tam olarak tek bir A4 Yatay sayfaya** sığdırılmasını, PDF indirme butonuna tıklandığında üst bardaki diğer butonların kilitlenip pasif kalması hatasının giderilmesini ve mobil cihazlarda öğrencilerin hem **Dokun-ve-Değiştir (Tap-to-Swap)** hem de **Dokunmatik Sürükle-Bırak (Touch Drag & Drop)** yöntemleriyle taşınabilmesini sağlar.

## Kullanıcı Tercihleri ve Kararları (Kullanıcı Tarafından Onaylanan)

> [!IMPORTANT]
> Kullanıcı ile yapılan soru-cevap neticesinde aşağıdaki teknik ve tasarımsal kararlar kesinleştirilmiştir:

- **PDF ve Yazıcı Çıktı Formatı**: **A4 Yatay (Tek Sayfa)** — Tüm bloklar (Duvar Kenarı, Orta Blok, Cam Kenarı), öğretmen kürsüsü/akıllı tahta, resmi başlık ve imza alanı taşma yapmadan tek bir sayfada toplanacak.
- **Buton Kilitlenme Davranışı**: **Arka planda indirilecek ve butonlar hiç pasife alınmayacak** — PDF veya Excel indirme esnasında arayüzdeki diğer butonlar (Sınıf Seçimi, Sekmeler, Düzenle, Raporlar vb.) asla devre dışı bırakılmayacak; indirme durumu yalnızca buton içinde zarif bir spinner ve toast bildirimi ile gösterilecek.
- **Mobil Öğrenci Değiştirme Yöntemi**: **Her iki yöntem de aktif olacak** — Öğretmen ister parmağıyla öğrenciye dokunup ardından hedef sıraya dokunarak hızlıca yer değiştirebilecek (Tap-to-Swap), ister parmağıyla basılı tutup hedef sıraya sürükleyerek bırakabilecek (Touch Drag & Drop).

---

## 1. Genel Bakış ve Temel Konsept

* **Tek Sayfa A4 Yatay Garantisi**: Çıktı alındığında (`window.print()` veya tarayıcı yazdırma penceresi) ekran arayüzü (Navbar, filtre butonları, bildirimler) tamamen gizlenecek; yalnızca özel hazırlanmış resmi oturma planı şablonu tam 1 sayfa A4 Yatay olarak yazdırılacaktır. PDF üretiminde ise doğrudan A4 Yatay boyutlarına (297mm x 210mm) piksel hassasiyetinde ölçeklenen yüksek çözünürlüklü (300 DPI) tek sayfalık PDF dosyası oluşturulacaktır.
* **Kesintisiz Kullanıcı Deneyimi**: PDF veya rapor indirmeleri asenkron/arka planda çalışacak; arayüz elemanlarının tıklanamaz hale gelmesine (freeze / disabled state) yol açan tüm kısıtlamalar kaldırılacaktır.
* **Mobil Dokunmatik Ergonomi**: Mobil tarayıcılarda HTML5 Drag-and-Drop API'sinin çalışmama kısıtı; Touch Event API (`touchstart`, `touchmove`, `touchend`) ile desteklenerek çözülecektir. Aynı zamanda dokunarak seçim yapanlar için titreşimli dokunma geri bildirimi (haptic feedback) ve görsel vurgu halkası sunulacaktır.

---

## 2. Kullanıcı Deneyimi ve Görsel Tasarım

### A. Tek Sayfalık A4 Yatay Çıktı Tasarımı
- **Resmi MEB Başlığı & Kurum Bilgisi**:
  - En üstte: `T.C. MİLLÎ EĞİTİM BAKANLIĞI`
  - Ortada: `[Danışman Öğretmen] Danışmanlığında [Sınıf Adı] Sınıfı` (İri, koyu ve prestijli yazı)
  - Alt bilgi bandı: Öğretim yılı, kademe, mevcut/kapasite ve çıktı tarihi kompakt tek satırda.
- **Akıllı Tahta ve Kürsü Şeridi**: Giriş kapısı, kürsü/akıllı tahta ve pencere cephesini gösteren yatay yönlendirici şerit.
- **3 Bloklu Sıra Yerleşimi**: 4 sıra x 2 sütun (24 kişilik standart veya dinamik kapasite), her öğrenci kartında numara, ad-soyad ve cinsiyet rozeti net okunabilir kontrast ile.
- **Resmi Onay & İmza Alanı**: Sayfanın en altında Danışman Öğretmen ve Okul Müdürü imza/mühür bölümleri.
- **Sayfa Taşma Koruması**: CSS `@page { size: landscape; margin: 6mm; }` ve `max-height: 198mm; overflow: hidden; page-break-inside: avoid;` kuralları ile 2. sayfaya taşma fiziksel olarak imkansız hale getirilir.

### B. Mobil Dokunmatik Etkileşimler
- **1. Yöntem: Dokun-ve-Değiştir (Tap-to-Swap)**:
  - Bir sıraya dokunulduğunda kart etrafında canlı mavi pulsing halka belirir.
  - Altta zarif bir eylem çubuğu belirir: *"Seçilen: [Öğrenci Adı] — Taşımak istediğiniz hedef sıraya dokunun"*.
  - Hedef sıraya dokunulduğunda yer değiştirme anında gerçekleşir, cihaz titreşir (40ms haptic feedback) ve seçim temizlenir.
- **2. Yöntem: Dokunmatik Sürükle-Bırak (Touch Drag & Drop)**:
  - Öğrenci kartına parmakla dokunup hareket ettirildiğinde parmağın altında yarı saydam kart kopyası (drag ghost) süzülür.
  - Parmak hangi sıranın üzerine gelirse o sıra hafifçe büyür ve yeşil/mavi hedef çerçevesi alır.
  - Parmak kaldırıldığında (`touchend`), `document.elementFromPoint` ile hedef sıra tespit edilip transfer tamamlanır.

---

## 3. Mimari ve Bileşen Diyagramı

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AKILLI SINIF YÖNETİMİ                           │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌──────────────────┐       ┌──────────────────┐        ┌──────────────────┐
│  Navbar & Bar    │       │ SeatingPlanGrid  │        │ PrintSeatingPlan │
│  (Asenkron Akış, │       │ (Mobil Touch     │        │ (A4 Yatay        │
│  Sıfır Kilit)    │       │  & Tap-to-Swap)  │        │  Tek Sayfa)      │
└────────┬─────────┘       └─────────┬────────┘        └─────────┬────────┘
         │                           │                           │
         │                           │                           │
         ▼                           ▼                           ▼
┌──────────────────┐       ┌──────────────────┐        ┌──────────────────┐
│  pdfService.ts   │       │ StudentDeskCard  │        │ @media print     │
│  (Arka Planda    │       │ (Touch Event     │        │ (Ekranı Gizle,   │
│   Tek Sayfa A4   │       │  Listeners:      │        │  Yalnızca A4     │
│   Canvas Export) │       │  Start/Move/End) │        │  Planı Bas)      │
└──────────────────┘       └──────────────────┘        └──────────────────┘
```

---

## 4. Teknik Değişiklikler ve Uygulama Adımları

1. **`src/index.css` & `@media print` Düzeltmesi**:
   - `@media print` bloğu güncellenerek ekran arayüzündeki `#root > div > *:not(#pdf-export-container)` ve tüm modal/barların `display: none !important` olması sağlanacak.
   - `#pdf-export-container` ve `#printable-seating-chart` için `max-height: 198mm !important; overflow: hidden !important; page-break-after: avoid !important; page-break-inside: avoid !important;` kuralları tanımlanacak. Böylece yazdır dendiğinde sayfa asla 2'ye bölünmeyecek.

2. **`src/services/pdfService.ts` Güçlendirmesi**:
   - `html2pdf.js` veya `html2canvas` + `jsPDF` doğrudan çağrısı optimize edilerek, render edilen canvas'ın A4 Yatay (297mm × 210mm) sayfaya tek parça (`doc.addImage(...)` ile tek sayfa) olarak eklenmesi ve 2. sayfa oluşma ihtimalinin sıfıra indirilmesi.
   - Herhangi bir hata veya beklenmedik kilitlenmeyi önlemek için emniyet zaman aşımı (safe timeout) eklenmesi.

3. **`src/App.tsx` & `src/components/ClassroomHeader.tsx` Buton Kilitlenme Giderimi**:
   - Kullanıcının kararı doğrultusunda PDF/Excel indirme işlemlerinde butonların `disabled` durumuna geçirilmesi kaldırılacak.
   - `isExportingPDF` ve `isExportingExcel` esnasında butonlar tıklanabilir kalacak; sadece ilgili butonun içinde küçük döner bir animasyon simgesi (spinner) gösterilecek ve arka planda indirme bitince başarı bildirimi verilecek.

4. **`src/components/StudentDeskCard.tsx` & `src/components/SeatingPlanGrid.tsx` Mobil Dokunmatik Desteği**:
   - `onTouchStart`, `onTouchMove`, `onTouchEnd` event listener'ları eklenerek parmakla sürükle-bırak desteği kazandırılacak.
   - Mevcut Dokun-ve-Değiştir (Tap-to-Swap) özelliği mobil ekranlarda daha belirgin bir görsel gösterge (hedef sırayı parıldayan çerçeveyle çağırma) ile zenginleştirilecek.

---

## 5. Doğrulama ve Test Adımları

- [ ] `compile_applet` ile projenin TypeScript ve Vite build kontrolünün yapılması.
- [ ] Hem masaüstü hem mobil ekran boyutlarında Dokun-ve-Değiştir ve Dokunmatik Sürükle-Bırak işlevlerinin sınanması.
- [ ] "PDF İndir" butonuna tıklandığında diğer butonların aktif kalmasının doğrulanması.
- [ ] Oluşturulan PDF ve tarayıcı yazdırma önizlemesinde sınıfın kesinlikle tek sayfaya sığdığının doğrulanması.
