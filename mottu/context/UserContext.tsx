import React, { createContext, useState, useContext, ReactNode } from "react";

type Usuario = {
  nome: string;
  id: string;
  funcao: "Gerente" | "Operador";
} | null;

type AuthContextType = {
  usuario: Usuario;
  login: (user: Usuario) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario>(null);

  const login = (user: Usuario) => setUsuario(user);
  const logout = () => setUsuario(null);

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
