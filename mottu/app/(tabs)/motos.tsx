import React from "react";
import { View, Text, StyleSheet } from "react-native";
import colors from "../../constants/theme";
import Header from "../../components/Header";

export default function Motos() {
  return (
    <View style={styles.container}>
      <Header title="Minhas Motos" showBackButton={true} />
      <Text style={styles.text}>Página Motos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.branco,
    height: "100%",
    paddingTop: 88,
  },
  text: { fontSize: 24, fontWeight: "bold" },
});
