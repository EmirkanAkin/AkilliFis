import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import * as QuickActions from "expo-quick-actions";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { useEffect } from "react";
import { Platform } from "react-native";

import { auth, db } from "../firebaseConfig";
import { useStore } from "../store/useStore";

const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0A0A0A",
    card: "#18181B",
  },
};

const parseTarih = (tarihStr: string) => {
  if (!tarihStr) return new Date();
  const parts = tarihStr.split(".");
  if (parts.length === 3) {
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }
  return new Date();
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const {
    uid,
    setTumFisler,
    setTumUrunler,
    setIsFislerLoaded,
    setIsim,
    setButce,
  } = useStore();

  useEffect(() => {
    QuickActions.setItems([
      {
        id: "kamera_ac",
        title: "📸 Hızlı Fiş Tara",
        subtitle: "Kamerayı aç ve anında tara",
        icon: Platform.OS === "ios" ? "symbol:camera" : "camera",
      },
      {
        id: "manuel_ekle",
        title: "✍️ Manuel Ekle",
        subtitle: "El ile harcama gir",
        icon: Platform.OS === "ios" ? "symbol:square.and.pencil" : "edit",
      },
    ]);

    const abonelik = QuickActions.addListener((action) => {
      if (action.id === "kamera_ac") {
        router.push("/kamera");
      } else if (action.id === "manuel_ekle") {
        router.push("/manuelfis");
      }
    });

    return () => abonelik.remove();
  }, []);

  useEffect(() => {
    const aktifUid = uid || auth.currentUser?.uid;

    if (aktifUid) {
      const userUnsub = onSnapshot(
        doc(db, "Kullanicilar", aktifUid),
        (snap) => {
          if (snap.exists()) {
            const veri = snap.data();
            setIsim(veri.isim || "Misafir");
            setButce(veri.aylik_butce || "0");
          }
        },
      );

      const qFis = query(
        collection(db, "Fisler"),
        where("kullanici_id", "==", aktifUid),
      );
      const fisUnsub = onSnapshot(qFis, (snapshot) => {
        const veriler = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as any[];

        const siraliVeriler = veriler.sort((a: any, b: any) => {
          const dateA = parseTarih(a.tarih).getTime();
          const dateB = parseTarih(b.tarih).getTime();
          if (dateA !== dateB) return dateB - dateA;
          const timeA = a.olusturulma_tarihi?.toMillis
            ? a.olusturulma_tarihi.toMillis()
            : 0;
          const timeB = b.olusturulma_tarihi?.toMillis
            ? b.olusturulma_tarihi.toMillis()
            : 0;
          return timeB - timeA;
        });

        setTumFisler(siraliVeriler as any);
        setIsFislerLoaded(true);
      });

      const qUrun = query(
        collection(db, "Urunler"),
        where("kullanici_id", "==", aktifUid),
      );
      const urunUnsub = onSnapshot(qUrun, (snapshot) => {
        const urunVerileri = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTumUrunler(urunVerileri);
      });

      return () => {
        userUnsub();
        fisUnsub();
        urunUnsub();
      };
    } else {
      setIsFislerLoaded(true);
    }
  }, [uid]);

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
        <Stack.Screen name="ilkgiris" />
        <Stack.Screen name="ilkgiris-butce" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="kamera"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen name="urundetay" />
        <Stack.Screen name="fisdogrulama" />
        <Stack.Screen
          name="manuelfis"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="butcemodal"
          options={{
            presentation: "transparentModal",
            animation: "fade",
            contentStyle: { backgroundColor: "rgba(0,0,0,0.5)" },
          }}
        />
        <Stack.Screen
          name="isimmodal"
          options={{
            presentation: "transparentModal",
            animation: "fade",
            contentStyle: { backgroundColor: "rgba(0,0,0,0.5)" },
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
