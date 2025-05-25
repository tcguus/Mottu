import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DropDownPicker from "react-native-dropdown-picker";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
import colors from "../../constants/theme";
import { useFocusEffect } from "@react-navigation/native";

export default function Patio() {
  const [motos, setMotos] = useState<any[]>([]);
  const [selectedMoto, setSelectedMoto] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownValue, setDropdownValue] = useState<string | null>(null);
  const [dropdownItems, setDropdownItems] = useState<any[]>([]);
  const [highlightedMoto, setHighlightedMoto] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadMotos = async () => {
        const data = await AsyncStorage.getItem("@motos");
        const dataManutencao = await AsyncStorage.getItem("@manutencoes");
        const motosCadastradas = data ? JSON.parse(data) : [];
        const manutencoes = dataManutencao ? JSON.parse(dataManutencao) : [];

        const motosComInfos = motosCadastradas.map((moto: any) => {
          const manut = manutencoes.find(
            (m: any) =>
              m.status === "pendente" &&
              m.moto === `${moto.placa} | ${moto.modelo}`
          );
          return {
            ...moto,
            emManutencao: !!manut,
            tipoManutencao: manut?.tipo || null,
            descricao: manut?.descricao || null,
          };
        });

        setMotos(motosComInfos);

        setDropdownItems(
          motosComInfos.map((m: any) => ({
            label: `${m.placa} | ${m.modelo}`,
            value: `${m.placa} | ${m.modelo}`,
          }))
        );
      };

      loadMotos();
    }, [])
  );

  const abrirModal = (moto: any) => {
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

  const renderColuna = (lista: any[], cor: string) => {
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
                    color={colors.verde}
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
    <View style={styles.container}>
      <Header title="Pátio Digital" showBackButton={true} />

      <DropDownPicker
        open={dropdownOpen}
        value={dropdownValue}
        items={
          dropdownItems.length > 0
            ? dropdownItems
            : [
                {
                  label: "Nenhuma moto encontrada",
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
        placeholder="Pesquise por placa"
        dropDownDirection="BOTTOM"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownList}
        textStyle={{ color: "black" }}
        placeholderStyle={{ color: "#888" }}
        zIndex={10}
        zIndexInverse={9}
      />

      <FlatList
        data={[1]}
        keyExtractor={() => "grid"}
        contentContainerStyle={styles.scrollContent}
        renderItem={() => (
          <View style={styles.gridArea}>
            {renderColuna(coluna1, colors.verde)}
            {renderColuna(manutencao, "yellow")}
            {renderColuna(coluna3, colors.verde)}
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={fecharModal} style={styles.closeIcon}>
              <Ionicons name="close" size={28} color="#999" />
            </TouchableOpacity>
            <View style={styles.info}>
              <View style={styles.desc}>
                <Text style={styles.labelInfo}>Placa e modelo:</Text>
                <Text style={styles.inputInfo}>
                  {selectedMoto?.placa} | {selectedMoto?.modelo}
                </Text>
              </View>
              <View style={styles.desc}>
                <Text style={styles.labelInfo}>Chassi (VIN):</Text>
                <Text style={styles.inputInfo}>{selectedMoto?.ano}</Text>
              </View>
              <View style={styles.desc}>
                <Text style={styles.labelInfo}>Ano:</Text>
                <Text style={styles.inputInfo}>{selectedMoto?.chassi}</Text>
              </View>
            </View>

            {selectedMoto?.tipoManutencao && selectedMoto?.descricao && (
              <>
                <View style={styles.infoProblema}>
                  <View style={styles.desc}>
                    <Text style={styles.labelInfo}>Tipo de manutenção:</Text>
                    <Text style={styles.inputInfo}>
                      {selectedMoto.tipoManutencao}
                    </Text>
                  </View>
                  <View style={styles.desc}>
                    <Text style={styles.labelInfo}>Descrição:</Text>
                    <Text style={styles.inputInfo}>
                      {selectedMoto.descricao.length > 30
                        ? `${selectedMoto.descricao.slice(0, 27)}...`
                        : selectedMoto.descricao}
                    </Text>
                  </View>
                </View>
              </>
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
    backgroundColor: colors.branco,
    paddingTop: 160,
  },
  dropdown: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderColor: colors.verde,
    borderWidth: 2,
    borderRadius: 12,
    width: "90%",
    alignSelf: "center",
  },
  dropdownList: {
    borderColor: "#888",
    marginHorizontal: 20,
    borderWidth: 1,
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
    borderColor: colors.verde,
    borderRadius: 6,
    width: 90,
    minHeight: 600,
  },
  colunaManutencao: {
    borderColor: "yellow",
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
    backgroundColor: colors.branco,
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
  infoProblema: {
    width: "85%",
    backgroundColor: colors.branco,
    gap: 12,
    marginTop: 12,
  },
});
