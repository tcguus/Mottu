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

type Usuario = {
  nome: string;
  id: string;
  funcao: string;
};

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [id, setId] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const router = useRouter();

  const handleLogin = () => {
    if (
      (id === "12345" && senha === "12345") ||
      (id === "54321" && senha === "54321")
    ) {
      const funcao = id === "12345" ? "Gerente" : "Operador";
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setUsuario({
          nome: "Gustavo Camargo",
          id,
          funcao,
        });

        // Aguarda 3s e redireciona para /motos
        setTimeout(() => {
          setUsuario(null);
          router.replace("/(tabs)/motos");
        }, 3000);
      }, 2000);
    } else {
      Alert.alert("Erro", "ID ou senha inválidos");
    }
  };

  return (
    <View style={styles.fullscreen}>
      <View style={styles.loginContainer}>
        <Image
          source={require("../assets/images/mottu-logo.png")}
          style={{ width: 120, height: 120, marginTop: 2 }}
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

      {/* Tela de carregamento sobreposta */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <RotatingLoader />
        </View>
      )}

      {/* Pop-up de boas-vindas */}
      <Modal
        transparent
        visible={usuario !== null}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.bemVindo}>
              Seja bem-vindo, {usuario?.nome}!
            </Text>
            <Text style={styles.info}>
              {usuario?.funcao} | ID: {usuario?.id}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function RotatingLoader() {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={{
        width: 80,
        height: 80,
        borderWidth: 8,
        borderRadius: 40,
        borderColor: "#333",
        borderTopColor: colors.verde,
        transform: [{ rotate: spin }],
      }}
    />
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
    height: "85%",
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
    marginBottom: 16,
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
});