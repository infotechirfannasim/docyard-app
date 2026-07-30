import { MutationToast } from "@/components/mutation-toast";
import { OfflineBanner } from "@/components/offline-banner";
import { SplashScreen } from "@/components/splash-screen";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { FilesProvider } from "@/context/files-provider";
import { LayoutProvider } from "@/context/layout-context";
import { NetworkProvider } from "@/context/network-provider";
import { ThemeProvider, useTheme } from "@/context/theme-provider";
import { ToastProvider } from "@/context/toast-context";
import { useAppInitializer } from "@/hooks/use-app-initializer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BlurTargetView } from "expo-blur";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { View } from "react-native";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootAppLayout() {
  return (
    <View style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <NetworkProvider>
              <LayoutProvider>
                <FilesProvider>
                  <ToastProvider>
                    <AppLayout />
                  </ToastProvider>
                </FilesProvider>
              </LayoutProvider>
            </NetworkProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </View>
  );
}

function AppLayout() {
  const { isLoggedIn, isLoading } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const prevLoggedIn = useRef(isLoggedIn);
  const blurTargetRef = useRef(null);
  useAppInitializer();

  useEffect(() => {
    if (isLoading) return;

    const justLoggedOut = prevLoggedIn.current && !isLoggedIn;
    const justLoggedIn = !prevLoggedIn.current && isLoggedIn;
    prevLoggedIn.current = isLoggedIn;

    if (justLoggedOut || !isLoggedIn) {
      router.replace("/login");
    } else if (justLoggedIn) {
      router.replace("/(drawer)/(tabs)/home" as any);
    }
  }, [isLoggedIn, isLoading]);
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.theme.background }}>
      <BlurTargetView ref={blurTargetRef} style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.theme.background } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" options={{ contentStyle: { backgroundColor: theme.theme.background } }} />
          <Stack.Screen name="forgot-password" options={{ contentStyle: { backgroundColor: theme.theme.background } }} />
          <Stack.Screen name="(drawer)" options={{ contentStyle: { backgroundColor: theme.theme.background } }} />
        </Stack>
      </BlurTargetView>

      <OfflineBanner />
      <MutationToast blurTarget={blurTargetRef} />
    </View>
  );
}