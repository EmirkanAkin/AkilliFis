import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebaseConfig";
import { useStore } from "../../store/useStore";

export default function HomeScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { uid, isim, butce, setIsim, setButce } = useStore();
  const [yukleniyor, setYukleniyor] = useState(true);
  const [harcamalar, setHarcamalar] = useState<any[]>([]);

  const toplamHarcamaTutari = harcamalar.reduce(
    (toplam, h) => toplam + (Number(h.toplam_tutar) || 0),
    0,
  );
  const butceSayi = Number(butce?.replace(/\./g, "") || 0);
  const dolulukYuzdesi =
    butceSayi > 0 ? (toplamHarcamaTutari / butceSayi) * 100 : 0;
  const kalanPara = butceSayi - toplamHarcamaTutari;

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
        orderBy("olusturulma_tarihi", "desc"),
      );
      const fisUnsub = onSnapshot(q, (snapshot) => {
        const yeniHarcamalar = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHarcamalar(yeniHarcamalar);
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
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  // 2. SENARYO: DOLU EKRAN
  return (
    <ScrollView
      ref={scrollRef}
      style={styles.doluAnaEkran}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.ustBilgiKutusu}>
        <View>
          <Text style={styles.merhabaYazisi}>MERHABA</Text>
          <Text style={styles.isimYazisi}>{isim} 👋</Text>
        </View>
        <TouchableOpacity activeOpacity={0.6} style={styles.profilIkonu}>
          <Ionicons name="notifications-outline" size={22} color="white" />
          <View style={styles.aktifNoktasi} />
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={["#1A2A1A", "#1E3A2E", "#1A2820"]}
        style={styles.butceKarti}
      >
        <Text style={styles.kartBaslik}>TOPLAM HARCAMA (BU AY)</Text>
        <View style={styles.paraKutusu}>
          <Text style={styles.paraMiktari}>
            {toplamHarcamaTutari.toLocaleString("tr-TR")}
          </Text>
          <Text style={styles.paraBirimi}>TL</Text>
        </View>
        <Text style={styles.altAciklama}>Bu ay harcanan toplam tutar</Text>
        <View style={styles.progresMetinKutusu}>
          <Text style={styles.progresYuzde}>
            BÜTÇENİN %{Math.round(dolulukYuzdesi)}'Sİ
          </Text>
          <Text style={styles.progresLimit}>{butce} TL bütçe</Text>
        </View>
        <View style={styles.cubukZemin}>
          <View
            style={[
              styles.cubukDolgu,
              {
                width: `${dolulukYuzdesi > 100 ? 100 : dolulukYuzdesi}%`,
                backgroundColor: "#1DB954",
              },
            ]}
          />
        </View>
        <View style={styles.istatistikKutusu}>
          <View style={styles.istatistikOgesi}>
            <Ionicons name="trending-up" size={16} color="#1DB954" />
            <Text style={styles.istatistikYazisi}>Sistem Aktif</Text>
          </View>
          <View style={styles.istatistikOgesi}>
            <Ionicons name="trending-down" size={16} color="#FF4B4B" />
            <Text style={[styles.istatistikYazisi, { color: "#FF4B4B" }]}>
              {kalanPara.toLocaleString("tr-TR")} TL kaldı
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* BUTONLAR */}
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

        {/* DÜZELTİLEN YER: GEÇMİŞİ GÖR BUTONU ARTIK ÇALIŞIYOR */}
        <TouchableOpacity
          style={styles.butonGrup}
          activeOpacity={0.7}
          onPress={() => router.push("/harcamalar")}
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
      </View>

      <View style={styles.listeKutusu}>
        {harcamalar.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.harcamaOgesi}
            activeOpacity={0.7}
            onPress={() =>
              router.push({ pathname: "/urundetay", params: { id: item.id } })
            }
          >
            <View style={[styles.ikonZemini, { backgroundColor: "#1DB954" }]}>
              <Text style={styles.ikonHarf}>{item.magaza_adi?.[0] || "?"}</Text>
            </View>
            <View style={styles.harcamaBilgi}>
              <Text style={styles.harcamaAd}>{item.magaza_adi}</Text>
              <Text style={styles.harcamaKategori}>{item.tarih}</Text>
            </View>
            <Text style={styles.harcamaTutar}>-{item.toplam_tutar} TL</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// STİLLER AYNI (Senin orijinal stillerin)
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
  profilIkonu: {
    width: 42,
    height: 42,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
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
  harcamaTutar: { color: "white", fontSize: 14, fontWeight: "700" },
});
