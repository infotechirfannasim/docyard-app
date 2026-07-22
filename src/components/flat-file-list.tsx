import { fetchFiles } from '@/api/endpoints/files';
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-provider";
import { useArchivalRestoreFiles, useArchivedRestoreFiles, useCopyFile, useDeleteFile, useFileLogs, useMoveFile, usePermanentDeleteFile, useRenameFile, useUpdateArchivalFile, useUpdateFavouriteFile } from "@/hooks/queries/use-files";
import { useCurrentUser } from "@/hooks/queries/use-user";
import { FileDto } from "@/types/api/file-dto";
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Dimensions, FlatList, View } from "react-native";
import { AnimatedToast } from "./animated-toast";
import { ConfirmActionModal } from "./confirm-action-modal";
import { FileContextMenu } from "./file-context-menu";
import { FileListItemGrid, FileListItemList } from "./file-list-item-component";
import { FileLogsModal } from "./file-logs-modal";
import { FolderPickerModal } from "./folder-picker-modal";
import { ModelDropDownItemProps } from "./modal-dropdown-item";
import { RenameModal } from "./rename-modal";
import { TrashFab } from "./trash-fab";

type ViewType = 'default' | 'favourite' | 'recent' | 'trash' | 'shared-by-me' | 'shared-with-me'| 'archival';

export function FlatFileList({ files, isGridView, filesOnly, goToFolder, viewType = 'default' }:
    {
        files?: FileDto[] | undefined;
        isGridView: boolean;
        filesOnly?: boolean;
        goToFolder: (file: FileDto) => void;
        viewType?: ViewType;
    }): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | null {
    const isTrashView = viewType === 'trash';
    const isRecentDocumentsView = viewType === 'recent';
    const isFavouriteView = viewType === 'favourite';
    const isSharedByMeView = viewType === 'shared-by-me';
    const isSharedWithMeView = viewType === 'shared-with-me';
    const isArchivalView = viewType === 'archival';
    const theme = useTheme();
    const deleteFileMutation = useDeleteFile();
    const restoreArchivedFilesMutation = useArchivedRestoreFiles();
    const restoreArchivalFilesMutation = useArchivalRestoreFiles();
    const permanentDeleteMutation = usePermanentDeleteFile();
    const copyFileMutation = useCopyFile();
    const moveFileMutation = useMoveFile();
    const favouriteFileMutation = useUpdateFavouriteFile();
    const archivalFileMutation = useUpdateArchivalFile();
    const renameFileMutation = useRenameFile();
    const { username } = useAuth();
    const { data: user } = useCurrentUser(username);
    const screenHeight = Dimensions.get("screen").height;
    const screenWidth = Dimensions.get("screen").width;

    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [selectedFile, setSelectedFile] = useState<FileDto | null>(null);
    const [menuFlipped, setMenuFlipped] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'restore' | 'delete-permanent'; fileId: number; fileName: string } | null>(null);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [isFolderPickerVisible, setFolderPickerVisible] = useState(false);
    const [pickerMode, setPickerMode] = useState<'copy' | 'move'>('copy');
    const [pickerPath, setPickerPath] = useState<{ id: number | null; name: string }[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const queryClient = useQueryClient();
    const [isRenameModalVisible, setRenameModalVisible] = useState(false);
    const [renameName, setRenameName] = useState('');
    const [logsModalVisible, setLogsModalVisible] = useState(false);
    const [logsFileId, setLogsFileId] = useState<number | null>(null);
    const { data: fileLogs, isLoading: isLogsLoading } = useFileLogs(logsFileId!, !!logsFileId);

    const refreshQueryKey = (() => {
        switch (viewType) {
            case 'favourite': return ["favouriteFiles"];
            case 'recent': return ["recentFiles"];
            case 'trash': return ["trashFiles"];
            case 'shared-by-me': return ["sharedByMeFiles"];
            case 'shared-with-me': return ["sharedWithMeFiles"];
            case 'archival': return ["archivalFiles"];
            default: return ["files"];
        }
    })();

    const onRefresh = async () => {
        setRefreshing(true);
        await queryClient.invalidateQueries({ queryKey: refreshQueryKey });
        queryClient.refetchQueries({ queryKey: refreshQueryKey });
        setRefreshing(false);
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(message);
        setToastType(type);
    };

    const currentPickerFolderId = pickerPath[pickerPath.length - 1]?.id ?? null;
    const currentPickerFolderName = pickerPath[pickerPath.length - 1]?.name ?? 'Document Library';

    const { data: pickerFiles, isLoading: isPickerLoading } = useQuery({
        queryKey: ["pickerFolders", currentPickerFolderId],
        queryFn: () => fetchFiles(user?.id!, currentPickerFolderId || 0),
        enabled: isFolderPickerVisible && !!user?.id,
    });
    const pickerFolders = (pickerFiles ?? []).filter((f) => f.folder);

    const openMenuFor = (file: FileDto, position: { x: number; y: number; flipped: boolean }) => {
        setSelectedFile(file);
        setMenuPosition(position);
        setMenuFlipped(position.flipped);
        setMenuVisible(true);
    };

    const menuItems: ModelDropDownItemProps[] = [
        {
            itemKey: "open-location",
            iconName: "folder-open-outline",
            text: (isRecentDocumentsView || isFavouriteView) && !selectedFile?.folder ? "Open file location" : "Open",
            visible: ((isRecentDocumentsView || isFavouriteView) && !selectedFile?.folder && !isTrashView),
            theme: theme,
            onPress: () => {
                setMenuVisible(false);
                const parentId = selectedFile?.parentId;
                const location = selectedFile?.location;
                if (!parentId) return;
                router.push({
                    pathname: "/document-library/[...path]" as any,
                    params: { path: location?.split("/") ?? ["folder"], fileId: parentId, isFolder: "true" },
                });
            },
        },
        {
            itemKey: "copy",
            iconName: "copy-outline",
            text: "Copy",
            visible: (!isTrashView && !isArchivalView),
            theme: theme,
            onPress: () => {
                setMenuVisible(false);
                if (!selectedFile?.id) return;
                setPickerMode('copy');
                setPickerPath([{ id: null, name: 'Document Library' }]);
                setFolderPickerVisible(true);
            },
        },
        {
            itemKey: "move",
            iconName: "move-outline",
            text: "Move",
            visible: !isRecentDocumentsView && !isTrashView && !isArchivalView,
            theme: theme,
            onPress: () => {
                setMenuVisible(false);
                if (!selectedFile?.id) return;
                setPickerMode('move');
                setPickerPath([{ id: null, name: 'Document Library' }]);
                setFolderPickerVisible(true);
            },
        },
        {
            itemKey: "favourite",
            iconName: selectedFile?.favourite ? "star" : "star-outline",
            text: selectedFile?.favourite ? "Unfavourite" : "Favourite",
            visible: !isTrashView && !isArchivalView,
            theme: theme,
            onPress: updateFavourite,
        },
        {
            itemKey: "share",
            iconName: "share-outline",
            text: "Share",
            visible: !isTrashView && !isArchivalView,
            theme: theme,
            onPress: () => setMenuVisible(false),
        },
        {
            itemKey: "download",
            iconName: "download-outline",
            text: "Download",
            visible: !isTrashView && !isArchivalView,
            theme: theme,
            onPress: () => setMenuVisible(false),
        },
        {
            itemKey: "rename",
            iconName: "create-outline",
            text: "Rename",
            visible: !isTrashView && !isArchivalView,
            theme: theme,
            onPress: () => {
                setMenuVisible(false);
                if (!selectedFile?.id || !selectedFile?.name) return;
                setRenameName(selectedFile.name);
                setRenameModalVisible(true);
            },
        },
        {
            itemKey: "archive",
            iconName: "archive-outline",
            text: "Archive",
            visible: !isRecentDocumentsView && !isTrashView && !isArchivalView,
            theme: theme,
            onPress: () => {
                setMenuVisible(false);
                const fileId = selectedFile?.id;
                const fileName = selectedFile?.name;
                if (!fileId || !fileName) return;
                archivalFileMutation.mutate(fileId, {
                    onSuccess: () => showToast(`"${fileName}" archived`),
                    onError: (error: any) => showToast(error?.response?.data?.message || 'Failed to archive', 'error'),
                });
            },
        },
        {
            itemKey: "view-logs",
            iconName: "reader-outline",
            text: "View Logs",
            visible: !isRecentDocumentsView && !isTrashView && !isArchivalView,
            theme: theme,
            onPress: () => {
                setMenuVisible(false);
                const fileId = selectedFile?.id;
                if (!fileId) return;
                setLogsFileId(fileId);
                setLogsModalVisible(true);
            },
        },
        {
            itemKey: "delete",
            iconName: "trash-outline",
            text: "Delete",
            visible: !isTrashView,
            theme: theme,
            onPress: () => {
                setMenuVisible(false);
                const fileId = selectedFile?.id;
                const fileName = selectedFile?.name;
                if (!fileId || !fileName) return;
                setConfirmAction({ type: 'delete', fileId, fileName });
            },
        },
        {
            itemKey: "delete-permanent",
            iconName: "trash-outline",
            text: "Delete",
            visible: isTrashView,
            theme: theme,
            onPress: () => {
                setMenuVisible(false);
                const fileId = selectedFile?.id;
                const fileName = selectedFile?.name;
                if (!fileId || !fileName) return;
                setConfirmAction({ type: 'delete-permanent', fileId, fileName });
            },
        },
        {
            itemKey: "restore",
            iconName: isArchivalView ? "arrow-undo-outline" : "refresh-outline",
            text: isArchivalView ? "Undo Archive" : "Restore",
            visible: isTrashView || isArchivalView,
            theme: theme,
            onPress: () => {
                setMenuVisible(false);
                const fileId = selectedFile?.id;
                const fileName = selectedFile?.name;
                if (!fileId || !fileName) return;
                setConfirmAction({ type: 'restore', fileId, fileName });
            },
        }
    ]
    return <>

        <FlatList data={files}
            style={{ paddingTop: 6 }}
            refreshing={refreshing}
            onRefresh={onRefresh}
            numColumns={isGridView ? 2 : 1}
            columnWrapperStyle={isGridView ? { gap: 10, width: "100%", justifyContent: 'flex-start', paddingHorizontal: `1%` } : undefined}

            key={isGridView ? "grid" : "list"}
            keyExtractor={(item) => `${item.id ?? item.name}+${isGridView ? "grid" : "list"}`}
            ListEmptyComponent={
                <View style={{ minHeight: screenHeight - 320, justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="document-outline" size={48} color={theme.theme.text + '30'} />
                    <ThemedText type="medium" style={{ color: theme.theme.text + '50', marginTop: 12 }}>
                        {isTrashView ? 'Trash is empty' : isFavouriteView ? 'No favourite files' : isRecentDocumentsView ? 'No recent files' : isSharedByMeView ? 'No shared files' : isSharedWithMeView ? 'No files shared with you' : isArchivalView ? 'No archived files' : 'No files'}
                    </ThemedText>
                </View>
            }
            renderItem={({ item, index }) => {
                const file = item;
                const day = new Date(file.createdOn).getDate();
                const month = new Date(file.createdOn).toLocaleDateString('default', { month: 'short' });
                const year = new Date(file.createdOn).getFullYear();
                return !isGridView ? (
                    <FileListItemList file={file} index={index} month={month} day={day} year={year} theme={theme} onLongPressMenu={(position) => openMenuFor(item, position)} screenHeight={screenHeight} screenWidth={screenWidth} goToFolder={goToFolder} isRecentDocumentsView={isRecentDocumentsView} />
                ) : (
                    <FileListItemGrid file={file} index={index} month={month} day={day} year={year} theme={theme} onLongPressMenu={(position) => openMenuFor(item, position)} screenHeight={screenHeight} screenWidth={screenWidth} goToFolder={goToFolder} isRecentDocumentsView={isRecentDocumentsView} />
                );
            }}>
        </FlatList>

        <FileContextMenu
            visible={menuVisible}
            position={menuPosition}
            flipped={menuFlipped}
            screenHeight={screenHeight}
            menuItems={menuItems}
            theme={theme}
            onDismiss={() => setMenuVisible(false)}
        />

        <ConfirmActionModal
            confirmAction={confirmAction}
            isArchivalView={isArchivalView}
            theme={theme}
            onCancel={() => setConfirmAction(null)}
            onConfirm={(action) => {
                setConfirmAction(null);
                const { type, fileId, fileName } = action;
                if (type === 'delete') {
                    deleteFileMutation.mutate(fileId, { onSuccess: () => showToast(`"${fileName}" moved to trash`, 'error') });
                } else if (type === 'delete-permanent') {
                    permanentDeleteMutation.mutate([fileId], { onSuccess: () => showToast(`"${fileName}" permanently deleted`, 'error') });
                } else if (isArchivalView) {
                    restoreArchivalFilesMutation.mutate([fileId], { onSuccess: () => showToast(`"${fileName}" restored from archival`) });
                } else {
                    restoreArchivedFilesMutation.mutate([fileId], { onSuccess: () => showToast(`"${fileName}" restored`) });
                }
            }}
        />

        <FolderPickerModal
            visible={isFolderPickerVisible}
            pickerMode={pickerMode}
            pickerPath={pickerPath}
            pickerFolders={pickerFolders}
            isPickerLoading={isPickerLoading}
            currentPickerFolderId={currentPickerFolderId}
            currentPickerFolderName={currentPickerFolderName}
            theme={theme}
            onClose={() => setFolderPickerVisible(false)}
            onNavigate={setPickerPath}
            onConfirm={(destId, destName) => {
                const file = selectedFile;
                const fileName = file?.name;
                const fileIds = file?.id ? [file.id] : [];
                if (!fileIds.length || !fileName || !user?.id) return;
                setFolderPickerVisible(false);
                if (pickerMode === 'copy') {
                    copyFileMutation.mutate(
                        { destinationFolderId: destId, loggedInUserId: user.id, sourceDLDocumentIds: fileIds },
                        {
                            onSuccess: () => showToast(`Copied "${fileName}" to ${destName}`),
                            onError: (error: any) =>
                                showToast(error?.response?.data?.message || error?.message || 'Failed to copy file', 'error'),
                        }
                    );
                } else {
                    moveFileMutation.mutate(
                        { destinationFolderId: destId, loggedInUserId: user.id, sourceDLDocumentIds: fileIds },
                        {
                            onSuccess: () => showToast(`Moved "${fileName}" to ${destName}`),
                            onError: (error: any) =>
                                showToast(error?.response?.data?.message || error?.message || 'Failed to move file', 'error'),
                        }
                    );
                }
            }}
        />

        <RenameModal
            visible={isRenameModalVisible}
            initialName={renameName}
            isPending={renameFileMutation.isPending}
            theme={theme}
            onClose={() => setRenameModalVisible(false)}
            onRename={(newName) => {
                const fileId = selectedFile?.id;
                if (!fileId || !newName.trim() || !user?.id) return;
                renameFileMutation.mutate(
                    { id: fileId, name: newName.trim(), updatedBy: `${user?.id}` },
                    {
                        onSuccess: () => {
                            setRenameModalVisible(false);
                            showToast(`Renamed to "${newName.trim()}"`);
                        },
                        onError: (error: any) =>
                            showToast(error?.response?.data?.message || 'Failed to rename', 'error'),
                    }
                );
            }}
        />

        <FileLogsModal
            visible={logsModalVisible}
            logs={fileLogs}
            isLoading={isLogsLoading}
            fileTitle={selectedFile?.title}
            theme={theme}
            onClose={() => setLogsModalVisible(false)}
        />

        <TrashFab
            visible={isTrashView && !!files && files.length > 0}
            files={files ?? []}
            theme={theme}
            onRestoreAll={(fileIds) => {
                restoreArchivedFilesMutation.mutate(fileIds, {
                    onSuccess: () => showToast(`Restored ${fileIds.length} file(s)`),
                    onError: (error: any) => showToast(error?.response?.data?.message || 'Failed to restore files', 'error'),
                });
            }}
            onEmptyTrash={(fileIds) => {
                permanentDeleteMutation.mutate(fileIds, {
                    onSuccess: () => showToast(`Permanently deleted ${fileIds.length} file(s)`),
                    onError: (error: any) => showToast(error?.response?.data?.message || 'Failed to delete files', 'error'),
                });
            }}
        />

        <AnimatedToast
            message={toastMessage}
            type={toastType}
            theme={theme}
            onFinish={() => setToastMessage('')}
        />
    </>


    function updateFavourite() {
        setMenuVisible(false);
        const fileId = selectedFile?.id;
        const fileName = selectedFile?.name;
        if (!fileId || !fileName) return;
        const newValue = !selectedFile?.favourite;
        favouriteFileMutation.mutate(
            { fileId, value: newValue },
            {
                onSuccess: () => showToast(newValue ? `"${fileName}" added to favourites` : `"${fileName}" removed from favourites`),
                onError: (error: any) => showToast(error?.response?.data?.message || 'Failed to update favourite', 'error'),
            }
        );
    }
}
