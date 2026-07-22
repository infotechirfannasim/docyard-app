import { ThemeContextType } from "@/context/theme-provider";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { ThemedText } from "./themed-text";

type AnimatedToastProps = {
    message: string;
    type: 'success' | 'error';
    theme: ThemeContextType;
    onFinish: () => void;
};

export function AnimatedToast({ message, type, theme, onFinish }: AnimatedToastProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        if (!message) return;

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();

        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 20,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]).start(() => onFinish());
        }, 3000);

        return () => clearTimeout(timer);
    }, [message]);

    if (!message) return null;

    return (
        <Animated.View
            style={{
                position: 'absolute',
                bottom: 20,
                left: 24,
                right: 24,
                padding: 14,
                borderRadius: 10,
                alignItems: 'center',
                zIndex: 2000,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                backgroundColor: type === 'error' ? theme.theme.onError : theme.theme.onSuccess,
            }}
        >
            <ThemedText type="smallBold" style={{ color: 'white' }}>{message}</ThemedText>
        </Animated.View>
    );
}
