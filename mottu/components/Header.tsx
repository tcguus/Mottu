import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Easing,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import colors from "../constants/theme";
import { useAuth } from "../context/UserContext";

type HeaderProps = {
  title?: string;
  showBackButton?: boolean;
};

export default function Header({ title, showBackButton = false }: HeaderProps) {
  const router = useRouter();
  const { usuario, logout } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  // Animação do círculo girando
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  }, [spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const toggleDrawer = () => {
    if (drawerOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
      ]).start(() => setDrawerOpen(false));
    } else {
      setDrawerOpen(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
      ]).start();
    }
  };

  const drawerTranslate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-250, 0],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const handleLogout = () => {
    setShowLoading(true);
    setTimeout(() => {
      logout();
      setShowLoading(false);
      router.replace("/");
    }, 2000);
  };

  return (
    <>
      {/* Tela de carregamento */}
      {showLoading && (
        <Modal transparent animationType="fade">
          <View style={styles.loadingOverlay}>
            <Animated.View
              style={[styles.spinner, { transform: [{ rotate: spin }] }]}
            />
            <Text style={styles.loadingText}>Desconectando...</Text>
          </View>
        </Modal>
      )}

      {/* Overlay escuro ao abrir drawer */}
      {drawerOpen && <View style={styles.fullOverlay} />}

      {/* Drawer animado */}
      <Animated.View
        style={[
          styles.drawer,
          { transform: [{ translateX: drawerTranslate }] },
        ]}
      >
        <TouchableOpacity onPress={toggleDrawer}>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons
              name="chevron-forward-outline"
              size={24}
              color={colors.branco}
            />
          </Animated.View>
        </TouchableOpacity>

        {usuario && (
          <View style={styles.drawerContent}>
            <Text style={styles.drawerText}>{usuario.nome}</Text>
            <Text style={styles.drawerSubText}>
              {usuario.funcao} | ID: {usuario.id}
            </Text>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color={colors.branco}
              />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* Header principal */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.backButton}>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons
              name="chevron-forward-outline"
              size={24}
              color={colors.branco}
            />
          </Animated.View>
        </TouchableOpacity>
        <Image
          source={require("../assets/images/mottu-logo.png")}
          style={{ width: 80, height: 80, marginTop: 4 }}
        />
        <View style={styles.placeholder} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: colors.verde,
    zIndex: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    padding: 4,
  },
  placeholder: {
    width: 24,
  },
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 88,
    width: 250,
    backgroundColor: "#444",
    zIndex: 20,
    paddingLeft: 16,
    paddingTop: 8,
    borderBottomRightRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 52,
  },
  drawerContent: {
    flexDirection: "column",
    marginLeft: 12,
  },
  drawerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.branco,
  },
  drawerSubText: {
    fontSize: 14,
    color: colors.branco,
    marginTop: 4,
  },
  fullOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 9,
  },
  logoutText: {
    color: colors.branco,
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  spinner: {
    width: 60,
    height: 60,
    borderWidth: 6,
    borderColor: "#333",
    borderTopColor: colors.verde,
    borderRadius: 30,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    color: colors.branco,
    fontWeight: "bold",
  },
});
