import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../../components/Header";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";
import { rawColors } from "@/constants/theme";
import { useAppSettings } from "../../context/AppSettingsContext";
import i18n from "@/services/i18n"; 

type ModeloType = "Pop" | "Sport" | "-E";
type MotoType = {
  modelo: ModeloType;
  placa: string;
  ano: number;
  chassi: string;
};

const CHASSI_STORAGE_KEY = "@motos_chassi";
const imagens: Record<ModeloType, any> = {
  Pop: require("../../assets/images/pop.png"),
  Sport: require("../../assets/images/sport.png"),
  "-E": require("../../assets/images/e.png"),
};

export default function CadastroMoto() {
  const { colors } = useAppSettings();
  const [isLoading, setIsLoading] = useState(true);
  const [motos, setMotos] = useState<MotoType[]>([]);
  const [placa, setPlaca] = useState("");
  const [ano, setAno] = useState("");
  const [chassi, setChassi] = useState("");
  const [modelo, setModelo] = useState<ModeloType>("Sport");
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [motoParaExcluir, setMotoParaExcluir] = useState<string | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const loadMotos = async () => {
    if (!isLoading) setIsLoading(true);

    try {
      const minimumTimePromise = new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );
      const fetchDataPromise = async () => {
        const response = await api.get("/Motos");
        const motosDaApi = response.data.items;
        const chassiData = await AsyncStorage.getItem(CHASSI_STORAGE_KEY);
        const chassiMap: Record<string, string> = chassiData
          ? JSON.parse(chassiData)
          : {};

        const motosCompletas = motosDaApi.map(
          (moto: Omit<MotoType, "chassi">) => ({
            ...moto,
            chassi: chassiMap[moto.placa] || "N/A",
          })
        );
        setMotos(motosCompletas);
      };
      await Promise.all([fetchDataPromise(), minimumTimePromise]);
    } catch (error) {
      console.error(error);
      Alert.alert(i18n.t("alerts.error"), i18n.t("motos.alert.loadError"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMotos();
  }, []);

  const adicionarMoto = async () => {
    if (!placa || !ano || !modelo || !chassi) {
      Alert.alert(i18n.t("alerts.attention"), i18n.t("motos.alert.fillAll"));
      return;
    }

    try {
      const anoNumber = parseInt(ano, 10);
      if (isNaN(anoNumber)) {
        Alert.alert(i18n.t("alerts.error"), i18n.t("motos.alert.invalidYear"));
        return;
      }

      const novaMotoApi = {
        Placa: placa,
        Ano: anoNumber,
        Modelo: modelo,
      };

      await api.post("/Motos", novaMotoApi);

      const chassiData = await AsyncStorage.getItem(CHASSI_STORAGE_KEY);
      const chassiMap = chassiData ? JSON.parse(chassiData) : {};
      chassiMap[placa] = chassi;
      await AsyncStorage.setItem(CHASSI_STORAGE_KEY, JSON.stringify(chassiMap));

      setPlaca("");
      setAno("");
      setChassi("");
      setModelo("Sport");
      setModalVisible(false);

      await loadMotos();
    } catch (error: any) {
      console.error("Erro no cadastro:", error.response?.data);
      const errorMessage =
        error.response?.data?.message || i18n.t("motos.alert.addError");
      Alert.alert(i18n.t("alerts.errorCadastro"), errorMessage);
    }
  };

  const deletarMoto = async (placaParaDeletar: string) => {
    try {
      await api.delete(`/Motos/${placaParaDeletar}`);
      const chassiData = await AsyncStorage.getItem(CHASSI_STORAGE_KEY);
      if (chassiData) {
        const chassiMap = JSON.parse(chassiData);
        delete chassiMap[placaParaDeletar];
        await AsyncStorage.setItem(
          CHASSI_STORAGE_KEY,
          JSON.stringify(chassiMap)
        );
      }

      await loadMotos();
    } catch (error: any) {
      console.error("Erro ao excluir:", error.response?.data);
      const errorMessage =
        error.response?.data?.message || i18n.t("motos.alert.deleteError");
      Alert.alert(i18n.t("alerts.errorExcluir"), errorMessage);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          },
          { backgroundColor: colors.background },
        ]}
      >
        <Header title={i18n.t("motos.headerTitle")} showBackButton={true} />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={rawColors.verde} />
          <Text style={{ marginTop: 10, color: rawColors.verde }}>
            {i18n.t("motos.loading")}
          </Text>
        </View>
      </View>
    );
  }

  const motosFiltradas = motos.filter((moto) =>
    moto.placa.toLowerCase().includes(search.toLowerCase())
  );

  if (motos.length > 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title={i18n.t("motos.headerTitle")} showBackButton={true} />
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={i18n.t("motos.searchPlaceholder")}
            placeholderTextColor={colors.text}
            value={search}
            onChangeText={setSearch}
          />
          <Ionicons
            name="search-outline"
            size={22}
            color={rawColors.verde}
            style={styles.searchIcon}
          />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          {i18n.t("motos.listTitle")}
        </Text>
        <FlatList
          data={motosFiltradas}
          keyExtractor={(item) => item.placa}
          style={{ width: "90%", maxHeight: "72%" }}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={() => (
            <Text
              style={[
                {
                  marginTop: 16,
                  color: "#888",
                  fontWeight: "bold",
                  textAlign: "center",
                },
                { color: colors.text },
              ]}
            >
              {i18n.t("motos.listEmpty")}
            </Text>
          )}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.background }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.modelo}>{item.modelo}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setMotoParaExcluir(item.placa);
                    setConfirmVisible(true);
                  }}
                >
                  <Ionicons name="trash" size={22} color="#999" />
                </TouchableOpacity>
              </View>
              <View style={styles.infos}>
                <View
                  style={[styles.info, { backgroundColor: colors.background }]}
                >
                  <View style={styles.desc}>
                    <Text style={[styles.labelInfo, { color: colors.text }]}>
                      {i18n.t("motos.card.placa")}
                    </Text>
                    <Text style={[styles.inputInfo, { color: colors.subtext }]}>
                      {item.placa}
                    </Text>
                  </View>
                  <View style={styles.desc}>
                    <Text style={[styles.labelInfo, { color: colors.text }]}>
                      {i18n.t("motos.card.ano")}
                    </Text>
                    <Text style={[styles.inputInfo, { color: colors.subtext }]}>
                      {item.ano}
                    </Text>
                  </View>
                  <View style={styles.desc}>
                    <Text style={[styles.labelInfo, { color: colors.text }]}>
                      {i18n.t("motos.card.chassi")}
                    </Text>
                    <Text style={[styles.inputInfo, { color: colors.subtext }]}>
                      {item.chassi}
                    </Text>
                  </View>
                </View>
                <Image
                  source={imagens[item.modelo]}
                  style={styles.infoMoto}
                  resizeMode="contain"
                />
              </View>
            </View>
          )}
        />
        <Modal
          transparent
          visible={confirmVisible}
          animationType="fade"
          onRequestClose={() => setConfirmVisible(false)}
        >
          <View style={styles.modallOverlay}>
            <View
              style={[
                styles.modallContent,
                { backgroundColor: colors.background },
              ]}
            >
              <Text style={styles.bemVindo}>{i18n.t("motos.deleteModal")}</Text>
              <View style={{ flexDirection: "row", gap: 24 }}>
                <TouchableOpacity
                  onPress={() => {
                    if (motoParaExcluir !== null) deletarMoto(motoParaExcluir);
                    setConfirmVisible(false);
                  }}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={48}
                    color={rawColors.verde}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setConfirmVisible(false)}>
                  <Ionicons name="close-circle" size={48} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.addButtonText, { color: colors.background }]}>
            +
          </Text>
        </TouchableOpacity>
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: colors.background },
              ]}
            >
              <TouchableOpacity
                style={styles.closeIcon}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={28} color="#999" />
              </TouchableOpacity>
              <Text style={[styles.title, { color: colors.text }]}>
                {i18n.t("motos.addModal.title")}
              </Text>
              <View
                style={[
                  styles.modeloContainer,
                  { backgroundColor: colors.background },
                ]}
              >
                {["Pop", "Sport", "-E"].map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setModelo(item as ModeloType)}
                    style={[
                      styles.modeloButton,
                      {
                        borderColor: colors.border,
                        backgroundColor:
                          modelo === item ? colors.tint : "transparent",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modeloButtonText,
                        {
                          color:
                            modelo === item ? colors.background : colors.tint,
                        },
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Image
                source={imagens[modelo]}
                style={styles.imagemMoto}
                resizeMode="contain"
              />
              <View style={styles.inputt}>
                <Text style={[styles.labelInfo, { color: colors.text }]}>
                  {i18n.t("motos.card.placa")}
                </Text>
                <TextInput
                  style={[styles.input, { color: colors.subtext }]}
                  placeholder={i18n.t("motos.addModal.placaPlaceholder")}
                  placeholderTextColor={"#888"}
                  value={placa}
                  maxLength={8}
                  onChangeText={(text) => {
                    let formatted = text
                      .replace(/[^A-Za-z0-9]/g, "")
                      .toUpperCase();
                    if (formatted.length > 3) {
                      formatted =
                        formatted.slice(0, 3) + "-" + formatted.slice(3);
                    }
                    setPlaca(formatted);
                  }}
                />
              </View>
              <View style={styles.inputt}>
                <Text style={[styles.labelInfo, { color: colors.text }]}>
                  {i18n.t("motos.card.ano")}
                </Text>
                <TextInput
                  style={[styles.input, { color: colors.subtext }]}
                  maxLength={4}
                  placeholder={i18n.t("motos.addModal.anoPlaceholder")}
                  placeholderTextColor={"#888"}
                  keyboardType="numeric"
                  value={ano}
                  onChangeText={setAno}
                />
              </View>
              <View style={styles.inputt}>
                <Text style={[styles.labelInfo, { color: colors.text }]}>
                  {i18n.t("motos.card.chassi")}
                </Text>
                <TextInput
                  style={[styles.input, { color: colors.subtext }]}
                  maxLength={17}
                  placeholder={i18n.t("motos.addModal.chassiPlaceholder")}
                  placeholderTextColor={"#888"}
                  value={chassi}
                  onChangeText={setChassi}
                />
              </View>
              <TouchableOpacity
                onPress={adicionarMoto}
                style={styles.botaoCadastrar}
              >
                <Text style={[styles.botaoTexto, { color: colors.background }]}>
                  {i18n.t("motos.addModal.button")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={i18n.t("motos.headerTitle")} showBackButton={true} />
      <Text style={[styles.title, { color: colors.text }]}>
        {i18n.t("motos.addModal.title")}
      </Text>
      <View style={styles.modeloContainer}>
        {["Pop", "Sport", "-E"].map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setModelo(item as ModeloType)}
            style={[
              styles.modeloButton,
              {
                borderColor: colors.border,
                backgroundColor: modelo === item ? colors.tint : "transparent",
              },
            ]}
          >
            <Text
              style={[
                styles.modeloButtonText,
                {
                  color: modelo === item ? colors.background : colors.tint,
                },
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Image
        source={imagens[modelo]}
        style={styles.imagemMoto}
        resizeMode="contain"
      />
      <View style={styles.inputGroup}>
        <View style={styles.inputt}>
          <Text style={[styles.labelInfo, { color: colors.text }]}>
            {i18n.t("motos.card.placa")}
          </Text>
          <TextInput
            style={[styles.input, { color: colors.subtext }]}
            placeholder={i18n.t("motos.addModal.placaPlaceholder")}
            placeholderTextColor={"#888"}
            value={placa}
            maxLength={8}
            onChangeText={(text) => {
              let formatted = text.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
              if (formatted.length > 3) {
                formatted = formatted.slice(0, 3) + "-" + formatted.slice(3);
              }
              setPlaca(formatted);
            }}
          />
        </View>
        <View style={styles.inputt}>
          <Text style={[styles.labelInfo, { color: colors.text }]}>
            {i18n.t("motos.card.ano")}
          </Text>
          <TextInput
            style={[styles.input, { color: colors.subtext }]}
            maxLength={4}
            placeholder={i18n.t("motos.addModal.anoPlaceholder")}
            placeholderTextColor={"#888"}
            keyboardType="numeric"
            value={ano}
            onChangeText={setAno}
          />
        </View>
        <View style={styles.inputt}>
          <Text style={[styles.labelInfo, { color: colors.text }]}>
            {i18n.t("motos.card.chassi")}
          </Text>
          <TextInput
            style={[styles.input, { color: colors.subtext }]}
            maxLength={17}
            placeholder={i18n.t("motos.addModal.chassiPlaceholder")}
            placeholderTextColor={"#888"}
            value={chassi}
            onChangeText={setChassi}
          />
        </View>
      </View>
      <TouchableOpacity onPress={adicionarMoto} style={styles.botaoCadastrar}>
        <Text style={[styles.botaoTexto, { color: colors.background }]}>
          {i18n.t("motos.addModal.button")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputt: {
    borderWidth: 2,
    borderColor: rawColors.verde,
    borderRadius: 12,
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 24,
    paddingRight: 24,
    fontWeight: "bold",
    width: "65%",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: -10,
  },
  input: {
    borderWidth: 0,
    marginBottom: -10,
    paddingLeft: -1,
    fontWeight: "bold",
    height: 40,
    color: "#888",
  },
  container: {
    flex: 1,
    backgroundColor: rawColors.branco,
    paddingTop: 140,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 24,
  },
  modeloContainer: {
    flexDirection: "row",
    marginVertical: 12,
    gap: 12,
  },
  modeloButton: {
    borderColor: rawColors.verde,
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    width: 120,
    alignItems: "center",
  },
  modeloButtonSelected: {
    backgroundColor: rawColors.verde,
  },
  modeloButtonText: {
    color: rawColors.verde,
    fontWeight: "600",
    fontSize: 24,
  },
  modeloButtonTextSelected: {
    color: rawColors.branco,
  },
  imagemMoto: {
    width: "50%",
    height: "25%",
    marginVertical: 12,
  },
  inputGroup: {
    width: "80%",
    gap: 14,
    marginVertical: 12,
    alignItems: "center",
  },
  botaoCadastrar: {
    backgroundColor: rawColors.verde,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 20,
  },
  botaoTexto: {
    color: rawColors.branco,
    fontWeight: "bold",
    fontSize: 18,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: rawColors.branco,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: rawColors.verde,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: "60%",
    marginTop: 24,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  searchIcon: {
    marginLeft: 8,
  },
  card: {
    borderWidth: 3,
    borderColor: rawColors.verde,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#Fff",
    alignItems: "center",
  },
  modelo: {
    fontSize: 22,
    fontWeight: "bold",
    color: rawColors.verde,
    alignSelf: "flex-start",
    marginBottom: -8,
  },
  addButton: {
    position: "absolute",
    bottom: 90,
    right: 24,
    backgroundColor: rawColors.verde,
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  addButtonText: {
    color: rawColors.branco,
    fontSize: 36,
    fontWeight: "bold",
    marginTop: -5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  inputField: {
    borderWidth: 2,
    borderColor: rawColors.verde,
    borderRadius: 12,
    padding: 10,
    width: "100%",
    marginBottom: 12,
    fontWeight: "bold",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
  },
  infos: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 12,
  },
  deleteButton: {
    fontSize: 22,
    color: "red",
    fontWeight: "bold",
    padding: 4,
  },
  infoMoto: {
    width: 120,
    height: 120,
    marginRight: 12,
  },
  info: {
    width: "50%",
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
  },
  labelInfo: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: -7,
  },
  modallOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modallContent: {
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
  closeIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
  },
});
