import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0A0A0A",
    card: "#18181B",
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? MyDarkTheme : DefaultTheme}>
      <Stack
        initialRouteName="ilkgiris"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "#0A0A0A" },
        }}
      >
        <Stack.Screen name="ilkgiris" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="kamera"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen name="urundetay" options={{ headerShown: false }} />
        <Stack.Screen name="fisdogrulama" options={{ headerShown: false }} />
        <Stack.Screen
          name="manuelfis"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />

        {/* 🔥 BÜTÇE MODALI */}
        <Stack.Screen
          name="butcemodal"
          options={{
            presentation: "transparentModal",
            animation: "fade", // Yavaşça karararak açılır
            headerShown: false,
            contentStyle: { backgroundColor: "rgba(0,0,0,0.5)" }, // Arka planı karanlık tül yapar
          }}
        />

        {/* 🔥 YENİ EKLENEN İSİM MODALI */}
        <Stack.Screen
          name="isimmodal"
          options={{
            presentation: "transparentModal",
            animation: "fade",
            headerShown: false,
            contentStyle: { backgroundColor: "rgba(0,0,0,0.5)" },
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
