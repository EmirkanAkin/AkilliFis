import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfilScreen() {
  const router = useRouter();

  const handleIsimDegistir = () => {
    router.push("/isimmodal");
  };

  const handleButceBelirle = () => {
    router.push("/butcemodal");
  };

  const handleVerileriSifirla = () => {
    Alert.alert(
      "Dikkat!",
      "Tüm harcama geçmişini ve verileri silmek istediğine emin misin? Bu işlem geri alınamaz.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => console.log("Veriler silindi"),
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.anaEkran} showsVerticalScrollIndicator={false}>
      {/* 1. ÜST BAŞLIK */}
      <View style={styles.headerKapsayici}>
        <Text style={styles.ustBaslik}>HESABIM</Text>
        <Text style={styles.sayfaBaslik}>Profil</Text>
      </View>

      {/*  2. İSİM KARTI (Daha kalın font + Yeni İkon) */}
      <TouchableOpacity
        style={styles.isimKartiZemin}
        activeOpacity={0.8}
        onPress={handleIsimDegistir}
      >
        <LinearGradient
          colors={["rgba(29, 185, 84, 0.10)", "rgba(29, 185, 84, 0.04)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.isimKartiIc}
        >
          {/* Avatar */}
          <LinearGradient
            colors={["#1DB954", "#15A344"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarKutu}
          >
            <Text style={styles.avatarHarf}>E</Text>
          </LinearGradient>

          {/* İsim ve Düzenle İkonu */}
          <View style={styles.isimBilgiAlani}>
            <Text style={styles.kullaniciIsmi}>Emirkan</Text>
            {/* İŞTE İSTEDİĞİN O KARELİ KALEM İKONU */}
            <Ionicons
              name="create-outline"
              size={20}
              color="rgba(255, 255, 255, 0.45)"
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* 3. BÜTÇE KARTI (Daha kalın font + Yeni İkon) */}
      <TouchableOpacity
        style={styles.butceKartiZemin}
        activeOpacity={0.8}
        onPress={handleButceBelirle}
      >
        <View style={styles.butceBilgiAlani}>
          <Text style={styles.butceBaslik}>AYLIK BÜTÇE</Text>
          <Text style={styles.butceDeger}>
            18.000 <Text style={styles.butceParaBirimi}>TL</Text>
          </Text>
        </View>
        {/*  İŞTE İSTEDİĞİN O KARELİ KALEM İKONU (YEŞİL) */}
        <Ionicons name="create-outline" size={24} color="#1DB954" />
      </TouchableOpacity>

      {/* 4. İSTATİSTİK KARTLARI */}
      <View style={styles.istatistikKapsayici}>
        <View style={styles.istatistikKutusu}>
          <Text style={styles.istatistikDeger}>47</Text>
          <Text style={styles.istatistikEtiket}>Toplam Fiş</Text>
        </View>
        <View style={styles.istatistikKutusu}>
          <Text style={styles.istatistikDeger}>12</Text>
          <Text style={styles.istatistikEtiket}>Bu Ay</Text>
        </View>
        <View style={styles.istatistikKutusu}>
          <Text style={styles.istatistikDeger}>1.040 TL</Text>
          <Text style={styles.istatistikEtiket}>Tasarruf</Text>
        </View>
      </View>

      {/* 5. AYARLAR MENÜSÜ */}
      <View style={styles.menuKapsayici}>
        <Text style={styles.menuBaslik}>AYARLAR</Text>
        <View style={styles.menuListeKutu}>
          {/* Uygulama Versiyonu */}
          <View style={styles.menuOgesi}>
            <View
              style={[
                styles.menuIkonZemin,
                {
                  backgroundColor: "rgba(236, 72, 153, 0.12)",
                  borderColor: "rgba(236, 72, 153, 0.20)",
                },
              ]}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={16}
                color="#EC4899"
              />
            </View>
            <Text style={styles.menuOgeMetin}>Uygulama Versiyonu</Text>
            <Text style={styles.menuSagBilgi}>1.0.0</Text>
          </View>
        </View>
      </View>

      {/* 6. VERİLERİ SIFIRLA */}
      <TouchableOpacity
        style={styles.sifirlaButon}
        activeOpacity={0.7}
        onPress={handleVerileriSifirla}
      >
        <Ionicons
          name="trash-outline"
          size={18}
          color="rgba(239, 68, 68, 0.80)"
        />
        <Text style={styles.sifirlaMetin}>Tüm Verileri Sıfırla</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/* TASARIM BÖLÜMÜ */
const styles = StyleSheet.create({
  anaEkran: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerKapsayici: { marginBottom: 24 },
  ustBaslik: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 11,
    fontWeight: "400",
    letterSpacing: 1,
    marginBottom: 4,
  },
  sayfaBaslik: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 33,
  },

  // İSİM KARTI
  isimKartiZemin: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.20)",
  },
  isimKartiIc: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  avatarKutu: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1DB954",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarHarf: { color: "white", fontSize: 24, fontWeight: "900" }, // Daha kalın
  isimBilgiAlani: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  kullaniciIsmi: { color: "white", fontSize: 22, fontWeight: "900" }, //  DAHA KALIN VE BÜYÜK

  // BÜTÇE KARTI
  butceKartiZemin: {
    backgroundColor: "#18181B",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  butceBilgiAlani: { gap: 6 },
  butceBaslik: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  butceDeger: { color: "white", fontSize: 24, fontWeight: "900" }, //  DAHA KALIN VE BÜYÜK
  butceParaBirimi: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: 16,
    fontWeight: "600",
  },

  // İSTATİSTİKLER VE MENÜ
  istatistikKapsayici: { flexDirection: "row", gap: 12, marginBottom: 30 },
  istatistikKutusu: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  istatistikDeger: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  istatistikEtiket: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 10,
    fontWeight: "400",
  },
  menuKapsayici: { marginBottom: 30 },
  menuBaslik: {
    color: "rgba(255, 255, 255, 0.35)",
    fontSize: 11,
    fontWeight: "400",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  menuListeKutu: {
    backgroundColor: "rgba(39, 39, 42, 0.70)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    overflow: "hidden",
  },
  menuOgesi: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIkonZemin: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuOgeMetin: { flex: 1, color: "white", fontSize: 14, fontWeight: "500" },
  menuSagBilgi: {
    color: "rgba(255, 255, 255, 0.35)",
    fontSize: 12,
    fontWeight: "500",
  },
  sifirlaButon: {
    flexDirection: "row",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.20)",
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  sifirlaMetin: {
    color: "rgba(239, 68, 68, 0.80)",
    fontSize: 14,
    fontWeight: "600",
  },
});
