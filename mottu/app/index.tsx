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
} from "react-native";
import colors from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../context/UserContext";

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [id, setId] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [funcao, setFuncao] = useState<"Gerente" | "Operador" | "">("");
  const { login } = useAuth();
  const router = useRouter();
  const handleLogin = () => {
    if (
      (id === "12345" && senha === "12345") ||
      (id === "54321" && senha === "54321")
    ) {
      const userFuncao: "Gerente" | "Operador" =
        id === "12345" ? "Gerente" : "Operador";
      setFuncao(userFuncao);

      const usuario = {
        nome: "Gustavo Camargo",
        id,
        funcao: userFuncao,
      };

      login(usuario);
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setModalVisible(true);
        setTimeout(() => {
          setModalVisible(false);
          router.replace("/(tabs)/motos");
        }, 2000);
      }, 1500);
    } else {
      Alert.alert("Erro", "ID ou senha inválidos");
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
            placeholder="Digite seu ID"
            placeholderTextColor={colors.verde}
            style={styles.input}
            value={id}
            onChangeText={setId}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Digite sua senha"
              placeholderTextColor={colors.verde}
              style={styles.inputSenha}
              secureTextEntry={!showPassword}
              value={senha}
              onChangeText={setSenha}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.iconSenha}
            >
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={24}
                color={colors.verde}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
          <Text style={styles.rodape}>
            © 2025 Mottu - Todos os direitos reservados
          </Text>
        </View>
      </View>
      {loading && (
        <View style={styles.loadingOverlay}>
          <Animated.View
            style={[
              styles.spinner,
              {
                transform: [
                  {
                    rotate: spinAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      )}

      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.bemVindo}>
              Seja bem-vindo, Gustavo Camargo!
            </Text>
            <Text style={styles.info}>
              {funcao} | ID: {id}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: colors.verde,
  },
  loginContainer: {
    flex: 1,
    alignItems: "center",
  },
  whiteContainer: {
    backgroundColor: colors.branco,
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
    color: colors.verde,
    marginBottom: 40,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.verde,
    borderRadius: 14,
    padding: 22,
    width: "65%",
    color: colors.verde,
    marginBottom: 20,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: colors.verde,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 80,
  },
  buttonText: {
    color: colors.branco,
    fontWeight: "bold",
    fontSize: 24,
  },
  rodape: {
    fontSize: 12,
    color: colors.verde,
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
    backgroundColor: colors.branco,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    width: "80%",
    elevation: 5,
    borderColor: colors.verde,
    borderWidth: 2,
  },
  bemVindo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: colors.verde,
    textAlign: "center",
  },
  info: {
    fontSize: 16,
    color: colors.preto,
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
    borderColor: colors.verde,
    borderRadius: 14,
    padding: 22,
    paddingRight: 50,
    color: colors.verde,
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
    borderTopColor: colors.verde,
    borderRadius: 30,
    marginBottom: 20,
  },
});
