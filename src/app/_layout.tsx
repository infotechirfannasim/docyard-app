import { AuthProvider, useAuth } from "@/context/auth-context";
import { LayoutProvider } from "@/context/layout-context";
import { ThemeProvider } from "@/context/theme-provider";
import { Stack } from "expo-router";

export default function RootAppLayout() {
  return (
    <ThemeProvider >
      <AuthProvider>
        <LayoutProvider>

          <AppLayout />

        </LayoutProvider>

      </AuthProvider>
    </ThemeProvider>
  );
}

function AppLayout() {
  const { isLoggedIn } = useAuth();


  return (

    <Stack screenOptions={{
      headerShown: false,
    }}
    >
      {/* <Stack.Protected guard={isLoggedIn}> */}
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen
          name="login"
          options={{}} />

      </Stack.Protected>

      {/* <Stack.Protected guard={!isLoggedIn}> */}
      <Stack.Protected guard={isLoggedIn}>

        <Stack.Screen
          name="(drawer)"
          options={{}} />
      </Stack.Protected>
    </Stack>
  );
}
