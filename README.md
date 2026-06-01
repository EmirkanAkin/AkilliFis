<div align="center">

# 🧾 Akıllı Fiş

### Yapay Zeka Destekli Kişisel Harcama Takip Uygulaması

[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

*Fişini tara, harcamalarını anında analiz et.*

</div>

---

## 📱 Uygulama Hakkında

**Akıllı Fiş**, market ve mağaza fişlerini yapay zeka ile otomatik olarak okuyup analiz eden, kişisel bütçe yönetimini kolaylaştıran bir mobil uygulamadır. Google Gemini 2.5 Flash modeli sayesinde fiş görseli saniyeler içinde işlenir; ürünler, fiyatlar ve kategoriler otomatik olarak çıkarılır.

---

## ✨ Özellikler

| Özellik | Açıklama |
|---|---|
| 📷 **Akıllı Fiş Tarama** | Kamera veya galeriden fiş fotoğrafı çek, AI tüm detayları otomatik okusun |
| 🤖 **Gemini AI Entegrasyonu** | Google'ın en güncel vision modeli ile %95+ doğruluk oranı |
| ✏️ **Manuel Fiş Girişi** | AI olmadan da kolayca harcama ekle |
| 📊 **Harcama Analizi** | Kategorilere göre detaylı raporlar ve grafikler |
| 💰 **Bütçe Yönetimi** | Aylık bütçe belirle, limitlere yaklaştığında uyarı al |
| 🔐 **Güvenli Hesap** | Firebase Authentication ile kişisel veri güvenliği |
| ☁️ **Bulut Senkronizasyon** | Firestore ile tüm veriler anlık senkronize |

---

## 🛠️ Teknoloji Yığını

```
📱 Frontend       →  React Native 0.81 + Expo 54
🔷 Dil            →  TypeScript
🧭 Navigasyon     →  Expo Router (File-based routing)
🤖 Yapay Zeka     →  Google Gemini 2.5 Flash (Vision)
🔥 Backend        →  Firebase (Auth + Firestore)
🗄️ State          →  Zustand
🎨 UI             →  Custom Components + Expo Linear Gradient
📸 Kamera         →  Expo Camera + Image Manipulator
```

---

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+
- npm veya yarn
- Expo Go uygulaması (test için) veya Android/iOS emülatör

### Adımlar

```bash
# 1. Repoyu klonla
git clone https://github.com/kullaniciadi/akillifis.git
cd akillifis

# 2. Bağımlılıkları yükle
npm install

# 3. Ortam değişkenlerini ayarla
cp .env.example .env
# .env dosyasını düzenle (aşağıya bak)

# 4. Uygulamayı başlat
npx expo start
```

### Ortam Değişkenleri

`.env` dosyasını oluşturup aşağıdaki değerleri doldur:

```env
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

> ⚠️ **Güvenlik:** `.env` dosyasını asla Git'e commit etme. `.gitignore` dosyasına eklenmiştir.

---

## 🤖 Gemini API Kurulumu

1. [Google AI Studio](https://aistudio.google.com/app/apikey) adresine git
2. **"Create API Key"** butonuna tıkla
3. Oluşturulan key'i `.env` dosyasına yapıştır

> API kimlik doğrulaması `x-goog-api-key` header yöntemiyle yapılmaktadır.

---

## 📂 Proje Yapısı

```
akillifis/
├── app/
│   ├── (tabs)/          # Ana sekmeler (Ana Sayfa, Raporlar, Ayarlar)
│   ├── kamera.tsx       # Fiş tarama ekranı (AI entegrasyonu)
│   ├── fisdogrulama.tsx # AI çıktısını düzenleme ekranı
│   ├── manuelfis.tsx    # Manuel fiş girişi
│   ├── urundetay.tsx    # Ürün detay görünümü
│   └── _layout.tsx      # Uygulama layout & navigasyon
├── components/          # Yeniden kullanılabilir UI bileşenleri
├── store/
│   └── useStore.ts      # Zustand global state yönetimi
├── constants/           # Renkler, sabitler
├── firebaseConfig.ts    # Firebase yapılandırması
└── .env                 # Ortam değişkenleri (git'e eklenmez)
```

---

## 📸 Nasıl Çalışır?

```
1. Kullanıcı fişi kameraya tutar veya galeriden seçer
        ↓
2. Görsel sıkıştırılır ve Base64'e çevrilir
        ↓
3. Gemini 2.5 Flash'a gönderilir (x-goog-api-key header)
        ↓
4. AI fişi analiz eder → JSON formatında döner
        ↓
5. Ürünler, fiyatlar ve kategoriler otomatik doldurulur
        ↓
6. Kullanıcı onaylar → Firebase Firestore'a kaydedilir
```

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

<div align="center">

**Akıllı Fiş** · Emirkan Akın · 2025

*Google Gemini AI & Firebase ile güçlendirilmiştir*

</div>
