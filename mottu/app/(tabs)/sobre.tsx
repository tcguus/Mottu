import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
} from "react-native";
import Header from "../../components/Header";
import { useTheme } from "../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { rawColors } from "@/constants/theme";

const COMMIT_HASH = "5c2b781d";

export default function SobreScreen() {
  const { colors } = useTheme();

  const openGitHub = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Não foi possível abrir o link", err)
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Sobre" showBackButton={true} />

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Mottu App</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>
          Gerenciamento de Frotas e Manutenção
        </Text>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.background }]}>
            Integrantes:
          </Text>

          <TouchableOpacity
            onPress={() => openGitHub("https://github.com/tcguus")}
          >
            <View style={styles.integrante}>
              <Ionicons
                name="logo-github"
                size={24}
                color={colors.background}
              />
              <Text
                style={[styles.integranteText, { color: colors.background }]}
              >
                Gustavo Camargo (RM555562)
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              openGitHub("https://github.com/https://github.com/rsmanto")
            }
          >
            <View style={styles.integrante}>
              <Ionicons
                name="logo-github"
                size={24}
                color={colors.background}
              />
              <Text
                style={[styles.integranteText, { color: colors.background }]}
              >
                Rodrigo Mantovanello (RM555451)
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openGitHub("https://github.com/leoc7sar")}
          >
            <View style={styles.integrante}>
              <Ionicons
                name="logo-github"
                size={24}
                color={colors.background}
              />
              <Text
                style={[styles.integranteText, { color: colors.background }]}
              >
                Leonardo Nascimento (RM558373)
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={[styles.commit, { color: colors.subtext }]}>
          Versão do Commit: {COMMIT_HASH}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 140,
    alignItems: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
  },
  card: {
    width: "100%",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  integrante: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  integranteText: {
    fontSize: 16,
    marginLeft: 10,
  },
  commit: {
    fontSize: 14,
    fontStyle: "italic",
    marginTop: "auto",
    marginBottom: 100,
  },
});
