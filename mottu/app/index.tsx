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
import colors, { theme } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useUser } from "../context/UserContext";

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useUser();
  const { signIn } = useUser();
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Atenção", "Por favor, preencha o email e a senha.");
      return;
    }
    setIsLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Email ou senha inválidos.";
      Alert.alert("Erro de Login", errorMessage);
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
        <View style={styles.whiteContainer}>
          <Text style={styles.title}>Log In</Text>
          <TextInput
            placeholder="Digite seu email"
            placeholderTextColor={colors.verde}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Digite sua senha"
              placeholderTextColor={theme.light.tint}
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
                color={theme.light.tint}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.light.background} />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <Link href="/register" asChild>
            <TouchableOpacity
              style={{ marginBottom: 40, alignItems: "center" }}
            >
              <Text style={{ color: "#007AFF", fontSize: 16 }}>
                Não tem uma conta? Cadastre-se
              </Text>
            </TouchableOpacity>
          </Link>
          <Text style={styles.rodape}>
            © 2025 Mottu - Todos os direitos reservados
          </Text>
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
              <Text style={styles.bemVindo}>Seja bem-vindo, {user.nome}!</Text>
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
    backgroundColor: theme.light.tint,
  },
  loginContainer: {
    flex: 1,
    alignItems: "center",
  },
  whiteContainer: {
    backgroundColor: theme.light.background,
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
    color: theme.light.tint,
    marginBottom: 40,
  },
  input: {
    borderWidth: 2,
    borderColor: theme.light.tint,
    borderRadius: 14,
    padding: 22,
    width: "65%",
    color: theme.light.tint,
    marginBottom: 20,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: theme.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
    minWidth: "65%",
    height: 54,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: theme.light.background,
    fontWeight: "bold",
    fontSize: 22,
  },
  rodape: {
    fontSize: 12,
    color: theme.light.tint,
    position: "absolute",
    bottom: 100,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.light.background,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    width: "80%",
    elevation: 5,
    borderColor: theme.light.tint,
    borderWidth: 2,
  },
  bemVindo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: theme.light.tint,
    textAlign: "center",
  },
  info: {
    fontSize: 16,
    color: theme.light.text,
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
    borderColor: theme.light.tint,
    borderRadius: 14,
    padding: 22,
    paddingRight: 50,
    color: theme.light.tint,
    fontWeight: "bold",
  },
  iconSenha: {
    position: "absolute",
    right: 16,
    top: "35%",
  },
});
