import { Colors } from "@/constants/theme";
import { createContext, ReactNode, useContext, useState } from "react";
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
    // const systemTheme: ThemeMode = 'light';
    const [mode, setMode] = useState<ThemeMode>(systemTheme);

    const toggleTheme = ()=> setMode(prev => prev === 'dark' ? 'light' : 'dark');
    const setThemeMode = (themeMode: ThemeMode)=> setMode(themeMode);

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
