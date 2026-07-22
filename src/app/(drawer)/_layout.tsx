// import DocyardLogo from '@/assets/images/logo/docyard-logo-dark.svg';
import { CustomDrawerContent } from '@/components/custom-drawer-content';
import { DocyardLogo } from '@/constants/svgs-import';
import { useTheme } from '@/context/theme-provider';
import { Ionicons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from 'react-native';

export default function RootLayout() {
  return (
      <AppLayout />
  );
}

function AppLayout() {
  const theme = useTheme();

  
  return (
    console.log("Drawer Mounted"),
    <>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      <Drawer
      
        drawerContent={CustomDrawerContent}
        screenOptions={{
        
          drawerContentStyle: {
            padding: 0,
            backgroundColor: theme.theme.text,
          },
          drawerPosition: "left",
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.theme.background,
          },
          drawerStyle: {
            width: 320,
            backgroundColor: theme.theme.drawerBackground,
          },
          headerTintColor: theme.theme.text,
          drawerActiveTintColor: theme.theme.drawerActiveTintColor,
          drawerInactiveTintColor: theme.theme.drawerInactiveTintColor,
          drawerLabelStyle: {
            fontSize: 16,
          },
          headerTitleAlign: "center",
          headerTitle: () => <DocyardLogo width={160} style={{ alignSelf: "center", justifyContent: "center", alignItems: "center", flex: 1, marginLeft: "-7%" }} />,
          headerShadowVisible: false,
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            title: "Home",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="share-by-me"
          options={{
            title: "Share By Me",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="arrow-up-circle-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="share-to-me"
          options={{
            title: "Share To Me",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="arrow-down-circle-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="archive"
          options={{
            title: "Archive",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="archive-outline" color={color} size={size} />
            ),
          }}
        />
        
      </Drawer>
    </>
  );
}