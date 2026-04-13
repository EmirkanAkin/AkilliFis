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
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebaseConfig";
import { useStore } from "../../store/useStore";

// TARİH FORMATLAYICI
const parseTarih = (tarihStr: string) => {
  if (!tarihStr) return new Date();
  const parts = tarihStr.split(".");
  if (parts.length === 3) {
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }
  return new Date();
};

const formatlaTarih = (tarihStr: string) => {
  if (!tarihStr) return { ayYil: "BİLİNMEYEN TARİH", gunAyYil: "" };
  const parts = tarihStr.split(".");
  if (parts.length !== 3) return { ayYil: tarihStr, gunAyYil: tarihStr };

  const day = parseInt(parts[0], 10);
  const monthIndex = parseInt(parts[1], 10) - 1;
  const year = parts[2];

  const aylarTam = [
    "OCAK",
    "ŞUBAT",
    "MART",
    "NİSAN",
    "MAYIS",
    "HAZİRAN",
    "TEMMUZ",
    "AĞUSTOS",
    "EYLÜL",
    "EKİM",
    "KASIM",
    "ARALIK",
  ];
  const aylarKisa = [
    "Oca",
    "Şub",
    "Mar",
    "Nis",
    "May",
    "Haz",
    "Tem",
    "Ağu",
    "Eyl",
    "Eki",
    "Kas",
    "Ara",
  ];

  return {
    ayYil: `${aylarTam[monthIndex]} ${year}`,
    gunAyYil: `${day} ${aylarKisa[monthIndex]} ${year}`,
  };
};

// MARKA RENKLENDİRİCİ
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

export default function HarcamalarScreen() {
  const router = useRouter();
  const { uid } = useStore();

  const [harcamalar, setHarcamalar] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  // FİLTRELEME VE ARAMA
  const [aktifFiltre, setAktifFiltre] = useState("Tümü");
  const [aramaMetni, setAramaMetni] = useState("");

  // SİLME İŞLEMİ İÇİN STATELER
  const [silmeModalAcik, setSilmeModalAcik] = useState(false);
  const [silinecekFisId, setSilinecekFisId] = useState<string | null>(null);
  const [siliyor, setSiliyor] = useState(false);

  // Filtrelenen kategorideki son fiş silinirse otomatik olarak "Tümü"ne atar.
  useEffect(() => {
    if (aktifFiltre !== "Tümü") {
      const kategoriHalaVarMi = harcamalar.some(
        (h) => (h.kategori || "Diğer") === aktifFiltre,
      );
      if (!kategoriHalaVarMi) {
        setAktifFiltre("Tümü");
      }
    }
  }, [harcamalar, aktifFiltre]);

  const veriGetir = async () => {
    const aktifUid = uid || auth.currentUser?.uid;
    if (!aktifUid) return setYukleniyor(false);

    try {
      const q = query(
        collection(db, "Fisler"),
        where("kullanici_id", "==", aktifUid),
      );
      const fislerSnap = await getDocs(q);
      const veriler = fislerSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const siraliVeriler = veriler.sort((a: any, b: any) => {
        // 1. Önce gün/ay/yıl formatındaki string tarihleri sayısallaştırıp karşılaştırıyoruz.
        const dateA = parseTarih(a.tarih).getTime();
        const dateB = parseTarih(b.tarih).getTime();

        // Eğer tarihler farklıysa, normal tarihe göre sırala (Yeni tarih üstte)
        if (dateA !== dateB) {
          return dateB - dateA;
        }

        // 2. EĞER TARİHLER AYNIYSA (İkisi de bugün girilmişse):
        // Firebase'in oluşturduğu milisaniyelik timestamp'e bak ve en son ekleneni üste koy
        const timeA = a.olusturulma_tarihi?.toMillis
          ? a.olusturulma_tarihi.toMillis()
          : 0;
        const timeB = b.olusturulma_tarihi?.toMillis
          ? b.olusturulma_tarihi.toMillis()
          : 0;

        return timeB - timeA;
      });

      setHarcamalar(siraliVeriler);
    } catch (error) {
      console.error(error);
    } finally {
      setYukleniyor(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setYukleniyor(true);
      veriGetir();
    }, []),
  );

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
      setHarcamalar((prev) => prev.filter((h) => h.id !== silinecekFisId));
    } catch (error) {
      console.error(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSiliyor(false);
      setSilmeModalAcik(false);
      setSilinecekFisId(null);
    }
  };

  // KATEGORİ BAZLI FİLTRELEME MANTIĞI
  const kategoriSayilari = harcamalar.reduce(
    (acc, h) => {
      const kat = h.kategori || "Diğer";
      acc[kat] = (acc[kat] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const filtreListesi = ["Tümü", ...Object.keys(kategoriSayilari).sort()];

  let filtrelenmisHarcamalar =
    aktifFiltre === "Tümü"
      ? harcamalar
      : harcamalar.filter((h) => (h.kategori || "Diğer") === aktifFiltre);

  // ARAMA MANTIĞI
  if (aramaMetni.trim() !== "") {
    filtrelenmisHarcamalar = filtrelenmisHarcamalar.filter(
      (h) =>
        h.magaza_adi?.toLowerCase().includes(aramaMetni.toLowerCase()) ||
        h.kategori?.toLowerCase().includes(aramaMetni.toLowerCase()),
    );
  }

  // AYLARA GÖRE GRUPLAMA
  const gruplar: { ayYil: string; toplam: number; veriler: any[] }[] = [];
  filtrelenmisHarcamalar.forEach((h) => {
    const { ayYil, gunAyYil } = formatlaTarih(h.tarih);
    h.gosterimTarihi = gunAyYil;
    const tutarNum = Number(h.toplam_tutar) || 0;

    const mevcutGrup = gruplar.find((g) => g.ayYil === ayYil);
    if (mevcutGrup) {
      mevcutGrup.veriler.push(h);
      mevcutGrup.toplam += tutarNum;
    } else {
      gruplar.push({ ayYil: ayYil, toplam: tutarNum, veriler: [h] });
    }
  });

  if (yukleniyor) {
    return (
      <View
        style={[
          styles.anaEkranBos,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  if (harcamalar.length === 0) {
    return (
      <View style={styles.anaEkranBos}>
        <View style={styles.baslikAlaniBos}>
          <Text style={styles.ustBaslikBos}>KAYITLAR</Text>
          <Text style={styles.anaBaslikBos}>Tüm Harcamalar</Text>
        </View>
        <View style={styles.ortaIcerikKapsayiciBos}>
          <View style={styles.devIkonDisHalkaBos}>
            <View style={styles.devIkonOrtaHalkaBos}>
              <View style={styles.devIkonIcDaireBos}>
                <Ionicons name="wallet-outline" size={32} color="#1DB954" />
              </View>
            </View>
          </View>
          <View style={styles.metinKapsayiciBos}>
            <Text style={styles.baslikMetniBos}>Henüz hiç fiş taranmamış</Text>
            <Text style={styles.aciklamaMetniBos}>
              Harcamalarını takip etmek için ilk fişini tara veya manuel ekle.
            </Text>
          </View>
          <View style={styles.butonlarKapsayiciBos}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/kamera")}
            >
              <LinearGradient
                colors={["#1DB954", "#15A043"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.anaButonBos}
              >
                <Ionicons name="scan-outline" size={20} color="white" />
                <Text style={styles.anaButonMetniBos}>Fiş Tara</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.anaEkran}>
        <View style={{ paddingHorizontal: 20, marginBottom: 15 }}>
          <Text style={styles.ustBaslikBos}>KAYITLAR</Text>
          <View style={styles.headerKutusu}>
            <Text style={styles.sayfaBaslik}>Tüm Harcamalar</Text>
          </View>
        </View>

        <View style={styles.aramaKutusuKapsayici}>
          <Ionicons
            name="search-outline"
            size={18}
            color="rgba(255, 255, 255, 0.4)"
            style={styles.aramaIkoni}
          />
          <TextInput
            style={styles.aramaGirdisi}
            placeholder="Mağaza veya kategori ara..."
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            selectionColor="#1DB954"
            cursorColor="#1DB954"
            value={aramaMetni}
            onChangeText={setAramaMetni}
          />
          {aramaMetni.length > 0 && (
            <TouchableOpacity onPress={() => setAramaMetni("")}>
              <Ionicons
                name="close-circle"
                size={16}
                color="rgba(255, 255, 255, 0.3)"
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.kategoriKapsayici}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
          >
            {filtreListesi.map((kat) => {
              const isAktif = aktifFiltre === kat;
              const adet =
                kat === "Tümü" ? harcamalar.length : kategoriSayilari[kat];
              return (
                <TouchableOpacity
                  key={kat}
                  style={[styles.filtreHap, isAktif && styles.filtreHapAktif]}
                  activeOpacity={0.8}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setAktifFiltre(kat);
                  }}
                >
                  <Text
                    style={[
                      styles.filtreMetin,
                      isAktif && styles.filtreMetinAktif,
                    ]}
                  >
                    {kat}
                  </Text>
                  <View
                    style={[
                      styles.filtreRozet,
                      isAktif && styles.filtreRozetAktif,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filtreRozetMetin,
                        isAktif && styles.filtreRozetMetinAktif,
                      ]}
                    >
                      {adet}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.listeAlani}
          showsVerticalScrollIndicator={false}
        >
          {gruplar.length === 0 && (
            <Text
              style={{
                color: "rgba(255,255,255,0.4)",
                textAlign: "center",
                marginTop: 40,
              }}
            >
              Bu aramaya uygun kayıt bulunamadı.
            </Text>
          )}

          {gruplar.map((grup, index) => (
            <View key={index} style={{ marginBottom: 20 }}>
              <View style={styles.tarihSatiri}>
                <View style={styles.tarihSolGrup}>
                  <View style={styles.tarihCizgisi} />
                  <Text style={styles.tarihBaslik}>{grup.ayYil}</Text>
                </View>
                <View style={styles.tarihSagGrup}>
                  <Ionicons
                    name="trending-down-outline"
                    size={12}
                    color="rgba(255, 107, 107, 0.6)"
                  />
                  <Text style={styles.tarihToplamTutar}>
                    {grup.toplam.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    TL
                  </Text>
                </View>
              </View>

              {grup.veriler.map((item: any) => {
                const markaRengi = getMarkaRengi(item.magaza_adi);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.harcamaOgesi}
                    activeOpacity={0.7}
                    onPress={() =>
                      router.push({
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
                      style={[
                        styles.ikonZemini,
                        { backgroundColor: markaRengi },
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
                      <View style={styles.kategoriVeTarihKutusu}>
                        <View style={styles.kategoriKutucuk}>
                          <Text style={styles.kategoriKutucukMetin}>
                            {item.kategori || "Diğer"}
                          </Text>
                        </View>
                        <Text style={styles.harcamaTarihMetni}>
                          {item.gosterimTarihi}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.fiyatVeOkKapsayici}>
                      <Text style={styles.harcamaTutar}>
                        -
                        {Number(item.toplam_tutar).toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        TL
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={14}
                        color="rgba(255,255,255,0.20)"
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

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
  anaEkranBos: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  baslikAlaniBos: { gap: 4, marginBottom: 80 },
  ustBaslikBos: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 4,
  },
  anaBaslikBos: { color: "white", fontSize: 24, fontWeight: "800" },
  ortaIcerikKapsayiciBos: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 20,
  },
  devIkonDisHalkaBos: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(29, 185, 84, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  devIkonOrtaHalkaBos: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(29, 185, 84, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  devIkonIcDaireBos: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  metinKapsayiciBos: { alignItems: "center", gap: 12, marginBottom: 40 },
  baslikMetniBos: { color: "white", fontSize: 20, fontWeight: "700" },
  aciklamaMetniBos: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 22,
  },
  butonlarKapsayiciBos: {
    width: "100%",
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 16,
  },
  anaButonBos: {
    width: 280,
    height: 54,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  anaButonMetniBos: { color: "white", fontSize: 15, fontWeight: "700" },

  anaEkran: { flex: 1, backgroundColor: "#121212", paddingTop: 60 },
  headerKutusu: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sayfaBaslik: { color: "white", fontSize: 22, fontWeight: "800" },

  aramaKutusuKapsayici: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  aramaIkoni: { marginRight: 8 },
  aramaGirdisi: { flex: 1, color: "white", fontSize: 14, fontWeight: "500" },

  kategoriKapsayici: { marginBottom: 20, height: 32 },
  filtreHap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  filtreHapAktif: {
    backgroundColor: "rgba(29, 185, 84, 0.15)",
    borderColor: "rgba(29, 185, 84, 0.35)",
  },
  filtreMetin: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    fontWeight: "500",
  },
  filtreMetinAktif: { color: "#1DB954", fontWeight: "700" },
  filtreRozet: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  filtreRozetAktif: { backgroundColor: "rgba(29, 185, 84, 0.20)" },
  filtreRozetMetin: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 10,
    fontWeight: "600",
  },
  filtreRozetMetinAktif: { color: "#1DB954" },

  listeAlani: { paddingHorizontal: 20 },
  tarihSatiri: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  tarihSolGrup: { flexDirection: "row", alignItems: "center" },
  tarihCizgisi: {
    width: 4,
    height: 16,
    backgroundColor: "#1DB954",
    borderRadius: 2,
    marginRight: 8,
  },
  tarihBaslik: {
    color: "rgba(255, 255, 255, 0.50)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  tarihSagGrup: { flexDirection: "row", alignItems: "center", gap: 4 },
  tarihToplamTutar: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 12,
    fontWeight: "600",
  },

  harcamaOgesi: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    marginBottom: 10,
    minHeight: 68,
  },
  ikonZemini: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  ikonHarf: { color: "white", fontSize: 16, fontWeight: "800" },
  harcamaBilgi: { flex: 1, marginLeft: 12, justifyContent: "center" },
  harcamaAd: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  kategoriVeTarihKutusu: { flexDirection: "row", alignItems: "center", gap: 8 },
  kategoriKutucuk: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  kategoriKutucukMetin: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 10,
    fontWeight: "600",
  },
  harcamaTarihMetni: {
    color: "rgba(255, 255, 255, 0.3)",
    fontSize: 11,
    fontWeight: "500",
  },
  fiyatVeOkKapsayici: { flexDirection: "row", alignItems: "center", gap: 6 },
  harcamaTutar: {
    color: "rgba(255, 107, 107, 0.90)",
    fontSize: 14,
    fontWeight: "700",
  },

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
