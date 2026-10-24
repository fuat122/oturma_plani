# PRD (Product Requirements Document)
## Akıllı Sınıf - Oturma Planı & Öğrenci Takip Sistemi

### 1. Ürün Özeti & Vizyon
**Akıllı Sınıf**, K-12 kademesinde görev yapan danışman ve branş öğretmenlerinin sınıf oturma düzenlerini 3 boyutlu/bloklu sınıf mimarisine uygun şekilde görselleştirmelerini, öğrencilerin yerlerini hem masaüstü hem de mobil dokunmatik cihazlarda akıcı bir biçimde yönetmelerini, tarih bazlı pedagojik gözlemlerini kayıt altına almalarını ve tek tıkla resmi A4 yatay PDF ve Excel çıktıları almalarını sağlayan yeni nesil bir okul yönetim platformudur.

---

### 2. Kullanıcı Profilleri & Roller
1. **Danışman / Şube Öğretmeni:**
   - Kendi sınıfının (örn. 9-A, 10-B) oturma planını oluşturur, düzenler, sıraları rastgele karıştırır veya numaraya göre sıralar.
   - Öğrencilerin sıralarını dokunarak (Tap-to-Swap) veya dokunmatik sürükleyerek (Touch Drag & Drop) değiştirir.
   - Öğrenci bazında tarihli ve kategorize edilmiş pedagojik gözlem ve notlar ekler.
   - Resmi A4 Yatay oturma planı PDF'i ve detaylı Excel (.xlsx) raporları indirir.
2. **Diğer Yetkili Branş Öğretmenleri (Okul İçi Paylaşım):**
   - Okuldaki diğer öğretmenlerin sınıflarını "Diğer Sınıflar" sekmesinden görüntüler.
   - Kişisel öğrenci gözlemleri ve notları gizlenir; yalnızca öğrenci adı, numarası ve sıra yerleşimi salt okunur olarak incelenebilir.
3. **Okul İdaresi:**
   - Standart formatlı, danışman öğretmen ve okul müdürü imza/mühür alanlarına sahip resmi oturma planı çıktılarını temin eder.

---

### 3. Temel Fonksiyonel Gereksinimler

#### 3.1. Kimlik Doğrulama & Kurumsal Güvenlik
- **Google OAuth Girişi:** Firebase Auth altyapısı ile tek tıkla güvenli giriş.
- **Kurumsal Okul Domain Kontrolü:**
  - Yalnızca `@alkev.k12.tr` uzantılı kurumsal okul e-posta adresleri kabul edilir.
  - E-posta adresi `@alkev.k12.tr` ile bitmiyorsa (hem `signInWithPopup` hem de `onAuthStateChanged` aşamasında) oturum derhal kapatılır (`await auth.signOut()`) ve kullanıcıya güvenlik uyarısı gösterilir: `"Erişim Engellendi: Sisteme yalnızca @alkev.k12.tr uzantılı kurumsal e-posta adresiniz ile giriş yapabilirsiniz."`
  - Giriş ekranında ve öğretmen panellerinde: `"ℹ️ Yalnızca @alkev.k12.tr uzantılı kurumsal e-posta adresleri kabul edilmektedir."` bilgisi açıkça yer alır.
- **Sıkı Veri İzolasyonu (Multi-Tenancy):**
  - Her öğretmenin sınıfları Firestore'da `teachers/{teacherId}/classes/{classId}` altında saklanır.
  - Oturum kapalıyken hiçbir öğrenci veya sınıf verisi bellekte tutulmaz.

#### 3.2. Sınıf & Başlık Standartları
- **Dinamik Başlık Formatı:** Sınıf başlıkları hem ana ekranda hem de PDF dökümanında tam olarak şu prestijli formatta oluşturulur:
  `"[Danışman Öğretmen Adı] Danışmanlığında [Sınıf Adı] Sınıfı"`
  *(Örnek: "Altan AKA Danışmanlığında 9-A Sınıfı")*
- **"Salt Okunur" İfadelerinin Temizliği:** Arayüzde hiçbir yerde "Salt Okunur" ifadesi veya kilit rozeti yer almaz; diğer sınıflar "Diğer Sınıflar" sekmesinde temiz bir arayüzle sunulur.

#### 3.3. 3 Bloklu Oturma Düzeni & Çift Yöntemli Taşıma
- **Gerçekçi Sınıf Mimarisi:**
  - Ön Cephe: Giriş Kapısı, Akıllı Tahta (Öğretmen Kürsüsü), Camlar.
  - 3 Blok: Duvar Kenarı Sıraları (Amber), Orta Blok Sıraları (Zümrüt Yeşili), Cam Kenarı Sıraları (Gök Mavisi).
  - Her sırada yan yana 2 koltuk/sıra standardı.
- **Çift Yöntemli Öğrenci Yer Değiştirme (Mobile & Desktop):**
  1. **Dokunmatik Sürükle-Bırak (Touch & HTML5 Drag & Drop):** Parmağı veya fareyi basılı tutarak hedef sıraya taşıma. Taşınan kartın üzerinde uçan önizleme (ghost) ve hedef sırada yeşil onay halkası gösterilir.
  2. **Dokunarak Değiştir (Tap-to-Swap):** İlk öğrenciye dokunulur (kart etrafında mavi seçim halkası belirir), ardından hedef sıraya dokunulduğunda öğrenciler anında yer değiştirir.

#### 3.4. Tek Sayfa A4 Yatay PDF Baskı Motoru (Off-Screen A4 Print Template)
- Tailwind CSS v4 `oklch()` renk fonksiyonu ve mobil ekran darlığı sorunlarını önleyen, arka planda gizli (`1200px`) oluşturulan ve yalnızca standart CSS/inline stiller (HEX renkler) kullanan özel A4 Yatay şablon.
- `html2canvas(element, { scale: 2, useCORS: true })` ve `jsPDF('landscape', 'mm', 'a4')` motoru ile yüksek çözünürlüklü tek sayfa çıktı.
- `finally` bloğunda bellek ve DOM temizliği (`cleanup`, `element.remove()`) ile art arda sınırsız kez sorunsuz indirme.
- Butonda yükleniyor durumu ve eşzamanlı tıklama koruması.

#### 3.5. Excel (.xlsx) Raporlama
- Sınıfın tüm öğrenci listesi, oturma kodu, sıra bloğu, cinsiyeti ve tarih bazlı gözlem/yorumları içeren resmi Excel dökümü.

#### 3.6. Öğrenci Gözlem & Gelişim Takip Modülü
- Öğrenci bazında tarihli gözlem kaydı (Katılım, Davranış & Uyum, Sıra Arkadaşı İlişkisi, Ödev & Hazırlık, Genel Gözlem).
- Sınıf genel notları tutabilme.
- Mobilde alt kısımdan kesilmeyen, güvenli kaydırma alanına (`pb-20`) sahip modal tasarımı.

---

### 4. Mobil Kullanılabilirlik Standartları
- 375px'den başlayan tüm ekran genişliklerinde tam responsive uyum.
- Navbar dikey katlanabilir düzen (`flex-col sm:flex-row`).
- Sıra planında yatay kaydırma desteği (`overflow-x-auto touch-pan-x`).
- Tüm buton ve etkileşim alanlarında minimum 44px (`min-h-[44px]`) dokunma hedefi boyutu.
