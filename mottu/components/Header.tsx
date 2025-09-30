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
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import { rawColors } from "@/constants/theme";

type HeaderProps = {
  title?: string;
  showBackButton?: boolean;
};


export default function Header({ title, showBackButton = false }: HeaderProps) {
  const router = useRouter();
  const { user, signOut } = useUser();
  const { theme, toggleTheme, colors } = useTheme();
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
      signOut();
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
          { transform: [{ translateX: drawerTranslate }] }, {backgroundColor: colors.card}
        ]}
      >
        <TouchableOpacity onPress={toggleDrawer}>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons
              name="chevron-forward-outline"
              size={24}
              color={colors.background}
            />
          </Animated.View>
        </TouchableOpacity>

        {user && (
          <View style={styles.drawerContent}>
            <Text style={[styles.drawerText, {color: colors.background}]}>Logado como:</Text>
            <Text style={[styles.drawerSubText, {color: colors.background}]}>
              {user.nome} 
            </Text>
            <View style={styles.teste}> 

            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color={colors.background}
              />
              <Text style={[styles.logoutText, {color: colors.background}]}>Log Out</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTheme} style={styles.actionButton}>
          <Ionicons
            name={theme === "light" ? "moon-outline" : "sunny-outline"}
            size={26}
            color={colors.background}
          />
        </TouchableOpacity>
            </View>
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
              color={colors.background}
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
    backgroundColor: rawColors.verde,
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
    backgroundColor: "#5",
    zIndex: 20,
    paddingLeft: 16,
    paddingTop: 0,
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
    marginTop: 13,
        gap: "4"

  },
  drawerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: rawColors.branco,
  },
  drawerSubText: {
    fontSize: 14,
    color: rawColors.branco,
    marginTop: -4,
    marginBottom: 8,
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
    color: rawColors.branco,
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
    borderTopColor: rawColors.verde,
    borderRadius: 30,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    color: rawColors.branco,
    fontWeight: "bold",
  },
  actionButton: {
    marginBottom: 4,
  },
  teste:{
    marginTop: -15,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: "70"
  }
});
