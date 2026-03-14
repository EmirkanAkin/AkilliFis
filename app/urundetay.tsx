import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function UrunDetayiScreen() {
  const router = useRouter();

  const kategoriler = [
    {
      id: 1,
      ad: "Sebze / Meyve",
      kalem: 1,
      toplam: "30,50 TL",
      renk: "#4CAF50",
      ikon: "nutrition",
      detaylar: [{ isim: "Elma 1kg", fiyat: "30,50 TL" }],
    },
    {
      id: 2,
      ad: "Temizlik",
      kalem: 2,
      toplam: "120,00 TL",
      renk: "#2196F3",
      ikon: "water",
      detaylar: [
        { isim: "Çamaşır Suyu", fiyat: "45,00 TL" },
        { isim: "Deterjan", fiyat: "75,00 TL" },
      ],
    },
    {
      id: 3,
      ad: "Süt & Süt Ürünleri",
      kalem: 2,
      toplam: "54,00 TL",
      renk: "#FF9800",
      ikon: "pint",
      detaylar: [
        { isim: "Süt 1L", fiyat: "18,50 TL" },
        { isim: "Yoğurt", fiyat: "35,50 TL" },
      ],
    },
    {
      id: 4,
      ad: "İçecek",
      kalem: 1,
      toplam: "45,00 TL",
      renk: "#795548",
      ikon: "cafe",
      detaylar: [{ isim: "Kahve", fiyat: "45,00 TL" }],
    },
    {
      id: 5,
      ad: "Diğer",
      kalem: 2,
      toplam: "40,00 TL",
      renk: "#9C27B0",
      ikon: "bag-handle",
      detaylar: [
        { isim: "Poşet", fiyat: "5,00 TL" },
        { isim: "Naylon eldiven", fiyat: "35,00 TL" },
      ],
    },
  ];

  return (
    <View style={styles.anaEkran}>
      <View style={styles.ustBar}>
        <TouchableOpacity
          style={styles.geriButon}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.sayfaBaslik}>Ürün Detayları</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <LinearGradient
          colors={["rgba(39, 39, 42, 0.90)", "rgba(30, 30, 35, 0.90)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ozetKarti}
        >
          <View style={styles.ozetSolKisim}>
            <View style={styles.ozetHeader}>
              <View style={styles.ikonZemini}>
                <Text style={styles.ikonHarf}>M</Text>
              </View>
              <View>
                <Text style={styles.magazaAd}>MİGROS ALIŞVERİŞİ</Text>
                <Text style={styles.tarihMetin}>28 EKİM 2023</Text>
              </View>
            </View>

            <View style={styles.bilgiSatiri}>
              <Ionicons
                name="location-outline"
                size={14}
                color="rgba(255,255,255,0.35)"
              />
              <Text style={styles.bilgiMetin}>Migros, Bağcılar Şubesi</Text>
            </View>
            <View style={styles.bilgiSatiri}>
              <Ionicons
                name="pricetag-outline"
                size={14}
                color="rgba(255,255,255,0.35)"
              />
              <Text style={styles.bilgiMetin}>
                Market{" "}
                <Text style={{ color: "rgba(255, 255, 255, 0.20)" }}>·</Text> 8
                kalem
              </Text>
            </View>

            <View style={styles.tutarRozeti}>
              <Text style={styles.tutarMetinGoster}>289,50</Text>
              <Text style={styles.tutarMetinTL}> TL</Text>
            </View>
          </View>

          <View style={styles.miniFisKutu}>
            <View style={styles.fisUstCizgi} />
            <View style={styles.fisNoktaliAyrac} />
            <View style={styles.fisSatirCizgi} />
            <View style={[styles.fisSatirCizgi, { width: "50%" }]} />
            <View style={styles.fisSatirCizgi} />
            <View style={[styles.fisSatirCizgi, { width: "70%" }]} />
            <View style={styles.fisToplamCizgi} />
          </View>
        </LinearGradient>

        <View style={styles.kategorilerBaslikSatiri}>
          <Text style={styles.altBaslik}>KATEGORİLER</Text>
          <Text style={styles.urunSayisi}>8 ürün</Text>
        </View>

        {kategoriler.map((kat) => (
          <View key={kat.id} style={styles.kategoriKarti}>
            <View style={styles.kategoriHeader}>
              <View
                style={[
                  styles.kategoriIkonZemin,
                  { backgroundColor: `${kat.renk}26` },
                ]}
              >
                <Ionicons name={kat.ikon as any} size={18} color={kat.renk} />
              </View>
              <View style={styles.kategoriBaslikBilgi}>
                <Text style={styles.kategoriAd}>{kat.ad}</Text>
                <Text style={styles.kategoriKalem}>{kat.kalem} kalem</Text>
              </View>
              <Text style={styles.kategoriToplamTutar}>{kat.toplam}</Text>
            </View>

            <View style={styles.urunlerListesi}>
              {kat.detaylar.map((urun, index) => (
                <View key={index} style={styles.urunSatiri}>
                  <Text style={styles.urunAd}>
                    · {urun.isim} — {urun.fiyat}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 5. ALT SABİT BUTONLAR */}
      <View style={styles.altButonlarKapsayici}>
        <TouchableOpacity style={styles.altButonTekli} activeOpacity={0.7}>
          <Ionicons
            name="pencil-outline"
            size={16}
            color="rgba(255, 255, 255, 0.80)"
          />
          <Text style={styles.altButonMetin}>Harcamayı Düzenle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  anaEkran: { flex: 1, backgroundColor: "#0A0A0A" },
  ustBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  geriButon: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  sayfaBaslik: { color: "white", fontSize: 18, fontWeight: "700" },

  ozetKarti: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 30,
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
      },
      android: { elevation: 10 },
    }),
  },
  ozetSolKisim: { flex: 1 },
  ozetHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  ikonZemini: {
    width: 34,
    height: 34,
    backgroundColor: "#1DB954",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#1DB954",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: { elevation: 6, shadowColor: "#1DB954" },
    }),
  },
  ikonHarf: { color: "white", fontSize: 15, fontWeight: "800" },
  magazaAd: { color: "white", fontSize: 15, fontWeight: "700" },
  tarihMetin: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 10,
    fontWeight: "400",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  bilgiSatiri: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  bilgiMetin: {
    color: "rgba(255, 255, 255, 0.35)",
    fontSize: 11,
    fontWeight: "400",
  },
  tutarRozeti: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(29, 185, 84, 0.10)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.25)",
  },
  tutarMetinGoster: { color: "white", fontSize: 18, fontWeight: "800" },
  tutarMetinTL: {
    color: "#1DB954",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },

  miniFisKutu: {
    width: 80,
    height: 110,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  fisUstCizgi: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    marginBottom: 8,
  },
  fisNoktaliAyrac: {
    width: "100%",
    height: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 8,
  },
  fisSatirCizgi: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    marginBottom: 6,
  },
  fisToplamCizgi: {
    width: "80%",
    height: 6,
    backgroundColor: "#1DB954",
    borderRadius: 3,
    marginTop: "auto",
    alignSelf: "flex-end",
  },

  kategorilerBaslikSatiri: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  altBaslik: {
    color: "rgba(255, 255, 255, 0.50)",
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: 1,
  },
  urunSayisi: { color: "#1DB954", fontSize: 11, fontWeight: "600" },

  kategoriKarti: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  kategoriHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  kategoriIkonZemin: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  kategoriBaslikBilgi: { flex: 1 },
  kategoriAd: { color: "white", fontSize: 14, fontWeight: "600" },
  kategoriKalem: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 11,
    marginTop: 2,
  },
  kategoriToplamTutar: { color: "white", fontSize: 14, fontWeight: "700" },

  urunlerListesi: { paddingLeft: 52 },
  urunSatiri: { marginBottom: 6 },
  urunAd: {
    color: "rgba(255, 255, 255, 0.35)",
    fontSize: 11,
    fontWeight: "400",
  },

  // ALT SABİT BUTON
  altButonlarKapsayici: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  altButonTekli: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    backgroundColor: "rgba(0,0,0,0.85)",
    gap: 10,
  },
  altButonMetin: {
    color: "rgba(255, 255, 255, 0.80)",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
