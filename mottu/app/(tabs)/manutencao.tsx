import React from "react";
import { View, Text, StyleSheet } from "react-native";
import colors from "../../constants/theme";
import Header from "../../components/Header";

export default function Manutencao() {
  return (
    <View style={styles.container}>
      <Header title="Manutencao" showBackButton={true} />
      <Text style={styles.text}>Página Manutencao</Text>
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
