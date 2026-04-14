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
  query,
  where,
} from "firebase/firestore";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../firebaseConfig";
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

  const { isim, butce, tumFisler, isFislerLoaded } = useStore();

  const [silmeModalAcik, setSilmeModalAcik] = useState(false);
  const [silinecekFisId, setSilinecekFisId] = useState<string | null>(null);
  const [siliyor, setSiliyor] = useState(false);

  const simdi = new Date();
  const mevcutAy = simdi.getMonth();
  const mevcutYil = simdi.getFullYear();

  let buAyHarcama = 0;
  let gecenAyHarcama = 0;

  // tumFisler zaten sıralı ve hazır geliyor, sadece hesaplama yapıyoruz
  tumFisler.forEach((h) => {
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
      // Firebase güncellendiğinde _layout.tsx bunu algılayıp tumFisler'i kendi yenileyecek.
    } catch (error) {
      console.error(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSiliyor(false);
      setSilmeModalAcik(false);
      setSilinecekFisId(null);
    }
  };

  // Sadece ilk açılışta _layout verileri çekerken bu görünür.
  if (!isFislerLoaded) {
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

  return (
    <View style={{ flex: 1 }}>
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
                  {
                    color: kalanPara > 0 ? "rgba(255,255,255,0.5)" : "#FF4B4B",
                  },
                ]}
              >
                {kalanPara > 0
                  ? `${kalanPara.toLocaleString("tr-TR")} TL kaldı`
                  : "Bütçe aşıldı"}
              </Text>
            </View>
          </View>
        </LinearGradient>

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
          {tumFisler.length > 0 && (
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

        <View style={styles.listeKutusu}>
          {tumFisler.length === 0 ? (
            <View style={styles.anasayfaBosDurumKapsayici}>
              <View style={styles.devIkonDisHalkaBos}>
                <View style={styles.devIkonOrtaHalkaBos}>
                  <View style={styles.devIkonIcDaireBos}>
                    <Ionicons name="scan-outline" size={28} color="#1DB954" />
                  </View>
                </View>
              </View>
              <Text style={styles.baslikMetniBos}>
                Harika bir başlangıç yap!
              </Text>
              <Text style={styles.aciklamaMetniBos}>
                Henüz hiç harcama kaydın yok. İlk fişini tarayarak bütçeni
                kontrol altına al.
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigasyonYap("/kamera")}
              >
                <LinearGradient
                  colors={["#1DB954", "#15A043"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.anaButonBos}
                >
                  <Ionicons name="camera" size={20} color="white" />
                  <Text style={styles.anaButonMetniBos}>İlk Fişini Tara</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            tumFisler.slice(0, 5).map((item) => {
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
    marginTop: 6,
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

  anasayfaBosDurumKapsayici: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 10,
  },
  devIkonDisHalkaBos: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(29, 185, 84, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  devIkonOrtaHalkaBos: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(29, 185, 84, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  devIkonIcDaireBos: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  baslikMetniBos: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  aciklamaMetniBos: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 13,
    fontWeight: "400",
    textAlign: "center",
    maxWidth: 240,
    lineHeight: 20,
    marginBottom: 24,
  },
  anaButonBos: {
    width: 200,
    height: 50,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  anaButonMetniBos: { color: "white", fontSize: 14, fontWeight: "700" },

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
