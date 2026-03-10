import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#000000",
          borderTopWidth: 1,
          borderTopColor: "#1A1A1A",
          height: 70, // Menü yüksekliğini rahat bıraktık
        },
        tabBarActiveTintColor: "#1DB954",
        tabBarInactiveTintColor: "#888888",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4, // Yazıları alttan biraz yukarı ittik
        },
      }}
    >
      {/* 1. ANA SAYFA */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color, focused }) => (
            // Eğer 'focused' (seçili) ise aktifKapsul stilini de ekle
            <View style={[styles.kapsul, focused && styles.aktifKapsul]}>
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />

      {/* 2. HARCAMALAR */}
      <Tabs.Screen
        name="harcamalar"
        options={{
          title: "Harcamalar",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.kapsul, focused && styles.aktifKapsul]}>
              <Ionicons
                name={focused ? "receipt" : "receipt-outline"}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />

      {/* 3. ANALİZ */}
      <Tabs.Screen
        name="analiz"
        options={{
          title: "Analiz",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.kapsul, focused && styles.aktifKapsul]}>
              <Ionicons
                name={focused ? "pie-chart" : "pie-chart-outline"}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />

      {/* 4. PROFİL */}
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.kapsul, focused && styles.aktifKapsul]}>
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

// STİL DOSYASI
const styles = StyleSheet.create({
  // İkonu saran kutunun temel tasarımı (İkonların kaybolmasını engeller)
  kapsul: {
    width: 56, // Sabit genişlik
    height: 32, // Sabit yükseklik
    borderRadius: 16, // Tam bir hap (kapsül) şekli
    justifyContent: "center", // İkonu dikeyde ortala
    alignItems: "center", // İkonu yatayda ortala
    marginTop: 5, // İkonu yukarıdan hafifçe hizala
  },
  // Sadece o an seçili (aktif) olan sekmeye eklenecek yeşil arka plan
  aktifKapsul: {
    backgroundColor: "rgba(29, 185, 84, 0.15)",
  },
});
