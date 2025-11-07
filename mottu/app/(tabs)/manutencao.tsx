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
import Header from "../../components/Header";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { rawColors } from "../../constants/theme";
import { useAppSettings } from "../../context/AppSettingsContext";
import * as Notifications from "expo-notifications";
import i18n from "@/services/i18n";

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
  const { colors } = useAppSettings();
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
    {
      label: i18n.t("manutencao.tipos.oleo"),
      value: i18n.t("manutencao.tipos.oleo"),
    },
    {
      label: i18n.t("manutencao.tipos.revisao"),
      value: i18n.t("manutencao.tipos.revisao"),
    },
    {
      label: i18n.t("manutencao.tipos.motor"),
      value: i18n.t("manutencao.tipos.motor"),
    },
    {
      label: i18n.t("manutencao.tipos.pneus"),
      value: i18n.t("manutencao.tipos.pneus"),
    },
    {
      label: i18n.t("manutencao.tipos.freios"),
      value: i18n.t("manutencao.tipos.freios"),
    },
    {
      label: i18n.t("manutencao.tipos.eletrica"),
      value: i18n.t("manutencao.tipos.eletrica"),
    },
    {
      label: i18n.t("manutencao.tipos.outros"),
      value: i18n.t("manutencao.tipos.outros"),
    },
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
            {
              label: i18n.t("manutencao.form.motoEmpty"),
              value: "none",
              disabled: true,
            },
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
      Alert.alert(i18n.t("alerts.error"), i18n.t("manutencao.alert.loadError"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
      setTipos([
        {
          label: i18n.t("manutencao.tipos.oleo"),
          value: i18n.t("manutencao.tipos.oleo"),
        },
        {
          label: i18n.t("manutencao.tipos.revisao"),
          value: i18n.t("manutencao.tipos.revisao"),
        },
        {
          label: i18n.t("manutencao.tipos.motor"),
          value: i18n.t("manutencao.tipos.motor"),
        },
        {
          label: i18n.t("manutencao.tipos.pneus"),
          value: i18n.t("manutencao.tipos.pneus"),
        },
        {
          label: i18n.t("manutencao.tipos.freios"),
          value: i18n.t("manutencao.tipos.freios"),
        },
        {
          label: i18n.t("manutencao.tipos.eletrica"),
          value: i18n.t("manutencao.tipos.eletrica"),
        },
        {
          label: i18n.t("manutencao.tipos.outros"),
          value: i18n.t("manutencao.tipos.outros"),
        },
      ]);
    }, [carregarDados])
  );

  const salvarManutencao = async () => {
    if (!motoSelecionada || !tipo) {
      Alert.alert(
        i18n.t("alerts.attention"),
        i18n.t("manutencao.alert.fillAll")
      );
      return;
    }
    const novaManutencao = {
      Placa: motoSelecionada,
      Problemas: descricao ? `${tipo}: ${descricao}` : tipo,
    };
    try {
      await api.post("/Manutencoes", novaManutencao);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: i18n.t("manutencao.notification.title"),
          body: i18n.t("manutencao.notification.body", {
            placa: motoSelecionada,
          }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
          repeats: false,
        },
      });

      setMotoSelecionada(null);
      setTipo(null);
      setDescricao("");
      await carregarDados();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || i18n.t("manutencao.alert.addError");
      Alert.alert(i18n.t("alerts.error"), errorMessage);
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
        error.response?.data?.message || i18n.t("manutencao.alert.updateError");
      Alert.alert(i18n.t("alerts.error"), errorMessage);
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
        error.response?.data?.message || i18n.t("manutencao.alert.deleteError");
      Alert.alert(i18n.t("alerts.error"), errorMessage);
    }
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <Header
          title={i18n.t("manutencao.headerTitle")}
          showBackButton={true}
        />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.background,
          }}
        >
          <ActivityIndicator size="large" color={rawColors.verde} />
          <Text style={{ marginTop: 10, color: rawColors.verde }}>
            {i18n.t("manutencao.loading")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={i18n.t("manutencao.headerTitle")} showBackButton={true} />

      <FlatList
        style={{ width: "100%", maxHeight: "90%" }}
        ListHeaderComponent={
          <View
            style={{
              alignItems: "center",
              zIndex: 1000,
              backgroundColor: colors.background,
            }}
          >
            <Text style={[styles.title, { color: colors.text }]}>
              {i18n.t("manutencao.form.title")}
            </Text>
            <Text style={[styles.label, { color: colors.text }]}>
              {i18n.t("manutencao.form.dateLabel")}
            </Text>
            <View style={styles.inputBox}>
              <Text style={{ color: colors.subtext }}>
                {new Date().toLocaleDateString("pt-BR")}
              </Text>
            </View>

            <Text style={[styles.label, { color: colors.text }]}>
              {i18n.t("manutencao.form.motoLabel")}
            </Text>
            <DropDownPicker
              open={openMoto}
              value={motoSelecionada}
              items={listaMotos}
              setOpen={setOpenMoto}
              setValue={setMotoSelecionada}
              setItems={setListaMotos}
              placeholder={i18n.t("manutencao.form.motoPlaceholder")}
              style={[styles.dropDown, { backgroundColor: colors.background }]}
              dropDownContainerStyle={[
                styles.dropDownContainer,
                { backgroundColor: colors.background },
              ]}
              zIndex={3000}
              zIndexInverse={1000}
              textStyle={{
                color: colors.text,
              }}
              placeholderStyle={{
                color: colors.text,
              }}
              ArrowDownIconComponent={({ style }) => (
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={colors.text}
                  styles={style}
                />
              )}
              ArrowUpIconComponent={({ style }) => (
                <Ionicons
                  name="chevron-up"
                  size={20}
                  color={colors.text}
                  styles={style}
                />
              )}
              TickIconComponent={({ style }) => (
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={colors.text}
                  styles={style}
                />
              )}
            />
            <Text style={[styles.label, { color: colors.text }]}>
              {i18n.t("manutencao.form.tipoLabel")}
            </Text>
            <DropDownPicker
              open={openTipo}
              value={tipo}
              items={tipos}
              setOpen={setOpenTipo}
              setValue={setTipo}
              setItems={setTipos}
              placeholder={i18n.t("manutencao.form.tipoPlaceholder")}
              style={[styles.dropDown, { backgroundColor: colors.background }]}
              dropDownContainerStyle={[
                styles.dropDownContainer,
                { backgroundColor: colors.background },
              ]}
              zIndex={2000}
              zIndexInverse={2000}
              textStyle={{
                color: colors.text,
              }}
              placeholderStyle={{
                color: colors.text,
              }}
              ArrowDownIconComponent={({ style }) => (
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={colors.text}
                  styles={style}
                />
              )}
              ArrowUpIconComponent={({ style }) => (
                <Ionicons
                  name="chevron-up"
                  size={20}
                  color={colors.text}
                  styles={style}
                />
              )}
              TickIconComponent={({ style }) => (
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={colors.text}
                  styles={style}
                />
              )}
            />
            <Text style={[styles.label, { color: colors.text }]}>
              {i18n.t("manutencao.form.descLabel")}
            </Text>
            <TextInput
              multiline
              numberOfLines={4}
              value={descricao}
              onChangeText={setDescricao}
              placeholder={i18n.t("manutencao.form.descPlaceholder")}
              placeholderTextColor={colors.subtext}
              style={[styles.descricao, { color: colors.text }]}
            />
            <TouchableOpacity style={styles.botao} onPress={salvarManutencao}>
              <Text style={[styles.botaoTexto, { color: colors.background }]}>
                {i18n.t("manutencao.form.button")}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.historico, { color: colors.text }]}>
              {i18n.t("manutencao.history.title")}
            </Text>

            {manutencoes.length === 0 && (
              <Text style={{ color: colors.subtext, marginTop: 10 }}>
                {i18n.t("manutencao.history.empty")}
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
            style={[styles.card, { backgroundColor: colors.background }]}
          >
            <View
              style={[styles.cardLeft, { backgroundColor: colors.background }]}
            >
              <Text style={[styles.cardTitulo, { color: colors.text }]}>
                {item.placa}
              </Text>
              <Text style={{ color: colors.text }}>{item.problemas}</Text>
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
              color={item.status === "excluido" ? "red" : rawColors.verde}
            />
          </TouchableOpacity>
        )}
      />
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#888" />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {i18n.t("manutencao.modal.title")}
            </Text>
            <View style={[styles.info, { backgroundColor: colors.background }]}>
              <View style={styles.desc}>
                <Text style={[styles.labelInfo, { color: colors.text }]}>
                  {i18n.t("manutencao.modal.date")}
                </Text>
                <Text style={[styles.inputInfo, { color: colors.subtext }]}>
                  {manutencaoSelecionada?.data
                    ? new Date(manutencaoSelecionada.data).toLocaleDateString(
                        "pt-BR"
                      )
                    : ""}
                </Text>
              </View>
              <View style={styles.desc}>
                <Text style={[styles.labelInfo, { color: colors.text }]}>
                  {i18n.t("manutencao.modal.moto")}
                </Text>
                <Text style={[styles.inputInfo, { color: colors.subtext }]}>
                  {manutencaoSelecionada?.placa}
                </Text>
              </View>
              <View style={styles.desc}>
                <Text style={[styles.labelInfo, { color: colors.text }]}>
                  {i18n.t("manutencao.modal.problema")}
                </Text>
                <Text style={[styles.inputInfo, { color: colors.subtext }]}>
                  {manutencaoSelecionada?.problemas}
                </Text>
              </View>
            </View>
            {manutencaoSelecionada?.status === "Aberta" ? (
              <View style={{ flexDirection: "row", gap: 20, marginTop: 20 }}>
                <TouchableOpacity onPress={concluirManutencao}>
                  <Text
                    style={[styles.confirmar, { color: colors.background }]}
                  >
                    {i18n.t("manutencao.modal.buttonConcluir")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={excluirManutencao}>
                  <Text style={[styles.excluir, { color: colors.background }]}>
                    {i18n.t("manutencao.modal.buttonExcluir")}
                  </Text>
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
                        ? rawColors.verde
                        : "red",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  {manutencaoSelecionada?.status === "Concluida"
                    ? i18n.t("manutencao.modal.statusConcluida")
                    : i18n.t("manutencao.modal.statusExcluida")}
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
                      ? rawColors.verde
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
    backgroundColor: rawColors.branco,
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
    borderColor: rawColors.verde,
    borderRadius: 12,
    padding: 10,
    width: "85%",
    marginBottom: 8,
  },
  descricao: {
    height: 100,
    textAlignVertical: "top",
    borderWidth: 2,
    borderColor: rawColors.verde,
    borderRadius: 12,
    padding: 10,
    width: "85%",
  },
  dropDown: {
    borderColor: rawColors.verde,
    borderWidth: 2,
    marginBottom: 10,
    width: "85%",
    alignSelf: "center",
    borderRadius: 12,
  },
  dropDownContainer: {
    borderColor: rawColors.verde,
    width: "85%",
    alignSelf: "center",
    borderWidth: 2,
  },
  botao: {
    backgroundColor: rawColors.verde,
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
    textAlign: "center",
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
    borderColor: rawColors.verde,
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
    color: rawColors.branco,
    backgroundColor: rawColors.verde,
    padding: 8,
    borderRadius: 12,
    width: 150,
    textAlign: "center",
  },
  excluir: {
    fontSize: 14,
    fontWeight: "bold",
    color: rawColors.branco,
    backgroundColor: "#fc0000",
    padding: 8,
    borderRadius: 12,
    width: 150,
    textAlign: "center",
  },
  info: {
    width: "100%",
    backgroundColor: rawColors.branco,
    gap: 12,
  },
  desc: {
    borderWidth: 2,
    borderColor: rawColors.verde,
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
