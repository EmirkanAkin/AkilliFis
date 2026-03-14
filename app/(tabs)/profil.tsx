/* app/(tabs)/profil.tsx */
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
  // 🔥 İleride bu fonksiyonları veritabanına bağlayacağız
  const handleIsimDegistir = () => {
    Alert.alert(
      "Yapım Aşamasında",
      "İsim değiştirme ekranı yakında eklenecek.",
    );
  };

  const handleButceBelirle = () => {
    Alert.alert(
      "Yapım Aşamasında",
      "Aylık bütçe belirleme ekranı yakında eklenecek.",
    );
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

      {/* 2. PROFİL KARTI (Sadeleştirilmiş) */}
      <LinearGradient
        colors={["rgba(29, 185, 84, 0.10)", "rgba(29, 185, 84, 0.04)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profilKarti}
      >
        <LinearGradient
          colors={["#1DB954", "#15A344"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profilAvatar}
        >
          {/* 🔥 İsminin ilk harfi buraya otomatik gelecek ileride */}
          <Text style={styles.avatarHarf}>E</Text>
        </LinearGradient>
        <Text style={styles.profilIsim}>Emirkan</Text>
      </LinearGradient>

      {/* 3. İSTATİSTİK KARTLARI */}
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

      {/* 4. AYARLAR MENÜSÜ */}
      <View style={styles.menuKapsayici}>
        <Text style={styles.menuBaslik}>AYARLAR</Text>
        <View style={styles.menuListeKutu}>
          {/* İsim Değiştirme Butonu */}
          <TouchableOpacity
            style={styles.menuOgesi}
            onPress={handleIsimDegistir}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.menuIkonZemin,
                {
                  backgroundColor: "rgba(29, 185, 84, 0.12)",
                  borderColor: "rgba(29, 185, 84, 0.20)",
                },
              ]}
            >
              <Ionicons name="person-outline" size={16} color="#1DB954" />
            </View>
            <Text style={styles.menuOgeMetin}>Profil Bilgilerini Düzenle</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color="rgba(255, 255, 255, 0.20)"
            />
          </TouchableOpacity>
          <View style={styles.ayracCizgi} />

          {/* Bütçe Belirleme Butonu */}
          <TouchableOpacity
            style={styles.menuOgesi}
            onPress={handleButceBelirle}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.menuIkonZemin,
                {
                  backgroundColor: "rgba(59, 130, 246, 0.12)",
                  borderColor: "rgba(59, 130, 246, 0.20)",
                },
              ]}
            >
              <Ionicons name="wallet-outline" size={16} color="#3B82F6" />
            </View>
            <Text style={styles.menuOgeMetin}>Aylık Bütçe Hedefi Belirle</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color="rgba(255, 255, 255, 0.20)"
            />
          </TouchableOpacity>
          <View style={styles.ayracCizgi} />

          {/* Uygulama Versiyonu (Tıklanamaz, bilgi amaçlı) */}
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

      {/* 5. VERİLERİ SIFIRLA (KIRMIZI BUTON) */}
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

      {/* Alt boşluk */}
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
  headerKapsayici: {
    marginBottom: 24,
  },
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

  // PROFİL KARTI
  profilKarti: {
    flexDirection: "row", // Yan yana diz
    alignItems: "center", // Dikeyde ortala
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.20)",
    marginBottom: 24,
    overflow: "hidden", // Android köşe koruması
  },
  profilAvatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#1DB954",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarHarf: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
  },
  profilIsim: {
    color: "white",
    fontSize: 22, // İsim ön plana çıksın diye büyütüldü
    fontWeight: "700",
  },

  // İSTATİSTİKLER
  istatistikKapsayici: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
  },
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

  // MENÜ
  menuKapsayici: {
    marginBottom: 30,
  },
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
    overflow: "hidden", // Android köşe koruması
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
  menuOgeMetin: {
    flex: 1,
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  menuSagBilgi: {
    color: "rgba(255, 255, 255, 0.35)",
    fontSize: 12,
    fontWeight: "500",
  },
  ayracCizgi: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginLeft: 60, // Çizgi ikonun altından değil yazının altından başlasın
  },

  // SIFIRLA BUTONU
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
