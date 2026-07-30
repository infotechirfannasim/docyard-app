import { ThemeContextType } from "@/context/theme-provider";
import { useDeleteSharedUserData, useSharedUserData, useUpdateSharedUserData } from "@/hooks/queries/use-files";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

type ManageAccessModalProps = {
  visible: boolean;
  fileId: number;
  fileName: string;
  theme: ThemeContextType;
  showToast: (message: string, type?: "success" | "error") => void;
  onClose: () => void;
};

const ACTION_META: Record<string, { icon: keyof typeof Ionicons.glyphMap; label: string; accessRight: string }> = {
  Viewer: { icon: "eye-outline", label: "Viewer", accessRight: "VIEW" },
  Tag: { icon: "pricetag-outline", label: "Tag", accessRight: "TAG" },
  Edit: { icon: "create-outline", label: "Edit", accessRight: "EDITOR" },
  Comment: { icon: "chatbubble-outline", label: "Comment", accessRight: "COMMENT" },
};

const ACCESS_ACTIONS = Object.keys(ACTION_META);

export function ManageAccessModal({ visible, fileId, fileName, theme, showToast, onClose }: ManageAccessModalProps) {
  const { data: sharedUsers = [], isLoading } = useSharedUserData(fileId, visible);
  const updateAccessMutation = useUpdateSharedUserData();
  const deleteUserMutation = useDeleteSharedUserData();

  const handleUpdateAccess = (dlCollId: number, action: string, userName: string) => {
    const meta = ACTION_META[action];
    if (!meta) return;
    updateAccessMutation.mutate(
      { fileId, dlCollId, access: meta.accessRight },
      {
        onSuccess: () => showToast(`"${userName}" access set to ${meta.label}`, "success"),
        onError: (error: any) => showToast(error?.response?.data?.message || error?.message || "Failed to update access", "error"),
      }
    );
  };

  const handleRemoveUser = (dlCollId: number, userName: string) => {
    Alert.alert("Remove User", `Remove "${userName}" access?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          deleteUserMutation.mutate(
            { fileId, dlCollId },
            {
              onSuccess: () => showToast(`"${userName}" access removed`, "success"),
              onError: (error: any) => showToast(error?.response?.data?.message || error?.message || "Failed to remove user", "error"),
            }
          );
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#00000060" }}>
        <Pressable style={{ position: "absolute", inset: 0 }} onPress={onClose} />
        <ThemedView style={{ width: "90%", maxHeight: "85%", borderRadius: 16, padding: 20, gap: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="lock-closed-outline" size={22} color={theme.theme.primary} />
            <ThemedText type="mediumBold" style={{ flex: 1 }}>Manage Access</ThemedText>
            <Pressable onPress={onClose}><Ionicons name="close" size={22} color={theme.theme.text + "80"} /></Pressable>
          </View>

          <ThemedText type="small" style={{ color: theme.theme.text + "80" }}>{fileName}</ThemedText>

          {isLoading ? (
            <ActivityIndicator size="small" style={{ padding: 20 }} />
          ) : sharedUsers.length === 0 ? (
            <ThemedText type="small" style={{ textAlign: "center", color: theme.theme.text + "60", padding: 20 }}>
              No users with access
            </ThemedText>
          ) : (
            <ScrollView style={{ maxHeight: 400 }} keyboardShouldPersistTaps="handled">
              <View style={{ gap: 10 }}>
                {sharedUsers.map((user, idx) => {
                  const isOwner = user.accessRight === "OWNER";
                  const isUpdatingThis = updateAccessMutation.isPending && updateAccessMutation.variables?.dlCollId === user.dlCollId;
                  const isDeletingThis = deleteUserMutation.isPending && deleteUserMutation.variables?.dlCollId === user.dlCollId;

                  return (
                    <View
                      key={user.dlCollId ?? idx}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: theme.theme.text + "15",
                        backgroundColor: theme.theme.backgroundElement,
                        gap: 10,
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: theme.theme.primary + "20",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <ThemedText type="smallBold" style={{ color: theme.theme.primary }}>
                            {user.dlCollName?.charAt(0)?.toUpperCase() || "?"}
                          </ThemedText>
                        </View>
                        <View style={{ flex: 1 }}>
                          <ThemedText type="smallBold">{user.dlCollName}</ThemedText>
                          <ThemedText type="extraSmall" style={{ color: theme.theme.text + "60" }}>
                            {user.dlCollEmail}
                          </ThemedText>
                        </View>
                        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: theme.theme.primary + "15" }}>
                          <ThemedText type="extraSmall" style={{ color: theme.theme.primary }}>
                            {user.accessRight}
                          </ThemedText>
                        </View>
                      </View>

                      {!isOwner && (
                        <View style={{ gap: 8 }}>
                          {/* Access-level action buttons — segmented, filled when active */}
                          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                            {ACCESS_ACTIONS.map((action) => {
                              const meta = ACTION_META[action];
                              const isActive = user.accessRight === meta.accessRight;
                              const isPending = isUpdatingThis && updateAccessMutation.variables?.access === meta.accessRight;

                              return (
                                <Pressable
                                  key={action}
                                  onPress={() => handleUpdateAccess(user.dlCollId!, action, user.dlCollName)}
                                  disabled={isActive || updateAccessMutation.isPending || deleteUserMutation.isPending}
                                  style={({ pressed }) => ({
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 5,
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                    borderRadius: 0,
                                    backgroundColor: isActive ? theme.theme.primary : theme.theme.background,
                                    borderWidth: isActive ? 0 : 1,
                                    borderColor: theme.theme.text + "20",
                                    opacity: pressed ? 0.7 : isPending ? 0.5 : 1,
                                    transform: [{ scale: pressed ? 0.96 : 1 }],
                                  })}
                                >
                                  {isPending ? (
                                    <ActivityIndicator size="small" color={isActive ? "#ffffff" : theme.theme.primary} />
                                  ) : (
                                    <Ionicons
                                      name={meta.icon}
                                      size={15}
                                      color={isActive ? "#ffffff" : theme.theme.text + "90"}
                                    />
                                  )}
                                  <ThemedText
                                    type="extraSmall"
                                    style={{
                                      color: isActive ? "#ffffff" : theme.theme.text + "90",
                                      fontWeight: isActive ? "700" : "500",
                                    }}
                                  >
                                    {meta.label}
                                  </ThemedText>
                                </Pressable>
                              );
                            })}
                          </View>

                          {/* Destructive action — visually separated */}
                          <Pressable
                            onPress={() => handleRemoveUser(user.dlCollId!, user.dlCollName)}
                            disabled={updateAccessMutation.isPending || deleteUserMutation.isPending}
                            style={({ pressed }) => ({
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                              paddingVertical: 8,
                              borderRadius: 0,
                              backgroundColor: pressed ? theme.theme.danger + "1a" : "transparent",
                              borderWidth: 1,
                              borderColor: theme.theme.danger + "35",
                              opacity: isDeletingThis ? 0.5 : 1,
                            })}
                          >
                            {isDeletingThis ? (
                              <ActivityIndicator size="small" color={theme.theme.danger} />
                            ) : (
                              <Ionicons name="trash-outline" size={15} color={theme.theme.danger} />
                            )}
                            <ThemedText type="extraSmall" style={{ color: theme.theme.danger, fontWeight: "600" }}>
                              Remove Access
                            </ThemedText>
                          </Pressable>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          )}

          <Pressable
            onPress={onClose}
            style={{
              paddingVertical: 11,
              borderRadius: 0,
              borderWidth: 1,
              borderColor: theme.theme.text + "20",
              alignItems: "center",
            }}
          >
            <ThemedText type="medium" style={{ color: theme.theme.text + "99" }}>Close</ThemedText>
          </Pressable>
        </ThemedView>
      </View>
    </Modal>
  );
}