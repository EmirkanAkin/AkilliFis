import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Radarı ekledik

export default function TabLayout() {
  const insets = useSafeAreaInsets(); // Radarı çalıştırdık

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1E1E1EF2",
          borderTopWidth: 1,
          borderTopColor: "#1A1A1A",
          // MÜHENDİSLİK ÇÖZÜMÜ: Telefonun alt tuşları kadar yüksekliği ve boşluğu dinamik artırıyoruz
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
        },
        tabBarActiveTintColor: "#1DB954",
        tabBarInactiveTintColor: "#888888",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },
      }}
    >
      {/* 1. ANA SAYFA */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color, focused }) => (
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
  kapsul: {
    width: 56,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  aktifKapsul: {
    backgroundColor: "rgba(29, 185, 84, 0.15)",
  },
});
