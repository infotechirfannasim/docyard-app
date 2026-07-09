// src/app/(drawer)/(tabs)/document-library/_layout.tsx
import { Stack } from 'expo-router';


export default function DocumentLibraryLayout() {
    return (
    <Stack screenOptions={{ headerShown: false,
      animation: "slide_from_right",
      animationDuration: 5000,
     }}>
      {/* index.tsx will be the root of this internal stack */}
      <Stack.Screen name="index" /> 
      {/* [...path].tsx will stack natively every time it's pushed */}
      <Stack.Screen name="[...path]" />
    </Stack>
  );
}