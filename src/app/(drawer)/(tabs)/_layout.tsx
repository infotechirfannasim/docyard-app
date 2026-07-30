import { useTheme } from '@/context/theme-provider';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs, useSegments } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs/types';
import { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

const TAB_ICONS: Record<string, { outline: keyof typeof Ionicons.glyphMap; filled: keyof typeof Ionicons.glyphMap }> = {
  home: { outline: 'home-outline', filled: 'home' },
  'document-library': { outline: 'document-text-outline', filled: 'document-text' },
  favourite: { outline: 'star-outline', filled: 'star' },
  trash: { outline: 'trash-outline', filled: 'trash' },
  profile: { outline: 'person-outline', filled: 'person' },
};

const CENTER_ROUTE = 'document-library';

function CustomTabBar({ navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const segments = useSegments();
  const currentTab = segments[segments.length - 1] || 'home';

  const tabs = ['document-library', 'favourite', 'home', 'trash', 'profile'] as const;

  const TAB_LABELS: Record<string, string> = {
    home: 'Home',
    'document-library': 'Documents',
    favourite: 'Favourite',
    trash: 'Trash',
    profile: 'Profile',
  };

  const labelOpacity = useRef(new Animated.Value(0)).current;

  const scales = useRef<Record<string, Animated.Value>>({});
  const translateYs = useRef<Record<string, Animated.Value>>({});

  tabs.forEach((name) => {
    if (!scales.current[name]) {
      scales.current[name] = new Animated.Value(1);
    }
    if (!translateYs.current[name]) {
      translateYs.current[name] = new Animated.Value(0);
    }
  });

  useEffect(() => {
    if (!currentTab) return;

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
      duration: 150,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(labelOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }, 600);

    return () => clearTimeout(timer);
  }, [currentTab]);

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[theme.theme.primary, theme.theme.drawerBackground]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bar}
      >
        {tabs.map((name) => {
          const isFocused = currentTab === name;
          const icons = TAB_ICONS[name] ?? TAB_ICONS.home;
          const scale = scales.current[name] ?? 1;

          const onPress = () => {
            if (!isFocused) {
              navigation.navigate(name);
            }
          };

          const label = TAB_LABELS[currentTab] ?? currentTab;

          if (isFocused) {
            return (
              <Pressable key={name} onPress={onPress} style={styles.centerWrapper} hitSlop={12}>
                <Animated.View style={[styles.labelContainer, { opacity: labelOpacity }]}>
                  <Text style={styles.labelText}>{label}</Text>
                </Animated.View>
                <Animated.View style={[styles.centerButton, { backgroundColor: theme.theme.nativeTabTintColor }, { transform: [{ scale }, { translateY: translateYs.current[name] ?? 0 }] }]}>
                  <Ionicons name={icons.filled} size={26} color="#ffffff" />
                </Animated.View>
              </Pressable>
            );
          }

          return (
            <Pressable key={name} onPress={onPress} style={styles.tabItem} hitSlop={12}>
              <Ionicons name={icons.outline} size={24} color={theme.theme.drawerInactiveTintColor} />
            </Pressable>
          );
        })}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 80,
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
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
    backgroundColor: 'rgba(255,255,255,0.15)',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="document-library" options={{ title: 'Documents' }} />
      <Tabs.Screen name="favourite" options={{ title: 'Favourite' }} />
      <Tabs.Screen name="trash" options={{ title: 'Trash' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
