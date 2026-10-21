# AGENTS.md - Yapay Zeka Geliştirici Kılavuzu & Çalışma Kuralları

Bu döküman, **Akıllı Sınıf** projesinde kod yazan, refactor eden veya mimari değişiklikler yapan yapay zeka geliştiricileri (AI Agents) için bağlayıcı kural ve standartlar bütünüdür.

---

### 1. Temel İlke & Uyumluluk Sözleşmesi
- Kod yazarken, refactor ederken veya mimari kararlar alırken projenin kök dizininde bulunan **AGENTS.md**, **PRD.md**, **Design-System.md** ve **Architecture.md** dosyalarındaki kural ve standartlara **%100 bağlı kalınmalıdır**.
- Kullanıcı özel olarak aksini talep etmedikçe bu standartlardan sapılamaz.

---

### 2. Korunması Zorunlu Kritik Kurallar (Non-Negotiable Rules)

1. **"Salt Okunur" İfadelerinin Yasaklanması:**
   - Uygulamanın hiçbir yerinde "Salt Okunur" ifadesi veya kilit (`🔒`) rozeti kullanılmamalıdır.
   - Üst bardaki sekme adı her zaman **"Diğer Sınıflar"** olarak adlandırılmalıdır.

2. **Dinamik Sınıf Başlığı Formatı:**
   - Ana ekranda ve PDF çıktısında sınıf başlığı istisnasız şu formatta oluşturulmalıdır:
     `"[Danışman Öğretmen Adı] Danışmanlığında [Sınıf Adı] Sınıfı"`
     *(Örnek: "Altan AKA Danışmanlığında 9-A Sınıfı")*

3. **Kurumsal E-Posta Güvenlik Doğrulaması:**
   - Google Auth girişinde kullanıcının e-posta adresi kontrol edilmelidir (`.k12.tr`, `.edu.tr`, `okul.k12.tr` veya yetkili hesap `fuattosun@gmail.com`).
   - Yetkisiz adreslerde oturum derhal kapatılmalı ve ekrana şık bir uyarı verilmelidir.
   - Giriş ekranlarında `"ℹ️ Sadece kurumsal okul e-posta adresleri kabul edilmektedir."` ibaresi her zaman korunmalıdır.

4. **PDF İndirme Motoru & Tek Sayfa Standartı:**
   - Asla HTML2Canvas kütüphanesini ana sayfa DOM'una bağlayıp Tailwind v4 `oklch` hatası oluşturulmamalıdır.
   - Her zaman `src/services/pdfService.ts` içindeki yerel Canvas 2D motoru kullanılmalıdır.
   - PDF oluşturma fonksiyonu butonları asla kilitlememeli, işlem arka planda yürütülmeli ve `finally` bloğunda bellek temizliği (`cleanup`) yapılmalıdır.
   - Çıktı tek bir A4 yatay sayfaya sığdırılmalıdır.

5. **Mobil Dokunmatik Standartlar (Mobile Touch & Responsive):**
   - Tüm butonlar ve etkileşimli alanlar minimum 44px (`min-h-[44px]`) dokunma boyutunda olmalıdır.
   - Oturma planı mobilde sıkışıp okunmaz hale gelmemeli, `overflow-x-auto touch-pan-x` ile yatay kaydırılabilir olmalıdır.
   - Öğrencilerin yeri hem dokunarak (Tap-to-Swap) hem de dokunmatik sürükleyerek (Touch Drag & Drop) değiştirilebilmelidir.
   - Rapor ve modal pencerelerde kaydırma alanının alt kısmında güvenli boşluk (`pb-20`) bırakılmalıdır.

---

### 3. Kod Kalitesi & Doğrulama Protokolü
- Değişiklikler yapıldıktan sonra her zaman `compile_applet` ve `lint_applet` çalıştırılarak derleme ve tip güvenliği doğrulanmalıdır.
- Sahte / Mock veri fallback'leri yerine gerçek Firestore ve servis entegrasyonları kullanılmalıdır.
- Kod blokları tek parça, temiz ve eksiksiz olarak yazılmalıdır.
