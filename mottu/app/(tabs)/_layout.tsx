import { Tabs } from "expo-router";
import MotoIcon from "../../components/icons/MotoIcon";
import PatioIcon from "../../components/icons/PatioIcon";
import ManutencaoIcon from "../../components/icons/ManutencaoIcon";
import LocalizacaoIcon from "../../components/icons/LocalizacaoIcon";
import SobreIcon from "../../components/icons/SobreIcon";
import React from "react";
import { View } from "react-native";
import { rawColors } from "@/constants/theme";
import { useAppSettings } from "../../context/AppSettingsContext";

export default function TabLayout() {
  const { colors } = useAppSettings();

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: rawColors.verde,
          borderRadius: 30,
          height: 60,
          width: "90%",
          paddingTop: 10,
          justifyContent: "center",
          alignSelf: "center",
          position: "absolute",
          marginLeft: "5%",
          marginRight: "5%",
          marginBottom: 20,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="motos"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <IconWrapper focused={focused}>
              <MotoIcon color={colors.background} />
            </IconWrapper>
          ),
        }}
      />
      <Tabs.Screen
        name="manutencao"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <IconWrapper focused={focused}>
              <ManutencaoIcon color={colors.background} />
            </IconWrapper>
          ),
        }}
      />
      <Tabs.Screen
        name="patio"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <IconWrapper focused={focused}>
              <PatioIcon color={colors.background} />
            </IconWrapper>
          ),
        }}
      />
      <Tabs.Screen
        name="localizacao"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <IconWrapper focused={focused}>
              <LocalizacaoIcon color={colors.background} />
            </IconWrapper>
          ),
        }}
      />

      <Tabs.Screen
        name="sobre"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <IconWrapper focused={focused}>
              <SobreIcon color={colors.background} size={24} />
            </IconWrapper>
          ),
        }}
      />
    </Tabs>
  );
}

function IconWrapper({
  children,
  focused,
}: {
  children: React.ReactNode;
  focused: boolean;
}) {
  return (
    <View
      style={{
        backgroundColor: focused ? "#078A2B" : "transparent",
        padding: 6,
        borderRadius: 12,
        width: 46,
        alignItems: "center",
      }}
    >
      {children}
    </View>
  );
}
