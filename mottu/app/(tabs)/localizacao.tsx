import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import DropDownPicker from "react-native-dropdown-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../services/api";
import { useTheme } from "../../context/ThemeContext";
import { darkMapStyle } from "../../constants/mapStyles";
import { rawColors } from "../../constants/theme";

type MotoApi = {
  placa: string;
  modelo: string;
  ano: number;
};
type ManutencaoApi = {
  placa: string;
  status: "Aberta" | "Concluida";
};
type MotoCompleta = MotoApi & {
  chassi: string;
  latitude: number;
  longitude: number;
};

const CHASSI_STORAGE_KEY = "@motos_chassi";
const COORDS_STORAGE_KEY = "@motos_coords";
const SAO_PAULO_COORDS = { latitude: -23.567776, longitude: -46.709247 };
const RAIO_METROS = 10000;

export default function Localizacao() {
  const { theme, colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [motos, setMotos] = useState<MotoCompleta[]>([]);
  const [selectedMoto, setSelectedMoto] = useState<MotoCompleta | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownValue, setDropdownValue] = useState<string | null>(null);
  const [dropdownItems, setDropdownItems] = useState<any[]>([]);
  const mapRef = useRef<MapView | null>(null);

  const gerarCoordenadasAleatorias = (
    lat: number,
    lon: number,
    raio: number
  ) => {
    const r = raio / 111300;
    const u = Math.random();
    const v = Math.random();
    const w = r * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const dx = w * Math.cos(t);
    const dy = w * Math.sin(t);
    const newLat = lat + dy;
    const newLon = lon + dx / Math.cos((lat * Math.PI) / 180);
    return { latitude: newLat, longitude: newLon };
  };

  useFocusEffect(
    useCallback(() => {
      const carregarDados = async () => {
        setIsLoading(true);
        try {
          const minimumTimePromise = new Promise((resolve) =>
            setTimeout(resolve, 1500)
          );
          const fetchDataPromise = async () => {
            const [motosResponse, manutencoesResponse, chassiData, coordsData] =
              await Promise.all([
                api.get("/Motos"),
                api.get("/Manutencoes"),
                AsyncStorage.getItem(CHASSI_STORAGE_KEY),
                AsyncStorage.getItem(COORDS_STORAGE_KEY),
              ]);

            const motosDaApi: MotoApi[] = motosResponse.data.items;
            const manutencoesDaApi: ManutencaoApi[] =
              manutencoesResponse.data.items;
            const chassiMap: Record<string, string> = chassiData
              ? JSON.parse(chassiData)
              : {};
            const coordsMap: Record<
              string,
              { latitude: number; longitude: number }
            > = coordsData ? JSON.parse(coordsData) : {};

            const placasEmManutencao = new Set(
              manutencoesDaApi
                .filter((m) => m.status === "Aberta")
                .map((m) => m.placa)
            );
            const motosDisponiveis = motosDaApi.filter(
              (moto) => !placasEmManutencao.has(moto.placa)
            );
            const motosCompletas = motosDisponiveis.map((moto) => {
              let coords = coordsMap[moto.placa];
              if (!coords) {
                coords = gerarCoordenadasAleatorias(
                  SAO_PAULO_COORDS.latitude,
                  SAO_PAULO_COORDS.longitude,
                  RAIO_METROS
                );
                coordsMap[moto.placa] = coords;
              }
              return {
                ...moto,
                chassi: chassiMap[moto.placa] || "N/A",
                latitude: coords.latitude,
                longitude: coords.longitude,
              };
            });
            await AsyncStorage.setItem(
              COORDS_STORAGE_KEY,
              JSON.stringify(coordsMap)
            );
            setMotos(motosCompletas);
            setDropdownItems(
              motosCompletas.map((m) => ({
                label: `${m.placa} | ${m.modelo}`,
                value: `${m.placa} | ${m.modelo}`,
              }))
            );
          };

          await Promise.all([fetchDataPromise(), minimumTimePromise]);
        } catch (error) {
          console.error("Erro ao carregar motos para o mapa:", error);
          Alert.alert(
            "Erro de Conexão",
            "Não foi possível carregar as motos disponíveis."
          );
        } finally {
          setIsLoading(false);
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
        <Header title="Localização" showBackButton={true} />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={{ marginTop: 10, color: colors.tint }}>
            Carregando mapa...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Localização" showBackButton={true} />

      <View style={styles.dropdownContainer}>
        <DropDownPicker
          open={dropdownOpen}
          value={dropdownValue}
          items={
            dropdownItems.length > 0
              ? dropdownItems
              : [
                  {
                    label: "Nenhuma moto disponível",
                    value: null,
                    disabled: true,
                  },
                ]
          }
          setOpen={setDropdownOpen}
          setValue={setDropdownValue}
          onChangeValue={(val: string | null) => {
            const moto = motos.find((m) => `${m.placa} | ${m.modelo}` === val);
            if (moto) {
              mapRef.current?.animateToRegion(
                {
                  latitude: moto.latitude,
                  longitude: moto.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                },
                1000
              );
              setTimeout(() => abrirModal(moto), 1000);
            }
          }}
          setItems={setDropdownItems}
          placeholder="Lista das motos ativas"
          dropDownDirection="BOTTOM"
          style={[
            styles.dropdown,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
          dropDownContainerStyle={[
            styles.dropdownList,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
          textStyle={{ color: colors.text }}
          placeholderStyle={{ color: colors.text }}
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
          zIndex={10}
          zIndexInverse={9}
        />
      </View>

      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          ...SAO_PAULO_COORDS,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        customMapStyle={theme === "dark" ? darkMapStyle : []}
        scrollEnabled={!modalVisible}
        zoomEnabled={!modalVisible}
      >
        {motos.map((moto, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: moto.latitude,
              longitude: moto.longitude,
            }}
            title={`${moto.placa} | ${moto.modelo}`}
            onPress={() => {
              mapRef.current?.animateToRegion(
                {
                  latitude: moto.latitude,
                  longitude: moto.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                },
                1000
              );
              setTimeout(() => abrirModal(moto), 1000);
            }}
          >
            <Image
              source={getImage(moto.modelo)}
              style={{ width: 32, height: 32 }}
              resizeMode="contain"
            />
          </Marker>
        ))}
      </MapView>

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
                  Placa e modelo:
                </Text>
                <Text style={[styles.inputInfo, { color: colors.subtext }]}>
                  {selectedMoto?.placa} | {selectedMoto?.modelo}
                </Text>
              </View>
              <View style={styles.desc}>
                <Text style={[styles.labelInfo, { color: colors.text }]}>
                  Ano:
                </Text>
                <Text style={[styles.inputInfo, { color: colors.subtext }]}>
                  {selectedMoto?.ano}
                </Text>
              </View>
              <View style={styles.desc}>
                <Text style={[styles.labelInfo, { color: colors.text }]}>
                  Chassi (VIN):
                </Text>
                <Text style={[styles.inputInfo, { color: colors.subtext }]}>
                  {selectedMoto?.chassi}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdownContainer: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: "center",
  },
  dropdown: {
    width: "90%",
    borderRadius: 12,
    marginTop: 60,
    marginLeft: "5%",
  },
  dropdownList: {
    width: "90%",
    borderRadius: 12,
    marginTop: 60,
    marginLeft: "5%",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 36,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: "center",
  },
  closeIcon: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  info: {
    width: "85%",
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
});
