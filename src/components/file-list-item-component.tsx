import SvgIcon from "@/constants/svg-icons";
import { ThemeContextType } from "@/context/theme-provider";
import { FileDataType } from "@/types/file-data-type";
import { useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";

type FileListItemProps = {
  file: FileDataType;
  index: number;
  month: string;
  day: number;
  year: number;
  theme: ThemeContextType;
  onLongPressMenu: (position: { x: number; y: number, flipped: boolean }) => void;
  screenHeight: number; // Optional prop for screen height
  screenWidth: number; // Optional prop for screen width
  goToFolder: (file: FileDataType) => void; // Optional prop for the selected file
  isRecentDocumentsView?: boolean; // Optional prop to indicate if it's a recent document
};
const BOTTOM_THRESHOLD = 240; // if touch is within this many px of the bottom, flip up
const INCREASE_BOTTOM_THRESHOLD = 140; // if touch is within this many px of the bottom, flip up
const DELAY_LONG_PRESS = 200;


export function FileListItemGrid({ file, index, month, day, year, theme, onLongPressMenu, screenHeight, screenWidth, goToFolder, isRecentDocumentsView }: FileListItemProps) {
  const rowRef = useRef<View>(null);
  const handleLongPress = () => {
    rowRef.current?.measure((fx, fy, width, height, pageX, pageY) => {
      const isNearBottom = pageY + height > screenHeight - (BOTTOM_THRESHOLD + (!isRecentDocumentsView ? INCREASE_BOTTOM_THRESHOLD : 0));

      onLongPressMenu({
        x: screenWidth - (pageX + width), // distance from the card's right edge to the screen's right edge
        y: isNearBottom ? pageY : pageY + height,
        flipped: isNearBottom,
      });
    });
  };
  return <View style={[styles.cardItemGrid, { backgroundColor: theme.theme.cardItemGridColor }]} ref={rowRef}>
    <Pressable
      key={file.id}
      onPress={() => goToFolder(file)}
      onLongPress={handleLongPress}
      android_ripple={{ color: theme.theme.secondary + "20" }}
      unstable_pressDelay={100}
      delayLongPress={DELAY_LONG_PRESS}
      style={{ flex: 1, paddingHorizontal: 15, }}
    >
      <View style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center", flex: 1 }}>

        <SvgIcon extension={file.folder ? file.shared ? 'folder-shared' : 'folder' : file.extension!} style={{ marginRight: 10 }} />


        <View style={{ flexDirection: "column", height: 80, justifyContent: "center", flex: 1, flexShrink: 1 }}>
          <ThemedText numberOfLines={2} type={"extraSmallBold"}>{file.name} </ThemedText>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 8 }}>
            <ThemedText type={"extraSmallBold"} style={{ color: theme.theme.text + "80" }}>{file.size}</ThemedText>
            <ThemedText type={"extraSmall"} style={{ color: theme.theme.text + "80" }}>{month} {day}, {year}</ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  </View>;
}



export function FileListItemList({ file, index, month, day, year, theme, onLongPressMenu, screenHeight, screenWidth, goToFolder, isRecentDocumentsView }: FileListItemProps) {
  const rowRef = useRef<View>(null);

  const handleLongPress = () => {
    rowRef.current?.measure((fx, fy, width, height, pageX, pageY) => {
      const isNearBottom = pageY + height > screenHeight - (BOTTOM_THRESHOLD + (isRecentDocumentsView === false ? INCREASE_BOTTOM_THRESHOLD : 0));
      onLongPressMenu({
        x: 20,
        y: isNearBottom ? pageY : pageY + height,
        flipped: isNearBottom,
      }); // fixed 20px from right edge
    });
  };

  return (<>
    <Pressable
      ref={rowRef}
      key={file.id}
      // style={({ pressed{}}) => ([{ opacity: pressed ? 0.8 : 1 }])}
      onPress={() => goToFolder(file)}
      android_ripple={{ color: theme.theme.secondary + "20" }}
      unstable_pressDelay={50}
      delayLongPress={DELAY_LONG_PRESS}
      style={{ flex: 1 }}
      onLongPress={handleLongPress}

    >
      <View style={[styles.cardItemList, { borderBottomColor: theme.theme.primary, borderBottomWidth: 0.6, flex: 1 }]}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 2 }}>
          <SvgIcon extension={file.folder ? file.shared ? 'folder-shared' : 'folder' : file.extension!} style={{ marginRight: 10 }} />

          <ThemedText type={"small"} style={{ wordWrap: "wrap" }} numberOfLines={1}>{file.name} </ThemedText>

        </View>

        <View style={{ flexDirection: "column", alignItems: "flex-end", gap: 2, flex: 1 }}>
          <ThemedText type={"extraSmall"} style={{ color: theme.theme.text + "80" }}>{month} {day}, {year}</ThemedText>
          <ThemedText type={"extraSmallBold"} style={{ color: theme.theme.text + "80" }}>{file.size}</ThemedText>
        </View>
      </View>
    </Pressable>
  </>
  );
}


const styles = StyleSheet.create({
  cardItemList: {
    flexDirection: "row",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: "2%",
  },
  cardItemGrid: {
    flex: 1,
    maxWidth: "48%",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
    flexDirection: "row",
    boxShadow: "0px 0px 3px 2px #0080ae13",
  }
});