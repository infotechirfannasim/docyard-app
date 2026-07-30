import chunk from "@/app/utils/chunk-functions";
import { FlatFileList } from "@/components/flat-file-list";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { styles as customStyles } from "@/constants/custom-styles";
import { useLayout } from "@/context/layout-context";
import { useTheme } from "@/context/theme-provider";
import { useDashboardStats } from "@/hooks/queries/use-dashboard";
import { useGetFilesData } from "@/hooks/queries/use-get-files-data.tsx";
import { Host, LinearProgressIndicator } from '@expo/ui/jetpack-compose';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import SkeletonLoading from 'expo-skeleton-loading';
import { useMemo, useState } from "react";
import { ColorValue, Pressable, StyleSheet, View } from "react-native";

export default function Home() {
  const theme = useTheme();
  const gradients: [ColorValue, ColorValue][] = [["#21BED4", '#3A8DBB'], ["#3A94BA", '#3965BB'], ["#BBBB3A", '#82BB3A'], ["#D03925", "#D08125"]];
  const cardIcons: (keyof typeof Ionicons.glyphMap)[] = ["images", "videocam", "document", "file-tray-sharp", "ellipsis-horizontal", "enter"];
  // const { files }= useFiles();
  const [isExpanded, setIsExpanded] = useState(false);
  const { isGridView, toggleView } = useLayout();
  // const { files: filesData, isFilesLoading, user, isUserLoading } = { files: [], isFilesLoading: true, user: { id: 0, name: "", email: "" }, isUserLoading: true } // useGetFilesData("recent");
  const { files: filesData, isFilesPending, user, isUserLoading, error: filesError } = useGetFilesData("recent");
  const { data: dashboardStats, error: dashboardStatsError } = useDashboardStats(user?.id!);


  const cardItems = [
    { label: "Images", stats: dashboardStats?.imageProps, type: "Image" as const },
    { label: "Videos", stats: dashboardStats?.videosProps, type: "video" as const },
    { label: "Documents", stats: dashboardStats?.docsProps, type: "doc" as const },
    { label: "Others", stats: dashboardStats?.othersProps, type: "other" as const },
  ];
  const skeletonColor = theme.theme.skeleton;
  const skeletonHighlight = theme.theme.skeletonHighlight;
  console.log("Home: isFilesPending", isFilesPending, "isUserLoading", isUserLoading, "filesError", filesError, "dashboardStatsError", dashboardStatsError);

  const skeletonItems = useMemo(() => {
    if (isGridView) {
      return Array.from({ length: 4 }, (_, row) => (
        <View key={row} style={{ flexDirection: "row", gap: 10, width: "100%", justifyContent: 'flex-start', paddingHorizontal: "1%", marginBottom: 10 }}>
          {[0, 1].map((col) => (
            <View key={col} style={{ flex: 1, maxWidth: "49%", backgroundColor: theme.theme.cardItemGridColor, boxShadow: '0px 0px 2px 3px #0080ae0a' }}>
              <SkeletonLoading background={skeletonColor} highlight={skeletonHighlight}>
                <View>
                  <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 10 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: skeletonColor, marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <View style={{ height: 12, width: '80%', borderRadius: 4, backgroundColor: skeletonColor }} />
                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                        <View style={{ height: 10, width: '30%', borderRadius: 4, backgroundColor: skeletonColor }} />
                        <View style={{ height: 10, width: '35%', borderRadius: 4, backgroundColor: skeletonColor }} />
                      </View>
                    </View>
                  </View>
                  <View style={{ height: 0.5, backgroundColor: skeletonColor, marginHorizontal: 8 }} />
                  <View style={{ flexDirection: "row", paddingHorizontal: 8, paddingVertical: 6, gap: 8 }}>
                    <View style={{ width: 20, height: 14, borderRadius: 4, backgroundColor: skeletonColor }} />
                    <View style={{ width: 20, height: 14, borderRadius: 4, backgroundColor: skeletonColor }} />
                    <View style={{ width: 30, height: 14, borderRadius: 4, backgroundColor: skeletonColor }} />
                  </View>
                </View>
              </SkeletonLoading>
            </View>
          ))}
        </View>
      ));
    }
    return Array.from({ length: 8 }, (_, i) => (
      <View key={i}>
        <SkeletonLoading background={skeletonColor} highlight={skeletonHighlight}>
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: theme.theme.primary + '40' }}>
            <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: skeletonColor, marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <View style={{ height: 12, width: '50%', borderRadius: 4, backgroundColor: skeletonColor }} />
              <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                <View style={{ height: 10, width: '20%', borderRadius: 4, backgroundColor: skeletonColor }} />
                <View style={{ height: 10, width: '25%', borderRadius: 4, backgroundColor: skeletonColor }} />
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ width: 20, height: 14, borderRadius: 4, backgroundColor: skeletonColor }} />
              <View style={{ width: 20, height: 14, borderRadius: 4, backgroundColor: skeletonColor }} />
              <View style={{ width: 30, height: 14, borderRadius: 4, backgroundColor: skeletonColor }} />
            </View>
          </View>
        </SkeletonLoading>
      </View>
    ));
  }, [theme.theme.primary, theme.theme.skeleton, isGridView]);

  return (
    <ThemedView style={customStyles.container}>

      <ThemedView style={[styles.welcomeHeader, { paddingHorizontal: ".5%" }]}>
        {user?.name && <ThemedText type="large">Hello <ThemedText type="largeBold">{user?.name || "..."}, </ThemedText><ThemedText type="large"> Welcome back!</ThemedText></ThemedText>}
      </ThemedView>

      <ThemedView style={styles.headerCards}>
        {chunk(cardItems!, 2).map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((item, colIndex) => {
              const index = rowIndex * 2 + colIndex;
              const stat = item.stats;

              return (
                <Pressable
                  key={index}
                  android_ripple={{ color: theme.theme.secondary + "20" }}
                  onPress={() => router.push(`/document-library/type/${item.type}`)}
                  style={[styles.headerCardItem, { borderColor: "transparent" }]}
                >
                  <LinearGradient
                    colors={gradients[index]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={[{
                      width: "100%",
                      minHeight: 100,
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      borderRadius: 14,
                      borderWidth: 0,
                      padding: 14,
                      // boxShadow: "2px 4px 6px 1px rgba(0, 0, 0, 0.1)",

                    }]}

                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                      <ThemedText style={{ color: "white" }} type={"mediumBold"}>{item.label}</ThemedText>
                      <Ionicons name={cardIcons[index]} color={"#ffffffc7"} size={22} style={{ marginRight: 2, opacity: 0.8 }} />
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", width: "100%" }}>

                      {stat ? (
                        <>
                          <ThemedText style={{ color: "white", alignSelf: "flex-start", opacity: 0.7 }} type="extraExtraSmall"> {stat.occupiedPercentage.toFixed(2)}%</ThemedText>
                          <ThemedText style={{ color: "white", alignSelf: "flex-end" }} type="extraSmallBold"> {stat.formattedOccupiedSize}</ThemedText>
                        </>
                      ) : (
                        <SkeletonLoading background={"#ffffff30"} highlight={"#ffffff70"}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                            <View style={{ height: 8, width: '30%', borderRadius: 4, backgroundColor: skeletonColor }} />
                            <View style={{ height: 8, width: '25%', borderRadius: 4, backgroundColor: skeletonColor }} />
                          </View>
                        </SkeletonLoading>
                      )}
                    </View>

                    {stat ? (
                      <View style={{ width: '100%' }}>
                        <Host matchContents={false} style={{ height: 6, width: '100%' }}>
                          <LinearProgressIndicator trackColor={theme.theme.progressIndicator} color={theme.theme.completedProgressIndicator} gapSize={0} drawStopIndicator={{ stopSize: 0 }} progress={Number(stat.occupiedPercentage / 100)} />
                        </Host>
                      </View>
                    ) : (
                      <Host matchContents={false} style={{ height: 6, width: '100%' }}>
                        <SkeletonLoading background={"#ffffff30"} highlight={"#ffffff70"}>
                          <View style={{ width: '100%', height: 6, borderRadius: 2, backgroundColor: skeletonColor }} />
                        </SkeletonLoading>
                      </Host>
                    )}
                  </LinearGradient>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ThemedView>
      <ThemedView style={styles.body}>
        <ThemedView style={styles.bodyHeader}>
          <ThemedText type={"extraLargeBold"}>Recent Documents</ThemedText>
          <Pressable onPress={() => toggleView()}>
            <Ionicons name={isGridView ? "grid-outline" : "list-outline"} color={theme.theme.text} size={25} />
          </Pressable>
        </ThemedView>
      </ThemedView>

      {isFilesPending ? (
        <View>{skeletonItems}</View>
      ) : (
        filesError ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Ionicons name="cloud-offline-outline" size={48} color={theme.theme.danger + '80'} />
            <ThemedText type="small" style={{ color: theme.theme.danger, textAlign: 'center', marginTop: 12 }}>{filesError?.message}</ThemedText>
          </View>
        ) : (
          <FlatFileList files={filesData!} isGridView={isGridView} filesOnly={true} goToFolder={() => { }} viewType="recent" />
        )
      )}

    </ThemedView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  welcomeHeader: {
    alignSelf: "flex-start",
    // marginHorizontal: "2.5%",
    marginVertical: 10,
    maxHeight: 100,
    // borderWidth: 2,
    // borderColor: "white"
  },
  headerCards: {
    flexDirection: "column",
    alignSelf: "flex-start",
    justifyContent: "flex-start",
    width: '100%',
    padding: "1%"
    // padding: "1%",
    // borderWidth: 2,
    // borderColor: "white"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    gap: "2%"
  },
  headerCardItem: {
    overflow: "hidden",
    // flex: 1,
    marginBottom: "2%",
    width: "48%",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderRadius: 14,
    borderWidth: 0,
    boxShadow: "3px 3px 3px .3px rgba(0, 0, 0, 0.1)",

  },
  body: {
    paddingTop: "2%",
    paddingBottom: "2%",
  },
  bodyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: "2%",
    width: "100%",
  },
  cardItemList: {
    flexDirection: "row",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: "2%",

    // borderWidth: 2,
    // borderColor: "white"

  },
  cardItemGrid: {
    flex: 1,
    maxWidth: "48%",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
    flexDirection: "row",
    boxShadow: "2px 2px 1px rgba(0, 0, 0, 0.1)",
  }

});
