import { Colors } from "@/constants/theme";
import { THEME_MODE_KEY } from "@/constants/constant-variables";
import * as SecureStore from "expo-secure-store";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

type ThemeMode = 'dark' | 'light';

export type ThemeContextType = {
    mode: ThemeMode
    theme: typeof Colors.dark | typeof Colors.light,
    toggleTheme: () => void,
    setThemeMode: (themeMode: ThemeMode) => void
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({children} : {children: ReactNode})=> {
    const systemTheme = useColorScheme() === 'dark' ? 'dark' : 'light';
    const [mode, setMode] = useState<ThemeMode>(systemTheme);

    useEffect(() => {
        (async () => {
            const saved = await SecureStore.getItemAsync(THEME_MODE_KEY);
            if (saved !== null) {
                setMode(saved as ThemeMode);
            }
        })();
    }, []);

    const toggleTheme = () => setMode(prev => {
        const next = prev === 'dark' ? 'light' : 'dark';
        SecureStore.setItemAsync(THEME_MODE_KEY, next);
        return next;
    });
    const setThemeMode = (themeMode: ThemeMode) => {
        setMode(themeMode);
        SecureStore.setItemAsync(THEME_MODE_KEY, themeMode);
    };

    const theme = Colors[mode];

    return (
        <ThemeContext.Provider value={{mode, theme, toggleTheme, setThemeMode}}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    

    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
