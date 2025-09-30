import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import api from "../services/api";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  nome: string;
  email: string;
}

interface UserContextType {
  signIn: (email: string, senha: string) => Promise<void>;
  signOut: () => void;
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

const getUserFromToken = (token: string): User | null => {
  try {
    const decoded: any = jwtDecode(token);
    return {
      id: decoded.uid,
      nome: decoded.nome,
      email: decoded.email,
    };
  } catch (e) {
    console.error("Token inválido ou expirado:", e);
    return null;
  }
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    async function loadUserFromStorage() {
      try {
        const storedToken = await AsyncStorage.getItem("userToken");
        if (storedToken) {
          const userData = getUserFromToken(storedToken);
          if (userData) {
            setUser(userData);
            setToken(storedToken);
            api.defaults.headers.Authorization = `Bearer ${storedToken}`;
          } else {
            await AsyncStorage.removeItem("userToken");
          }
        }
      } catch (e) {
        console.error("Falha ao carregar o token do armazenamento", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadUserFromStorage();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const inTabsGroup = segments[0] === "(tabs)";
    if (!token && inTabsGroup) {
      router.replace("/");
    } else if (token && !inTabsGroup) {
      router.replace("/(tabs)/motos");
    }
  }, [token, segments, isLoading, router]);

  const signIn = async (email: string, senha: string) => {
    try {
      const { data } = await api.post("/Auth/login", { email, senha });
      const newToken = data.token;

      await AsyncStorage.setItem("userToken", newToken);
      const userData = getUserFromToken(newToken);

      if (userData) {
        setUser(userData);
      }

      setToken(newToken);
      api.defaults.headers.Authorization = `Bearer ${newToken}`;
    } catch (error) {
      console.error("Login falhou", error);
      throw error;
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem("userToken");
    setToken(null);
    setUser(null);
    delete api.defaults.headers.Authorization;
    router.replace("/");
  };

  return (
    <UserContext.Provider value={{ signIn, signOut, user, token, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}
