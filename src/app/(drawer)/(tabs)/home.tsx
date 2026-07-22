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
import { useState } from "react";
import { ActivityIndicator, ColorValue, Pressable, StyleSheet, View } from "react-native";

export default function Home() {
  const theme = useTheme();
  const gradients: [ColorValue, ColorValue][] = [["#21BED4", '#3A8DBB'], ["#3A94BA", '#3965BB'], ["#BBBB3A", '#82BB3A'], ["#D03925", "#D08125"]];
  const cardIcons: (keyof typeof Ionicons.glyphMap)[] = ["images", "videocam", "document", "file-tray-sharp", "ellipsis-horizontal", "enter"];
  // const { files }= useFiles();
  const [isExpanded, setIsExpanded] = useState(false);
  const { isGridView, toggleView } = useLayout();
  const { files: filesData, isFilesLoading, user, isUserLoading } = useGetFilesData("recent");
  const { data: dashboardStats } = useDashboardStats(user?.id!);

  const cardItems = [
    { label: "Images", stats: dashboardStats?.imageProps, type: "Image" as const },
    { label: "Videos", stats: dashboardStats?.videosProps, type: "video" as const },
    { label: "Documents", stats: dashboardStats?.docsProps, type: "doc" as const },
    { label: "Others", stats: dashboardStats?.othersProps, type: "other" as const },
  ];
  return (


    (isFilesLoading || isUserLoading) ? <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color={theme.theme.primary} />

    </ThemedView> :

      <ThemedView style={customStyles.container}>

        <ThemedView style={[styles.welcomeHeader, { paddingHorizontal: ".5%" }]}>
          <ThemedText type="large">Hello <ThemedText type="largeBold">{user?.name}, </ThemedText><ThemedText type="large"> Welcome back!</ThemedText></ThemedText>
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
                        <Ionicons name={cardIcons[index]} color={"#ffffffc7"} size={22} style={{ marginRight: 2 }} />
                      </View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", width: "100%" }}>

                      {stat ? (
                        <>
                          <ThemedText style={{ color: "white", alignSelf: "flex-start", opacity: 0.7 }} type="extraExtraSmall"> {stat.occupiedPercentage.toFixed(2)}%</ThemedText>
                          <ThemedText style={{ color: "white", alignSelf: "flex-end" }} type="extraSmallBold"> {stat.formattedOccupiedSize}</ThemedText>
                        </>
                      ) : (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                          <View style={{ height: 10, width: '30%', borderRadius: 4, backgroundColor: '#ffffff40' }} />
                          <View style={{ height: 10, width: '25%', borderRadius: 4, backgroundColor: '#ffffff40' }} />
                        </View>
                      )}
                      </View>

                      <View style={{ width: '100%' }}>
                        <Host matchContents={false} style={{ height: 4, width: '100%' }}>
                          <LinearProgressIndicator trackColor={theme.theme.progressIndicator} color={theme.theme.completedProgressIndicator} gapSize={0} drawStopIndicator={{ stopSize: 0 }} progress={stat ? Number((stat.occupiedPercentage/ 100)) : 0} />
                        </Host>
                      </View>
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
        <FlatFileList files={filesData!} isGridView={isGridView} filesOnly={true} goToFolder={() => {

        }} viewType="recent" />

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
