import { Stack } from "expo-router";
import { UserProvider } from "../context/UserContext";
import { ThemeProvider } from "../context/ThemeContext";
import React from 'react'; // 1. Importe o ThemeProvider

export default function RootLayout() {
  return (
    // 2. Envolva o UserProvider (e tudo mais) com o ThemeProvider
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