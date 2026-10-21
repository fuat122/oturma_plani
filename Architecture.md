# System Architecture Document
## Akıllı Sınıf - Sistem & Yazılım Mimarisi

### 1. Mimari Genel Bakış
Akıllı Sınıf; modern, yüksek performanslı, sunucusuz (serverless) bir React 19 SPA mimarisi üzerinde yapılandırılmıştır. Veri kalıcılığı ve kimlik doğrulama için Google Firebase Cloud Firestore ve Firebase Authentication kullanılır.

```
┌────────────────────────────────────────────────────────┐
│                      Client Layer                      │
│   React 19 + TypeScript + Vite + Tailwind CSS v4      │
├──────────────────────────┬─────────────────────────────┤
│   Presentation / UI      │   State & Business Logic    │
│   • Navbar               │   • React Hooks (useMemo,   │
│   • ClassroomHeader      │     useCallback, useState)  │
│   • BlackboardHeader     │   • Storage Service         │
│   • SeatingPlanGrid      │   • Real-Time Subscriptions │
│   • StudentDeskCard      │   • Domain Validator        │
│   • ReportModal          │                             │
├──────────────────────────┴─────────────────────────────┤
│                     Export Engines                     │
│   • Native HTML5 Canvas 2D + jsPDF (Single-Page A4)   │
│   • SheetJS / XLSX (Excel .xlsx Multi-Sheet Roster)    │
├────────────────────────────────────────────────────────┤
│                     Backend & Cloud                    │
│   • Firebase Authentication (Google OAuth + Domain)   │
│   • Firebase Cloud Firestore (NoSQL Isolated DB)       │
└────────────────────────────────────────────────────────┘
```

---

### 2. Dizin Yapısı & Modüler Mimari
```
/
├── AGENTS.md                  # Yapay zeka geliştirici kuralları ve standartları
├── PRD.md                     # Ürün gereksinim dökümanı
├── Design-System.md           # Tasarım sistemi, renkler ve bileşen standartları
├── Architecture.md            # Sistem ve yazılım mimarisi dökümanı
├── src/
│   ├── components/            # UI Bileşenleri
│   │   ├── Navbar.tsx         # Üst gezinme ve profil barı
│   │   ├── ClassroomHeader.tsx# Sınıf başlığı ve hızlı aksiyon butonları
│   │   ├── BlackboardHeader.tsx # Ön cephe (Kapı, Tahta, Cam) simülasyonu
│   │   ├── SeatingPlanGrid.tsx# 3 bloklu oturma düzeni ızgarası
│   │   ├── StudentDeskCard.tsx# Bireysel sıra ve öğrenci kartı (Touch/Drag)
│   │   ├── ReportModal.tsx    # Tarih bazlı öğrenci gözlem ve not paneli
│   │   ├── StudentManagementModal.tsx # Öğrenci kadrosu ve toplu liste yönetimi
│   │   ├── NewClassModal.tsx  # Yeni sınıf oluşturma sihirbazı
│   │   ├── ConfirmModal.tsx   # İşlem onay pencereleri
│   │   └── LoginWelcomeScreen.tsx # Giriş yap ekranı
│   ├── services/              # Dış Servisler ve Motorlar
│   │   ├── firebaseAuth.ts    # Firebase kimlik ve domain doğrulama
│   │   ├── firestoreService.ts# Firestore CRUD ve gerçek zamanlı dinleyiciler
│   │   ├── pdfService.ts      # Native Canvas 2D A4 Yatay PDF motoru
│   │   ├── excelService.ts    # Excel (.xlsx) veri dışa aktarım motoru
│   │   └── storageService.ts  # Yerel önbellek ve yedekleme servisi
│   ├── types/                 # TypeScript tip tanımları (Classroom, Student, SeatSlot vb.)
│   ├── App.tsx                # Ana orkestrasyon ve durum yönetimi
│   ├── main.tsx               # Uygulama giriş noktası
│   └── index.css              # Global stiller ve Tailwind CSS direktifleri
```

---

### 3. Veri Modeli & Firestore Şeması

#### 3.1. Sıkı İzolasyon (Multi-Tenancy)
Her öğretmen yalnızca kendi oluşturduğu sınıf verilerine erişebilir:
- **Yol:** `teachers/{teacherId}/classes/{classId}`
- **Örnek Döküman:**
```json
{
  "id": "class_1729000000",
  "name": "9-A",
  "academicYear": "2024-2025",
  "grade": "9. Sınıf",
  "branchName": "Fen ve Sosyal Bilimler",
  "teacherId": "google_uid_12345",
  "teacherName": "Altan AKA",
  "students": [
    {
      "id": "st_1",
      "studentNumber": "101",
      "fullName": "Ahmet Yılmaz",
      "gender": "E",
      "seatCode": "D-1-1"
    }
  ],
  "seats": [
    {
      "id": "seat_duvar_1_1",
      "block": "duvar",
      "row": 1,
      "col": 1,
      "code": "D-1-1",
      "studentId": "st_1"
    }
  ],
  "observations": [
    {
      "id": "obs_1",
      "studentId": "st_1",
      "category": "katilim",
      "content": "Derse aktif katılım sağladı.",
      "date": "2024-10-21"
    }
  ],
  "classNotes": []
}
```

#### 3.2. Okul İçi Sınıf Paylaşımı ("Diğer Sınıflar")
Diğer öğretmenlerin oturma planlarını görüntülerken kişisel öğrenci gözlemleri ve notları `observations: []` ve `classNotes: []` olarak filtrelenerek gizlenir.

---

### 4. PDF Baskı Motoru Mimarisi (Zero-Crash Canvas 2D Engine)
- **Sorun:** HTML2Canvas kütüphaneleri Tailwind CSS v4'ün `oklch()` renk fonksiyonunu parse edemeyerek çökmekteydi.
- **Çözüm:** DOM'u ve stylesheet'leri taramayan, doğrudan bellek içi HTML5 Canvas 2D bağlamı (`CanvasRenderingContext2D`) üzerinde 2480x1754 px çözünürlükte A4 Yatay baskı şablonu çizen yerel motor.
- **Akış:**
  1. `renderSeatingPlanToCanvas(classroom, teacher)` fonksiyonu çağrılır.
  2. Standart HEX renkler ve Canvas 2D primitifleri (`fillRect`, `fillText`, `strokeRect`) ile döküman çizilir.
  3. `canvas.toDataURL('image/jpeg', 0.96)` ile görsel elde edilir.
  4. `jsPDF` ile tek bir A4 Landscape sayfaya (297x210 mm) 5 mm kenar payı ile yerleştirilir.
  5. Bellek serbest bırakılır (`canvas.width = 0; canvas.height = 0;`).
  6. PDF arka planda inerken kullanıcı arayüzü asla bloklanmaz veya kilitlenmez.

---

### 5. Mobil Etkileşim & Responsive Mimari
- **Dokunmatik Taşıma (Touch Events API):**
  - Kart üzerinde `onTouchStart`, `onTouchMove`, `onTouchEnd` dinleyicileri.
  - 10px hareket eşiği aşıldığında dokunmatik sürükleme aktifleşir ve `document.elementFromPoint(x, y)` ile hedef sıra belirlenir.
- **Yatay Kaydırma (Horizontal Pan):**
  - Sınıf oturma planı 3 bloklu yapıyı mobilde bozmadan `overflow-x-auto touch-pan-x` ile akıcı kaydırılabilir genişlikte (`min-w-[860px]`) tutulur.
