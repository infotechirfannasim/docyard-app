import { InfotechLogo } from "@/constants/svgs-import";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-provider";
import { useDashboardStats } from "@/hooks/queries/use-dashboard";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    DrawerContentComponentProps,
    DrawerContentScrollView,
    DrawerItemList,
} from "expo-router/drawer";
import SkeletonLoading from 'expo-skeleton-loading';
import { Image, Pressable, View } from "react-native";
import { ThemedText } from "./themed-text";

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
}

export function CustomDrawerContent(props: DrawerContentComponentProps) {

    const { logout, username, user, isLoggedIn } = useAuth();
    const theme = useTheme();
    const { data: dashboardStats, isLoading } = useDashboardStats(user?.id ?? 0);
    const router = useRouter();

    const totalOccupied = dashboardStats
        ? dashboardStats.imageProps.occupiedSize +
        dashboardStats.videosProps.occupiedSize +
        dashboardStats.docsProps.occupiedSize +
        dashboardStats.othersProps.occupiedSize
        : 0;
    const totalSize = dashboardStats?.imageProps.totalSize ?? 0;
    const remaining = totalSize - totalOccupied;
    const usedPercent = totalSize > 0 ? (totalOccupied / totalSize) * 100 : 0;

    const goToStorage = () => {
        props.navigation.closeDrawer();
        router.push("/storage");
    };

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, paddingTop: 0 }}>
            {/* Header: Logo */}
            <View style={{ alignItems: "center", paddingTop: 40, paddingBottom: 16 }}>
                <InfotechLogo width={140} style={{ marginBottom: 16 }} />
            </View>

            {/* User identity block with inline logout */}

            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    paddingHorizontal: 8,
                    paddingBottom: 16,
                }}
            >
                <Pressable
                    style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 12 }}
                    onPress={() => router.navigate("/(drawer)/(tabs)/profile")}
                >
                    {user?.profilePhoto ? (
                        <Image
                            source={{ uri: "data:image/png;base64," + user.profilePhoto }}
                            style={{
                                width: 42,
                                height: 42,
                                borderRadius: 21,
                            }}
                        />
                    ) : (
                        <View
                            style={{
                                width: 42,
                                height: 42,
                                borderRadius: 21,
                                backgroundColor: theme.theme.drawerActiveTintColor + "30",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <ThemedText type="mediumBold" style={{ color: theme.theme.drawerActiveTintColor }}>
                                {username?.charAt(0)?.toUpperCase() ?? "U"}
                            </ThemedText>
                        </View>
                    )}

                    <View style={{ flex: 1 }}>
                        <ThemedText type="smallBold" style={{ color: theme.theme.drawerActiveTintColor }} numberOfLines={1}>
                            {username ?? "User"}
                        </ThemedText>
                        <ThemedText type="extraSmall" style={{ color: theme.theme.drawerActiveTintColor + "80" }} numberOfLines={1}>
                            {user?.email ?? ""}
                        </ThemedText>
                    </View>
                </Pressable>

                <Pressable
                    onPress={() => logout()}
                    hitSlop={8}
                    style={({ pressed }) => ({
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: pressed
                            ? theme.theme.drawerActiveTintColor + "25"
                            : theme.theme.drawerActiveTintColor + "15",
                    })}
                >
                    <Ionicons name="log-out-outline" size={18} color={theme.theme.drawerActiveTintColor} />
                </Pressable>
            </View>

            <View
                style={{
                    height: 1,
                    backgroundColor: theme.theme.drawerActiveTintColor + "15",
                    marginBottom: 14,
                }}
            />

            {/* User identity block
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    paddingHorizontal: 20,
                    paddingBottom: 16,
                }}
            >
                <View
                    style={{
                        width: 42,
                        height: 42,
                        borderRadius: 21,
                        backgroundColor: theme.theme.drawerActiveTintColor + "30",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <ThemedText type="mediumBold" style={{ color: theme.theme.drawerActiveTintColor }}>
                        {username?.charAt(0)?.toUpperCase() ?? "U"}
                    </ThemedText>
                </View>
                <View style={{ flex: 1 }}>
                    <ThemedText
                        type="smallBold"
                        style={{ color: theme.theme.drawerActiveTintColor }}
                        numberOfLines={1}
                    >
                        {username ?? "User"}
                    </ThemedText>
                    <ThemedText
                        type="extraSmall"
                        style={{ color: theme.theme.drawerActiveTintColor + "80" }}
                        numberOfLines={1}
                    >
                        {user?.email ?? ""}
                    </ThemedText>
                </View>
            </View>

            <View
                style={{
                    height: 1,
                    backgroundColor: theme.theme.drawerActiveTintColor + "15",
                    marginBottom: 8,
                }}
            /> */}

            {/* Nav items */}
            <DrawerItemList {...props} />

            <View style={{ flexGrow: 1 }} />

            {/* Theme toggle */}
            <Pressable
                onPress={() => theme.toggleTheme()}
                style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 14 }}
            >
                <Ionicons name={theme.mode === 'dark' ? 'sunny-outline' : 'moon-outline'} size={20} color={theme.theme.drawerActiveTintColor} />
                <ThemedText type="smallBold" style={{ color: theme.theme.drawerActiveTintColor }}>
                    {theme.mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </ThemedText>
            </Pressable>

            {/* Storage Info */}
            {isLoading ? (
                <SkeletonLoading background={theme.theme.drawerActiveTintColor + "20"} highlight={theme.theme.drawerActiveTintColor + "50"}>
                    <View style={{ paddingHorizontal: 20, paddingVertical: 12, gap: 4, marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                            <View style={{ width: '25%', height: 12, backgroundColor: theme.theme.drawerActiveTintColor + '20', borderRadius: 4 }} />
                            <View style={{ width: '35%', height: 12, backgroundColor: theme.theme.drawerActiveTintColor + '20', borderRadius: 4 }} />
                        </View>
                        <View style={{ height: 4, borderRadius: 2, backgroundColor: theme.theme.drawerActiveTintColor + '20' }} />
                        <View style={{ width: '20%', height: 10, marginTop: 2, backgroundColor: theme.theme.drawerActiveTintColor + '20', borderRadius: 4 }} />
                    </View>
                </SkeletonLoading>
            ) : dashboardStats ? (
                <Pressable
                    onPress={goToStorage}
                    style={({ pressed }) => ({
                        backgroundColor: theme.theme.drawerActiveTintColor + (pressed ? '25' : '15'),
                        // marginHorizontal: 12,
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        gap: 4,
                        marginBottom: 14,
                    })}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="cloud-circle-outline" size={20} color={theme.theme.drawerActiveTintColor} />
                            <ThemedText type="smallBold" style={{ color: theme.theme.drawerActiveTintColor, letterSpacing: 0.8 }}>
                                Storage
                            </ThemedText>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <ThemedText type="extraSmall" style={{ color: theme.theme.drawerActiveTintColor + 'AA' }}>
                                {formatBytes(totalOccupied)} / {formatBytes(totalSize)}
                            </ThemedText>
                            <Ionicons name="chevron-forward" size={14} color={theme.theme.drawerActiveTintColor + 'AA'} />
                        </View>
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
                </Pressable>
            ) : null}

            {/* Divider before account action */}
            <View
                style={{
                    height: 1,
                    backgroundColor: theme.theme.drawerActiveTintColor + "15",
                    marginBottom: 14,
                }}
            />


            {/* Logout — gradient filled pill */}
            {/* <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
                <Pressable onPress={() => { logout(); }}>
                    {({ pressed }) => (
                        <LinearGradient
                            colors={[theme.theme.danger, theme.theme.onError]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                paddingVertical: 12,
                                borderRadius: 999,
                                opacity: pressed ? 0.8 : 1,
                            }}
                        >
                            <Ionicons name="log-out-outline" size={18} color="#fff" />
                            <ThemedText type="smallBold" style={{ color: "#fff" }}>
                                Log out
                            </ThemedText>
                        </LinearGradient>
                    )}
                </Pressable>
            </View> */}

            {/* Footer */}
            <View style={{ paddingBottom: 20, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }}>
                <ThemedText type={"small"} style={{ opacity: 0.6, color: "white", marginRight: 4 }}>
                    Powered by
                </ThemedText>
                <InfotechLogo width={100} />
            </View>
        </DrawerContentScrollView>
    );
}