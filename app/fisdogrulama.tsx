import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

// VARSAYILAN KATEGORİ LİSTEMİZ
const VARSAYILAN_KATEGORILER = [
  "Gıda",
  "Temizlik",
  "Kafe",
  "Eğlence",
  "Giyim",
  "Diğer",
];

export default function FisDogrulamaScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams();
  const { uid, tempFis, setTempFis } = useStore();
  const [tarihModalAcik, setTarihModalAcik] = useState(false);

  // MANUEL DÜZENLEME STATE'LERİ
  const [urunModalAcik, setUrunModalAcik] = useState(false);
  const [secilenUrunIndex, setSecilenUrunIndex] = useState<number | null>(null);
  const [geciciAd, setGeciciAd] = useState("");
  const [geciciFiyat, setGeciciFiyat] = useState("");
  const [geciciKategori, setGeciciKategori] = useState("Diğer");

  // ÖZEL KATEGORİ EKLEME STATE'LERİ VE REF
  const [ozelKategoriler, setOzelKategoriler] = useState<string[]>([]);
  const [kategoriEklemeModu, setKategoriEklemeModu] = useState(false);
  const [yeniKategoriAd, setYeniKategoriAd] = useState("");
  const kategoriScrollRef = useRef<ScrollView>(null);

  const anlikToplam = tempFis.urunler.reduce(
    (acc, item) => acc + (Number(item.fiyat) || 0),
    0,
  );

  const tumKategoriler = [...VARSAYILAN_KATEGORILER, ...ozelKategoriler];

  const takvimdenSec = (day: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const d = new Date(day.timestamp);
    const formatliTarih = `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")}.${d.getFullYear()}`;
    setTempFis({ tarih: formatliTarih });
    setTarihModalAcik(false);
  };

  // ÜRÜN DÜZENLEME FONKSİYONLARI
  const urunDuzenle = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSecilenUrunIndex(index);
    setGeciciAd(tempFis.urunler[index].ad);
    setGeciciFiyat(tempFis.urunler[index].fiyat.toString());

    const urunKategorisi = tempFis.urunler[index].kategori || "Diğer";
    if (
      !tumKategoriler.includes(urunKategorisi) &&
      urunKategorisi !== "Diğer"
    ) {
      setOzelKategoriler((prev) => [...prev, urunKategorisi]);
    }

    setGeciciKategori(urunKategorisi);
    setKategoriEklemeModu(false);
    setUrunModalAcik(true);
  };

  const yeniUrunEkle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSecilenUrunIndex(null);
    setGeciciAd("");
    setGeciciFiyat("");
    setGeciciKategori("Diğer");
    setKategoriEklemeModu(false);
    setUrunModalAcik(true);
  };

  const urunKaydet = () => {
    if (!geciciAd.trim() || !geciciFiyat.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Eksik Bilgi", "Lütfen ürün adı ve fiyatını girin.");
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const yeniUrunler = [...tempFis.urunler];
    const fiyatFloat = parseFloat(geciciFiyat.replace(",", "."));

    if (secilenUrunIndex !== null) {
      yeniUrunler[secilenUrunIndex] = {
        ...yeniUrunler[secilenUrunIndex],
        ad: geciciAd,
        fiyat: fiyatFloat,
        kategori: geciciKategori,
      };
    } else {
      yeniUrunler.push({
        ad: geciciAd,
        fiyat: fiyatFloat,
        kategori: geciciKategori,
      });
    }

    setTempFis({ urunler: yeniUrunler });
    setUrunModalAcik(false);
  };

  const urunSil = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (secilenUrunIndex !== null) {
      const yeniUrunler = tempFis.urunler.filter(
        (_, i) => i !== secilenUrunIndex,
      );
      setTempFis({ urunler: yeniUrunler });
    }
    setUrunModalAcik(false);
  };

  // KATEGORİ EKLEME FONKSİYONU
  const ozelKategoriKaydet = () => {
    if (yeniKategoriAd.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const yeniKat = yeniKategoriAd.trim();
      if (!tumKategoriler.includes(yeniKat)) {
        setOzelKategoriler([...ozelKategoriler, yeniKat]);
      }
      setGeciciKategori(yeniKat);
    }
    setKategoriEklemeModu(false);
    setYeniKategoriAd("");
  };

  const harcamayiKaydet = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const aktifUid = uid || auth.currentUser?.uid;
    if (!aktifUid) return router.push("/(tabs)");

    try {
      const fisRef = await addDoc(collection(db, "Fisler"), {
        kullanici_id: aktifUid,
        magaza_adi: tempFis.magazaAdi,
        tarih: tempFis.tarih,
        kategori: tempFis.kategori || "Diğer", // DÜZELTİLDİ
        toplam_tutar: anlikToplam,
        olusturulma_tarihi: serverTimestamp(),
      });
      for (const urun of tempFis.urunler) {
        await addDoc(collection(db, "Urunler"), {
          fis_id: fisRef.id,
          urun_adi: urun.ad,
          fiyat: urun.fiyat,
          kategori: urun.kategori || "Diğer",
          kullanici_id: aktifUid,
        });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTempFis({
        magazaAdi: "",
        urunler: [],
        toplamTutar: 0,
        kategori: "", // DÜZELTİLDİ
      });
      router.push("/(tabs)");
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      router.push("/(tabs)");
    }
  };

  return (
    <View style={styles.anaEkran}>
      <View style={styles.ustBar}>
        <TouchableOpacity
          style={styles.geriButon}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
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
              <Text style={styles.kartAciklama}>
                {tempFis.kategori || "Diğer"} {/* DÜZELTİLDİ */}
              </Text>
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
                    {tempFis.magazaAdi || "Bilinmiyor"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    router.push("/MagazaDuzenleme");
                  }}
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
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setTarihModalAcik(true);
                  }}
                >
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
                  <TouchableOpacity
                    key={index}
                    style={styles.urunSatir}
                    activeOpacity={0.7}
                    onPress={() => urunDuzenle(index)}
                  >
                    <View style={styles.urunSol}>
                      <Text style={styles.urunAd} numberOfLines={1}>
                        {item.ad}
                      </Text>
                      <Text style={styles.urunKategoriMetin}>
                        {item.kategori || "Diğer"}
                      </Text>
                    </View>
                    <View style={styles.urunSag}>
                      <Text style={styles.urunFiyat}>
                        {item.fiyat.toFixed(2)} TL
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={14}
                        color="rgba(255,255,255,0.3)"
                        style={{ marginLeft: 4 }}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.yeniUrunButon}
                onPress={yeniUrunEkle}
              >
                <Ionicons name="add-circle-outline" size={18} color="#1DB954" />
                <Text style={styles.yeniUrunMetin}>Yeni Ürün Ekle</Text>
              </TouchableOpacity>
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

      {/* TAKVİM MODALI */}
      <Modal visible={tarihModalAcik} transparent={true} animationType="fade">
        <View style={styles.takvimZemin}>
          <View style={styles.takvimKutu}>
            <View style={styles.takvimUst}>
              <Text style={styles.takvimBaslik}>Tarih Düzenle</Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setTarihModalAcik(false);
                }}
              >
                <Ionicons
                  name="close-circle"
                  size={28}
                  color="rgba(255,255,255,0.4)"
                />
              </TouchableOpacity>
            </View>
            <Calendar
              onDayPress={takvimdenSec}
              markedDates={{
                [tempFis.tarih.split(".").reverse().join("-")]: {
                  selected: true,
                },
              }}
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

      {/* ÜRÜN DÜZENLEME / EKLEME MODALI (KATEGORİLİ VE YENİ KATEGORİ EKLEMELİ) */}
      <Modal visible={urunModalAcik} transparent={true} animationType="slide">
        <View style={styles.modalZemin}>
          <View style={styles.modalKutu}>
            <View style={styles.takvimUst}>
              <Text style={styles.takvimBaslik}>
                {secilenUrunIndex !== null ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setUrunModalAcik(false);
                  setKategoriEklemeModu(false);
                }}
              >
                <Ionicons
                  name="close-circle"
                  size={28}
                  color="rgba(255,255,255,0.4)"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>ÜRÜN ADI</Text>
              <TextInput
                style={styles.textInput}
                value={geciciAd}
                onChangeText={setGeciciAd}
                placeholder="Örn: Süt 1L"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>FİYAT (TL)</Text>
              <TextInput
                style={styles.textInput}
                value={geciciFiyat}
                onChangeText={setGeciciFiyat}
                placeholder="Örn: 25.50"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="numeric"
              />
            </View>

            {/* KATEGORİ SEÇİCİ VE EKLEYİCİ */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>KATEGORİ</Text>
              <ScrollView
                ref={kategoriScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingRight: 20 }}
              >
                {tumKategoriler.map((kat) => (
                  <TouchableOpacity
                    key={kat}
                    style={[
                      styles.kategoriChip,
                      geciciKategori === kat && styles.kategoriChipAktif,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setGeciciKategori(kat);
                      setKategoriEklemeModu(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.kategoriChipMetin,
                        geciciKategori === kat && styles.kategoriChipMetinAktif,
                      ]}
                    >
                      {kat}
                    </Text>
                  </TouchableOpacity>
                ))}

                {/* YENİ KATEGORİ EKLEME BÖLÜMÜ */}
                {kategoriEklemeModu ? (
                  <View style={styles.yeniKategoriInputKutu}>
                    <TextInput
                      style={styles.yeniKategoriInput}
                      value={yeniKategoriAd}
                      onChangeText={setYeniKategoriAd}
                      placeholder="Adı..."
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      autoFocus
                      onSubmitEditing={ozelKategoriKaydet}
                    />
                    <TouchableOpacity
                      style={styles.yeniKategoriOnayButon}
                      onPress={ozelKategoriKaydet}
                    >
                      <Ionicons name="checkmark" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.kategoriEkleChip}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setKategoriEklemeModu(true);
                      setTimeout(() => {
                        kategoriScrollRef.current?.scrollToEnd({
                          animated: true,
                        });
                      }, 100);
                    }}
                  >
                    <Ionicons
                      name="add"
                      size={16}
                      color="rgba(255,255,255,0.6)"
                    />
                    <Text style={styles.kategoriEkleChipMetin}>Ekle</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>

            <View style={styles.modalButonlar}>
              {secilenUrunIndex !== null ? (
                <TouchableOpacity style={styles.silButon} onPress={urunSil}>
                  <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
                </TouchableOpacity>
              ) : (
                <View style={{ width: 50 }} />
              )}

              <TouchableOpacity
                style={styles.modalKaydetButon}
                onPress={urunKaydet}
              >
                <Text style={styles.modalKaydetMetin}>
                  Değişiklikleri Kaydet
                </Text>
              </TouchableOpacity>
            </View>
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
  urunListesi: { gap: 8, marginBottom: 12 },
  urunSatir: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.02)",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  urunSol: { flex: 1, paddingRight: 10, gap: 4 },
  urunSag: { flexDirection: "row", alignItems: "center" },
  urunAd: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    fontWeight: "500",
  },
  urunKategoriMetin: {
    color: "#1DB954",
    fontSize: 11,
    fontWeight: "600",
    opacity: 0.8,
  },
  urunFiyat: { color: "white", fontSize: 14, fontWeight: "700" },
  yeniUrunButon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    backgroundColor: "rgba(29, 185, 84, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.3)",
  },
  yeniUrunMetin: { color: "#1DB954", fontSize: 13, fontWeight: "600" },
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

  modalZemin: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalKutu: {
    backgroundColor: "#18181B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  inputContainer: { marginBottom: 16 },
  inputLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 14,
    color: "white",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalButonlar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    gap: 12,
  },
  silButon: {
    width: 50,
    height: 50,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
  },
  modalKaydetButon: {
    flex: 1,
    height: 50,
    backgroundColor: "#1DB954",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  modalKaydetMetin: { color: "white", fontSize: 15, fontWeight: "700" },

  kategoriChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  kategoriChipAktif: {
    backgroundColor: "rgba(29, 185, 84, 0.15)",
    borderColor: "#1DB954",
  },
  kategoriChipMetin: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontWeight: "600",
  },
  kategoriChipMetinAktif: { color: "#1DB954" },

  kategoriEkleChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderStyle: "dashed",
    gap: 4,
  },
  kategoriEkleChipMetin: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontWeight: "600",
  },
  yeniKategoriInputKutu: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    paddingLeft: 12,
    paddingRight: 4,
    borderWidth: 1,
    borderColor: "#1DB954",
  },
  yeniKategoriInput: {
    color: "white",
    fontSize: 13,
    minWidth: 80,
    paddingVertical: 8,
  },
  yeniKategoriOnayButon: {
    backgroundColor: "#1DB954",
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
});
