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
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
      {/* ÜST BAR */}
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

      <Text style={styles.bilgiMetin}>
        Fiş veya faturayı çerçeve içine hizalayın
      </Text>

      {/* VİZÖR (TARAYICI) */}
      <View style={styles.vizorKapsayici}>
        <View style={[styles.kose, styles.koseSolUst]} />
        <View style={[styles.kose, styles.koseSagUst]} />
        <View style={[styles.kose, styles.koseSolAlt]} />
        <View style={[styles.kose, styles.koseSagAlt]} />

        <Animated.View
          style={[styles.lazerCizgi, { transform: [{ translateY: scanAnim }] }]}
        />

        <View style={styles.rozetKapsayici}>
          <Text style={styles.rozetMetin}>Fişi Buraya Hizalayın</Text>
        </View>
      </View>

      <View style={styles.altBilgiKapsayici}>
        <Text style={styles.altBilgiMetin}>
          Otomatik algılama aktif · Işığı iyi olan bir ortamda
        </Text>
        <Text style={styles.altBilgiMetin}>çekim yapın</Text>
      </View>

      {/* ALT KONTROL BARI */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)", "#000000"]}
        style={styles.altKontrolBari}
      >
        {/* Sol Buton: Galeri */}
        <TouchableOpacity style={styles.yanButon}>
          <Ionicons name="image-outline" size={24} color="white" />
        </TouchableOpacity>

        {/* Orta Buton: Çekim */}
        <TouchableOpacity
          style={styles.cekimButonu}
          activeOpacity={0.8}
          onPress={() => router.push("/fisdogrulama")}
        >
          <View style={styles.cekimButonuIc}>
            <Ionicons name="camera" size={28} color="#121212" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.manuelButon}
          activeOpacity={0.8}
          onPress={() => router.push("/manuelfis")}
        >
          <Ionicons name="create-outline" size={22} color="#1DB954" />
        </TouchableOpacity>
      </LinearGradient>
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
  baslikMetin: { color: "white", fontSize: 13, fontWeight: "600" },
  bilgiMetin: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 40,
  },
  altBilgiKapsayici: { marginTop: 60, alignItems: "center" },
  altBilgiMetin: {
    color: "rgba(255, 255, 255, 0.3)",
    fontSize: 12,
    lineHeight: 18,
  },

  vizorKapsayici: {
    width: width * 0.75,
    height: 300,
    alignSelf: "center",
    position: "relative",
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
  rozetMetin: { color: "#1DB954", fontSize: 11, fontWeight: "600" },

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

  manuelButon: {
    width: 50,
    height: 50,
    backgroundColor: "rgba(29, 185, 84, 0.15)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.30)",
  },
});
