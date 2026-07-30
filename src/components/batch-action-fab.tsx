import { useTheme } from '@/context/theme-provider';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export type ViewType = 'default' | 'favourite' | 'recent' | 'trash' | 'shared-by-me' | 'shared-with-me' | 'archival' | 'document-library';

type BatchActionFabProps = {
    selectedCount?: number;
    viewType?: ViewType;
    onCopy?: () => void;
    onMove?: () => void;
    onDownload?: () => void;
    onDelete?: () => void;
    onArchive?: () => void;
    onUnfavourite?: () => void;
    onUndoArchive?: () => void;
    onRestoreTrash?: () => void;
    onDeletePermanent?: () => void;
};

export function BatchActionFab({
    selectedCount = 0,
    viewType = 'document-library',
    onCopy,
    onMove,
    onDownload,
    onDelete,
    onArchive,
    onUnfavourite,
    onUndoArchive,
    onRestoreTrash,
    onDeletePermanent,
}: BatchActionFabProps) {
    const theme = useTheme();
    const [showMenu, setShowMenu] = useState(false);

    const isFavouriteView = viewType === 'favourite';
    const isArchivalView = viewType === 'archival';
    const isTrashView = viewType === 'trash';
    const isSharedView = viewType === 'shared-by-me' || viewType === 'shared-with-me';

    type MenuItem = {
        key: string;
        label: string;
        iconName: keyof typeof Ionicons.glyphMap;
        onPress?: () => void;
    };

    const items: MenuItem[] = [];

    if (isFavouriteView) {
        items.push(
            { key: 'download', label: 'Download', iconName: 'download-outline', onPress: onDownload },
            { key: 'unfavourite', label: 'Unfavourite', iconName: 'star-outline', onPress: onUnfavourite },
        );
    } else if (isArchivalView) {
        items.push(
            { key: 'download', label: 'Download', iconName: 'download-outline', onPress: onDownload },
            { key: 'delete', label: 'Delete', iconName: 'trash-outline', onPress: onDelete },
            { key: 'undo-archive', label: 'Undo Archive', iconName: 'arrow-undo-outline', onPress: onUndoArchive },
        );
    } else if (isSharedView) {
        items.push(
            { key: 'download', label: 'Download', iconName: 'download-outline', onPress: onDownload },
        );
    } else if (isTrashView) {
        items.push(
            { key: 'restore', label: 'Restore', iconName: 'refresh-outline', onPress: onRestoreTrash },
            { key: 'delete-permanent', label: 'Delete', iconName: 'trash-outline', onPress: onDeletePermanent },
        );
    } else {
        // Document Library / default
        items.push(
            { key: 'copy', label: 'Copy', iconName: 'copy-outline', onPress: onCopy },
            { key: 'move', label: 'Move', iconName: 'move-outline', onPress: onMove },
            { key: 'download', label: 'Download', iconName: 'download-outline', onPress: onDownload },
            { key: 'delete', label: 'Delete', iconName: 'trash-outline', onPress: onDelete },
            { key: 'archive', label: 'Archive', iconName: 'archive-outline', onPress: onArchive },
        );
    }

    return (
        <>
            {showMenu && (
                <Pressable
                    style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 999 }}
                    onPress={() => setShowMenu(false)}
                />
            )}
            <View style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 1000 }}>
                {showMenu && (
                    <ThemedView
                        style={{
                            position: 'absolute',
                            bottom: 60,
                            right: 0,
                            minWidth: 180,
                            padding: 6,
                            gap: 2,
                            elevation: 8,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.15,
                            shadowRadius: 6,
                        }}
                    >
                        {items.map((item, index) => (
                            <View key={item.key}>
                                {index > 0 && (
                                    <View style={{ height: 1, backgroundColor: theme.theme.text + '10', marginHorizontal: 4 }} />
                                )}
                                <Pressable
                                    onPress={() => {
                                        setShowMenu(false);
                                        item.onPress?.();
                                    }}
                                    style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 0 }}
                                >
                                    <Ionicons name={item.iconName} size={18} color={theme.theme.text} />
                                    <ThemedText type="small">{item.label}</ThemedText>
                                </Pressable>
                            </View>
                        ))}
                    </ThemedView>
                )}
                <Pressable
                    onPress={() => setShowMenu((prev) => !prev)}
                    style={{
                        padding: 12,
                        borderRadius: 12,
                        backgroundColor: theme.theme.primary,
                        elevation: 8,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 6,
                    }}
                >
                    <Ionicons name="ellipsis-vertical" size={30} color="white" />
                </Pressable>
            </View>
        </>
    );
}
