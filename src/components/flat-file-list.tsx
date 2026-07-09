import { useFiles } from "@/context/files-provider";
import { useTheme } from "@/context/theme-provider";
import { FileDataType } from "@/types/file-data-type";
import { router } from "expo-router";
import { useState } from "react";
import { Dimensions, FlatList, Modal, Pressable, View } from "react-native";
import { FileListItemGrid, FileListItemList } from "./file-list-item-component";
import ModelDropDownItem from "./modal-dropdown-item";

export function FlatFileList({ files, isGridView, filesOnly, goToFolder, isRecentDocuments, isTrash }:
    {
        files: FileDataType[];
        isGridView: boolean;
        filesOnly?: boolean;
        goToFolder: (file: FileDataType) => void;
        isRecentDocuments?: boolean
        isTrash?: boolean
    }): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | null {
    const {visibleFiles  : allfiles, updateFile} = useFiles();
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
                    <FileListItemList file={file} index={index} month={month} day={day} year={year} theme={theme} onLongPressMenu={(position) => openMenuFor(item, position)} screenHeight={screenHeight} screenWidth={screenWidth} goToFolder={goToFolder} isRecentDocuments={isRecentDocuments} />
                ) : (
                    <FileListItemGrid file={file} index={index} month={month} day={day} year={year} theme={theme} onLongPressMenu={(position) => openMenuFor(item, position)} screenHeight={screenHeight} screenWidth={screenWidth} goToFolder={goToFolder} isRecentDocuments={isRecentDocuments} />
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
                    ({!isTrash}

                    {isRecentDocuments && !selectedFile?.folder && !isTrash ?
                        <ModelDropDownItem
                            onPress={() => {
                                setMenuVisible(false);

                                if (isRecentDocuments && !selectedFile?.folder) {
                                    //Open file location
                                    router.push({
                                        pathname: "/document-library",
                                        params: { fileId: selectedFile?.id, path: selectedFile?.location?.split("/") },
                                    });
                                }


                            }}
                            iconName="folder-open-outline"
                            text={isRecentDocuments && !selectedFile?.folder ? "Open file location" : "Open"}
                            theme={theme}
                        /> : null
                    }

                    {!isRecentDocuments  && !isTrash?
                        <ModelDropDownItem
                            onPress={() => {
                                setMenuVisible(false)
                            }}
                            iconName="copy-outline"
                            text="Copy"
                            theme={theme}
                        />
                        : null}


                    {!isRecentDocuments && !isTrash?
                        <ModelDropDownItem
                            onPress={() => {
                                setMenuVisible(false)
                            }}
                            iconName="move-outline"
                            text="Move"
                            theme={theme}
                        />
                        : null}
                        <ModelDropDownItem
                            onPress={() => {
                                updateFavourite();
                            }}
                            iconName={selectedFile?.favourite ? "star" : "star-outline"}
                            text={selectedFile?.favourite ? "Unfavourite" : "Favourite"}
                            theme={theme}
                        />
                        

                    <ModelDropDownItem
                        onPress={() => {
                            setMenuVisible(false)
                        }}
                        iconName="share-outline"
                        text="Share"
                        theme={theme}
                    />

                    <ModelDropDownItem
                        onPress={() => {
                            setMenuVisible(false)
                        }}
                        iconName="download-outline"
                        text="Download"
                        theme={theme} />

                    <ModelDropDownItem
                        onPress={() => {
                            setMenuVisible(false)
                        }}
                        iconName="create-outline"
                        text="Rename"
                        theme={theme} />

                    {!isRecentDocuments ?
                        <ModelDropDownItem
                            onPress={() => {
                                setMenuVisible(false)
                            }}
                            iconName="archive-outline"
                            text="Archive"
                            theme={theme}
                        />
                        : null}

                        { !isRecentDocuments? 
                    <ModelDropDownItem
                        onPress={() => {
                            setMenuVisible(false)
                        }}
                        iconName="reader-outline"
                        text="View Logs"
                        theme={theme} 
                         />
                    : null}
)


                    <ModelDropDownItem
                        onPress={() => {
                            setMenuVisible(false)
                        }}
                        iconName="trash-outline"
                        text="Delete"
                        theme={theme} />


                </View>
            </Pressable>
        </Modal>
    </>



    function updateFavourite() {
        setMenuVisible(false);
        updateFile(selectedFile?.id!, { favourite: !selectedFile?.favourite });
    }
}
