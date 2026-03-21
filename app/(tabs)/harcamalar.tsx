import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function HarcamalarScreen() {
  const router = useRouter();

  const [harcamalar, setHarcamalar] = useState([]);

  // ==========================================
  // 🔴 1. SENARYO: SEPET BOŞSA (YENİ EFSANE BOŞ TASARIM)
  // ==========================================
  if (harcamalar.length === 0) {
    return (
      <View style={styles.anaEkranBos}>
        {/* ÜST BAŞLIK */}
        <View style={styles.baslikAlaniBos}>
          <Text style={styles.ustBaslikBos}>HARCAMALAR</Text>
          <Text style={styles.anaBaslikBos}>Tüm Fişler</Text>
        </View>

        {/* ORTA İÇERİK (İkon ve Metinler) */}
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
  // 🟢 2. SENARYO: SEPET DOLUYSA (SENİN ESKİ JİLET TASARIMIN)
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
                10
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filtreHap} activeOpacity={0.7}>
            <Text style={styles.filtreMetin}>Market</Text>
            <View style={styles.filtreRozet}>
              <Text style={styles.filtreRozetMetin}>5</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filtreHap} activeOpacity={0.7}>
            <Text style={styles.filtreMetin}>Kafe</Text>
            <View style={styles.filtreRozet}>
              <Text style={styles.filtreRozetMetin}>1</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filtreHap} activeOpacity={0.7}>
            <Text style={styles.filtreMetin}>Abonelik</Text>
            <View style={styles.filtreRozet}>
              <Text style={styles.filtreRozetMetin}>2</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 4. ANA HARCAMA LİSTESİ */}
      <ScrollView
        style={styles.listeAlani}
        showsVerticalScrollIndicator={false}
      >
        {/* TARİH GRUBU (EKİM 2023) */}
        <View style={styles.tarihSatiri}>
          <View style={styles.tarihSolGrup}>
            <View style={styles.tarihCizgisi} />
            <Text style={styles.tarihBaslik}>EKİM 2023</Text>
          </View>
          <View style={styles.tarihSagGrup}>
            <Ionicons name="trending-down" size={14} color="#FF6B6B" />
            <Text style={styles.tarihToplamTutar}>2.250,80 TL</Text>
          </View>
        </View>

        {/* MİGROS */}
        <TouchableOpacity style={styles.harcamaOgesi} activeOpacity={0.7}>
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
            <View style={styles.kategoriVeTarihKutusu}>
              <View style={styles.kategoriKutucuk}>
                <Text style={styles.kategoriKutucukMetin}>Market</Text>
              </View>
              <Text style={styles.harcamaTarihMetni}>28 Eki 2023</Text>
            </View>
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

        {/* STARBUCKS */}
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
            <View style={styles.kategoriVeTarihKutusu}>
              <View style={styles.kategoriKutucuk}>
                <Text style={styles.kategoriKutucukMetin}>Kafe</Text>
              </View>
              <Text style={styles.harcamaTarihMetni}>27 Eki 2023</Text>
            </View>
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

        {/* TRENDYOL */}
        <TouchableOpacity style={styles.harcamaOgesi} activeOpacity={0.7}>
          <View
            style={[
              styles.ikonZemini,
              { backgroundColor: "#F27A1A" },
              styles.trendyolNeonGolge,
            ]}
          >
            <Text style={styles.ikonHarf}>T</Text>
          </View>
          <View style={styles.harcamaBilgi}>
            <Text style={styles.harcamaAd}>Trendyol</Text>
            <View style={styles.kategoriVeTarihKutusu}>
              <View style={styles.kategoriKutucuk}>
                <Text style={styles.kategoriKutucukMetin}>Alışveriş</Text>
              </View>
              <Text style={styles.harcamaTarihMetni}>25 Eki 2023</Text>
            </View>
          </View>
          <View style={styles.fiyatVeOkKapsayici}>
            <Text style={styles.harcamaTutar}>-450,00 TL</Text>
            <Ionicons
              name="chevron-forward"
              size={12}
              color="rgba(255,255,255,0.25)"
            />
          </View>
        </TouchableOpacity>

        {/* TARİH GRUBU (EYLÜL 2023) */}
        <View style={styles.tarihSatiri}>
          <View style={styles.tarihSolGrup}>
            <View style={styles.tarihCizgisi} />
            <Text style={styles.tarihBaslik}>EYLÜL 2023</Text>
          </View>
          <View style={styles.tarihSagGrup}>
            <Ionicons name="trending-down" size={14} color="#FF6B6B" />
            <Text style={styles.tarihToplamTutar}>726,68 TL</Text>
          </View>
        </View>

        {/* NETFLIX */}
        <TouchableOpacity style={styles.harcamaOgesi} activeOpacity={0.7}>
          <View style={[styles.ikonZemini, { backgroundColor: "#E30A17" }]}>
            <Text style={styles.ikonHarf}>N</Text>
          </View>
          <View style={styles.harcamaBilgi}>
            <Text style={styles.harcamaAd}>Netflix</Text>
            <View style={styles.kategoriVeTarihKutusu}>
              <View style={styles.kategoriKutucuk}>
                <Text style={styles.kategoriKutucukMetin}>Abonelik</Text>
              </View>
              <Text style={styles.harcamaTarihMetni}>25 Eyl 2023</Text>
            </View>
          </View>
          <View style={styles.fiyatVeOkKapsayici}>
            <Text style={styles.harcamaTutar}>-59,99 TL</Text>
            <Ionicons
              name="chevron-forward"
              size={12}
              color="rgba(255,255,255,0.25)"
            />
          </View>
        </TouchableOpacity>

        {/* SPOTIFY */}
        <TouchableOpacity style={styles.harcamaOgesi} activeOpacity={0.7}>
          <View
            style={[
              styles.ikonZemini,
              { backgroundColor: "#1DB954" },
              styles.migrosNeonGolge,
            ]}
          >
            <Text style={styles.ikonHarf}>Sp</Text>
          </View>
          <View style={styles.harcamaBilgi}>
            <Text style={styles.harcamaAd}>Spotify</Text>
            <View style={styles.kategoriVeTarihKutusu}>
              <View style={styles.kategoriKutucuk}>
                <Text style={styles.kategoriKutucukMetin}>Abonelik</Text>
              </View>
              <Text style={styles.harcamaTarihMetni}>15 Eyl 2023</Text>
            </View>
          </View>
          <View style={styles.fiyatVeOkKapsayici}>
            <Text style={styles.harcamaTutar}>-29,99 TL</Text>
            <Ionicons
              name="chevron-forward"
              size={12}
              color="rgba(255,255,255,0.25)"
            />
          </View>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ==========================================
  // 🔴 BOŞ EKRAN STİLLERİ
  // ==========================================
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

  // ==========================================
  // 🟢 DOLU EKRAN STİLLERİ (BİREBİR SENİN KODUN)
  // ==========================================
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
