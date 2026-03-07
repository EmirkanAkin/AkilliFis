/* GEREKLİ ARAÇLARIN İÇERİ AKTARILMASI */
import {
  // Sayfa içeriğinin (ScrollView gibi) dikeyde kaymasını sağlar.
  ScrollView,
  // CSS benzeri stil kurallarını yazdığımız JavaScript nesnesi.
  StyleSheet,
  // Ekrana her türlü metni (yazıyı) basmak için kullanılır.
  Text,
  // Tıklandığında şeffaflaşarak (Opacity) görsel geri bildirim veren buton yapısı.
  TouchableOpacity,
  // Diğer bileşenleri gruplamak için kullanılan temel kutu (div) bileşeni.
  View,
} from "react-native";

// Expo'nun sunduğu hazır ikon kütüphanesinden 'Ionicons' setini çağırıyoruz.
import { Ionicons } from "@expo/vector-icons";

// İki veya daha fazla renk arasında yumuşak geçiş sağlayan arka plan bileşeni.
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  return (
    /* ScrollView: İçerik ekran boyunu aşarsa aşağı kaydırmayı aktif eder. */
    <ScrollView style={styles.anaEkran} showsVerticalScrollIndicator={false}>
      {/* 1. HEADER (BAŞLIK) BÖLÜMÜ */}
      <View style={styles.ustBilgiKutusu}>
        {/* Sol taraftaki yazı alanı */}
        <View>
          {/* Saydam beyaz renkte 'MERHABA' başlığı */}
          <Text style={styles.merhabaYazisi}>MERHABA</Text>
          {/* Kullanıcının isminin yazdığı büyük ve kalın metin */}
          <Text style={styles.isimYazisi}>Emirkan 👋</Text>
        </View>

        {/* --- YENİ: Bildirim İkonu Artık Tıklanabilir --- */}
        <TouchableOpacity activeOpacity={0.6} style={styles.profilIkonu}>
          {/* Çizgisel stilde beyaz bildirim çanı */}
          <Ionicons name="notifications-outline" size={22} color="white" />
          {/* Bildirim olduğunu belirten küçük, neon yeşil aktiflik noktası */}
          <View style={styles.aktifNoktasi} />
        </TouchableOpacity>
      </View>

      {/* 2. BÜTÇE KARTI BÖLÜMÜ */}
      <LinearGradient
        /* Kartın zeminindeki koyu yeşil tonlarını sırasıyla belirliyoruz. */
        colors={["#1A2A1A", "#1E3A2E", "#1A2820"]}
        /* Geçişin sol üst köşeden başlamasını sağlar. */
        start={{ x: 0, y: 0 }}
        /* Geçişin sağ alt köşede bitmesini sağlar. */
        end={{ x: 1, y: 1 }}
        /* Kartın kenar kıvrımları ve gölgeleri için stili bağlıyoruz. */
        style={styles.butceKarti}
      >
        {/* Kart içindeki küçük açıklama başlığı */}
        <Text style={styles.kartBaslik}>TOPLAM HARCAMA (BU AY)</Text>

        {/* Miktar ve TL birimini yan yana tutan kutu */}
        <View style={styles.paraKutusu}>
          {/* Harcanan tutarı gösteren devasa beyaz rakamlar */}
          <Text style={styles.paraMiktari}>14.580</Text>
          {/* Para birimini gösteren daha küçük metin */}
          <Text style={styles.paraBirimi}>TL</Text>
        </View>

        {/* Miktarın altındaki soluk açıklama metni */}
        <Text style={styles.altAciklama}>
          Ocak ayında harcanan toplam tutar
        </Text>

        {/* İlerleme durumu (Progress) metin alanı */}
        <View style={styles.progresMetinKutusu}>
          {/* Bütçenin doluluk oranını söyleyen yüzde */}
          <Text style={styles.progresYuzde}>BÜTÇENİN %81'İ</Text>
          {/* Toplam bütçe limitini gösteren yeşil metin */}
          <Text style={styles.progresLimit}>18.000 TL bütçe</Text>
        </View>

        {/* Çubuğun arkasındaki gri zemin kutusu */}
        <View style={styles.cubukZemin}>
          {/* Çubuğun içindeki yeşil dolgu alanı */}
          <LinearGradient
            /* Parlak yeşilden koyu yeşile geçiş. */
            colors={["#1DB954", "#15A344"]}
            /* Geçişin soldan sağa doğru olmasını sağlar. */
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            /* Genişlik %81, köşeler ve parlamayı stil olarak veriyoruz. */
            style={[styles.cubukDolgu, { width: "81%" }, styles.cubukParlamasi]}
          />
        </View>

        {/* İstatistik oklarını (artış ve kalan) tutan satır */}
        <View style={styles.istatistikKutusu}>
          {/* Sol taraftaki artış bilgisi */}
          <View style={styles.istatistikOgesi}>
            {/* Yukarı yönlü yeşil grafik oku */}
            <Ionicons name="trending-up" size={16} color="#1DB954" />
            <Text style={styles.istatistikYazisi}>Geçen aya göre +12%</Text>
          </View>
          {/* Sağ taraftaki kalan bütçe bilgisi */}
          <View style={styles.istatistikOgesi}>
            {/* Aşağı yönlü kırmızı grafik oku */}
            <Ionicons name="trending-down" size={16} color="#FF6B6B" />
            <Text style={styles.istatistikYazisi}>3.420 TL kaldı</Text>
          </View>
        </View>
      </LinearGradient>

      {/* 3. HIZLI AKSİYONLAR BÖLÜMÜ */}
      <View style={styles.butonlarSatiri}>
        {/* Harcama Ekle: Kamera ikonlu buton */}
        <TouchableOpacity style={styles.butonGrup} activeOpacity={0.7}>
          {/* Butonun içindeki yeşilimsi renk geçişli yuvarlak */}
          <LinearGradient
            colors={["rgba(29, 185, 84, 0.25)", "rgba(29, 185, 84, 0.1)"]}
            style={styles.yuvarlakButon}
          >
            {/* Fiş tarama hissi veren kamera ikonu */}
            <Ionicons name="camera-outline" size={26} color="#1DB954" />
          </LinearGradient>
          {/* Butonun altındaki açıklama yazısı */}
          <Text style={styles.butonMetni}>Harcama Ekle</Text>
        </TouchableOpacity>

        {/* Geçmişi Gör: Saat ikonlu buton */}
        <TouchableOpacity style={styles.butonGrup} activeOpacity={0.7}>
          {/* Siyah/gri yuvarlak arka plan */}
          <View style={styles.yuvarlakButonSiyah}>
            <Ionicons
              name="time-outline"
              size={24}
              color="rgba(255,255,255,0.8)"
            />
          </View>
          <Text style={styles.butonMetni}>Geçmişi Gör</Text>
        </TouchableOpacity>

        {/* Analiz: Pasta grafiği ikonlu buton */}
        <TouchableOpacity style={styles.butonGrup} activeOpacity={0.7}>
          {/* Siyah/gri yuvarlak arka plan */}
          <View style={styles.yuvarlakButonSiyah}>
            <Ionicons
              name="pie-chart-outline"
              size={24}
              color="rgba(255,255,255,0.8)"
            />
          </View>
          <Text style={styles.butonMetni}>Analiz</Text>
        </TouchableOpacity>
      </View>

      {/* 4. SON HARCAMALAR BAŞLIĞI */}
      <View style={styles.listeBaslikSatiri}>
        {/* 'Son Harcamalar' ana başlığı */}
        <Text style={styles.listeBasligi}>Son Harcamalar</Text>
        {/* 'Tümü >' butonu */}
        <TouchableOpacity style={styles.tumuButonKapsayici} activeOpacity={0.6}>
          <Text style={styles.tumuButonu}>Tümü</Text>
          <Ionicons name="chevron-forward" size={14} color="#1DB954" />
        </TouchableOpacity>
      </View>

      {/* 5. HARCAMA LİSTESİ */}
      <View style={styles.listeKutusu}>
        {/* MİGROS SATIRI */}
        <TouchableOpacity style={styles.harcamaOgesi} activeOpacity={0.7}>
          {/* Kurumsal renkli (Yeşil) logo zemini */}
          <View style={[styles.ikonZemini, { backgroundColor: "#1DB954" }]}>
            <Text style={styles.ikonHarf}>M</Text>
          </View>
          {/* İsim ve kategori bilgisi */}
          <View style={styles.harcamaBilgi}>
            <Text style={styles.harcamaAd}>Migros</Text>
            <Text style={styles.harcamaKategori}>Market · 28 Eki</Text>
          </View>
          {/* SAĞ TARAF: Fiyat üstte, Ok işareti altta */}
          <View style={styles.fiyatVeOkKapsayici}>
            <Text style={styles.harcamaTutar}>-289,50 TL</Text>
            <Ionicons
              name="chevron-forward"
              size={12}
              color="rgba(255,255,255,0.25)"
            />
          </View>
        </TouchableOpacity>

        {/* STARBUCKS SATIRI */}
        <TouchableOpacity style={styles.harcamaOgesi} activeOpacity={0.7}>
          {/* Kurumsal renkli (Koyu Yeşil) logo zemini */}
          <View style={[styles.ikonZemini, { backgroundColor: "#00704A" }]}>
            <Text style={styles.ikonHarf}>S</Text>
          </View>
          {/* İsim ve kategori bilgisi */}
          <View style={styles.harcamaBilgi}>
            <Text style={styles.harcamaAd}>Starbucks</Text>
            <Text style={styles.harcamaKategori}>Kafe · 27 Eki</Text>
          </View>
          {/* SAĞ TARAF: Fiyat üstte, Ok işareti altta */}
          <View style={styles.fiyatVeOkKapsayici}>
            <Text style={styles.harcamaTutar}>-124,00 TL</Text>
            <Ionicons
              name="chevron-forward"
              size={12}
              color="rgba(255,255,255,0.25)"
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* ScrollView sonunda içerik bitince ferah bir boşluk */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/* TASARIM (CSS) BÖLÜMÜ */
const styles = StyleSheet.create({
  anaEkran: {
    // Tüm ekranı kapla (Flexbox mantığı).
    flex: 1,
    // Arka plan rengini siyah yap.
    backgroundColor: "#000000",
    // Yanlardan 20 birim iç boşluk bırak.
    paddingHorizontal: 20,
    // Üstten 60 birim boşluk bırak.
    paddingTop: 60,
  },
  ustBilgiKutusu: {
    // İçindeki elemanları yan yana diz.
    flexDirection: "row",
    // Elemanları iki uca yasla (Biri tam sol, biri tam sağ).
    justifyContent: "space-between",
    // Dikeyde birbirine göre ortala.
    alignItems: "center",
    // Altındaki bütçe kartına 30 birim uzaklaş.
    marginBottom: 30,
  },
  merhabaYazisi: {
    // Saydam beyaz renk ver.
    color: "rgba(255, 255, 255, 0.45)",
    // Font boyutunu 13 yap.
    fontSize: 13,
    // Yazıyı normal kalınlıkta (400) tut.
    fontWeight: "400",
    // Harfler arasına 0.5 boşluk koy.
    letterSpacing: 0.5,
  },
  isimYazisi: {
    // Tam beyaz renk ver.
    color: "white",
    // Font boyutunu 24 yaparak büyüt.
    fontSize: 24,
    // Yazıyı kalın yap.
    fontWeight: "700",
  },
  profilIkonu: {
    // Kutu genişliğini 42 yap.
    width: 42,
    // Kutu yüksekliğini 42 yap.
    height: 42,
    // Saydam beyaz arka plan ver.
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    // Köşeleri 14 birim yuvarlat.
    borderRadius: 14,
    // Kenarlık kalınlığı 1.
    borderWidth: 1,
    // Kenarlık rengini çok hafif saydam yap.
    borderColor: "rgba(255, 255, 255, 0.12)",
    // İkonu kutunun tam ortasına hizala (Yatay).
    justifyContent: "center",
    // İkonu kutunun tam ortasına hizala (Dikey).
    alignItems: "center",
  },
  aktifNoktasi: {
    // Genişlik ve yükseklik 8.
    width: 8,
    height: 8,
    // Neon yeşil renk ver.
    backgroundColor: "#1DB954",
    // Tam yuvarlak olması için yarıçap ver.
    borderRadius: 4,
    // İkonun üzerine uçması için pozisyonu mutlak (Absolute) yap.
    position: "absolute",
    // Üstten 8 birim aşağı kaydır.
    top: 8,
    // Sağdan 10 birim sola kaydır.
    right: 10,
    // Nokta etrafına siyah sınır çizgisi ekle.
    borderWidth: 1.5,
    borderColor: "#000000",
  },
  butceKarti: {
    // Kartın köşelerini 24 birim yumuşat.
    borderRadius: 24,
    // Hafif yeşil kenarlık çizgisi ekle.
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.20)",
    // Kart içindeki elemanlara 24 birim boşluk ver.
    padding: 24,
    // Yeşil neon gölge rengini seç.
    shadowColor: "#1DB954",
    // Gölge saydamlığını ayarla.
    shadowOpacity: 0.15,
    // Gölgenin yayılma yumuşaklığını ver.
    shadowRadius: 20,
    // Android sisteminde gölgeyi görünür yap.
    elevation: 10,
  },
  kartBaslik: {
    // %50 saydam beyaz.
    color: "rgba(255, 255, 255, 0.50)",
    // Boyutu 11 yap.
    fontSize: 11,
    // Yarı kalın font seç.
    fontWeight: "600",
    // Harf aralığını genişlet.
    letterSpacing: 1.5,
    // Altındaki paraya 8 birim mesafe koy.
    marginBottom: 8,
  },
  paraKutusu: {
    // Miktar ve TL'yi yan yana diz.
    flexDirection: "row",
    // Yazıları alt taban çizgisine göre hizala.
    alignItems: "baseline",
    // Alttaki açıklamaya 4 birim mesafe koy.
    marginBottom: 4,
  },
  paraMiktari: {
    // Beyaz renk.
    color: "white",
    // Devasa boyut (38).
    fontSize: 38,
    // En kalın yazı stili.
    fontWeight: "800",
  },
  paraBirimi: {
    // %60 saydam beyaz.
    color: "rgba(255, 255, 255, 0.60)",
    // Rakamın yanında daha küçük (20) kalsın.
    fontSize: 20,
    // Orta kalınlık.
    fontWeight: "500",
    // Rakamla arasına 6 birim boşluk bırak.
    marginLeft: 6,
  },
  altAciklama: {
    // Çok soluk beyaz.
    color: "rgba(255, 255, 255, 0.35)",
    fontSize: 12,
    // Progress bara 24 birim uzaklaş.
    marginBottom: 24,
  },
  progresMetinKutusu: {
    // Metinleri iki uca yasla.
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // Altındaki çubuğa 8 birim uzaklaş.
    marginBottom: 8,
  },
  progresYuzde: {
    // %50 saydam beyaz.
    color: "rgba(255, 255, 255, 0.50)",
    fontSize: 11,
    letterSpacing: 1,
  },
  progresLimit: {
    // Vurgulu yeşil renk.
    color: "#1DB954",
    fontSize: 11,
    fontWeight: "600",
  },
  cubukZemin: {
    // Çubuğun yüksekliği 6.
    height: 6,
    // %10 saydam beyaz (Gri görünür).
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    // Köşeleri yuvarlat.
    borderRadius: 3,
    // İçindeki taşmaları gizle.
    overflow: "hidden",
  },
  cubukDolgu: {
    // Zemin yüksekliğini tam kapla.
    height: "100%",
    // Köşeleri yuvarlat.
    borderRadius: 3,
  },
  cubukParlamasi: {
    // Neon yeşil gölge.
    shadowColor: "#1DB954",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  istatistikKutusu: {
    // Verileri yan yana diz.
    flexDirection: "row",
    // Üstteki çubuğa mesafe.
    marginTop: 16,
    // Elemanlar arası boşluk.
    gap: 16,
  },
  istatistikOgesi: {
    // İkon ve yazıyı yan yana diz.
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  istatistikYazisi: {
    // %50 saydam beyaz.
    color: "rgba(255, 255, 255, 0.50)",
    fontSize: 11,
  },
  butonlarSatiri: {
    // Üç butonu yan yana diz.
    flexDirection: "row",
    // Aralarını eşit mesafede aç.
    justifyContent: "space-between",
    // Üstteki karta mesafe.
    marginTop: 30,
    // Alt başlığa mesafe.
    marginBottom: 30,
  },
  butonGrup: {
    // Elemanları merkezde topla.
    alignItems: "center",
    gap: 8,
    // Sayfada eşit pay almalarını sağla.
    flex: 1,
  },
  yuvarlakButon: {
    // Butonun çapını belirle.
    width: 58,
    height: 58,
    // Köşeleri tam yuvarlak yap.
    borderRadius: 29,
    // İkonu tam merkeze koy.
    justifyContent: "center",
    alignItems: "center",
    // İnce kenarlık çizgisi.
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.35)",
  },
  yuvarlakButonSiyah: {
    width: 58,
    height: 58,
    borderRadius: 29,
    // Mobilde görünürlük için %8 saydamlık.
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  butonMetni: {
    // %60 saydam beyaz.
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 11,
    fontWeight: "500",
  },
  listeBaslikSatiri: {
    // Başlık ve 'Tümü' linkini yan yana diz.
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // Listeye olan mesafe.
    marginBottom: 15,
  },
  listeBasligi: {
    // Tam beyaz ve büyük.
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  tumuButonKapsayici: {
    // Yazı ve oku yan yana getir.
    flexDirection: "row",
    alignItems: "center",
  },
  tumuButonu: {
    // Parlak yeşil.
    color: "#1DB954",
    fontSize: 14,
    fontWeight: "600",
    // Ok işaretiyle arasına boşluk bırak.
    marginRight: 4,
  },
  listeKutusu: {
    // Her harcama satırı arasına 12 birim boşluk.
    gap: 12,
  },
  harcamaOgesi: {
    // İkon, Bilgi ve Fiyatı yan yana diz.
    flexDirection: "row",
    alignItems: "center",
    // Mobilde görünürlük için %12 opaklık.
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    // İç boşluk 14.
    padding: 14,
    // Köşeleri yumuşat.
    borderRadius: 16,
    // Belirgin kenarlık çizgisi.
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.20)",
  },
  ikonZemini: {
    // Logonun arkasındaki kutunun boyutu.
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  ikonHarf: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },
  harcamaBilgi: {
    // Kalan tüm alanı kaplayarak fiyatı sağa iter.
    flex: 1,
    // Logodan uzaklaş.
    marginLeft: 12,
  },
  harcamaAd: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  harcamaKategori: {
    // Soluk kategori ismi.
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 12,
    marginTop: 2,
  },
  // Fiyat ve oku dikeyde (Alt alta) ve en sağda (End) hizalar.
  fiyatVeOkKapsayici: {
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  harcamaTutar: {
    // Beyaz ve kalın fiyat.
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    // Ok işaretiyle arasına minik mesafe.
    marginBottom: 4,
  },
});
