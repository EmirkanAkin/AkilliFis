import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebaseConfig";
import { useStore } from "../../store/useStore";

// 1. TARİH FORMATLAMA ("DD.MM.YYYY" -> Date)
const parseTarih = (tarihStr: string) => {
  if (!tarihStr) return new Date();
  const parts = tarihStr.split(".");
  if (parts.length === 3) {
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }
  return new Date();
};

// 2. KISA TARİH FORMATI (24 Ekim)
const kisaTarihFormati = (tarihStr: string) => {
  if (!tarihStr) return "";
  const dateObj = parseTarih(tarihStr);
  if (!isNaN(dateObj.getTime())) {
    return dateObj.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
    });
  }
  return tarihStr;
};

// 3. MARKAYA GÖRE RENK ATAMA (MADDE 2)
const getMarkaRengi = (markaAd: string) => {
  if (!markaAd) return "#1DB954";
  const m = markaAd.toLowerCase();
  if (m.includes("trendyol") || m.includes("a101")) return "#FF6000";
  if (
    m.includes("bim") ||
    m.includes("netflix") ||
    m.includes("mediamarkt") ||
    m.includes("youtube")
  )
    return "#D62828";
  if (m.includes("getir") || m.includes("carrefour") || m.includes("watsons"))
    return "#5D00D2";
  if (m.includes("starbucks") || m.includes("kahve")) return "#00704A";
  if (m.includes("migros") || m.includes("spotify")) return "#1DB954";
  return "#1DB954";
};

export default function HomeScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { uid, isim, butce, setIsim, setButce } = useStore();

  const [yukleniyor, setYukleniyor] = useState(true);
  const [harcamalar, setHarcamalar] = useState<any[]>([]);

  // BÜTÇE VE HARCAMA HESAPLAMALARI (DÜZELTİLDİ)
  const simdi = new Date();
  const mevcutAy = simdi.getMonth();
  const mevcutYil = simdi.getFullYear();

  let buAyHarcama = 0;
  let gecenAyHarcama = 0;

  harcamalar.forEach((h) => {
    // 🔴 ÇÖZÜM: Artık olusturulma_tarihi'ne DEĞİL, fişin üstündeki asıl tarihe bakıyor
    const dateObj = parseTarih(h.tarih);
    const hAy = dateObj.getMonth();
    const hYil = dateObj.getFullYear();

    if (hAy === mevcutAy && hYil === mevcutYil) {
      buAyHarcama += Number(h.toplam_tutar) || 0;
    } else if (
      (mevcutAy === 0 && hAy === 11 && hYil === mevcutYil - 1) ||
      (mevcutAy > 0 && hAy === mevcutAy - 1 && hYil === mevcutYil)
    ) {
      gecenAyHarcama += Number(h.toplam_tutar) || 0;
    }
  });

  const butceSayi = Number(butce?.replace(/\./g, "") || 0);
  const dolulukYuzdesi = butceSayi > 0 ? (buAyHarcama / butceSayi) * 100 : 0;
  const kalanPara = butceSayi - buAyHarcama;

  // UI İÇİN GEÇEN AY KIYASLAMA METNİ
  let harcamaFarkiMetni = "";
  let harcamaFarkiIkon = "remove-outline";
  let harcamaFarkiRenk = "rgba(255, 255, 255, 0.50)";

  if (gecenAyHarcama === 0) {
    harcamaFarkiMetni = "Geçen ay veri yok";
  } else {
    const fark = buAyHarcama - gecenAyHarcama;
    if (fark > 0) {
      harcamaFarkiMetni = `${fark.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL daha fazla`;
      harcamaFarkiIkon = "trending-up";
      harcamaFarkiRenk = "#FF4B4B";
    } else if (fark < 0) {
      harcamaFarkiMetni = `${Math.abs(fark).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL daha az`;
      harcamaFarkiIkon = "trending-down";
      harcamaFarkiRenk = "#1DB954";
    } else {
      harcamaFarkiMetni = "Geçen ayla aynı";
      harcamaFarkiRenk = "#1DB954";
    }
  }

  useEffect(() => {
    const aktifUid = uid || auth.currentUser?.uid;
    if (aktifUid) {
      const userUnsub = onSnapshot(
        doc(db, "Kullanicilar", aktifUid),
        (snap) => {
          if (snap.exists()) {
            const veri = snap.data();
            setIsim(veri.isim || "Misafir");
            setButce(veri.aylik_butce || "0");
          }
        },
      );

      const q = query(
        collection(db, "Fisler"),
        where("kullanici_id", "==", aktifUid),
      );
      const fisUnsub = onSnapshot(q, (snapshot) => {
        const veriler = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 🔴 ÇÖZÜM: Verileri en yeniden eskiye doğru kesin olarak sıralıyoruz.
        const siraliVeriler = veriler.sort(
          (a: any, b: any) =>
            parseTarih(b.tarih).getTime() - parseTarih(a.tarih).getTime(),
        );

        setHarcamalar(siraliVeriler);
        setYukleniyor(false);
      });

      return () => {
        userUnsub();
        fisUnsub();
      };
    } else {
      setYukleniyor(false);
    }
  }, [uid]);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  const navigasyonYap = (rota: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(rota);
  };

  if (yukleniyor) {
    return (
      <View
        style={[
          styles.doluAnaEkran,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  // 1. SENARYO: BOŞ EKRAN
  if (harcamalar.length === 0) {
    return (
      <ScrollView
        ref={scrollRef}
        style={styles.bosAnaEkran}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.kapsayiciBos}>
          <View style={styles.baslikAlaniBos}>
            <Text style={styles.ustBaslikBos}>ANA SAYFA</Text>
            <Text style={styles.merhabaMetinBos}>Merhaba, {isim}! 👋</Text>
          </View>
          <LinearGradient
            colors={["rgba(29, 185, 84, 0.15)", "rgba(29, 185, 84, 0.08)"]}
            style={styles.toplamKartiBos}
          >
            <Text style={styles.toplamEtiketBos}>TOPLAM HARCAMA</Text>
            <View style={styles.paraAlaniBos}>
              <Text style={styles.sifirRakamBos}>0,00</Text>
              <Text style={styles.paraBirimiBos}>TL</Text>
            </View>
            <Text style={styles.altBilgiMetinBos}>
              Bu ay henüz fiş taranmadı
            </Text>
          </LinearGradient>
          <View style={styles.butceKartiBos}>
            <View style={styles.butceUstBilgiBos}>
              <Text style={styles.butceEtiketBos}>AYLIK BÜTÇE</Text>
              <Text style={styles.yuzdeMetinBos}>%0</Text>
            </View>
            <View style={styles.butceOrtaBilgiBos}>
              <Text style={styles.butceSifirBos}>0,00</Text>
              <Text style={styles.butceToplamBos}> / {butce} TL</Text>
            </View>
            <View style={styles.progressBarZeminBos}>
              <View
                style={[
                  styles.progressBarIciBos,
                  { width: "0%", backgroundColor: "#1DB954" },
                ]}
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
      </ScrollView>
    );
  }

  // 2. SENARYO: DOLU EKRAN
  return (
    <ScrollView
      ref={scrollRef}
      style={styles.doluAnaEkran}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.ustBilgiKutusu}>
        <View>
          <Text style={styles.merhabaYazisi}>MERHABA</Text>
          <Text style={styles.isimYazisi}>{isim} 👋</Text>
        </View>
      </View>

      <LinearGradient
        colors={["#1A2A1A", "#1E3A2E", "#1A2820"]}
        style={styles.butceKarti}
      >
        <Text style={styles.kartBaslik}>TOPLAM HARCAMA (BU AY)</Text>
        <View style={styles.paraKutusu}>
          <Text style={styles.paraMiktari}>
            {buAyHarcama.toLocaleString("tr-TR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <Text style={styles.paraBirimi}>TL</Text>
        </View>
        <Text style={styles.altAciklama}>Bu ay harcanan toplam tutar</Text>
        <View style={styles.progresMetinKutusu}>
          <Text style={styles.progresYuzde}>
            BÜTÇENİN %{Math.min(Math.round(dolulukYuzdesi), 100)}'Sİ
          </Text>
          <Text style={styles.progresLimit}>{butce} TL bütçe</Text>
        </View>
        <View style={styles.cubukZemin}>
          <View
            style={[
              styles.cubukDolgu,
              {
                width: `${dolulukYuzdesi > 100 ? 100 : dolulukYuzdesi}%`,
                backgroundColor: dolulukYuzdesi > 100 ? "#FF4B4B" : "#1DB954",
              },
            ]}
          />
        </View>
        <View style={styles.istatistikKutusu}>
          <View style={styles.istatistikOgesi}>
            <Ionicons
              name={harcamaFarkiIkon as any}
              size={16}
              color={harcamaFarkiRenk}
            />
            <Text
              style={[styles.istatistikYazisi, { color: harcamaFarkiRenk }]}
            >
              {harcamaFarkiMetni}
            </Text>
          </View>
          <View style={styles.istatistikOgesi}>
            <Ionicons
              name={kalanPara > 0 ? "wallet-outline" : "trending-down"}
              size={16}
              color={kalanPara > 0 ? "rgba(255,255,255,0.5)" : "#FF4B4B"}
            />
            <Text
              style={[
                styles.istatistikYazisi,
                { color: kalanPara > 0 ? "rgba(255,255,255,0.5)" : "#FF4B4B" },
              ]}
            >
              {kalanPara > 0
                ? `${kalanPara.toLocaleString("tr-TR")} TL kaldı`
                : "Bütçe aşıldı"}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* BUTONLAR */}
      <View style={styles.butonlarSatiri}>
        <TouchableOpacity
          style={styles.butonGrup}
          activeOpacity={0.7}
          onPress={() => navigasyonYap("/kamera")}
        >
          <LinearGradient
            colors={["rgba(29, 185, 84, 0.25)", "rgba(29, 185, 84, 0.1)"]}
            style={styles.yuvarlakButon}
          >
            <Ionicons name="camera-outline" size={26} color="#1DB954" />
          </LinearGradient>
          <Text style={styles.butonMetni}>Harcama Ekle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.butonGrup}
          activeOpacity={0.7}
          onPress={() => navigasyonYap("/harcamalar")}
        >
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
          onPress={() => navigasyonYap("/analiz")}
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
        <TouchableOpacity
          style={styles.tumuButonu}
          activeOpacity={0.6}
          onPress={() => navigasyonYap("/harcamalar")}
        >
          <Text style={styles.tumuMetin}>Tümü</Text>
          <Ionicons name="chevron-forward" size={14} color="#1DB954" />
        </TouchableOpacity>
      </View>

      <View style={styles.listeKutusu}>
        {harcamalar.slice(0, 5).map((item) => {
          const markaRengi = getMarkaRengi(item.magaza_adi);
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.harcamaOgesi}
              activeOpacity={0.7}
              onPress={() =>
                navigasyonYap({
                  pathname: "/urundetay",
                  params: { id: item.id },
                })
              }
            >
              {/* 🔴 ÇÖZÜM: Markaya Özel Dinamik İkon Rengi ve Gölgesi (Madde 2) */}
              <View
                style={[
                  styles.ikonZemini,
                  { backgroundColor: markaRengi },
                  Platform.select({
                    ios: {
                      shadowColor: markaRengi,
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.25,
                      shadowRadius: 10,
                    },
                    android: { elevation: 6, shadowColor: markaRengi },
                  }),
                ]}
              >
                <Text style={styles.ikonHarf}>
                  {item.magaza_adi?.[0]?.toUpperCase() || "?"}
                </Text>
              </View>

              <View style={styles.harcamaBilgi}>
                <Text style={styles.harcamaAd} numberOfLines={1}>
                  {item.magaza_adi}
                </Text>
                <Text style={styles.harcamaKategori}>
                  {item.kategori || "Market"} · {kisaTarihFormati(item.tarih)}
                </Text>
              </View>

              <View style={styles.harcamaSagTaraf}>
                <Text style={styles.harcamaTutar}>
                  -
                  {Number(item.toplam_tutar).toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  TL
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="rgba(255, 255, 255, 0.40)"
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
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
    letterSpacing: 0.5,
  },
  isimYazisi: { color: "white", fontSize: 24, fontWeight: "700" },
  butceKarti: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.20)",
    padding: 24,
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
  cubukDolgu: { height: "100%", borderRadius: 3 },
  istatistikKutusu: { flexDirection: "row", marginTop: 16, gap: 16 },
  istatistikOgesi: { flexDirection: "row", alignItems: "center", gap: 6 },
  istatistikYazisi: {
    color: "rgba(255, 255, 255, 0.50)",
    fontSize: 11,
    fontWeight: "500",
  },
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
  tumuButonu: { flexDirection: "row", alignItems: "center", gap: 2 },
  tumuMetin: { color: "#1DB954", fontSize: 14, fontWeight: "500" },
  listeKutusu: { gap: 12 },
  harcamaOgesi: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  ikonZemini: {
    width: 42,
    height: 42,
    backgroundColor: "#1DB954",
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  ikonHarf: { color: "white", fontSize: 16, fontWeight: "800" },
  harcamaBilgi: { flex: 1, marginLeft: 12, justifyContent: "center", gap: 2 },
  harcamaAd: { color: "white", fontSize: 14, fontWeight: "600" },
  harcamaKategori: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 12,
    fontWeight: "500",
  },
  harcamaSagTaraf: { alignItems: "flex-end", justifyContent: "center", gap: 2 },
  harcamaTutar: { color: "white", fontSize: 14, fontWeight: "700" },
});
