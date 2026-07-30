import { useTheme } from '@/context/theme-provider';
import { useUploadFileVersion } from '@/hooks/queries/use-files';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type FileVersionUploadModalProps = {
    visible: boolean;
    fileId: number;
    folderId: number;
    fileName: string;
    userId: number;
    showToast: (message: string, type?: 'success' | 'error') => void;
    onClose: () => void;
};

export function FileVersionUploadModal({ visible, fileId, folderId, fileName, userId, showToast, onClose }: FileVersionUploadModalProps) {
    const theme = useTheme();
    const [selectedFile, setSelectedFile] = useState<{ uri: string; name: string; mimeType: string } | null>(null);
    const [uploadPercent, setUploadPercent] = useState(0);
    const uploadMutation = useUploadFileVersion();

    const handlePickFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
        if (!result.canceled && result.assets?.[0]) {
            const asset = result.assets[0];
            setSelectedFile({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType ?? 'application/octet-stream' });
        }
    };

    const handleUpload = () => {
        if (!selectedFile || !userId) return;
        const ext = selectedFile.name.split('.').pop()?.toLowerCase();
        const mimeFallback: Record<string, string> = {
            png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
            webp: 'image/webp', bmp: 'image/bmp', svg: 'image/svg+xml',
            pdf: 'application/pdf', doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            txt: 'text/plain', csv: 'text/csv', zip: 'application/zip',
            mp4: 'video/mp4', mov: 'video/quicktime', avi: 'video/x-msvideo',
        };
        const fileMime = selectedFile.mimeType || mimeFallback[ext ?? ''] || 'application/octet-stream';
        const decodedName = decodeURIComponent(selectedFile.name);
        setUploadPercent(2);
        uploadMutation.mutate(
            {
                fileUri: selectedFile.uri,
                fileName: decodedName,
                fileType: fileMime,
                reqObj: {
                    createdBy: userId,
                    updatedBy: userId,
                    ownerId: userId,
                    folderId,
                    parentDocumentId: fileId,
                },
                onProgress: (pct) => setUploadPercent(pct),
            },
            {
                onSuccess: () => {
                    showToast(`Version uploaded for "${fileName}"`, 'success');
                    onClose();
                },
                onError: (error: any) => {
                    setUploadPercent(0);
                    showToast(error?.message || 'Upload failed', 'error');
                },
            }
        );
    };

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={uploadMutation.isPending ? undefined : onClose}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000060' }}>
                <Pressable style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }} onPress={uploadMutation.isPending ? undefined : onClose}>
                    <Pressable onPress={() => {}}>
                        <ThemedView style={{ width: 340, borderRadius: 16, padding: 24, gap: 16 }}>
                            <ThemedText type="mediumBold" style={{ textAlign: 'center' }}>Upload File Version</ThemedText>
                            <ThemedText type="small" style={{ textAlign: 'center', color: theme.theme.text + '80' }}>{fileName}</ThemedText>

                            <Pressable
                                onPress={handlePickFile}
                                disabled={uploadMutation.isPending}
                                style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 10,
                                    padding: 14, borderRadius: 0, borderWidth: 1,
                                    borderColor: theme.theme.text + '20', borderStyle: 'dashed',
                                }}
                            >
                                <Ionicons name="cloud-upload-outline" size={24} color={theme.theme.primary} />
                                <ThemedText type="small" style={{ flex: 1, color: selectedFile ? theme.theme.text : theme.theme.text + '60' }}>
                                    {selectedFile ? selectedFile.name : 'Tap to select a file'}
                                </ThemedText>
                                {selectedFile && !uploadMutation.isPending && (
                                    <Pressable onPress={() => setSelectedFile(null)}>
                                        <Ionicons name="close-circle" size={20} color={theme.theme.text + '60'} />
                                    </Pressable>
                                )}
                            </Pressable>

                            {uploadMutation.isPending && (
                                <View style={{ gap: 4 }}>
                                    <View style={{ height: 6, borderRadius: 3, backgroundColor: theme.theme.text + '15', overflow: 'hidden' }}>
                                        <View style={{ height: '100%', width: `${uploadPercent}%`, borderRadius: 3, backgroundColor: theme.theme.primary }} />
                                    </View>
                                    <ThemedText type="extraSmall" style={{ color: theme.theme.text + '60', textAlign: 'right' }}>{uploadPercent}%</ThemedText>
                                </View>
                            )}

                            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 4 }}>
                                <Pressable
                                    onPress={onClose}
                                    disabled={uploadMutation.isPending}
                                    style={{ flex: 1, paddingVertical: 11, borderRadius: 0, borderWidth: 1, borderColor: theme.theme.text + '20', alignItems: 'center' }}
                                >
                                    <ThemedText type="medium" style={{ color: uploadMutation.isPending ? theme.theme.text + '40' : theme.theme.text + '99' }}>Cancel</ThemedText>
                                </Pressable>
                                <Pressable
                                    onPress={handleUpload}
                                    disabled={!selectedFile || uploadMutation.isPending}
                                    style={{
                                        flex: 1, paddingVertical: 11, borderRadius: 0,
                                        backgroundColor: !selectedFile || uploadMutation.isPending ? theme.theme.text + '20' : theme.theme.primary,
                                        alignItems: 'center',
                                    }}
                                >
                                    {uploadMutation.isPending ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <ThemedText type="mediumBold" style={{ color: 'white' }}>Upload</ThemedText>
                                    )}
                                </Pressable>
                            </View>
                        </ThemedView>
                    </Pressable>
                </Pressable>
            </View>
        </Modal>
    );
}