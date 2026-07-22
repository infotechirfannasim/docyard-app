// src/app/(drawer)/(tabs)/document-library/_layout.tsx
import { useTheme } from '@/context/theme-provider';
import { Stack } from 'expo-router';


export default function DocumentLibraryLayout() {
  const theme = useTheme();
    return (
    <Stack screenOptions={{ headerShown: false,
      animation: "slide_from_right",
      contentStyle: { backgroundColor: theme.theme.background },
     }}

     >
      {/* index.tsx will be the root of this internal stack */}
      <Stack.Screen name="index" /> 
      {/* [...path].tsx will stack natively every time it's pushed */}
      <Stack.Screen name="[...path]" />
    </Stack>
  );
}