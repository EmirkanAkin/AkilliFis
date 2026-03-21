import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function IsimDuzenleModal() {
  const router = useRouter();
  const [isim, setIsim] = useState("");

  const [klavyeBoslugu] = useState(new Animated.Value(0));

  useEffect(() => {
    // Klavye açıldığında boyunu ölç ve kartı o kadar yukarı it
    const klavyeAcildi = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        Animated.timing(klavyeBoslugu, {
          toValue: e.endCoordinates.height,
          duration: 250,
          useNativeDriver: false,
        }).start();
      },
    );

    // Klavye kapandığında boşluğu sıfırla (Tam dibe oturur!)
    const klavyeKapandi = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        Animated.timing(klavyeBoslugu, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }).start();
      },
    );

    return () => {
      klavyeAcildi.remove();
      klavyeKapandi.remove();
    };
  }, []);

  const onayla = () => {
    console.log("Yeni İsim:", isim);
    router.back();
  };

  return (
    <Animated.View
      style={[styles.modalZemin, { paddingBottom: klavyeBoslugu }]}
    >
      {/* 1. Üstteki Şeffaf Alan (Tıklayınca Kapanır) */}
      <TouchableWithoutFeedback onPress={() => router.back()}>
        <View style={styles.seffafAlan} />
      </TouchableWithoutFeedback>

      {/* 2. Asıl Modal İçeriği (Alttan Açılan Kart) */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.kartIcerik}>
          {/* Tutma Çizgisi (Grabber) */}
          <View style={styles.tutmaCizgisiKapsayici}>
            <View style={styles.tutmaCizgisi} />
          </View>

          {/* Başlık */}
          <Text style={styles.baslik}>İsim Düzenle</Text>

          {/* Form Alanı */}
          <View style={styles.formGrubu}>
            <Text style={styles.etiket}>İsim</Text>
            <View style={styles.inputZemin}>
              <TextInput
                style={styles.input}
                placeholder="Emirkan"
                placeholderTextColor="rgba(255, 255, 255, 0.50)"
                value={isim}
                onChangeText={setIsim}
                autoFocus={true} // Açılır açılmaz klavye gelsin
                autoCapitalize="words" // Kelimelerin ilk harfi büyük başlasın
              />
            </View>
          </View>

          {/* Onayla Butonu */}
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

          {/* En altta güvenli boşluk (iPhone çentiği vb. için) */}
          <View style={{ height: 30 }} />
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  modalZemin: {
    flex: 1,
    justifyContent: "flex-end",
  },
  seffafAlan: {
    flex: 1,
  },
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
  baslik: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },
  formGrubu: {
    gap: 10,
    marginBottom: 24,
  },
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
    fontSize: 16, // Figma'da 16px verilmiş
    fontWeight: "500",
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
  onaylaButonMetin: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  onaylaButonMetinPasif: {
    color: "rgba(255, 255, 255, 0.5)",
  },
});
