import { createContext, ReactNode, useContext, useState } from "react";

export type LayoutContextType = {
    isGridView: boolean;
    toggleView: () => void;
};

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
    const [isGridView, setIsGridView] = useState(true);
    const toggleView = () => setIsGridView(prev => !prev);
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