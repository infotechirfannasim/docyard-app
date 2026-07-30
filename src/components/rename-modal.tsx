import ThemedTextInput from '@/components/themed-text-input';
import { ThemeContextType } from "@/context/theme-provider";
import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

type RenameModalProps = {
    visible: boolean;
    initialName: string;
    isPending: boolean;
    theme: ThemeContextType;
    onClose: () => void;
    onRename: (newName: string) => void;
};

export function RenameModal({ visible, initialName, isPending, theme, onClose, onRename }: RenameModalProps) {
    const [name, setName] = useState(initialName);

    useEffect(() => {
        if (visible) setName(initialName);
    }, [visible, initialName]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000060' }}
            >
                <Pressable
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}
                    onPress={onClose}
                >
                    <Pressable onPress={() => { }}>
                        <ThemedView style={{ width: 320, borderRadius: 16, padding: 28, gap: 24 }}>
                            <ThemedText type="mediumBold" style={{ textAlign: 'center' }}>
                                Rename
                            </ThemedText>

                            <ThemedTextInput
                                placeholder="New name"
                                value={name}
                                onChangeText={setName}
                                autoFocus
                                maxLength={254}
                                onSubmitEditing={() => name.trim() && onRename(name.trim())}
                                returnKeyType="done"
                                style={{ borderRadius: 0, padding: 14, fontSize: 15 }}
                            />

                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
                                <Pressable
                                    onPress={onClose}
                                    style={{ paddingVertical: 10, paddingHorizontal: 20, borderRadius: 0 }}
                                >
                                    <ThemedText type="medium" style={{ color: theme.theme.text + '99' }}>Cancel</ThemedText>
                                </Pressable>

                                <Pressable
                                    onPress={() => name.trim() && onRename(name.trim())}
                                    disabled={isPending || !name.trim()}
                                    style={{
                                        paddingVertical: 10,
                                        paddingHorizontal: 22,
                                        backgroundColor: isPending || !name.trim() ? theme.theme.text + '20' : theme.theme.primary,
                                        borderRadius: 0,
                                        minWidth: 72,
                                        alignItems: 'center',
                                    }}
                                >
                                    {isPending ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <ThemedText type="mediumBold" style={{ color: 'white' }}>Rename</ThemedText>
                                    )}
                                </Pressable>
                            </View>
                        </ThemedView>
                    </Pressable>
                </Pressable>
            </KeyboardAvoidingView>
        </Modal>
    );
}
