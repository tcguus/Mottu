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
import { theme } from "../constants/theme"; 
import api from "../services/api";
import { Ionicons } from "@expo/vector-icons";

export default function RegisterScreen() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const handleRegister = async () => {
    if (!nome || !email || !senha) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos.");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/Auth/register", { nome, email, senha });

      Alert.alert("Sucesso!", "Conta criada. Você já pode fazer o login.");
      router.replace("/"); 
    } catch (error: any) {
      console.error("Erro no cadastro:", error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        "Não foi possível criar a conta. Tente novamente.";
      Alert.alert("Erro", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome Completo"
        value={nome}
        onChangeText={setNome}
        placeholderTextColor={theme.light.tint}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor={theme.light.tint}
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
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Cadastrar</Text>
        )}
      </TouchableOpacity>

      <Link href="/" asChild>
        <TouchableOpacity style={{ marginTop: 20 }}>
          <Text style={{ color: "#007AFF", fontSize: 16 }}>
            Já tem uma conta? Voltar para o Login
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
  },
  title: {
    fontSize: 40,
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
  buttonText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
});
