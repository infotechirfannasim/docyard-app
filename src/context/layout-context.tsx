import { LAYOUT_KEY } from "@/constants/constant-variables";
import * as SecureStore from "expo-secure-store";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export type LayoutContextType = {
    isGridView: boolean;
    toggleView: () => void;
};

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
    const [isGridView, setIsGridView] = useState(true);

    useEffect(() => {
        (async () => {
            const saved = await SecureStore.getItemAsync(LAYOUT_KEY);
            if (saved !== null) {
                setIsGridView(saved === "grid");
            }
        })();
    }, []);

    const toggleView = () => {
        setIsGridView(prev => {
            const next = !prev;
            SecureStore.setItemAsync(LAYOUT_KEY, next ? "grid" : "list");
            return next;
        });
    };

    return (
        <LayoutContext.Provider value={{ isGridView, toggleView }}>
            {children}
        </LayoutContext.Provider>
    );
}

export const useLayout = () => {
    const context = useContext(LayoutContext);

    if(!context) {
        throw new Error("useLayout must be used within a LayoutProvider");
    }
    return context;
}