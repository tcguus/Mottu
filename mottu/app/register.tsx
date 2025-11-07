import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Link, useRouter } from "expo-router";
import api from "../services/api";
import { Ionicons } from "@expo/vector-icons";
import { rawColors } from "@/constants/theme";
import { useAppSettings } from "../context/AppSettingsContext";
import i18n from "@/services/i18n";

export default function RegisterScreen() {
  const { colors } = useAppSettings();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const handleRegister = async () => {
    if (!nome || !email || !password) {
      Alert.alert(i18n.t("alerts.attention"), i18n.t("register.alert.fillAll"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(
        i18n.t("alerts.attention"),
        i18n.t("register.alert.invalidEmail")
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        i18n.t("alerts.attention"),
        i18n.t("register.alert.passwordLength")
      );
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/Auth/register", { nome, email, senha: password });

      Alert.alert(i18n.t("alerts.success"), i18n.t("register.alert.success"));
      router.replace("/");
    } catch (error: any) {
      console.error("Erro no cadastro:", error.response?.data);
      const errorMessage =
        error.response?.data?.message || i18n.t("register.alert.error");
      Alert.alert(i18n.t("alerts.error"), errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={styles.title}>{i18n.t("register.title")}</Text>

      <TextInput
        style={styles.input}
        placeholder={i18n.t("register.name")}
        value={nome}
        onChangeText={setNome}
        placeholderTextColor={rawColors.verde}
      />
      <TextInput
        style={styles.input}
        placeholder={i18n.t("register.email")}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor={rawColors.verde}
      />
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder={i18n.t("register.password")}
          placeholderTextColor={rawColors.verde}
          style={styles.inputSenha}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.iconSenha}
        >
          <Ionicons
            name={showPassword ? "eye" : "eye-off"}
            size={24}
            color={rawColors.verde}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={[styles.buttonText, { color: colors.background }]}>
            {i18n.t("register.button")}
          </Text>
        )}
      </TouchableOpacity>

      <Link href="/" asChild>
        <TouchableOpacity style={{ marginTop: 20 }}>
          <Text style={{ color: "#007AFF", fontSize: 16 }}>
            {i18n.t("register.loginLink")}
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    alignItems: "center",
    backgroundColor: "#",
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: rawColors.verde,
    marginBottom: 40,
  },
  input: {
    borderWidth: 2,
    borderColor: rawColors.verde,
    borderRadius: 14,
    padding: 22,
    width: "65%",
    color: rawColors.verde,
    marginBottom: 20,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: rawColors.verde,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
    minWidth: "65%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  passwordContainer: {
    width: "65%",
    marginBottom: 20,
    position: "relative",
  },
  inputSenha: {
    borderWidth: 2,
    borderColor: rawColors.verde,
    borderRadius: 14,
    padding: 22,
    paddingRight: 50,
    color: rawColors.verde,
    fontWeight: "bold",
  },
  iconSenha: {
    position: "absolute",
    right: 16,
    top: "35%",
  },
  buttonText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
});
