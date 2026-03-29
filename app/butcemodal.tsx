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
  View
} from "react-native";

import { useStore } from "../store/useStore";

export default function ButceBelirleModal() {
  const router = useRouter();

  const mevcutButce = useStore((state) => state.butce);
  const setGlobalButce = useStore((state) => state.setButce);

  const [butce, setButce] = useState(mevcutButce !== "0" ? mevcutButce : "");

  const butceDegisti = (metin: string) => {
    const safRakam = metin.replace(/[^0-9]/g, "");
    if (safRakam === "") {
      setButce("");
      return;
    }
    const formatli = safRakam.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setButce(formatli);
  };

  const onayla = () => {
    setGlobalButce(butce);
    router.back();
  };

  return (
    // behavior ayarını ve offset'i modal yapısına göre güncelledik
    <KeyboardAvoidingView
      style={styles.modalZemin}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Şeffaf alana tıklandığında hem klavye kapansın hem modal gitsin */}
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          router.back();
        }}
      >
        <View style={styles.seffafAlan} />
      </TouchableWithoutFeedback>

      {/* Kart içeriği */}
      <View style={styles.kartIcerik}>
        <View style={styles.tutmaCizgisiKapsayici}>
          <View style={styles.tutmaCizgisi} />
        </View>

        <Text style={styles.baslik}>Bütçe Belirle</Text>

        <View style={styles.formGrubu}>
          <Text style={styles.etiket}>Aylık Bütçe</Text>
          <View style={styles.inputZemin}>
            <TextInput
              style={styles.input}
              placeholder="Örn: 18.000"
              placeholderTextColor="rgba(255, 255, 255, 0.50)"
              keyboardType="numeric" // decimal-pad bazen bazı cihazlarda sapıtabilir, numeric en güvenlisi
              value={butce}
              onChangeText={butceDegisti}
              autoFocus={true}
              maxLength={10}
              cursorColor="#1DB954"
            />
            <Text style={styles.paraBirimi}>TL</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.onaylaButon,
            butce.trim() === "" && styles.onaylaButonPasif,
          ]}
          activeOpacity={0.8}
          onPress={onayla}
          disabled={butce.trim() === ""}
        >
          <Text
            style={[
              styles.onaylaButonMetin,
              butce.trim() === "" && styles.onaylaButonMetinPasif,
            ]}
          >
            Onayla
          </Text>
        </TouchableOpacity>

        {/* Alt boşluk: Klavye açıkken iOS'ta ekstra güvenli alan sağlar */}
        <View style={{ height: Platform.OS === "ios" ? 40 : 20 }} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  modalZemin: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)", // Arka planı hafif karartmak tasarımı daha kaliteli gösterir
  },
  seffafAlan: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  kartIcerik: {
    backgroundColor: "#18181B",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 25,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
    width: "100%",
    // Android'de kartın klavye üstünde kalması için gereken gölge/elevation
    elevation: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
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
  formGrubu: { gap: 12, marginBottom: 30 },
  etiket: {
    color: "rgba(255, 255, 255, 0.50)",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  inputZemin: {
    backgroundColor: "#0A0A0A",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
    height: 64,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },
  paraBirimi: {
    color: "#1DB954",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },
  onaylaButon: {
    backgroundColor: "#1DB954",
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    // Butonun klavye üzerinde parlaması için
    shadowColor: "#1DB954",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  onaylaButonPasif: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    shadowOpacity: 0,
  },
  onaylaButonMetin: { color: "white", fontSize: 16, fontWeight: "700" },
  onaylaButonMetinPasif: { color: "rgba(255, 255, 255, 0.2)" },
});
