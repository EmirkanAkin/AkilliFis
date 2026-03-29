import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { auth, db } from "../../firebaseConfig";
import { useStore } from "../../store/useStore";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Kategori Renkleri
const KATEGORI_RENKLERI: any = {
  Gıda: "#4CAF50",
  Temizlik: "#2196F3",
  Giyim: "#E91E63",
  Eğlence: "#FF9800",
  Diğer: "#9C27B0",
};

export default function AnalizScreen() {
  const circumference = 2 * Math.PI * 70;
  const animValue = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  const { isim, uid } = useStore();

  const [yukleniyor, setYukleniyor] = useState(true);
  const [harcamalar, setHarcamalar] = useState<any[]>([]);
  const [toplamHarcama, setToplamHarcama] = useState(0);
  const [seciliBar, setSeciliBar] = useState<number | null>(null);
  const [segments, setSegments] = useState<any[]>([]);

  const veriGetir = async () => {
    const aktifUid = uid || auth.currentUser?.uid;
    if (!aktifUid) {
      setYukleniyor(false);
      return;
    }

    try {
      const fislerRef = collection(db, "Fisler");
      const qFis = query(fislerRef, where("kullanici_id", "==", aktifUid));
      const fislerSnap = await getDocs(qFis);
      setHarcamalar(fislerSnap.docs);

      if (fislerSnap.empty) {
        setYukleniyor(false);
        return;
      }

      const urunlerRef = collection(db, "Urunler");
      const qUrun = query(urunlerRef, where("kullanici_id", "==", aktifUid));
      const urunlerSnap = await getDocs(qUrun);

      let genelToplam = 0;
      const kategoriToplami: any = {};

      urunlerSnap.forEach((doc) => {
        const data = doc.data();
        const fiyat = Number(data.fiyat) || 0;
        const kategori = data.kategori || "Diğer";

        genelToplam += fiyat;

        if (!kategoriToplami[kategori]) {
          kategoriToplami[kategori] = 0;
        }
        kategoriToplami[kategori] += fiyat;
      });

      setToplamHarcama(genelToplam);

      const dinamikSegments = Object.keys(kategoriToplami).map((katAd) => {
        const tutar = kategoriToplami[katAd];
        const percent = genelToplam > 0 ? tutar / genelToplam : 0;
        return {
          ad: katAd,
          tutar: tutar.toFixed(2),
          percent: percent,
          color: KATEGORI_RENKLERI[katAd] || "#9C27B0",
        };
      });

      dinamikSegments.sort((a, b) => b.percent - a.percent);
      setSegments(dinamikSegments);
    } catch (error) {
      console.error("Analiz verisi çekilemedi:", error);
    } finally {
      setYukleniyor(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      setYukleniyor(true);
      veriGetir().then(() => {
        animValue.setValue(0);
        Animated.timing(animValue, {
          toValue: -circumference,
          duration: 1500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start();
      });
    }, [circumference]),
  );

  const haftalikVeriler = [
    { gun: "Pzt", h: "45%", tutar: "210" },
    { gun: "Sal", h: "60%", tutar: "340" },
    { gun: "Çar", h: "35%", tutar: "290" },
    { gun: "Per", h: "80%", tutar: "480" },
    { gun: "Cum", h: "55%", tutar: "310" },
    { gun: "Cmt", h: "90%", tutar: "520" },
    { gun: "Paz", h: "50%", tutar: "280" },
  ];

  if (yukleniyor) {
    return (
      <View
        style={[
          styles.anaEkran,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  // 1. BOŞ EKRAN
  if (harcamalar.length === 0) {
    return (
      <ScrollView
        ref={scrollRef}
        style={styles.anaEkran}
        contentContainerStyle={styles.scrollIcerikBos}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerKapsayici}>
          <Text style={styles.ustBaslik}>ANALİZ</Text>
          <Text style={styles.sayfaBaslik}>İstatistikler</Text>
        </View>

        <View style={styles.ortaIcerikBos}>
          <View style={styles.merkezGrafikKapsayici}>
            <View style={styles.daireDis}>
              <View style={styles.daireIc}>
                <View style={styles.daireMerkez}>
                  <Ionicons
                    name="pie-chart-outline"
                    size={32}
                    color="rgba(255,255,255,0.15)"
                  />
                </View>
              </View>
              <View style={[styles.ucusanIkon, { top: -10, right: 10 }]}>
                <Ionicons
                  name="trending-up"
                  size={18}
                  color="rgba(255,255,255,0.2)"
                />
              </View>
              <View style={[styles.ucusanIkon, { bottom: 10, left: 10 }]}>
                <Ionicons
                  name="bar-chart-outline"
                  size={18}
                  color="rgba(255,255,255,0.2)"
                />
              </View>
            </View>
          </View>

          <View style={styles.mesajKapsayiciBos}>
            <Text style={styles.baslikMetniBos}>
              Analiz için yeterli veri yok
            </Text>
            <Text style={styles.aciklamaMetniBos}>
              En az bir fiş taradıktan sonra grafikler burada görünecek
            </Text>
          </View>

          <View style={styles.kartlarKapsayiciBos}>
            <View style={styles.bilgiKartiBos}>
              <View style={styles.ikonZeminBos}>
                <Ionicons name="pie-chart" size={20} color="#1DB954" />
              </View>
              <View>
                <Text style={styles.kartBaslikBos}>Kategori Dağılımı</Text>
                <Text style={styles.kartAltBos}>
                  Harcamalarını kategorilere göre gör
                </Text>
              </View>
            </View>
            <View style={styles.bilgiKartiBos}>
              <View style={styles.ikonZeminBos}>
                <Ionicons name="stats-chart" size={20} color="#1DB954" />
              </View>
              <View>
                <Text style={styles.kartBaslikBos}>Harcama Trendleri</Text>
                <Text style={styles.kartAltBos}>
                  Günlük, aylık ve yıllık analiz
                </Text>
              </View>
            </View>
            <View style={styles.bilgiKartiBos}>
              <View style={styles.ikonZeminBos}>
                <Ionicons name="document-text" size={20} color="#1DB954" />
              </View>
              <View>
                <Text style={styles.kartBaslikBos}>Detaylı Raporlar</Text>
                <Text style={styles.kartAltBos}>
                  Tasarruf önerileri ve içgörüler
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.ipucuKutusuBos}>
            <Text style={styles.ipucuMetniBos}>
              💡 İlk fişini tarayarak analizleri aktifleştir
            </Text>
          </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    );
  }

  // 2. DOLU EKRAN (ÇARK HESAPLAMALARI)
  let currentOffset = 0;
  const pieData = segments.map((seg) => {
    const length = (seg.percent || 0) * circumference;
    const offset = currentOffset;
    currentOffset += length;
    return { ...seg, length, offset: -offset };
  });

  const KategoriBar = ({ color, title, amount, percent }: any) => (
    <View style={styles.kategoriBarKapsayici}>
      <View style={styles.kategoriBarUst}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              backgroundColor: color,
            }}
          />
          <Text style={styles.kategoriBarIsim}>{title}</Text>
        </View>
        <Text style={styles.kategoriBarTutar}>
          {amount.replace(".", ",")} TL
        </Text>
      </View>
      <View style={styles.kategoriBarZemin}>
        <View
          style={[
            styles.kategoriBarDolgu,
            { backgroundColor: color, width: percent },
          ]}
        />
      </View>
    </View>
  );

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.anaEkran}
      contentContainerStyle={{ paddingTop: 60 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerKapsayici}>
        <Text style={styles.ustBaslik}>ANALİZ</Text>
        <Text style={styles.sayfaBaslik}>
          Harika Gidiyorsun,{"\n"}
          <Text style={styles.isimVurgu}>{isim}! 🎉</Text>
        </Text>
      </View>

      {/* DÜZELTİLDİ: ORİJİNAL KUPA KARTIN GERİ GELDİ */}
      <LinearGradient
        colors={["rgba(29, 185, 84, 0.12)", "rgba(29, 185, 84, 0.06)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.kupaKarti}
      >
        <Text style={styles.kupaIkon}>🏆</Text>
        <View style={styles.kupaMetinAlani}>
          <Text style={styles.kupaBaslik}>Bu ay %23 daha az harcadın!</Text>
          <Text style={styles.kupaAltMetin}>
            Geçen aya kıyasla 1.040 TL tasarruf
          </Text>
        </View>
        <Ionicons name="trending-up" size={18} color="#1DB954" />
      </LinearGradient>

      <View style={styles.zamanSekmeleri}>
        <TouchableOpacity style={styles.sekmeInaktif}>
          <Text style={styles.sekmeMetinInaktif}>BU HAFTA</Text>
        </TouchableOpacity>
        {/* DÜZELTİLDİ: "TÜMÜ" YAZISI "BU AY" OLARAK DEĞİŞTİ */}
        <View style={styles.sekmeAktif}>
          <Text style={styles.sekmeMetinAktif}>BU AY</Text>
        </View>
        <TouchableOpacity style={styles.sekmeInaktif}>
          <Text style={styles.sekmeMetinInaktif}>BU YIL</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.kartKapsayici}>
        <View style={styles.kartHeader}>
          <View>
            <Text style={styles.kartUstBaslik}>TOPLAM HARCAMA</Text>
            <Text style={styles.kartBuyukTutar}>
              {toplamHarcama.toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              TL
            </Text>
          </View>
          <View style={styles.yuzdeRozeti}>
            <Ionicons name="trending-down" size={12} color="#1DB954" />
            <Text style={styles.yuzdeRozetMetni}>-23%</Text>
          </View>
        </View>

        {/* DÜZELTİLDİ: ÇARK GERİ GELDİ VE HATASIZ ÇALIŞIYOR */}
        <View style={styles.grafikAlani}>
          <Svg width="200" height="200" viewBox="0 0 200 200">
            <G rotation="-90" origin="100, 100">
              {pieData.map((seg, index) => (
                <Circle
                  key={index}
                  cx="100"
                  cy="100"
                  r="70"
                  stroke={seg.color}
                  strokeWidth="28"
                  fill="none"
                  strokeDasharray={`${seg.length} ${circumference}`}
                  strokeDashoffset={seg.offset}
                />
              ))}
              <AnimatedCircle
                cx="100"
                cy="100"
                r="70"
                stroke="#18181B"
                strokeWidth="30"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={animValue}
              />
            </G>
          </Svg>
          <View style={styles.pieMerkez}>
            <Text style={styles.pieMerkezUst}>TOPLAM</Text>
            <Text style={[styles.pieMerkezMiktar, { fontSize: 16 }]}>
              {Math.floor(toplamHarcama)}
            </Text>
            <Text style={styles.pieMerkezTL}>TL</Text>
          </View>
        </View>

        <View style={styles.legendKapsayici}>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 16,
              justifyContent: "center",
            }}
          >
            {segments.map((seg, i) => (
              <View key={i} style={styles.legendOge}>
                <View style={[styles.nokta, { backgroundColor: seg.color }]} />
                <Text style={styles.legendMetin}>
                  {seg.ad} ({Math.round(seg.percent * 100)}%)
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.kartKapsayici}>
        <Text style={styles.kartBaslikKucuk}>KATEGORİ DAĞILIMI</Text>
        <View style={{ marginTop: 12, gap: 12 }}>
          {segments.map((s, i) => (
            <KategoriBar
              key={i}
              color={s.color}
              title={s.ad}
              amount={s.tutar}
              percent={`${s.percent * 100 || 0}%`}
            />
          ))}
        </View>
      </View>

      <View style={[styles.kartKapsayici, { marginBottom: 40 }]}>
        <Text style={styles.kartBaslikKucuk}>GÜNLÜK HARCAMALAR</Text>
        <View style={styles.barChartKapsayici}>
          {haftalikVeriler.map((item, index) => {
            const isSelected = seciliBar === index;
            return (
              <Pressable
                key={index}
                onPress={() => setSeciliBar(isSelected ? null : index)}
                style={[
                  styles.barSutun,
                  isSelected && styles.barSutunSecili,
                  { zIndex: isSelected ? 10 : 1 },
                ]}
              >
                {isSelected && (
                  <View style={styles.tooltipKutu}>
                    <Text style={styles.tooltipMetin}>{item.tutar} TL</Text>
                  </View>
                )}
                <View style={styles.barAlan}>
                  <View style={[styles.barDolgu, { height: item.h as any }]} />
                </View>
                <Text style={styles.barGun}>{item.gun}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  anaEkran: { flex: 1, backgroundColor: "#0A0A0A", paddingHorizontal: 20 },
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
    lineHeight: 28,
  },
  isimVurgu: { color: "#1DB954" },
  scrollIcerikBos: { paddingHorizontal: 20, paddingTop: 60 },
  ortaIcerikBos: { flex: 1, alignItems: "center" },
  merkezGrafikKapsayici: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  daireDis: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  daireIc: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.02)",
    justifyContent: "center",
    alignItems: "center",
  },
  daireMerkez: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  ucusanIkon: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  mesajKapsayiciBos: { alignItems: "center", gap: 12, marginBottom: 32 },
  baslikMetniBos: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  aciklamaMetniBos: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 22,
  },
  kartlarKapsayiciBos: { width: "100%", gap: 12, marginBottom: 32 },
  bilgiKartiBos: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  ikonZeminBos: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(29, 185, 84, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  kartBaslikBos: { color: "white", fontSize: 14, fontWeight: "600" },
  kartAltBos: {
    color: "rgba(255, 255, 255, 0.35)",
    fontSize: 11,
    marginTop: 2,
  },
  ipucuKutusuBos: {
    width: "100%",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(29, 185, 84, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.15)",
    alignItems: "center",
  },
  ipucuMetniBos: { color: "rgba(255, 255, 255, 0.5)", fontSize: 12 },
  kupaKarti: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.20)",
    marginBottom: 20,
  },
  kupaIkon: { fontSize: 24, marginRight: 12 },
  kupaMetinAlani: { flex: 1 },
  kupaBaslik: { color: "white", fontSize: 13, fontWeight: "600" },
  kupaAltMetin: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 11,
    marginTop: 2,
  },
  zamanSekmeleri: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 14,
    padding: 3,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  sekmeInaktif: {
    flex: 1,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  sekmeAktif: {
    flex: 1,
    height: 40,
    backgroundColor: "#1DB954",
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#1DB954",
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  sekmeMetinInaktif: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 10,
    fontWeight: "500",
  },
  sekmeMetinAktif: { color: "white", fontSize: 10, fontWeight: "700" },
  kartKapsayici: {
    backgroundColor: "#18181B",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    padding: 20,
    marginBottom: 20,
  },
  kartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  kartUstBaslik: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 10,
    letterSpacing: 1,
  },
  kartBuyukTutar: { color: "white", fontSize: 22, fontWeight: "800" },
  yuzdeRozeti: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(29, 185, 84, 0.10)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  yuzdeRozetMetni: { color: "#1DB954", fontSize: 12, fontWeight: "600" },
  grafikAlani: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    height: 200,
  },
  pieMerkez: { position: "absolute", alignItems: "center" },
  pieMerkezUst: { color: "rgba(255, 255, 255, 0.40)", fontSize: 11 },
  pieMerkezMiktar: { color: "white", fontSize: 17, fontWeight: "800" },
  pieMerkezTL: { color: "#1DB954", fontSize: 11, fontWeight: "600" },
  legendKapsayici: { gap: 10, marginTop: 10 },
  legendSatir: { flexDirection: "row", gap: 16 },
  legendOge: { flexDirection: "row", alignItems: "center", gap: 6 },
  nokta: { width: 8, height: 8, borderRadius: 2 },
  legendMetin: { color: "rgba(255, 255, 255, 0.55)", fontSize: 11 },
  kartBaslikKucuk: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 12,
    letterSpacing: 1,
  },
  kategoriBarKapsayici: { gap: 6 },
  kategoriBarUst: { flexDirection: "row", justifyContent: "space-between" },
  kategoriBarIsim: { color: "rgba(255, 255, 255, 0.70)", fontSize: 12 },
  kategoriBarTutar: { color: "white", fontSize: 12, fontWeight: "600" },
  kategoriBarZemin: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 2,
  },
  kategoriBarDolgu: { height: "100%", borderRadius: 2 },
  barChartKapsayici: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
    marginTop: 20,
  },
  barSutun: {
    alignItems: "center",
    width: 40,
    height: 120,
    justifyContent: "flex-end",
    paddingBottom: 6,
    borderRadius: 8,
  },
  barSutunSecili: { backgroundColor: "rgba(255, 255, 255, 0.05)" },
  barAlan: {
    height: 80,
    width: 20,
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  barDolgu: {
    width: "100%",
    backgroundColor: "#1DB954",
    borderRadius: 4,
    opacity: 0.85,
  },
  barGun: { color: "rgba(255, 255, 255, 0.40)", fontSize: 11 },
  tooltipKutu: {
    position: "absolute",
    top: -15,
    left: 15,
    backgroundColor: "rgba(39, 39, 42, 0.95)",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    width: 65,
    elevation: 6,
  },
  tooltipMetin: { color: "white", fontSize: 11, fontWeight: "700" },
});
