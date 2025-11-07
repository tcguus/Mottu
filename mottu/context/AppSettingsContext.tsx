import React, { createContext, useState, useContext, useEffect } from "react";
import { useColorScheme } from "react-native";
import { theme as appTheme } from "../constants/theme";
import i18n from "../services/i18n";

type Theme = "light" | "dark";
type Locale = "pt" | "es"; 

interface AppSettingsContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: typeof appTheme.light;
  locale: Locale; 
  setLocale: (locale: Locale) => void; 
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(
  undefined
);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(systemScheme || "light");
  const initialLocale = i18n.locale.startsWith("es") ? "es" : "pt";
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    setTheme(systemScheme || "light");
  }, [systemScheme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const setLocale = (newLocale: Locale) => {
    i18n.locale = newLocale;
    setLocaleState(newLocale);
  };

  const colors = appTheme[theme];

  return (
    <AppSettingsContext.Provider
      value={{ theme, toggleTheme, colors, locale, setLocale }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error("useAppSettings must be used within a AppSettingsProvider");
  }
  return context;
};
