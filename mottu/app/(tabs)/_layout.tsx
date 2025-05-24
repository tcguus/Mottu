import { Tabs } from "expo-router";
import colors from "../../constants/theme";
import MotoIcon from "../../components/icons/MotoIcon";
import PatioIcon from "../../components/icons/PatioIcon";
import ManutencaoIcon from "../../components/icons/ManutencaoIcon";
import LocalizacaoIcon from "../../components/icons/LocalizacaoIcon";
import React from "react";
import { View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.verde,
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
              <MotoIcon color="#FFF" />
            </IconWrapper>
          ),
        }}
      />
        <Tabs.Screen
          name="manutencao"
          options={{
            tabBarIcon: ({ focused }: { focused: boolean }) => (
              <IconWrapper focused={focused}>
                <ManutencaoIcon color="#FFF" />
              </IconWrapper>
            ),
          }}
        />
      <Tabs.Screen
        name="patio"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <IconWrapper focused={focused}>
              <PatioIcon color="#FFF" />
            </IconWrapper>
          ),
        }}
      />
      <Tabs.Screen
        name="localizacao"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <IconWrapper focused={focused}>
              <LocalizacaoIcon color="#FFF" />
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
