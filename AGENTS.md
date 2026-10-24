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
   - Google Auth girişinde (hem `signInWithPopup` callback'inde hem de `onAuthStateChanged` dinleyicisinde) kullanıcının e-posta adresi kontrol edilmelidir (Yalnızca `@alkev.k12.tr` uzantılı kurumsal adresler kabul edilir).
   - `@alkev.k12.tr` ile bitmeyen adreslerde oturum derhal kapatılmalı (`await auth.signOut()`) ve ekrana uyarı verilmelidir: `"Erişim Engellendi: Sisteme yalnızca @alkev.k12.tr uzantılı kurumsal e-posta adresiniz ile giriş yapabilirsiniz."`
   - Giriş ekranlarında `"ℹ️ Yalnızca @alkev.k12.tr uzantılı kurumsal e-posta adresleri kabul edilmektedir."` ibaresi her zaman korunmalıdır.

4. **PDF İndirme Motoru & Tek Sayfa Standartı (Off-Screen A4 Template):**
   - Tailwind v4 `oklch()` renk hatalarını ve mobil darlık çökmelerini önlemek için ekrandaki mevcut DOM doğrudan yakalanmamalıdır.
   - Arka planda gizli (`position: fixed; left: -9999px; top: 0; width: 1200px;`) olarak oluşturulan ve yalnızca standart HEX renkler/inline stiller kullanan A4 Yatay şablon `html2canvas(element, { scale: 2, useCORS: true })` ile yakalanıp `jsPDF('landscape', 'mm', 'a4')` ile tek sayfa olarak indirilmelidir.
   - `finally` bloğunda oluşturulan bu gizli eleman DOM'dan tamamen temizlenmeli (`element.remove()`), butonda yükleniyor durumu gösterilerek üst üste tıklamalar engellenmelidir.

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
