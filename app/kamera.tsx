/* app/kamera.tsx */
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function KameraScreen() {
  const router = useRouter();

  // 🔥 Lazer çizgisinin aşağı-yukarı kayma animasyonu
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 0'dan 250'ye gidip (aşağı inip) geri dönen sonsuz bir döngü
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 260,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [scanAnim]);

  return (
    <View style={styles.anaEkran}>
      {/* 1. ÜST BAR */}
      <View style={styles.ustBar}>
        <TouchableOpacity
          style={styles.ikonButon}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.baslikKutu}>
          <Text style={styles.baslikMetin}>Kamera Ekranı</Text>
        </View>

        <TouchableOpacity style={styles.ikonButon}>
          <Ionicons
            name="flash-off-outline"
            size={22}
            color="rgba(255, 255, 255, 0.7)"
          />
        </TouchableOpacity>
      </View>

      {/* 2. ORTA BİLGİ METİNLERİ */}
      <Text style={styles.bilgiMetin}>
        Fiş veya faturayı çerçeve içine hizalayın
      </Text>

      {/* 3. TARAYICI ÇERÇEVESİ (VIZÖR) */}
      <View style={styles.vizorKapsayici}>
        {/* Sol Üst Köşe */}
        <View style={[styles.kose, styles.koseSolUst]} />
        {/* Sağ Üst Köşe */}
        <View style={[styles.kose, styles.koseSagUst]} />
        {/* Sol Alt Köşe */}
        <View style={[styles.kose, styles.koseSolAlt]} />
        {/* Sağ Alt Köşe */}
        <View style={[styles.kose, styles.koseSagAlt]} />

        {/* 🔥 HAREKETLİ LAZER ÇİZGİSİ */}
        <Animated.View
          style={[styles.lazerCizgi, { transform: [{ translateY: scanAnim }] }]}
        />

        {/* Fişi Buraya Hizalayın Rozeti */}
        <View style={styles.rozetKapsayici}>
          <Text style={styles.rozetMetin}>Fişi Buraya Hizalayın</Text>
        </View>
      </View>

      {/* 4. ALT BİLGİ METNİ */}
      <View style={styles.altBilgiKapsayici}>
        <Text style={styles.altBilgiMetin}>Işığı iyi olan bir ortamda</Text>
        <Text style={styles.altBilgiMetin}>çekim yapın</Text>
      </View>

      {/* 5. ALT KONTROL BAR'I (Gradient Arka Planlı) */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)", "#000000"]}
        style={styles.altKontrolBari}
      >
        <TouchableOpacity style={styles.yanButon}>
          <Ionicons name="image-outline" size={24} color="white" />
        </TouchableOpacity>

        {/* BÜYÜK DEKLANŞÖR BUTONU */}
        <TouchableOpacity style={styles.cekimButonu} activeOpacity={0.8}>
          <View style={styles.cekimButonuIc}>
            <Ionicons name="camera" size={28} color="#121212" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.yanButon}>
          <Ionicons name="flash-outline" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  anaEkran: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },

  // ÜST BAR
  ustBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60, // Çentik boşluğu
    marginBottom: 40,
  },
  ikonButon: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  baslikKutu: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  baslikMetin: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },

  // ORTA METİNLER
  bilgiMetin: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 40,
  },
  altBilgiKapsayici: {
    marginTop: 60,
    alignItems: "center",
  },
  altBilgiMetin: {
    color: "rgba(255, 255, 255, 0.3)",
    fontSize: 12,
    lineHeight: 18,
  },

  // VİZÖR (TARAMA ÇERÇEVESİ)
  vizorKapsayici: {
    width: width * 0.75, // Ekran genişliğinin %75'i
    height: 300,
    alignSelf: "center",
    position: "relative",
    // İçine tatlı bir yeşil glow veriyoruz
    backgroundColor: "rgba(29, 185, 84, 0.02)",
    borderRadius: 16,
  },
  kose: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#1DB954",
    shadowColor: "#1DB954",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  koseSolUst: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 16,
  },
  koseSagUst: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 16,
  },
  koseSolAlt: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 16,
  },
  koseSagAlt: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 16,
  },

  // LAZER ÇİZGİSİ
  lazerCizgi: {
    width: "90%",
    height: 2,
    backgroundColor: "#1DB954",
    alignSelf: "center",
    position: "absolute",
    top: 20,
    shadowColor: "#1DB954",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },

  rozetKapsayici: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "rgba(29, 185, 84, 0.20)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.40)",
  },
  rozetMetin: {
    color: "#1DB954",
    fontSize: 11,
    fontWeight: "600",
  },

  // ALT KONTROL BAR'I
  altKontrolBari: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 140,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 20,
  },
  yanButon: {
    width: 50,
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  cekimButonu: {
    width: 76,
    height: 76,
    backgroundColor: "white",
    borderRadius: 38,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  cekimButonuIc: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
});
