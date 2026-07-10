import { FlatFileList } from '@/components/flat-file-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useFiles } from "@/context/files-provider";
import { useLayout } from '@/context/layout-context';
import { useTheme } from '@/context/theme-provider';
import { FileDataType } from '@/types/file-data-type';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

type FilesViewProps = {
    fileId?: number;
    path: string[],
    header: string,
    isFolder: boolean;
    isFavouriteView?: boolean;
    isRecentDocumentsView?: boolean;
    isTrashView?: boolean;
};

export default function FilesView({ fileId, path, header, isFolder, isFavouriteView, isRecentDocumentsView = false, isTrashView = false }: FilesViewProps) {
    const rowRef = useRef<View>(null);
    const { visibleFiles, files: allFiles } = useFiles();
    const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
    const [isShowModal, setShowModal] = useState(false);

    const fileIdNumber = Number(fileId);
    const file = visibleFiles.find((f) => f.id === fileIdNumber && f.folder === false);
    console.log("isRecentDocumentsView", isRecentDocumentsView, "isTrashView", isTrashView);

    // --- derive `visibleFiles` directly, no useState/useEffect needed ---
    const files: FileDataType[] = (() => {
        if (isFavouriteView) {
            return visibleFiles.filter((file) => file.favourite === true).sort((a, b) => a.folder === b.folder ? 0 : a.folder ? -1 : 1); // folders first
        }
        if (isTrashView) {
            return allFiles.filter((file) => file.archived === true).sort((a, b) => a.folder === b.folder ? 0 : a.folder ? -1 : 1); // folders first
        }
        if (file && file.location && !file.folder) {
            return visibleFiles.filter((f) => f.location === file.location && f.folder === false); //Get all visibleFiles in the same location as the fileId
        }
        if (isFolder) {
            const folderPath = path.length === 1 ? `${path[0]}/` : path.join("/");
            return visibleFiles.filter((f) => f.location === folderPath);
        }
        return visibleFiles.filter((f) => f.folder); // top-level folders fallback
    })();

    // --- derive `breadCrumb` directly too ---
    const breadCrumb: string[] =
        file && file.location && !file.folder
            ? file.location.split("/").filter((item) => item !== "")
            : path;

    const { isGridView, toggleView } = useLayout();
    const theme = useTheme();
    function goToFolder(fileOrFolder: FileDataType, customPath?: string[]) {
        if (fileOrFolder.folder) {

            try {
                router.push(
                    {
                        pathname: "/document-library/[...path]" as any,
                        params: { path: customPath ?? [...path, fileOrFolder.name], fileId: fileOrFolder.id, isFolder: `${fileOrFolder.folder}` },
                    });
            } catch (err) {
                console.error("router.push threw an error:", err);
            }
        }
    }


    function goToDocumentLibrary() {
        if (isFavouriteView) return;
        if (router.canDismiss()) {
            router.dismissAll();
        }
        router.replace("/document-library");
    }

    function showFolderStructureModal(

    ) {
        rowRef.current?.measure((x, y, width, height, pageX, pageY) => {
            setModalPosition({ x: pageX, y: pageY + height });
        });

        setShowModal(true);



    }


    return (<>
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedView style={{ flexDirection: 'row', flex: 12, flexWrap: 'wrap', flexShrink: 1, paddingRight: 40 }}>
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} >

                        <Pressable ref={rowRef} onPress={() => {
                            path.length > 0 ?
                                showFolderStructureModal()
                                :
                                goToDocumentLibrary();
                        }}>
                            <ThemedText numberOfLines={1} ellipsizeMode="head" type={breadCrumb.length == 0 ? 'mediumBold' : 'medium'} >
                                {path.length > 0 ? " ...... " : header}
                            </ThemedText>
                        </Pressable>

                        <ThemedText type='mediumBold'>
                            <ThemedText type='medium'>
                                {breadCrumb.length > 0 ? " > " : ""}
                            </ThemedText> {breadCrumb[breadCrumb.length - 1]} </ThemedText>
                    </ScrollView>

                </ThemedView>
                <Pressable onPress={() => toggleView()} style={{ flex: 1, alignItems: "flex-end" }}>
                    <Ionicons name={isGridView ? "grid-outline" : "list-outline"} color={theme.theme.text} size={20} />
                </Pressable>
            </ThemedView>
            <FlatFileList files={files} isGridView={isGridView} goToFolder={goToFolder} isRecentDocumentsView={isRecentDocumentsView} isTrashView={isTrashView} isFavouriteView={isFavouriteView} />
        </ThemedView>

        <Modal
            visible={isShowModal}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={() => setShowModal(false)}
        >
            <Pressable
                style={{ flex: 1 }}
                onPress={() => setShowModal(false)}>

                <View style={{
                    position: "absolute",
                    top: modalPosition.y,
                    left: modalPosition.x,
                    // flex: 1,
                }}>
                    <ScrollView horizontal={true} style={{ maxHeight: 200, maxWidth: 250, backgroundColor: theme.theme.background, borderColor: theme.theme.text + "20", borderWidth: 1, borderRadius: 5 }}>
                        <ScrollView>
                            <ThemedView style={{ padding: 12, borderRadius: 5, flex: 1, backgroundColor: theme.theme.background, borderColor: theme.theme.text + "20", borderWidth: 1 }}>
                                <Pressable onPress={() => {
                                    setShowModal(false);
                                    goToDocumentLibrary();
                                }}>

                                    <ThemedText type="medium" style={{ color: theme.theme.text, backgroundColor: theme.theme.background, padding: 4, borderRadius: 5 }}>
                                        Document Library
                                    </ThemedText>
                                </Pressable>
                                {breadCrumb.map((item, index) => (
                                    <View style={{ "width": "100%", padding: 4 }} key={index}>

                                        <Pressable key={index} onPress={() => {
                                            setShowModal(false);
                                            const file = visibleFiles.find((f) => f.name === item);
                                            goToFolder(file!, breadCrumb.slice(0, index + 1));
                                        }}>
                                            <View style={{ flexDirection: "row", alignItems: "center", borderColor: "white", width: "100%" }}>
                                                <View style={{ transform: [{ rotate: "270deg" }], alignItems: "center", justifyContent: "center" }}>
                                                    <ThemedText type="extraLarge" style={{
                                                        color: theme.theme.text,
                                                        backgroundColor: theme.theme.background,
                                                        borderRadius: 5,
                                                        top: (index + 1) * 16 - 8,
                                                    }}>T</ThemedText>
                                                </View>
                                                <View>

                                                    <ThemedText
                                                        type={breadCrumb.length - 1 == index ? 'mediumBold' : 'medium'}
                                                        style={{
                                                            color: theme.theme.text,
                                                            backgroundColor: theme.theme.background,
                                                            borderRadius: 5,
                                                            marginLeft: (index + 1) * 16,
                                                        }}
                                                    >
                                                        {item}
                                                    </ThemedText>
                                                </View>

                                            </View>
                                        </Pressable>
                                    </View>
                                ))}
                                {/* <ThemedText type="mediumBold" style={{ color: theme.theme.text, backgroundColor: theme.theme.background, padding: 6, paddingLeft: 25, borderRadius: 5 }}>
                                {breadCrumb.join(" > ")}
                                </ThemedText> */}
                            </ThemedView>
                        </ScrollView>
                    </ScrollView>


                </View>
            </Pressable>


        </Modal>
    </>


    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: "3%",
    },
    header: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        // borderWidth: 1,
        paddingHorizontal: 5,
        marginBottom: 15,

    },


});