import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function OnboardingScreen() {
  const router = useRouter();
  const [isim, setIsim] = useState("");

  const devamEt = () => {
    router.push("/ilkgiris-butce");
  };

  return (
    <KeyboardAvoidingView
      style={styles.anaEkran}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.icerik}>
          <View style={styles.ustBar}>
            <View style={styles.ilerlemeKapsayici}>
              {/* 1. Adım (Şu an buradayız, uzun aktif yeşil çizgi) */}
              <View style={styles.ilerlemeCizgisiAktif} />
              {/* 2. Adım (Henüz geçmedik, küçük pasif nokta) */}
              <View style={styles.ilerlemeNoktasiPasif} />
            </View>
            <Text style={styles.adimMetni}>Adım 1/2</Text>
          </View>

          <View style={styles.ustBosluk} />

          {/* 1. LOGO VE MARKA ALANI */}
          <View style={styles.logoKapsayici}>
            <LinearGradient
              colors={["#1DB954", "#15A344"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoKutu}
            >
              <Text style={styles.logoMetin}>AF</Text>
            </LinearGradient>
            <Text style={styles.markaIsim}>AkıllıFiş</Text>
            <Text style={styles.slogan}>Akıllı bütçe yöneticiniz</Text>
          </View>

          {/* 2. KARŞILAMA METNİ */}
          <View style={styles.karsilamaKapsayici}>
            <Text style={styles.merhabaMetin}>Merhaba! 👋</Text>
            <Text style={styles.altMetin}>Başlamadan önce sizi tanıyalım</Text>
          </View>

          {/* 3. İSİM GİRİŞ FORMU */}
          <View style={styles.formKapsayici}>
            <Text style={styles.inputEtiket}>Sana nasıl hitap edelim?</Text>
            <View style={styles.inputZemin}>
              <TextInput
                style={styles.inputGirdi}
                placeholder="İsminizi girin"
                placeholderTextColor="rgba(255, 255, 255, 0.50)"
                value={isim}
                onChangeText={setIsim}
                returnKeyType="done"
              />
            </View>
          </View>

          <View style={styles.altBosluk} />

          {/* 4. DEVAM ET BUTONU */}
          <TouchableOpacity
            style={[styles.buton, isim.trim() === "" && styles.butonPasif]}
            activeOpacity={0.8}
            onPress={devamEt}
            disabled={isim.trim() === ""}
          >
            <Text style={styles.butonMetin}>Devam Et</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Arka planı Bütçe ekranıyla aynı zifiri siyaha çektik
  anaEkran: {
    flex: 1,
    backgroundColor: "#121212",
  },
  icerik: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60, // Bütçe ekranıyla aynı hizada başlaması için
  },

  ustBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  ilerlemeKapsayici: { flexDirection: "row", gap: 8, alignItems: "center" },
  ilerlemeCizgisiAktif: {
    width: 16,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1DB954",
    shadowColor: "#1DB954",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 5,
  },
  ilerlemeNoktasiPasif: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  adimMetni: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 13,
    fontWeight: "500",
  },

  ustBosluk: { flex: 0.5 },
  altBosluk: { flex: 1 },

  // LOGO STİLLERİ
  logoKapsayici: {
    alignItems: "center",
    marginBottom: 60,
  },
  logoKutu: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#1DB954",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 10,
  },
  logoMetin: {
    color: "white",
    fontSize: 36,
    fontWeight: "800",
  },
  markaIsim: {
    color: "white",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  slogan: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: 14,
    fontWeight: "400",
  },

  // KARŞILAMA METNİ STİLLERİ
  karsilamaKapsayici: {
    alignItems: "center",
    marginBottom: 40,
  },
  merhabaMetin: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  altMetin: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: 14,
    fontWeight: "400",
  },

  // FORM STİLLERİ
  formKapsayici: {
    marginBottom: 24,
  },
  inputEtiket: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  inputZemin: {
    backgroundColor: "rgba(255, 255, 255, 0.04)", // Bütçe kartıyla aynı zemin rengi
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 18,
    height: 58,
    justifyContent: "center",
  },
  inputGirdi: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    height: "100%",
  },

  // BUTON STİLLERİ
  buton: {
    backgroundColor: "#1DB954",
    borderRadius: 16,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  butonPasif: {
    backgroundColor: "rgba(29, 185, 84, 0.25)",
  },
  butonMetin: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
