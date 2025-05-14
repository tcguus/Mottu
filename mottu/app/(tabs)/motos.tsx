import React from "react";
import { View, Text, StyleSheet } from "react-native";
import colors from "../../constants/theme";

export default function Motos() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Página Motos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.branco },
  text: { fontSize: 24, fontWeight: "bold" },
});
