import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useStore } from "../store/useStore";

const { width } = Dimensions.get("window");

// ŞİFREN BURADA
const GEMINI_API_KEY = "AIzaSyChRJhb0E4G6j0ZqVwN238af5C2gEMyR60".trim();

// MADDE 16: METNİ OTOMATİK DÜZELTEN FONKSİYON (Title Case)
const metniDuzenle = (metin: string) => {
  if (!metin) return "";
  return metin
    .toLocaleLowerCase("tr-TR")
    .split(" ")
    .map(
      (kelime) => kelime.charAt(0).toLocaleUpperCase("tr-TR") + kelime.slice(1),
    )
    .join(" ");
};

export default function KameraScreen() {
  const router = useRouter();
  const scanAnim = useRef(new Animated.Value(0)).current;

  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<"off" | "on">("off");
  const cameraRef = useRef<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [hataModalAcik, setHataModalAcik] = useState(false);
  const [hataMesaji, setHataMesaji] = useState("");

  const { setTempFis } = useStore();

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

  const yapayZekayaGonder = async (base64Image: string, imageUri: string) => {
    setIsProcessing(true);
    try {
      const modelsReq = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`,
      );
      const modelsData = await modelsReq.json();

      let secilenModel = "gemini-1.5-flash";

      if (modelsData && modelsData.models) {
        const acikModeller = modelsData.models.map((m: any) =>
          m.name.replace("models/", ""),
        );
        if (acikModeller.includes("gemini-1.5-flash"))
          secilenModel = "gemini-1.5-flash";
        else if (acikModeller.includes("gemini-1.5-pro"))
          secilenModel = "gemini-1.5-pro";
        else if (acikModeller.includes("gemini-pro-vision"))
          secilenModel = "gemini-pro-vision";
        else secilenModel = acikModeller[0];
      }

      // MADDE 4: Prompt içindeki JSON formatı "kategori" olarak düzeltildi
      const prompt = `
        Sen uzman bir fiş ve fatura okuma yapay zekasısın.
        DİKKAT: Eğer gönderilen görsel bir fiş, fatura veya adisyon DEĞİLSE (Örn: manzara, insan, boş bir masa resmi vb.), BANA SADECE ŞU JSON'U DÖNDÜR:
        {"hata": "Bu bir fiş değil"}
        
        Eğer görsel bir fiş ise, görseli analiz et ve BANA SADECE AŞAĞIDAKİ JSON FORMATINDA CEVAP VER. Başka hiçbir kelime kullanma.
        
        KURALLAR:
        1. "magazaAdi" ve ürün isimlerini "Title Case" formatında düzelt. (Örn: "MİGROS T.A.Ş" yerine "Migros", "BRAVO ASLAN" yerine "Bravo Aslan" yaz).
        2. Fişin genel içeriğine bakarak en uygun ana kategoriyi belirle. (Sadece şunlardan biri olabilir: Market, Restoran/Kafe, Giyim, Teknoloji, Sağlık, Akaryakıt, Eğlence, Diğer). Bunu doğrudan "kategori" alanına yaz.

        Format:
        {
          "magazaAdi": "Mağaza Adı",
          "tarih": "DD.MM.YYYY",
          "toplamTutar": 150.50,
          "kategori": "Market",
          "urunler": [
            {
              "ad": "Ürün 1",
              "fiyat": 50.25,
              "kategori": "Gıda"
            }
          ]
        }
      `;

      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${secilenModel}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
                ],
              },
            ],
          }),
        },
      );

      const result = await response.json();

      if (!response.ok)
        throw new Error(
          result.error?.message || "Google API bağlantıyı reddetti.",
        );
      if (!result.candidates || result.candidates.length === 0)
        throw new Error("Metin bulunamadı.");

      let aiText = result.candidates[0].content.parts[0].text;

      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Geçerli bir JSON formatı dönmedi.");

      const parsedData = JSON.parse(jsonMatch[0]);

      // M15: Eğer yapay zeka bunun fiş olmadığını anlarsa hata fırlat
      if (parsedData.hata) {
        throw new Error("Görselde geçerli bir fiş veya fatura bulunamadı.");
      }

      // M16: JS FONKSİYONU İLE GARANTİLİ DÜZELTME
      const duzenlenmisUrunler = (parsedData.urunler || []).map(
        (urun: any) => ({
          ...urun,
          ad: metniDuzenle(urun.ad || "Bilinmeyen Ürün"),
        }),
      );

      // M4 ve M16: Veri atamaları
      setTempFis({
        magazaAdi: metniDuzenle(parsedData.magazaAdi || "Bilinmiyor"),
        tarih: parsedData.tarih || "",
        toplamTutar: parsedData.toplamTutar || 0,
        kategori: parsedData.kategori || parsedData.fisKategorisi || "Diğer", // MADDE 4: "kategori" olarak atandı
        urunler: duzenlenmisUrunler,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      router.push({ pathname: "/fisdogrulama", params: { imageUri } });
    } catch (error: any) {
      console.error("Yapay Zeka Hatası:", error.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      setHataMesaji(
        error.message.includes("fiş veya fatura")
          ? "Bu görsel bir fişe benzemiyor. Lütfen geçerli bir fiş okutun."
          : `Okuma başarısız: İnternet bağlantınızı kontrol edin.`,
      );
      setHataModalAcik(true);
      setTempFis({
        magazaAdi: "",
        tarih: "",
        toplamTutar: 0,
        kategori: "",
        urunler: [],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const galeriyeGit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      await yapayZekayaGonder(result.assets[0].base64, result.assets[0].uri);
    }
  };

  const fotografCek = async () => {
    if (cameraRef.current && !isProcessing) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      try {
        setIsProcessing(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: true,
          shutterSound: false,
        });

        if (photo.base64) {
          await yapayZekayaGonder(photo.base64, photo.uri);
        }
      } catch (e) {
        console.error("Çekim hatası:", e);
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
        enableTorch={flash === "on"}
        ref={cameraRef}
      />

      <View style={styles.ustBar}>
        <TouchableOpacity
          style={styles.ikonButon}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.baslikKutu}>
          <Text style={styles.baslikMetin}>Fiş Tarayıcı</Text>
        </View>

        <TouchableOpacity
          style={styles.ikonButon}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setFlash((f) => (f === "off" ? "on" : "off"));
          }}
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
          <Text style={styles.rozetMetin}>
            {isProcessing
              ? "Yapay Zeka Analiz Ediyor..."
              : "Otomatik Algılama Hazır"}
          </Text>
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
        <TouchableOpacity
          style={styles.yanButon}
          onPress={galeriyeGit}
          disabled={isProcessing}
        >
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
              <ActivityIndicator color="#1DB954" size="large" />
            ) : (
              <Ionicons name="camera" size={28} color="#121212" />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.manuelButon}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/manuelfis");
          }}
          disabled={isProcessing}
        >
          <Ionicons name="create-outline" size={22} color="#1DB954" />
        </TouchableOpacity>
      </LinearGradient>

      {/* KARİZMATİK KOYU TEMA HATA MODALI */}
      <Modal visible={hataModalAcik} transparent={true} animationType="fade">
        <View style={styles.hataModalArkaPlan}>
          <View style={styles.hataModalKutu}>
            <View style={styles.hataIkonZemin}>
              <Ionicons name="alert-circle" size={36} color="#FF6B6B" />
            </View>
            <Text style={styles.hataBaslik}>Sistem Uyarısı</Text>
            <Text style={styles.hataMesajiMetni}>{hataMesaji}</Text>

            <View style={styles.hataButonlarKapsayici}>
              <TouchableOpacity
                style={styles.hataKapatButon}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setHataModalAcik(false);
                }}
              >
                <Text style={styles.hataKapatButonMetin}>Tekrar Dene</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.hataManuelButon}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setHataModalAcik(false);
                  router.push("/manuelfis");
                }}
              >
                <Text style={styles.hataManuelButonMetin}>Manuel Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
  hataModalArkaPlan: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  hataModalKutu: {
    width: "100%",
    backgroundColor: "#18181B",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  hataIkonZemin: {
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
  hataBaslik: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  hataMesajiMetni: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  hataButonlarKapsayici: { width: "100%", gap: 12 },
  hataKapatButon: {
    width: "100%",
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  hataKapatButonMetin: { color: "white", fontSize: 15, fontWeight: "700" },
  hataManuelButon: {
    width: "100%",
    height: 50,
    backgroundColor: "#1DB954",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  hataManuelButonMetin: { color: "white", fontSize: 15, fontWeight: "700" },
});
