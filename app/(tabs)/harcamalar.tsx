import { Ionicons } from "@expo/vector-icons";
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
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../firebaseConfig";
import { useStore } from "../../store/useStore";

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

// 🌟 HİBRİT RENK MOTORU 🌟
const getMagazaRengi = (magazaAdi: string) => {
  if (!magazaAdi) return "#1DB954";

  const m = magazaAdi.toLowerCase().trim();

  // 1. ADIM: TÜRKİYE'NİN EN POPÜLER 50 MARKASI
  if (m.includes("a101")) return "#00BFFF";
  if (m.includes("mavi") || m.includes("lc waikiki") || m.includes("lcw"))
    return "#0055A4";
  if (m.includes("vatan") || m.includes("teknosa")) return "#0033A0";
  if (m.includes("opet") || m.includes("blutv") || m.includes("disney"))
    return "#00AEEF";
  if (m.includes("domino")) return "#0055A5";

  if (m.includes("migros") || m.includes("macrocenter")) return "#FF6000";
  if (m.includes("trendyol") || m.includes("flo")) return "#F27A1A";
  if (m.includes("hepsiburada") || m.includes("amazon")) return "#FF9900";
  if (m.includes("popeyes")) return "#E95C24";

  if (m.includes("bim")) return "#E53935";
  if (m.includes("netflix") || m.includes("youtube")) return "#E50914";
  if (m.includes("mediamarkt") || m.includes("rossmann") || m.includes("h&m"))
    return "#DF0000";
  if (m.includes("yemeksepeti")) return "#EA004B";
  if (m.includes("kfc") || m.includes("burger king")) return "#D52B1E";
  if (m.includes("petrol ofisi") || m.includes("shell") || m.includes("total"))
    return "#ED0000";
  if (m.includes("n11")) return "#C10015";

  if (m.includes("şok") || m.includes("sok")) return "#FFD700";
  if (m.includes("mcdonald") || m.includes("mc donald")) return "#FFC72C";
  if (m.includes("exxen")) return "#F3C72A";

  if (m.includes("starbucks") || m.includes("kahve dünyası")) return "#00704A";
  if (m.includes("spotify")) return "#1DB954";
  if (m.includes("tarım kredi")) return "#2E7D32";
  if (m.includes("bp")) return "#009900";
  if (m.includes("çiçeksepeti")) return "#7DB83C";

  if (m.includes("getir")) return "#5D00D2";
  if (m.includes("gratis") || m.includes("watsons")) return "#6A1B9A";

  if (
    m.includes("zara") ||
    m.includes("boyner") ||
    m.includes("koton") ||
    m.includes("sephora")
  )
    return "#212121";
  if (m.includes("apple") || m.includes("steam")) return "#171A21";

  // 2. ADIM: AKILLI HASH (BİLİNMEYEN MARKALAR)
  let hash = 0;
  for (let i = 0; i < magazaAdi.length; i++) {
    hash = magazaAdi.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).substr(-2);
  }

  return color + "E6";
};

export default function HarcamalarScreen() {
  const router = useRouter();
  const { tumFisler, isFislerLoaded } = useStore();

  const [aktifFiltre, setAktifFiltre] = useState("Tümü");
  const [aramaMetni, setAramaMetni] = useState("");
  const [silmeModalAcik, setSilmeModalAcik] = useState(false);
  const [silinecekFisId, setSilinecekFisId] = useState<string | null>(null);
  const [siliyor, setSiliyor] = useState(false);

  useEffect(() => {
    if (aktifFiltre !== "Tümü") {
      const kategoriHalaVarMi = tumFisler.some(
        (h) => (h.kategori || "Diğer") === aktifFiltre,
      );
      if (!kategoriHalaVarMi) {
        setAktifFiltre("Tümü");
      }
    }
  }, [tumFisler, aktifFiltre]);

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

  const kategoriSayilari = tumFisler.reduce(
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
      ? tumFisler
      : tumFisler.filter((h) => (h.kategori || "Diğer") === aktifFiltre);

  if (aramaMetni.trim() !== "") {
    filtrelenmisHarcamalar = filtrelenmisHarcamalar.filter(
      (h) =>
        h.magaza_adi?.toLowerCase().includes(aramaMetni.toLowerCase()) ||
        h.kategori?.toLowerCase().includes(aramaMetni.toLowerCase()),
    );
  }

  const gruplarMap = new Map();

  filtrelenmisHarcamalar.forEach((h) => {
    const { ayYil, gunAyYil } = formatlaTarih(h.tarih);
    h.gosterimTarihi = gunAyYil;
    const tutarNum = Number(h.toplam_tutar) || 0;

    if (gruplarMap.has(ayYil)) {
      const grup = gruplarMap.get(ayYil);
      grup.data.push(h);
      grup.toplam += tutarNum;
    } else {
      gruplarMap.set(ayYil, { title: ayYil, toplam: tutarNum, data: [h] });
    }
  });

  const sectionData = Array.from(gruplarMap.values());

  if (!isFislerLoaded) {
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

  if (tumFisler.length === 0) {
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

  const renderItem = ({ item }: { item: any }) => {
    const markaRengi = getMagazaRengi(item.magaza_adi); // Rengi motordan çek

    return (
      <TouchableOpacity
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
        <View style={[styles.ikonZemini, { backgroundColor: markaRengi }]}>
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
            <Text style={styles.harcamaTarihMetni}>{item.gosterimTarihi}</Text>
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
  };

  const renderSectionHeader = ({ section: { title, toplam } }: any) => (
    <View style={styles.tarihSatiri}>
      <View style={styles.tarihSolGrup}>
        <View style={styles.tarihCizgisi} />
        <Text style={styles.tarihBaslik}>{title}</Text>
      </View>
      <View style={styles.tarihSagGrup}>
        <Ionicons
          name="trending-down-outline"
          size={12}
          color="rgba(255, 107, 107, 0.6)"
        />
        <Text style={styles.tarihToplamTutar}>
          {toplam.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.anaEkran}>
        {/* ÜST BİLGİLER */}
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
                kat === "Tümü" ? tumFisler.length : kategoriSayilari[kat];
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

        {sectionData.length === 0 ? (
          <Text
            style={{
              color: "rgba(255,255,255,0.4)",
              textAlign: "center",
              marginTop: 40,
            }}
          >
            Bu aramaya uygun kayıt bulunamadı.
          </Text>
        ) : (
          <SectionList
            sections={sectionData}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={styles.listeAlani}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
          />
        )}
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

  listeAlani: { paddingHorizontal: 20, paddingBottom: 40 },
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
