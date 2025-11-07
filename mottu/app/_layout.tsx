import { Stack } from "expo-router";
import { UserProvider } from "../context/UserContext";
import { AppSettingsProvider } from "../context/AppSettingsContext";
import React from "react";

export default function RootLayout() {
  return (
    <AppSettingsProvider>
      <UserProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="register" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </UserProvider>
    </AppSettingsProvider>
  );
}
