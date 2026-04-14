import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { useStore } from "../../store/useStore";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const KATEGORI_RENGI: any = {
  "Sebze/Meyve": "#1DB954",
  Temizlik: "#3B82F6",
  "Atıştırmalık/İçecek": "#F59E0B",
  "Temel Gıda": "#4CAF50",
  "Kafe/Restoran": "#EF4444",
  "Kozmetik/Kişisel": "#EC4899",
  Teknoloji: "#D62828",
  Giyim: "#E91E63",
  Abonelik: "#5D00D2",
  Diğer: "#8B5CF6",
  Market: "#1DB954",
  Kafe: "#00704A",
  Alışveriş: "#FF6000",
  Sağlık: "#2196F3",
  Eğlence: "#FF9800",
};

const parseTarih = (tarihStr: string) => {
  if (!tarihStr) return new Date();
  const parts = tarihStr.split(".");
  if (parts.length === 3) {
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }
  return new Date();
};

export default function AnalizScreen() {
  const circumference = 2 * Math.PI * 70;
  const animValue = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  const { isim, tumFisler, tumUrunler, isFislerLoaded } = useStore();

  const [aktifSekme, setAktifSekme] = useState<"BU HAFTA" | "BU AY" | "BU YIL">(
    "BU AY",
  );
  const [toplamHarcama, setToplamHarcama] = useState(0);
  const [seciliBar, setSeciliBar] = useState<number | null>(null);
  const [segments, setSegments] = useState<any[]>([]);
  const [kupaData, setKupaData] = useState({ durum: "yok", yuzde: 0, fark: 0 });
  const [barGrafik, setBarGrafik] = useState<
    { gun: string; h: string; tutar: string }[]
  >([]);

  useEffect(() => {
    if (tumFisler.length === 0) return;

    const bugun = new Date();
    const buAy = bugun.getMonth();
    const buYil = bugun.getFullYear();

    const haftaninBasi = new Date(bugun);
    const gunOffset = haftaninBasi.getDay() || 7;
    haftaninBasi.setDate(haftaninBasi.getDate() - gunOffset + 1);
    haftaninBasi.setHours(0, 0, 0, 0);

    const buAyToplami = tumFisler
      .filter((f) => {
        const d = parseTarih(f.tarih);
        return d.getMonth() === buAy && d.getFullYear() === buYil;
      })
      .reduce((acc, f) => acc + (Number(f.toplam_tutar) || 0), 0);

    const gecenAyToplami = tumFisler
      .filter((f) => {
        const d = parseTarih(f.tarih);
        const targetAy = buAy === 0 ? 11 : buAy - 1;
        const targetYil = buAy === 0 ? buYil - 1 : buYil;
        return d.getMonth() === targetAy && d.getFullYear() === targetYil;
      })
      .reduce((acc, f) => acc + (Number(f.toplam_tutar) || 0), 0);

    if (gecenAyToplami === 0) {
      setKupaData({ durum: "yok", yuzde: 0, fark: 0 });
    } else {
      const farkTutar = buAyToplami - gecenAyToplami;
      const yuzde = Math.abs((farkTutar / gecenAyToplami) * 100);
      if (farkTutar > 0)
        setKupaData({
          durum: "fazla",
          yuzde: Math.round(yuzde),
          fark: Math.abs(farkTutar),
        });
      else if (farkTutar < 0)
        setKupaData({
          durum: "az",
          yuzde: Math.round(yuzde),
          fark: Math.abs(farkTutar),
        });
      else setKupaData({ durum: "esit", yuzde: 0, fark: 0 });
    }

    const buHaftaFisleri = tumFisler.filter(
      (f) => parseTarih(f.tarih) >= haftaninBasi,
    );
    const gunler = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
    const gunlukToplamlar = [0, 0, 0, 0, 0, 0, 0];

    buHaftaFisleri.forEach((f) => {
      let g = parseTarih(f.tarih).getDay();
      g = g === 0 ? 6 : g - 1;
      gunlukToplamlar[g] += Number(f.toplam_tutar) || 0;
    });

    const maxValBar = Math.max(...gunlukToplamlar, 1);
    const barVerileri = gunler.map((g, i) => ({
      gun: g,
      tutar: gunlukToplamlar[i].toLocaleString("tr-TR", {
        minimumFractionDigits: 2,
      }),
      h: `${Math.max((gunlukToplamlar[i] / maxValBar) * 100, 10)}%`,
    }));
    setBarGrafik(barVerileri);

    let seciliFisler: any[] = [];
    if (aktifSekme === "BU HAFTA") {
      seciliFisler = buHaftaFisleri;
    } else if (aktifSekme === "BU AY") {
      seciliFisler = tumFisler.filter((f) => {
        const d = parseTarih(f.tarih);
        return d.getMonth() === buAy && d.getFullYear() === buYil;
      });
    } else if (aktifSekme === "BU YIL") {
      seciliFisler = tumFisler.filter(
        (f) => parseTarih(f.tarih).getFullYear() === buYil,
      );
    }

    const anaToplamHarcama = seciliFisler.reduce(
      (acc, f) => acc + (Number(f.toplam_tutar) || 0),
      0,
    );
    setToplamHarcama(anaToplamHarcama);

    const gecerliFisIdler = seciliFisler.map((f) => f.id);
    const seciliUrunler = tumUrunler.filter((u) =>
      gecerliFisIdler.includes(u.fis_id),
    );

    let genelToplam = 0;
    const kategoriToplami: any = {};

    seciliUrunler.forEach((u) => {
      const tutar = Number(u.fiyat) || 0;
      const kategori = u.kategori || "Diğer";
      genelToplam += tutar;
      kategoriToplami[kategori] = (kategoriToplami[kategori] || 0) + tutar;
    });

    const dinamikSegments = Object.keys(kategoriToplami).map((katAd) => {
      const tutar = kategoriToplami[katAd];
      const percent = genelToplam > 0 ? tutar / genelToplam : 0;
      return {
        ad: katAd,
        tutar: tutar.toLocaleString("tr-TR", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }),
        percent: percent,
        color: KATEGORI_RENGI[katAd] || "#8B5CF6",
      };
    });

    dinamikSegments.sort((a, b) => b.percent - a.percent);
    setSegments(dinamikSegments);

    animValue.setValue(0);
    Animated.timing(animValue, {
      toValue: -circumference,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [tumFisler, tumUrunler, aktifSekme]);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  const sekmeDegistir = (sekme: "BU HAFTA" | "BU AY" | "BU YIL") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAktifSekme(sekme);
    setSeciliBar(null);
  };

  if (!isFislerLoaded) {
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

  if (tumFisler.length === 0) {
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
        </View>
      </ScrollView>
    );
  }

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
        <Text style={styles.kategoriBarTutar}>{amount} TL</Text>
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

      {kupaData.durum !== "yok" && (
        <LinearGradient
          colors={
            kupaData.durum === "az"
              ? ["rgba(29, 185, 84, 0.12)", "rgba(29, 185, 84, 0.06)"]
              : ["rgba(255, 107, 107, 0.12)", "rgba(255, 107, 107, 0.06)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.kupaKarti,
            {
              borderColor:
                kupaData.durum === "az"
                  ? "rgba(29, 185, 84, 0.20)"
                  : "rgba(255, 107, 107, 0.20)",
            },
          ]}
        >
          <Text style={styles.kupaIkon}>
            {kupaData.durum === "az" ? "🏆" : "⚠️"}
          </Text>
          <View style={styles.kupaMetinAlani}>
            <Text style={styles.kupaBaslik}>
              Geçen aya göre %{kupaData.yuzde} daha{" "}
              {kupaData.durum === "az" ? "az" : "fazla"} harcadın!
            </Text>
            <Text style={styles.kupaAltMetin}>
              {kupaData.fark.toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
              })}{" "}
              TL{" "}
              {kupaData.durum === "az" ? "tasarruf ettin" : "fazladan harcadın"}
            </Text>
          </View>
          <Ionicons
            name={kupaData.durum === "az" ? "trending-down" : "trending-up"}
            size={18}
            color={kupaData.durum === "az" ? "#1DB954" : "#FF6B6B"}
          />
        </LinearGradient>
      )}

      <View style={styles.zamanSekmeleri}>
        {(["BU HAFTA", "BU AY", "BU YIL"] as const).map((sekme) => (
          <TouchableOpacity
            key={sekme}
            style={
              aktifSekme === sekme ? styles.sekmeAktif : styles.sekmeInaktif
            }
            onPress={() => sekmeDegistir(sekme)}
            activeOpacity={0.7}
          >
            <Text
              style={
                aktifSekme === sekme
                  ? styles.sekmeMetinAktif
                  : styles.sekmeMetinInaktif
              }
            >
              {sekme}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.kartKapsayici}>
        <View style={styles.kartHeader}>
          <View>
            <Text style={styles.kartUstBaslik}>TOPLAM HARCAMA</Text>
            <Text style={styles.kartBuyukTutar}>
              {toplamHarcama.toLocaleString("tr-TR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}{" "}
              TL
            </Text>
          </View>
        </View>

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
            <Text style={styles.pieMerkezMiktar}>
              {Math.floor(toplamHarcama).toLocaleString("tr-TR")}
            </Text>
            <Text style={styles.pieMerkezTL}>TL</Text>
          </View>
        </View>

        <View style={styles.legendKapsayici}>
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

      <View style={styles.kartKapsayici}>
        <Text style={styles.kartBaslikKucuk}>KATEGORİ DAĞILIMI</Text>
        <View style={{ marginTop: 12, gap: 12 }}>
          {segments.length > 0 ? (
            segments.map((s, i) => (
              <KategoriBar
                key={i}
                color={s.color}
                title={s.ad}
                amount={s.tutar}
                percent={`${s.percent * 100 || 0}%`}
              />
            ))
          ) : (
            <Text
              style={{
                color: "rgba(255,255,255,0.4)",
                textAlign: "center",
                marginVertical: 10,
              }}
            >
              Bu dönemde harcama yok.
            </Text>
          )}
        </View>
      </View>

      <View style={[styles.kartKapsayici, { marginBottom: 40 }]}>
        <Text style={styles.kartBaslikKucuk}>GÜNLÜK HARCAMALAR</Text>
        <View style={styles.barChartKapsayici}>
          {barGrafik.map((item, index) => {
            const isSelected = seciliBar === index;
            return (
              <Pressable
                key={index}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSeciliBar(isSelected ? null : index);
                }}
                style={[
                  styles.barSutun,
                  isSelected && styles.barSutunSecili,
                  { zIndex: isSelected ? 10 : 1, flex: 1 },
                ]}
              >
                {isSelected && (
                  <View style={styles.tooltipKutu}>
                    <Text style={styles.tooltipMetin}>{item.tutar} ₺</Text>
                  </View>
                )}
                <View style={styles.barAlan}>
                  <View style={[styles.barDolgu, { height: item.h as any }]} />
                </View>
                <Text style={styles.barGun} numberOfLines={1}>
                  {item.gun}
                </Text>
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
  anaEkran: { flex: 1, backgroundColor: "#121212", paddingHorizontal: 20 },
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
    lineHeight: 26.4,
  },
  isimVurgu: { color: "#1DB954" },

  // 🚀 BURASI DEĞİŞTİ: flexGrow ve justifyContent eklendi
  scrollIcerikBos: { flexGrow: 1, paddingTop: 60, paddingBottom: 40 },
  ortaIcerikBos: { flex: 1, alignItems: "center", justifyContent: "center" },

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
  kupaKarti: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
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
    backgroundColor: "rgba(39, 39, 42, 0.70)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    padding: 21,
    marginBottom: 12,
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
  kartBuyukTutar: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },
  yuzdeRozeti: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.20)",
  },
  yuzdeRozetMetni: { fontSize: 12, fontWeight: "600" },
  grafikAlani: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    height: 180,
  },
  pieMerkez: { position: "absolute", alignItems: "center" },
  pieMerkezUst: { color: "rgba(255, 255, 255, 0.40)", fontSize: 11 },
  pieMerkezMiktar: { color: "white", fontSize: 17, fontWeight: "800" },
  pieMerkezTL: { color: "#1DB954", fontSize: 11, fontWeight: "600" },
  legendKapsayici: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    marginTop: 10,
  },
  legendOge: { flexDirection: "row", alignItems: "center", gap: 6 },
  nokta: { width: 8, height: 8, borderRadius: 2 },
  legendMetin: { color: "rgba(255, 255, 255, 0.55)", fontSize: 11 },
  kartBaslikKucuk: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 12,
    letterSpacing: 1,
  },
  kategoriBarKapsayici: { gap: 4 },
  kategoriBarUst: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 18,
  },
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
    height: 110,
    marginTop: 16,
  },
  barSutun: {
    alignItems: "center",
    height: 110,
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
    top: -20,
    backgroundColor: "rgba(39, 39, 42, 0.95)",
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    elevation: 6,
    alignSelf: "center",
    minWidth: 50,
    alignItems: "center",
  },
  tooltipMetin: { color: "white", fontSize: 10, fontWeight: "700" },
});
