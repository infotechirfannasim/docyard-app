import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Animated, Pressable } from "react-native";

type ToastType = "success" | "error" | "info";

type ToastContextType = {
  setToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType>({ setToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("info");
  const [visible, setVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout>>(setTimeout(() => {}, 0));

  const hide = useCallback(() => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => setVisible(false));
  }, [fadeAnim]);

  const setToast = useCallback((msg: string, t?: ToastType) => {
    clearTimeout(timerRef.current);
    setMessage(msg);
    setType(t || "info");
    setVisible(true);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    timerRef.current = setTimeout(hide, 3000);
  }, [fadeAnim, hide]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  if (!visible) return <ToastContext.Provider value={{ setToast }}>{children}</ToastContext.Provider>;

  const icons: Record<ToastType, keyof typeof Ionicons.glyphMap> = { success: "checkmark-circle", error: "alert-circle", info: "information-circle" };
  const colors: Record<ToastType, string> = { success: "#22c55e", error: "#ef4444", info: "#3b82f6" };

  return (
    <ToastContext.Provider value={{ setToast }}>
      {children}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 100,
          left: 24,
          right: 24,
          opacity: fadeAnim,
          transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
        }}
      >
        <Pressable
          onPress={hide}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            backgroundColor: "#1f2937",
            borderRadius: 12,
            paddingHorizontal: 18,
            paddingVertical: 14,
            elevation: 10,
            boxShadow: "0px 4px 12px rgba(0,0,0,0.25)",
          }}
        >
          <Ionicons name={icons[type]} size={22} color={colors[type]} />
          <ThemedText type="small" style={{ color: "white", flex: 1 }}>{message}</ThemedText>
        </Pressable>
      </Animated.View>
    </ToastContext.Provider>
  );
}
