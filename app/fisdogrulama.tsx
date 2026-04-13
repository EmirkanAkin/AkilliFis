import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";

// FIREBASE VE STORE BAĞLANTILARI
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useStore } from "../store/useStore";

// BÜYÜK KATEGORİ BİRLİĞİ
const KATEGORI_AYARLARI: any = {
  Market: { renk: "#1DB954", ikon: "cart" },
  Kafe: { renk: "#00704A", ikon: "cafe" },
  Alışveriş: { renk: "#FF6000", ikon: "bag-handle" },
  Teknoloji: { renk: "#D62828", ikon: "laptop" },
  Abonelik: { renk: "#5D00D2", ikon: "card" },
  "Sebze/Meyve": { renk: "#1DB954", ikon: "leaf" },
  Temizlik: { renk: "#3B82F6", ikon: "water" },
  "Atıştırmalık/İçecek": { renk: "#F59E0B", ikon: "fast-food" },
  "Temel Gıda": { renk: "#4CAF50", ikon: "restaurant" },
  "Kafe/Restoran": { renk: "#EF4444", ikon: "cafe" },
  "Kozmetik/Kişisel": { renk: "#EC4899", ikon: "color-wand" },
  Giyim: { renk: "#E91E63", ikon: "shirt" },
  Sağlık: { renk: "#2196F3", ikon: "medkit" },
  Eğlence: { renk: "#FF9800", ikon: "game-controller" },
  Diğer: { renk: "#8B5CF6", ikon: "bag-handle" },
};

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

const getYerelMaxTarih = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function FisDogrulamaScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams();
  const { uid, tempFis, setTempFis } = useStore();

  const [yukleniyor, setYukleniyor] = useState(false);

  const [tarihModalAcik, setTarihModalAcik] = useState(false);

  // MANUEL DÜZENLEME STATE'LERİ
  const [urunModalAcik, setUrunModalAcik] = useState(false);
  const [secilenUrunIndex, setSecilenUrunIndex] = useState<number | null>(null);
  const [geciciAd, setGeciciAd] = useState("");
  const [geciciFiyat, setGeciciFiyat] = useState("");
  const [geciciKategori, setGeciciKategori] = useState("Diğer");

  // KATEGORİ MODALI İÇİN STATE'LER
  const [kategoriModalAcik, setKategoriModalAcik] = useState(false);
  const [aktifKategoriSecimi, setAktifKategoriSecimi] = useState<
    "fis" | "geciciUrun" | null
  >(null);

  // MAĞAZA ADI DÜZENLEME MODALI STATE'LERİ
  const [magazaModalAcik, setMagazaModalAcik] = useState(false);
  const [geciciMagazaAd, setGeciciMagazaAd] = useState("");
  const magazaInputRef = useRef<TextInput>(null);

  const anlikToplam = tempFis.urunler.reduce(
    (acc, item) => acc + (Number(item.fiyat) || 0),
    0,
  );

  const takvimdenSec = (day: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const d = new Date(day.timestamp);
    const formatliTarih = `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")}.${d.getFullYear()}`;
    setTempFis({ ...tempFis, tarih: formatliTarih });
    setTarihModalAcik(false);
  };

  const urunDuzenle = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSecilenUrunIndex(index);
    setGeciciAd(tempFis.urunler[index].ad);
    setGeciciFiyat(tempFis.urunler[index].fiyat.toString());
    setGeciciKategori(tempFis.urunler[index].kategori || "Diğer");
    setUrunModalAcik(true);
  };

  const yeniUrunEkle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSecilenUrunIndex(null);
    setGeciciAd("");
    setGeciciFiyat("");
    setGeciciKategori("Diğer");
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

    setTempFis({ ...tempFis, urunler: yeniUrunler });
    setUrunModalAcik(false);
  };

  const urunSil = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (secilenUrunIndex !== null) {
      const yeniUrunler = tempFis.urunler.filter(
        (_, i) => i !== secilenUrunIndex,
      );
      setTempFis({ ...tempFis, urunler: yeniUrunler });
    }
    setUrunModalAcik(false);
  };

  const kategoriSec = (secilenKat: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (aktifKategoriSecimi === "fis") {
      setTempFis({ ...tempFis, kategori: secilenKat });
    } else if (aktifKategoriSecimi === "geciciUrun") {
      setGeciciKategori(secilenKat);
    }
    setKategoriModalAcik(false);
  };

  const harcamayiKaydet = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setYukleniyor(true);
    const aktifUid = uid || auth.currentUser?.uid;

    if (!aktifUid) {
      setYukleniyor(false);
      return router.push("/(tabs)");
    }

    try {
      const fisRef = await addDoc(collection(db, "Fisler"), {
        kullanici_id: aktifUid,
        magaza_adi: tempFis.magazaAdi,
        tarih: tempFis.tarih,
        kategori: tempFis.kategori || "Diğer",
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
      setTempFis({ magazaAdi: "", urunler: [], toplamTutar: 0, kategori: "" });
      router.push("/(tabs)");
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      router.push("/(tabs)");
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <View style={styles.anaEkran}>
      <View style={styles.ustBar}>
        <TouchableOpacity
          style={[styles.geriButon, yukleniyor && { opacity: 0.4 }]}
          disabled={yukleniyor}
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
              Yapay zeka hatalarını düzeltmek için üzerine dokunun.
            </Text>
          </View>
        </View>

        <View style={styles.anaKart}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setAktifKategoriSecimi("fis");
              setKategoriModalAcik(true);
            }}
          >
            <LinearGradient
              colors={["rgba(29, 185, 84, 0.08)", "rgba(0, 0, 0, 0)"]}
              style={styles.kartHeader}
            >
              <View
                style={[
                  styles.kartIkonZemin,
                  {
                    backgroundColor: `${KATEGORI_AYARLARI[tempFis.kategori || "Diğer"]?.renk}20`,
                    borderColor: `${KATEGORI_AYARLARI[tempFis.kategori || "Diğer"]?.renk}40`,
                  },
                ]}
              >
                <Ionicons
                  name={KATEGORI_AYARLARI[tempFis.kategori || "Diğer"]?.ikon}
                  size={20}
                  color={KATEGORI_AYARLARI[tempFis.kategori || "Diğer"]?.renk}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.kartBaslik}>Fiş Özeti</Text>
                <Text
                  style={[
                    styles.kartAciklama,
                    {
                      color:
                        KATEGORI_AYARLARI[tempFis.kategori || "Diğer"]?.renk,
                    },
                  ]}
                >
                  {tempFis.kategori || "Diğer"}
                </Text>
              </View>
              <Ionicons
                name="create-outline"
                size={20}
                color="rgba(255,255,255,0.3)"
              />
            </LinearGradient>
          </TouchableOpacity>

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
                    setGeciciMagazaAd(tempFis.magazaAdi);
                    setMagazaModalAcik(true);
                    setTimeout(() => magazaInputRef.current?.focus(), 100);
                  }}
                >
                  <Ionicons name="create-outline" size={18} color="#1DB954" />
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
                      <Text
                        style={[
                          styles.urunKategoriMetin,
                          {
                            color:
                              KATEGORI_AYARLARI[item.kategori || "Diğer"]?.renk,
                          },
                        ]}
                      >
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
          style={[styles.kaydetButon, yukleniyor && styles.kaydetButonPasif]}
          activeOpacity={0.8}
          onPress={harcamayiKaydet}
          disabled={yukleniyor}
        >
          {yukleniyor ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.kaydetButonMetin}>
              Harcamayı Onayla ve Kaydet
            </Text>
          )}
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
              maxDate={getYerelMaxTarih()}
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

      {/* ÜRÜN DÜZENLEME / EKLEME MODALI */}
      <Modal visible={urunModalAcik} transparent={true} animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalZemin}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalKutu}>
            <View style={styles.takvimUst}>
              <Text style={styles.takvimBaslik}>
                {secilenUrunIndex !== null ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setUrunModalAcik(false);
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
                cursorColor="#1DB954"
                selectionColor="#1DB954"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>FİYAT (TL)</Text>
              <TextInput
                style={styles.textInput}
                value={geciciFiyat}
                onChangeText={(t) => setGeciciFiyat(t.replace(/[^0-9,.]/g, ""))}
                placeholder="Örn: 25.50"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="decimal-pad"
                cursorColor="#1DB954"
                selectionColor="#1DB954"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>KATEGORİ</Text>
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setAktifKategoriSecimi("geciciUrun");
                  setKategoriModalAcik(true);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  backgroundColor: `${KATEGORI_AYARLARI[geciciKategori]?.renk || "#8B5CF6"}26`,
                  padding: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: `${KATEGORI_AYARLARI[geciciKategori]?.renk || "#8B5CF6"}50`,
                }}
              >
                <Ionicons
                  name={KATEGORI_AYARLARI[geciciKategori]?.ikon || "bag-handle"}
                  size={20}
                  color={KATEGORI_AYARLARI[geciciKategori]?.renk || "#8B5CF6"}
                />
                <Text
                  style={{
                    color: KATEGORI_AYARLARI[geciciKategori]?.renk || "#8B5CF6",
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  {geciciKategori}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={KATEGORI_AYARLARI[geciciKategori]?.renk || "#8B5CF6"}
                  style={{ marginLeft: "auto" }}
                />
              </TouchableOpacity>
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
                  Değişiklikleri Uygula
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ORTAK KATEGORİ SEÇİM MODALI */}
      <Modal
        visible={kategoriModalAcik}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setKategoriModalAcik(false)}
      >
        <KeyboardAvoidingView
          style={styles.kategoriModalArkaPlan}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.kategoriModalKutu}>
            <View style={styles.takvimUst}>
              <Text style={styles.takvimBaslik}>
                {aktifKategoriSecimi === "fis"
                  ? "Genel Kategori Seç"
                  : "Ürün Kategorisi Seç"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setKategoriModalAcik(false);
                }}
              >
                <Ionicons
                  name="close-circle"
                  size={28}
                  color="rgba(255,255,255,0.4)"
                />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.kategoriListesi}
              showsVerticalScrollIndicator={false}
            >
              {Object.keys(KATEGORI_AYARLARI).map((kat, index) => {
                let aktifKat = "";
                if (aktifKategoriSecimi === "fis") aktifKat = tempFis.kategori;
                else if (aktifKategoriSecimi === "geciciUrun")
                  aktifKat = geciciKategori;

                const isAktif = aktifKat === kat;

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.kategoriSecenek,
                      isAktif && styles.kategoriSecenekAktif,
                    ]}
                    onPress={() => kategoriSec(kat)}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <Ionicons
                        name={KATEGORI_AYARLARI[kat].ikon}
                        size={20}
                        color={KATEGORI_AYARLARI[kat].renk}
                      />
                      <Text
                        style={[
                          styles.kategoriMetin,
                          isAktif && styles.kategoriMetinAktif,
                        ]}
                      >
                        {kat}
                      </Text>
                    </View>
                    {isAktif && (
                      <Ionicons name="checkmark" size={20} color="#1DB954" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MAĞAZA ADI DÜZENLEME MODALI */}
      <Modal
        visible={magazaModalAcik}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMagazaModalAcik(false)}
      >
        <KeyboardAvoidingView
          style={styles.magazaModalZemin}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              Keyboard.dismiss();
              setMagazaModalAcik(false);
            }}
          >
            <View style={styles.seffafAlan} />
          </TouchableWithoutFeedback>

          <View style={styles.magazaKartIcerik}>
            <View style={styles.tutuamacKapsayici}>
              <View style={styles.tutuamac} />
            </View>
            <Text style={styles.magazaBaslik}>Mağaza Düzenle</Text>
            <View style={styles.magazaFormGrubu}>
              <Text style={styles.magazaEtiket}>Mağaza Adı</Text>
              <View style={styles.magazaInputZemin}>
                <Ionicons
                  name="storefront-outline"
                  size={18}
                  color="#1DB954"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  ref={magazaInputRef}
                  style={styles.magazaInput}
                  placeholder="Mağaza adını girin"
                  placeholderTextColor="rgba(255, 255, 255, 0.50)"
                  value={geciciMagazaAd}
                  onChangeText={setGeciciMagazaAd}
                  cursorColor="#1DB954"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.magazaOnaylaButon,
                geciciMagazaAd.trim() === "" && styles.magazaOnaylaButonPasif,
              ]}
              onPress={() => {
                if (!geciciMagazaAd.trim()) return;
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setTempFis({ ...tempFis, magazaAdi: geciciMagazaAd.trim() });
                setMagazaModalAcik(false);
              }}
              disabled={geciciMagazaAd.trim() === ""}
            >
              <Text style={styles.magazaOnaylaButonMetin}>Güncelle</Text>
            </TouchableOpacity>
            <View style={{ height: 30 }} />
          </View>
        </KeyboardAvoidingView>
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
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  kartBaslik: { color: "white", fontSize: 18, fontWeight: "700" },
  kartAciklama: { fontSize: 12, fontWeight: "600" },
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
  urunKategoriMetin: { fontSize: 11, fontWeight: "600", opacity: 0.8 },
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
    shadowColor: "#1DB954",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  kaydetButonMetin: { color: "white", fontSize: 15, fontWeight: "700" },
  kaydetButonPasif: {
    backgroundColor: "rgba(29, 185, 84, 0.15)",
    elevation: 0,
    shadowOpacity: 0,
  },

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

  kategoriModalArkaPlan: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  kategoriModalKutu: {
    backgroundColor: "#18181B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "85%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  kategoriListesi: { marginBottom: 20 },
  kategoriSecenek: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  kategoriSecenekAktif: {
    backgroundColor: "rgba(29, 185, 84, 0.05)",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 0,
  },
  kategoriMetin: { color: "rgba(255,255,255,0.7)", fontSize: 16 },
  kategoriMetinAktif: { color: "#1DB954", fontWeight: "700" },

  magazaModalZemin: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  seffafAlan: { ...StyleSheet.absoluteFillObject },
  magazaKartIcerik: {
    backgroundColor: "#18181B",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 25,
    paddingTop: 10,
    elevation: 20,
  },
  tutuamacKapsayici: {
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 10,
  },
  tutuamac: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 2,
  },
  magazaBaslik: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 20,
  },
  magazaFormGrubu: { gap: 10, marginBottom: 24 },
  magazaEtiket: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: 13,
    fontWeight: "600",
  },
  magazaInputZemin: {
    backgroundColor: "#0A0A0A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    height: 61,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  magazaInput: { flex: 1, color: "white", fontSize: 16, fontWeight: "600" },
  magazaOnaylaButon: {
    backgroundColor: "#1DB954",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  magazaOnaylaButonPasif: { backgroundColor: "rgba(255, 255, 255, 0.1)" },
  magazaOnaylaButonMetin: { color: "white", fontSize: 16, fontWeight: "700" },
});
