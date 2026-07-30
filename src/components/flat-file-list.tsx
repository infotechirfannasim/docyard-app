import { downloadFile, fetchFiles } from '@/api/endpoints/files';
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-provider";
import { useToast } from '@/context/toast-context';
import { useArchivalRestoreFiles, useArchivedRestoreFiles, useCheckInFile, useCheckOutFile, useCopyFile, useDeleteFile, useFileLogs, useMoveFile, usePermanentDeleteFile, useRenameFile, useUpdateArchivalFile, useUpdateFavouriteFile } from "@/hooks/queries/use-files";

import { FileDto } from "@/types/api/file-dto";
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useFocusEffect } from "expo-router";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Dimensions, FlatList, View } from "react-native";
import { ConfirmActionModal } from "./confirm-action-modal";
import { FileAutomateModal } from "./file-automate-modal";
import { FileContextMenu } from "./file-context-menu";
import { FileListItemGrid, FileListItemList } from "./file-list-item-component";
import { FileLogsModal } from "./file-logs-modal";
import { FilePropertiesModal } from "./file-properties-modal";
import { FileShareModal } from "./file-share-modal";
import { FileVersionUploadModal } from "./file-version-upload-modal";
import { FileVersionsModal } from "./file-versions-modal";
import { FileWorkflowModal } from "./file-workflow-modal";
import { FolderPickerModal } from "./folder-picker-modal";
import { ManageAccessModal } from "./manage-access-modal";
import { ModelDropDownItemProps } from "./modal-dropdown-item";
import { RenameModal } from "./rename-modal";
import { TrashFab } from "./trash-fab";


type ViewType = 'default' | 'favourite' | 'recent' | 'trash' | 'shared-by-me' | 'shared-with-me' | 'archival' | 'document-library';

export type SelectionInfo = {
    active: boolean;
    selectedCount: number;
    totalCount: number;
    isAllSelected: boolean;
};

export type FlatFileListHandle = {
    toggleSelectionMode: () => void;
    selectAll: () => void;
    deselectAll: () => void;
    toggleSelectAll: () => void;
    batchCopy: () => void;
    batchMove: () => void;
    batchDownload: () => void;
    batchDelete: () => void;
    batchArchive: () => void;
    batchUnfavourite: () => void;
    batchUndoArchive: () => void;
    batchRestoreTrash: () => void;
    batchDeletePermanent: () => void;
};

export const FlatFileList = forwardRef<FlatFileListHandle, {
    files?: FileDto[] | undefined;
    isGridView: boolean;
    filesOnly?: boolean;
    goToFolder: (file: FileDto) => void;
    viewType?: ViewType;
    currentFolderId?: number | null;
    onSelectionModeChange?: (active: boolean) => void;
    onSelectionStateChange?: (info: SelectionInfo) => void;
}>(function FlatFileList({ files, isGridView, filesOnly, goToFolder, viewType = 'default', currentFolderId, onSelectionModeChange, onSelectionStateChange }, ref) {
    const isTrashView = viewType === 'trash';
    const isRecentDocumentsView = viewType === 'recent';
    const isFavouriteView = viewType === 'favourite';
    const isSharedByMeView = viewType === 'shared-by-me';
    const isSharedWithMeView = viewType === 'shared-with-me';
    const isArchivalView = viewType === 'archival';
    const isDocumentLibraryView = viewType === 'document-library';
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
    const checkInMutation = useCheckInFile();
    const checkOutMutation = useCheckOutFile();
    const { username, user } = useAuth();
    const screenHeight = Dimensions.get("screen").height;
    const screenWidth = Dimensions.get("screen").width;

    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const toggleSelectItem = (id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const exitSelectionMode = () => {
        setIsSelectionMode(false);
        setSelectedIds(new Set());
    };

    const allIds = (files ?? []).map(f => f.id).filter((id): id is number => id != null);
    const isAllSelected = allIds.length > 0 && allIds.every(id => selectedIds.has(id));

    const selectAll = () => {
        setSelectedIds(new Set(allIds));
    };

    const deselectAll = () => {
        setSelectedIds(new Set());
    };

    const toggleSelectAll = () => {
        if (isAllSelected) {
            deselectAll();
        } else {
            selectAll();
        }
    };

    const batchCopy = () => {
        if (!selectedIds.size) return;
        setPickerMode('copy');
        setPickerPath([{ id: null, name: 'Document Library' }]);
        setFolderPickerVisible(true);
    };

    const batchMove = () => {
        if (!selectedIds.size) return;
        setPickerMode('move');
        setPickerPath([{ id: null, name: 'Document Library' }]);
        setFolderPickerVisible(true);
    };

    const batchArchive = async () => {
        const ids = Array.from(selectedIds);
        if (!ids.length) return;
        try {
            await Promise.all(ids.map(id => archivalFileMutation.mutateAsync(id)));
            showToast(`${ids.length} item(s) archived`);
            exitSelectionMode();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Failed to archive items', 'error');
        }
    };

    const batchDelete = async () => {
        const ids = Array.from(selectedIds);
        if (!ids.length) return;
        try {
            await Promise.all(ids.map(id => deleteFileMutation.mutateAsync(id)));
            showToast(`${ids.length} item(s) moved to trash`, 'error');
            exitSelectionMode();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Failed to delete items', 'error');
        }
    };

    const batchDownload = async () => {
        const selectedFilesList = (files ?? []).filter(f => f.id != null && selectedIds.has(f.id!));
        if (!selectedFilesList.length || !user?.id) return;
        try {
            let directoryUri: string | undefined;
            for (const file of selectedFilesList) {
                const result = await downloadFile(
                    file.id!,
                    file.folder ? `${file.name}.zip` : file.name,
                    user.id,
                    getMimeType(file.folder ? `${file.name}.zip` : file.name),
                    file.folder ? "folder" : "file",
                    directoryUri
                );
                if (result.directoryUri) directoryUri = result.directoryUri;
            }
            showToast(`${selectedFilesList.length} item(s) downloaded successfully`);
            exitSelectionMode();
        } catch (err) {
            console.error("Batch download failed:", err);
            showToast("Batch download failed", 'error');
        }
    };
    const batchUnfavourite = async () => {
        const ids = Array.from(selectedIds);
        if (!ids.length) return;
        try {
            await Promise.all(ids.map(id => favouriteFileMutation.mutateAsync({ fileId: id, value: false })));
            showToast(`${ids.length} item(s) removed from favourites`);
            exitSelectionMode();
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Failed to update favourites', 'error');
        }
    };

    const batchUndoArchive = () => {
        const ids = Array.from(selectedIds);
        if (!ids.length) return;
        restoreArchivalFilesMutation.mutate(ids, {
            onSuccess: () => {
                showToast(`${ids.length} item(s) restored from archival`);
                exitSelectionMode();
            },
            onError: (error: any) => {
                showToast(error?.response?.data?.message || 'Failed to restore items', 'error');
            }
        });
    };

    const batchRestoreTrash = () => {
        const ids = Array.from(selectedIds);
        if (!ids.length) return;
        restoreArchivedFilesMutation.mutate(ids, {
            onSuccess: () => {
                showToast(`${ids.length} item(s) restored`);
                exitSelectionMode();
            },
            onError: (error: any) => {
                showToast(error?.response?.data?.message || 'Failed to restore items', 'error');
            }
        });
    };

    const batchDeletePermanent = () => {
        const ids = Array.from(selectedIds);
        if (!ids.length) return;
        permanentDeleteMutation.mutate(ids, {
            onSuccess: () => {
                showToast(`${ids.length} item(s) permanently deleted`, 'error');
                exitSelectionMode();
            },
            onError: (error: any) => {
                showToast(error?.response?.data?.message || 'Failed to delete items', 'error');
            }
        });
    };

    useImperativeHandle(ref, () => ({
        toggleSelectionMode: () => {
            if (isSelectionMode) {
                exitSelectionMode();
            } else {
                const firstId = files && files.length > 0 && files[0]?.id != null ? files[0].id : null;
                setSelectedIds(new Set(firstId != null ? [firstId] : []));
                setIsSelectionMode(true);
            }
        },
        selectAll,
        deselectAll,
        toggleSelectAll,
        batchCopy,
        batchMove,
        batchDownload,
        batchDelete,
        batchArchive,
        batchUnfavourite,
        batchUndoArchive,
        batchRestoreTrash,
        batchDeletePermanent,
    }), [isSelectionMode, selectedIds, allIds, isAllSelected, files, user?.id]);

    const isNavigating = useRef(false);

    const guardedGoToFolder = useCallback((file: FileDto) => {
        if (isNavigating.current) return;
        isNavigating.current = true;
        goToFolder(file);
    }, [goToFolder]);

    useFocusEffect(useCallback(() => {
        // Reset the guard whenever this screen comes back into focus
        isNavigating.current = false;
        setSelectedIds(new Set());
        setIsSelectionMode(false);
    }, []));

    useEffect(() => {
        onSelectionModeChange?.(isSelectionMode);
        onSelectionStateChange?.({
            active: isSelectionMode,
            selectedCount: selectedIds.size,
            totalCount: allIds.length,
            isAllSelected,
        });
    }, [isSelectionMode, selectedIds, allIds.length, isAllSelected]);

    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [selectedFile, setSelectedFile] = useState<FileDto | null>(null);
    const [menuFlipped, setMenuFlipped] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'restore' | 'delete-permanent'; fileId: number; fileName: string } | null>(null);
    const { setToast} = useToast();
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
    const [propertiesModalVisible, setPropertiesModalVisible] = useState(false);
    const [versionsModalFileId, setVersionsModalFileId] = useState<number | null>(null);
    const [versionsModalFileName, setVersionsModalFileName] = useState('');
    const [automateModalVisible, setAutomateModalVisible] = useState(false);
    const [workflowModalFileId, setWorkflowModalFileId] = useState<number | null>(null);
    const [uploadVersionModalVisible, setUploadVersionModalVisible] = useState(false);
    const [shareModalVisible, setShareModalVisible] = useState(false);
    const [manageAccessModalVisible, setManageAccessModalVisible] = useState(false);

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
        setToast(message, type);
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

    function getMimeType(fileName: string): string {
        const ext = fileName.split(".").pop()?.toLowerCase();
        const map: Record<string, string> = {
            pdf: "application/pdf",
            doc: "application/msword",
            docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            xls: "application/vnd.ms-excel",
            xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            txt: "text/plain",
            mp4: "video/mp4",
        };
        return map[ext ?? ""] ?? "application/octet-stream";
    }


    const menuItems: ModelDropDownItemProps[] = [
        {
            itemKey: "open-location",
            iconName: "folder-open-outline",
            iconImage: require('../../assets/images/icons/open-file-location.png'),
            text: (isRecentDocumentsView || isFavouriteView) && !selectedFile?.folder ? "Open file location" : "Open",
            visible: isRecentDocumentsView,
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
            itemKey: "share",
            iconName: "share-outline",
            iconImage: require('../../assets/images/icons/share.png'),
            text: "Share",
            visible: isFavouriteView || isRecentDocumentsView || isDocumentLibraryView || isSharedByMeView || isArchivalView,
            theme: theme,
            onPress: () => {
                setMenuVisible(false);
                setShareModalVisible(true);
            },
        },
        {
            itemKey: "manage-access",
            iconName: "lock-closed-outline",
            iconImage: require('../../assets/images/icons/manage-access.png'),
            text: "Manage Access",
            visible: (isDocumentLibraryView || isSharedByMeView || isFavouriteView) && ( selectedFile?.shared!),
            theme: theme,
            onPress: () => {
                setMenuVisible(false);
                setManageAccessModalVisible(true);
            },
        },
        {
            itemKey: "copy",
            iconName: "copy-outline",
            iconImage: require('../../assets/images/icons/copy.png'),
            text: "Copy",
            visible: isDocumentLibraryView,
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
            iconImage: require('../../assets/images/icons/move.png'),
            text: "Move",
            visible: isDocumentLibraryView,
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
            itemKey: "download",
            iconName: "download-outline",
            iconImage: require('../../assets/images/icons/download.png'),
            text: "Download",
            visible: isRecentDocumentsView || isDocumentLibraryView || isArchivalView || isFavouriteView || isSharedByMeView || isSharedWithMeView,
            theme: theme,
            onPress: async () => {
                setMenuVisible(false);
                try {
                    const { fileUri } = await downloadFile(
                        selectedFile?.id!,
                        selectedFile?.folder ?  `${selectedFile?.name!}.zip` : selectedFile?.name!,
                        user?.id!,
                        getMimeType(selectedFile?.folder ? `${selectedFile?.name!}.zip` : selectedFile?.name!), // real mime type, not the token
                        selectedFile?.folder ? "folder" : "file"
                    );
                    showToast(`"${selectedFile?.name}" downloaded successfully`);
                } catch (err) {
                    console.error("Download failed:", err);
                    showToast("Download failed", 'error');
                }
            },
        },
        {
            itemKey: "favourite",
            iconName: selectedFile?.favourite ? "star" : "star-outline",
            iconImage: selectedFile?.favourite ? require('../../assets/images/icons/un-favourite.png') : require('../../assets/images/icons/favourite.png'),
            text: selectedFile?.favourite ? "Unfavourite" : "Favourite",
            visible: isFavouriteView || isDocumentLibraryView || isArchivalView,
            theme: theme,
            onPress: updateFavourite,
        },


        {
            itemKey: "rename",
            iconName: "create-outline",
            iconImage: require('../../assets/images/icons/edit.png'),
            text: "Rename",
            visible: isDocumentLibraryView || isRecentDocumentsView,
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
            iconImage: require('../../assets/images/icons/archive.png'),
            text: "Archive",
            visible: isDocumentLibraryView,
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
            iconImage: require('../../assets/images/icons/log.png'),
            text: "View Logs",
            visible: (isDocumentLibraryView || isSharedByMeView || isSharedWithMeView),
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
            itemKey: "Check In",
            iconName: selectedFile?.checkIn ? "lock-open-outline" : "checkmark-circle-outline",
            iconImage: selectedFile?.checkIn ? require('../../assets/images/icons/check-out.png') : require('../../assets/images/icons/check-in.png'),
            text: selectedFile?.checkIn ? "Check Out" : "Check In",
            visible: (isDocumentLibraryView || isSharedByMeView) && !selectedFile?.folder,
            theme: theme,
            onPress: () => {
                setMenuVisible(false);
                const fileId = selectedFile?.id;
                const userId = user?.id;
                if (!fileId || !userId) return;
                const updateCheckIn = (newVal: boolean) => {
                    setSelectedFile(prev => prev ? { ...prev, checkIn: newVal } : prev);
                    queryClient.setQueriesData({ queryKey: refreshQueryKey }, (old: any) => {
                        if (!old) return old;
                        return (Array.isArray(old) ? old : []).map((f: FileDto) =>
                            f.id === fileId ? { ...f, checkIn: newVal } : f
                        );
                    });
                };
                const fileName = selectedFile?.name || '';
                if (selectedFile?.checkIn) {
                    checkOutMutation.mutate({ fileId, userId }, {
                        onSuccess: () => { updateCheckIn(false); showToast(`"${fileName}" checked out`); },
                        onError: (error: any) => showToast(error?.response?.data?.message || 'Failed to check out', 'error'),
                    });
                } else {
                    checkInMutation.mutate({ fileId, userId }, {
                        onSuccess: () => { updateCheckIn(true); showToast(`"${fileName}" checked in`); },
                        onError: (error: any) => showToast(error?.response?.data?.message || 'Failed to check in', 'error'),
                    });
                }
            },
        },
        {
            itemKey: "upload-version",
            iconName: "download-outline",
            iconImage: require('../../assets/images/icons/upload.png'),
            text: "Upload Version",
            visible: (isDocumentLibraryView) && !selectedFile?.folder && selectedFile?.checkIn!,
            theme: theme,
            onPress: () => {
                setMenuVisible(false);
                setUploadVersionModalVisible(true);
            },
        },
        {
            itemKey: "versions",
            iconName: "layers-outline",
            iconImage: require('../../assets/images/icons/version.png'),
            text: "Versions",
            visible: (isDocumentLibraryView || isSharedByMeView || isSharedWithMeView) && !selectedFile?.folder,
            theme: theme,
            onPress: () => {
                setMenuVisible(false);
                setVersionsModalFileId(selectedFile?.id ?? null);
                setVersionsModalFileName(selectedFile?.name ?? '');
            },
        },
        {
            itemKey: "delete",
            iconName: "trash-outline",
            iconImage: require('../../assets/images/icons/delete.png'),
            text: "Delete",
            visible: isRecentDocumentsView || isDocumentLibraryView || isArchivalView,
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
            iconImage: require('../../assets/images/icons/delete.png'),
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
            iconImage: isArchivalView ? require('../../assets/images/icons/undo-archive.png') : require('../../assets/images/icons/restore.png'),
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
        },


        {
            itemKey: "Automate",
            iconName: "settings-outline",
            iconImage: require('../../assets/images/icons/automation.png'),
            text: "Automate",
            visible: (isDocumentLibraryView || isFavouriteView || isSharedByMeView) && !selectedFile?.folder,
            theme: theme,
            onPress: () => {
                setMenuVisible(false);
                setAutomateModalVisible(true);
            },
        },
        {
            itemKey: "Workflow",
            iconName: "git-branch-outline",
            iconImage: require('../../assets/images/icons/workflow.png'),
            text: "Workflow",
            visible: (isDocumentLibraryView || isFavouriteView || isSharedByMeView) && !selectedFile?.folder,
            theme: theme,
            onPress: () => {
                setMenuVisible(false);
                setWorkflowModalFileId(selectedFile?.id ?? null);


            },
        },
        {
            itemKey: "properties",
            iconName: "information-circle-outline",
            iconImage: require('../../assets/images/icons/view-details.png'),
            text: "View Details",
            visible: !isTrashView,
            theme: theme,
            onPress: () => {
                setMenuVisible(false);
                setPropertiesModalVisible(true);
            },
        },



    ]
    return <>

        <FlatList data={files}
            style={{ paddingTop: 2 }}
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
                const isSelected = selectedIds.has(file.id!);
                return !isGridView ? (
                    <FileListItemList
                        file={file} index={index} month={month} day={day} year={year} theme={theme}
                        onLongPressMenu={(position) => openMenuFor(item, position)}
                        screenHeight={screenHeight} screenWidth={screenWidth}
                        goToFolder={guardedGoToFolder} isRecentDocumentsView={isRecentDocumentsView}
                        isSelectionMode={isSelectionMode}
                        selected={isSelected}
                        onSelect={() => toggleSelectItem(file.id!)}
                    />
                ) : (
                    <FileListItemGrid
                        file={file} index={index} month={month} day={day} year={year} theme={theme}
                        onLongPressMenu={(position) => openMenuFor(item, position)}
                        screenHeight={screenHeight} screenWidth={screenWidth}
                        goToFolder={guardedGoToFolder} isRecentDocumentsView={isRecentDocumentsView}
                        isSelectionMode={isSelectionMode}
                        selected={isSelected}
                        onSelect={() => toggleSelectItem(file.id!)}
                    />
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
                const isBatch = isSelectionMode && selectedIds.size > 0;
                const fileIds = isBatch ? Array.from(selectedIds) : (selectedFile?.id ? [selectedFile.id] : []);
                const count = fileIds.length;
                if (!count || !user?.id) return;

                const currentId = currentFolderId || 0;
                if (destId === currentId) {
                    showToast(`Already in ${destName}`, 'error');
                    return;
                }

                setFolderPickerVisible(false);
                if (pickerMode === 'copy') {
                    copyFileMutation.mutate(
                        { destinationFolderId: destId, loggedInUserId: user.id, sourceDLDocumentIds: fileIds },
                        {
                            onSuccess: () => {
                                showToast(isBatch ? `Copied ${count} items to ${destName}` : `Copied "${selectedFile?.name}" to ${destName}`);
                                if (isBatch) exitSelectionMode();
                            },
                            onError: (error: any) =>
                                showToast(error?.response?.data?.message || error?.message || 'Failed to copy file', 'error'),
                        }
                    );
                } else {
                    moveFileMutation.mutate(
                        { destinationFolderId: destId, loggedInUserId: user.id, sourceDLDocumentIds: fileIds },
                        {
                            onSuccess: () => {
                                showToast(isBatch ? `Moved ${count} items to ${destName}` : `Moved "${selectedFile?.name}" to ${destName}`);
                                if (isBatch) exitSelectionMode();
                            },
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

        <FilePropertiesModal
            visible={propertiesModalVisible}
            file={selectedFile}
            userId={user?.id}
            theme={theme}
            onClose={() => setPropertiesModalVisible(false)}
        />

        <FileVersionsModal
            visible={!!versionsModalFileId}
            fileId={versionsModalFileId ?? 0}
            fileName={versionsModalFileName}
            userId={user?.id}
            theme={theme}
            onClose={() => setVersionsModalFileId(null)}
        />

        <FileAutomateModal
            visible={automateModalVisible}
            file={selectedFile}
            theme={theme}
            showToast={showToast}
            onClose={() => setAutomateModalVisible(false)}
        />

        <FileWorkflowModal
            visible={!!workflowModalFileId}
            fileId={workflowModalFileId ?? 0}
            theme={theme}
            onClose={() => setWorkflowModalFileId(null)}
        />

        <FileVersionUploadModal
            visible={uploadVersionModalVisible}
            fileId={selectedFile?.id ?? 0}
            folderId={selectedFile?.parentId ?? 0}
            fileName={selectedFile?.name ?? ''}
            userId={user?.id ?? 0}
            showToast={showToast}
            onClose={() => setUploadVersionModalVisible(false)}
        />

        <FileShareModal
            visible={shareModalVisible}
            fileId={selectedFile?.id ?? 0}
            fileName={selectedFile?.name ?? ''}
            versionGUId={selectedFile?.versionGUId}
            isFolder={selectedFile?.folder ?? false}
            theme={theme}
            showToast={showToast}
            onClose={() => setShareModalVisible(false)}
            onManageAccess={() => {
                setShareModalVisible(false);
                setManageAccessModalVisible(true);
            }}
        />

        <ManageAccessModal
            visible={manageAccessModalVisible}
            fileId={selectedFile?.id ?? 0}
            fileName={selectedFile?.name ?? ''}
            theme={theme}
            showToast={showToast}
            onClose={() => setManageAccessModalVisible(false)}
        />

        <TrashFab
            visible={isTrashView && !!files && files.length > 0 && !isSelectionMode}
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
});
