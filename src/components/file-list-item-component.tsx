import SvgIcon from "@/constants/svg-icons";
import { ThemeContextType } from "@/context/theme-provider";
import { FileDto } from "@/types/api/file-dto";
import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";

type FileListItemProps = {
  file: FileDto;
  index: number;
  month: string;
  day: number;
  year: number;
  theme: ThemeContextType;
  onLongPressMenu: (position: { x: number; y: number, flipped: boolean }) => void;
  screenHeight: number; // Optional prop for screen height
  screenWidth: number; // Optional prop for screen width
  goToFolder: (file: FileDto) => void; // Optional prop for the selected file
  isRecentDocumentsView?: boolean; // Optional prop to indicate if it's a recent document
  isSelectionMode?: boolean;
  selected?: boolean;
  onSelect?: () => void;
};
const BOTTOM_THRESHOLD = 240;
const INCREASE_BOTTOM_THRESHOLD = 140;
const DELAY_LONG_PRESS = 200;

function FileIndicators({ file, theme }: { file: FileDto; theme: ThemeContextType }) {
  const hasShared = file.shared;
  const hasComments = (file.dlDocumentCommentsCount ?? 0) > 0;
  const hasAutomate = file.workflowExecuted;
  const hasFavourite = file.favourite;
  const commentCount = file.dlDocumentCommentsCount ?? 0;

  if (!hasShared && !hasComments && !hasAutomate && !hasFavourite) return null;

  const iconColor = theme.theme.modalDropDownIconColor;
  const iconSize = 12;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      {hasShared && (
        <Image source={require('../../assets/images/icons/share.png')} style={{ width: iconSize, height: iconSize, tintColor: iconColor }} />
      )}
      {hasAutomate && (
        <Image source={require('../../assets/images/icons/workflow.png')} style={{ width: iconSize, height: iconSize, tintColor: iconColor }} />
      )}
      {hasFavourite && (
        <Image source={require('../../assets/images/icons/favourite.png')} style={{ width: iconSize, height: iconSize, tintColor: iconColor }} />
      )}
      {hasComments && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <Image source={require('../../assets/images/icons/comment.png')} style={{ width: iconSize, height: iconSize, tintColor: iconColor }} />
          <ThemedText type="extraExtraSmall" style={{ color: iconColor, fontSize: 11, lineHeight: 14 }}>
            {commentCount > 99 ? '99+' : commentCount}
          </ThemedText>
        </View>
      )}
    </View>
  );
}


export function FileListItemGrid({ file, index, month, day, year, theme, onLongPressMenu, screenHeight, screenWidth, goToFolder, isRecentDocumentsView, isSelectionMode, selected, onSelect }: FileListItemProps) {
  const rowRef = useRef<View>(null);
  const handleLongPress = () => {
    if (isSelectionMode) return;
    rowRef.current?.measure((fx, fy, width, height, pageX, pageY) => {
      const isNearBottom = pageY + height > screenHeight - (BOTTOM_THRESHOLD + (!isRecentDocumentsView ? INCREASE_BOTTOM_THRESHOLD : 0));

      onLongPressMenu({
        x: screenWidth - (pageX + width), // distance from the card's right edge to the screen's right edge
        y: isNearBottom ? pageY : pageY + height,
        flipped: isNearBottom,
      });
    });
  };
  return (
    <View
      style={[
        styles.cardItemGrid,
        { backgroundColor: theme.theme.cardItemGridColor },
        selected && { backgroundColor: theme.theme.primary + '18', borderWidth: 1.5, borderColor: theme.theme.primary + '60' },
      ]}
      ref={rowRef}
    >
      <Pressable
        key={`${file.id}-Grid`}
        onPress={() => {
          if (isSelectionMode) {
            onSelect?.();
          } else {
            setTimeout(() => { goToFolder(file); }, 50);
          }
        }}
        onLongPress={handleLongPress}
        android_ripple={{ color: theme.theme.secondary + "20" }}
        unstable_pressDelay={50}
        delayLongPress={DELAY_LONG_PRESS}
        style={{ flex: 1 }}
      >
        {selected && (
          <View style={{ position: 'absolute', top: 6, right: 6, zIndex: 10 }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: theme.theme.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="checkmark" size={13} color="#fff" />
            </View>
          </View>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 10 }}>
          <View style={{ alignItems: "center", justifyContent: "center", paddingRight: 10 }}>
            <SvgIcon extension={file.folder ? file.shared ? 'folder-shared' : 'folder' : file.extension!} />
          </View>
          <View style={{ flexDirection: "column", flex: 1, flexShrink: 1 }}>
            <ThemedText numberOfLines={2} type={"extraSmallBold"}>{file.name}</ThemedText>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 4, marginTop: 4 }}>
              <ThemedText numberOfLines={1} type={"extraExtraSmallBold"} style={{ color: theme.theme.text + "80", flexShrink: 1 }}>{file.size}</ThemedText>
              <ThemedText numberOfLines={1} type={"extraExtraSmall"} style={{ color: theme.theme.text + "80" }}>{month} {day}, {year}</ThemedText>
            </View>
          </View>
        </View>
        <View style={{ borderTopWidth: 0.5, borderTopColor: theme.theme.textSecondary + '30', marginHorizontal: 8 }} />
        <View style={{ paddingHorizontal: 8, paddingVertical: 6 }}>
          <FileIndicators file={file} theme={theme} />
        </View>
      </Pressable>
    </View>
  );
}



export function FileListItemList({ file, index, month, day, year, theme, onLongPressMenu, screenHeight, screenWidth, goToFolder, isRecentDocumentsView, isSelectionMode, selected, onSelect }: FileListItemProps) {
  const rowRef = useRef<View>(null);

  const handleLongPress = () => {
    if (isSelectionMode) return;
    rowRef.current?.measure((fx, fy, width, height, pageX, pageY) => {
      const isNearBottom = pageY + height > screenHeight - (BOTTOM_THRESHOLD + (isRecentDocumentsView === false ? INCREASE_BOTTOM_THRESHOLD : 0));
      onLongPressMenu({
        x: 20,
        y: isNearBottom ? pageY : pageY + height,
        flipped: isNearBottom,
      }); // fixed 20px from right edge
    });
  };

  return (
    <Pressable
      ref={rowRef}
      key={`${file.id}-List`}
      onPress={() => {
        if (isSelectionMode) {
          onSelect?.();
        } else {
          setTimeout(() => { goToFolder(file); }, 50);
        }
      }}
      android_ripple={{ color: theme.theme.secondary + "20" }}
      unstable_pressDelay={50}
      delayLongPress={DELAY_LONG_PRESS}
      style={{ flex: 1 }}
      onLongPress={handleLongPress}
    >
      <View style={[
        { borderBottomWidth: 0.5, borderBottomColor: theme.theme.primary + '40' },
        selected && { backgroundColor: theme.theme.primary + '14' },
      ]}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10 }}>
          {isSelectionMode && (
            <View style={{ marginRight: 10 }}>
              <View style={[
                { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: theme.theme.primary, alignItems: 'center', justifyContent: 'center' },
                selected && { backgroundColor: theme.theme.primary },
              ]}>
                {selected && <Ionicons name="checkmark" size={13} color="#fff" />}
              </View>
            </View>
          )}
          <View style={{ alignItems: "center", justifyContent: "center", paddingRight: 10 }}>
            <SvgIcon extension={file.folder ? file.shared ? 'folder-shared' : 'folder' : file.extension!} />
          </View>
          <View style={{ flexDirection: "column", flex: 1, flexShrink: 1 }}>
            <ThemedText type={"small"} numberOfLines={1}>{file.name}</ThemedText>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 }}>
              <ThemedText type={"extraExtraSmallBold"} style={{ color: theme.theme.text + "80" }}>{file.size}</ThemedText>
              <ThemedText type={"extraExtraSmall"} style={{ color: theme.theme.text + "80" }}>{month} {day}, {year}</ThemedText>
            </View>
          </View>
          {!isSelectionMode && <FileIndicators file={file} theme={theme} />}
        </View>
      </View>
    </Pressable>
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
    maxWidth: "49%",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
    flexDirection: "row",
    boxShadow: "0px 0px 2px 3px #0080ae0a",
  }
});