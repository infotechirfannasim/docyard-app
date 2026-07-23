import { InfotechLogo } from "@/constants/svgs-import";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-provider";
import { useDashboardStats } from "@/hooks/queries/use-dashboard";
import { useCurrentUser } from "@/hooks/queries/use-user";
import { Ionicons } from "@expo/vector-icons";
import {
    DrawerContentComponentProps,
    DrawerContentScrollView,
    DrawerItemList,
} from "expo-router/drawer";
import { ActivityIndicator, Pressable, View } from "react-native";
import { ThemedText } from "./themed-text";

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
}

export function CustomDrawerContent(props: DrawerContentComponentProps) {

    const { logout, isLoggedIn } = useAuth();
    const theme = useTheme();
    const { username } = useAuth();
    const { data: user } = useCurrentUser(username);
    const { data: dashboardStats, isLoading } = useDashboardStats(user?.id ?? 0);

    const totalOccupied = dashboardStats
        ? dashboardStats.imageProps.occupiedSize +
          dashboardStats.videosProps.occupiedSize +
          dashboardStats.docsProps.occupiedSize +
          dashboardStats.othersProps.occupiedSize
        : 0;
    const totalSize = dashboardStats?.imageProps.totalSize ?? 0;
    const remaining = totalSize - totalOccupied;
    const usedPercent = totalSize > 0 ? (totalOccupied / totalSize) * 100 : 0;

    return (
        <DrawerContentScrollView{...props} contentContainerStyle={{ flex: 1 }}>
            <View style={{ alignItems: "center" }}>
                <InfotechLogo width={150} style={{ marginBottom: 20 }} />
            </View>

            {/* the default menu list, styled to match your theme */}
            <DrawerItemList {...props} />

            <View style={{ flexGrow: 1 }} />

            {/* Theme Toggle */}
            <Pressable
                onPress={() => theme.toggleTheme()}
                style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 20 }}
            >
                <Ionicons name={theme.mode === 'dark' ? 'sunny-outline' : 'moon-outline'} size={25} color={theme.theme.drawerActiveTintColor} />
                <ThemedText type="mediumBold" style={{ color: theme.theme.drawerActiveTintColor }}>
                    {theme.mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </ThemedText>
            </Pressable>

            {/* Storage Info */}
            {isLoading ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={theme.theme.drawerActiveTintColor} />
                </View>
            ) : dashboardStats ? (
                <View style={{ backgroundColor: theme.theme.drawerActiveTintColor + '15', paddingHorizontal: 20, paddingVertical: 12, gap: 4, marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <ThemedText type="extraSmall" style={{ color: theme.theme.drawerActiveTintColor }}>
                            Storage
                        </ThemedText>
                        <ThemedText type="extraSmall" style={{ color: theme.theme.drawerActiveTintColor + 'AA' }}>
                            {formatBytes(totalOccupied)} / {formatBytes(totalSize)}
                        </ThemedText>
                    </View>
                    <View style={{ height: 4, borderRadius: 2, backgroundColor: theme.theme.drawerActiveTintColor + '20', overflow: 'hidden' }}>
                        <View style={{
                            height: '100%',
                            width: `${Math.min(usedPercent, 100)}%`,
                            borderRadius: 2,
                            backgroundColor: theme.theme.drawerActiveTintColor,
                        }} />
                    </View>
                    <ThemedText type="extraSmall" style={{ color: theme.theme.drawerActiveTintColor + '66' }}>
                        {formatBytes(remaining)} free
                    </ThemedText>
                </View>
            ) : null}

            <View style={{ backgroundColor: theme.theme.drawerActiveTintColor + "20" }}>
                <Pressable
                    onPress={() => {
                        logout();
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