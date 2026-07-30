// import DocyardLogo from '@/assets/images/logo/docyard-logo-dark.svg';
import { CustomDrawerContent } from '@/components/custom-drawer-content';
import { ThemedText } from '@/components/themed-text';
import { DocyardLogo } from '@/constants/svgs-import';
import { useTheme } from '@/context/theme-provider';
import { Drawer } from "expo-router/drawer";
import { ColorValue, Image, ImageSourcePropType, StatusBar } from 'react-native';

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
            margin: 0,
            backgroundColor: theme.theme.text,
          },
          drawerPosition: "left",
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.theme.background,
          },
          drawerStyle: {
            width: 280,
            padding: 0,
            margin: 0,
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
           
            drawerLabel: ({ color, focused }) => drawerLabel(color, "Home"),
            title: "Home",
            drawerIcon: ({ color, size }) => (
              drawerIconComponent(color, size, require('../../../assets/images/icons/home.png'))
            ),
          }}
        />
        <Drawer.Screen
          name="share-by-me"
          options={{

            drawerLabel: ({ color, focused }) => drawerLabel(color, "Shared By Me"),
            title: "Share By Me",
            drawerIcon: ({ color, size }) => (
              drawerIconComponent(color, size, require("../../../assets/images/icons/shared-by-me.png"))
            ),
          }}
        />
        <Drawer.Screen
          name="share-to-me"
          options={{

            drawerLabel: ({ color, focused }) => drawerLabel(color, "Shared To Me"),
            title: "Share To Me",
            drawerIcon: ({ color, size }) => (
              drawerIconComponent(color, size, require("../../../assets/images/icons/shared-to-me.png"))
            ),
          }}
        />
        <Drawer.Screen
          name="archive"
          options={{

            drawerLabel: ({ color, focused }) => drawerLabel(color, "Archive"),
            title: "Archive",
            drawerIcon: ({ color, size }) => (
              drawerIconComponent(color, size, require("../../../assets/images/icons/archive.png"))
            ),
          }}
        />

      </Drawer>
    </>
  );
}

function drawerIconComponent(color: ColorValue, size: number, iconPath: ImageSourcePropType): import("react").ReactNode {
  return <Image source={iconPath} style={{  width: iconPath.toString().includes('shared') ? size - 5 : size - 3, height:iconPath.toString().includes('shared') ? size - 5 : size - 3, tintColor: color }} />;
}

function drawerLabel(color: ColorValue, title: string): import("react").ReactNode {
  return <ThemedText type="smallBold" style={{ color: color }}>{title}</ThemedText>;
}
