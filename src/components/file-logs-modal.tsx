import { ThemeContextType } from "@/context/theme-provider";
import { FileLogsDto } from "@/types/api/file-dto";
import { ActivityIndicator, Modal, Pressable, ScrollView, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

type FileLogsModalProps = {
    visible: boolean;
    logs: FileLogsDto[] | undefined;
    isLoading: boolean;
    fileTitle: string | undefined;
    theme: ThemeContextType;
    onClose: () => void;
};

export function FileLogsModal({ visible, logs, isLoading, fileTitle, theme, onClose }: FileLogsModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000060' }}>
                <Pressable style={{ position: 'absolute', inset: 0 }} onPress={onClose} />
                <ThemedView style={{ width: 340, maxHeight: 480, borderRadius: 16, padding: 24, gap: 16 }}>
                    <ThemedText type="mediumBold" style={{ textAlign: 'center' }}>
                        Activity Logs
                    </ThemedText>
                    {fileTitle ? (
                        <ThemedText type="medium" style={{ textAlign: 'left' }}>
                            {fileTitle}
                        </ThemedText>
                    ) : null}

                    <View style={{ height: 1, backgroundColor: theme.theme.text + '15' }} />

                    {isLoading ? (
                        <ActivityIndicator size="small" style={{ padding: 20 }} />
                    ) : !logs || logs.length === 0 ? (
                        <ThemedText type="small" style={{ textAlign: 'center', color: theme.theme.text + '80', padding: 20 }}>
                            No logs found
                        </ThemedText>
                    ) : (
                        <ScrollView style={{ maxHeight: 340 }}>
                            {logs.map((log, index) => (
                                <View key={log.id ?? index} style={{ paddingVertical: 10, gap: 4 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <ThemedText type="smallBold">{log.action}</ThemedText>
                                        <ThemedText type="extraSmall" style={{ color: theme.theme.text + '80' }}>
                                            {new Date(log.updatedOn).toLocaleDateString()}
                                        </ThemedText>
                                    </View>
                                    <ThemedText type="extraSmall" style={{ color: theme.theme.text + '60' }}>
                                        by {log.userName}
                                    </ThemedText>
                                    {index < logs.length - 1 && (
                                        <View style={{ height: 1, backgroundColor: theme.theme.text + '10', marginTop: 4 }} />
                                    )}
                                </View>
                            ))}
                        </ScrollView>
                    )}

                    <View style={{ height: 1, backgroundColor: theme.theme.text + '15' }} />

                    <Pressable
                        onPress={onClose}
                        style={{
                            paddingVertical: 11,
                            borderRadius: 8,
                            backgroundColor: theme.theme.primary,
                            alignItems: 'center',
                        }}
                    >
                        <ThemedText type="mediumBold" style={{ color: 'white' }}>Close</ThemedText>
                    </Pressable>
                </ThemedView>
            </View>
        </Modal>
    );
}
