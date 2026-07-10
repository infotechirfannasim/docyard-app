import { InfotechLogo } from "@/constants/svgs-import";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-provider";
import { Ionicons } from "@expo/vector-icons";
import {
    DrawerContentComponentProps,
    DrawerContentScrollView,
    DrawerItemList,
} from "expo-router/drawer";
import { Button, Pressable, View } from "react-native";
import { ThemedText } from "./themed-text";

export function CustomDrawerContent(props: DrawerContentComponentProps) {

    const { logout, isLoggedIn } = useAuth();
    const theme = useTheme();

    return (
        <DrawerContentScrollView{...props} contentContainerStyle={{ flex: 1 }}>
            <View style={{ alignItems: "center" }}>
                <InfotechLogo width={150} style={{ marginBottom: 20 }} />
            </View>

            {/* the default menu list, styled to match your theme */}
            <DrawerItemList {...props} />
            
                  <View style={{ alignSelf: "flex-end", justifyContent: "flex-end", alignItems: "flex-end", flexGrow: 1, marginTop: 15 }}>
            
                    <Button onPress={() => theme.toggleTheme()} title="Toggle Theme" />
                  </View>
            <View style={{ marginTop: "auto", backgroundColor: theme.theme.drawerActiveTintColor + "20" }}>
                <Pressable
                    onPress={()=>{
                        console.log("is logged in: ", isLoggedIn);
                        console.log("Logging out...");
                        logout();
                        console.log("is logged in: ", isLoggedIn);
                    }}
                    style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 20 }}
                >
                    <Ionicons name="log-out-outline" size={25} color={theme.theme.drawerActiveTintColor} />

                    <ThemedText type="mediumBold" style={{ color: theme.theme.drawerActiveTintColor }}>
                        Log out
                    </ThemedText>
                </Pressable>
            </View>




            {/* custom footer, e.g. a logout button */}
            <View style={{ padding: 20, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10 }}>

                <ThemedText type={"small"} style={{ color: "white" }}>
                    Powered by
                </ThemedText>
                <InfotechLogo width={120} />
            </View>
        </DrawerContentScrollView>
    );
}