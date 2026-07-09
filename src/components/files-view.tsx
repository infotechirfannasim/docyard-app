import { FlatFileList } from '@/components/flat-file-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLayout } from '@/context/layout-context';
import { useTheme } from '@/context/theme-provider';
import { dummyFiles } from '@/data/dummy-file-data';
import { FileDataType } from '@/types/file-data-type';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

type FilesViewProps = {
    fileId?: number;
    path: string[],
    isFolder: boolean;
    isStarred?: boolean;
    isRecentDocuments?: boolean; // Optional prop to indicate if it's a recent document
};

export default function FilesView({ fileId, path, isFolder, isStarred, isRecentDocuments=false }: FilesViewProps) {

    const fileIdNumber = Number(fileId);
    const file =  dummyFiles.find((f) => f.id === fileIdNumber && f.folder === false);

    // --- derive `files` directly, no useState/useEffect needed ---
    const files: FileDataType[] = (() => {
        if (isStarred) {
            return dummyFiles.filter((file) => file.favourite === true).sort((a, b) => a.folder === b.folder ? 0 : a.folder ? -1 : 1); // folders first
        }
        if (file && file.location && !file.folder) {
            return dummyFiles.filter((f) => f.location === file.location && f.folder === false); //Get all files in the same location as the fileId
        }
        if (isFolder) {
            const folderPath = path.length === 1 ? `${path[0]}/` : path.join("/");
            console.log("folderPath: ", folderPath);
            return dummyFiles.filter((f) => f.location === folderPath);
        }
        return dummyFiles.filter((f) => f.folder); // top-level folders fallback
    })();

    // --- derive `breadCrumb` directly too ---
    const breadCrumb: string[] =
        file && file.location && !file.folder
            ? file.location.split("/").filter((item) => item !== "")
            : path;

    const {isGridView, toggleView} = useLayout(); 
    const theme = useTheme();
    function goToFolder(file: FileDataType) {
        if(file.folder){

            console.log("goToFolder: ", file);
            try {
                router.push(
                    {
                        pathname: "/document-library/[...path]" as any,
                        params: { path: [...path, file.name], fileId: file.id, isFolder: `${file.folder}` },
                    });
                console.log("router.push call completed without throwing");
            } catch (err) {
                console.error("router.push threw an error:", err);
            }
        }
    }

    function goToDocumentLibrary() {
        router.dismissTo("/document-library");
    }


    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedView style={{ flexDirection: 'row', flex: 12, flexWrap: 'wrap', flexShrink: 1, paddingRight: 40 }}>
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} >

                        <Pressable onPress={() => {
                            goToDocumentLibrary();
                        }}>
                            <ThemedText numberOfLines={1} ellipsizeMode="head" type={breadCrumb.length == 0 ? 'mediumBold' : 'medium'} >
                                Document Library
                            </ThemedText>
                        </Pressable>
                        {breadCrumb.map((item, index) => (
                            <ThemedText type='medium' key={index}>
                                {" > "}
                                <ThemedText type={breadCrumb.length - 1 == index ? 'mediumBold' : 'medium'}> {item} </ThemedText>
                            </ThemedText>

                        ))}
                    </ScrollView>

                </ThemedView>
                <Pressable onPress={() => toggleView()} style={{ flex: 1, alignItems: "flex-end" }}>
                    <Ionicons name={isGridView ? "grid-outline" : "list-outline"} color={theme.theme.text} size={20} />
                </Pressable>
            </ThemedView>
            <FlatFileList dummyFilesData={files} isGridView={isGridView} goToFolder={goToFolder} isRecentDocuments={isRecentDocuments} />
        </ThemedView>


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
    content: {

    }

});