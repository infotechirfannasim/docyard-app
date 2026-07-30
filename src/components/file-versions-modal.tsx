import { downloadFile } from "@/api/endpoints/files";
import { ThemeContextType } from "@/context/theme-provider";
import { useFileLogs, useFileVersions, usePermanentDeleteFile, useRenameFile } from "@/hooks/queries/use-files";
import { FileDto } from "@/types/api/file-dto";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Dimensions, Image, Modal, Pressable, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { FileLogsModal } from "./file-logs-modal";
import { FilePropertiesModal } from "./file-properties-modal";
import { ThemedText } from "./themed-text";

type FileVersionsModalProps = {
    visible: boolean;
    fileId: number;
    fileName: string;
    userId?: number;
    theme: ThemeContextType;
    onClose: () => void;
};

function getMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const mimeMap: Record<string, string> = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        txt: 'text/plain',
        zip: 'application/zip',
    };
    return mimeMap[ext] || 'application/octet-stream';
}

export function FileVersionsModal({ visible, fileId, fileName, userId, theme, onClose }: FileVersionsModalProps) {
    const { data: versions, isLoading } = useFileVersions(fileId);
    const renameMutation = useRenameFile();
    const deleteMutation = usePermanentDeleteFile();
    const [renamingId, setRenamingId] = useState<number | null>(null);
    const [newName, setNewName] = useState('');
    const [logsVersionId, setLogsVersionId] = useState<number | null>(null);
    const { data: versionLogs, isLoading: isLogsLoading } = useFileLogs(logsVersionId!, !!logsVersionId);
    const [downloading, setDownloading] = useState(false);
    const [tableScrollX, setTableScrollX] = useState(0);
    const [tableScrollW, setTableScrollW] = useState(0);
    const [tableVisibleW, setTableVisibleW] = useState(0);
    const [file, setFile] = useState<FileDto | null>(null);
    const screenHeight = Dimensions.get('window').height;
    const modalHeight = screenHeight * 0.65;

    const handleRename = (v: FileDto) => {
        if (!newName.trim() || !userId) return;
        renameMutation.mutate({ id: v.id!, name: newName.trim(), updatedBy: String(userId) });
        setRenamingId(null);
        setNewName('');
    };

    const handleDownload = async (v: FileDto) => {
        setDownloading(true);
        try {
            const { fileUri } = await downloadFile(v.id!, v.name, userId!, getMimeType(v.name), 'file');
            Alert.alert('Downloaded', `"${v.name}" downloaded`);
        } catch {
            Alert.alert('Error', 'Download failed');
        } finally {
            setDownloading(false);
        }
    };

    const handleDelete = (v: FileDto) => {
        Alert.alert('Delete Version', `Delete version "${v.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => deleteMutation.mutate([v.id!]),
            },
        ]);
    };

    return (
        <>
            <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000060' }}>
                    <Pressable style={{ position: 'absolute', inset: 0 }} onPress={onClose} />
                    <View style={{ width: '90%', height: modalHeight, backgroundColor: theme.theme.background, borderRadius: 16, overflow: 'hidden' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: theme.theme.textSecondary + '30' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Image source={require('../../assets/images/icons/version.png')} style={{ width: 20, height: 20, tintColor: theme.theme.primary }} />
                                <ThemedText type="mediumBold">Versions</ThemedText>
                            </View>
                            <Pressable onPress={onClose}><Ionicons name="close-outline" size={22} color={theme.theme.textSecondary} /></Pressable>
                        </View>

                        {isLoading ? (
                            <View style={{ padding: 40, alignItems: 'center' }}><ThemedText type="extraSmall" style={{ color: theme.theme.textSecondary }}>Loading...</ThemedText></View>
                        ) : !versions?.length ? (
                            <View style={{ padding: 40, alignItems: 'center' }}><ThemedText type="extraSmall" style={{ color: theme.theme.textSecondary }}>No versions</ThemedText></View>
                        ) : (
                            <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 12 }}>
                                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={true}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}
                                        onScroll={(e) => setTableScrollX(e.nativeEvent.contentOffset.x)}
                                        onContentSizeChange={(w) => setTableScrollW(w)}
                                        onLayout={(e) => setTableVisibleW(e.nativeEvent.layout.width)}
                                        scrollEventThrottle={16}
                                    >
                                        <View style={{ minWidth: 540 }}>
                                            <View style={{ flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: theme.theme.textSecondary + '20' }}>
                                                <ThemedText type="extraExtraSmallBold" style={{ width: 60, color: theme.theme.textSecondary, paddingLeft: 10 }}>Version</ThemedText>
                                                <ThemedText type="extraExtraSmallBold" style={{ width: 100, color: theme.theme.textSecondary, paddingLeft: 10 }}>Published</ThemedText>
                                                <ThemedText type="extraExtraSmallBold" style={{ width: 120, color: theme.theme.textSecondary, paddingLeft: 10 }}>Name</ThemedText>
                                                <ThemedText type="extraExtraSmallBold" style={{ width: 100, color: theme.theme.textSecondary, paddingLeft: 10 }}>Created By</ThemedText>
                                                <ThemedText type="extraExtraSmallBold" style={{ width: 160, color: theme.theme.textSecondary, textAlign: 'center', paddingLeft: 10 }}>Actions</ThemedText>
                                            </View>
                                            {versions.map((v) => (
                                                <View key={v.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: theme.theme.textSecondary + '15' }}>
                                                    <ThemedText type="extraExtraSmall" style={{ width: 60, color: theme.theme.text, paddingLeft: 10 }}>{v.version ? `v${v.version}` : '-'}</ThemedText>
                                                    <ThemedText type="extraExtraSmall" style={{ width: 100, color: theme.theme.textSecondary, paddingLeft: 10 }}>{v.createdOn ? new Date(v.createdOn).toLocaleDateString() : '-'}</ThemedText>
                                                    <View style={{ width: 120 }}>
                                                        {renamingId === v.id ? (
                                                            <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                                                                <TextInput
                                                                    value={newName}
                                                                    onChangeText={setNewName}
                                                                     style={{ flex: 1, borderWidth: 1, borderColor: theme.theme.textSecondary + '40', borderRadius: 0, paddingHorizontal: 6, paddingVertical: 2, fontSize: 11, color: theme.theme.text }}
                                                                />
                                                                <Pressable onPress={() => handleRename(v)}><Ionicons name="checkmark-outline" size={18} color={theme.theme.primary} /></Pressable>
                                                                <Pressable onPress={() => setRenamingId(null)}><Ionicons name="close-outline" size={18} color={theme.theme.textSecondary} /></Pressable>
                                                            </View>
                                                        ) : (
                                                            <ThemedText type="extraExtraSmall" style={{ color: theme.theme.text, paddingLeft: 10 }} numberOfLines={1}>{v.name}</ThemedText>
                                                        )}
                                                    </View>
                                                    <ThemedText type="extraExtraSmall" style={{ width: 100, color: theme.theme.textSecondary, paddingLeft: 10 }}>{v.createdByUsername || '-'}</ThemedText>
                                                    <View style={{ width: 160, flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'flex-end' }}>
                                                        <TouchableOpacity onPress={() => {setFile(v);}}><Ionicons name="eye-outline" size={18} color={theme.theme.primary} /></TouchableOpacity>
                                                        <TouchableOpacity onPress={() => { setRenamingId(v.id!); setNewName(v.title); }}><Image source={require('../../assets/images/icons/edit.png')} style={{ width: 15, height: 15, tintColor: theme.theme.textSecondary }} /></TouchableOpacity>
                                                        <TouchableOpacity onPress={() => setLogsVersionId(v.id!)}><Image source={require('../../assets/images/icons/log.png')} style={{ width: 15, height: 15, tintColor: theme.theme.textSecondary }} /></TouchableOpacity>
                                                        <TouchableOpacity onPress={() => handleDownload(v)} disabled={downloading}><Image source={require('../../assets/images/icons/download.png')} style={{ width: 15, height: 15, tintColor: theme.theme.textSecondary }} /></TouchableOpacity>
                                                        <TouchableOpacity onPress={() => handleDelete(v)}><Image source={require('../../assets/images/icons/delete.png')} style={{ width: 15, height: 15, tintColor: theme.theme.onError }} /></TouchableOpacity>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </ScrollView>
                                {tableScrollW > tableVisibleW + 5 && tableScrollX + tableVisibleW < tableScrollW - 5 && (
                                    <View pointerEvents="none" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 32, justifyContent: 'center', alignItems: 'flex-end' }}>
                                        <Ionicons name="chevron-forward" size={18} color={theme.theme.textSecondary} />
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
            <FileLogsModal
                visible={!!logsVersionId}
                logs={versionLogs}
                isLoading={isLogsLoading}
                fileTitle={versions?.find(v => v.id === logsVersionId)?.name}
                theme={theme}
                onClose={() => setLogsVersionId(null)}
            />
            <FilePropertiesModal
                visible={!!file}
                file={file}
                userId={userId}
                theme={theme}
                allowedTabs={["properties", "workflow", "metadata"]}
                onClose={() => setFile(null)}
            />
        </>
    );
}
