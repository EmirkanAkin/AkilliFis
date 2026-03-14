/* app/(tabs)/analiz.tsx */
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useRef, useState } from "react"; // 🔥 useState eklendi
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, G } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function AnalizScreen() {
  const circumference = 2 * Math.PI * 70;
  const animValue = useRef(new Animated.Value(0)).current;

  // 🔥 Hangi sütunun seçili olduğunu hafızada tutuyoruz
  const [seciliBar, setSeciliBar] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      animValue.setValue(0);
      Animated.timing(animValue, {
        toValue: -circumference,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
      return () => {};
    }, [animValue, circumference]),
  );

  const segments = [
    { color: "#3B82F6", percent: 0.35, ad: "Temizlik", tutar: "1200" },
    { color: "#8B5CF6", percent: 0.08, ad: "Diğer", tutar: "270" },
    { color: "#EF4444", percent: 0.13, ad: "Kafe", tutar: "450" },
    { color: "#F59E0B", percent: 0.2, ad: "Meyve/İçecek", tutar: "680" },
    { color: "#1DB954", percent: 0.25, ad: "Sebze/Meyve", tutar: "850" },
  ];

  // 🔥 Günlük harcamalara fiyat (tutar) eklendi
  const haftalikVeriler = [
    { gun: "Pzt", h: "45%", tutar: "210" },
    { gun: "Sal", h: "60%", tutar: "340" },
    { gun: "Çar", h: "35%", tutar: "290" },
    { gun: "Per", h: "80%", tutar: "480" },
    { gun: "Cum", h: "55%", tutar: "310" },
    { gun: "Cmt", h: "90%", tutar: "520" },
    { gun: "Paz", h: "50%", tutar: "280" },
  ];

  let currentOffset = 0;
  const pieData = segments.map((seg) => {
    const length = seg.percent * circumference;
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
    <ScrollView style={styles.anaEkran} showsVerticalScrollIndicator={false}>
      <View style={styles.headerKapsayici}>
        <Text style={styles.ustBaslik}>ANALİZ</Text>
        <Text style={styles.sayfaBaslik}>
          Harika Gidiyorsun,{"\n"}
          <Text style={styles.isimVurgu}>Emirkan! 🎉</Text>
        </Text>
      </View>

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
            <Text style={styles.kartBuyukTutar}>3,450 TL</Text>
          </View>
          <View style={styles.yuzdeRozeti}>
            <Ionicons name="trending-up" size={12} color="#1DB954" />
            <Text style={styles.yuzdeRozetMetni}>-23%</Text>
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
            <Text style={styles.pieMerkezMiktar}>3,450</Text>
            <Text style={styles.pieMerkezTL}>TL</Text>
          </View>
        </View>

        <View style={styles.legendKapsayici}>
          <View style={styles.legendSatir}>
            <View style={styles.legendOge}>
              <View style={[styles.nokta, { backgroundColor: "#1DB954" }]} />
              <Text style={styles.legendMetin}>Sebze/Meyve (25%)</Text>
            </View>
            <View style={styles.legendOge}>
              <View style={[styles.nokta, { backgroundColor: "#3B82F6" }]} />
              <Text style={styles.legendMetin}>Temizlik (35%)</Text>
            </View>
          </View>
          <View style={styles.legendSatir}>
            <View style={styles.legendOge}>
              <View style={[styles.nokta, { backgroundColor: "#F59E0B" }]} />
              <Text style={styles.legendMetin}>Meyve/İçecek (20%)</Text>
            </View>
            <View style={styles.legendOge}>
              <View style={[styles.nokta, { backgroundColor: "#EF4444" }]} />
              <Text style={styles.legendMetin}>Kafe (13%)</Text>
            </View>
          </View>
          <View style={styles.legendSatir}>
            <View style={styles.legendOge}>
              <View style={[styles.nokta, { backgroundColor: "#8B5CF6" }]} />
              <Text style={styles.legendMetin}>Diğer (8%)</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.kartKapsayici}>
        <Text style={styles.kartBaslikKucuk}>KATEGORİ DAĞILIMI</Text>
        <View style={{ marginTop: 12, gap: 12 }}>
          <KategoriBar
            color="#1DB954"
            title="Sebze/Meyve"
            amount="850"
            percent="25%"
          />
          <KategoriBar
            color="#3B82F6"
            title="Temizlik"
            amount="1200"
            percent="35%"
          />
          <KategoriBar
            color="#F59E0B"
            title="Meyve/İçecek"
            amount="680"
            percent="20%"
          />
          <KategoriBar
            color="#EF4444"
            title="Kafe"
            amount="450"
            percent="13%"
          />
          <KategoriBar
            color="#8B5CF6"
            title="Diğer"
            amount="270"
            percent="8%"
          />
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
                // Tıklandığında kendi hafızasına indeks numarasını yazar
                onPress={() => setSeciliBar(isSelected ? null : index)}
                // Seçili olan en öne (zIndex: 10) çıkar ki tooltip kesilmesin
                style={[
                  styles.barSutun,
                  isSelected && styles.barSutunSecili,
                  { zIndex: isSelected ? 10 : 1 },
                ]}
              >
                {/* 🔥 TIKLANDIĞINDA ÇIKACAK TOOLTIP KUTUCUĞU */}
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
    </ScrollView>
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
    lineHeight: 28,
  },
  isimVurgu: { color: "#1DB954" },

  kupaKarti: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.20)",
    marginBottom: 20,
    overflow: "hidden",
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
    overflow: "hidden",
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
    ...Platform.select({
      ios: {
        shadowColor: "#1DB954",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: { elevation: 8, shadowColor: "#1DB954" },
    }),
  },
  sekmeMetinInaktif: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  sekmeMetinAktif: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  kartKapsayici: {
    backgroundColor: "#18181B",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    padding: 20,
    marginBottom: 20,
    overflow: "visible",
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
    marginBottom: 4,
  },
  kartBuyukTutar: { color: "white", fontSize: 22, fontWeight: "800" },
  yuzdeRozeti: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(29, 185, 84, 0.10)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(29, 185, 84, 0.20)",
    gap: 4,
    overflow: "hidden",
  },
  yuzdeRozetMetni: { color: "#1DB954", fontSize: 12, fontWeight: "600" },

  grafikAlani: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    height: 200,
  },
  pieMerkez: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  pieMerkezUst: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  pieMerkezMiktar: {
    color: "white",
    fontSize: 17,
    fontWeight: "800",
    marginVertical: 2,
  },
  pieMerkezTL: { color: "#1DB954", fontSize: 11, fontWeight: "600" },
  legendKapsayici: { gap: 10 },
  legendSatir: { flexDirection: "row", gap: 16 },
  legendOge: { flexDirection: "row", alignItems: "center", gap: 6 },
  nokta: { width: 8, height: 8, borderRadius: 2 },
  legendMetin: { color: "rgba(255, 255, 255, 0.55)", fontSize: 11 },

  kartBaslikKucuk: {
    color: "rgba(255, 255, 255, 0.40)",
    fontSize: 12,
    fontWeight: "400",
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
    overflow: "hidden",
  },
  kategoriBarDolgu: { height: "100%", borderRadius: 2 },

  barChartKapsayici: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120, // 🔥 Tooltip taşmasın diye yükselttik
    marginTop: 20,
    paddingHorizontal: 0,
  },
  // 🔥 Her bir günün kendi çerçevesi
  barSutun: {
    alignItems: "center",
    width: 40, // Tıklama alanı ve arka plan boyutu
    height: 120,
    justifyContent: "flex-end",
    paddingBottom: 6,
    borderRadius: 8,
  },
  // 🔥 Seçildiğinde beliren soluk gri dikdörtgen arka plan
  barSutunSecili: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
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

  // 🔥 ÇIKAN YENİ FİYAT BALONCUĞU (TOOLTIP)
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
    alignItems: "center",
    // Sağa sola taşması için sabit genişlik
    width: 65,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: { elevation: 6 },
    }),
  },
  tooltipMetin: { color: "white", fontSize: 11, fontWeight: "700" },
});
