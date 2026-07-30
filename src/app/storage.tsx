import { ThemedText } from "@/components/themed-text";
import SvgIcon from "@/constants/svg-icons";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-provider";
import { useToast } from "@/context/toast-context";
import { useDashboardStats } from "@/hooks/queries/use-dashboard";
import { useCreateStorageRequest, useDeleteFile, useLargeFiles, useRarelyUsedFiles } from "@/hooks/queries/use-files";
import { FileDto } from "@/types/api/file-dto";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function toGB(bytes: number): string {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2);
}

type TopTab = "request" | "cleanup";
type CleanupTab = "rarely-used" | "large-files";

export default function StorageScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const { username, user } = useAuth();
  const { data: dashboardStats } = useDashboardStats(user?.id ?? 0);
  const totalOccupied = dashboardStats
    ? dashboardStats.imageProps.occupiedSize +
      dashboardStats.videosProps.occupiedSize +
      dashboardStats.docsProps.occupiedSize +
      dashboardStats.othersProps.occupiedSize
    : 0;
  const totalSize = dashboardStats?.imageProps.totalSize ?? 0;
  const remaining = totalSize - totalOccupied;
  const [topTab, setTopTab] = useState<TopTab>("request");
  const [cleanupTab, setCleanupTab] = useState<CleanupTab>("rarely-used");
  const [allowedStorageError, setAllowedStorageError] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [additionalMemory, setAdditionalMemory] = useState("");
  const [remarks, setRemarks] = useState("");
  const { setToast } = useToast();
  const storageMutation = useCreateStorageRequest();

  const { data: rarelyUsedFiles = [], isLoading: rarelyLoading } = useRarelyUsedFiles(user?.id!, topTab === "cleanup" && cleanupTab === "rarely-used");
  const { data: largeFiles = [], isLoading: largeLoading } = useLargeFiles(user?.id!, topTab === "cleanup" && cleanupTab === "large-files");
  const archiveMutation = useDeleteFile();

  const currentFiles = cleanupTab === "rarely-used" ? rarelyUsedFiles : largeFiles;
  const isLoading = cleanupTab === "rarely-used" ? rarelyLoading : largeLoading;

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCleanUp = () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    Alert.alert("Archive Files", `Archive ${ids.length} selected file(s)?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Archive",
        style: "destructive",
        onPress: () => {
          Promise.all(ids.map((id) => archiveMutation.mutateAsync(id)))
            .then(() => {
              setSelectedIds(new Set());
            })
            .catch((err: any) => {
              Alert.alert("Error", err?.response?.data?.message || err?.message || "Failed to archive files");
            });
        },
      },
    ]);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16 }}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={t.text} />
        </Pressable>
        <Ionicons name="cloud-outline" size={20} color={t.primary} />
        <ThemedText type="mediumBold" style={{ flex: 1 }}>Storage</ThemedText>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16, gap: 16 }}>
        {/* Top-level segmented pills */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: t.backgroundElement,
            padding: 4,
            marginBottom: 20,
          }}
        >
          <Pressable
            onPress={() => setTopTab("request")}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingVertical: 10,
              backgroundColor: topTab === "request" ? t.primary : "transparent",
              borderColor: topTab === "cleanup" ? t.primary : "transparent",
              borderWidth: 0.8,
            }}
          >
            <Ionicons name="add-circle-outline" size={16} color={topTab === "request" ? "#ffffff" : t.text + "90"} />
            <ThemedText type="small" style={{ color: topTab === "request" ? "#ffffff" : t.text + "90", fontWeight: topTab === "request" ? "700" : "500" }}>
              Get More Storage
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => setTopTab("cleanup")}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingVertical: 10,
              backgroundColor: topTab === "cleanup" ? t.primary : "transparent",
              borderColor: topTab === "request" ? t.primary : "transparent",
              borderWidth: 0.8,
            }}
          >
            <Ionicons name="trash-bin-outline" size={16} color={topTab === "cleanup" ? "#ffffff" : t.text + "90"} />
            <ThemedText type="small" style={{ color: topTab === "cleanup" ? "#ffffff" : t.text + "90", fontWeight: topTab === "cleanup" ? "700" : "500" }}>
              Clean Up Memory
            </ThemedText>
          </Pressable>
        </View>

        {/* ---- REQUEST MORE STORAGE ---- */}
        {topTab === "request" && (
          <ScrollView contentContainerStyle={{ gap: 14, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1, gap: 6 }}>
                <ThemedText type="smallBold" style={{ color: t.text + "90" }}>Username</ThemedText>
                <View style={{ backgroundColor: t.backgroundElement,  paddingHorizontal: 12, paddingVertical: 10 }}>
                  <ThemedText type="small" style={{ color: t.text + "60" }}>{user?.username || username}</ThemedText>
                </View>
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <ThemedText type="smallBold" style={{ color: t.text + "90" }}>Email</ThemedText>
                <View style={{ backgroundColor: t.backgroundElement,  paddingHorizontal: 12, paddingVertical: 10 }}>
                  <ThemedText type="small" style={{ color: t.text + "60" }}>{user?.email || "-"}</ThemedText>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1, gap: 6 }}>
                <ThemedText type="smallBold" style={{ color: t.text + "90" }}>Consumed (GB)</ThemedText>
                <View style={{ backgroundColor: t.backgroundElement,  paddingHorizontal: 12, paddingVertical: 10 }}>
                  <ThemedText type="small" style={{ color: t.text + "60" }}>{toGB(totalOccupied)}</ThemedText>
                </View>
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <ThemedText type="smallBold" style={{ color: t.text + "90" }}>Remaining (GB)</ThemedText>
                <View style={{ backgroundColor: t.backgroundElement,  paddingHorizontal: 12, paddingVertical: 10 }}>
                  <ThemedText type="small" style={{ color: t.text + "60" }}>{toGB(remaining)}</ThemedText>
                </View>
              </View>
            </View>

            <View style={{ gap: 6 }}>
              <ThemedText type="smallBold" style={{ color: t.text + "90" }}>
                Additional Memory (GB)<ThemedText style={{ color: t.danger }}> *</ThemedText>
              </ThemedText>
              <TextInput
                placeholder="Additional Memory"
                placeholderTextColor={t.text + "50"}
                value={additionalMemory}
                onChangeText={(value) => {
                  setAdditionalMemory(value);
                  if (Number(value) > 90) {
                    setAllowedStorageError(true);
                  } else {
                    setAllowedStorageError(false);
                  }
                }}
                keyboardType="numeric"
                style={{ backgroundColor: t.backgroundElement, paddingHorizontal: 12, paddingVertical: 10, color: t.text }}
              />
              {allowedStorageError && (
                <ThemedText type="extraSmall" style={{ color: t.danger }}>
                  Additional memory cannot exceed 90 GB.
                </ThemedText>
              )}
            </View>

            <View style={{ gap: 6 }}>
              <ThemedText type="smallBold" style={{ color: t.text + "90" }}>Remarks</ThemedText>
              <TextInput
                placeholder="Remarks"
                placeholderTextColor={t.text + "50"}
                value={remarks}
                onChangeText={setRemarks}
                multiline
                style={{ backgroundColor: t.backgroundElement,  paddingHorizontal: 12, paddingVertical: 10, minHeight: 70, textAlignVertical: "top", color: t.text }}
              />
            </View>

            {/* Submit button */}
            <Pressable
              onPress={async () => {
                if (!additionalMemory.trim()) return;
                try {
                  const result = await storageMutation.mutateAsync({
                    additionalMemory: additionalMemory.trim(),
                    email: user?.email ?? "",
                    nameOfUser: user?.name ?? username,
                    remarks: remarks.trim() || null,
                    status: "Pending",
                    userId: user?.id ?? 0,
                    createdOn: new Date().toISOString(),
                  });
                  if (result.status === 200) {
                    setToast("Storage request submitted successfully", "success");
                    setAdditionalMemory("");
                    setRemarks("");
                  } else {
                    setToast(result.message || "Failed to submit storage request", "error");
                  }
                } catch (err: any) {
                  const msg = err?.response?.data?.message || err?.message || "Internet error. Please ensure a stable internet connection before trying again.";
                  setToast(msg, "error");
                }
              }}
              disabled={storageMutation.isPending || allowedStorageError}
              style={{
                marginTop: 8,
                paddingVertical: 13,
                backgroundColor: storageMutation.isPending ? t.text + "20" : t.primary,
                alignItems: "center",
                opacity: storageMutation.isPending || allowedStorageError ? 0.6 : 1,
              }}
            >
              {storageMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <ThemedText type="medium" style={{ color: "#ffffff", fontWeight: "600" }}>Submit Request</ThemedText>
              )}
            </Pressable>
          </ScrollView>
        )}

        {/* ---- CLEAN UP MEMORY ---- */}
        {topTab === "cleanup" && (
          <View style={{ flex: 1, gap: 12 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
                onPress={() => { setCleanupTab("rarely-used"); setSelectedIds(new Set()); }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderWidth: 1,
                  borderColor: cleanupTab === "rarely-used" ? t.primary : t.text + "20",
                  backgroundColor: cleanupTab === "rarely-used" ? t.primary + "15" : "transparent",
                }}
              >
                <Ionicons name="document-text-outline" size={14} color={cleanupTab === "rarely-used" ? t.primary : t.text + "80"} />
                <ThemedText type="extraSmall" style={{ color: cleanupTab === "rarely-used" ? t.primary : t.text + "80", fontWeight: cleanupTab === "rarely-used" ? "700" : "500" }}>
                  Rarely Used Files
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={() => { setCleanupTab("large-files"); setSelectedIds(new Set()); }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderWidth: 1,
                  borderColor: cleanupTab === "large-files" ? t.primary : t.text + "20",
                  backgroundColor: cleanupTab === "large-files" ? t.primary + "15" : "transparent",
                }}
              >
                <Ionicons name="server-outline" size={14} color={cleanupTab === "large-files" ? t.primary : t.text + "80"} />
                <ThemedText type="extraSmall" style={{ color: cleanupTab === "large-files" ? t.primary : t.text + "80", fontWeight: cleanupTab === "large-files" ? "700" : "500" }}>
                  Large Files
                </ThemedText>
              </Pressable>
            </View>

            {isLoading ? (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color={t.primary} />
              </View>
            ) : (
              <ScrollView contentContainerStyle={{ gap: 8, paddingBottom: 90 }}>
                {currentFiles.map((file: FileDto) => {
                  const isSelected = selectedIds.has(file.id!);
                  return (
                    <Pressable
                      key={file.id}
                      onPress={() => toggleSelect(file.id!)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        padding: 12,
                        borderWidth: 1,
                        borderColor: isSelected ? t.primary : t.text + "12",
                        backgroundColor: isSelected ? t.primary + "08" : "transparent",
                      }}
                    >
                      <Ionicons
                        name={isSelected ? "checkbox" : "square-outline"}
                        size={18}
                        color={isSelected ? t.primary : t.text + "40"}
                      />
                      <SvgIcon extension={`${file.folder ? "folder" : file.extension}`} width={28} height={28} />
                      <ThemedText type="small" style={{ flex: 1 }} numberOfLines={1}>{file.name}</ThemedText>
                      <ThemedText type="extraSmall" style={{ color: t.text + "60" }}>{file.size}</ThemedText>
                      <ThemedText type="extraSmall" style={{ color: t.text + "60" }}>{formatDate(file.createdOn)}</ThemedText>
                    </Pressable>
                  );
                })}
                {!isLoading && currentFiles.length === 0 && (
                  <ThemedText type="small" style={{ textAlign: "center", color: t.text + "50", padding: 30 }}>
                    No files to show
                  </ThemedText>
                )}
              </ScrollView>
            )}

            {/* Sticky bottom action */}
            {selectedIds.size > 0 && (
              <View style={{ position: "absolute", bottom: 16, left: 0, right: 0 }}>
                <Pressable
                  onPress={handleCleanUp}
                  disabled={archiveMutation.isPending}
                  style={{
                    paddingVertical: 13,
                    //  10,
                    backgroundColor: archiveMutation.isPending ? t.text + "20" : t.primary,
                    alignItems: "center",
                    opacity: archiveMutation.isPending ? 0.6 : 1,
                  }}
                >
                  {archiveMutation.isPending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <ThemedText type="medium" style={{ color: "#ffffff", fontWeight: "600" }}>
                      Archive {selectedIds.size} file(s)
                    </ThemedText>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
