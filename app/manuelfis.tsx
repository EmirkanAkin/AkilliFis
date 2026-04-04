import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";

// FİREBASE BAĞLANTILARI
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

// KATEGORİ RENKLERİ VE İKONLARI
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

// 🔴 ÇÖZÜM: YEREL SAATE GÖRE BUGÜNÜN TARİHİNİ BULAN FONKSİYON
const getYerelMaxTarih = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function ManuelEkleScreen() {
  const router = useRouter();

  const magazaRef = useRef<TextInput>(null);
  const miktarRef = useRef<TextInput>(null);

  const [yukleniyor, setYukleniyor] = useState(false);

  const [magaza, setMagaza] = useState("");
  const [miktar, setMiktar] = useState("");
  const [odaklananKutu, setOdaklananKutu] = useState<
    "magaza" | "miktar" | null
  >(null);

  const [tarihGoster, setTarihGoster] = useState(false);
  const [seciliTarihISO, setSeciliTarihISO] = useState("");
  const [seciliTarihNoktali, setSeciliTarihNoktali] = useState("");
  const [ekrandaGozukenTarih, setEkrandaGozukenTarih] = useState("");

  const [kategori, setKategori] = useState("");
  const [kategoriModalAcik, setKategoriModalAcik] = useState(false);
  const [aktifKategoriSecimi, setAktifKategoriSecimi] = useState<
    "fis" | "yeniUrun" | number | null
  >(null);

  const [urunler, setUrunler] = useState<
    { isim: string; fiyat: string; kategori: string }[]
  >([]);
  const [yeniUrunIsim, setYeniUrunIsim] = useState("");
  const [yeniUrunFiyat, setYeniUrunFiyat] = useState("");
  const [yeniUrunKategori, setYeniUrunKategori] = useState("Diğer");

  const miktarDegisti = (metin: string) => {
    const safRakam = metin.replace(/[^0-9]/g, "");
    if (safRakam === "") {
      setMiktar("");
      return;
    }
    const formatli = safRakam.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setMiktar(formatli);
  };

  const takvimGunSecildi = (day: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSeciliTarihISO(day.dateString);
    const noktali = day.dateString.split("-").reverse().join(".");
    setSeciliTarihNoktali(noktali);

    const secilenTarihObj = new Date(day.timestamp);
    const aylar = [
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
    ];
    setEkrandaGozukenTarih(
      `${secilenTarihObj.getDate()} ${aylar[secilenTarihObj.getMonth()]} ${secilenTarihObj.getFullYear()}`,
    );
    setTarihGoster(false);
  };

  const kategoriSec = (secilenKat: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (aktifKategoriSecimi === "fis") {
      setKategori(secilenKat);
    } else if (aktifKategoriSecimi === "yeniUrun") {
      setYeniUrunKategori(secilenKat);
    } else if (typeof aktifKategoriSecimi === "number") {
      const guncelUrunler = [...urunler];
      guncelUrunler[aktifKategoriSecimi].kategori = secilenKat;
      setUrunler(guncelUrunler);
    }
    setKategoriModalAcik(false);
  };

  const urunEkle = () => {
    if (yeniUrunIsim.trim() && yeniUrunFiyat.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const yeniUrunler = [
        ...urunler,
        {
          isim: yeniUrunIsim.trim(),
          fiyat: yeniUrunFiyat,
          kategori: yeniUrunKategori,
        },
      ];
      setUrunler(yeniUrunler);
      setYeniUrunIsim("");
      setYeniUrunFiyat("");
      setYeniUrunKategori("Diğer");

      const toplam = yeniUrunler.reduce(
        (acc, u) => acc + Number(u.fiyat.replace(/\./g, "")),
        0,
      );
      setMiktar(toplam.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
    }
  };

  const urunSil = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const yeniUrunler = urunler.filter((_, i) => i !== index);
    setUrunler(yeniUrunler);

    const toplam = yeniUrunler.reduce(
      (acc, u) => acc + Number(u.fiyat.replace(/\./g, "")),
      0,
    );
    setMiktar(
      toplam > 0 ? toplam.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "",
    );
  };

  const formDolu =
    magaza.trim() !== "" &&
    miktar.trim() !== "" &&
    seciliTarihNoktali !== "" &&
    kategori.trim() !== "";

  const kaydet = async () => {
    if (!formDolu) return;
    setYukleniyor(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      const aktifUid = auth.currentUser?.uid;
      if (!aktifUid) return;
      const asilToplam = Number(miktar.replace(/\./g, ""));

      const fisRef = await addDoc(collection(db, "Fisler"), {
        kullanici_id: aktifUid,
        magaza_adi: magaza.trim(),
        tarih: seciliTarihNoktali,
        toplam_tutar: asilToplam,
        kategori: kategori,
        olusturulma_tarihi: serverTimestamp(),
      });

      if (urunler.length > 0) {
        for (const urun of urunler) {
          await addDoc(collection(db, "Urunler"), {
            fis_id: fisRef.id,
            urun_adi: urun.isim,
            fiyat: Number(urun.fiyat.replace(/\./g, "")),
            kategori: urun.kategori,
            kullanici_id: aktifUid,
          });
        }
      } else {
        await addDoc(collection(db, "Urunler"), {
          fis_id: fisRef.id,
          urun_adi: "Genel Harcama",
          fiyat: asilToplam,
          kategori: kategori,
          kullanici_id: aktifUid,
        });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push("/(tabs)");
    } catch (error) {
      console.error(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <View style={styles.anaEkran}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.ustBar}>
          <TouchableOpacity
            style={styles.ikonButon}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
          <Text style={styles.sayfaBaslik}>Harcama Ekle</Text>
          <TouchableOpacity
            style={styles.ikonButon}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
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
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.girdiGrubu}>
            <View style={styles.etiketSatir}>
              <Ionicons
                name="storefront-outline"
                size={14}
                color={
                  odaklananKutu === "magaza"
                    ? "#1DB954"
                    : "rgba(255, 255, 255, 0.45)"
                }
              />
              <Text
                style={[
                  styles.etiketMetin,
                  odaklananKutu === "magaza" && { color: "#1DB954" },
                ]}
              >
                Mağaza Adı
              </Text>
            </View>
            <Pressable
              style={[
                styles.standartInputZemin,
                odaklananKutu === "magaza" && styles.inputOdakli,
              ]}
              onPress={() => {
                magazaRef.current?.focus();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <TextInput
                ref={magazaRef}
                style={styles.standartInput}
                placeholder="Örn: Starbucks"
                placeholderTextColor="rgba(255, 255, 255, 0.30)"
                value={magaza}
                onChangeText={setMagaza}
                onFocus={() => setOdaklananKutu("magaza")}
                onBlur={() => setOdaklananKutu(null)}
                selectionColor="#1DB954"
                autoCapitalize="words"
              />
            </Pressable>
          </View>

          <View style={styles.girdiGrubu}>
            <View style={styles.etiketSatir}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color="rgba(255, 255, 255, 0.45)"
              />
              <Text style={styles.etiketMetin}>Tarih</Text>
            </View>
            <TouchableOpacity
              style={styles.standartInputZemin}
              activeOpacity={0.7}
              onPress={() => {
                Keyboard.dismiss();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTarihGoster(true);
              }}
            >
              <Text
                style={[
                  styles.standartInputMetni,
                  !ekrandaGozukenTarih && {
                    color: "rgba(255, 255, 255, 0.30)",
                  },
                ]}
              >
                {ekrandaGozukenTarih ? ekrandaGozukenTarih : "Tarih seçin"}
              </Text>
              <Ionicons
                name="calendar"
                size={16}
                color="rgba(255, 255, 255, 0.45)"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.girdiGrubu}>
            <View style={styles.etiketSatir}>
              <Ionicons
                name="pricetag-outline"
                size={14}
                color="rgba(255, 255, 255, 0.45)"
              />
              <Text style={styles.etiketMetin}>Fişin Genel Kategorisi</Text>
            </View>
            <TouchableOpacity
              style={styles.standartInputZemin}
              activeOpacity={0.7}
              onPress={() => {
                Keyboard.dismiss();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAktifKategoriSecimi("fis");
                setKategoriModalAcik(true);
              }}
            >
              {kategori ? (
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Ionicons
                    name={KATEGORI_AYARLARI[kategori]?.ikon || "bag-handle"}
                    size={16}
                    color={KATEGORI_AYARLARI[kategori]?.renk || "#1DB954"}
                  />
                  <Text style={styles.standartInputMetni}>{kategori}</Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.standartInputMetni,
                    { color: "rgba(255, 255, 255, 0.30)" },
                  ]}
                >
                  Kategori seçin
                </Text>
              )}
              <Ionicons
                name="chevron-down"
                size={16}
                color="rgba(255, 255, 255, 0.45)"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.girdiGrubu}>
            <View style={styles.etiketSatir}>
              <Ionicons
                name="list-outline"
                size={14}
                color="rgba(255, 255, 255, 0.45)"
              />
              <Text style={styles.etiketMetin}>
                Ürün Kalemleri (İsteğe Bağlı)
              </Text>
            </View>

            {urunler.map((u, i) => (
              <View key={i} style={styles.urunKalemSatiri}>
                <TouchableOpacity
                  onPress={() => {
                    Keyboard.dismiss();
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setAktifKategoriSecimi(i);
                    setKategoriModalAcik(true);
                  }}
                  style={[
                    styles.kucukKategoriButon,
                    {
                      backgroundColor: `${KATEGORI_AYARLARI[u.kategori]?.renk || "#8B5CF6"}26`,
                    },
                  ]}
                >
                  <Ionicons
                    name={KATEGORI_AYARLARI[u.kategori]?.ikon || "bag-handle"}
                    size={16}
                    color={KATEGORI_AYARLARI[u.kategori]?.renk || "#8B5CF6"}
                  />
                </TouchableOpacity>
                <View style={styles.urunKalemSol}>
                  <Text style={styles.urunKalemIsim}>{u.isim}</Text>
                </View>
                <Text style={styles.urunKalemFiyat}>{u.fiyat} TL</Text>
                <TouchableOpacity
                  onPress={() => urunSil(i)}
                  style={styles.urunKalemSil}
                >
                  <Ionicons name="close" size={16} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.yeniUrunSatiri}>
              <TextInput
                style={[styles.standartInput, styles.yeniUrunInputIsim]}
                placeholder="Ürün adı"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={yeniUrunIsim}
                onChangeText={setYeniUrunIsim}
                cursorColor="#1DB954"
              />
              <TextInput
                style={[styles.standartInput, styles.yeniUrunInputFiyat]}
                placeholder="Tutar"
                placeholderTextColor="rgba(255,255,255,0.2)"
                keyboardType="numeric"
                value={yeniUrunFiyat}
                onChangeText={(t) => setYeniUrunFiyat(t.replace(/[^0-9]/g, ""))}
                cursorColor="#1DB954"
              />

              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setAktifKategoriSecimi("yeniUrun");
                  setKategoriModalAcik(true);
                }}
                style={[
                  styles.yeniUrunKategoriBtn,
                  {
                    borderColor:
                      KATEGORI_AYARLARI[yeniUrunKategori]?.renk || "#8B5CF6",
                    backgroundColor: `${KATEGORI_AYARLARI[yeniUrunKategori]?.renk || "#8B5CF6"}15`,
                  },
                ]}
              >
                <Ionicons
                  name={
                    KATEGORI_AYARLARI[yeniUrunKategori]?.ikon || "bag-handle"
                  }
                  size={20}
                  color={KATEGORI_AYARLARI[yeniUrunKategori]?.renk || "#8B5CF6"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.yeniUrunEkleBtn}
                onPress={urunEkle}
              >
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.girdiGrubu, { marginTop: 10 }]}>
            <View style={styles.etiketSatir}>
              <Ionicons
                name="wallet-outline"
                size={14}
                color={
                  odaklananKutu === "miktar"
                    ? "#1DB954"
                    : "rgba(255, 255, 255, 0.45)"
                }
              />
              <Text
                style={[
                  styles.etiketMetin,
                  odaklananKutu === "miktar" && { color: "#1DB954" },
                ]}
              >
                Toplam Tutar
              </Text>
            </View>
            <Pressable
              style={[
                styles.neonInputZemin,
                odaklananKutu === "miktar" && styles.inputOdakli,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                miktarRef.current?.focus();
              }}
            >
              <TextInput
                ref={miktarRef}
                style={styles.neonInput}
                placeholder="0"
                placeholderTextColor="rgba(255, 255, 255, 0.30)"
                keyboardType="numeric"
                value={miktar}
                onChangeText={(t) => setMiktar(t.replace(/[^0-9.]/g, ""))}
                onFocus={() => setOdaklananKutu("miktar")}
                onBlur={() => setOdaklananKutu(null)}
                selectionColor="#1DB954"
                maxLength={10}
              />
              <Text
                style={[
                  styles.paraBirimi,
                  odaklananKutu === "miktar" && { color: "#1DB954" },
                ]}
              >
                TL
              </Text>
            </Pressable>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>

        <View style={styles.altButonlarKapsayici}>
          <TouchableOpacity
            style={[styles.kaydetButon, !formDolu && styles.kaydetButonPasif]}
            activeOpacity={0.8}
            onPress={kaydet}
            disabled={!formDolu || yukleniyor}
          >
            {yukleniyor ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                style={[
                  styles.kaydetButonMetin,
                  !formDolu && styles.kaydetButonMetinPasif,
                ]}
              >
                Harcamayı Kaydet
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={tarihGoster}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setTarihGoster(false)}
      >
        <View style={styles.takvimModalArkaPlan}>
          <View style={styles.takvimModalKutu}>
            <View style={styles.takvimModalUst}>
              <Text style={styles.takvimModalBaslik}>Tarih Seç</Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setTarihGoster(false);
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
              onDayPress={takvimGunSecildi}
              markedDates={{
                [seciliTarihISO]: { selected: true, disableTouchEvent: true },
              }}
              maxDate={getYerelMaxTarih()}
              theme={{
                backgroundColor: "#18181B",
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
          <View style={styles.modalKutu}>
            <View style={styles.modalUstBar}>
              <Text style={styles.modalBaslik}>
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
                if (aktifKategoriSecimi === "fis") aktifKat = kategori;
                else if (aktifKategoriSecimi === "yeniUrun")
                  aktifKat = yeniUrunKategori;
                else if (typeof aktifKategoriSecimi === "number")
                  aktifKat = urunler[aktifKategoriSecimi]?.kategori;

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
  standartInput: { flex: 1, color: "white", fontSize: 15, fontWeight: "500" },
  standartInputMetni: {
    flex: 1,
    color: "white",
    fontSize: 15,
    fontWeight: "500",
  },
  inputOdakli: {
    borderColor: "#1DB954",
    backgroundColor: "rgba(29, 185, 84, 0.05)",
  },

  urunKalemSatiri: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    marginBottom: 8,
  },
  kucukKategoriButon: { padding: 6, borderRadius: 8, marginRight: 10 },
  urunKalemSol: { flex: 1 },
  urunKalemIsim: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "500",
  },
  urunKalemFiyat: {
    color: "#1DB954",
    fontSize: 14,
    fontWeight: "700",
    marginHorizontal: 12,
  },
  urunKalemSil: {
    width: 28,
    height: 28,
    backgroundColor: "rgba(255,107,107,0.1)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  yeniUrunSatiri: { flexDirection: "row", gap: 8, alignItems: "center" },
  yeniUrunInputIsim: {
    flex: 1,
    backgroundColor: "#18181B",
    height: 50,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  yeniUrunInputFiyat: {
    width: 80,
    backgroundColor: "#18181B",
    height: 50,
    paddingHorizontal: 10,
    borderRadius: 12,
    textAlign: "right",
  },
  yeniUrunKategoriBtn: {
    width: 44,
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  yeniUrunEkleBtn: {
    width: 44,
    height: 50,
    backgroundColor: "rgba(29, 185, 84, 0.2)",
    borderWidth: 1,
    borderColor: "#1DB954",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  neonInputZemin: {
    backgroundColor: "#18181B",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 18,
    height: 70,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  },
  kaydetButon: {
    backgroundColor: "#1DB954",
    borderRadius: 16,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  kaydetButonMetin: { color: "white", fontSize: 16, fontWeight: "700" },
  kaydetButonPasif: { backgroundColor: "rgba(29, 185, 84, 0.15)" },
  kaydetButonMetinPasif: { color: "rgba(255, 255, 255, 0.3)" },
  takvimModalArkaPlan: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  takvimModalKutu: {
    backgroundColor: "#18181B",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  takvimModalUst: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  takvimModalBaslik: { color: "white", fontSize: 18, fontWeight: "700" },
  kategoriModalArkaPlan: {
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
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalUstBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalBaslik: { color: "white", fontSize: 18, fontWeight: "700" },
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
});
