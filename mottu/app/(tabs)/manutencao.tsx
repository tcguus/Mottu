import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import colors from "../../constants/theme";
import Header from "../../components/Header";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ManutencaoStatus = "Aberta" | "Concluida" | "excluido";

type Manutencao = {
  id: string;
  placa: string;
  problemas: string;
  data: string;
  status: ManutencaoStatus;
};

const EXCLUIDAS_STORAGE_KEY = "@manutencoes_excluidas";

export default function ManutencaoScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [descricao, setDescricao] = useState("");
  const [openMoto, setOpenMoto] = useState(false);
  const [motoSelecionada, setMotoSelecionada] = useState<string | null>(null);
  const [listaMotos, setListaMotos] = useState<
    { label: string; value: string; disabled?: boolean }[]
  >([]);
  const [openTipo, setOpenTipo] = useState(false);
  const [tipo, setTipo] = useState<string | null>(null);
  const [tipos, setTipos] = useState([
    { label: "Troca de óleo", value: "Troca de óleo" },
    { label: "Revisão geral", value: "Revisão geral" },
    { label: "Reparo no motor", value: "Reparo no motor" },
    { label: "Troca de pneus", value: "Troca de pneus" },
    { label: "Freios", value: "Freios" },
    { label: "Elétrica", value: "Elétrica" },
    { label: "Outros", value: "Outros" },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [manutencaoSelecionada, setManutencaoSelecionada] =
    useState<Manutencao | null>(null);

  const carregarDados = useCallback(async () => {
    if (!isLoading) setIsLoading(true);

    try {
      const minimumTimePromise = new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      const fetchDataPromise = async () => {
        const [motosResponse, manutencoesResponse, excluidasData] =
          await Promise.all([
            api.get("/Motos"),
            api.get("/Manutencoes"),
            AsyncStorage.getItem(EXCLUIDAS_STORAGE_KEY),
          ]);

        const motosDaApi = motosResponse.data.items;
        if (motosDaApi.length > 0) {
          setListaMotos(
            motosDaApi.map((m: { placa: string; modelo: string }) => ({
              label: `${m.placa} | ${m.modelo}`,
              value: m.placa,
            }))
          );
        } else {
          setListaMotos([
            { label: "Nenhuma moto cadastrada", value: "none", disabled: true },
          ]);
        }

        const manutencoesDaApi = manutencoesResponse.data.items;
        const manutencoesExcluidas = excluidasData
          ? JSON.parse(excluidasData)
          : [];
        const listaCompleta = [
          ...manutencoesDaApi,
          ...manutencoesExcluidas,
        ].sort(
          (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
        );
        setManutencoes(listaCompleta);
      };

      await Promise.all([fetchDataPromise(), minimumTimePromise]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      Alert.alert("Erro", "Não foi possível buscar os dados da API.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  const salvarManutencao = async () => {
    if (!motoSelecionada || !tipo) {
      Alert.alert("Atenção", "Selecione a moto e o tipo de manutenção.");
      return;
    }
    const novaManutencao = {
      Placa: motoSelecionada,
      Problemas: descricao ? `${tipo}: ${descricao}` : tipo,
    };
    try {
      await api.post("/Manutencoes", novaManutencao);
      setMotoSelecionada(null);
      setTipo(null);
      setDescricao("");
      await carregarDados();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Erro ao salvar manutenção.";
      Alert.alert("Erro", errorMessage);
    }
  };

  const concluirManutencao = async () => {
    if (!manutencaoSelecionada) return;
    try {
      await api.put(`/Manutencoes/${manutencaoSelecionada.id}`, {
        Status: "Concluida",
        Problemas: manutencaoSelecionada.problemas,
      });
      setModalVisible(false);
      await carregarDados();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Erro ao concluir manutenção.";
      Alert.alert("Erro", errorMessage);
    }
  };
  const excluirManutencao = async () => {
    if (!manutencaoSelecionada) return;
    try {
      await api.delete(`/Manutencoes/${manutencaoSelecionada.id}`);
      const excluidasData = await AsyncStorage.getItem(EXCLUIDAS_STORAGE_KEY);
      const excluidas = excluidasData ? JSON.parse(excluidasData) : [];
      const novaExcluida = {
        ...manutencaoSelecionada,
        status: "excluido" as ManutencaoStatus,
      };
      const listaAtualizada = [
        ...excluidas.filter((m: Manutencao) => m.id !== novaExcluida.id),
        novaExcluida,
      ];
      await AsyncStorage.setItem(
        EXCLUIDAS_STORAGE_KEY,
        JSON.stringify(listaAtualizada)
      );

      setModalVisible(false);
      await carregarDados();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Erro ao excluir manutenção.";
      Alert.alert("Erro", errorMessage);
    }
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.branco,
        }}
      >
        <Header title="Manutenção" showBackButton={true} />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.verde} />
          <Text style={{ marginTop: 10, color: colors.verde }}>
            Carregando manutenções...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Manutenção" showBackButton={true} />

      <FlatList
        style={{ width: "100%", maxHeight: "90%" }}
        ListHeaderComponent={
          <View style={{ alignItems: "center", zIndex: 1000 }}>
            <Text style={styles.title}>Cadastrar Manutenção</Text>
            <Text style={styles.label}>Data (Automática)</Text>
            <View style={styles.inputBox}>
              <Text>{new Date().toLocaleDateString("pt-BR")}</Text>
            </View>

            <Text style={styles.label}>Escolha uma moto</Text>
            <DropDownPicker
              open={openMoto}
              value={motoSelecionada}
              items={listaMotos}
              setOpen={setOpenMoto}
              setValue={setMotoSelecionada}
              setItems={setListaMotos}
              placeholder="Selecione uma moto"
              style={styles.dropDown}
              dropDownContainerStyle={styles.dropDownContainer}
              zIndex={3000}
              zIndexInverse={1000}
            />
            <Text style={styles.label}>Tipo de Manutenção</Text>
            <DropDownPicker
              open={openTipo}
              value={tipo}
              items={tipos}
              setOpen={setOpenTipo}
              setValue={setTipo}
              setItems={setTipos}
              placeholder="Selecione um tipo"
              style={styles.dropDown}
              dropDownContainerStyle={styles.dropDownContainer}
              zIndex={2000}
              zIndexInverse={2000}
            />
            <Text style={styles.label}>Descrição (Opcional)</Text>
            <TextInput
              multiline
              numberOfLines={4}
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Descreva o problema..."
              placeholderTextColor={"#888"}
              style={styles.descricao}
            />
            <TouchableOpacity style={styles.botao} onPress={salvarManutencao}>
              <Text style={styles.botaoTexto}>Cadastrar</Text>
            </TouchableOpacity>
            <Text style={styles.historico}>Histórico</Text>

            {manutencoes.length === 0 && (
              <Text style={{ color: "#888", marginTop: 10 }}>
                Nenhuma manutenção registrada
              </Text>
            )}
          </View>
        }
        contentContainerStyle={styles.scroll}
        data={manutencoes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setManutencaoSelecionada(item);
              setModalVisible(true);
            }}
            style={styles.card}
          >
            <View style={styles.cardLeft}>
              <Text style={styles.cardTitulo}>{item.placa}</Text>
              <Text>{item.problemas}</Text>
            </View>
            <Ionicons
              name={
                item.status === "Concluida"
                  ? "checkmark-circle"
                  : item.status === "excluido"
                  ? "close-circle"
                  : "hourglass-outline"
              }
              size={22}
              color={item.status === "excluido" ? "red" : colors.verde}
            />
          </TouchableOpacity>
        )}
      />
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#888" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Detalhes da Manutenção</Text>
            <View style={styles.info}>
              <View style={styles.desc}>
                <Text style={styles.labelInfo}>Data:</Text>
                <Text style={styles.inputInfo}>
                  {manutencaoSelecionada?.data
                    ? new Date(manutencaoSelecionada.data).toLocaleDateString(
                        "pt-BR"
                      )
                    : ""}
                </Text>
              </View>
              <View style={styles.desc}>
                <Text style={styles.labelInfo}>Moto (Placa):</Text>
                <Text style={styles.inputInfo}>
                  {manutencaoSelecionada?.placa}
                </Text>
              </View>
              <View style={styles.desc}>
                <Text style={styles.labelInfo}>Problemas:</Text>
                <Text style={styles.inputInfo}>
                  {manutencaoSelecionada?.problemas}
                </Text>
              </View>
            </View>
            {manutencaoSelecionada?.status === "Aberta" ? (
              <View style={{ flexDirection: "row", gap: 20, marginTop: 20 }}>
                <TouchableOpacity onPress={concluirManutencao}>
                  <Text style={styles.confirmar}>Concluir Manutenção</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={excluirManutencao}>
                  <Text style={styles.excluir}>Excluir Manutenção</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={{
                  alignItems: "center",
                  marginTop: 20,
                  flexDirection: "row",
                }}
              >
                <Text
                  style={{
                    color:
                      manutencaoSelecionada?.status === "Concluida"
                        ? colors.verde
                        : "red",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  {manutencaoSelecionada?.status === "Concluida"
                    ? "Esta manutenção foi concluída!"
                    : "Esta manutenção foi excluída!"}
                </Text>
                <Ionicons
                  name={
                    manutencaoSelecionada?.status === "Concluida"
                      ? "checkmark"
                      : "close"
                  }
                  size={24}
                  color={
                    manutencaoSelecionada?.status === "Concluida"
                      ? colors.verde
                      : "red"
                  }
                  style={{ marginLeft: 6 }}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.branco,
    paddingTop: 140,
    alignItems: "center",
  },
  scroll: {
    alignItems: "center",
    paddingBottom: 100,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginLeft: "8%",
    marginTop: 10,
    marginBottom: 2,
  },
  inputBox: {
    borderWidth: 2,
    borderColor: colors.verde,
    borderRadius: 12,
    padding: 10,
    width: "85%",
    marginBottom: 8,
  },
  descricao: {
    height: 100,
    textAlignVertical: "top",
    borderWidth: 2,
    borderColor: colors.verde,
    borderRadius: 12,
    padding: 10,
    width: "85%",
  },
  dropDown: {
    borderColor: colors.verde,
    borderWidth: 2,
    marginBottom: 10,
    width: "85%",
    alignSelf: "center",
    borderRadius: 12,
  },
  dropDownContainer: {
    borderColor: colors.verde,
    width: "85%",
    alignSelf: "center",
    borderWidth: 2,
  },
  botao: {
    backgroundColor: colors.verde,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 16,
  },
  botaoTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  historico: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    borderTopColor: "#eee",
    borderTopWidth: 2,
    paddingTop: 20,
    width: "85%",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 24,
  },
  card: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "85%",
    padding: 12,
    borderWidth: 2,
    borderColor: colors.verde,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  cardLeft: {
    gap: 4,
    flex: 1,
  },
  cardTitulo: {
    fontWeight: "bold",
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 16,
    width: "85%",
    alignItems: "center",
    elevation: 10,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
  confirmar: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.branco,
    backgroundColor: colors.verde,
    padding: 8,
    borderRadius: 12,
    width: 150,
    textAlign: "center",
  },
  excluir: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.branco,
    backgroundColor: "#fc0000",
    padding: 8,
    borderRadius: 12,
    width: 150,
    textAlign: "center",
  },
  info: {
    width: "100%",
    backgroundColor: colors.branco,
    gap: 12,
  },
  desc: {
    borderWidth: 2,
    borderColor: colors.verde,
    borderRadius: 12,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 18,
    fontWeight: "bold",
    width: "100%",
    gap: 4,
  },
  inputInfo: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#888",
    marginBottom: 4,
  },
  labelInfo: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
});
