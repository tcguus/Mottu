import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { TouchableOpacity, Text, Alert } from "react-native";

function BotaoLimparAsyncStorage() {
  const limparTudo = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert("Sucesso", "AsyncStorage limpo com sucesso!");
    } catch (e) {
      Alert.alert("Erro", "Ocorreu um erro ao limpar o AsyncStorage.");
    }
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: "red",
        padding: 12,
        borderRadius: 10,
        marginTop: 20,
        alignSelf: "center",
      }}
      onPress={limparTudo}
    >
      <Text style={{ color: "#fff", fontWeight: "bold" }}>
        Limpar AsyncStorage
      </Text>
    </TouchableOpacity>
  );
}

export default BotaoLimparAsyncStorage;
