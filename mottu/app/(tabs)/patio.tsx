import React from "react";
import { View, Text, StyleSheet } from "react-native";
import colors from "../../constants/theme";
import Header from "../../components/Header";

export default function Patio() {
  return (
    <View style={styles.container}>
      <Header title="Patio" showBackButton={true} />
      <Text style={styles.text}>Página Patio</Text>
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
