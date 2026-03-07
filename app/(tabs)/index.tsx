// React Native kütüphanesinden temel görsel bileşenleri alıyoruz.
import {
  StyleSheet, // Görünmez kutular oluşturmak için (Div gibi).
  Text,
  View, // Görünmez kutular oluşturmak için (Div gibi).
} from "react-native";

// Expo'nun hazır ikon paketinden 'Ionicons' setini dahil ediyoruz.
import { Ionicons } from "@expo/vector-icons";

// Bütçe kartının arka planındaki renk geçişi (gradient) eklentisini dahil ediyoruz.
import { LinearGradient } from "expo-linear-gradient";

// Uygulamanın başlangıç noktası olan HomeScreen fonksiyonunu başlatıyoruz.
export default function HomeScreen() {
  return (
    /* ANA EKRAN: Tüm içeriği içine alan en dış kutu. */
    <View style={styles.anaEkran}>
      {/* ÜST BİLGİ (HEADER): Selamlama ve İkonun yan yana durduğu satır. */}
      <View style={styles.ustBilgiKutusu}>
        {/* YAZI GRUBU: İki metni alt alta tutan iç kutu. */}
        <View>
          {/* Soluk ve küçük 'MERHABA' yazısı. */}
          <Text style={styles.merhabaYazisi}>MERHABA</Text>
          {/* Kalın ve beyaz kullanıcı ismi. */}
          <Text style={styles.isimYazisi}>Emirkan 👋</Text>
        </View>

        {/* İKON KUTUSU: Bildirim çanı ve yeşil noktayı tutan kutu. */}
        <View style={styles.profilIkonu}>
          {/* Çizgisel beyaz bildirim çanı ikonu. */}
          <Ionicons name="notifications-outline" size={22} color="white" />
          {/* Sağ üste yapıştırılmış küçük yeşil bildirim noktası. */}
          <View style={styles.aktifNoktasi} />
        </View>
      </View>

      {/* BÜTÇE KARTI: Renk geçişli ana görsel alan. */}
      <LinearGradient
        /* Kartın zeminindeki 3 ana koyu yeşil tonu. */
        colors={["#1A2A1A", "#1E3A2E", "#1A2820"]}
        /* Renk geçişi sol üst köşeden başlasın. */
        start={{ x: 0, y: 0 }}
        /* Renk geçişi sağ alt köşede bitsin. */
        end={{ x: 1, y: 1 }}
        /* Kartın şekil ve boşluk ayarlarını bağlıyoruz. */
        style={styles.butceKarti}
      >
        {/* Kartın içindeki küçük başlık metni. */}
        <Text style={styles.kartBaslik}>TOPLAM HARCAMA (BU AY)</Text>

        {/* PARA GRUBU: Rakam ve TL yazısını yan yana dizen kutu. */}
        <View style={styles.paraKutusu}>
          {/* Ana harcama rakamı. */}
          <Text style={styles.paraMiktari}>14.580</Text>
          {/* Rakamın yanındaki birim yazısı. */}
          <Text style={styles.paraBirimi}>TL</Text>
        </View>

        {/* Rakamın altındaki soluk açıklama. */}
        <Text style={styles.altAciklama}>
          Ocak ayında harcanan toplam tutar
        </Text>

        {/* PROGRES METİNLERİ: Yüzde ve limit bilgisini iki uca yayan kutu. */}
        <View style={styles.progresMetinKutusu}>
          {/* Sol uçtaki yüzde bilgisi. */}
          <Text style={styles.progresYuzde}>BÜTÇENİN %81'İ</Text>
          {/* Sağ uçtaki toplam limit bilgisi. */}
          <Text style={styles.progresLimit}>18.000 TL bütçe</Text>
        </View>

        {/* ÇUBUK ZEMİNİ: İlerleme barının gri arka planı. */}
        <View style={styles.cubukZemin}>
          {/* YEŞİL DOLGU: Harcama oranına göre dolan parlak kısım. */}
          <LinearGradient
            /* Dolgunun içindeki iki tonlu yeşil geçiş. */
            colors={["#1DB954", "#15A344"]}
            /* Geçiş soldan sağa doğru aksın. */
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            /* Genişlik %81, köşeler ve parlama ayarları. */
            style={[styles.cubukDolgu, { width: "81%" }, styles.cubukParlamasi]}
          />
        </View>

        {/* İSTATİSTİK ALANI: Ok işaretleri ve karşılaştırmalı veriler. */}
        <View style={styles.istatistikKutusu}>
          {/* SOL ÖGE: Artış miktarını gösteren ikonlu grup. */}
          <View style={styles.istatistikOgesi}>
            {/* Yeşil yukarı ok ikonu. */}
            <Ionicons name="trending-up" size={16} color="#1DB954" />
            {/* Artış yüzdesi metni. */}
            <Text style={styles.istatistikYazisi}>Geçen aya göre +12%</Text>
          </View>

          {/* SAĞ ÖGE: Kalan parayı gösteren ikonlu grup. */}
          <View style={styles.istatistikOgesi}>
            {/* Kırmızı aşağı ok ikonu. */}
            <Ionicons name="trending-down" size={16} color="#FF6B6B" />
            {/* Kalan tutar metni. */}
            <Text style={styles.istatistikYazisi}>3.420 TL kaldı</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// STİL DOSYASI: Tasarım özelliklerinin tek tek tanımlandığı yer.
const styles = StyleSheet.create({
  anaEkran: {
    // Tüm ekranı kapla.
    flex: 1,
    // Arka plan rengini siyah yap.
    backgroundColor: "#000000",
    // Sağ ve soldan 20 birim iç boşluk bırak.
    paddingHorizontal: 20,
    // Üstteki saat kısmından 60 birim aşağı in.
    paddingTop: 60,
  },
  ustBilgiKutusu: {
    // İçindekileri yan yana (yatay) diz.
    flexDirection: "row",
    // Elemanları iki uca yasla, arayı aç.
    justifyContent: "space-between",
    // Elemanları dikeyde birbirine göre ortala.
    alignItems: "center",
    // Altındaki karta 30 birim uzaklaş.
    marginBottom: 30,
  },
  merhabaYazisi: {
    // %45 opaklıkta beyaz renk ver.
    color: "rgba(255, 255, 255, 0.45)",
    // Metin boyutunu 13 yap.
    fontSize: 13,
    // Yazı kalınlığını normal (ince) tut.
    fontWeight: "400",
    // Harfler arasına 0.5 birim boşluk koy.
    letterSpacing: 0.5,
  },
  isimYazisi: {
    // Tam beyaz renk ver.
    color: "white",
    // Metin boyutunu 24 yap.
    fontSize: 24,
    // Yazıyı kalın (bold) yap.
    fontWeight: "700",
  },
  profilIkonu: {
    // Kutu genişliğini 42 yap.
    width: 42,
    // Kutu yüksekliğini 42 yap.
    height: 42,
    // %6 opaklıkta beyaz arka plan ver.
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    // Köşeleri 14 birim yuvarlat.
    borderRadius: 14,
    // 1 birim kalınlığında çerçeve çiz.
    borderWidth: 1,
    // Çerçevenin rengini %8 opaklıkta beyaz yap.
    borderColor: "rgba(255, 255, 255, 0.08)",
    // İkonu yatayda ortala.
    justifyContent: "center",
    // İkonu dikeyde ortala.
    alignItems: "center",
  },
  aktifNoktasi: {
    // Genişlik 8 birim.
    width: 8,
    // Yükseklik 8 birim.
    height: 8,
    // Neon yeşil renk.
    backgroundColor: "#1DB954",
    // Tam yuvarlak olması için yarıçap ver.
    borderRadius: 4,
    // Diğer elemanları ezerek serbest konuma geç.
    position: "absolute",
    // Yukarıdan 8 birim aşağı kaydır.
    top: 8,
    // Sağdan 10 birim sola kaydır.
    right: 10,
    // 1.5 birim kalınlığında çerçeve.
    borderWidth: 1.5,
    // Çerçeveyi siyah yaparak ayrıştır.
    borderColor: "#000000",
  },
  butceKarti: {
    // Köşeleri 24 birim yumuşat.
    borderRadius: 24,
    // 1 birim çerçeve kalınlığı.
    borderWidth: 1,
    // Çerçeveyi çok hafif bir yeşil yap.
    borderColor: "rgba(29, 185, 84, 0.20)",
    // Kartın içindeki ögelere 24 birim boşluk ver.
    padding: 24,
  },
  kartBaslik: {
    // Metin rengini %50 opaklıkta beyaz yap.
    color: "rgba(255, 255, 255, 0.50)",
    // Boyut 11 birim.
    fontSize: 11,
    // Yarı kalın font seç.
    fontWeight: "600",
    // Harf aralığını geniş tut (1.5).
    letterSpacing: 1.5,
    // Altındaki rakama 8 birim uzaklaş.
    marginBottom: 8,
  },
  paraKutusu: {
    // Sayı ve TL'yi yan yana diz.
    flexDirection: "row",
    // İki metnin alt çizgisini hizala.
    alignItems: "baseline",
    // Altındaki metne 4 birim uzaklaş.
    marginBottom: 4,
  },
  paraMiktari: {
    // Beyaz renk.
    color: "white",
    // Büyük boy font (38).
    fontSize: 38,
    // En kalın font ağırlığı.
    fontWeight: "800",
  },
  paraBirimi: {
    // %60 opaklıkta beyaz renk.
    color: "rgba(255, 255, 255, 0.60)",
    // 20 birim boyut.
    fontSize: 20,
    // Rakamın sağında 6 birim boşluk bırak.
    marginLeft: 6,
  },
  altAciklama: {
    // %35 opaklıkta soluk beyaz.
    color: "rgba(255, 255, 255, 0.35)",
    // 12 birim boyut.
    fontSize: 12,
    // Altındaki progres bara 24 birim uzaklaş.
    marginBottom: 24,
  },
  progresMetinKutusu: {
    // Yazıları yan yana diz.
    flexDirection: "row",
    // İki yazı arasına maksimum boşluk koy.
    justifyContent: "space-between",
    // Dikeyde ortala.
    alignItems: "center",
    // Altındaki çubuğa 8 birim uzaklaş.
    marginBottom: 8,
  },
  progresYuzde: {
    // %50 opak beyaz.
    color: "rgba(255, 255, 255, 0.50)",
    // 11 birim boyut.
    fontSize: 11,
    // Harf aralığı 1 birim.
    letterSpacing: 1,
  },
  progresLimit: {
    // Vurgulu neon yeşil renk.
    color: "#1DB954",
    // 11 birim boyut.
    fontSize: 11,
    // Kalın font.
    fontWeight: "600",
  },
  cubukZemin: {
    // Çubuk yüksekliği 6 birim.
    height: 6,
    // %10 opak beyaz zemin.
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    // Yuvarlak köşeler.
    borderRadius: 3,
    // İçteki taşmaları kes.
    overflow: "hidden",
  },
  cubukDolgu: {
    // Zemini dikeyde tam doldur.
    height: "100%",
    // Yuvarlak köşeler.
    borderRadius: 3,
  },
  cubukParlamasi: {
    // Gölge rengi yeşil.
    shadowColor: "#1DB954",
    // Gölgeyi yayma oranı (Android/iOS ortak ayar).
    shadowOpacity: 0.5,
    // Gölge yumuşaklığı.
    shadowRadius: 10,
    // Android için gölge derinliği.
    elevation: 5,
  },
  istatistikKutusu: {
    // Grupları yan yana diz.
    flexDirection: "row",
    // Üstteki çubuğa 16 birim uzaklaş.
    marginTop: 16,
    // Gruplar arası 16 birim boşluk bırak.
    gap: 16,
  },
  istatistikOgesi: {
    // İkon ve yazıyı yan yana diz.
    flexDirection: "row",
    // Dikeyde ortala.
    alignItems: "center",
    // İkon ve yazı arası 6 birim boşluk.
    gap: 6,
  },
  istatistikYazisi: {
    // %50 opak beyaz.
    color: "rgba(255, 255, 255, 0.50)",
    // 11 birim boyut.
    fontSize: 11,
  },
});
