import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  // Veri Kontrolü: [] boş ekranı, [1] dolu ekranı tetikler
  const [harcamalar, setHarcamalar] = useState([1]);
  const [aylikButce, setAylikButce] = useState(18000);

  // Sekme değiştirip geri gelindiğinde sayfayı en yukarı sıfırlar
  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  // 1. SENARYO: ANALİZ VERİSİ YOKSA (BOŞ EKRAN)
  if (harcamalar.length === 0) {
    return (
      <ScrollView
        ref={scrollRef}
        style={styles.bosAnaEkran}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.kapsayiciBos}>
          <View style={styles.baslikAlaniBos}>
            <Text style={styles.ustBaslikBos}>ANA SAYFA</Text>
            <Text style={styles.merhabaMetinBos}>Merhaba! 👋</Text>
          </View>

          <LinearGradient
            colors={["rgba(29, 185, 84, 0.15)", "rgba(29, 185, 84, 0.08)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.toplamKartiBos}
          >
            <Text style={styles.toplamEtiketBos}>TOPLAM HARCAMA</Text>
            <View style={styles.paraAlaniBos}>
              <Text style={styles.sifirRakamBos}>0,00</Text>
              <Text style={styles.paraBirimiBos}>TL</Text>
            </View>
            <Text style={styles.altBilgiMetinBos}>Bu ay hiç harcama yok</Text>
          </LinearGradient>

          <View style={styles.butceKartiBos}>
            <View style={styles.butceUstBilgiBos}>
              <Text style={styles.butceEtiketBos}>AYLIK BÜTÇE</Text>
              <Text style={styles.yuzdeMetinBos}>%0</Text>
            </View>
            <View style={styles.butceOrtaBilgiBos}>
              <Text style={styles.butceSifirBos}>0,00</Text>
              <Text style={styles.butceToplamBos}>
                {" "}
                / {aylikButce.toLocaleString("tr-TR")} TL
              </Text>
            </View>
            <View style={styles.progressBarZeminBos}>
              <LinearGradient
                colors={["#1DB954", "#15A043"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBarIciBos, { width: "0%" }]}
              />
            </View>
          </View>

          <View style={styles.sonHarcamalarAlaniBos}>
            <Text style={styles.sonHarcamalarBaslikBos}>Son Harcamalar</Text>
            <View style={styles.bosListeKartiBos}>
              <View style={styles.bosIkonZeminBos}>
                <Ionicons
                  name="receipt-outline"
                  size={28}
                  color="rgba(255, 255, 255, 0.20)"
                />
              </View>
              <Text style={styles.bosListeMetinBos}>Henüz harcama yok</Text>
            </View>
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  // 2. SENARYO: VERİ VARSA (DOLU EKRAN)
  return (
    <ScrollView
      ref={scrollRef}
      style={styles.doluAnaEkran}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.ustBilgiKutusu}>
        <View>
          <Text style={styles.merhabaYazisi}>MERHABA</Text>
          <Text style={styles.isimYazisi}>Emirkan 👋</Text>
        </View>
        <TouchableOpacity activeOpacity={0.6} style={styles.profilIkonu}>
          <Ionicons name="notifications-outline" size={22} color="white" />
          <View style={styles.aktifNoktasi} />
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={["#1A2A1A", "#1E3A2E", "#1A2820"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.butceKarti}
      >
        <Text style={styles.kartBaslik}>TOPLAM HARCAMA (BU AY)</Text>
        <View style={styles.paraKutusu}>
          <Text style={styles.paraMiktari}>14.580</Text>
          <Text style={styles.paraBirimi}>TL</Text>
        </View>
        <Text style={styles.altAciklama}>
          Ocak ayında harcanan toplam tutar
        </Text>
        <View style={styles.progresMetinKutusu}>
          <Text style={styles.progresYuzde}>BÜTÇENİN %81'İ</Text>
          <Text style={styles.progresLimit}>
            {aylikButce.toLocaleString("tr-TR")} TL bütçe
          </Text>
        </View>
        <View style={styles.cubukZemin}>
          <LinearGradient
            colors={["#1DB954", "#15A344"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.cubukDolgu, { width: "81%" }]}
          />
        </View>
        <View style={styles.istatistikKutusu}>
          <View style={styles.istatistikOgesi}>
            <Ionicons name="trending-up" size={16} color="#1DB954" />
            <Text style={styles.istatistikYazisi}>Geçen aya göre +12%</Text>
          </View>
          <View style={styles.istatistikOgesi}>
            <Ionicons name="trending-down" size={16} color="#FF6B6B" />
            <Text style={styles.istatistikYazisi}>3.420 TL kaldı</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.butonlarSatiri}>
        <TouchableOpacity
          style={styles.butonGrup}
          activeOpacity={0.7}
          onPress={() => router.push("/kamera")}
        >
          <LinearGradient
            colors={["rgba(29, 185, 84, 0.25)", "rgba(29, 185, 84, 0.1)"]}
            style={styles.yuvarlakButon}
          >
            <Ionicons name="camera-outline" size={26} color="#1DB954" />
          </LinearGradient>
          <Text style={styles.butonMetni}>Harcama Ekle</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.butonGrup} activeOpacity={0.7}>
          <View style={styles.yuvarlakButonSiyah}>
            <Ionicons
              name="time-outline"
              size={24}
              color="rgba(255,255,255,0.8)"
            />
          </View>
          <Text style={styles.butonMetni}>Geçmişi Gör</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.butonGrup}
          activeOpacity={0.7}
          onPress={() => router.push("/analiz")}
        >
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

      <View style={styles.listeBaslikSatiri}>
        <Text style={styles.listeBasligi}>Son Harcamalar</Text>
        <TouchableOpacity style={styles.tumuButonKapsayici} activeOpacity={0.6}>
          <Text style={styles.tumuButonu}>Tümü</Text>
          <Ionicons name="chevron-forward" size={14} color="#1DB954" />
        </TouchableOpacity>
      </View>

      <View style={styles.listeKutusu}>
        <TouchableOpacity
          style={styles.harcamaOgesi}
          activeOpacity={0.7}
          onPress={() => router.push("/urundetay")}
        >
          <View
            style={[
              styles.ikonZemini,
              { backgroundColor: "#1DB954" },
              styles.migrosNeonGolge,
            ]}
          >
            <Text style={styles.ikonHarf}>M</Text>
          </View>
          <View style={styles.harcamaBilgi}>
            <Text style={styles.harcamaAd}>Migros</Text>
            <Text style={styles.harcamaKategori}>Market · 28 Eki</Text>
          </View>
          <View style={styles.fiyatVeOkKapsayici}>
            <Text style={styles.harcamaTutar}>-289,50 TL</Text>
            <Ionicons
              name="chevron-forward"
              size={12}
              color="rgba(255,255,255,0.25)"
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.harcamaOgesi} activeOpacity={0.7}>
          <View
            style={[
              styles.ikonZemini,
              { backgroundColor: "#00704A" },
              styles.starbucksNeonGolge,
            ]}
          >
            <Text style={styles.ikonHarf}>S</Text>
          </View>
          <View style={styles.harcamaBilgi}>
            <Text style={styles.harcamaAd}>Starbucks</Text>
            <Text style={styles.harcamaKategori}>Kafe · 27 Eki</Text>
          </View>
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
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bosAnaEkran: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  kapsayiciBos: { gap: 24 },
  baslikAlaniBos: { gap: 4 },
  ustBaslikBos: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 11,
    fontWeight: "400",
    letterSpacing: 1,
  },
  merhabaMetinBos: { color: "white", fontSize: 26, fontWeight: "800" },
  toplamKartiBos: {
    padding: 25,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.20)",
    gap: 8,
  },
  toplamEtiketBos: {
    color: "rgba(255, 255, 255, 0.50)",
    fontSize: 11,
    fontWeight: "400",
    letterSpacing: 1,
  },
  paraAlaniBos: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  sifirRakamBos: { color: "#1DB954", fontSize: 42, fontWeight: "800" },
  paraBirimiBos: { color: "#1DB954", fontSize: 20, fontWeight: "600" },
  altBilgiMetinBos: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 12,
    fontWeight: "400",
    marginTop: 4,
  },
  butceKartiBos: {
    backgroundColor: "#18181B",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 21,
    gap: 12,
  },
  butceUstBilgiBos: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  butceEtiketBos: {
    color: "rgba(255, 255, 255, 0.50)",
    fontSize: 11,
    fontWeight: "400",
    letterSpacing: 1,
  },
  yuzdeMetinBos: { color: "#1DB954", fontSize: 12, fontWeight: "600" },
  butceOrtaBilgiBos: { flexDirection: "row", alignItems: "baseline" },
  butceSifirBos: { color: "white", fontSize: 28, fontWeight: "800" },
  butceToplamBos: { color: "rgba(255, 255, 255, 0.40)", fontSize: 14 },
  progressBarZeminBos: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 10,
    marginTop: 4,
    overflow: "hidden",
  },
  progressBarIciBos: { height: "100%", borderRadius: 10 },
  sonHarcamalarAlaniBos: { gap: 16 },
  sonHarcamalarBaslikBos: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  bosListeKartiBos: {
    backgroundColor: "#18181B",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  bosIkonZeminBos: {
    width: 64,
    height: 64,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  bosListeMetinBos: { color: "rgba(255, 255, 255, 0.35)", fontSize: 14 },

  doluAnaEkran: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  ustBilgiKutusu: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  merhabaYazisi: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: 0.5,
  },
  isimYazisi: { color: "white", fontSize: 24, fontWeight: "700" },
  profilIkonu: {
    width: 42,
    height: 42,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  aktifNoktasi: {
    width: 8,
    height: 8,
    backgroundColor: "#1DB954",
    borderRadius: 4,
    position: "absolute",
    top: 8,
    right: 10,
    borderWidth: 1.5,
    borderColor: "#000000",
  },
  butceKarti: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.20)",
    padding: 24,
    borderTopWidth: 1.5,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
    ...Platform.select({
      ios: {
        shadowColor: "#1DB954",
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 32,
        shadowOpacity: 0.12,
      },
      android: { elevation: 12, shadowColor: "#1DB954" },
    }),
  },
  kartBaslik: {
    color: "rgba(255, 255, 255, 0.50)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  paraKutusu: { flexDirection: "row", alignItems: "baseline", marginBottom: 4 },
  paraMiktari: { color: "white", fontSize: 38, fontWeight: "800" },
  paraBirimi: {
    color: "rgba(255, 255, 255, 0.60)",
    fontSize: 20,
    fontWeight: "500",
    marginLeft: 6,
  },
  altAciklama: {
    color: "rgba(255, 255, 255, 0.35)",
    fontSize: 12,
    marginBottom: 24,
  },
  progresMetinKutusu: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progresYuzde: {
    color: "rgba(255, 255, 255, 0.50)",
    fontSize: 11,
    letterSpacing: 1,
  },
  progresLimit: { color: "#1DB954", fontSize: 11, fontWeight: "600" },
  cubukZemin: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    borderRadius: 3,
    overflow: "hidden",
  },
  cubukDolgu: { height: "100%", borderRadius: 3, backgroundColor: "#1DB954" },
  istatistikKutusu: { flexDirection: "row", marginTop: 16, gap: 16 },
  istatistikOgesi: { flexDirection: "row", alignItems: "center", gap: 6 },
  istatistikYazisi: { color: "rgba(255, 255, 255, 0.50)", fontSize: 11 },
  butonlarSatiri: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    marginBottom: 30,
  },
  butonGrup: { alignItems: "center", gap: 8, flex: 1 },
  yuvarlakButon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.35)",
  },
  yuvarlakButonSiyah: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  butonMetni: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 11,
    fontWeight: "500",
  },
  listeBaslikSatiri: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  listeBasligi: { color: "white", fontSize: 18, fontWeight: "700" },
  tumuButonKapsayici: { flexDirection: "row", alignItems: "center" },
  tumuButonu: {
    color: "#1DB954",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  listeKutusu: { gap: 12 },
  harcamaOgesi: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  ikonZemini: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  ikonHarf: { color: "white", fontSize: 16, fontWeight: "800" },
  harcamaBilgi: { flex: 1, marginLeft: 12 },
  harcamaAd: { color: "white", fontSize: 14, fontWeight: "600" },
  harcamaKategori: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 12,
    marginTop: 2,
  },
  fiyatVeOkKapsayici: {
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  harcamaTutar: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  migrosNeonGolge: {
    ...Platform.select({
      ios: {
        shadowColor: "#1DB954",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: { elevation: 8, shadowColor: "#1DB954" },
    }),
  },
  starbucksNeonGolge: {
    ...Platform.select({
      ios: {
        shadowColor: "#00704A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: { elevation: 8, shadowColor: "#00704A" },
    }),
  },
});
