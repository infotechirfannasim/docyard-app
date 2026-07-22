import { ThemeContextType } from "@/context/theme-provider";
import { FileDto } from "@/types/api/file-dto";
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Modal, Pressable, ScrollView, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

type FolderPickerModalProps = {
    visible: boolean;
    pickerMode: 'copy' | 'move';
    pickerPath: { id: number | null; name: string }[];
    pickerFolders: FileDto[];
    isPickerLoading: boolean;
    currentPickerFolderId: number | null;
    currentPickerFolderName: string;
    theme: ThemeContextType;
    onClose: () => void;
    onNavigate: (path: { id: number | null; name: string }[]) => void;
    onConfirm: (destinationFolderId: number, destinationFolderName: string) => void;
};

export function FolderPickerModal({
    visible,
    pickerMode,
    pickerPath,
    pickerFolders,
    isPickerLoading,
    currentPickerFolderId,
    currentPickerFolderName,
    theme,
    onClose,
    onNavigate,
    onConfirm,
}: FolderPickerModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <Pressable
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000060' }}
                onPress={onClose}
            >
                <Pressable onPress={() => { }}>
                    <ThemedView style={{ width: 340, maxHeight: 460, borderRadius: 16, padding: 24, gap: 16 }}>
                        <ThemedText type="mediumBold" style={{ textAlign: 'center' }}>
                            {pickerMode === 'copy' ? 'Copy to...' : 'Move to...'}
                        </ThemedText>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                {pickerPath.map((item, index) => (
                                    <Pressable key={index} onPress={() => onNavigate(pickerPath.slice(0, index + 1))}>
                                        <ThemedText
                                            type={index === pickerPath.length - 1 ? 'mediumBold' : 'medium'}
                                            style={{ color: index === pickerPath.length - 1 ? theme.theme.text : theme.theme.text + '99' }}
                                        >
                                            {index > 0 && <ThemedText type="medium" style={{ color: theme.theme.text + '50' }}> {'>'} </ThemedText>}
                                            {item.name}
                                        </ThemedText>
                                    </Pressable>
                                ))}
                            </View>
                        </ScrollView>

                        <View style={{ height: 1, backgroundColor: theme.theme.text + '15' }} />

                        {isPickerLoading ? (
                            <ActivityIndicator size="small" style={{ padding: 20 }} />
                        ) : pickerFolders.length === 0 ? (
                            <ThemedText type="small" style={{ textAlign: 'center', color: theme.theme.text + '80', padding: 20 }}>
                                No subfolders
                            </ThemedText>
                        ) : (
                            <ScrollView style={{ maxHeight: 220 }}>
                                {pickerFolders.map((folder) => (
                                    <Pressable
                                        key={folder.id}
                                        onPress={() =>
                                            onNavigate([...pickerPath, { id: folder.id ?? null, name: folder.name }])
                                        }
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            paddingVertical: 12,
                                            paddingHorizontal: 8,
                                            borderRadius: 8,
                                            gap: 10,
                                        }}
                                    >
                                        <Ionicons name="folder-outline" size={22} color={theme.theme.text + 'CC'} />
                                        <ThemedText type="small" style={{ flex: 1 }}>{folder.name}</ThemedText>
                                        <Ionicons name="chevron-forward" size={16} color={theme.theme.text + '50'} />
                                    </Pressable>
                                ))}
                            </ScrollView>
                        )}

                        <View style={{ height: 1, backgroundColor: theme.theme.text + '15' }} />

                        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
                            <Pressable
                                onPress={onClose}
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
                                onPress={() => onConfirm(currentPickerFolderId ?? 0, currentPickerFolderName)}
                                style={{
                                    flex: 1,
                                    paddingVertical: 11,
                                    borderRadius: 8,
                                    backgroundColor: theme.theme.primary,
                                    alignItems: 'center',
                                }}
                            >
                                <ThemedText type="mediumBold" style={{ color: 'white' }}>
                                    {pickerMode === 'copy' ? 'Copy here' : 'Move here'}
                                </ThemedText>
                            </Pressable>
                        </View>
                    </ThemedView>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
