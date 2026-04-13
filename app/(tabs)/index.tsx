import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebaseConfig";
import { useStore } from "../../store/useStore";

const parseTarih = (tarihStr: string) => {
  if (!tarihStr) return new Date();
  const parts = tarihStr.split(".");
  if (parts.length === 3) {
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }
  return new Date();
};

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

  // SİLME İŞLEMİ İÇİN STATELER
  const [silmeModalAcik, setSilmeModalAcik] = useState(false);
  const [silinecekFisId, setSilinecekFisId] = useState<string | null>(null);
  const [siliyor, setSiliyor] = useState(false);

  const simdi = new Date();
  const mevcutAy = simdi.getMonth();
  const mevcutYil = simdi.getFullYear();

  let buAyHarcama = 0;

  harcamalar.forEach((h) => {
    const dateObj = parseTarih(h.tarih);
    const hAy = dateObj.getMonth();
    const hYil = dateObj.getFullYear();

    if (hAy === mevcutAy && hYil === mevcutYil) {
      buAyHarcama += Number(h.toplam_tutar) || 0;
    }
  });

  const butceSayi = Number(butce?.replace(/\./g, "") || 0);
  const dolulukYuzdesi = butceSayi > 0 ? (buAyHarcama / butceSayi) * 100 : 0;

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

        const siraliVeriler = veriler.sort((a: any, b: any) => {
          const dateA = parseTarih(a.tarih).getTime();
          const dateB = parseTarih(b.tarih).getTime();
          if (dateA !== dateB) return dateB - dateA;

          const timeA = a.olusturulma_tarihi?.toMillis
            ? a.olusturulma_tarihi.toMillis()
            : 0;
          const timeB = b.olusturulma_tarihi?.toMillis
            ? b.olusturulma_tarihi.toMillis()
            : 0;
          return timeB - timeA;
        });

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

  const fisiSil = async () => {
    if (!silinecekFisId) return;
    setSiliyor(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      await deleteDoc(doc(db, "Fisler", silinecekFisId));
      const q = query(
        collection(db, "Urunler"),
        where("fis_id", "==", silinecekFisId),
      );
      const snap = await getDocs(q);
      const silmeIslemleri = snap.docs.map((d) =>
        deleteDoc(doc(db, "Urunler", d.id)),
      );
      await Promise.all(silmeIslemleri);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSiliyor(false);
      setSilmeModalAcik(false);
      setSilinecekFisId(null);
    }
  };

  if (yukleniyor) {
    return (
      <View
        style={[
          styles.anaEkran,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        style={styles.anaEkran}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* MERHABA BÖLÜMÜ */}
        <View style={styles.ustBilgiKutusu}>
          <Text style={styles.merhabaYazisi}>ANA SAYFA</Text>
          <Text style={styles.isimYazisi}>
            {isim ? `Merhaba, ${isim}! 👋` : "Merhaba! 👋"}
          </Text>
        </View>

        {/* 1. KART: TOPLAM HARCAMA (YEŞİL KART) */}
        <LinearGradient
          colors={["rgba(29, 185, 84, 0.15)", "rgba(29, 185, 84, 0.08)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.figmaToplamHarcamaKarti}
        >
          <Text style={styles.figmaButceUstBaslik}>TOPLAM HARCAMA</Text>
          <View style={styles.figmaParaKutusu}>
            <Text style={styles.figmaAnaPara}>
              {buAyHarcama.toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <Text style={styles.figmaTL}>TL</Text>
          </View>
          <Text style={styles.figmaAltMetin}>
            {buAyHarcama === 0
              ? "Bu ay hiç harcama yok"
              : "Bu ay harcanan toplam tutar"}
          </Text>
        </LinearGradient>

        {/* 2. KART: AYLIK BÜTÇE (KOYU GRİ KART) */}
        <View style={styles.figmaAylikButceKarti}>
          <View style={styles.figmaIcUstSatir}>
            <Text style={styles.figmaIcBaslik}>AYLIK BÜTÇE</Text>
            <Text style={styles.figmaIcYuzde}>
              %{Math.min(Math.round(dolulukYuzdesi), 100)}
            </Text>
          </View>
          <View style={styles.figmaIcRakamKutusu}>
            <Text style={styles.figmaIcHarcanan}>
              {buAyHarcama.toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <Text style={styles.figmaIcLimit}>
              / {butceSayi.toLocaleString("tr-TR")} TL
            </Text>
          </View>
          <View style={styles.figmaProgresZemin}>
            <LinearGradient
              colors={
                dolulukYuzdesi > 100
                  ? ["#FF4B4B", "#E53935"]
                  : ["#1DB954", "#15A043"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.figmaProgresDolgu,
                { width: `${dolulukYuzdesi > 100 ? 100 : dolulukYuzdesi}%` },
              ]}
            />
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigasyonYap("/kamera")}
          style={styles.tekliKameraButonZemin}
        >
          <LinearGradient
            colors={["#1DB954", "#15A043"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tekliKameraButonIc}
          >
            <Ionicons name="scan-outline" size={22} color="white" />
            <Text style={styles.tekliKameraButonMetin}>Yeni Fiş Tara</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* LİSTE BAŞLIĞI */}
        <View style={styles.listeBaslikSatiri}>
          <Text style={styles.listeBasligi}>Son Harcamalar</Text>
          {harcamalar.length > 0 && (
            <TouchableOpacity
              style={styles.tumuButonu}
              activeOpacity={0.6}
              onPress={() => navigasyonYap("/harcamalar")}
            >
              <Text style={styles.tumuMetin}>Tümü</Text>
              <Ionicons name="chevron-forward" size={14} color="#1DB954" />
            </TouchableOpacity>
          )}
        </View>

        {/* LİSTE VEYA FIGMA BOŞ DURUM */}
        <View style={styles.listeKutusu}>
          {harcamalar.length === 0 ? (
            <View style={styles.figmaBosListeKarti}>
              <View style={styles.figmaBosListeIkonZemin}>
                <Ionicons
                  name="receipt-outline"
                  size={28}
                  color="rgba(255,255,255,0.4)"
                />
              </View>
              <Text style={styles.figmaBosListeMetin}>Henüz harcama yok</Text>
            </View>
          ) : (
            harcamalar.slice(0, 5).map((item) => {
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
                  onLongPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    setSilinecekFisId(item.id);
                    setSilmeModalAcik(true);
                  }}
                >
                  <View
                    style={[styles.ikonZemini, { backgroundColor: markaRengi }]}
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
                      {item.kategori || "Market"} ·{" "}
                      {kisaTarihFormati(item.tarih)}
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
            })
          )}
        </View>
      </ScrollView>

      {/* SİLME MODALI */}
      <Modal visible={silmeModalAcik} transparent={true} animationType="fade">
        <View style={styles.modalArkaPlan}>
          <View style={styles.modalKutu}>
            <View style={styles.modalIkonZemin}>
              <Ionicons name="trash-outline" size={32} color="#FF6B6B" />
            </View>
            <Text style={styles.modalBaslik}>Fişi Sil</Text>
            <Text style={styles.modalMesaj}>
              Bu fişi tamamen silmek istediğinize emin misiniz? İşlem geri
              alınamaz.
            </Text>

            <View style={styles.modalButonKapsayici}>
              <TouchableOpacity
                style={styles.modalIptalButon}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSilmeModalAcik(false);
                  setSilinecekFisId(null);
                }}
                disabled={siliyor}
              >
                <Text style={styles.modalIptalMetin}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOnayButon}
                onPress={fisiSil}
                disabled={siliyor}
              >
                {siliyor ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.modalOnayMetin}>Evet, Sil</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  anaEkran: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  // BAŞLIK ALANI
  ustBilgiKutusu: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginBottom: 24,
    gap: 3,
  },
  merhabaYazisi: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 11,
    fontWeight: "400",
    letterSpacing: 1,
  },
  isimYazisi: {
    color: "white",
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 39,
  },

  // 1. KART: TOPLAM HARCAMA (YEŞİL)
  figmaToplamHarcamaKarti: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.20)",
    paddingTop: 25,
    paddingBottom: 25,
    paddingHorizontal: 25,
    marginBottom: 24,
  },
  figmaButceUstBaslik: {
    color: "rgba(255, 255, 255, 0.50)",
    fontSize: 11,
    fontWeight: "400",
    letterSpacing: 1,
    marginBottom: 8,
  },
  figmaParaKutusu: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  figmaAnaPara: {
    color: "#1DB954",
    fontSize: 42,
    fontWeight: "800",
    lineHeight: 63,
  },
  figmaTL: {
    color: "#1DB954",
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 8,
  },
  figmaAltMetin: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 12,
    fontWeight: "400",
    marginTop: -4,
  },

  // 2. KART: AYLIK BÜTÇE (KOYU GRİ)
  figmaAylikButceKarti: {
    backgroundColor: "#18181B",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 21,
    marginBottom: 24,
  },
  figmaIcUstSatir: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  figmaIcBaslik: {
    color: "rgba(255, 255, 255, 0.50)",
    fontSize: 11,
    letterSpacing: 1,
  },
  figmaIcYuzde: {
    color: "#1DB954",
    fontSize: 12,
    fontWeight: "600",
  },
  figmaIcRakamKutusu: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  figmaIcHarcanan: {
    color: "white",
    fontSize: 28,
    fontWeight: "800",
  },
  figmaIcLimit: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 14,
    marginLeft: 8,
  },
  figmaProgresZemin: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 10,
    overflow: "hidden",
  },
  figmaProgresDolgu: {
    height: "100%",
    borderRadius: 10,
  },

  tekliKameraButonZemin: {
    marginBottom: 30,
  },
  tekliKameraButonIc: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#1DB954",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  tekliKameraButonMetin: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  // LİSTE BAŞLIĞI
  listeBaslikSatiri: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  listeBasligi: {
    color: "white",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  tumuButonu: { flexDirection: "row", alignItems: "center", gap: 2 },
  tumuMetin: { color: "#1DB954", fontSize: 13, fontWeight: "500" },
  listeKutusu: { gap: 12 },

  // BOŞ DURUM KARTI (EMPTY STATE - FIGMA)
  figmaBosListeKarti: {
    height: 199,
    backgroundColor: "#18181B",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  figmaBosListeIkonZemin: {
    width: 64,
    height: 64,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  figmaBosListeMetin: {
    color: "rgba(255, 255, 255, 0.35)",
    fontSize: 14,
    fontWeight: "400",
  },

  // STANDART HARCAMA ÖĞESİ
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

  // SİLME MODALI STİLLERİ
  modalArkaPlan: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalKutu: {
    width: "100%",
    backgroundColor: "#18181B",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.25)",
  },
  modalIkonZemin: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
  },
  modalBaslik: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  modalMesaj: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButonKapsayici: { flexDirection: "row", gap: 12, width: "100%" },
  modalIptalButon: {
    flex: 1,
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  modalIptalMetin: { color: "white", fontSize: 15, fontWeight: "600" },
  modalOnayButon: {
    flex: 1,
    height: 50,
    backgroundColor: "#E53935",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOnayMetin: { color: "white", fontSize: 15, fontWeight: "700" },
});
