import { Ionicons } from "@expo/vector-icons";
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
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../firebaseConfig";

// KATEGORİ AYARLARI (Renk ve İkonlar)
const KATEGORI_AYARLARI: any = {
  Gıda: { renk: "#4CAF50", ikon: "nutrition" },
  Temizlik: { renk: "#2196F3", ikon: "water" },
  Giyim: { renk: "#E91E63", ikon: "shirt" },
  Eğlence: { renk: "#FF9800", ikon: "game-controller" },
  Diğer: { renk: "#9C27B0", ikon: "bag-handle" },
};

export default function UrunDetayiScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [yukleniyor, setYukleniyor] = useState(true);
  const [duzenleModalAcik, setDuzenleModalAcik] = useState(false);
  const [fisDetay, setFisDetay] = useState({
    magaza: "Yükleniyor...",
    tarih: "",
    toplam: 0,
  });
  const [duzenlenenUrunler, setDuzenlenenUrunler] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    const veriGetir = async () => {
      try {
        const fisRef = doc(db, "Fisler", id as string);
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
        const q = query(urunlerRef, where("fis_id", "==", id));
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
        console.error(error);
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
    setDuzenlenenUrunler((prev) => prev.filter((urun) => urun.id !== urunId));
  };

  const yeniUrunEkle = () => {
    const yeniId = Date.now().toString();
    setDuzenlenenUrunler([
      ...duzenlenenUrunler,
      { id: yeniId, isim: "", fiyat: "", kategori: "Diğer" },
    ]);
  };

  // KATEGORİ DEĞİŞTİRME BUTONU MANTIĞI
  const kategoriDegistir = (urunId: string) => {
    const kategorilerDizisi = Object.keys(KATEGORI_AYARLARI);
    setDuzenlenenUrunler((prev) =>
      prev.map((u) => {
        if (u.id === urunId) {
          const currentIndex = kategorilerDizisi.indexOf(u.kategori || "Diğer");
          const nextIndex = (currentIndex + 1) % kategorilerDizisi.length;
          return { ...u, kategori: kategorilerDizisi[nextIndex] };
        }
        return u;
      }),
    );
  };

  const degisiklikleriFirebaseKaydet = async () => {
    setDuzenleModalAcik(false);
    setYukleniyor(true);
    try {
      const yeniToplam = duzenlenenUrunler.reduce(
        (acc, u) => acc + Number(u.fiyat.replace(",", ".")),
        0,
      );
      const fisRef = doc(db, "Fisler", id as string);
      await updateDoc(fisRef, { toplam_tutar: yeniToplam });

      const urunlerRef = collection(db, "Urunler");
      const q = query(urunlerRef, where("fis_id", "==", id));
      const eskiUrunlerSnap = await getDocs(q);

      const silmeIslemleri = eskiUrunlerSnap.docs.map((d) =>
        deleteDoc(doc(db, "Urunler", d.id)),
      );
      await Promise.all(silmeIslemleri);

      const aktifUid = auth.currentUser?.uid;
      const eklemeIslemleri = duzenlenenUrunler.map((urun) =>
        addDoc(collection(db, "Urunler"), {
          fis_id: id,
          urun_adi: urun.isim,
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
    } finally {
      setYukleniyor(false);
    }
  };

  // ÜRÜNLERİ KATEGORİYE GÖRE GRUPLA
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
    <View style={styles.anaEkran}>
      <View style={styles.ustBar}>
        <TouchableOpacity
          style={styles.geriButon}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.sayfaBaslik}>Ürün Detayları</Text>
        <View style={{ width: 40 }} />
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
              <View>
                <Text style={styles.magazaAd}>
                  {fisDetay.magaza.toUpperCase()}
                </Text>
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
                {toplamHesaplanan.toFixed(2).replace(".", ",")}
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
          <Text style={styles.altBaslik}>KATEGORİLER</Text>
          <Text style={styles.urunSayisi}>{duzenlenenUrunler.length} ürün</Text>
        </View>

        {Object.values(gruplanmisKategoriler).map((kat: any) => (
          <View key={kat.ad} style={styles.kategoriKarti}>
            <View style={styles.kategoriHeader}>
              <View
                style={[
                  styles.kategoriIkonZemin,
                  {
                    backgroundColor: `${KATEGORI_AYARLARI[kat.ad]?.renk || "#9C27B0"}26`,
                  },
                ]}
              >
                <Ionicons
                  name={KATEGORI_AYARLARI[kat.ad]?.ikon || "bag-handle"}
                  size={18}
                  color={KATEGORI_AYARLARI[kat.ad]?.renk || "#9C27B0"}
                />
              </View>
              <View style={styles.kategoriBaslikBilgi}>
                <Text style={styles.kategoriAd}>{kat.ad}</Text>
                <Text style={styles.kategoriKalem}>
                  {kat.urunler.length} kalem
                </Text>
              </View>
              <Text style={styles.kategoriToplamTutar}>
                {kat.toplam.toFixed(2).replace(".", ",")} TL
              </Text>
            </View>

            <View style={styles.urunlerListesi}>
              {kat.urunler.map((urun: any, index: number) => (
                <View key={index} style={styles.urunSatiri}>
                  <Text style={styles.urunAd}>
                    · {urun.isim} — {urun.fiyat} TL
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.altButonlarKapsayici}>
        <TouchableOpacity
          style={styles.altButonTekli}
          activeOpacity={0.7}
          onPress={() => setDuzenleModalAcik(true)}
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
      >
        <KeyboardAvoidingView
          style={styles.modalArkaPlan}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalKutu}>
            <View style={styles.tutuamacKapsayici}>
              <View style={styles.tutuamac} />
            </View>
            <View style={styles.modalUstBar}>
              <Text style={styles.modalBaslik}>Ürünleri Düzenle</Text>
              <TouchableOpacity
                style={styles.kapatIkonZemini}
                onPress={() => setDuzenleModalAcik(false)}
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
              {duzenlenenUrunler.map((urun) => (
                <View key={urun.id} style={styles.duzenleSatiri}>
                  <View style={styles.urunIsimInputZemini}>
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

                  <View style={styles.urunFiyatInputZemini}>
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

                  {/* EKLENEN KATEGORİ DEĞİŞTİRME BUTONU */}
                  <TouchableOpacity
                    onPress={() => kategoriDegistir(urun.id)}
                    style={{
                      marginLeft: 6,
                      padding: 10,
                      backgroundColor: `${KATEGORI_AYARLARI[urun.kategori || "Diğer"]?.renk}26`,
                      borderRadius: 10,
                    }}
                  >
                    <Ionicons
                      name={KATEGORI_AYARLARI[urun.kategori || "Diğer"]?.ikon}
                      size={18}
                      color={KATEGORI_AYARLARI[urun.kategori || "Diğer"]?.renk}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.urunSilButonu}
                    onPress={() => urunSil(urun.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
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
                style={styles.degisiklikleriKaydetButonu}
                activeOpacity={0.8}
                onPress={degisiklikleriFirebaseKaydet}
              >
                <Text style={styles.degisiklikleriKaydetMetni}>
                  Değişiklikleri Uygula
                </Text>
              </TouchableOpacity>
            </View>
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
  urunSatiri: { marginBottom: 6 },
  urunAd: {
    color: "rgba(255, 255, 255, 0.35)",
    fontSize: 11,
    fontWeight: "400",
  },
  altButonlarKapsayici: {
    position: "absolute",
    bottom: 20,
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
  modalArkaPlan: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalKutu: {
    backgroundColor: "#18181B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    maxHeight: "85%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
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
    marginBottom: Platform.OS === "ios" ? 20 : 10,
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
});
