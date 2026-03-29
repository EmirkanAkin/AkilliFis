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

// Zustand içeri aktarıldı
import { useStore } from "../store/useStore";

export default function IsimDuzenleModal() {
  const router = useRouter();

  // Zustand'dan kayıt fonksiyonu ve mevcut isim çekildi
  const mevcutIsim = useStore((state) => state.isim);
  const setGlobalIsim = useStore((state) => state.setIsim);

  // Input'un varsayılan değerine mevcut isim atandı
  const [isim, setIsim] = useState(mevcutIsim !== "Misafir" ? mevcutIsim : "");

  const onayla = () => {
    // Yeni isim Zustand'a kaydediliyor ve modal kapatılıyor
    setGlobalIsim(isim);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.modalZemin}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          router.back();
        }}
      >
        <View style={styles.seffafAlan} />
      </TouchableWithoutFeedback>

      <View style={styles.kartIcerik}>
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
          disabled={isim.trim() === ""}
        >
          <Text
            style={[
              styles.onaylaButonMetin,
              isim.trim() === "" && styles.onaylaButonMetinPasif,
            ]}
          >
            Onayla
          </Text>
        </TouchableOpacity>

        <View style={{ height: Platform.OS === "ios" ? 30 : 20 }} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  modalZemin: { flex: 1, justifyContent: "flex-end" },
  seffafAlan: { flex: 1 },
  kartIcerik: {
    backgroundColor: "#18181B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 25,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    elevation: 20,
  },
  tutmaCizgisiKapsayici: {
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 10,
  },
  tutmaCizgisi: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 2,
  },
  baslik: { color: "white", fontSize: 20, fontWeight: "700", marginBottom: 20 },
  formGrubu: { gap: 10, marginBottom: 24 },
  etiket: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  inputZemin: {
    backgroundColor: "#0A0A0A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    height: 61,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    padding: 0,
  },
  onaylaButon: {
    backgroundColor: "#1DB954",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1DB954",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  onaylaButonPasif: {
    backgroundColor: "rgba(29, 185, 84, 0.25)",
    shadowOpacity: 0,
    elevation: 0,
  },
  onaylaButonMetin: { color: "white", fontSize: 16, fontWeight: "700" },
  onaylaButonMetinPasif: { color: "rgba(255, 255, 255, 0.5)" },
});
