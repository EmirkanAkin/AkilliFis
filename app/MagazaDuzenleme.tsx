import { Ionicons } from "@expo/vector-icons";
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
import { useStore } from "../store/useStore"; // Havuzu bağladık

export default function MagazaDuzenleModal() {
  const router = useRouter();
  const { tempFis, setTempFis } = useStore();

  const [magaza, setMagaza] = useState(tempFis.magazaAdi);

  const onayla = () => {
    setTempFis({ magazaAdi: magaza }); // Havuzu güncelledik
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
        <Text style={styles.baslik}>Mağaza Düzenle</Text>
        <View style={styles.formGrubu}>
          <Text style={styles.etiket}>Mağaza Adı</Text>
          <View style={styles.inputZemin}>
            <Ionicons
              name="storefront-outline"
              size={18}
              color="#1DB954"
              style={{ marginRight: 10 }}
            />
            <TextInput
              style={styles.input}
              placeholder="Mağaza adını girin"
              placeholderTextColor="rgba(255, 255, 255, 0.50)"
              value={magaza}
              onChangeText={setMagaza}
              autoFocus={true}
              cursorColor="#1DB954"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.onaylaButon,
            magaza.trim() === "" && styles.onaylaButonPasif,
          ]}
          onPress={onayla}
          disabled={magaza.trim() === ""}
        >
          <Text style={styles.onaylaButonMetin}>Güncelle</Text>
        </TouchableOpacity>
        <View style={{ height: 30 }} />
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
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 2,
  },
  baslik: { color: "white", fontSize: 22, fontWeight: "800", marginBottom: 20 },
  formGrubu: { gap: 10, marginBottom: 24 },
  etiket: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: 13,
    fontWeight: "600",
  },
  inputZemin: {
    backgroundColor: "#0A0A0A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    height: 61,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  input: { flex: 1, color: "white", fontSize: 16, fontWeight: "600" },
  onaylaButon: {
    backgroundColor: "#1DB954",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  onaylaButonPasif: { backgroundColor: "rgba(255, 255, 255, 0.1)" },
  onaylaButonMetin: { color: "white", fontSize: 16, fontWeight: "700" },
  onaylaButonMetinPasif: { color: "rgba(255, 255, 255, 0.2)" },
});
