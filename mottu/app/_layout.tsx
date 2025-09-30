import { Stack } from "expo-router";
import { UserProvider } from "../context/UserContext";
import { ThemeProvider } from "../context/ThemeContext";
import React from "react";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="register" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </UserProvider>
    </ThemeProvider>
  );
}
