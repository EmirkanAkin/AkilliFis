/* app/_layout.tsx */
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

// 🔥 Koyu Tema Ayarları: Arka Planı Siyah Yapıyoruz
const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    // Uygulamanın en dış zemini (Flashbang'i çözen ayar)
    background: "#0A0A0A",
    // Sayfa içeriklerinin arka planı (Market, Starbucks kartları vs.)
    card: "#18181B",
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    // Uygulama temasını telefonun ayarlarına göre otomatik ayarlar
    <ThemeProvider value={colorScheme === "dark" ? MyDarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          // 🔥 Animasyonları buraya ekledik: Sağdan kayarak gelme
          animation: "slide_from_right",
          // 🔥 Sayfa geçiş konteynerlerini siyah yapıyoruz
          contentStyle: { backgroundColor: "#0A0A0A" },
        }}
      >
        {/* 1. ALT MENÜLÜ SAYFALAR */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* 2. KAMERA EKRANI (Modal) */}
        <Stack.Screen
          name="kamera"
          options={{
            presentation: "modal",
            headerShown: false,
            // Kamera için özel animasyon: Alttan kayarak gelme
            animation: "slide_from_bottom",
          }}
        />

        {/* 3. ÜRÜN DETAYI EKRANI */}
        <Stack.Screen
          name="urundetay"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      {/* Telefonun en üstündeki saati ve pili beyaz yaparız */}
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
