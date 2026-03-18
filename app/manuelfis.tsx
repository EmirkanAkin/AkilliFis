import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

export default function ManuelEkleScreen() {
  const router = useRouter();

  const [magaza, setMagaza] = useState("");
  const [miktar, setMiktar] = useState("");
  const [tarih, setTarih] = useState(""); // Varsayılanı boş yaptık
  const [kategori, setKategori] = useState("");

  const formDolu =
    magaza.trim() !== "" &&
    miktar.trim() !== "" &&
    tarih.trim() !== "" &&
    kategori.trim() !== "";

  const kaydet = () => {
    // Sadece form doluysa çalışır
    if (formDolu) {
      router.push("/(tabs)");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.anaEkran}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.anaEkran}>
          <View style={styles.ustBar}>
            <TouchableOpacity
              style={styles.ikonButon}
              onPress={() => router.back()}
            >
              <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
            </TouchableOpacity>

            <Text style={styles.sayfaBaslik}>Harcama Ekle</Text>

            <TouchableOpacity
              style={styles.ikonButon}
              onPress={() => router.back()}
            >
              <Ionicons
                name="close"
                size={24}
                color="rgba(255, 255, 255, 0.45)"
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.formKaydirmaAlani}
            contentContainerStyle={styles.formKapsayici}
            showsVerticalScrollIndicator={false}
          >
            {/* Mağaza Adı */}
            <View style={styles.girdiGrubu}>
              <View style={styles.etiketSatir}>
                <Ionicons
                  name="storefront-outline"
                  size={14}
                  color="rgba(255, 255, 255, 0.45)"
                />
                <Text style={styles.etiketMetin}>Mağaza Adı</Text>
              </View>
              <View style={styles.standartInputZemin}>
                <TextInput
                  style={styles.standartInput}
                  placeholder="Örn: Migros"
                  placeholderTextColor="rgba(255, 255, 255, 0.50)"
                  value={magaza}
                  onChangeText={setMagaza}
                />
              </View>
            </View>

            {/* Harcama Miktarı */}
            <View style={styles.girdiGrubu}>
              <View style={styles.etiketSatir}>
                <Text style={styles.etiketMetin}>Harcama Miktarı</Text>
              </View>
              <View style={styles.neonInputZemin}>
                <TextInput
                  style={styles.neonInput}
                  placeholder="0,00"
                  placeholderTextColor="rgba(255, 255, 255, 0.50)"
                  keyboardType="numeric"
                  value={miktar}
                  onChangeText={setMiktar}
                />
                <Text style={styles.paraBirimi}>TL</Text>
              </View>
            </View>

            {/* Tarih */}
            <View style={styles.girdiGrubu}>
              <View style={styles.etiketSatir}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color="rgba(255, 255, 255, 0.45)"
                />
                <Text style={styles.etiketMetin}>Tarih</Text>
              </View>
              {/* Test için tıklayınca tarihi otomatik dolduruyoruz */}
              <TouchableOpacity
                style={styles.standartInputZemin}
                activeOpacity={0.7}
                onPress={() => setTarih("18.03.2026")}
              >
                <Text
                  style={[
                    styles.standartInput,
                    !tarih && { color: "rgba(255, 255, 255, 0.50)" },
                  ]}
                >
                  {tarih || "Tarih seçin"}
                </Text>
                <Ionicons
                  name="calendar"
                  size={16}
                  color="rgba(255, 255, 255, 0.45)"
                />
              </TouchableOpacity>
            </View>

            {/* Kategori */}
            <View style={styles.girdiGrubu}>
              <View style={styles.etiketSatir}>
                <Ionicons
                  name="pricetag-outline"
                  size={14}
                  color="rgba(255, 255, 255, 0.45)"
                />
                <Text style={styles.etiketMetin}>Kategori</Text>
              </View>
              {/* Test için tıklayınca kategoriyi otomatik dolduruyoruz */}
              <TouchableOpacity
                style={styles.standartInputZemin}
                activeOpacity={0.7}
                onPress={() => setKategori("Market")}
              >
                <Text
                  style={[
                    styles.standartInput,
                    !kategori && { color: "rgba(255, 255, 255, 0.50)" },
                  ]}
                >
                  {kategori || "Kategori seçin"}
                </Text>
                <Ionicons
                  name="pricetag"
                  size={16}
                  color="rgba(255, 255, 255, 0.45)"
                />
              </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>

          <View style={styles.altButonlarKapsayici}>
            <TouchableOpacity
              style={[styles.kaydetButon, !formDolu && styles.kaydetButonPasif]}
              activeOpacity={0.8}
              onPress={kaydet}
              disabled={!formDolu} // Form dolmadan basılmasını tamamen engeller
            >
              <Text
                style={[
                  styles.kaydetButonMetin,
                  !formDolu && styles.kaydetButonMetinPasif,
                ]}
              >
                Kaydet
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  anaEkran: { flex: 1, backgroundColor: "#0A0A0A" },
  ustBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  ikonButon: {
    width: 40,
    height: 40,
    backgroundColor: "#18181B",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  sayfaBaslik: { color: "white", fontSize: 18, fontWeight: "700" },
  formKaydirmaAlani: { flex: 1 },
  formKapsayici: { paddingHorizontal: 20, paddingTop: 24, gap: 24 },
  girdiGrubu: { gap: 10 },
  etiketSatir: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 4,
  },
  etiketMetin: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  standartInputZemin: {
    backgroundColor: "#18181B",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 18,
    height: 58,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  standartInput: { flex: 1, color: "white", fontSize: 16, fontWeight: "500" },
  neonInputZemin: {
    backgroundColor: "#18181B",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.15)",
    paddingHorizontal: 18,
    height: 70,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#1DB954",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  neonInput: { flex: 1, color: "white", fontSize: 24, fontWeight: "700" },
  paraBirimi: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
  altButonlarKapsayici: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    gap: 12,
  },

  // KAYDET BUTONU AKTİF HALİ
  kaydetButon: {
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
  kaydetButonMetin: { color: "white", fontSize: 16, fontWeight: "700" },

  // KAYDET BUTONU PASİF HALİ
  kaydetButonPasif: {
    backgroundColor: "rgba(29, 185, 84, 0.25)",
    shadowOpacity: 0,
    elevation: 0,
  },
  kaydetButonMetinPasif: { color: "rgba(255, 255, 255, 0.5)" },
});
