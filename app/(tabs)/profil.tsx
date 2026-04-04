import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebaseConfig";

// ZUSTAND (BEYİN)
import { useStore } from "../../store/useStore";

// TARİH FORMATLAMA ("DD.MM.YYYY" -> Date)
const parseTarih = (tarihStr: string) => {
  if (!tarihStr) return new Date();
  const parts = tarihStr.split(".");
  if (parts.length === 3) {
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }
  return new Date();
};

export default function ProfilScreen() {
  const router = useRouter();
  const { isim, butce, uid, setIsim, setButce } = useStore();

  const [yukleniyor, setYukleniyor] = useState(true);
  const [sifirlaniyor, setSifirlaniyor] = useState(false);
  const [sifirlaModalAcik, setSifirlaModalAcik] = useState(false);

  // İSTATİSTİK STATELERİ
  const [toplamFisSayisi, setToplamFisSayisi] = useState(0);
  const [buAyEklenenFisSayisi, setBuAyEklenenFisSayisi] = useState(0);
  const [tasarrufMiktari, setTasarrufMiktari] = useState("0");

  const istatistikleriGetir = async () => {
    const aktifUid = uid || auth.currentUser?.uid;
    if (!aktifUid) return setYukleniyor(false);

    try {
      const qFis = query(
        collection(db, "Fisler"),
        where("kullanici_id", "==", aktifUid),
      );
      const fislerSnap = await getDocs(qFis);

      const bugun = new Date();
      const buAy = bugun.getMonth();
      const buYil = bugun.getFullYear();

      let toplamFis = 0;
      let buAyFis = 0;
      let buAyToplamHarcama = 0;
      let gecenAyToplamHarcama = 0;

      fislerSnap.forEach((doc) => {
        toplamFis++;
        const data = doc.data();
        const d = parseTarih(data.tarih);
        const fisTutar = Number(data.toplam_tutar) || 0;

        if (d.getMonth() === buAy && d.getFullYear() === buYil) {
          buAyFis++;
          buAyToplamHarcama += fisTutar;
        }

        const targetAy = buAy === 0 ? 11 : buAy - 1;
        const targetYil = buAy === 0 ? buYil - 1 : buYil;
        if (d.getMonth() === targetAy && d.getFullYear() === targetYil) {
          gecenAyToplamHarcama += fisTutar;
        }
      });

      setToplamFisSayisi(toplamFis);
      setBuAyEklenenFisSayisi(buAyFis);

      if (
        gecenAyToplamHarcama > 0 &&
        buAyToplamHarcama < gecenAyToplamHarcama
      ) {
        const fark = gecenAyToplamHarcama - buAyToplamHarcama;
        setTasarrufMiktari(
          fark.toLocaleString("tr-TR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }),
        );
      } else {
        setTasarrufMiktari("0");
      }
    } catch (error) {
      console.error("Profil verileri çekilemedi:", error);
    } finally {
      setYukleniyor(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setYukleniyor(true);
      istatistikleriGetir();
    }, []),
  );

  const gercektenSifirla = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setSifirlaniyor(true);
    const aktifUid = uid || auth.currentUser?.uid;

    if (aktifUid) {
      try {
        const fislerQ = query(
          collection(db, "Fisler"),
          where("kullanici_id", "==", aktifUid),
        );
        const fislerSnap = await getDocs(fislerQ);
        for (const doc of fislerSnap.docs) await deleteDoc(doc.ref);

        const urunlerQ = query(
          collection(db, "Urunler"),
          where("kullanici_id", "==", aktifUid),
        );
        const urunlerSnap = await getDocs(urunlerQ);
        for (const doc of urunlerSnap.docs) await deleteDoc(doc.ref);

        setIsim("");
        setButce("0");

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSifirlaModalAcik(false);
        setSifirlaniyor(false);

        // 🔴 ÇÖZÜM: Kullanıcıyı uygulamanın en başına (/ilkgiris) yönlendirir
        router.replace("/ilkgiris");
      } catch (error) {
        console.error("Sıfırlama Hatası:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setSifirlaniyor(false);
      }
    } else {
      setSifirlaniyor(false);
    }
  };

  const testVerisiUret = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setYukleniyor(true);
    const aktifUid = uid || auth.currentUser?.uid;
    if (!aktifUid) return;

    const markalar = [
      { ad: "Migros", kat: "Market" },
      { ad: "BİM", kat: "Market" },
      { ad: "A101", kat: "Market" },
      { ad: "Starbucks", kat: "Kafe" },
      { ad: "Trendyol", kat: "Alışveriş" },
      { ad: "MediaMarkt", kat: "Teknoloji" },
      { ad: "Netflix", kat: "Abonelik" },
      { ad: "Getir", kat: "Market" },
    ];

    const urunKatalogu = [
      { ad: "Süt 1L", kat: "Temel Gıda" },
      { ad: "Ekmek", kat: "Temel Gıda" },
      { ad: "Domates 1kg", kat: "Sebze/Meyve" },
      { ad: "Elma", kat: "Sebze/Meyve" },
      { ad: "Filtre Kahve", kat: "Kafe/Restoran" },
      { ad: "Cips", kat: "Atıştırmalık/İçecek" },
      { ad: "Çikolata", kat: "Atıştırmalık/İçecek" },
      { ad: "Deterjan", kat: "Temizlik" },
      { ad: "Şampuan", kat: "Kozmetik/Kişisel" },
      { ad: "Tişört", kat: "Giyim" },
      { ad: "Kulaklık", kat: "Teknoloji" },
      { ad: "Aylık Üyelik", kat: "Abonelik" },
    ];

    try {
      for (let i = 0; i < 30; i++) {
        const randomMarka =
          markalar[Math.floor(Math.random() * markalar.length)];

        const rastgeleGunCarpani = Math.floor(Math.random() * 90);
        const date = new Date(
          new Date().getTime() - rastgeleGunCarpani * 24 * 60 * 60 * 1000,
        );
        const formatliTarih = `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;

        let toplam = 0;
        const urunlerToInsert = [];
        const urunSayisi = Math.floor(Math.random() * 4) + 1;

        for (let j = 0; j < urunSayisi; j++) {
          const fiyat =
            Math.floor(Math.random() * 200) +
            20 +
            Math.floor(Math.random() * 99) / 100;
          toplam += fiyat;

          const secilenUrun =
            urunKatalogu[Math.floor(Math.random() * urunKatalogu.length)];

          urunlerToInsert.push({
            urun_adi: secilenUrun.ad,
            fiyat: fiyat,
            kategori: secilenUrun.kat,
            kullanici_id: aktifUid,
          });
        }

        const fisRef = await addDoc(collection(db, "Fisler"), {
          kullanici_id: aktifUid,
          magaza_adi: randomMarka.ad,
          tarih: formatliTarih,
          kategori: randomMarka.kat,
          toplam_tutar: Number(toplam.toFixed(2)),
          olusturulma_tarihi: new Date(),
        });

        for (const u of urunlerToInsert) {
          await addDoc(collection(db, "Urunler"), {
            fis_id: fisRef.id,
            ...u,
          });
        }
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Başarılı!",
        "3 aylık detaylı ürün kategorili test fişleri eklendi! Analiz sayfasına koş!",
      );
      istatistikleriGetir();
    } catch (error) {
      console.error("Test verisi eklenirken hata:", error);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <View style={styles.anaEkran}>
      {yukleniyor ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#1DB954" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View style={styles.headerKapsayici}>
            <Text style={styles.ustBaslik}>HESABIM</Text>
            <Text style={styles.sayfaBaslik}>Profil</Text>
          </View>

          <TouchableOpacity
            style={styles.isimKartiZemin}
            activeOpacity={0.8}
            onPress={() => router.push("/isimmodal")}
          >
            <LinearGradient
              colors={["rgba(29, 185, 84, 0.10)", "rgba(29, 185, 84, 0.04)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.isimKartiIc}
            >
              <LinearGradient
                colors={["#1DB954", "#15A344"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarKutu}
              >
                <Text style={styles.avatarHarf}>
                  {isim ? isim.charAt(0).toUpperCase() : "M"}
                </Text>
              </LinearGradient>
              <View style={styles.isimBilgiAlani}>
                <Text style={styles.kullaniciIsmi}>{isim}</Text>
                <Ionicons
                  name="create-outline"
                  size={20}
                  color="rgba(255, 255, 255, 0.45)"
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.butceKartiZemin}
            activeOpacity={0.8}
            onPress={() => router.push("/butcemodal")}
          >
            <View style={styles.butceBilgiAlani}>
              <Text style={styles.butceBaslik}>AYLIK BÜTÇE</Text>
              <Text style={styles.butceDeger}>
                {butce} <Text style={styles.butceParaBirimi}>TL</Text>
              </Text>
            </View>
            <Ionicons name="create-outline" size={24} color="#1DB954" />
          </TouchableOpacity>

          <View style={styles.istatistikKapsayici}>
            <View style={styles.istatistikKutusu}>
              <Text style={styles.istatistikDeger}>{toplamFisSayisi}</Text>
              <Text style={styles.istatistikEtiket}>Toplam Fiş</Text>
            </View>
            <View style={styles.istatistikKutusu}>
              <Text style={styles.istatistikDeger}>{buAyEklenenFisSayisi}</Text>
              <Text style={styles.istatistikEtiket}>Bu Ay</Text>
            </View>
            <View style={styles.istatistikKutusu}>
              <Text style={styles.istatistikDeger}>{tasarrufMiktari} TL</Text>
              <Text style={styles.istatistikEtiket}>Tasarruf</Text>
            </View>
          </View>

          <View style={styles.menuKapsayici}>
            <Text style={styles.menuBaslik}>AYARLAR</Text>
            <View style={styles.menuListeKutu}>
              <View style={styles.menuOgesi}>
                <View
                  style={[
                    styles.menuIkonZemin,
                    {
                      backgroundColor: "rgba(236, 72, 153, 0.12)",
                      borderColor: "rgba(236, 72, 153, 0.20)",
                    },
                  ]}
                >
                  <Ionicons
                    name="phone-portrait-outline"
                    size={16}
                    color="#EC4899"
                  />
                </View>
                <Text style={styles.menuOgeMetin}>Uygulama Versiyonu</Text>
                <Text style={styles.menuSagBilgi}>1.0.0</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.sifirlaButon}
            activeOpacity={0.7}
            onPress={() => {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning,
              );
              setSifirlaModalAcik(true);
            }}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color="rgba(239, 68, 68, 0.80)"
            />
            <Text style={styles.sifirlaMetin}>Tüm Verileri Sıfırla</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sifirlaButon,
              {
                borderColor: "rgba(59, 130, 246, 0.3)",
                backgroundColor: "rgba(59, 130, 246, 0.08)",
                marginTop: 12,
              },
            ]}
            activeOpacity={0.7}
            onPress={testVerisiUret}
          >
            <Ionicons name="flask-outline" size={18} color="#3B82F6" />
            <Text style={[styles.sifirlaMetin, { color: "#3B82F6" }]}>
              Test Verisi Yükle (3 Aylık)
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* SIFIRLAMA ONAY MODALI */}
      <Modal visible={sifirlaModalAcik} transparent={true} animationType="fade">
        <View style={styles.modalArkaPlan}>
          <View style={styles.modalKutu}>
            <View style={styles.modalIkonZemin}>
              <Ionicons name="warning" size={32} color="#FF6B6B" />
            </View>
            <Text style={styles.modalBaslik}>Emin misin?</Text>
            <Text style={styles.modalMesaj}>
              Tüm fişlerin, harcama geçmişin ve kayıtlı ürünlerin tamamen
              silinecek. Bu işlem geri alınamaz.
            </Text>

            <View style={styles.modalButonKapsayici}>
              <TouchableOpacity
                style={styles.modalIptalButon}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSifirlaModalAcik(false);
                }}
                disabled={sifirlaniyor}
              >
                <Text style={styles.modalIptalMetin}>İptal Et</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOnayButon}
                onPress={gercektenSifirla}
                disabled={sifirlaniyor}
              >
                {sifirlaniyor ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.modalOnayMetin}>Evet, Sil</Text>
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
  anaEkran: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerKapsayici: { marginBottom: 24 },
  ustBaslik: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 11,
    fontWeight: "400",
    letterSpacing: 1,
    marginBottom: 4,
  },
  sayfaBaslik: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 33,
  },
  isimKartiZemin: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.20)",
  },
  isimKartiIc: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  avatarKutu: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1DB954",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarHarf: { color: "white", fontSize: 24, fontWeight: "900" },
  isimBilgiAlani: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  kullaniciIsmi: { color: "white", fontSize: 22, fontWeight: "900" },
  butceKartiZemin: {
    backgroundColor: "#18181B",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  butceBilgiAlani: { gap: 6 },
  butceBaslik: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  butceDeger: { color: "white", fontSize: 24, fontWeight: "900" },
  butceParaBirimi: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: 16,
    fontWeight: "600",
  },
  istatistikKapsayici: { flexDirection: "row", gap: 12, marginBottom: 30 },
  istatistikKutusu: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  istatistikDeger: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  istatistikEtiket: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 10,
    fontWeight: "400",
  },
  menuKapsayici: { marginBottom: 30 },
  menuBaslik: {
    color: "rgba(255, 255, 255, 0.35)",
    fontSize: 11,
    fontWeight: "400",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  menuListeKutu: {
    backgroundColor: "rgba(39, 39, 42, 0.70)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    overflow: "hidden",
  },
  menuOgesi: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIkonZemin: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuOgeMetin: { flex: 1, color: "white", fontSize: 14, fontWeight: "500" },
  menuSagBilgi: {
    color: "rgba(255, 255, 255, 0.35)",
    fontSize: 12,
    fontWeight: "500",
  },
  sifirlaButon: {
    flexDirection: "row",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.20)",
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  sifirlaMetin: {
    color: "rgba(239, 68, 68, 0.80)",
    fontSize: 14,
    fontWeight: "600",
  },
  modalArkaPlan: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalKutu: {
    width: "100%",
    backgroundColor: "#18181B",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.25)",
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIkonZemin: {
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
  modalBaslik: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  modalMesaj: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  modalButonKapsayici: { flexDirection: "row", gap: 12, width: "100%" },
  modalIptalButon: {
    flex: 1,
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  modalIptalMetin: { color: "white", fontSize: 15, fontWeight: "600" },
  modalOnayButon: {
    flex: 1,
    height: 50,
    backgroundColor: "#E53935",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOnayMetin: { color: "white", fontSize: 15, fontWeight: "700" },
});
