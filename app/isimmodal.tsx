import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "../store/useStore";

import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export default function IsimDuzenleModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // Radarı çalıştırdık
  const mevcutIsim = useStore((state) => state.isim);
  const setGlobalIsim = useStore((state) => state.setIsim);

  const [isim, setIsim] = useState(mevcutIsim !== "Misafir" ? mevcutIsim : "");
  const [kaydediliyor, setKaydediliyor] = useState(false);

  const onayla = async () => {
    if (!isim.trim()) return;

    setKaydediliyor(true);

    try {
      const uid = auth.currentUser?.uid;
      if (uid) {
        // Çelik Kasa: Firebase'e yaz
        await updateDoc(doc(db, "Kullanicilar", uid), { isim: isim.trim() });
      }

      // Hızlı Hafıza: Zustand'ı güncelle
      setGlobalIsim(isim.trim());
      router.back();
    } catch (error) {
      console.error("İsim güncellenirken hata:", error);
    } finally {
      setKaydediliyor(false);
    }
  };

  return (
    // 🛡️ KURŞUN GEÇİRMEZ KLAVYE MİMARİSİ
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.modalZemin}>
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            router.back();
          }}
        >
          <View style={styles.seffafAlan} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.kartIcerik,
            { paddingBottom: Math.max(insets.bottom, 20) + 10 },
          ]}
        >
          <View style={styles.tutmaCizgisiKapsayici}>
            <View style={styles.tutmaCizgisi} />
          </View>

          <Text style={styles.baslik}>İsim Düzenle</Text>

          <View style={styles.formGrubu}>
            <Text style={styles.etiket}>İsim</Text>
            <View style={styles.inputZemin}>
              <TextInput
                style={styles.input}
                placeholder="İsminizi girin"
                placeholderTextColor="rgba(255, 255, 255, 0.50)"
                value={isim}
                onChangeText={setIsim}
                autoFocus={true}
                autoCapitalize="words"
                cursorColor="#1DB954"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.onaylaButon,
              isim.trim() === "" && styles.onaylaButonPasif,
            ]}
            activeOpacity={0.8}
            onPress={onayla}
            disabled={isim.trim() === "" || kaydediliyor}
          >
            {kaydediliyor ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text
                style={[
                  styles.onaylaButonMetin,
                  isim.trim() === "" && styles.onaylaButonMetinPasif,
                ]}
              >
                Onayla
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  modalZemin: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  seffafAlan: { ...StyleSheet.absoluteFillObject },
  kartIcerik: {
    backgroundColor: "#18181B",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 25,
    paddingTop: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 25,
  },
  tutmaCizgisiKapsayici: {
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 10,
  },
  tutmaCizgisi: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 2,
  },
  baslik: { color: "white", fontSize: 22, fontWeight: "800", marginBottom: 24 },
  formGrubu: { gap: 10, marginBottom: 24 },
  etiket: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  inputZemin: {
    backgroundColor: "#0A0A0A",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
    height: 61,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    padding: 0,
  },
  onaylaButon: {
    backgroundColor: "#1DB954",
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1DB954",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  onaylaButonPasif: {
    backgroundColor: "rgba(29, 185, 84, 0.15)",
    shadowOpacity: 0,
    elevation: 0,
  },
  onaylaButonMetin: { color: "white", fontSize: 16, fontWeight: "700" },
  onaylaButonMetinPasif: { color: "rgba(255, 255, 255, 0.5)" },
});
