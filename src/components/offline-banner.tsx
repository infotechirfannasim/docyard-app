import { useNetwork } from "@/context/network-provider";
import { useTheme } from "@/context/theme-provider";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { Animated, BackHandler, Dimensions, Easing, Pressable, StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, Pattern } from "react-native-svg";
import { ThemedText } from "./themed-text";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export function OfflineBanner() {
  // const isConnected = false;
  const { isConnected } = useNetwork();
  const { theme } = useTheme();

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const ping = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: isConnected ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: isConnected ? 0.9 : 1,
        useNativeDriver: true,
        friction: 8,
      }),
    ]).start();
  }, [isConnected, opacity, scale]);

  useEffect(() => {
    if (!isConnected) {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected) return;

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );

    const pingLoop = Animated.loop(
      Animated.timing(ping, { toValue: 1, duration: 2200, easing: Easing.out(Easing.ease), useNativeDriver: true })
    );

    const driftLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 6000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 6000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );

    pulseLoop.start();
    pingLoop.start();
    driftLoop.start();
    return () => {
      pulseLoop.stop();
      pingLoop.stop();
      driftLoop.stop();
      ping.setValue(0);
    };
  }, [isConnected, pulse, ping, drift]);

  const handleRetry = async () => {
    setChecking(true);
    await NetInfo.fetch();
    setTimeout(() => setChecking(false), 600);
  };

  const pingScale = ping.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] });
  const pingOpacity = ping.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.35, 0.12, 0] });

  const blobADrift = drift.interpolate({ inputRange: [0, 1], outputRange: [0, 24] });
  const blobBDrift = drift.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });

  return (
    <Animated.View
      style={[styles.overlay, { opacity }]}
      pointerEvents={isConnected ? 'none' : 'auto'}
    >
      {/* base gradient wash */}
      <LinearGradient
        colors={[theme.background, theme.backgroundElement, theme.background]}
        style={StyleSheet.absoluteFill}
      />

      {/* dot grid pattern */}
      <Svg width={SCREEN_W} height={SCREEN_H} style={StyleSheet.absoluteFill}>
        <Defs>
          <Pattern id="dotGrid" width={22} height={22} patternUnits="userSpaceOnUse">
            <Circle cx={2} cy={2} r={1.4} fill={theme.textSecondary} opacity={0.18} />
          </Pattern>
        </Defs>
        <Circle cx={SCREEN_W / 2} cy={SCREEN_H / 2} r={Math.max(SCREEN_W, SCREEN_H)} fill="url(#dotGrid)" />
      </Svg>

      {/* drifting soft blobs */}
      <Animated.View
        style={[
          styles.blob,
          {
            top: SCREEN_H * 0.12,
            left: -60,
            transform: [{ translateY: blobADrift }],
          },
        ]}
      >
        <LinearGradient
          colors={[theme.secondary + '33', theme.secondary + '00']}
          style={styles.blobGradient}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.blob,
          {
            bottom: SCREEN_H * 0.1,
            right: -70,
            transform: [{ translateY: blobBDrift }],
          },
        ]}
      >
        <LinearGradient
          colors={[theme.primary + '2e', theme.primary + '00']}
          style={styles.blobGradient}
        />
      </Animated.View>

      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <View style={styles.iconWrap}>
          <Animated.View
            style={[
              styles.pingRing,
              {
                borderColor: theme.secondary,
                opacity: pingOpacity,
                transform: [{ scale: pingScale }],
              },
            ]}
          />
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <LinearGradient
              colors={[theme.secondary + '40', theme.primary + '26']}
              style={styles.iconRing}
            >
              <LinearGradient
                colors={[theme.primary, theme.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconCircle}
              >
                <Ionicons name="cloud-offline-outline" size={48} color="#ffffff" />
              </LinearGradient>
            </LinearGradient>
          </Animated.View>
        </View>

        <ThemedText type="largeBold" style={[styles.title, { color: theme.text }]}>
          No Connection
        </ThemedText>
        <ThemedText type="medium" style={[styles.subtitle, { color: theme.textSecondary }]}>
          You're offline right now. Check your Wi-Fi or mobile data and we'll reconnect automatically.
        </ThemedText>

        <Pressable onPress={handleRetry} disabled={checking} style={styles.retryWrap}>
          {({ pressed }) => (
            <LinearGradient
              colors={[theme.primary, theme.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.retryButton, pressed && styles.retryButtonPressed]}
            >
              <Ionicons
                name={checking ? "sync" : "refresh"}
                size={18}
                color="#ffffff"
                style={checking ? styles.spinning : undefined}
              />
              <ThemedText type="medium" style={styles.retryText}>
                {checking ? "Checking..." : "Try Again"}
              </ThemedText>
            </LinearGradient>
          )}
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    width: 260,
    height: 260,
  },
  blobGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 130,
  },
  card: {
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 40,
    maxWidth: 340,
    zIndex: 1,
  },
  iconWrap: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  pingRing: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 1.5,
  },
  iconRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
  retryWrap: {
    marginTop: 14,
    borderRadius: 999,
    overflow: 'hidden',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 26,
    paddingVertical: 13,
  },
  retryButtonPressed: {
    opacity: 0.85,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  spinning: {
    opacity: 0.7,
  },
});