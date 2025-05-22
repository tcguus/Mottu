import { Slot } from "expo-router";
import React from "react";
import { AuthProvider } from "../context/UserContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
