import { StyleSheet, Text, View } from "react-native";

export default function EkranAdi() {
  return (
    <View style={styles.container}>
      <Text style={styles.yazi}>Bu sayfa yapım aşamasında 🚧</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  yazi: {
    color: "#1DB954",
    fontSize: 20,
    fontWeight: "bold",
  },
});
