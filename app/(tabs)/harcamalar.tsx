import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
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

export default function HarcamalarScreen() {
  const router = useRouter();
  const { uid } = useStore();

  const [harcamalar, setHarcamalar] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  // FİREBASE BAĞLANTISI
  useEffect(() => {
    const aktifUid = uid || auth.currentUser?.uid;

    if (aktifUid) {
      const q = query(
        collection(db, "Fisler"),
        where("kullanici_id", "==", aktifUid),
        orderBy("olusturulma_tarihi", "desc"),
      );

      const unsub = onSnapshot(q, (snapshot) => {
        const veriler = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHarcamalar(veriler);
        setYukleniyor(false);
      });

      return () => unsub();
    } else {
      setYukleniyor(false);
    }
  }, [uid]);

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
  // 🔴 1. SENARYO: SEPET BOŞSA (TASARIM AYNI)
  // ==========================================
  if (harcamalar.length === 0) {
    return (
      <View style={styles.anaEkranBos}>
        {/* ÜST BAŞLIK */}
        <View style={styles.baslikAlaniBos}>
          <Text style={styles.ustBaslikBos}>HARCAMALAR</Text>
          <Text style={styles.anaBaslikBos}>Tüm Fişler</Text>
        </View>

        {/* ORTA İÇERİK */}
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
  // 🟢 2. SENARYO: SEPET DOLUYSA (TASARIM AYNI)
  // ==========================================
  return (
    <View style={styles.anaEkran}>
      {/* 1. ÜST BAŞLIK BÖLÜMÜ */}
      <View style={styles.headerKutusu}>
        <Text style={styles.sayfaBaslik}>Tüm Harcamalar</Text>
        <TouchableOpacity style={styles.filtreButonu} activeOpacity={0.6}>
          <Ionicons name="options-outline" size={20} color="#1DB954" />
        </TouchableOpacity>
      </View>

      {/* 2. ARAMA KUTUSU */}
      <View style={styles.aramaKutusuKapsayici}>
        <Ionicons
          name="search-outline"
          size={20}
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

      {/* 3. KATEGORİ FİLTRELERİ */}
      <View style={styles.kategoriKapsayici}>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingHorizontal: 20 }}
        >
          <TouchableOpacity
            style={[styles.filtreHap, styles.filtreHapAktif]}
            activeOpacity={0.8}
          >
            <Text style={[styles.filtreMetin, styles.filtreMetinAktif]}>
              Tümü
            </Text>
            <View style={[styles.filtreRozet, styles.filtreRozetAktif]}>
              <Text
                style={[styles.filtreRozetMetin, styles.filtreRozetMetinAktif]}
              >
                {harcamalar.length}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filtreHap} activeOpacity={0.7}>
            <Text style={styles.filtreMetin}>Market</Text>
            <View style={styles.filtreRozet}>
              <Text style={styles.filtreRozetMetin}>0</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 4. ANA HARCAMA LİSTESİ */}
      <ScrollView
        style={styles.listeAlani}
        showsVerticalScrollIndicator={false}
      >
        {/* LİSTE BAŞLIĞI */}
        <View style={styles.tarihSatiri}>
          <View style={styles.tarihSolGrup}>
            <View style={styles.tarihCizgisi} />
            <Text style={styles.tarihBaslik}>TÜM ZAMANLAR</Text>
          </View>
        </View>

        {/* FİREBASE'DEN GELEN VERİLERLE LİSTE OLUŞTURMA */}
        {harcamalar.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.harcamaOgesi}
            activeOpacity={0.7}
            onPress={() =>
              router.push({ pathname: "/urundetay", params: { id: item.id } })
            }
          >
            <View
              style={[
                styles.ikonZemini,
                { backgroundColor: "#1DB954" },
                styles.migrosNeonGolge,
              ]}
            >
              <Text style={styles.ikonHarf}>{item.magaza_adi?.[0] || "?"}</Text>
            </View>
            <View style={styles.harcamaBilgi}>
              <Text style={styles.harcamaAd}>{item.magaza_adi}</Text>
              <View style={styles.kategoriVeTarihKutusu}>
                <View style={styles.kategoriKutucuk}>
                  <Text style={styles.kategoriKutucukMetin}>Fiş</Text>
                </View>
                <Text style={styles.harcamaTarihMetni}>{item.tarih}</Text>
              </View>
            </View>
            <View style={styles.fiyatVeOkKapsayici}>
              <Text style={styles.harcamaTutar}>-{item.toplam_tutar} TL</Text>
              <Ionicons
                name="chevron-forward"
                size={12}
                color="rgba(255,255,255,0.25)"
              />
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ... STİLLER AYNEN DURUYOR ...
const styles = StyleSheet.create({
  // BOŞ EKRAN
  anaEkranBos: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  baslikAlaniBos: { gap: 4, marginBottom: 80 },
  ustBaslikBos: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 11,
    fontWeight: "400",
    letterSpacing: 1,
  },
  anaBaslikBos: { color: "white", fontSize: 26, fontWeight: "800" },
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

  // DOLU EKRAN
  anaEkran: { flex: 1, backgroundColor: "#121212", paddingTop: 60 },
  headerKutusu: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sayfaBaslik: { color: "white", fontSize: 24, fontWeight: "700" },
  filtreButonu: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  aramaKutusuKapsayici: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  aramaIkoni: { marginRight: 10 },
  aramaGirdisi: { flex: 1, color: "white", fontSize: 14, fontWeight: "500" },
  kategoriKapsayici: { marginBottom: 20, height: 36 },
  filtreHap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  filtreHapAktif: {
    backgroundColor: "rgba(29, 185, 84, 0.15)",
    borderColor: "rgba(29, 185, 84, 0.3)",
  },
  filtreMetin: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
    fontWeight: "500",
  },
  filtreMetinAktif: { color: "#1DB954", fontWeight: "700" },
  filtreRozet: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  filtreRozetAktif: { backgroundColor: "#1DB954" },
  filtreRozetMetin: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 10,
    fontWeight: "700",
  },
  filtreRozetMetinAktif: { color: "#000000" },
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
    width: 3,
    height: 14,
    backgroundColor: "#1DB954",
    borderRadius: 2,
    marginRight: 8,
  },
  tarihBaslik: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
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
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 12,
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
  kategoriVeTarihKutusu: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  kategoriKutucuk: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 6,
    paddingVertical: 3,
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
  fiyatVeOkKapsayici: {
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  harcamaTutar: {
    color: "#FF6B6B",
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
  trendyolNeonGolge: {
    ...Platform.select({
      ios: {
        shadowColor: "#FF6B6B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: { elevation: 8, shadowColor: "#FF6B6B" },
    }),
  },
});
