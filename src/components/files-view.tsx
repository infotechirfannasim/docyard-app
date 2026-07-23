import { FlatFileList } from '@/components/flat-file-list';
import { ThemedText } from '@/components/themed-text';
import ThemedTextInput from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { UploadAction } from '@/components/upload-action';
import { useAuth } from '@/context/auth-context';
import { useLayout } from '@/context/layout-context';
import { useTheme } from '@/context/theme-provider';
import { useCreateFolder, useHierarchy, useSearchFile } from '@/hooks/queries/use-files';
import { useCurrentUser } from '@/hooks/queries/use-user';
import { FileDto } from '@/types/api/file-dto';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

type ViewType = 'default' | 'favourite' | 'recent' | 'trash' | 'shared-by-me' | 'shared-with-me' | 'archival';

type FilesViewProps = {
    fileId?: number;
    files: FileDto[];
    header: "Document Library" | "Favourites" | "Trash" | "Recent Documents" | "Share By Me" | "Share To Me" | "Archival" | "Images" | "Videos" | "Documents" | "Others";
    isFolder: boolean;
    viewType?: ViewType;
};

export default function FilesView({ fileId, files, header, isFolder, viewType = 'default' }: FilesViewProps) {
    const rowRef = useRef<View>(null);
    const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
    const [isShowModal, setShowModal] = useState(false);

    const fileIdNumber = Number(fileId);
    const { data: hierarchy, isLoading: isHierarchyLoading } = useHierarchy(fileIdNumber, !!fileIdNumber);

    const breadCrumbItems: FileDto[] | null = hierarchy?.length ? hierarchy : null;
    const breadCrumb: string[] = breadCrumbItems ? breadCrumbItems.map((item) => item.name) : [];

    const { isGridView, toggleView } = useLayout();
    const theme = useTheme();
    const createFolderMutation = useCreateFolder();
    const { username } = useAuth();
    const { data: user } = useCurrentUser(username);

    const [isCreateFolderModalVisible, setCreateFolderModalVisible] = useState(false);
    const [folderName, setFolderName] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSearch, setActiveSearch] = useState('');

    useEffect(() => {
        setSearchQuery('');
        setActiveSearch('');
    }, [fileId, header]);

    useEffect(() => {
        if (!searchQuery) setActiveSearch('');
    }, [searchQuery]);

    const isRoot = header === "Document Library" && !fileId;
    const { data: searchResults, isLoading: isSearching } = useSearchFile(activeSearch, user?.id ?? 0);
    const searchActive = isRoot && activeSearch.length > 0;
    const isSearchLoading = searchActive && isSearching;
    const displayFiles = searchActive && searchResults ? searchResults : files;

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(message);
        setToastType(type);
    };

    useEffect(() => {
        if (!toastMessage) return;
        const timer = setTimeout(() => setToastMessage(''), 3000);
        return () => clearTimeout(timer);
    }, [toastMessage]);

    function goToFolder(fileOrFolder: FileDto, customPath?: string[]) {
        if (fileOrFolder.folder) {
            const currentPath = breadCrumbItems?.map((h) => h.name) ?? [];
            const newPath = customPath ?? [...currentPath, fileOrFolder.name];
            try {
                router.push({
                    pathname: "/document-library/[...path]" as any,
                    params: { path: newPath, fileId: fileOrFolder.id, isFolder: `${fileOrFolder.folder}` },
                });
            } catch (err) {
                console.error("router.push threw an error:", err);
            }
        }
    }

    function goToDocumentLibrary() {
        if (viewType !== 'default' || !breadCrumbItems?.length) return;
        if (router.canDismiss()) {
            router.dismissAll();
        }
        router.replace("/document-library");
    }

    function showFolderStructureModal() {
        rowRef.current?.measure((x, y, width, height, pageX, pageY) => {
            setModalPosition({ x: pageX, y: pageY + height });
        });
        setShowModal(true);
    }

    function openCreateFolderModal() {
        setFolderName('');
        setCreateFolderModalVisible(true);
    }

    function handleCreateFolder() {
        const trimmed = folderName.trim();
        if (!trimmed || !user?.id) return;

        const now = new Date().toISOString();
        createFolderMutation.mutate(
            {
                createdBy: user.id,
                createdOn: now,
                daysArchived: 0,
                name: trimmed,
                parentId: fileIdNumber || null,
                title: trimmed,
                updatedBy: user.id,
                updatedOn: now,
            },
            {
                onSuccess: () => {
                    setCreateFolderModalVisible(false);
                    showToast(`Folder "${trimmed}" created`);
                },
                onError: (error: any) => {
                    setCreateFolderModalVisible(false);
                    showToast(error?.response?.data?.message || error?.message || 'Failed to create folder', 'error');
                },
            }
        );
    }

    return (<>
        <ThemedView style={styles.container}>
            {header === "Document Library" && (
                <UploadAction currentFolderId={fileIdNumber} onCreateFolder={openCreateFolderModal} />
            )}

            <ThemedView style={styles.header}>
                <ThemedView style={{ flexDirection: 'row', flex: 12, flexWrap: 'wrap', flexShrink: 1, paddingRight: 40 }}>
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} >
                        <Pressable ref={rowRef} onPress={() => {
                            breadCrumbItems?.length ?
                                showFolderStructureModal()
                                :
                                goToDocumentLibrary();
                        }}>
                            <ThemedText numberOfLines={1} ellipsizeMode="head" type={!breadCrumbItems?.length ? 'mediumBold' : 'medium'} >
                                {breadCrumbItems?.length ? " ...... " : header}
                            </ThemedText>
                        </Pressable>
                        {breadCrumb.length > 0 && <ThemedText type='mediumBold'>
                            <ThemedText type='medium'>{' > '}</ThemedText> {breadCrumb[breadCrumb.length - 1]}
                        </ThemedText>}
                    </ScrollView>
                </ThemedView>
                <Pressable onPress={() => toggleView()} style={{ flex: 1, alignItems: "flex-end" }}>
                    <Ionicons name={isGridView ? "grid-outline" : "list-outline"} color={theme.theme.text} size={20} />
                </Pressable>
            </ThemedView>
            {isRoot && (
                <ThemedView style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: theme.theme.text + '20',
                    marginBottom: 12,
                }}>
                    <Pressable onPress={() => setActiveSearch(searchQuery)}>
                        {isSearching ? (
                            <ActivityIndicator size="small" color={theme.theme.primary} />
                        ) : (
                            <Ionicons name="search-outline" size={18} color={theme.theme.text + '60'} />
                        )}
                    </Pressable>
                    <TextInput
                        placeholder="Search files..."
                        placeholderTextColor={theme.theme.text + '60'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={() => setActiveSearch(searchQuery)}
                        returnKeyType="search"
                        style={{ flex: 1, paddingVertical: 4, fontSize: 14, color: theme.theme.text }}
                    />
                    {searchQuery ? (
                        <Pressable onPress={() => { setSearchQuery(''); setActiveSearch(''); }}>
                            <Ionicons name="close-circle" size={18} color={theme.theme.text + '60'} />
                        </Pressable>
                    ) : null}
                </ThemedView>
            )}
            {isSearchLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.theme.primary} />
                </View>
            ) : (
                <FlatFileList files={displayFiles} isGridView={isGridView} goToFolder={goToFolder} viewType={viewType} />
            )}
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
                                {isHierarchyLoading && !!fileIdNumber ? (
                                    <ActivityIndicator size="small" style={{ marginTop: 8 }} />
                                ) : breadCrumbItems?.map((hierarchyItem, index) => (
                                    <View style={{ "width": "100%", padding: 4 }} key={hierarchyItem.id ?? index}>

                                        <Pressable onPress={() => {
                                            if (index === breadCrumbItems.length - 1) return;
                                            setShowModal(false);
                                            const newPath = breadCrumbItems.slice(0, index + 1).map((h) => h.name);
                                            goToFolder(hierarchyItem, newPath);
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
                                                        type={breadCrumbItems.length - 1 == index ? 'mediumBold' : 'medium'}
                                                        style={{
                                                            color: theme.theme.text,
                                                            backgroundColor: theme.theme.background,
                                                            borderRadius: 5,
                                                            marginLeft: (index + 1) * 16,
                                                        }}
                                                    >
                                                        {hierarchyItem.name}
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

        <Modal
            visible={isCreateFolderModalVisible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={() => setCreateFolderModalVisible(false)}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000060' }}
            >
                <Pressable
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}
                    onPress={() => setCreateFolderModalVisible(false)}
                >
                    <Pressable onPress={() => {}}>
                        <ThemedView
                            style={{
                                width: 320,
                                borderRadius: 16,
                                padding: 28,
                                gap: 24,
                            }}
                        >
                            <ThemedText type="mediumBold" style={{ textAlign: 'center' }}>
                                New Folder
                            </ThemedText>

                            <ThemedTextInput
                                placeholder="Folder name"
                                value={folderName}
                                onChangeText={setFolderName}
                                autoFocus
                                maxLength={254}
                                onSubmitEditing={handleCreateFolder}
                                returnKeyType="done"
                                style={{
                                    borderRadius: 10,
                                    padding: 14,
                                    fontSize: 15,
                                }}
                            />

                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
                                <Pressable
                                    onPress={() => setCreateFolderModalVisible(false)}
                                    style={{
                                        paddingVertical: 10,
                                        paddingHorizontal: 20,
                                        borderRadius: 8,
                                    }}
                                >
                                    <ThemedText type="medium" style={{ color: theme.theme.text + '99' }}>Cancel</ThemedText>
                                </Pressable>

                                <Pressable
                                    onPress={handleCreateFolder}
                                    disabled={createFolderMutation.isPending || !folderName.trim()}
                                    style={{
                                        paddingVertical: 10,
                                        paddingHorizontal: 22,
                                        backgroundColor: createFolderMutation.isPending || !folderName.trim() ? theme.theme.text + '20' : theme.theme.primary,
                                        borderRadius: 8,
                                        minWidth: 72,
                                        alignItems: 'center',
                                    }}
                                >
                                    {createFolderMutation.isPending ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <ThemedText type="mediumBold" style={{ color: 'white' }}>Create</ThemedText>
                                    )}
                                </Pressable>
                            </View>
                        </ThemedView>
                    </Pressable>
                </Pressable>
            </KeyboardAvoidingView>
        </Modal>
        {toastMessage ? (
            <ThemedView
                style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 24,
                    right: 24,
                    padding: 14,
                    borderRadius: 10,
                    alignItems: 'center',
                    zIndex: 2000,
                    backgroundColor: toastType === 'error' ? theme.theme.onError : theme.theme.onSuccess,
                }}
            >
                <ThemedText type="smallBold" style={{ color: 'white' }}>{toastMessage}</ThemedText>
            </ThemedView>
        ) : null}
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