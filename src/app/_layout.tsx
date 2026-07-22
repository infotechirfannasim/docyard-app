import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { DocyardLogo, InfotechLogo } from "@/constants/svgs-import";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { FilesProvider } from "@/context/files-provider";
import { LayoutProvider } from "@/context/layout-context";
import { ThemeProvider, useTheme } from "@/context/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

const queryClient = new QueryClient();
export default function RootAppLayout() {

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider >
        <AuthProvider>
          <LayoutProvider>
            <FilesProvider>
              <AppLayout />
            </FilesProvider>
          </LayoutProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AppLayout() {
  const { isLoggedIn, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return <ThemedView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <DocyardLogo width={200} height={80} style={{ marginBottom: 50 }} />
        <ActivityIndicator size={58} />
      </View>

      <View style={{ alignItems: "center",  marginBottom: 40 }}>
        <ThemedText type="small" style={{ color: "white", marginBottom: 20 }}>Powered by</ThemedText>
        <InfotechLogo width={200} />
      </View>
    </ThemedView>;
  }


  return (

    <Stack
    
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: theme.background }
    }}
    
    >
      {/* <Stack.Protected guard={isLoggedIn}> */}
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen
          name="login"
          options={{ 
      contentStyle: { backgroundColor: theme.background }


          }}  />

      </Stack.Protected>

      {/* <Stack.Protected guard={!isLoggedIn}> */}
      <Stack.Protected  guard={isLoggedIn}>

        <Stack.Screen
          name="(drawer)"
          options={{
      contentStyle: { backgroundColor: theme.background }

          }} />
      </Stack.Protected>
    </Stack>
  );
}
