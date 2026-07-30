import { uploadFolder } from '@/api/endpoints/files';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-provider';
import { useToast } from '@/context/toast-context';
import { useMetaDataTemplateDetail, useMetaDataTemplates, useUploadFile, useUploadFolder } from '@/hooks/queries/use-files';

import { FolderUploadDto, MetaDataAttributeDto } from '@/types/api/file-dto';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StorageAccessFramework } from 'expo-file-system/legacy';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { ThemedText } from './themed-text';
import ThemedTextInput from './themed-text-input';
import { ThemedView } from './themed-view';

type FolderUploadModalProps = {
    visible: boolean;
    currentFolderId: number | null;
    onClose: () => void;
};

function isDateType(type: string): boolean {
    return ['date', 'datetime', 'Date', 'DateTime', 'Date Picker'].includes(type);
}

function formatDisplayDate(date: Date): string {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function FolderUploadModal({ visible, currentFolderId, onClose }: FolderUploadModalProps) {
    const theme = useTheme();
    const { username, user } = useAuth();
    const uploadFolderMutation = useUploadFolder();
    const uploadFileMutation = useUploadFile();
    const { data: templates, isLoading: isTemplatesLoading } = useMetaDataTemplates(visible);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
    const { data: templateDetail, isLoading: isTemplateDetailLoading } = useMetaDataTemplateDetail(selectedTemplateId, visible && !!selectedTemplateId);

    const [selectedFolder, setSelectedFolder] = useState<{ uri: string; name: string } | null>(null);
    const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});
    const [showTemplatePicker, setShowTemplatePicker] = useState(false);
    const [showDatePickerFor, setShowDatePickerFor] = useState<string | null>(null);
    const { setToast } = useToast();
    const [uploadProgress, setUploadProgress] = useState<string | null>(null);
    const [filePercent, setFilePercent] = useState(0);
    const [isPickingFolder, setIsPickingFolder] = useState(false);

    useEffect(() => {
        if (visible) {
            setSelectedFolder(null);
            setSelectedTemplateId(templates?.[0]?.id ?? null);
            setAttributeValues({});
            setUploadProgress(null);
            // pickFolder();
        }
    }, [visible]);

    const pickFolder = async () => {
        setIsPickingFolder(true);
        try {
            const result = await StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (result.granted) {
                const rawName = decodeURIComponent(result.directoryUri.split('/').pop() || 'New Folder');
                const nameParts = rawName.split('/');
                const lastPart = nameParts[nameParts.length - 1];
                const folderName = lastPart.includes(':') ? lastPart.split(':').slice(1).join(':') : lastPart;
                setSelectedFolder({ uri: result.directoryUri, name: folderName });
            } else {
                onClose();
            }
        } catch (e) {
            console.log('Folder picker error:', e);
            onClose();
        } finally {
            setIsPickingFolder(false);
        }
    };

    const templateData = Array.isArray(templateDetail) ? templateDetail[0] : templateDetail;
    const attributes: MetaDataAttributeDto[] = (templateData as any)?.metaDataAttributeDtoList ?? (templateData as any)?.metaDataAttributeDTOList ?? [];

    const handleSelectTemplate = (id: number) => {
        setSelectedTemplateId(id);
        setAttributeValues({});
        setShowTemplatePicker(false);
    };

    const handleDateChange = (_event: any, selectedDate?: Date) => {
        const attrName = showDatePickerFor;
        setShowDatePickerFor(null);
        if (selectedDate && attrName) {
            setAttributeValues((prev) => ({ ...prev, [attrName]: selectedDate.toISOString() }));
        }
    };

    const handleCreateAndUpload = async () => {
        if (!selectedFolder || !user?.id) return;
        const userId = user.id;

        setUploadProgress('Starting...');

        const metaJson: Record<string, string> = {};
        attributes.forEach((attr) => {
            metaJson[attr.name] = attributeValues[attr.name]?.trim() || '';
        });

        const now = new Date().toISOString();
        const payload: FolderUploadDto = {
            createdBy: userId,
            updatedBy: userId,
            ownerId: userId,
            daysArchived: 0,
            shared: false,
            checkIn: false,
            createdOn: now,
            updatedOn: now,
            name: selectedFolder.name,
            parentId: currentFolderId && !isNaN(currentFolderId) ? currentFolderId : null,
            title: selectedFolder.name,
            metaJson: JSON.stringify(metaJson),
            templateId: selectedTemplateId ?? 1,
        };

        uploadFolderMutation.mutate(payload, {
            onSuccess: async (response) => {
                const rootFolderId = response?.data?.id;
                if (!rootFolderId) {
                    setToast('Folder created but no ID returned', 'error');
                    return;
                }

                await processSafEntry(selectedFolder.uri, rootFolderId, metaJson, userId);
                setToast(`Files uploaded to "${selectedFolder.name}"`, 'success');
                onClose();
            },
            onError: (error: any) => {
                setToast(error?.response?.data?.message || error?.message || 'Failed to create folder', 'error');
                setUploadProgress(null);
            },
        });
    };

    const processSafEntry = async (safUri: string, parentFolderId: number, metaJson: Record<string, string>, uid: number) => {
        const entries = await StorageAccessFramework.readDirectoryAsync(safUri);

        for (const entryUri of entries) {
            let isDir = false;
            try {
                const sub = await StorageAccessFramework.readDirectoryAsync(entryUri);
                isDir = true;
            } catch {
                isDir = false;
            }

            const entryName = decodeURIComponent(entryUri).split('/').pop() || '';

            if (isDir) {
                const subfolderPayload: FolderUploadDto = {
                    createdBy: uid,
                    updatedBy: uid,
                    ownerId: uid,
                    daysArchived: 0,
                    shared: false,
                    checkIn: false,
                    createdOn: new Date().toISOString(),
                    updatedOn: new Date().toISOString(),
                    name: entryName,
                    parentId: parentFolderId,
                    title: entryName,
                    metaJson: JSON.stringify(metaJson),
                    templateId: selectedTemplateId ?? 1,
                };

                try {
                    const res = await uploadFolder(subfolderPayload);
                    const newFolderId = res?.data?.id;
                    if (newFolderId) {
                        await processSafEntry(entryUri, newFolderId, metaJson, uid);
                    }
                } catch (e) {
                    console.log('Failed to create subfolder:', entryName, e);
                }
            } else {
                const ext = entryName.split('.').pop()?.toLowerCase();
                if (!ext || ext === entryName) {
                    continue;
                }

                setUploadProgress(entryName);
                setFilePercent(0);

                const mimeFallback: Record<string, string> = {
                    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
                    webp: 'image/webp', bmp: 'image/bmp', svg: 'image/svg+xml',
                    pdf: 'application/pdf', doc: 'application/msword',
                    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    txt: 'text/plain', csv: 'text/csv', zip: 'application/zip',
                    mp4: 'video/mp4', mov: 'video/quicktime', avi: 'video/x-msvideo',
                };
                const fileMime = mimeFallback[ext] || 'application/octet-stream';

                await new Promise<void>((resolve, reject) => {
                    uploadFileMutation.mutate(
                        {
                            fileUri: entryUri,
                            fileName: entryName,
                            fileType: fileMime,
                            reqObj: {
                                createdBy: uid,
                                updatedBy: uid,
                                ownerId: uid,
                                folderId: parentFolderId,
                                metaJson: JSON.stringify(metaJson),
                                templateId: selectedTemplateId ?? 1,
                                name: entryName,
                                title: entryName,
                            },
                            activity: false,
                            onProgress: (pct) => setFilePercent(pct),
                        },
                        { onSuccess: () => resolve(), onError: (err: any) => reject(err) }
                    );
                });
            }
        }
    };

    const selectedTemplateTitle = templates?.find((t) => t.id === selectedTemplateId)?.title;
    const isUploading = uploadFolderMutation.isPending || !!uploadProgress;

    const renderField = (attr: MetaDataAttributeDto) => {
        if (isDateType(attr.type)) {
            const dateValue = attributeValues[attr.name] ? new Date(attributeValues[attr.name]) : null;
            return (
                <View key={attr.id} style={{ gap: 4 }}>
                    <ThemedText type="extraSmallBold" style={{ color: theme.theme.text + '80' }}>
                        {attr.description || attr.name}
                    </ThemedText>
                    <Pressable
                        onPress={() => {
                            setAttributeValues((prev) => ({ ...prev, [attr.name]: '' }));
                            setShowDatePickerFor(attr.name);
                        }}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 12,
                            borderRadius: 0,
                            borderWidth: 1,
                            borderColor: theme.theme.text + '20',
                        }}
                    >
                        <ThemedText type="small" style={{ color: dateValue ? theme.theme.text : theme.theme.text + '60' }}>
                            {dateValue ? formatDisplayDate(dateValue) : `Select ${attr.name}`}
                        </ThemedText>
                        <Ionicons name="calendar-outline" size={18} color={theme.theme.text + '60'} />
                    </Pressable>
                    {showDatePickerFor === attr.name && (
                        <DateTimePicker
                            value={dateValue ?? new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onValueChange={handleDateChange}
                        />
                    )}
                </View>
            );
        }

        return (
            <View key={attr.id} style={{ gap: 4 }}>
                <ThemedText type="extraSmallBold" style={{ color: theme.theme.text + '80' }}>
                    {attr.description || attr.name}
                </ThemedText>
                <ThemedTextInput
                    placeholder={`Enter ${attr.name}`}
                    value={attributeValues[attr.name] ?? ''}
                    onChangeText={(text) => setAttributeValues((prev) => ({ ...prev, [attr.name]: text }))}
                    style={{ borderRadius: 0, padding: 10, fontSize: 14 }}
                />
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={isUploading ? undefined : onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000060' }}
            >
                <Pressable style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }} onPress={isUploading ? undefined : onClose}>
                    <Pressable onPress={() => { }}>
                        <ThemedView style={{ width: 360, maxHeight: 520, borderRadius: 16, padding: 24, gap: 16 }}>
                            <ThemedText type="mediumBold" style={{ textAlign: 'center' }}>Upload Folder</ThemedText>

                            {/* Folder Info */}
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 10,
                                padding: 14,
                                borderRadius: 0,
                                borderWidth: 1,
                                borderColor: theme.theme.text + '20',
                            }}>
                                {isPickingFolder ? (
                                    <ActivityIndicator size="small" />
                                ) : (
                                    <>
                                        <Pressable onPress={pickFolder} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                                            <Ionicons name="folder-outline" size={24} color={theme.theme.primary} />
                                            <ThemedText type="small" style={{ flex: 1, color: selectedFolder?.name ? theme.theme.text : theme.theme.text + '60' }}>
                                                {selectedFolder?.name ? `${selectedFolder.name}` : 'Tap to select a folder'}
                                            </ThemedText>
                                        </Pressable>
                                    </>
                                )}
                            </View>

                            {/* Template Selector */}
                            <View style={{ gap: 6 }}>
                                <ThemedText type="extraSmallBold" style={{ color: theme.theme.text + '80' }}>Metadata Template</ThemedText>
                                <Pressable
                                    onPress={() => setShowTemplatePicker(true)}
                                    disabled={isUploading}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: 12,
                                        borderRadius: 0,
                                        borderWidth: 1,
                                        borderColor: theme.theme.text + '20',
                                    }}
                                >
                                    <ThemedText type="small" style={{ color: selectedTemplateTitle ? theme.theme.text : theme.theme.text + '60' }}>
                                        {selectedTemplateTitle || (isTemplatesLoading ? 'Loading...' : 'Select template')}
                                    </ThemedText>
                                    <Ionicons name="chevron-down" size={18} color={theme.theme.text + '60'} />
                                </Pressable>
                            </View>

                            {/* Dynamic Form Fields */}
                            {isTemplateDetailLoading ? (
                                <ActivityIndicator size="small" style={{ padding: 10 }} />
                            ) : attributes.length > 0 ? (
                                <ScrollView style={{ maxHeight: 180 }} keyboardShouldPersistTaps="handled">
                                    <View style={{ gap: 12 }}>
                                        {attributes.map((attr) => renderField(attr))}
                                    </View>
                                </ScrollView>
                            ) : selectedTemplateId ? (
                                <ThemedText type="small" style={{ textAlign: 'center', color: theme.theme.text + '60', padding: 10 }}>
                                    No metadata fields for this template
                                </ThemedText>
                            ) : null}

                            {/* Upload Progress */}
                            {isUploading && (
                                <View style={{ gap: 4 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <ActivityIndicator size="small" />
                                        <ThemedText type="extraSmall" style={{ flex: 1, color: theme.theme.text + '80' }} numberOfLines={1}>
                                            {uploadFolderMutation.isPending
                                                ? 'Creating folder...'
                                                : uploadProgress
                                                    ? `Uploading: ${uploadProgress}`
                                                    : 'Complete'}
                                        </ThemedText>
                                    </View>
                                    {!uploadFolderMutation.isPending && uploadProgress && (
                                        <View style={{ gap: 4 }}>
                                            <View style={{ height: 6, borderRadius: 3, backgroundColor: theme.theme.text + '15', overflow: 'hidden' }}>
                                                <View style={{
                                                    height: '100%',
                                                    width: `${filePercent}%`,
                                                    borderRadius: 3,
                                                    backgroundColor: theme.theme.primary,
                                                }} />
                                            </View>
                                            <ThemedText type="extraSmall" style={{ color: theme.theme.text + '60', textAlign: 'right' }}>
                                                {filePercent}%
                                            </ThemedText>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Action Buttons */}
                            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 4 }}>
                                <Pressable
                                    onPress={onClose}
                                    disabled={isUploading}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 11,
                                        borderRadius: 0,
                                        borderWidth: 1,
                                        borderColor: theme.theme.text + '20',
                                        alignItems: 'center',
                                    }}
                                >
                                    <ThemedText type="medium" style={{ color: isUploading ? theme.theme.text + '40' : theme.theme.text + '99' }}>Cancel</ThemedText>
                                </Pressable>
                                <Pressable
                                    onPress={handleCreateAndUpload}
                                    disabled={!selectedFolder || isUploading}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 11,
                                        borderRadius: 0,
                                        backgroundColor: !selectedFolder || isUploading ? theme.theme.text + '20' : theme.theme.primary,
                                        alignItems: 'center',
                                    }}
                                >
                                    {isUploading ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <ThemedText type="mediumBold" style={{ color: 'white' }}>Create & Upload</ThemedText>
                                    )}
                                </Pressable>
                            </View>
                        </ThemedView>
                    </Pressable>
                </Pressable>
            </KeyboardAvoidingView>

            {/* Template Picker Modal */}
            <Modal
                visible={showTemplatePicker}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setShowTemplatePicker(false)}
            >
                <Pressable
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000060' }}
                    onPress={() => setShowTemplatePicker(false)}
                >
                    <Pressable onPress={() => { }}>
                        <ThemedView style={{ width: 300, maxHeight: 400, borderRadius: 16, padding: 20, gap: 12 }}>
                            <ThemedText type="mediumBold" style={{ textAlign: 'center' }}>Select Template</ThemedText>
                            <View style={{ height: 1, backgroundColor: theme.theme.text + '15' }} />
                            {isTemplatesLoading ? (
                                <ActivityIndicator size="small" style={{ padding: 20 }} />
                            ) : !templates || templates.length === 0 ? (
                                <ThemedText type="small" style={{ textAlign: 'center', color: theme.theme.text + '60', padding: 20 }}>No templates available</ThemedText>
                            ) : (
                                <FlatList
                                    data={templates}
                                    keyExtractor={(item) => String(item.id)}
                                    renderItem={({ item }) => (
                                        <Pressable
                                            onPress={() => handleSelectTemplate(item.id)}
                                            style={{
                                                paddingVertical: 12,
                                                paddingHorizontal: 8,
                                                borderRadius: 0,
                                                backgroundColor: selectedTemplateId === item.id ? theme.theme.primary + '15' : 'transparent',
                                            }}
                                        >
                                            <ThemedText type="smallBold">{item.title}</ThemedText>
                                            {item.description ? (
                                                <ThemedText type="extraSmall" style={{ color: theme.theme.text + '60', marginTop: 2 }}>{item.description}</ThemedText>
                                            ) : null}
                                        </Pressable>
                                    )}
                                    style={{ maxHeight: 300 }}
                                />
                            )}
                        </ThemedView>
                    </Pressable>
                </Pressable>
            </Modal>


        </Modal>
    );
}
