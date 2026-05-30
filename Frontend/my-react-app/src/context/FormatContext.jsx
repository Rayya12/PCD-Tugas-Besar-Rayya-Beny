import { createContext, useContext, useState } from "react";

const FormatContext = createContext();

export function FormatProvider({ children }) {
    const [format, setFormat] = useState("PNG");

    return (
        <FormatContext.Provider value={{ format, setFormat }}>
            {children}
        </FormatContext.Provider>
    );
}

export function useFormat() {
    const context = useContext(FormatContext);
    if (!context) {
        throw new Error("useFormat must be used within a FormatProvider");
    }
    return context;
}