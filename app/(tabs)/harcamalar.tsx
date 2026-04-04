import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebaseConfig";
import { useStore } from "../../store/useStore";

// TARİH FORMATLAMA ("DD.MM.YYYY" -> Date)
const parseTarih = (tarihStr: string) => {
  if (!tarihStr) return new Date();
  const parts = tarihStr.split(".");
  if (parts.length === 3) {
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }
  return new Date();
};

// 19.10.2023 -> "EKİM 2023" ve "19 Eki 2023" formatına çevirici
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

// Markaya Göre Renk Atama
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
  return "#1DB954"; // Varsayılan renk
};

const formatMoney = (amount: number) => {
  return amount.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function HarcamalarScreen() {
  const router = useRouter();
  const { uid } = useStore();

  const [harcamalar, setHarcamalar] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [aktifFiltre, setAktifFiltre] = useState("Tümü");

  // FİREBASE BAĞLANTISI (TARİHE GÖRE SIRALAMALI)
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

      // 🔴 ÇÖZÜM: a ve b'ye "any" dedik, TS hatasını çözdük.
      const siraliVeriler = veriler.sort(
        (a: any, b: any) =>
          parseTarih(b.tarih).getTime() - parseTarih(a.tarih).getTime(),
      );

      setHarcamalar(siraliVeriler);
    } catch (error) {
      console.error("Harcamalar çekilemedi:", error);
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

  // KATEGORİ SAYILARINI HESAPLA (Dinamik Filtreler)
  const kategoriSayilari = harcamalar.reduce(
    (acc, h) => {
      const kat = h.kategori || "Diğer";
      acc[kat] = (acc[kat] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const filtreListesi = ["Tümü", ...Object.keys(kategoriSayilari)];

  // SEÇİLİ FİLTREYE GÖRE VERİLERİ SÜZ VE AYLARA GÖRE GRUPLA
  const filtrelenmisHarcamalar =
    aktifFiltre === "Tümü"
      ? harcamalar
      : harcamalar.filter((h) => (h.kategori || "Diğer") === aktifFiltre);

  // GRUPLAMA MANTIĞI
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
      gruplar.push({
        ayYil: ayYil,
        toplam: tutarNum,
        veriler: [h],
      });
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

  // ==========================================
  // 🔴 1. SENARYO: SEPET BOŞSA
  // ==========================================
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
                <View style={styles.ikonKucukBildirimBos}>
                  <Ionicons name="scan-outline" size={14} color="#0A0A0A" />
                </View>
              </View>
            </View>
            <View style={styles.dekoratifNoktaSagBos} />
            <View style={styles.dekoratifNoktaSolBos} />
          </View>

          <View style={styles.metinKapsayiciBos}>
            <Text style={styles.baslikMetniBos}>Henüz hiç fiş taranmamış</Text>
            <Text style={styles.aciklamaMetniBos}>
              Harcamalarını takip etmek için ilk fişini tara
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

            <TouchableOpacity
              style={styles.manuelEkleKapsayiciBos}
              activeOpacity={0.6}
              onPress={() => router.push("/manuelfis")}
            >
              <Text style={styles.manuelEkleMetniBos}>
                veya manuel olarak harcama ekle
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ==========================================
  // 🟢 2. SENARYO: SEPET DOLUYSA
  // ==========================================
  return (
    <View style={styles.anaEkran}>
      {/* ÜST BAŞLIK BÖLÜMÜ */}
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <Text style={styles.ustBaslikBos}>KAYITLAR</Text>
        <View style={styles.headerKutusu}>
          <Text style={styles.sayfaBaslik}>Tüm Harcamalar</Text>
          <TouchableOpacity style={styles.filtreButonu} activeOpacity={0.6}>
            <Ionicons
              name="options-outline"
              size={20}
              color="rgba(255,255,255,0.7)"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ARAMA KUTUSU */}
      <View style={styles.aramaKutusuKapsayici}>
        <Ionicons
          name="search-outline"
          size={18}
          color="rgba(255, 255, 255, 0.4)"
          style={styles.aramaIkoni}
        />
        <TextInput
          style={styles.aramaGirdisi}
          placeholder="Mağaza veya Kategori Ara..."
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          selectionColor="#1DB954"
        />
      </View>

      {/* KATEGORİ FİLTRELERİ */}
      <View style={styles.kategoriKapsayici}>
        <ScrollView
          horizontal={true}
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

      {/* ANA HARCAMA LİSTESİ (AYLARA GÖRE GRUPLANMIŞ) */}
      <ScrollView
        style={styles.listeAlani}
        showsVerticalScrollIndicator={false}
      >
        {gruplar.map((grup, index) => (
          <View key={index} style={{ marginBottom: 16 }}>
            {/* DİNAMİK AY/YIL BAŞLIĞI */}
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
                  {formatMoney(grup.toplam)} TL
                </Text>
              </View>
            </View>

            {/* O AYA AİT FİŞLER */}
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
                >
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
                      -{formatMoney(item.toplam_tutar)} TL
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
  );
}

// STİLLER
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
  ikonKucukBildirimBos: {
    position: "absolute",
    top: -8,
    right: -12,
    backgroundColor: "#1DB954",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1DB954",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  dekoratifNoktaSagBos: {
    position: "absolute",
    top: 10,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(29, 185, 84, 0.30)",
  },
  dekoratifNoktaSolBos: {
    position: "absolute",
    bottom: 20,
    left: -8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(29, 185, 84, 0.20)",
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
    shadowColor: "#1DB954",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  anaButonMetniBos: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  manuelEkleKapsayiciBos: { paddingVertical: 8 },
  manuelEkleMetniBos: {
    color: "rgba(255, 255, 255, 0.25)",
    fontSize: 12,
    fontWeight: "400",
  },

  anaEkran: { flex: 1, backgroundColor: "#121212", paddingTop: 60 },
  headerKutusu: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sayfaBaslik: { color: "white", fontSize: 22, fontWeight: "800" },
  filtreButonu: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  aramaKutusuKapsayici: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  aramaIkoni: { marginRight: 8 },
  aramaGirdisi: { flex: 1, color: "white", fontSize: 13, fontWeight: "400" },
  kategoriKapsayici: { marginBottom: 20, height: 28 },
  filtreHap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
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
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 11,
    fontWeight: "400",
  },
  filtreMetinAktif: { color: "#1DB954", fontWeight: "600" },
  filtreRozet: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  filtreRozetAktif: { backgroundColor: "rgba(29, 185, 84, 0.20)" },
  filtreRozetMetin: {
    color: "rgba(255, 255, 255, 0.3)",
    fontSize: 10,
    fontWeight: "400",
  },
  filtreRozetMetinAktif: { color: "#1DB954" },
  listeAlani: { paddingHorizontal: 20 },
  tarihSatiri: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  tarihSolGrup: { flexDirection: "row", alignItems: "center" },
  tarihCizgisi: {
    width: 4,
    height: 14,
    backgroundColor: "#1DB954",
    borderRadius: 2,
    marginRight: 8,
  },
  tarihBaslik: {
    color: "rgba(255, 255, 255, 0.50)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  tarihSagGrup: { flexDirection: "row", alignItems: "center", gap: 4 },
  tarihToplamTutar: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 11,
    fontWeight: "600",
  },
  harcamaOgesi: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    marginBottom: 8,
    height: 64,
  },
  ikonZemini: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  ikonHarf: { color: "white", fontSize: 14, fontWeight: "800" },
  harcamaBilgi: { flex: 1, marginLeft: 12, justifyContent: "center" },
  harcamaAd: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  kategoriVeTarihKutusu: { flexDirection: "row", alignItems: "center", gap: 8 },
  kategoriKutucuk: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 5,
  },
  kategoriKutucukMetin: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 10,
    fontWeight: "500",
  },
  harcamaTarihMetni: {
    color: "rgba(255, 255, 255, 0.3)",
    fontSize: 10,
    fontWeight: "500",
  },
  fiyatVeOkKapsayici: { flexDirection: "row", alignItems: "center", gap: 4 },
  harcamaTutar: {
    color: "rgba(255, 107, 107, 0.90)",
    fontSize: 13,
    fontWeight: "700",
  },
});
