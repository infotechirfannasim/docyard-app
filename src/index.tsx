import { Stack } from "expo-router";

export default function Index() {
  return (
    
    <Stack.Screen name="app"  options={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }} />
  );
}