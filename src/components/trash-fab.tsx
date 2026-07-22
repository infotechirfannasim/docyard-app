import { ThemeContextType } from "@/context/theme-provider";
import { FileDto } from "@/types/api/file-dto";
import { Ionicons } from '@expo/vector-icons';
import { useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

type TrashFabProps = {
    visible: boolean;
    files: FileDto[];
    theme: ThemeContextType;
    onRestoreAll: (fileIds: number[]) => void;
    onEmptyTrash: (fileIds: number[]) => void;
};

export function TrashFab({ visible, files, theme, onRestoreAll, onEmptyTrash }: TrashFabProps) {
    const [isMenuVisible, setMenuVisible] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'restore-all' | 'empty-trash' | null>(null);

    if (!visible) return null;

    const allFileIds = files.map((f) => f.id).filter((id): id is number => !!id);
    const fileCount = files.length;

    return (
        <>
            {isMenuVisible && (
                <Pressable
                    style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 999 }}
                    onPress={() => setMenuVisible(false)}
                />
            )}
            <View style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 1000 }}>
                {isMenuVisible && (
                    <ThemedView
                        style={{
                            position: 'absolute',
                            bottom: 60,
                            right: 0,
                            minWidth: 180,
                            padding: 6,
                            gap: 2,
                            elevation: 8,
                        }}
                    >
                        <Pressable
                            onPress={() => {
                                setMenuVisible(false);
                                setConfirmAction('restore-all');
                            }}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8 }}
                        >
                            <Ionicons name="refresh-outline" size={18} color={theme.theme.text} />
                            <ThemedText type="small">Restore All</ThemedText>
                        </Pressable>

                        <View style={{ height: 1, backgroundColor: theme.theme.text + '10', marginHorizontal: 4 }} />

                        <Pressable
                            onPress={() => {
                                setMenuVisible(false);
                                setConfirmAction('empty-trash');
                            }}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8 }}
                        >
                            <Ionicons name="trash-outline" size={18} color="#e74c3c" />
                            <ThemedText type="small" style={{ color: '#e74c3c' }}>Empty Trash</ThemedText>
                        </Pressable>
                    </ThemedView>
                )}
                <Pressable
                    onPress={() => setMenuVisible((prev) => !prev)}
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
                    <Ionicons name="ellipsis-horizontal" size={24} color="white" />
                </Pressable>
            </View>

            <Modal
                visible={!!confirmAction}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setConfirmAction(null)}
            >
                <Pressable
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000060' }}
                    onPress={() => setConfirmAction(null)}
                >
                    <Pressable onPress={() => {}}>
                        <ThemedView style={{ width: 300, borderRadius: 16, padding: 24, gap: 20 }}>
                            <ThemedText type="mediumBold" style={{ textAlign: 'center' }}>
                                {confirmAction === 'restore-all' ? 'Restore All' : 'Empty Trash'}
                            </ThemedText>

                            <ThemedText type="small" style={{ textAlign: 'center', color: theme.theme.text + 'CC', lineHeight: 20 }}>
                                {confirmAction === 'restore-all'
                                    ? `Restore all ${fileCount} file(s) from trash?`
                                    : `Permanently delete all ${fileCount} file(s)? This cannot be undone.`
                                }
                            </ThemedText>

                            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
                                <Pressable
                                    onPress={() => setConfirmAction(null)}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 11,
                                        borderRadius: 8,
                                        borderWidth: 1,
                                        borderColor: theme.theme.text + '20',
                                        alignItems: 'center',
                                    }}
                                >
                                    <ThemedText type="medium" style={{ color: theme.theme.text + '99' }}>Cancel</ThemedText>
                                </Pressable>

                                <Pressable
                                    onPress={() => {
                                        const action = confirmAction;
                                        setConfirmAction(null);
                                        if (action === 'restore-all' && allFileIds.length) {
                                            onRestoreAll(allFileIds);
                                        } else if (action === 'empty-trash' && allFileIds.length) {
                                            onEmptyTrash(allFileIds);
                                        }
                                    }}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 11,
                                        borderRadius: 8,
                                        backgroundColor: confirmAction === 'empty-trash' ? '#e74c3c' : theme.theme.primary,
                                        alignItems: 'center',
                                    }}
                                >
                                    <ThemedText type="mediumBold" style={{ color: 'white' }}>
                                        {confirmAction === 'restore-all' ? 'Restore' : 'Delete'}
                                    </ThemedText>
                                </Pressable>
                            </View>
                        </ThemedView>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}
