import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/context/theme-provider";
import { Ionicons } from "@expo/vector-icons";
import { useMutationState } from "@tanstack/react-query";
import { BlurView } from "expo-blur";
import { useEffect, useRef } from "react";
import { Animated, BackHandler, Easing, Platform, View } from "react-native";

type MutationToastProps = {
  blurTarget: React.RefObject<any>;
};

export function MutationToast({ blurTarget }: MutationToastProps) {
  const theme = useTheme();
  const spin = useRef(new Animated.Value(0)).current;

  const labels = useMutationState({
    filters: { status: "pending" },
    select: (mutation) => (mutation.options.mutationKey as string[])?.[0] ?? null,
  });

  const label = labels[labels.length - 1];

  useEffect(() => {
    if (!label) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, [label]);

  useEffect(() => {
    if (!label) return;
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => {
      loop.stop();
      spin.setValue(0);
    };
  }, [label, spin]);

  if (!label) return null;

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <BlurView
        blurTarget={blurTarget}
        intensity={10}
        tint={theme.mode === "dark" ? "dark" : "light"}
        blurMethod={Platform.OS === "android" ? "dimezisBlurView" : undefined}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      <View
        style={{
          backgroundColor: theme.theme.cardItemGridColor,
          borderRadius: 16,
          padding: 32,
          alignItems: "center",
          gap: 16,
          marginHorizontal: 40,
        }}
      >
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons name="sync-outline" size={48} color={theme.theme.primary} />
        </Animated.View>
        <ThemedText type="mediumBold">{label}</ThemedText>
      </View>
    </View>
  );
}