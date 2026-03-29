import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";

// FIREBASE VE STORE BAĞLANTILARI
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useStore } from "../store/useStore";

LocaleConfig.locales["tr"] = {
  monthNames: [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ],
  monthNamesShort: [
    "Oca",
    "Şub",
    "Mar",
    "Nis",
    "May",
    "Haz",
    "Tem",
    "Ağu",
    "Eyl",
    "Eki",
    "Kas",
    "Ara",
  ],
  dayNames: [
    "Pazar",
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
  ],
  dayNamesShort: ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"],
  today: "Bugün",
};
LocaleConfig.defaultLocale = "tr";

export default function FisDogrulamaScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams();
  const { uid, tempFis, setTempFis } = useStore();
  const [tarihModalAcik, setTarihModalAcik] = useState(false);

  const anlikToplam = tempFis.urunler.reduce(
    (acc, item) => acc + (Number(item.fiyat) || 0),
    0,
  );

  useEffect(() => {
    if (imageUri && tempFis.magazaAdi === "") {
      setTempFis({
        magazaAdi: "A101 MARKET",
        tarih: "29.03.2024",
        toplamTutar: 94.0,
        urunler: [
          { ad: "Elma (1kg)", fiyat: 30.5, kategori: "Gıda" },
          { ad: "Çamaşır Suyu", fiyat: 45.0, kategori: "Temizlik" },
          { ad: "Süt 1L", fiyat: 18.5, kategori: "Gıda" },
        ],
      });
    }
  }, [imageUri]);

  const takvimdenSec = (day: any) => {
    const d = new Date(day.timestamp);
    const formatliTarih = `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")}.${d.getFullYear()}`;
    setTempFis({ tarih: formatliTarih });
    setTarihModalAcik(false);
  };

  const harcamayiKaydet = async () => {
    const aktifUid = uid || auth.currentUser?.uid;
    if (!aktifUid) return router.push("/(tabs)");

    try {
      const fisRef = await addDoc(collection(db, "Fisler"), {
        kullanici_id: aktifUid,
        magaza_adi: tempFis.magazaAdi,
        tarih: tempFis.tarih,
        toplam_tutar: anlikToplam,
        olusturulma_tarihi: serverTimestamp(),
      });
      for (const urun of tempFis.urunler) {
        await addDoc(collection(db, "Urunler"), {
          fis_id: fisRef.id,
          urun_adi: urun.ad,
          fiyat: urun.fiyat,
          kategori: urun.kategori || "Diğer", // KATEGORİ ARTIK FİREBASE'E GİDİYOR
          kullanici_id: aktifUid,
        });
      }
      setTempFis({ magazaAdi: "", urunler: [], toplamTutar: 0 });
      router.push("/(tabs)");
    } catch (e) {
      router.push("/(tabs)");
    }
  };

  return (
    <View style={styles.anaEkran}>
      <View style={styles.ustBar}>
        <TouchableOpacity
          style={styles.geriButon}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.sayfaBaslik}>Fiş Doğrulama</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollIcerik}
      >
        <View style={styles.basariKutusu}>
          <View style={styles.basariIkonZemin}>
            <Ionicons name="checkmark" size={16} color="#1DB954" />
          </View>
          <View style={styles.basariMetinKutu}>
            <Text style={styles.basariBaslik}>Fiş başarıyla tarandı!</Text>
            <Text style={styles.basariAciklama}>
              Bilgileri kontrol edip onaylayın
            </Text>
          </View>
        </View>

        <View style={styles.anaKart}>
          <LinearGradient
            colors={["rgba(29, 185, 84, 0.08)", "rgba(0, 0, 0, 0)"]}
            style={styles.kartHeader}
          >
            <View style={styles.kartIkonZemin}>
              <Ionicons name="receipt-outline" size={20} color="#1DB954" />
            </View>
            <View>
              <Text style={styles.kartBaslik}>Fiş Özeti</Text>
              <Text style={styles.kartAciklama}>Veriler havuzdan çekildi</Text>
            </View>
          </LinearGradient>

          <View style={styles.kartIcerik}>
            <View style={styles.bilgiKutusu}>
              <Text style={styles.bilgiEtiket}>MAĞAZA</Text>
              <View style={styles.bilgiSatir}>
                <View style={styles.bilgiIcerik}>
                  <Ionicons
                    name="storefront-outline"
                    size={16}
                    color="#1DB954"
                  />
                  <Text style={styles.bilgiMetin}>
                    {tempFis.magazaAdi || "Okunuyor..."}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push("/MagazaDuzenleme")}
                >
                  <Ionicons name="create-outline" size={16} color="#1DB954" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.bilgiKutusu}>
              <Text style={styles.bilgiEtiket}>TARİH</Text>
              <View style={styles.bilgiSatir}>
                <View style={styles.bilgiIcerik}>
                  <Ionicons name="calendar-outline" size={16} color="#1DB954" />
                  <Text style={styles.bilgiMetin}>
                    {tempFis.tarih || "Seçilmedi"}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setTarihModalAcik(true)}>
                  <Ionicons name="create-outline" size={18} color="#1DB954" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.urunlerKutusu}>
              <Text style={styles.bilgiEtiket}>
                ÜRÜNLER ({tempFis.urunler.length} kalem)
              </Text>
              <View style={styles.urunListesi}>
                {tempFis.urunler.map((item, index) => (
                  <View key={index} style={styles.urunSatir}>
                    <Text style={styles.urunAd}>{item.ad}</Text>
                    <Text style={styles.urunFiyat}>
                      {item.fiyat.toFixed(2)} TL
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <LinearGradient
              colors={["rgba(29, 185, 84, 0.12)", "rgba(29, 185, 84, 0.06)"]}
              style={styles.toplamKutusu}
            >
              <Text style={styles.toplamEtiket}>TOPLAM</Text>
              <Text style={styles.toplamTutar}>
                {anlikToplam.toFixed(2)} TL
              </Text>
            </LinearGradient>
          </View>
        </View>

        <TouchableOpacity
          style={styles.kaydetButon}
          activeOpacity={0.8}
          onPress={harcamayiKaydet}
        >
          <Text style={styles.kaydetButonMetin}>Harcamayı Kaydet</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={tarihModalAcik} transparent={true} animationType="fade">
        <View style={styles.takvimZemin}>
          <View style={styles.takvimKutu}>
            <View style={styles.takvimUst}>
              <Text style={styles.takvimBaslik}>Tarih Düzenle</Text>
              <TouchableOpacity onPress={() => setTarihModalAcik(false)}>
                <Ionicons
                  name="close-circle"
                  size={28}
                  color="rgba(255,255,255,0.4)"
                />
              </TouchableOpacity>
            </View>
            <Calendar
              onDayPress={takvimdenSec}
              markedDates={{ [tempFis.tarih]: { selected: true } }}
              maxDate={new Date().toISOString().split("T")[0]}
              theme={{
                calendarBackground: "#18181B",
                textSectionTitleColor: "#1DB954",
                selectedDayBackgroundColor: "#1DB954",
                selectedDayTextColor: "#ffffff",
                todayTextColor: "#1DB954",
                dayTextColor: "#ffffff",
                arrowColor: "#1DB954",
                monthTextColor: "white",
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
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
  },
  geriButon: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  sayfaBaslik: { color: "white", fontSize: 18, fontWeight: "700" },
  scrollIcerik: { paddingHorizontal: 20, paddingBottom: 40 },
  basariKutusu: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(29, 185, 84, 0.10)",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.25)",
    marginBottom: 20,
  },
  basariIkonZemin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#1DB954",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  basariMetinKutu: { flex: 1 },
  basariBaslik: { color: "white", fontSize: 13, fontWeight: "600" },
  basariAciklama: { color: "rgba(255, 255, 255, 0.45)", fontSize: 11 },
  anaKart: {
    backgroundColor: "rgba(39, 39, 42, 0.80)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
    marginBottom: 24,
  },
  kartHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  kartIkonZemin: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(29, 185, 84, 0.15)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.30)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  kartBaslik: { color: "white", fontSize: 18, fontWeight: "700" },
  kartAciklama: { color: "rgba(255, 255, 255, 0.40)", fontSize: 12 },
  kartIcerik: { padding: 20, gap: 12 },
  bilgiKutusu: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  bilgiEtiket: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 6,
  },
  bilgiSatir: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bilgiIcerik: { flexDirection: "row", alignItems: "center", gap: 8 },
  bilgiMetin: { color: "white", fontSize: 14, fontWeight: "600" },
  urunlerKutusu: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  urunListesi: { gap: 6, marginBottom: 8 },
  urunSatir: { flexDirection: "row", justifyContent: "space-between" },
  urunAd: { color: "rgba(255, 255, 255, 0.55)", fontSize: 12 },
  urunFiyat: { color: "rgba(255, 255, 255, 0.55)", fontSize: 12 },
  toplamKutusu: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.25)",
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  toplamEtiket: {
    color: "rgba(255, 255, 255, 0.70)",
    fontSize: 14,
    fontWeight: "600",
  },
  toplamTutar: { color: "white", fontSize: 22, fontWeight: "800" },
  kaydetButon: {
    backgroundColor: "#1DB954",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  kaydetButonMetin: { color: "white", fontSize: 15, fontWeight: "700" },
  takvimZemin: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  takvimKutu: {
    backgroundColor: "#18181B",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  takvimUst: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  takvimBaslik: { color: "white", fontSize: 18, fontWeight: "800" },
});
