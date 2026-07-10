import { useFiles } from "@/context/files-provider";
import { useTheme } from "@/context/theme-provider";
import { FileDataType } from "@/types/file-data-type";
import { router } from "expo-router";
import { useState } from "react";
import { Dimensions, FlatList, Modal, Pressable, View } from "react-native";
import { FileListItemGrid, FileListItemList } from "./file-list-item-component";
import ModelDropDownItem, { ModelDropDownItemProps } from "./modal-dropdown-item";

export function FlatFileList({ files, isGridView, filesOnly, goToFolder, isRecentDocumentsView = false, isTrashView = false, isFavouriteView = false }:
    {
        files: FileDataType[];
        isGridView: boolean;
        filesOnly?: boolean;
        goToFolder: (file: FileDataType) => void;
        isRecentDocumentsView?: boolean
        isTrashView?: boolean;
        isFavouriteView?: boolean;
    }): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | null {
    const { visibleFiles: allfiles, updateFile } = useFiles();
    const filesData = filesOnly ? files.filter((file) => !file.folder && !file.archived) : files;
    const theme = useTheme();
    const screenHeight = Dimensions.get("screen").height;
    const screenWidth = Dimensions.get("screen").width;

    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [selectedFile, setSelectedFile] = useState<FileDataType | null>(null);
    const [menuFlipped, setMenuFlipped] = useState(false);

    const openMenuFor = (file: FileDataType, position: { x: number; y: number; flipped: boolean }) => {
        setSelectedFile(file);
        setMenuPosition(position);
        setMenuFlipped(position.flipped);
        setMenuVisible(true);
    };

    console.log("Is recent documents", isRecentDocumentsView, "Is Trash", isTrashView);

    const menuItems: ModelDropDownItemProps[] = [
        {
            itemKey: "open-location",
            iconName: "folder-open-outline",
            text: (isRecentDocumentsView || isFavouriteView) && !selectedFile?.folder ? "Open file location" : "Open",
            visible: ((isRecentDocumentsView || isFavouriteView) && !selectedFile?.folder && !isTrashView),
            theme: theme,
            onPress: () => {
                setMenuVisible(false);
                router.push({
                    pathname: "/document-library",
                    params: { fileId: selectedFile?.id, path: selectedFile?.location?.split("/") },
                });
            },
        },
        {
            itemKey: "copy",
            iconName: "copy-outline",
            text: "Copy",
            visible: (!isTrashView),
            theme: theme,
            onPress: () => setMenuVisible(false),
        },
        {
            itemKey: "move",
            iconName: "move-outline",
            text: "Move",
            visible: !isRecentDocumentsView && !isTrashView,
            theme: theme,
            onPress: () => setMenuVisible(false),
        },
        {
            itemKey: "favourite",
            iconName: selectedFile?.favourite ? "star" : "star-outline",
            text: selectedFile?.favourite ? "Unfavourite" : "Favourite",
            visible: !isTrashView,
            theme: theme,
            onPress: updateFavourite,
        },
        {
            itemKey: "share",
            iconName: "share-outline",
            text: "Share",
            visible: !isTrashView,
            theme: theme,
            onPress: () => setMenuVisible(false),
        },
        {
            itemKey: "download",
            iconName: "download-outline",
            text: "Download",
            visible: !isTrashView,
            theme: theme,
            onPress: () => setMenuVisible(false),
        },
        {
            itemKey: "rename",
            iconName: "create-outline",
            text: "Rename",
            visible: !isTrashView,
            theme: theme,
            onPress: () => setMenuVisible(false),
        },
        {
            itemKey: "archive",
            iconName: "archive-outline",
            text: "Archive",
            visible: !isRecentDocumentsView && !isTrashView,
            theme: theme,
            onPress: () => setMenuVisible(false),
        },
        {
            itemKey: "view-logs",
            iconName: "reader-outline",
            text: "View Logs",
            visible: !isRecentDocumentsView && !isTrashView,
            theme: theme,
            onPress: () => setMenuVisible(false),
        },
        {
            itemKey: "delete",
            iconName: "trash-outline",
            text: "Delete",
            visible: !isTrashView,
            theme: theme,
            onPress: () => setMenuVisible(false),
        },
        {
            itemKey: "delete-permanent",
            iconName: "trash-outline",
            text: "Delete",
            visible: isTrashView,
            theme: theme,
            onPress: () => setMenuVisible(false),
        },
        {
            itemKey: "restore",
            iconName: "refresh-outline",
            text: "Restore",
            visible: isTrashView,
            theme: theme,
            onPress: () => setMenuVisible(false),
        }
    ]
    return <>

        <FlatList data={filesData}
            style={{ paddingTop: 6 }}
            numColumns={isGridView ? 2 : 1}
            columnWrapperStyle={isGridView ? { gap: 10, width: "100%" } : undefined}

            key={'grid' + isGridView}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => {
                const file = item;
                const day = new Date(file.createdOn).getDate();
                const month = new Date(file.createdOn).toLocaleDateString('default', { month: 'short' }); // getMonth() returns 0-11
                const year = new Date(file.createdOn).getFullYear();
                return !isGridView ? (
                    <FileListItemList file={file} index={index} month={month} day={day} year={year} theme={theme} onLongPressMenu={(position) => openMenuFor(item, position)} screenHeight={screenHeight} screenWidth={screenWidth} goToFolder={goToFolder} isRecentDocumentsView={isRecentDocumentsView} />
                ) : (
                    <FileListItemGrid file={file} index={index} month={month} day={day} year={year} theme={theme} onLongPressMenu={(position) => openMenuFor(item, position)} screenHeight={screenHeight} screenWidth={screenWidth} goToFolder={goToFolder} isRecentDocumentsView={isRecentDocumentsView} />
                );
            }}>


        </FlatList>
        <Modal
            visible={menuVisible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={() => setMenuVisible(false)}
        >
            <Pressable
                style={{ flex: 1 }}
                onPress={() => setMenuVisible(false)}
            >
                <View
                    style={{
                        position: "absolute",
                        ...(menuFlipped
                            ? { bottom: screenHeight - menuPosition.y } // anchor from bottom, growing upward
                            : { top: menuPosition.y }),
                        right: menuPosition.x,
                        backgroundColor: theme.theme.background,
                        borderColor: theme.theme.text + "20",
                        paddingVertical: 2,
                        minWidth: 140,
                        elevation: 6,
                    }}
                >
                    {menuItems.map((menuItem) => (
                        console.log("Menu Item", menuItem.text, "Visible", menuItem.visible),
                        <ModelDropDownItem
                            key={menuItem.itemKey}
                            itemKey={menuItem.itemKey}
                            text={menuItem.text}
                            iconName={menuItem.iconName}
                            onPress={menuItem.onPress}
                            theme={theme}
                            visible={menuItem.visible} // default to true if not specified
                        />
                    ))}

                </View>
            </Pressable>
        </Modal>
    </>



    function updateFavourite() {
        setMenuVisible(false);
        updateFile(selectedFile?.id!, { favourite: !selectedFile?.favourite });
    }
}
