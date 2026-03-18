import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function FisDogrulamaScreen() {
  const router = useRouter();

  return (
    <View style={styles.anaEkran}>
      <View style={styles.ustBar}>
        <TouchableOpacity
          style={styles.geriButon}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.sayfaBaslik}>Fiş Doğrulama</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollIcerik}
      >
        <View style={styles.basariKutusu}>
          <View style={styles.basariIkonZemin}>
            <Ionicons name="checkmark" size={16} color="#1DB954" />
          </View>
          <View style={styles.basariMetinKutu}>
            <Text style={styles.basariBaslik}>Fiş başarıyla tarandı!</Text>
            <Text style={styles.basariAciklama}>
              Bilgileri kontrol edip onaylayın
            </Text>
          </View>
        </View>

        <View style={styles.anaKart}>
          <LinearGradient
            colors={["rgba(29, 185, 84, 0.08)", "rgba(0, 0, 0, 0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.kartHeader}
          >
            <View style={styles.kartIkonZemin}>
              <Ionicons name="receipt-outline" size={20} color="#1DB954" />
            </View>
            <View>
              <Text style={styles.kartBaslik}>Fişiniz Hazır</Text>
              <Text style={styles.kartAciklama}>
                Lütfen bilgileri doğrulayın
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.kartIcerik}>
            <View style={styles.bilgiKutusu}>
              <Text style={styles.bilgiEtiket}>MAĞAZA</Text>
              <View style={styles.bilgiSatir}>
                <View style={styles.bilgiIcerik}>
                  <Ionicons
                    name="storefront-outline"
                    size={16}
                    color="#1DB954"
                  />
                  <Text style={styles.bilgiMetin}>Migros T.A.Ş.</Text>
                </View>
                <Ionicons
                  name="pencil-outline"
                  size={14}
                  color="rgba(255, 255, 255, 0.35)"
                />
              </View>
            </View>

            <View style={styles.bilgiKutusu}>
              <Text style={styles.bilgiEtiket}>TARİH</Text>
              <View style={styles.bilgiSatir}>
                <View style={styles.bilgiIcerik}>
                  <Ionicons name="calendar-outline" size={16} color="#1DB954" />
                  <Text style={styles.bilgiMetin}>28.10.2023</Text>
                </View>
                <Ionicons
                  name="pencil-outline"
                  size={14}
                  color="rgba(255, 255, 255, 0.35)"
                />
              </View>
            </View>

            <View style={styles.urunlerKutusu}>
              <Text style={styles.bilgiEtiket}>ÜRÜNLER (8 kalem)</Text>
              <View style={styles.urunListesi}>
                <View style={styles.urunSatir}>
                  <Text style={styles.urunAd}>Elma (1kg)</Text>
                  <Text style={styles.urunFiyat}>30,50 TL</Text>
                </View>
                <View style={styles.urunSatir}>
                  <Text style={styles.urunAd}>Çamaşır Suyu</Text>
                  <Text style={styles.urunFiyat}>45,00 TL</Text>
                </View>
                <View style={styles.urunSatir}>
                  <Text style={styles.urunAd}>Süt 1L</Text>
                  <Text style={styles.urunFiyat}>18,50 TL</Text>
                </View>
              </View>
              <View style={styles.urunlerDahaFazla}>
                <Text style={styles.dahaFazlaMetin}>+ 5 ürün daha...</Text>
              </View>
            </View>

            <LinearGradient
              colors={["rgba(29, 185, 84, 0.12)", "rgba(29, 185, 84, 0.06)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.toplamKutusu}
            >
              <Text style={styles.toplamEtiket}>TOPLAM</Text>
              <Text style={styles.toplamTutar}>289,50 TL</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.altButonlarGrup}>
          <TouchableOpacity
            style={styles.kaydetButon}
            activeOpacity={0.8}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={styles.kaydetButonMetin}>Harcamayı Kaydet</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.hataButon} activeOpacity={0.6}>
            <Ionicons
              name="alert-circle-outline"
              size={16}
              color="rgba(255, 107, 107, 0.80)"
            />
            <Text style={styles.hataButonMetin}>Hata Bildir</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  anaEkran: { flex: 1, backgroundColor: "#0A0A0A" },
  ustBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  geriButon: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  sayfaBaslik: { color: "white", fontSize: 18, fontWeight: "700" },
  scrollIcerik: { paddingHorizontal: 20, paddingBottom: 40 },

  basariKutusu: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(29, 185, 84, 0.10)",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.25)",
    marginBottom: 20,
  },
  basariIkonZemin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#1DB954",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  basariMetinKutu: { flex: 1 },
  basariBaslik: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19.5,
  },
  basariAciklama: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: 11,
    fontWeight: "400",
    lineHeight: 16.5,
  },

  anaKart: {
    backgroundColor: "rgba(39, 39, 42, 0.80)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 32,
      },
      android: { elevation: 12 },
    }),
  },
  kartHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  kartIkonZemin: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(29, 185, 84, 0.15)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.30)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  kartBaslik: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 27,
  },
  kartAciklama: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 18,
  },

  kartIcerik: { padding: 20, gap: 12 },
  bilgiKutusu: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  bilgiEtiket: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 10,
    fontWeight: "400",
    letterSpacing: 1,
    marginBottom: 6,
  },
  bilgiSatir: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bilgiIcerik: { flexDirection: "row", alignItems: "center", gap: 8 },
  bilgiMetin: { color: "white", fontSize: 14, fontWeight: "600" },

  urunlerKutusu: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  urunListesi: { gap: 6, marginBottom: 8 },
  urunSatir: { flexDirection: "row", justifyContent: "space-between" },
  urunAd: { color: "rgba(255, 255, 255, 0.55)", fontSize: 12 },
  urunFiyat: { color: "rgba(255, 255, 255, 0.55)", fontSize: 12 },
  urunlerDahaFazla: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
    paddingTop: 8,
    marginTop: 4,
  },
  dahaFazlaMetin: { color: "rgba(255, 255, 255, 0.30)", fontSize: 11 },

  toplamKutusu: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.25)",
    paddingHorizontal: 14,
    paddingVertical: 16,
    marginTop: 4,
  },
  toplamEtiket: {
    color: "rgba(255, 255, 255, 0.70)",
    fontSize: 14,
    fontWeight: "600",
  },
  toplamTutar: { color: "white", fontSize: 22, fontWeight: "800" },

  altButonlarGrup: { gap: 12 },
  kaydetButon: {
    backgroundColor: "#1DB954",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#1DB954",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
      },
      android: { elevation: 8 },
    }),
  },
  kaydetButonMetin: { color: "white", fontSize: 15, fontWeight: "700" },
  hataButon: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.40)",
    paddingVertical: 14,
    gap: 8,
  },
  hataButonMetin: {
    color: "rgba(255, 107, 107, 0.80)",
    fontSize: 15,
    fontWeight: "600",
  },
});
