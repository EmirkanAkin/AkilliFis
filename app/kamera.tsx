import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker"; // 1. Galeri paketini içeri aldık
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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

  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<"off" | "on">("off");
  const cameraRef = useRef<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  // 2. Galeriye Gitme Fonksiyonu
  const galeriyeGit = async () => {
    // Galeriden resim seçme izni iste ve seçtir
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      console.log("Galeriden resim seçildi:", result.assets[0].uri);
      router.push({
        pathname: "/fisdogrulama",
        params: { imageUri: result.assets[0].uri },
      });
    }
  };

  const fotografCek = async () => {
    if (cameraRef.current && !isProcessing) {
      try {
        setIsProcessing(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
        });

        router.push({
          pathname: "/fisdogrulama",
          params: { imageUri: photo.uri },
        });
      } catch (e) {
        console.error("Çekim hatası:", e);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (!permission) return <View style={styles.anaEkran} />;

  if (!permission.granted) {
    return (
      <View
        style={[
          styles.anaEkran,
          { justifyContent: "center", alignItems: "center", padding: 20 },
        ]}
      >
        <Text style={{ color: "white", textAlign: "center", marginBottom: 20 }}>
          Kamera izni olmadan fişleri tarayamayız.
        </Text>
        <TouchableOpacity style={styles.izinButon} onPress={requestPermission}>
          <Text style={{ color: "white", fontWeight: "700" }}>İzin Ver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.anaEkran}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={flash === "on"} // Flash yerine enableTorch bazı cihazlarda daha iyi çalışır
        ref={cameraRef}
      />

      <View style={styles.ustBar}>
        <TouchableOpacity
          style={styles.ikonButon}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.baslikKutu}>
          <Text style={styles.baslikMetin}>Fiş Tarayıcı</Text>
        </View>

        {/* Flaş Butonu Artık Çalışıyor */}
        <TouchableOpacity
          style={styles.ikonButon}
          onPress={() => setFlash((f) => (f === "off" ? "on" : "off"))}
        >
          <Ionicons
            name={flash === "on" ? "flash" : "flash-off-outline"}
            size={22}
            color={flash === "on" ? "#1DB954" : "rgba(255, 255, 255, 0.7)"}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.bilgiMetin}>
        Fiş veya faturayı çerçeve içine hizalayın
      </Text>

      <View style={styles.vizorKapsayici}>
        <View style={[styles.kose, styles.koseSolUst]} />
        <View style={[styles.kose, styles.koseSagUst]} />
        <View style={[styles.kose, styles.koseSolAlt]} />
        <View style={[styles.kose, styles.koseSagAlt]} />

        <Animated.View
          style={[styles.lazerCizgi, { transform: [{ translateY: scanAnim }] }]}
        />

        <View style={styles.rozetKapsayici}>
          <Text style={styles.rozetMetin}>Otomatik Algılama Hazır</Text>
        </View>
      </View>

      <View style={styles.altBilgiKapsayici}>
        <Text style={styles.altBilgiMetin}>
          Işığı iyi olan bir ortamda çekim yapın
        </Text>
      </View>

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)", "#000000"]}
        style={styles.altKontrolBari}
      >
        {/* Galeri Butonu Artık Çalışıyor */}
        <TouchableOpacity style={styles.yanButon} onPress={galeriyeGit}>
          <Ionicons name="image-outline" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cekimButonu}
          activeOpacity={0.8}
          onPress={fotografCek}
          disabled={isProcessing}
        >
          <View style={styles.cekimButonuIc}>
            {isProcessing ? (
              <ActivityIndicator color="#1DB954" />
            ) : (
              <Ionicons name="camera" size={28} color="#121212" />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.manuelButon}
          onPress={() => router.push("/manuelfis")}
        >
          <Ionicons name="create-outline" size={22} color="#1DB954" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

// Stillerin geri kalanı aynı, değiştirmene gerek yok...
const styles = StyleSheet.create({
  anaEkran: { flex: 1, backgroundColor: "#0A0A0A" },
  izinButon: {
    backgroundColor: "#1DB954",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 16,
  },
  ustBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    zIndex: 10,
  },
  ikonButon: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  baslikKutu: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  baslikMetin: {
    color: "white",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  bilgiMetin: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
    fontWeight: "500",
    textShadowColor: "black",
    textShadowRadius: 4,
  },
  vizorKapsayici: {
    width: width * 0.8,
    height: 340,
    alignSelf: "center",
    position: "relative",
    marginTop: 40,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 24,
  },
  kose: { position: "absolute", width: 30, height: 30, borderColor: "#1DB954" },
  koseSolUst: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 24,
  },
  koseSagUst: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 24,
  },
  koseSolAlt: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 24,
  },
  koseSagAlt: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 24,
  },
  lazerCizgi: {
    width: "90%",
    height: 3,
    backgroundColor: "#1DB954",
    alignSelf: "center",
    position: "absolute",
    top: 20,
    shadowColor: "#1DB954",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  rozetKapsayici: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.5)",
  },
  rozetMetin: { color: "#1DB954", fontSize: 11, fontWeight: "700" },
  altBilgiKapsayici: { marginTop: 40, alignItems: "center" },
  altBilgiMetin: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.8,
  },
  altKontrolBari: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 160,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  yanButon: {
    width: 52,
    height: 52,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  cekimButonu: {
    width: 84,
    height: 84,
    backgroundColor: "white",
    borderRadius: 42,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 6,
    borderColor: "rgba(255, 255, 255, 0.2)",
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
    width: 52,
    height: 52,
    backgroundColor: "rgba(29, 185, 84, 0.2)",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.4)",
  },
});
