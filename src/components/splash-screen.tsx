import { DocyardLogo, InfotechLogo } from "@/constants/svgs-import";
import { useTheme } from "@/context/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

export function SplashScreen() {
    const { theme } = useTheme();
    const cardA = useRef(new Animated.Value(0)).current;
    const cardB = useRef(new Animated.Value(0)).current;
    const cardC = useRef(new Animated.Value(0)).current;
    const logo = useRef(new Animated.Value(0)).current;
    const dots = [useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current];

    useEffect(() => {
        const settle = (v: Animated.Value, delay: number) =>
            Animated.timing(v, {
                toValue: 1, duration: 520, delay,
                easing: Easing.out(Easing.back(1.4)),
                useNativeDriver: true,
            });
        Animated.stagger(90, [settle(cardA, 0), settle(cardC, 0), settle(cardB, 0)]).start(() => {
            Animated.timing(logo, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
        });
        const pulse = (v: Animated.Value, delay: number) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(v, { toValue: 1, duration: 360, useNativeDriver: true }),
                    Animated.timing(v, { toValue: 0.3, duration: 360, useNativeDriver: true }),
                ])
            );
        pulse(dots[0], 0).start();
        pulse(dots[1], 180).start();
        pulse(dots[2], 360).start();
    }, []);

    const styles = StyleSheet.create({
        page: {
            position: "absolute",
            width: 128, height: 150, borderRadius: 14,
            shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
            shadowRadius: 18, elevation: 6,
        },
        bottomBar: {
            height: 128, alignItems: "center", justifyContent: "center",
        },
    });

    const cardStyle = (v: Animated.Value, rotateDeg: number, translateX: number) => ({
        opacity: v,
        transform: [
            { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, translateX] }) },
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [32, 0] }) },
            { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${rotateDeg}deg`] }) },
            { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
        ],
    });

    return (
        <ThemedView style={{ flex: 1, backgroundColor: theme.primary }}>
            <LinearGradient
                colors={[theme.primary, theme.drawerBackground]}
                style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
            >
                <View style={{ alignItems: "center", justifyContent: "center" }}>
                    <View style={{ width: 200, height: 150, alignItems: "center", justifyContent: "center" }}>
                        <Animated.View style={[styles.page, cardStyle(cardA, -10, -34),  { backgroundColor:'#fbfeff', zIndex: 1, }]} />
                        <Animated.View style={[styles.page, cardStyle(cardC, 10, 34), { backgroundColor:'#fbfeff', zIndex: 1 }]} />
                        <Animated.View style={[styles.page, cardStyle(cardB, 0, 0), { backgroundColor:'#fbfeff', alignItems: "center", justifyContent: "center", zIndex: 2, shadowOpacity: 0.28 }]}>
                            <Animated.View style={{ opacity: logo, transform: [{ scale: logo.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }] }}>
                                <DocyardLogo width={88} height={34} />
                            </Animated.View>
                        </Animated.View>
                    </View>
                    <View style={{ flexDirection: "row", marginTop: 44, gap: 9 }}>
                        {dots.map((d, i) => (
                            <Animated.View key={i} style={{ opacity: d, width: 7, height: 7, borderRadius: 4, backgroundColor: theme.secondary }} />
                        ))}
                    </View>
                </View>
                <ThemedText type="small" style={{ color: "#ffffffb0", marginTop: 40, letterSpacing: 0.4 }}>
                    Getting your documents ready
                </ThemedText>
            </LinearGradient>
            <View style={[styles.bottomBar, { backgroundColor: theme.drawerBackground }]}>
                <ThemedText type="small" style={{ color: theme.secondary, marginBottom: 12, letterSpacing: 2, textTransform: "uppercase", fontSize: 10 }}>
                    Powered by
                </ThemedText>
                <InfotechLogo width={148} />
            </View>
        </ThemedView>
    );
}