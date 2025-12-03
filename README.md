# 🎯 Focuser - Odaklanma ve Raporlama Uygulaması

Bu proje, Sakarya Üniversitesi Bilgisayar Mühendisliği Bölümü "BSM 447 - Mobil Uygulama Geliştirme" dersi dönem projesi olarak geliştirilmiştir.

## 📱 Proje Hakkında
Focuser, Pomodoro tekniğini temel alan ve kullanıcının odaklanma sürelerini takip eden bir mobil uygulamadır. Kullanıcının dikkati dağıldığında (uygulamadan çıktığında) bunu tespit eder ve raporlar.

## 🚀 Özellikler (MVP)
* **Zamanlayıcı:** Ayarlanabilir odaklanma süresi (Geri sayım).
* **Kategori Seçimi:** Kodlama, Ders, Kitap vb. kategoriler.
* **Dikkat Dağınıklığı Takibi (AppState):** Uygulama arka plana atıldığında sayacı durdurur ve kaydeder.
* **Seans Özeti:** Seans bitiminde başarı/hata durumunu gösterir.
* **Veri Kaydı (AsyncStorage):** Tamamlanan seanslar telefon hafızasında saklanır.
* **Raporlar ve Grafikler:** * Son 7 günün çalışma grafiği (Bar Chart).
    * Kategori dağılımı (Pie Chart).
    * Detaylı istatistikler.

## 🛠️ Kullanılan Teknolojiler
* **Platform:** React Native (Expo)
* **Dil:** JavaScript
* **Navigasyon:** React Navigation (Bottom Tabs)
* **Depolama:** AsyncStorage
* **Grafikler:** React Native Chart Kit
* **Görsellik:** React Native SVG, Expo Vector Icons

## ⚙️ Kurulum ve Çalıştırma

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

1. **Repoyu Klonlayın:**
   ```bash
   git clone [https://github.com/Sem1hh/Focuser.git](https://github.com/Sem1hh/Focuser.git)


2. **Proje Klasörüne Girin:**
   ```bash 
   cd Focuser

3. **Gerekli Paketleri Yükleyin:**
      ```bash 
      npm install

4. **Uygulamayı Başlatın:**
      ```bash 
      npx expo start


5. **Test Edin:**
      ```bash 
      Terminalde çıkan QR kodu telefonunuzdaki Expo Go uygulaması ile taratın.
6.
