import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import colors from "../../constants/theme";
import Header from "../../components/Header";
import { useFocusEffect } from "@react-navigation/native";

type Moto = {
  placa: string;
  modelo: string;
};

type Manutencao = {
  moto: string;
  tipo: string;
  descricao: string;
  data: string;
  status: "pendente" | "concluído" | "excluído";
};

export default function ManutencaoScreen() {
  const [, setMotos] = useState<Moto[]>([]);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState(new Date());
  const [mostrarData, setMostrarData] = useState(false);
  const [openMoto, setOpenMoto] = useState(false);
  const [motoSelecionada, setMotoSelecionada] = useState<string | null>(null);
  const [listaMotos, setListaMotos] = useState<
    { label: string; value: string }[]
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

  useFocusEffect(
    useCallback(() => {
      const carregarDados = async () => {
        const dataMotos = await AsyncStorage.getItem("@motos");
        const dataManut = await AsyncStorage.getItem("@manutencoes");

        if (dataMotos) {
          const lista = JSON.parse(dataMotos);
          setMotos(lista);
          setListaMotos(
            lista.length > 0
              ? lista.map((m: Moto) => ({
                  label: `${m.placa} | ${m.modelo}`,
                  value: `${m.placa} | ${m.modelo}`,
                }))
              : [
                  {
                    label: "Nenhuma moto cadastrada",
                    value: "none",
                    disabled: true,
                  },
                ]
          );
        }

        if (dataManut) setManutencoes(JSON.parse(dataManut));
      };

      carregarDados();
    }, [])
  );

  const salvarManutencao = async () => {
    if (!motoSelecionada || !tipo || !data) return;
    const nova: Manutencao = {
      moto: motoSelecionada,
      tipo,
      descricao,
      data: data.toLocaleDateString("pt-BR"),
      status: "pendente",
    };
    const atualizadas = [...manutencoes, nova];
    setManutencoes(atualizadas);
    await AsyncStorage.setItem("@manutencoes", JSON.stringify(atualizadas));
    setMotoSelecionada(null);
    setTipo(null);
    setDescricao("");
    setData(new Date());
  };

  const atualizarStatus = async (status: "concluído" | "excluído") => {
    if (!manutencaoSelecionada) return;
    const atualizadas = manutencoes.map((m) =>
      m === manutencaoSelecionada ? { ...m, status } : m
    );
    setManutencoes(atualizadas);
    await AsyncStorage.setItem("@manutencoes", JSON.stringify(atualizadas));
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Header title="Manutenção" showBackButton={true} />

      <FlatList
        style={{ width: "100%", maxHeight: "90%" }}
        ListHeaderComponent={
          <View style={{ alignItems: "center", zIndex: 1000 }}>
            <Text style={styles.title}>Cadastre uma moto</Text>
            <Text style={styles.label}>Data</Text>
            <TouchableOpacity
              style={styles.inputBox}
              onPress={() => setMostrarData(true)}
            >
              <Text>{data.toLocaleDateString("pt-BR")}</Text>
            </TouchableOpacity>
            {mostrarData && (
              <DateTimePicker
                value={data}
                mode="date"
                display="default"
                onChange={(event: unknown, selectedDate?: Date) => {
                  setMostrarData(false);
                  if (selectedDate) setData(selectedDate);
                }}
              />
            )}
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
              textStyle={{ color: "black" }}
              placeholderStyle={{ color: "#888" }}
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
              textStyle={{ color: "black" }}
              placeholderStyle={{ color: "#888" }}
            />
            <Text style={styles.label}>Descrição</Text>
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
        data={[...manutencoes].reverse()}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setManutencaoSelecionada(item);
              setModalVisible(true);
            }}
            style={styles.card}
          >
            <View style={styles.cardLeft}>
              <Text style={styles.cardTitulo}>{item.moto}</Text>
              <Text>{item.tipo}</Text>
            </View>
            <Ionicons
              name={
                item.status === "concluído"
                  ? "checkmark-circle"
                  : item.status === "excluído"
                  ? "close-circle"
                  : "hourglass-outline"
              }
              size={22}
              color={item.status === "excluído" ? "red" : colors.verde}
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
                  {manutencaoSelecionada?.data}
                </Text>
              </View>
              <View style={styles.desc}>
                <Text style={styles.labelInfo}>Moto:</Text>
                <Text style={styles.inputInfo}>
                  {manutencaoSelecionada?.moto}
                </Text>
              </View>
              <View style={styles.desc}>
                <Text style={styles.labelInfo}>Tipo</Text>
                <Text style={styles.inputInfo}>
                  {manutencaoSelecionada?.tipo}
                </Text>
              </View>
              <View style={styles.desc}>
                <Text style={styles.labelInfo}>Descrição:</Text>
                <Text style={styles.inputInfo}>
                  {manutencaoSelecionada?.descricao}
                </Text>
              </View>
            </View>

            {manutencaoSelecionada?.status === "pendente" ? (
              <View style={{ flexDirection: "row", gap: 20, marginTop: 20 }}>
                <TouchableOpacity onPress={() => atualizarStatus("concluído")}>
                  <Text style={styles.confirmar}>Confirmar pedido</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => atualizarStatus("excluído")}>
                  <Text style={styles.excluir}>Excluir pedido</Text>
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
                      manutencaoSelecionada?.status === "concluído"
                        ? colors.verde
                        : "red",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  {manutencaoSelecionada?.status === "concluído"
                    ? "Esse pedido foi confirmado!"
                    : "Esse pedido foi excluído!"}
                </Text>
                <Ionicons
                  name={
                    manutencaoSelecionada?.status === "concluído"
                      ? "checkmark"
                      : "close"
                  }
                  size={24}
                  color={
                    manutencaoSelecionada?.status === "concluído"
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
    marginLeft: 6,
    marginTop: 10,
    marginBottom: 2,
  },
  inputBox: {
    borderWidth: 2,
    borderColor: colors.verde,
    borderRadius: 12,
    padding: 10,
    width: 350,
    maxHeight: 90,
    marginBottom: 8,
  },
  descricao: {
    height: 100,
    textAlignVertical: "top",
    borderWidth: 2,
    borderColor: colors.verde,
    borderRadius: 12,
    padding: 10,
    width: 350,
  },
  dropDown: {
    borderColor: colors.verde,
    borderWidth: 2,
    marginBottom: 10,
    width: 350,
    alignSelf: "center",
    borderRadius: 12,
  },
  dropDownContainer: {
    borderColor: "#888",
    width: 350,
    alignSelf: "center",
    borderWidth: 1,
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
    marginTop: 10,
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
    width: "80%",
    padding: 12,
    borderWidth: 2,
    borderColor: colors.verde,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  cardLeft: {
    gap: 4,
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
    width: "85%",
    backgroundColor: colors.branco,
    gap: 12,
  },
  desc: {
    borderWidth: 2,
    borderColor: colors.verde,
    borderRadius: 12,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 18,
    paddingRight: 18,
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
