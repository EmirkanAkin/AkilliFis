import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useStore } from "../store/useStore";

export default function OnboardingScreen() {
  const router = useRouter();

  const scrollRef = useRef<ScrollView>(null);

  const [isim, setIsim] = useState("");
  const globalIsim = useStore((state) => state.isim);
  const setGlobalIsim = useStore((state) => state.setIsim);
  const [kayitAsamasinda, setKayitAsamasinda] = useState(false);
  const [ekranGoster, setEkranGoster] = useState(false);

  useEffect(() => {
    if (
      !kayitAsamasinda &&
      globalIsim !== "Misafir" &&
      globalIsim.trim() !== ""
    ) {
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 100);
    } else {
      setEkranGoster(true);
    }
  }, [globalIsim, kayitAsamasinda]);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const klavyeAcildi = Keyboard.addListener(showEvent, () => {
      // Klavye açıldığında ekranın boyuyla oynamadan sadece en alta kaydırır
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 150);
    });

    const klavyeKapandi = Keyboard.addListener(hideEvent, () => {
      // Klavye kapanınca da yumuşakça en tepeye geri döner
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }, 150);
    });

    return () => {
      klavyeAcildi.remove();
      klavyeKapandi.remove();
    };
  }, []);

  const [odaklandiMi, setOdaklandiMi] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const devamEt = () => {
    setKayitAsamasinda(true);
    setGlobalIsim(isim);
    router.push("/ilkgiris-butce");
  };

  if (!ekranGoster) {
    return <View style={{ flex: 1, backgroundColor: "#121212" }} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.anaEkran}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.ustBar}>
        <View style={styles.ilerlemeKapsayici}>
          <View style={styles.ilerlemeCizgisiAktif} />
          <View style={styles.ilerlemeNoktasiPasif} />
        </View>
        <Text style={styles.adimMetni}>Adım 1/2</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.icerik}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
        automaticallyAdjustKeyboardInsets={true}
      >
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

        <View style={styles.karsilamaKapsayici}>
          <Text style={styles.merhabaMetin}>Merhaba! 👋</Text>
          <Text style={styles.altMetin}>Başlamadan önce sizi tanıyalım</Text>
        </View>

        <View style={styles.formKapsayici}>
          <Text
            style={[styles.inputEtiket, odaklandiMi && { color: "#1DB954" }]}
          >
            Sana nasıl hitap edelim?
          </Text>

          <Pressable
            style={[styles.inputZemin, odaklandiMi && styles.inputOdakli]}
            onPress={() => inputRef.current?.focus()}
          >
            <TextInput
              ref={inputRef}
              style={styles.inputGirdi}
              placeholder="İsminizi girin"
              placeholderTextColor="rgba(255, 255, 255, 0.30)"
              value={isim}
              onChangeText={setIsim}
              onFocus={() => setOdaklandiMi(true)}
              onBlur={() => setOdaklandiMi(false)}
              selectionColor="transparent"
              cursorColor="#1DB954"
              autoCapitalize="words"
              returnKeyType="done"
            />
          </Pressable>
        </View>

        {/* Klavye rahatlasın diye boşluk */}
        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.sabitAltButonAlani}>
        <TouchableOpacity
          style={[styles.buton, isim.trim() === "" && styles.butonPasif]}
          activeOpacity={0.8}
          onPress={devamEt}
          disabled={isim.trim() === ""}
        >
          <Text
            style={[
              styles.butonMetin,
              isim.trim() === "" && { color: "rgba(255, 255, 255, 0.3)" },
            ]}
          >
            Devam Et
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  anaEkran: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: Platform.OS === "android" ? 50 : 60,
  },
  ustBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  icerik: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
    justifyContent: "center",
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
  logoKapsayici: { alignItems: "center", marginBottom: 40 },
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
  logoMetin: { color: "white", fontSize: 36, fontWeight: "800" },
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
  karsilamaKapsayici: { alignItems: "center", marginBottom: 30 },
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
  formKapsayici: { marginBottom: 24 },
  inputEtiket: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  inputZemin: {
    backgroundColor: "#18181B",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 18,
    height: 58,
    justifyContent: "center",
  },
  inputOdakli: {
    borderColor: "#1DB954",
    borderWidth: 1.5,
    backgroundColor: "rgba(29, 185, 84, 0.05)",
  },
  inputGirdi: { color: "white", fontSize: 16, fontWeight: "500", padding: 0 },
  sabitAltButonAlani: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    backgroundColor: "#121212",
  },
  buton: {
    backgroundColor: "#1DB954",
    borderRadius: 16,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1DB954",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  butonPasif: {
    backgroundColor: "rgba(29, 185, 84, 0.15)",
    shadowOpacity: 0,
    elevation: 0,
  },
  butonMetin: { color: "white", fontSize: 16, fontWeight: "700" },
});
