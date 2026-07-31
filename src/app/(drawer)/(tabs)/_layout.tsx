import { useTheme } from '@/context/theme-provider';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs, useSegments } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs/types';
import { useEffect, useRef } from 'react';
import { Animated, BackHandler, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_ICONS: Record<string, { outline: keyof typeof Ionicons.glyphMap; filled: keyof typeof Ionicons.glyphMap }> = {
  home: { outline: 'home-outline', filled: 'home' },
  'document-library': { outline: 'document-text-outline', filled: 'document-text' },
  favourite: { outline: 'star-outline', filled: 'star' },
  trash: { outline: 'trash-outline', filled: 'trash' },
  profile: { outline: 'person-outline', filled: 'person' },
};

function CustomTabBar({ navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const currentTab = segments[segments.length - 1] || 'home';
  const tabs: readonly string[] = ['document-library', 'favourite', 'home', 'trash', 'profile'];
  const TAB_LABELS: Record<string, string> = {
    home: 'Home',
    'document-library': 'Documents',
    favourite: 'Favourite',
    trash: 'Trash',
    profile: 'Profile',

  };
  const gradientLocations: Record<string, [number, number, ...number[]]> = {
    'document-library': [0, 0, 0.15, 1],
    'favourite': [0, 0.225, 0.375, 1],
    'home': [0, 0.425, 0.575, 1],
    'trash': [0, 0.625, 0.775, 1],
    'profile': [0, 0.825, 0.975, 1],
  };
  const labelOpacity = useRef(new Animated.Value(0)).current;
  const scales = useRef<Record<string, Animated.Value>>({});
  const translateYs = useRef<Record<string, Animated.Value>>({});
  const previousTab = useRef<string | null>(currentTab);

  tabs.forEach((name) => {
    if (!scales.current[name]) {
      scales.current[name] = new Animated.Value(1);
    }
    if (!translateYs.current[name]) {
      translateYs.current[name] = new Animated.Value(0);
    }
  });

  function handleBackButtonPress() {
    if (currentTab === '[...path]') {
      previousTab.current = currentTab;
      return false; // Prevent default back button behavior
    }
    return false;
  }

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackButtonPress);

    if (!tabs.includes(currentTab) || previousTab.current === "[...path]") {

      labelOpacity.stopAnimation();
      labelOpacity.setValue(0);
      previousTab.current = null;
      return () => subscription.remove();
    }

    labelOpacity.setValue(0);

    tabs.forEach((name) => {
      scales.current[name].stopAnimation();
      translateYs.current[name].stopAnimation();
    });
    scales.current[currentTab].setValue(1);
    translateYs.current[currentTab].setValue(0);

    tabs.forEach((name) => {
      Animated.spring(scales.current[name], {
        toValue: name === currentTab ? 1.1 : 1,
        useNativeDriver: true,
        friction: 5,
        tension: 50,
      }).start();
      Animated.spring(translateYs.current[name], {
        toValue: name === currentTab ? -4 : 0,
        useNativeDriver: true,
        friction: 5,
        tension: 80,
      }).start();
    });

    Animated.timing(labelOpacity, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(labelOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 600);

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [currentTab]);

  return (
    <View style={[styles.wrapper,{ backgroundColor: theme.theme.background}]}>
      <LinearGradient
        colors={[theme.theme.nativeTabBackground, theme.theme.nativeTabActiveTintColor, theme.theme.nativeTabActiveTintColor, theme.theme.nativeTabBackground]}
        locations={gradientLocations[currentTab === "[...path]" ? "document-library" : currentTab] || [0, 0.4, 0.6, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.bar, { height: 65 + insets.bottom, paddingBottom: insets.bottom }]}
      >
        {tabs.map((name) => {
          const isFocused = currentTab === "[...path]" ? "document-library" === name : currentTab === name;
          const icons = TAB_ICONS[name] ?? TAB_ICONS.home;
          const scale = scales.current[name] ?? 1;
          const documentPath = name === "[...path]";
          if (!documentPath) {


            const onPress = () => {
              if (!isFocused) {

                navigation.navigate(name);
              }
            };

            const label = TAB_LABELS[currentTab] ?? (currentTab === "[...path]" ? "Documents" : currentTab);

            if (isFocused) {
              return (
                <Pressable key={name} onPress={onPress} style={styles.centerWrapper} hitSlop={12}>
                  <Animated.View style={[styles.labelContainer, { opacity: labelOpacity }]}>
                    <Text style={styles.labelText}>{label}</Text>
                  </Animated.View>
                  <Animated.View
                    style={[
                      styles.centerButton,
                      { backgroundColor: '#ffffff' },
                      { transform: [{ scale }, { translateY: translateYs.current[name] ?? 0 }] },
                    ]}
                  >
                    <Ionicons name={icons.filled} size={26} color={theme.theme.nativeTabTintColor} />
                  </Animated.View>
                </Pressable>
              );
            }

            return (
              <Pressable key={name} onPress={onPress} style={styles.tabItem} hitSlop={12}>
                <Ionicons name={icons.outline} size={24} color={theme.theme.nativeTabIconColor} />
              </Pressable>
            );
          }
        })}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDotActive: {
    backgroundColor: 'rgba(8, 170, 239, 0.69)',
  },
  centerWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  labelContainer: {
    position: 'absolute',
    bottom: 70,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 5,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
  },
  labelText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    elevation: 10,
  },
});

export default function TabLayout() {
  const theme = useTheme();
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} detachInactiveScreens={false} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: theme.theme.background }, animation: 'fade', transitionSpec: { animation: 'timing', config: { duration: 400, easing: Easing.inOut(Easing.ease) } }, tabBarStyle: { position: 'absolute', left: 0, right: 0, bottom: 0} }}>
      <Tabs.Screen name="home" options={{ title: 'Home', }} />
      <Tabs.Screen name="document-library" options={{ title: 'Documents' }} />
      <Tabs.Screen name="favourite" options={{ title: 'Favourite' }} />
      <Tabs.Screen name="trash" options={{ title: 'Trash' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}