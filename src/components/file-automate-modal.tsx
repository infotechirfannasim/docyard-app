import { useProcessDefinitions, useStartAutomate } from "@/hooks/queries/use-files";
import { FileDto } from "@/types/api/file-dto";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemeContextType } from "@/context/theme-provider";

type FileAutomateModalProps = {
    visible: boolean;
    file: FileDto | null;
    theme: ThemeContextType;
    showToast: (message: string, type?: 'success' | 'error') => void;
    onClose: () => void;
};

export function FileAutomateModal({ visible, file, theme, showToast, onClose }: FileAutomateModalProps) {
    const { data: definitions, isLoading } = useProcessDefinitions(visible);
    const startAutomate = useStartAutomate();
    const [selectedKey, setSelectedKey] = useState<string | null>(null);

    const handleAutomate = () => {
        if (!selectedKey || !file?.id) return;
        startAutomate.mutate(
            { processKey: selectedKey, payload: file },
            {
                onSuccess: () => {
                    showToast(`"${file.name}" automated successfully`);
                    onClose();
                },
                onError: (error: any) => {
                    showToast(error?.response?.data?.message || 'Failed to automate', 'error');
                },
            }
        );
    };

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000060' }}>
                <Pressable style={{ position: 'absolute', inset: 0 }} onPress={onClose} />
                <View style={{ width: '85%', maxHeight: '70%', backgroundColor: theme.theme.background, borderRadius: 16, overflow: 'hidden' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: theme.theme.textSecondary + '30' }}>
                        <ThemedText type="mediumBold">Select Process</ThemedText>
                        <Pressable onPress={onClose}><Ionicons name="close-outline" size={22} color={theme.theme.textSecondary} /></Pressable>
                    </View>

                    {isLoading ? (
                        <View style={{ padding: 40, alignItems: 'center' }}><ActivityIndicator color={theme.theme.primary} /></View>
                    ) : !definitions?.length ? (
                        <View style={{ padding: 40, alignItems: 'center' }}><ThemedText type="extraSmall" style={{ color: theme.theme.textSecondary }}>No process definitions available</ThemedText></View>
                    ) : (
                        <ScrollView style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
                            {definitions.map((def) => (
                                <TouchableOpacity
                                    key={def.id}
                                    onPress={() => setSelectedKey(def.key)}
                                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: theme.theme.textSecondary + '15', gap: 10 }}
                                >
                                    <View style={{ width: 20, height: 20, borderRadius: 0, borderWidth: 2, borderColor: selectedKey === def.key ? theme.theme.primary : theme.theme.textSecondary + '40', alignItems: 'center', justifyContent: 'center' }}>
                                        {selectedKey === def.key && <View style={{ width: 10, height: 10, borderRadius: 0, backgroundColor: theme.theme.primary }} />}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <ThemedText type="small" style={{ color: theme.theme.text }}>{def.name}</ThemedText>
                                        {def.description && <ThemedText type="extraExtraSmall" style={{ color: theme.theme.textSecondary, marginTop: 2 }}>{def.description}</ThemedText>}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 0.5, borderTopColor: theme.theme.textSecondary + '20' }}>
                        <TouchableOpacity
                            onPress={handleAutomate}
                            disabled={!selectedKey || startAutomate.isPending}
                            style={{ backgroundColor: selectedKey ? theme.theme.primary : theme.theme.textSecondary + '40', borderRadius: 0, paddingVertical: 11, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                        >
                            {startAutomate.isPending && <ActivityIndicator size="small" color="white" />}
                            <ThemedText type="mediumBold" style={{ color: 'white' }}>{startAutomate.isPending ? 'Automating...' : 'Automate'}</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
