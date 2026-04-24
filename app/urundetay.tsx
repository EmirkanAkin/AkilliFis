import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth, db } from "../firebaseConfig";

// KATEGORİ AYARLARI
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

export default function UrunDetayiScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [yukleniyor, setYukleniyor] = useState(true);
  const [duzenleModalAcik, setDuzenleModalAcik] = useState(false);
  const [fisDetay, setFisDetay] = useState({
    magaza: "Yükleniyor...",
    tarih: "",
    toplam: 0,
  });
  const [duzenlenenUrunler, setDuzenlenenUrunler] = useState<any[]>([]);

  const [kategoriModalAcik, setKategoriModalAcik] = useState(false);
  const [aktifKategoriSecimi, setAktifKategoriSecimi] = useState<number | null>(
    null,
  );

  const [magazaModalAcik, setMagazaModalAcik] = useState(false);
  const [geciciMagazaAd, setGeciciMagazaAd] = useState("");
  const magazaInputRef = useRef<TextInput>(null);

  // SİLME MODALI STATELERİ
  const [silmeModalAcik, setSilmeModalAcik] = useState(false);
  const [siliyor, setSiliyor] = useState(false);

  useEffect(() => {
    if (!id) return;
    const seciliFisId = Array.isArray(id) ? id[0] : id;

    const veriGetir = async () => {
      try {
        const fisRef = doc(db, "Fisler", seciliFisId);
        const fisSnap = await getDoc(fisRef);

        if (fisSnap.exists()) {
          const data = fisSnap.data();
          setFisDetay({
            magaza: data.magaza_adi || "Mağaza",
            tarih: data.tarih || "",
            toplam: Number(data.toplam_tutar) || 0,
          });
        }

        const urunlerRef = collection(db, "Urunler");
        const q = query(urunlerRef, where("fis_id", "==", seciliFisId));
        const urunlerSnap = await getDocs(q);

        const geciciUrunler: any[] = [];
        urunlerSnap.forEach((doc) => {
          const urunData = doc.data();
          geciciUrunler.push({
            id: doc.id,
            isim: urunData.urun_adi,
            fiyat: Number(urunData.fiyat).toFixed(2).replace(".", ","),
            kategori: urunData.kategori || "Diğer",
          });
        });

        setDuzenlenenUrunler(geciciUrunler);
      } catch (error) {
        console.error("🔥 VERİ ÇEKME HATASI:", error);
      } finally {
        setYukleniyor(false);
      }
    };

    veriGetir();
  }, [id]);

  const isimGuncelle = (text: string, urunId: string) => {
    setDuzenlenenUrunler((prev) =>
      prev.map((urun) => (urun.id === urunId ? { ...urun, isim: text } : urun)),
    );
  };

  const fiyatGuncelle = (text: string, urunId: string) => {
    const safRakam = text.replace(/[^0-9,]/g, "");
    setDuzenlenenUrunler((prev) =>
      prev.map((urun) =>
        urun.id === urunId ? { ...urun, fiyat: safRakam } : urun,
      ),
    );
  };

  const urunSil = (urunId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDuzenlenenUrunler((prev) => prev.filter((urun) => urun.id !== urunId));
  };

  const yeniUrunEkle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const yeniId = Date.now().toString();
    setDuzenlenenUrunler([
      ...duzenlenenUrunler,
      { id: yeniId, isim: "", fiyat: "", kategori: "Diğer" },
    ]);
  };

  const kategoriSec = (secilenKat: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (aktifKategoriSecimi !== null) {
      const guncelUrunler = [...duzenlenenUrunler];
      guncelUrunler[aktifKategoriSecimi].kategori = secilenKat;
      setDuzenlenenUrunler(guncelUrunler);
    }
    setKategoriModalAcik(false);
  };

  const magazaAdiniKaydet = async () => {
    if (!geciciMagazaAd.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMagazaModalAcik(false);

    const seciliFisId = Array.isArray(id) ? id[0] : id;

    try {
      const fisRef = doc(db, "Fisler", seciliFisId);
      await updateDoc(fisRef, { magaza_adi: geciciMagazaAd.trim() });
      setFisDetay((prev) => ({ ...prev, magaza: geciciMagazaAd.trim() }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const formDolu =
    duzenlenenUrunler.length > 0 &&
    duzenlenenUrunler.every(
      (u) => u.isim.trim() !== "" && u.fiyat.trim() !== "",
    );

  const degisiklikleriFirebaseKaydet = async () => {
    if (!formDolu) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDuzenleModalAcik(false);
    setYukleniyor(true);
    const seciliFisId = Array.isArray(id) ? id[0] : id;

    try {
      const yeniToplam = duzenlenenUrunler.reduce(
        (acc, u) => acc + Number(u.fiyat.replace(",", ".")),
        0,
      );
      const fisRef = doc(db, "Fisler", seciliFisId);
      await updateDoc(fisRef, { toplam_tutar: yeniToplam });

      const urunlerRef = collection(db, "Urunler");
      const q = query(urunlerRef, where("fis_id", "==", seciliFisId));
      const eskiUrunlerSnap = await getDocs(q);
      const silmeIslemleri = eskiUrunlerSnap.docs.map((d) =>
        deleteDoc(doc(db, "Urunler", d.id)),
      );
      await Promise.all(silmeIslemleri);

      const aktifUid = auth.currentUser?.uid;
      const eklemeIslemleri = duzenlenenUrunler.map((urun) =>
        addDoc(collection(db, "Urunler"), {
          fis_id: seciliFisId,
          urun_adi: urun.isim.trim(),
          fiyat: Number(urun.fiyat.replace(",", ".")),
          kategori: urun.kategori,
          kullanici_id: aktifUid,
        }),
      );
      await Promise.all(eklemeIslemleri);

      const yeniUrunlerSnap = await getDocs(q);
      const guncelUrunler = yeniUrunlerSnap.docs.map((doc) => ({
        id: doc.id,
        isim: doc.data().urun_adi,
        fiyat: Number(doc.data().fiyat).toFixed(2).replace(".", ","),
        kategori: doc.data().kategori || "Diğer",
      }));
      setDuzenlenenUrunler(guncelUrunler);
      setFisDetay((prev) => ({ ...prev, toplam: yeniToplam }));
    } catch (error) {
      console.error(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setYukleniyor(false);
    }
  };

  const fisiKompleSil = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setSilmeModalAcik(true);
  };

  const gercektenFisiSil = async () => {
    setSiliyor(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const seciliFisId = Array.isArray(id) ? id[0] : id;

    try {
      await deleteDoc(doc(db, "Fisler", seciliFisId));
      const q = query(
        collection(db, "Urunler"),
        where("fis_id", "==", seciliFisId),
      );
      const urunlerSnap = await getDocs(q);

      const silmeIslemleri = urunlerSnap.docs.map((d) =>
        deleteDoc(doc(db, "Urunler", d.id)),
      );
      await Promise.all(silmeIslemleri);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSilmeModalAcik(false);
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Fiş silinirken hata:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSiliyor(false);
    }
  };

  const gruplanmisKategoriler = duzenlenenUrunler.reduce((acc: any, urun) => {
    const kat = urun.kategori || "Diğer";
    if (!acc[kat]) acc[kat] = { ad: kat, urunler: [], toplam: 0 };
    acc[kat].urunler.push(urun);
    acc[kat].toplam += Number(urun.fiyat.replace(",", "."));
    return acc;
  }, {});

  const toplamHesaplanan = duzenlenenUrunler.reduce(
    (acc, u) => acc + Number(u.fiyat.replace(",", ".")),
    0,
  );

  if (yukleniyor) {
    return (
      <View
        style={[
          styles.anaEkran,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={{ color: "rgba(255,255,255,0.5)", marginTop: 10 }}>
          Veriler işleniyor...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.anaEkran}>
        <View style={styles.ustBar}>
          <TouchableOpacity
            style={[
              styles.geriButon,
              (yukleniyor || siliyor) && { opacity: 0.4 },
            ]}
            disabled={yukleniyor || siliyor}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.sayfaBaslik}>Ürün Detayları</Text>
          <TouchableOpacity
            style={[
              styles.silButonUst,
              (yukleniyor || siliyor) && { opacity: 0.4 },
            ]}
            disabled={yukleniyor || siliyor}
            onPress={fisiKompleSil}
          >
            <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <LinearGradient
            colors={["rgba(39, 39, 42, 0.90)", "rgba(30, 30, 35, 0.90)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ozetKarti}
          >
            <View style={styles.ozetSolKisim}>
              <View style={styles.ozetHeader}>
                <View style={styles.ikonZemini}>
                  <Text style={styles.ikonHarf}>
                    {fisDetay.magaza?.[0]?.toUpperCase() || "F"}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <TouchableOpacity
                    onPress={() => {
                      setGeciciMagazaAd(fisDetay.magaza);
                      setMagazaModalAcik(true);
                      setTimeout(() => magazaInputRef.current?.focus(), 100);
                    }}
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    <Text style={styles.magazaAd}>
                      {fisDetay.magaza.toUpperCase()}
                    </Text>
                    <Ionicons
                      name="pencil"
                      size={12}
                      color="rgba(255,255,255,0.4)"
                      style={{ marginLeft: 6 }}
                    />
                  </TouchableOpacity>
                  <Text style={styles.tarihMetin}>
                    {fisDetay.tarih.toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.bilgiSatiri}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color="rgba(255,255,255,0.35)"
                />
                <Text style={styles.bilgiMetin}>Kayıtlı Lokasyon</Text>
              </View>
              <View style={styles.bilgiSatiri}>
                <Ionicons
                  name="pricetag-outline"
                  size={14}
                  color="rgba(255,255,255,0.35)"
                />
                <Text style={styles.bilgiMetin}>
                  Fiş{" "}
                  <Text style={{ color: "rgba(255, 255, 255, 0.20)" }}>·</Text>{" "}
                  {duzenlenenUrunler.length} kalem
                </Text>
              </View>
              <View style={styles.tutarRozeti}>
                <Text style={styles.tutarMetinGoster}>
                  {toplamHesaplanan.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
                <Text style={styles.tutarMetinTL}> TL</Text>
              </View>
            </View>
            <View style={styles.miniFisKutu}>
              <View style={styles.fisUstCizgi} />
              <View style={styles.fisNoktaliAyrac} />
              <View style={styles.fisSatirCizgi} />
              <View style={[styles.fisSatirCizgi, { width: "50%" }]} />
              <View style={styles.fisSatirCizgi} />
              <View style={[styles.fisSatirCizgi, { width: "70%" }]} />
              <View style={styles.fisToplamCizgi} />
            </View>
          </LinearGradient>

          <View style={styles.kategorilerBaslikSatiri}>
            <Text style={styles.altBaslik}>KATEGORİ DETAYLARI</Text>
            <Text style={styles.urunSayisi}>
              {duzenlenenUrunler.length} ürün
            </Text>
          </View>

          {Object.values(gruplanmisKategoriler).map((kat: any) => (
            <View key={kat.ad} style={styles.kategoriKarti}>
              <View style={styles.kategoriHeader}>
                <View
                  style={[
                    styles.kategoriIkonZemin,
                    {
                      backgroundColor: `${KATEGORI_AYARLARI[kat.ad]?.renk || "#8B5CF6"}26`,
                    },
                  ]}
                >
                  <Ionicons
                    name={KATEGORI_AYARLARI[kat.ad]?.ikon || "bag-handle"}
                    size={18}
                    color={KATEGORI_AYARLARI[kat.ad]?.renk || "#8B5CF6"}
                  />
                </View>
                <View style={styles.kategoriBaslikBilgi}>
                  <Text style={styles.kategoriAd}>{kat.ad}</Text>
                  <Text style={styles.kategoriKalem}>
                    {kat.urunler.length} kalem
                  </Text>
                </View>
                <Text style={styles.kategoriToplamTutar}>
                  {kat.toplam.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  TL
                </Text>
              </View>
              <View style={styles.urunlerListesi}>
                {kat.urunler.map((urun: any, index: number) => (
                  <View key={index} style={styles.urunSatiri}>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.3)",
                        marginRight: 6,
                        fontSize: 14,
                      }}
                    >
                      •
                    </Text>
                    <Text style={styles.urunAd} numberOfLines={1}>
                      {urun.isim}
                    </Text>
                    <Text style={styles.urunFiyatiSag}>{urun.fiyat} TL</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>

        <View
          style={[
            styles.altButonlarKapsayici,
            { bottom: Math.max(20, insets.bottom + 10) },
          ]}
        >
          <TouchableOpacity
            style={styles.altButonTekli}
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setDuzenleModalAcik(true);
            }}
          >
            <Ionicons
              name="pencil-outline"
              size={16}
              color="rgba(255, 255, 255, 0.80)"
            />
            <Text style={styles.altButonMetin}>Harcamayı Düzenle</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={duzenleModalAcik}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setDuzenleModalAcik(false)}
        >
          <KeyboardAvoidingView
            style={styles.kategoriModalArkaPlan}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View
              style={[
                styles.kategoriModalKutu,
                { paddingBottom: Math.max(20, insets.bottom + 10) },
              ]}
            >
              <View style={styles.tutuamacKapsayici}>
                <View style={styles.tutuamac} />
              </View>
              <View style={styles.modalUstBar}>
                <Text style={styles.modalBaslik}>Ürünleri Düzenle</Text>
                <TouchableOpacity
                  style={styles.kapatIkonZemini}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setDuzenleModalAcik(false);
                  }}
                >
                  <Ionicons
                    name="close"
                    size={18}
                    color="rgba(255,255,255,0.7)"
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.duzenleListe}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {duzenlenenUrunler.map((urun, index) => (
                  <View key={urun.id} style={styles.duzenleSatiri}>
                    <View
                      style={[
                        styles.urunIsimInputZemini,
                        urun.isim.trim() === "" && styles.inputHatali,
                      ]}
                    >
                      <TextInput
                        style={styles.urunIsimInput}
                        value={urun.isim}
                        onChangeText={(text) => isimGuncelle(text, urun.id)}
                        selectionColor="#1DB954"
                        cursorColor="#1DB954"
                        placeholder="Ürün adı"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                      />
                    </View>
                    <View
                      style={[
                        styles.urunFiyatInputZemini,
                        urun.fiyat.trim() === "" && styles.inputHatali,
                      ]}
                    >
                      <TextInput
                        style={styles.urunFiyatInput}
                        value={urun.fiyat}
                        onChangeText={(text) => fiyatGuncelle(text, urun.id)}
                        keyboardType="decimal-pad"
                        selectionColor="#1DB954"
                        cursorColor="#1DB954"
                        placeholder="0,00"
                        placeholderTextColor="rgba(29, 185, 84, 0.3)"
                      />
                      <Text style={styles.urunFiyatParaBirimi}>TL</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        Keyboard.dismiss();
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setAktifKategoriSecimi(index);
                        setKategoriModalAcik(true);
                      }}
                      style={{
                        marginLeft: 6,
                        padding: 10,
                        backgroundColor: `${KATEGORI_AYARLARI[urun.kategori || "Diğer"]?.renk || "#8B5CF6"}26`,
                        borderRadius: 10,
                      }}
                    >
                      <Ionicons
                        name={
                          KATEGORI_AYARLARI[urun.kategori || "Diğer"]?.ikon ||
                          "bag-handle"
                        }
                        size={18}
                        color={
                          KATEGORI_AYARLARI[urun.kategori || "Diğer"]?.renk ||
                          "#8B5CF6"
                        }
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.urunSilButonu}
                      onPress={() => urunSil(urun.id)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#FF6B6B"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.yeniUrunEkleZemini}
                  activeOpacity={0.7}
                  onPress={yeniUrunEkle}
                >
                  <Ionicons name="add" size={18} color="#1DB954" />
                  <Text style={styles.yeniUrunEkleMetni}>Yeni Ürün Ekle</Text>
                </TouchableOpacity>
                <View style={{ height: 20 }} />
              </ScrollView>

              <View style={styles.modalAltButonKapsayici}>
                <TouchableOpacity
                  style={[
                    styles.degisiklikleriKaydetButonu,
                    !formDolu && styles.degisiklikleriKaydetButonPasif,
                  ]}
                  activeOpacity={0.8}
                  onPress={degisiklikleriFirebaseKaydet}
                  disabled={!formDolu}
                >
                  <Text
                    style={[
                      styles.degisiklikleriKaydetMetni,
                      !formDolu && styles.degisiklikleriKaydetMetinPasif,
                    ]}
                  >
                    Değişiklikleri Uygula
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* KATEGORİ SEÇİM MODALI */}
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
            <View
              style={[
                styles.modalKutu,
                { paddingBottom: Math.max(20, insets.bottom + 10) },
              ]}
            >
              <View style={styles.modalUstBar}>
                <Text style={styles.modalBaslik}>Ürün Kategorisi Seç</Text>
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
                  const aktifKat =
                    aktifKategoriSecimi !== null
                      ? duzenlenenUrunler[aktifKategoriSecimi]?.kategori
                      : "";
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

        {/* MAĞAZA DÜZENLE MODALI */}
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
            <View
              style={[
                styles.magazaKartIcerik,
                { paddingBottom: Math.max(20, insets.bottom + 10) },
              ]}
            >
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
                onPress={magazaAdiniKaydet}
                disabled={geciciMagazaAd.trim() === ""}
              >
                <Text style={styles.magazaOnaylaButonMetin}>Güncelle</Text>
              </TouchableOpacity>
              <View style={{ height: 30 }} />
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>

      <Modal
        visible={silmeModalAcik}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSilmeModalAcik(false)}
      >
        <View style={styles.silmeModalArkaPlan}>
          <View style={styles.silmeModalKutu}>
            <View style={styles.silmeModalIkonZemin}>
              <Ionicons name="trash-outline" size={32} color="#FF6B6B" />
            </View>
            <Text style={styles.silmeModalBaslik}>Fişi Sil</Text>
            <Text style={styles.silmeModalMesaj}>
              Bu fişi tamamen silmek istediğinize emin misiniz? İşlem geri
              alınamaz.
            </Text>
            <View style={styles.silmeModalButonKapsayici}>
              <TouchableOpacity
                style={styles.silmeModalIptalButon}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSilmeModalAcik(false);
                }}
                disabled={siliyor}
              >
                <Text style={styles.silmeModalIptalMetin}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.silmeModalOnayButon}
                onPress={gercektenFisiSil}
                disabled={siliyor}
              >
                {siliyor ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.silmeModalOnayMetin}>Evet, Sil</Text>
                )}
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
  silButonUst: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  ozetKarti: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 30,
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
      },
      android: { elevation: 10 },
    }),
  },
  ozetSolKisim: { flex: 1 },
  ozetHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  ikonZemini: {
    width: 34,
    height: 34,
    backgroundColor: "#1DB954",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#1DB954",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: { elevation: 6, shadowColor: "#1DB954" },
    }),
  },
  ikonHarf: { color: "white", fontSize: 15, fontWeight: "800" },
  magazaAd: { color: "white", fontSize: 15, fontWeight: "700" },
  tarihMetin: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 10,
    fontWeight: "400",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  bilgiSatiri: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  bilgiMetin: {
    color: "rgba(255, 255, 255, 0.35)",
    fontSize: 11,
    fontWeight: "400",
  },
  tutarRozeti: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(29, 185, 84, 0.10)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.25)",
  },
  tutarMetinGoster: { color: "white", fontSize: 18, fontWeight: "800" },
  tutarMetinTL: {
    color: "#1DB954",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
  miniFisKutu: {
    width: 80,
    height: 110,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  fisUstCizgi: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    marginBottom: 8,
  },
  fisNoktaliAyrac: {
    width: "100%",
    height: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 8,
  },
  fisSatirCizgi: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    marginBottom: 6,
  },
  fisToplamCizgi: {
    width: "80%",
    height: 6,
    backgroundColor: "#1DB954",
    borderRadius: 3,
    marginTop: "auto",
    alignSelf: "flex-end",
  },
  kategorilerBaslikSatiri: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  altBaslik: {
    color: "rgba(255, 255, 255, 0.50)",
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: 1,
  },
  urunSayisi: { color: "#1DB954", fontSize: 11, fontWeight: "600" },
  kategoriKarti: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  kategoriHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  kategoriIkonZemin: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  kategoriBaslikBilgi: { flex: 1 },
  kategoriAd: { color: "white", fontSize: 14, fontWeight: "600" },
  kategoriKalem: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 11,
    marginTop: 2,
  },
  kategoriToplamTutar: { color: "white", fontSize: 14, fontWeight: "700" },
  urunlerListesi: { paddingLeft: 52 },
  urunSatiri: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  urunAd: {
    flex: 1,
    color: "rgba(255, 255, 255, 0.55)",
    fontSize: 12,
    fontWeight: "400",
  },
  urunFiyatiSag: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    fontWeight: "600",
  },
  altButonlarKapsayici: {
    position: "absolute",
    left: 20,
    right: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  altButonTekli: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    backgroundColor: "rgba(0,0,0,0.85)",
    gap: 10,
  },
  altButonMetin: {
    color: "rgba(255, 255, 255, 0.80)",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
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
    maxHeight: "85%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  tutuamacKapsayici: { alignItems: "center", paddingTop: 12, marginBottom: 16 },
  tutuamac: {
    width: 36,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.20)",
    borderRadius: 10,
  },
  modalUstBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalBaslik: { color: "white", fontSize: 18, fontWeight: "700" },
  kapatIkonZemini: {
    width: 32,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  duzenleListe: { flexGrow: 0, maxHeight: 400 },
  duzenleSatiri: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  urunIsimInputZemini: {
    flex: 1,
    height: 52,
    backgroundColor: "#0A0A0A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.10)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  urunIsimInput: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "500",
    padding: 0,
  },
  urunFiyatInputZemini: {
    width: 100,
    height: 52,
    backgroundColor: "#0A0A0A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.20)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 6,
  },
  urunFiyatInput: {
    flex: 1,
    color: "rgba(29, 185, 84, 0.70)",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "right",
    padding: 0,
  },
  urunFiyatParaBirimi: { color: "#1DB954", fontSize: 12, fontWeight: "600" },
  urunSilButonu: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255, 107, 107, 0.08)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  yeniUrunEkleZemini: {
    height: 52,
    backgroundColor: "rgba(29, 185, 84, 0.06)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.30)",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },
  yeniUrunEkleMetni: {
    color: "#1DB954",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  modalAltButonKapsayici: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
    marginTop: 10,
  },
  inputHatali: {
    borderColor: "rgba(255, 107, 107, 0.5)",
    backgroundColor: "rgba(255, 107, 107, 0.05)",
  },
  degisiklikleriKaydetButonu: {
    width: "100%",
    height: 60,
    borderRadius: 16,
    backgroundColor: "#1DB954",
    shadowColor: "#1DB954",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  degisiklikleriKaydetMetni: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  degisiklikleriKaydetButonPasif: {
    backgroundColor: "rgba(29, 185, 84, 0.15)",
    shadowOpacity: 0,
    elevation: 0,
  },
  degisiklikleriKaydetMetinPasif: { color: "rgba(255, 255, 255, 0.3)" },
  modalKutu: {
    backgroundColor: "#18181B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  kategoriListesi: { marginBottom: 20, maxHeight: 300 },
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
  silmeModalArkaPlan: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  silmeModalKutu: {
    width: "100%",
    backgroundColor: "#18181B",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.25)",
  },
  silmeModalIkonZemin: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
  },
  silmeModalBaslik: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  silmeModalMesaj: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  silmeModalButonKapsayici: { flexDirection: "row", gap: 12, width: "100%" },
  silmeModalIptalButon: {
    flex: 1,
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  silmeModalIptalMetin: { color: "white", fontSize: 15, fontWeight: "600" },
  silmeModalOnayButon: {
    flex: 1,
    height: 50,
    backgroundColor: "#E53935",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  silmeModalOnayMetin: { color: "white", fontSize: 15, fontWeight: "700" },
});
