import chunk from "@/app/utils/chunk-functions";
import { FlatFileList } from "@/components/flat-file-list";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { styles as customStyles } from "@/constants/custom-styles";
import { useTheme } from "@/context/theme-provider";
import { dummyFiles } from "@/data/dummy-file-data";
import { FileDataType } from "@/types/file-data-type";
import { Host, LinearProgressIndicator } from '@expo/ui/jetpack-compose';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from "react";
import { ColorValue, Pressable, StyleSheet, View } from "react-native";

export default function Home() {
  const theme = useTheme();
  const username = "Irfan Nasim"; // Replace with actual username logic
  const cardItems = ["Images", "Videos", "Documents", "Others"]; // Replace with actual card items logic
  const gradients: [ColorValue, ColorValue][] = [["#21BED4", '#3A8DBB'], ["#3A94BA", '#3965BB'], ["#BBBB3A", '#82BB3A'], ["#D03925", "#D08125"]];
  const cardIcons: (keyof typeof Ionicons.glyphMap)[] = ["images", "videocam", "document", "file-tray-sharp", "ellipsis-horizontal", "enter"];
  const dummyFilesData: FileDataType[] = dummyFiles;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGridView, setGridView] = useState(false);

  return (
    <ThemedView style={customStyles.container}>

      <ThemedView style={styles.welcomeHeader}>
        <ThemedText type="large">Hello <ThemedText type="largeBold">{username}, </ThemedText><ThemedText type="large"> Welcome back!</ThemedText></ThemedText>
      </ThemedView>

      <ThemedView style={styles.headerCards}>
        {chunk(cardItems, 2).map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((item, colIndex) => {
              const index = rowIndex * 2 + colIndex;
              return (
                <LinearGradient
                  key={item}
                  colors={gradients[index]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={[styles.headerCardItem, { borderColor: "transparent" }]}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                    <ThemedText style={{ color: "white" }} type={"mediumBold"}>{item}</ThemedText>
                    <Ionicons name={cardIcons[index]} color={"#ffffffc7"} size={22} style={{ marginRight: 2 }} />
                  </View>
                  <ThemedText style={{ color: "white", alignSelf: "flex-end" }} type="extraSmallBold"> 0.5KB</ThemedText>

                  <View style={{ width: '100%' }}>
                    <Host matchContents={false} style={{ height: 4, width: '100%' }}>
                      <LinearProgressIndicator trackColor={theme.theme.progressIndicator} color={theme.theme.completedProgressIndicator} gapSize={0} drawStopIndicator={{ stopSize: 0 }} progress={0.5} />
                    </Host>
                  </View>
                </LinearGradient>
              );
            })}
          </View>
        ))}
      </ThemedView>
      <ThemedView style={styles.body}>
        <ThemedView style={styles.bodyHeader}>
          <ThemedText type={"extraLargeBold"}>Recent Documents</ThemedText>
          <Pressable onPress={() => setGridView(!isGridView)}>
            <Ionicons name={isGridView ? "grid-outline" : "list-outline"} color={theme.theme.text} size={25}  />
          </Pressable>
        </ThemedView>
      </ThemedView>
      <FlatFileList dummyFilesData={dummyFilesData} isGridView={isGridView} filesOnly={true} goToFolder={() => {}} isRecentDocuments={true} />

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
    // padding: "1%",
    // borderWidth: 2,
    // borderColor: "white"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  headerCardItem: {
    overflow: "hidden",
    // flex: 1,
    width: "48%",
    minHeight: 100,
    margin: "1%",
    marginBottom: 12,
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    boxShadow: "2px 4px 6px 1px rgba(0, 0, 0, 0.1)",

  },
  body: {
    paddingTop: "2%",
    paddingBottom: "2%",
    // paddingHorizontal: "2%",
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
