import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import DropDownPicker from "react-native-dropdown-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
import colors from "../../constants/theme";
import { useFocusEffect } from "@react-navigation/native";

const SAO_PAULO_COORDS = { latitude: -23.567776, longitude: -46.709247 };
const RAIO_METROS = 10000;

export default function Localizacao() {
  const [motos, setMotos] = useState<any[]>([]);
  const [motosFiltradas, setMotosFiltradas] = useState<any[]>([]);
  const [selectedMoto, setSelectedMoto] = useState<any | null>(null);
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

  const carregarMotos = useCallback(async () => {
    const dataMotos = await AsyncStorage.getItem("@motos");
    const dataManut = await AsyncStorage.getItem("@manutencoes");

    let listaMotos = dataMotos ? JSON.parse(dataMotos) : [];
    const manutencoesPendentes = dataManut
      ? JSON.parse(dataManut)
          .filter((m: any) => m.status === "pendente")
          .map((m: any) => m.moto)
      : [];

    listaMotos = listaMotos.filter((m: any) => {
      const identificador = `${m.placa} | ${m.modelo}`;
      return !manutencoesPendentes.includes(identificador);
    });

    const comCoordenadas = listaMotos.map((moto: any) => ({
      ...moto,
      latitude:
        moto.latitude ??
        gerarCoordenadasAleatorias(
          SAO_PAULO_COORDS.latitude,
          SAO_PAULO_COORDS.longitude,
          RAIO_METROS
        ).latitude,
      longitude:
        moto.longitude ??
        gerarCoordenadasAleatorias(
          SAO_PAULO_COORDS.latitude,
          SAO_PAULO_COORDS.longitude,
          RAIO_METROS
        ).longitude,
    }));

    setMotos(comCoordenadas);
    setMotosFiltradas(comCoordenadas);
    setDropdownItems(
      comCoordenadas.map((m: any) => ({
        label: `${m.placa} | ${m.modelo}`,
        value: `${m.placa} | ${m.modelo}`,
      }))
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarMotos();
    }, [carregarMotos])
  );

  const abrirModal = (moto: any) => {
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

  return (
    <View style={{ flex: 1 }}>
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
                    label: "Nenhuma moto encontrada",
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
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownList}
          textStyle={{ color: "black" }}
          placeholderStyle={{ color: "#888" }}
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
        scrollEnabled={!modalVisible}
        zoomEnabled={!modalVisible}
      >
        {motosFiltradas.map((moto, index) => (
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
                <Text style={styles.labelInfo}>Chassi (VIN)</Text>
                <Text style={styles.inputInfo}>{selectedMoto?.ano}</Text>
              </View>
              <View style={styles.desc}>
                <Text style={styles.labelInfo}>Ano:</Text>
                <Text style={styles.inputInfo}>{selectedMoto?.chassi}</Text>
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
    borderColor: colors.verde,
    borderWidth: 2,
    borderRadius: 12,
    marginTop: 60,
    marginLeft: "5%",
  },
  dropdownList: {
    width: "90%",
    borderColor: colors.verde,
    borderWidth: 1,
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
    backgroundColor: colors.branco,
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
