import { useTheme } from '@/context/theme-provider';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { UploadModal } from './upload-modal';
import { FolderUploadModal } from './folder-upload-modal';

type UploadActionProps = {
    currentFolderId: number | null;
    onCreateFolder: () => void;
};

export function UploadAction({ currentFolderId, onCreateFolder }: UploadActionProps) {
    const theme = useTheme();
    const [showMenu, setShowMenu] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showFolderUploadModal, setShowFolderUploadModal] = useState(false);

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
                        <Pressable
                            onPress={() => {
                                setShowMenu(false);
                                onCreateFolder();
                            }}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8 }}
                        >
                            <Ionicons name="folder-open-outline" size={18} color={theme.theme.text} />
                            <ThemedText type="small">Create Folder</ThemedText>
                        </Pressable>
                        <View style={{ height: 1, backgroundColor: theme.theme.text + '10', marginHorizontal: 4 }} />
                        <Pressable
                            onPress={() => {
                                setShowMenu(false);
                                setShowUploadModal(true);
                            }}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8 }}
                        >
                            <Ionicons name="cloud-upload-outline" size={18} color={theme.theme.text} />
                            <ThemedText type="small">Upload File</ThemedText>
                        </Pressable>
                        {Platform.OS === 'android' && (
                            <>
                                <View style={{ height: 1, backgroundColor: theme.theme.text + '10', marginHorizontal: 4 }} />
                                <Pressable
                                    onPress={() => {
                                        setShowMenu(false);
                                        setShowFolderUploadModal(true);
                                    }}
                                    style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8 }}
                                >
                                    <Ionicons name="folder-outline" size={18} color={theme.theme.text} />
                                    <ThemedText type="small">Upload Folder</ThemedText>
                                </Pressable>
                            </>
                        )}
                    </ThemedView>
                )}
                <Pressable
                    onPress={() => setShowMenu((prev) => !prev)}
                    style={{
                        padding: 12,
                        borderRadius: 50,
                        backgroundColor: theme.theme.primary,
                        elevation: 8,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 6,
                    }}
                >
                    <Ionicons name="add-outline" size={30} color="white" />
                </Pressable>
            </View>

            <UploadModal
                visible={showUploadModal}
                currentFolderId={currentFolderId}
                onClose={() => setShowUploadModal(false)}
            />

            <FolderUploadModal
                visible={showFolderUploadModal}
                currentFolderId={currentFolderId}
                onClose={() => setShowFolderUploadModal(false)}
            />
        </>
    );
}
