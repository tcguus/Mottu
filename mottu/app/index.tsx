import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Image,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useUser } from "../context/UserContext";
import { rawColors } from "@/constants/theme";
import { useAppSettings } from "../context/AppSettingsContext";
import i18n from "@/services/i18n";

export default function LoginScreen() {
  const { colors } = useAppSettings();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useUser();
  const { signIn } = useUser();
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(i18n.t("alerts.attention"), i18n.t("login.alert.fillAll"));
      return;
    }
    setIsLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || i18n.t("login.alert.error");
      Alert.alert(i18n.t("alerts.error"), errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const spinAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [spinAnim]);

  return (
    <View style={styles.fullscreen}>
      <View style={styles.loginContainer}>
        <Image
          source={require("../assets/images/mottu-logo.png")}
          style={{ width: 120, height: 120, marginTop: 50 }}
        />
        <View
          style={[
            styles.whiteContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <Text style={styles.title}>{i18n.t("login.title")}</Text>
          <TextInput
            placeholder={i18n.t("login.email")}
            placeholderTextColor={rawColors.verde}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder={i18n.t("login.password")}
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
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={rawColors.branco} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.background }]}>
                {i18n.t("login.button")}
              </Text>
            )}
          </TouchableOpacity>

          <Link href="/register" asChild>
            <TouchableOpacity
              style={{ marginBottom: 40, alignItems: "center" }}
            >
              <Text style={{ color: "#007AFF", fontSize: 16 }}>
                {i18n.t("login.register")}
              </Text>
            </TouchableOpacity>
          </Link>
          <Text style={styles.rodape}>{i18n.t("login.footer")}</Text>
        </View>
      </View>
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        {user && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.bemVindo}>
                {i18n.t("login.alert.welcome", { nome: user.nome })}
              </Text>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: rawColors.verde,
  },
  loginContainer: {
    flex: 1,
    alignItems: "center",
  },
  whiteContainer: {
    borderBottomRightRadius: 170,
    borderTopLeftRadius: 170,
    width: "100%",
    height: "81%",
    marginTop: "auto",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 60,
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
    marginBottom: 80,
  },
  buttonText: {
    color: rawColors.branco,
    fontWeight: "bold",
    fontSize: 24,
  },
  rodape: {
    fontSize: 12,
    color: rawColors.verde,
    position: "absolute",
    bottom: 100,
    fontWeight: "600",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: rawColors.branco,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    width: "80%",
    elevation: 5,
    borderColor: rawColors.verde,
    borderWidth: 2,
  },
  bemVindo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: rawColors.verde,
    textAlign: "center",
  },
  info: {
    fontSize: 16,
    color: rawColors.preto,
    marginBottom: 14,
    fontWeight: "bold",
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
  spinner: {
    width: 60,
    height: 60,
    borderWidth: 6,
    borderColor: "#333",
    borderTopColor: rawColors.verde,
    borderRadius: 30,
    marginBottom: 20,
  },
});
