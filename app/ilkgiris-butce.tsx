import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ZUSTAND VE FIREBASE BAĞLANTILARI
import { signInAnonymously } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useStore } from "../store/useStore";

export default function IlkGirisButceScreen() {
  const router = useRouter();

  const scrollRef = useRef<ScrollView>(null);

  // Lokal state (Ekranda yazarken tuttuğumuz yer)
  const [seciliButce, setSeciliButce] = useState("5.000");
  const [klavyeAcik, setKlavyeAcik] = useState(false);

  // ZUSTAND'DAN İSİM, BÜTÇE KAYDETME VE UID KAYDETME FONKSİYONLARINI ÇEKTİK
  const { isim, setButce, setUid } = useStore();

  useEffect(() => {
    const klavyeGosterildi = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setKlavyeAcik(true);
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 150);
      },
    );
    const klavyeGizlendi = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKlavyeAcik(false),
    );

    return () => {
      klavyeGosterildi.remove();
      klavyeGizlendi.remove();
    };
  }, []);

  const butceDegisti = (metin: string) => {
    const safRakam = metin.replace(/[^0-9]/g, "");

    if (safRakam === "") {
      setSeciliButce("");
      return;
    }

    const formatli = safRakam.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setSeciliButce(formatli);
  };

  const hizliSecimYap = (deger: number) => {
    const formatli = deger.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setSeciliButce(formatli);
  };

  // LOG KONTROLLÜ YENİ KAYIT FONKSİYONU
  const devamEt = async () => {
    console.log("1. Butona basıldı, işlem başlıyor...");
    try {
      console.log("2. Firebase Anonim Giriş deneniyor...");
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      console.log("3. Giriş başarılı! Firebase Kimliği (UID):", user.uid);

      setUid(user.uid);
      setButce(seciliButce);

      console.log("4. Veritabanına (Firestore) yazma isteği gönderiliyor...");
      await setDoc(doc(db, "Kullanicilar", user.uid), {
        id: user.uid,
        isim: isim,
        aylik_butce: seciliButce,
        kalan_butce: seciliButce,
        kayit_tarihi: new Date().toISOString(),
      });
      console.log("5. MÜKEMMEL! Veri başarıyla kasaya yazıldı.");

      router.push("/(tabs)");
    } catch (error: any) {
      console.error("KAYIT HATASI:", error.message);
      alert("Hata oluştu: " + error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.zemin}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollKapsayici}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.ustBar}>
          <View style={styles.ilerlemeKapsayici}>
            <View style={styles.ilerlemeNoktasiPasif} />
            <View style={styles.ilerlemeCizgisiAktif} />
          </View>
          <Text style={styles.adimMetni}>Adım 2/2</Text>
        </View>

        <View style={styles.baslikKapsayici}>
          <View style={styles.ikonKapsayici}>
            <Ionicons name="sparkles" size={28} color="#1DB954" />
          </View>
          <Text style={styles.anaBaslik}>Aylık Bütçeni</Text>
          <Text style={styles.anaBaslik}>Belirle</Text>
          <Text style={styles.altBaslik}>
            Harcamalarını kontrol altında tutmak için bir hedef belirle.
          </Text>
        </View>

        <View style={styles.ortaAlan}>
          <View style={styles.hizliSecimKapsayici}>
            {[3000, 5000, 10000].map((deger) => {
              const formatliDeger = deger
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
              const aktifMi = seciliButce === formatliDeger;

              return (
                <TouchableOpacity
                  key={deger}
                  style={[
                    styles.hizliSecimButon,
                    aktifMi && styles.hizliSecimButonAktif,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => hizliSecimYap(deger)}
                >
                  <Text
                    style={[
                      styles.hizliSecimMetin,
                      aktifMi && styles.hizliSecimMetinAktif,
                    ]}
                  >
                    {formatliDeger} TL
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.devGostergeKarti}>
            <Text style={styles.devGostergeEtiket}>AYLIK BÜTÇE</Text>
            <View style={styles.devRakamKapsayici}>
              <TextInput
                style={styles.devRakamInput}
                value={seciliButce}
                onChangeText={butceDegisti}
                keyboardType="numeric"
                maxLength={10}
                cursorColor="#1DB954"
                selectionColor="transparent"
              />
              <Text style={styles.devParaBirimi}>TL</Text>
            </View>
            <View style={styles.ayracCizgi} />
            <View style={styles.bilgiSatiri}>
              <View style={styles.kucukYesilNokta} />
              <Text style={styles.bilgiMetni}>
                İstediğin zaman değiştirebilirsin
              </Text>
            </View>
          </View>
        </View>

        {/* Klavye açıldığında rahatça kayması için en altta görünmez bir boşluk */}
        {klavyeAcik && <View style={{ height: 60 }} />}
      </ScrollView>

      <View
        style={[styles.altButonKapsayici, klavyeAcik && { paddingBottom: 16 }]}
      >
        <TouchableOpacity activeOpacity={0.8} onPress={devamEt}>
          <LinearGradient
            colors={["#1DB954", "#15A043"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.anaButon}
          >
            <Text style={styles.anaButonMetni}>Uygulamaya Başla</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  zemin: { flex: 1, backgroundColor: "#121212" },
  scrollKapsayici: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },

  ustBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  ilerlemeKapsayici: { flexDirection: "row", gap: 8, alignItems: "center" },
  ilerlemeNoktasiPasif: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
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
  adimMetni: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 13,
    fontWeight: "500",
  },

  baslikKapsayici: { marginBottom: 30 },
  ikonKapsayici: {
    width: 40,
    height: 40,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  anaBaslik: {
    color: "white",
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 35.2,
  },
  altBaslik: {
    color: "rgba(255, 255, 255, 0.50)",
    fontSize: 15,
    fontWeight: "400",
    lineHeight: 24,
    marginTop: 12,
    paddingRight: 20,
  },

  ortaAlan: { flex: 1, justifyContent: "flex-start" },
  hizliSecimKapsayici: { flexDirection: "row", gap: 12, marginBottom: 24 },
  hizliSecimButon: {
    flex: 1,
    height: 42,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  hizliSecimButonAktif: {
    backgroundColor: "rgba(29, 185, 84, 0.15)",
    borderColor: "rgba(29, 185, 84, 0.30)",
  },
  hizliSecimMetin: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 13,
    fontWeight: "600",
  },
  hizliSecimMetinAktif: { color: "#1DB954" },

  devGostergeKarti: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 26,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 34,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "white",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 0,
      },
      android: { elevation: 1 },
    }),
  },
  devGostergeEtiket: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.5,
    marginBottom: 16,
  },

  devRakamKapsayici: { flexDirection: "row", alignItems: "center", gap: 10 },
  devRakamInput: {
    color: "white",
    fontSize: 56,
    fontWeight: "800",
    minWidth: 60,
    textAlign: "center",
    padding: 0,
    margin: 0,
    includeFontPadding: false,
  },
  devParaBirimi: {
    color: "#1DB954",
    fontSize: 32,
    fontWeight: "700",
    marginTop: 15,
  },

  ayracCizgi: {
    width: 200,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    marginVertical: 24,
  },
  bilgiSatiri: { flexDirection: "row", alignItems: "center", gap: 8 },
  kucukYesilNokta: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(29, 185, 84, 0.40)",
  },
  bilgiMetni: {
    color: "rgba(255, 255, 255, 0.35)",
    fontSize: 13,
    fontWeight: "500",
  },

  altButonKapsayici: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: "#121212",
  },
  anaButon: {
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1DB954",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 8,
  },
  anaButonMetni: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
