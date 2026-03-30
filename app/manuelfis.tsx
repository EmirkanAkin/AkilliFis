import { Ionicons } from "@expo/vector-icons";
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

// FİREBASE BAĞLANTILARI EKLENDİ
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

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
  const [seciliTarihStr, setSeciliTarihStr] = useState("");
  const [ekrandaGozukenTarih, setEkrandaGozukenTarih] = useState("");

  const [kategori, setKategori] = useState("");
  const [kategoriModalAcik, setKategoriModalAcik] = useState(false);
  const [yeniKategori, setYeniKategori] = useState("");
  const [kategoriListesi, setKategoriListesi] = useState([
    "Gıda",
    "Temizlik",
    "Kafe",
    "Eğlence",
    "Giyim",
    "Diğer",
  ]);

  // YENİ: İSTEĞE BAĞLI ÜRÜN KALEMLERİ İÇİN STATE'LER
  const [urunler, setUrunler] = useState<{ isim: string; fiyat: string }[]>([]);
  const [yeniUrunIsim, setYeniUrunIsim] = useState("");
  const [yeniUrunFiyat, setYeniUrunFiyat] = useState("");

  const miktarDegisti = (metin: string) => {
    const safRakam = metin.replace(/[^0-9]/g, "");
    if (safRakam === "") {
      setMiktar("");
      return;
    }
    const formatli = safRakam.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setMiktar(formatli);
  };

  const yeniUrunFiyatDegisti = (metin: string) => {
    const safRakam = metin.replace(/[^0-9]/g, "");
    if (safRakam === "") {
      setYeniUrunFiyat("");
      return;
    }
    setYeniUrunFiyat(safRakam.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
  };

  const takvimGunSecildi = (day: any) => {
    const formatliTarih = day.dateString.split("-").reverse().join("."); // YYYY-MM-DD to DD.MM.YYYY
    setSeciliTarihStr(formatliTarih);

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
    const formatli = `${secilenTarihObj.getDate()} ${aylar[secilenTarihObj.getMonth()]} ${secilenTarihObj.getFullYear()}`;
    setEkrandaGozukenTarih(formatli);
    setTarihGoster(false);
  };

  const kategoriEkleVeSec = () => {
    if (yeniKategori.trim() !== "") {
      setKategoriListesi([...kategoriListesi, yeniKategori.trim()]);
      setKategori(yeniKategori.trim());
      setYeniKategori("");
      setKategoriModalAcik(false);
    }
  };

  // ÜRÜN EKLEME FONKSİYONU
  const urunEkle = () => {
    if (yeniUrunIsim.trim() && yeniUrunFiyat.trim()) {
      const yeniUrun = { isim: yeniUrunIsim.trim(), fiyat: yeniUrunFiyat };
      const yeniUrunler = [...urunler, yeniUrun];
      setUrunler(yeniUrunler);
      setYeniUrunIsim("");
      setYeniUrunFiyat("");

      // Ürün eklenince toplam miktarı otomatik güncelle
      const toplam = yeniUrunler.reduce(
        (acc, u) => acc + Number(u.fiyat.replace(/\./g, "")),
        0,
      );
      setMiktar(toplam.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
    }
  };

  const urunSil = (index: number) => {
    const yeniUrunler = urunler.filter((_, i) => i !== index);
    setUrunler(yeniUrunler);

    // Ürün silinince toplam miktarı otomatik güncelle
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
    seciliTarihStr !== "" &&
    kategori.trim() !== "";

  // GERÇEK FİREBASE KAYIT FONKSİYONU
  const kaydet = async () => {
    if (!formDolu) return;
    setYukleniyor(true);

    try {
      const aktifUid = auth.currentUser?.uid;
      if (!aktifUid) return;

      const asilToplam = Number(miktar.replace(/\./g, ""));

      // 1. Fişi Kaydet
      const fisRef = await addDoc(collection(db, "Fisler"), {
        kullanici_id: aktifUid,
        magaza_adi: magaza.trim(),
        tarih: seciliTarihStr,
        toplam_tutar: asilToplam,
        olusturulma_tarihi: serverTimestamp(),
      });

      // 2. Ürünleri Kaydet (Senin istediğin UrunDetay uyumluluğu burada başlıyor)
      if (urunler.length > 0) {
        // Adam kalem kalem ürün girdiyse
        for (const urun of urunler) {
          await addDoc(collection(db, "Urunler"), {
            fis_id: fisRef.id,
            urun_adi: urun.isim,
            fiyat: Number(urun.fiyat.replace(/\./g, "")),
            kategori: kategori, // Manuel fişte tüm kalemlere aynı kategoriyi veriyoruz
            kullanici_id: aktifUid,
          });
        }
      } else {
        // Adam sadece toplam tutar girdiyse, UrunDetay sayfası bozulmasın diye tek bir "Genel Harcama" kalemi oluştur.
        await addDoc(collection(db, "Urunler"), {
          fis_id: fisRef.id,
          urun_adi: "Genel Harcama",
          fiyat: asilToplam,
          kategori: kategori,
          kullanici_id: aktifUid,
        });
      }

      router.push("/(tabs)");
    } catch (error) {
      console.error("Kaydetme hatası:", error);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.anaEkran}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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
          <Ionicons name="close" size={24} color="rgba(255, 255, 255, 0.45)" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.formKaydirmaAlani}
        contentContainerStyle={styles.formKapsayici}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* MAĞAZA ADI */}
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
            onPress={() => magazaRef.current?.focus()}
          >
            <TextInput
              ref={magazaRef}
              style={styles.standartInput}
              placeholder="Örn: Starbucks, Berber vs."
              placeholderTextColor="rgba(255, 255, 255, 0.30)"
              value={magaza}
              onChangeText={setMagaza}
              onFocus={() => setOdaklananKutu("magaza")}
              onBlur={() => setOdaklananKutu(null)}
              selectionColor="#1DB954"
              cursorColor="#1DB954"
              autoCapitalize="words"
            />
          </Pressable>
        </View>

        {/* TARİH SEÇİCİ */}
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
              setTarihGoster(true);
            }}
          >
            <Text
              style={[
                styles.standartInputMetni,
                !ekrandaGozukenTarih && { color: "rgba(255, 255, 255, 0.30)" },
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

        {/* KATEGORİ SEÇİCİ */}
        <View style={styles.girdiGrubu}>
          <View style={styles.etiketSatir}>
            <Ionicons
              name="pricetag-outline"
              size={14}
              color="rgba(255, 255, 255, 0.45)"
            />
            <Text style={styles.etiketMetin}>Kategori</Text>
          </View>
          <TouchableOpacity
            style={styles.standartInputZemin}
            activeOpacity={0.7}
            onPress={() => {
              Keyboard.dismiss();
              setKategoriModalAcik(true);
            }}
          >
            <Text
              style={[
                styles.standartInputMetni,
                !kategori && { color: "rgba(255, 255, 255, 0.30)" },
              ]}
            >
              {kategori || "Kategori seçin"}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color="rgba(255, 255, 255, 0.45)"
            />
          </TouchableOpacity>
        </View>

        {/* YENİ: İSTEĞE BAĞLI ÜRÜN KALEMLERİ EKLENDİ */}
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
              placeholder="Örn: Kahve"
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
              onChangeText={yeniUrunFiyatDegisti}
              cursorColor="#1DB954"
            />
            <TouchableOpacity style={styles.yeniUrunEkleBtn} onPress={urunEkle}>
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* HARCAMA MİKTARI (NEON) - Alta alındı ki ürün ekledikçe gözünün önünde değişsin */}
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
            onPress={() => miktarRef.current?.focus()}
          >
            <TextInput
              ref={miktarRef}
              style={styles.neonInput}
              placeholder="0"
              placeholderTextColor="rgba(255, 255, 255, 0.30)"
              keyboardType="numeric"
              value={miktar}
              onChangeText={miktarDegisti}
              onFocus={() => setOdaklananKutu("miktar")}
              onBlur={() => setOdaklananKutu(null)}
              selectionColor="#1DB954"
              cursorColor="#1DB954"
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

      {/* ALT BUTON */}
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

      {/* TAKVİM MODALI */}
      <Modal visible={tarihGoster} transparent={true} animationType="fade">
        <View style={styles.takvimModalArkaPlan}>
          <View style={styles.takvimModalKutu}>
            <View style={styles.takvimModalUst}>
              <Text style={styles.takvimModalBaslik}>Tarih Seç</Text>
              <TouchableOpacity onPress={() => setTarihGoster(false)}>
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
                [seciliTarihStr]: { selected: true, disableTouchEvent: true },
              }}
              maxDate={new Date().toISOString().split("T")[0]}
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

      {/* KATEGORİ MODALI */}
      <Modal
        visible={kategoriModalAcik}
        transparent={true}
        animationType="slide"
      >
        <KeyboardAvoidingView
          style={styles.kategoriModalArkaPlan}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalKutu}>
            <View style={styles.modalUstBar}>
              <Text style={styles.modalBaslik}>Kategori Seç</Text>
              <TouchableOpacity onPress={() => setKategoriModalAcik(false)}>
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
              keyboardShouldPersistTaps="handled"
            >
              {kategoriListesi.map((kat, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.kategoriSecenek,
                    kategori === kat && styles.kategoriSecenekAktif,
                  ]}
                  onPress={() => {
                    setKategori(kat);
                    setKategoriModalAcik(false);
                  }}
                >
                  <Text
                    style={[
                      styles.kategoriMetin,
                      kategori === kat && styles.kategoriMetinAktif,
                    ]}
                  >
                    {kat}
                  </Text>
                  {kategori === kat && (
                    <Ionicons name="checkmark" size={20} color="#1DB954" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.yeniKategoriAlani}>
              <TextInput
                style={styles.yeniKategoriInput}
                placeholder="Yeni kategori yaz..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={yeniKategori}
                onChangeText={setYeniKategori}
                cursorColor="#1DB954"
              />
              <TouchableOpacity
                style={styles.yeniKategoriEkleBtn}
                onPress={kategoriEkleVeSec}
              >
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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

  // YENİ EKLENEN ÜRÜN KALEMİ STİLLERİ
  urunKalemSatiri: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
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
    backgroundColor: "#18181B",
    height: 50,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  yeniUrunInputFiyat: {
    flex: 0.5,
    backgroundColor: "#18181B",
    height: 50,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    textAlign: "right",
  },
  yeniUrunEkleBtn: {
    width: 50,
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
    shadowColor: "#1DB954",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  kaydetButonMetin: { color: "white", fontSize: 16, fontWeight: "700" },
  kaydetButonPasif: {
    backgroundColor: "rgba(29, 185, 84, 0.15)",
    shadowOpacity: 0,
    elevation: 0,
  },
  kaydetButonMetinPasif: { color: "rgba(255, 255, 255, 0.3)" },

  takvimModalArkaPlan: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  takvimModalKutu: {
    backgroundColor: "#18181B",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
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
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalKutu: {
    backgroundColor: "#18181B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "85%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  modalUstBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalBaslik: { color: "white", fontSize: 18, fontWeight: "700" },
  kategoriListesi: { maxHeight: 300, marginBottom: 20 },
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
  kategoriMetin: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    fontWeight: "500",
  },
  kategoriMetinAktif: { color: "#1DB954", fontWeight: "700" },
  yeniKategoriAlani: { flexDirection: "row", gap: 12, alignItems: "center" },
  yeniKategoriInput: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    color: "white",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  yeniKategoriEkleBtn: {
    width: 50,
    height: 50,
    backgroundColor: "#1DB954",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
