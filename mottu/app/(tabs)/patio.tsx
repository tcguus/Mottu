import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DropDownPicker from "react-native-dropdown-picker";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../services/api";
import { rawColors } from "../../constants/theme";
import { useAppSettings } from "../../context/AppSettingsContext";
import i18n from "@/services/i18n";

type MotoApi = {
  placa: string;
  modelo: string;
  ano: number;
};

type ManutencaoApi = {
  placa: string;
  problemas: string;
  status: "Aberta" | "Concluida";
};

type MotoCompleta = MotoApi & {
  chassi: string;
  emManutencao: boolean;
  tipoManutencao: string | null;
};

const CHASSI_STORAGE_KEY = "@motos_chassi";

export default function Patio() {
  const { colors } = useAppSettings();
  const [motos, setMotos] = useState<MotoCompleta[]>([]);
  const [selectedMoto, setSelectedMoto] = useState<MotoCompleta | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownValue, setDropdownValue] = useState<string | null>(null);
  const [dropdownItems, setDropdownItems] = useState<any[]>([]);
  const [highlightedMoto, setHighlightedMoto] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const carregarDados = async () => {
        try {
          const [motosResponse, manutencoesResponse, chassiData] =
            await Promise.all([
              api.get("/Motos"),
              api.get("/Manutencoes"),
              AsyncStorage.getItem(CHASSI_STORAGE_KEY),
            ]);

          const motosDaApi: MotoApi[] = motosResponse.data.items;
          const manutencoesDaApi: ManutencaoApi[] =
            manutencoesResponse.data.items;
          const chassiMap: Record<string, string> = chassiData
            ? JSON.parse(chassiData)
            : {};
          const motosCompletas = motosDaApi.map((moto) => {
            const manut = manutencoesDaApi.find(
              (m) => m.status === "Aberta" && m.placa === moto.placa
            );
            return {
              ...moto,
              chassi: chassiMap[moto.placa] || "N/A",
              emManutencao: !!manut,
              tipoManutencao: manut?.problemas || null,
            };
          });

          setMotos(motosCompletas);
          setDropdownItems(
            motosCompletas.map((m) => ({
              label: `${m.placa} | ${m.modelo}`,
              value: `${m.placa} | ${m.modelo}`,
            }))
          );
        } catch (error) {
          console.error("Erro ao carregar dados do pátio:", error);
          Alert.alert(
            i18n.t("alerts.errorConexao"),
            i18n.t("patio.alert.loadError")
          );
        }
      };

      carregarDados();
    }, [])
  );

  const abrirModal = (moto: MotoCompleta) => {
    setSelectedMoto(moto);
    setModalVisible(true);
  };
  const fecharModal = () => {
    setModalVisible(false);
    setSelectedMoto(null);
  };
  const handleSelecionarMoto = (val: string) => {
    setDropdownValue(val);
    setHighlightedMoto(val);
    setTimeout(() => setHighlightedMoto(null), 3000);
  };

  const disponiveis = motos.filter((m) => !m.emManutencao);
  const manutencao = motos.filter((m) => m.emManutencao);
  const vagasPorColuna = 10;
  const coluna1 = disponiveis.slice(0, vagasPorColuna);
  const coluna3 = disponiveis.slice(vagasPorColuna);

  const renderColuna = (lista: MotoCompleta[], cor: string) => {
    const blocos = Array.from(
      { length: vagasPorColuna },
      (_, idx) => lista[idx] || null
    );
    return (
      <View
        style={[
          styles.coluna,
          cor === "yellow" ? styles.colunaManutencao : { borderColor: cor },
        ]}
      >
        {blocos.map((moto, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => moto && abrirModal(moto)}
            style={[
              styles.vaga,
              highlightedMoto === `${moto?.placa} | ${moto?.modelo}` &&
                styles.vagaDestaque,
            ]}
          >
            {moto && (
              <>
                <Image
                  source={getImage(moto.modelo)}
                  style={{ width: 32, height: 32 }}
                  resizeMode="contain"
                />
                {moto.emManutencao && (
                  <Ionicons
                    name="construct"
                    size={14}
                    color={rawColors.verde}
                    style={{ position: "absolute", top: 2, right: 2 }}
                  />
                )}
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={i18n.t("patio.headerTitle")} showBackButton={true} />

      <DropDownPicker
        open={dropdownOpen}
        value={dropdownValue}
        items={
          dropdownItems.length > 0
            ? dropdownItems
            : [
                {
                  label: i18n.t("patio.dropdownEmpty"),
                  value: null,
                  disabled: true,
                },
              ]
        }
        setOpen={setDropdownOpen}
        setValue={setDropdownValue}
        onChangeValue={(val: string | null) => {
          if (!val) return;
          const moto = motos.find((m) => `${m.placa} | ${m.modelo}` === val);
          if (moto) {
            handleSelecionarMoto(val);
          }
        }}
        setItems={setDropdownItems}
        placeholder={i18n.t("patio.dropdownPlaceholder")}
        dropDownDirection="BOTTOM"
        style={[styles.dropdown, { backgroundColor: colors.background }]}
        dropDownContainerStyle={[
          styles.dropdownList,
          { backgroundColor: colors.background },
        ]}
        zIndex={1}
        zIndexInverse={9}
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

      <FlatList
        data={[1]}
        keyExtractor={() => "grid"}
        contentContainerStyle={styles.scrollContent}
        renderItem={() => (
          <View style={styles.gridArea}>
            {renderColuna(coluna1, rawColors.verde)}
            {renderColuna(manutencao, "yellow")}
            {renderColuna(coluna3, rawColors.verde)}
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <TouchableOpacity onPress={fecharModal} style={styles.closeIcon}>
              <Ionicons name="close" size={28} color="#999" />
            </TouchableOpacity>
            <View style={[styles.info, { backgroundColor: colors.background }]}>
              <View style={styles.desc}>
                <Text style={[styles.labelInfo, { color: colors.text }]}>
                  {i18n.t("patio.modal.placaModelo")}
                </Text>
                <Text style={[styles.inputInfo, { color: colors.subtext }]}>
                  {selectedMoto?.placa} | {selectedMoto?.modelo}
                </Text>
              </View>
              <View style={styles.desc}>
                <Text style={[styles.labelInfo, { color: colors.text }]}>
                  {i18n.t("patio.modal.ano")}
                </Text>
                <Text style={[styles.inputInfo, { color: colors.subtext }]}>
                  {selectedMoto?.ano}
                </Text>
              </View>
              <View style={styles.desc}>
                <Text style={[styles.labelInfo, { color: colors.text }]}>
                  {i18n.t("patio.modal.chassi")}
                </Text>
                <Text style={[styles.inputInfo, { color: colors.subtext }]}>
                  {selectedMoto?.chassi}
                </Text>
              </View>
            </View>

            {selectedMoto?.emManutencao && (
              <View
                style={[
                  styles.infoProblema,
                  { backgroundColor: colors.background },
                ]}
              >
                <View
                  style={[styles.desc, { backgroundColor: colors.background }]}
                >
                  <Text style={[styles.labelInfo, { color: colors.text }]}>
                    {i18n.t("patio.modal.manutencaoAberta")}
                  </Text>
                  <Text style={[styles.inputInfo, { color: colors.subtext }]}>
                    {selectedMoto.tipoManutencao}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getImage = (modelo: string) => {
  switch (modelo) {
    case "Pop":
      return require("../../assets/images/pop.png");
    case "Sport":
      return require("../../assets/images/sport.png");
    case "-E":
      return require("../../assets/images/e.png");
    default:
      return require("../../assets/images/pop.png");
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: rawColors.branco,
    paddingTop: 160,
  },
  dropdown: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderColor: rawColors.verde,
    borderWidth: 2,
    borderRadius: 12,
    width: "90%",
    alignSelf: "center",
  },
  dropdownList: {
    borderColor: "#00B131",
    borderTopWidth: 0,
    marginHorizontal: 20,
    borderWidth: 2,
    width: "90%",
    alignSelf: "center",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  gridArea: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
    paddingHorizontal: 12,
  },
  coluna: {
    backgroundColor: "#eee",
    padding: 4,
    borderWidth: 2,
    borderColor: rawColors.verde,
    borderRadius: 6,
    width: 90,
    minHeight: 600,
  },
  colunaManutencao: {
    borderColor: "gold",
  },
  vaga: {
    height: 50,
    marginVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#aaa",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  vagaDestaque: {
    backgroundColor: "#d6f5d6",
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: rawColors.branco,
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 12,
  },
  modalText: {
    fontSize: 14,
    color: "#555",
  },
  closeIcon: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  info: {
    width: "85%",
    backgroundColor: rawColors.branco,
    gap: 12,
  },
  desc: {
    borderWidth: 2,
    borderColor: rawColors.verde,
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
  infoProblema: {
    width: "85%",
    backgroundColor: rawColors.branco,
    gap: 12,
    marginTop: 12,
  },
});
