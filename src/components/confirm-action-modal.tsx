import { ThemeContextType } from "@/context/theme-provider";
import { Modal, Pressable, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

type ConfirmAction = { type: 'delete' | 'restore' | 'delete-permanent'; fileId: number; fileName: string };

type ConfirmActionModalProps = {
    confirmAction: ConfirmAction | null;
    isArchivalView: boolean;
    theme: ThemeContextType;
    onCancel: () => void;
    onConfirm: (action: ConfirmAction) => void;
};

export function ConfirmActionModal({ confirmAction, isArchivalView, theme, onCancel, onConfirm }: ConfirmActionModalProps) {
    const action = confirmAction;
    return (
        <Modal
            visible={!!action}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onCancel}
        >
            <Pressable
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000060' }}
                onPress={onCancel}
            >
                <Pressable onPress={() => { }}>
                    <ThemedView style={{ width: 300, borderRadius: 16, padding: 24, gap: 20 }}>
                        <ThemedText type="mediumBold" style={{ textAlign: 'center' }}>
                            {action?.type === 'delete' ? 'Delete' : action?.type === 'delete-permanent' ? 'Delete Permanently' : 'Restore'}
                        </ThemedText>

                        <ThemedText type="small" style={{ textAlign: 'center', color: theme.theme.text + 'CC', lineHeight: 20 }}>
                            {action?.type === 'delete-permanent'
                                ? `This will permanently delete "${action?.fileName}". This action cannot be undone.`
                                : `Are you sure you want to ${action?.type === 'delete' ? 'delete' : 'restore'} "${action?.fileName}"?`
                            }
                        </ThemedText>

                        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
                            <Pressable
                                onPress={onCancel}
                                style={{
                                    flex: 1,
                                    paddingVertical: 11,
                                    borderRadius: 0,
                                    borderWidth: 1,
                                    borderColor: theme.theme.text + '20',
                                    alignItems: 'center',
                                }}
                            >
                                <ThemedText type="medium" style={{ color: theme.theme.text + '99' }}>Cancel</ThemedText>
                            </Pressable>

                            <Pressable
                                onPress={() => action && onConfirm(action)}
                                style={{
                                    flex: 1,
                                    paddingVertical: 11,
                                    borderRadius: 0,
                                    backgroundColor: action?.type === 'delete-permanent' || action?.type === 'delete' ? '#e74c3c' : theme.theme.primary,
                                    alignItems: 'center',
                                }}
                            >
                                <ThemedText type="mediumBold" style={{ color: 'white' }}>
                                    {action?.type === 'delete-permanent' ? 'Delete' : action?.type === 'delete' ? 'Delete' : 'Restore'}
                                </ThemedText>
                            </Pressable>
                        </View>
                    </ThemedView>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
