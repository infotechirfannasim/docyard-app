import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-provider';
import { useMetaDataTemplateDetail, useMetaDataTemplates, useUploadFile } from '@/hooks/queries/use-files';
import { useCurrentUser } from '@/hooks/queries/use-user';
import { MetaDataAttributeDto } from '@/types/api/file-dto';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { AnimatedToast } from './animated-toast';
import { ThemedText } from './themed-text';
import ThemedTextInput from './themed-text-input';
import { ThemedView } from './themed-view';

type UploadModalProps = {
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

export function UploadModal({ visible, currentFolderId, onClose }: UploadModalProps) {
    const theme = useTheme();
    const { username } = useAuth();
    const { data: user } = useCurrentUser(username);
    const uploadMutation = useUploadFile();
    const { data: templates, isLoading: isTemplatesLoading } = useMetaDataTemplates(visible);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
    const { data: templateDetail, isLoading: isTemplateDetailLoading } = useMetaDataTemplateDetail(selectedTemplateId, visible && !!selectedTemplateId);

    const [selectedFile, setSelectedFile] = useState<{ uri: string; name: string; mimeType: string } | null>(null);
    const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});
    const [showTemplatePicker, setShowTemplatePicker] = useState(false);
    const [showDatePickerFor, setShowDatePickerFor] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [uploadPercent, setUploadPercent] = useState(0);

    useEffect(() => {
        if (visible) {
            setSelectedFile(null);
            setSelectedTemplateId(templates?.[0]?.id ?? null);
            setAttributeValues({});
            setToastMessage('');
        }
    }, [visible]);

    const templateData = Array.isArray(templateDetail) ? templateDetail[0] : templateDetail;
    const attributes: MetaDataAttributeDto[] = (templateData as any)?.metaDataAttributeDtoList ?? (templateData as any)?.metaDataAttributeDTOList ?? [];

    const handlePickFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
        if (!result.canceled && result.assets?.[0]) {
            const asset = result.assets[0];
            setSelectedFile({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType ?? 'application/octet-stream' });
        }
    };

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

    const handleUpload = async () => {
        if (!selectedFile || !user?.id) return;

        const metaJson: Record<string, string> = {};
        attributes.forEach((attr) => {
            metaJson[attr.name] = attributeValues[attr.name]?.trim() || '';
        });

        const decodedName = decodeURIComponent(selectedFile.name);

        const reqObj = {
            createdBy: user.id,
            updatedBy: user.id,
            ownerId: user.id,
            folderId: currentFolderId && !isNaN(currentFolderId) ? currentFolderId : 0,
            metaJson: JSON.stringify(metaJson),
            templateId: selectedTemplateId ?? 1,
            name: decodedName,
            title: decodedName,
        };

        console.log('Upload reqObj:', JSON.stringify(reqObj, null, 2));
        console.log('Upload file:', selectedFile);
        console.log('Upload user:', { id: user.id, username });

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

        setUploadPercent(2);
        uploadMutation.mutate(
            {
              fileUri: selectedFile.uri,
              fileName: decodedName,
              fileType: fileMime,
              reqObj,
              activity: undefined,
              onProgress: (pct) => setUploadPercent(pct),
            },
            {
                onSuccess: () => {
                    setToastMessage(`"${decodedName}" uploaded`);
                    setToastType('success');
                    onClose();
                },
                onError: (error: any) => {
                    setUploadPercent(0);
                    const msg = error?.response?.data?.message || error?.message || 'Upload failed';
                    console.log('Upload error full:', JSON.stringify({
                        status: error?.response?.status,
                        data: error?.response?.data,
                        message: error?.message,
                    }, null, 2));
                    setToastMessage(msg);
                    setToastType('error');
                },
            }
        );
    };

    const selectedTemplateTitle = templates?.find((t) => t.id === selectedTemplateId)?.title;
    const isUploading = uploadMutation.isPending;
    const overallPercent = (uploadPercent);

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
                            borderRadius: 8,
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
                    style={{ borderRadius: 8, padding: 10, fontSize: 14 }}
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
                    <Pressable onPress={() => {}}>
                        <ThemedView style={{ width: 360, maxHeight: 520, borderRadius: 16, padding: 24, gap: 16 }}>
                            <ThemedText type="mediumBold" style={{ textAlign: 'center' }}>Upload File</ThemedText>

                            {/* File Picker */}
                            <Pressable
                                onPress={handlePickFile}
                                disabled={isUploading}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: 14,
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: theme.theme.text + '20',
                                    borderStyle: 'dashed',
                                }}
                            >
                                <Ionicons name="cloud-upload-outline" size={24} color={theme.theme.primary} />
                                <ThemedText type="small" style={{ flex: 1, color: selectedFile ? theme.theme.text : theme.theme.text + '60' }}>
                                    {selectedFile ? selectedFile.name : 'Tap to select a file'}
                                </ThemedText>
                                {selectedFile && !isUploading && (
                                    <Pressable onPress={() => setSelectedFile(null)}>
                                        <Ionicons name="close-circle" size={20} color={theme.theme.text + '60'} />
                                    </Pressable>
                                )}
                            </Pressable>

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
                                        borderRadius: 10,
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
                                <ScrollView style={{ maxHeight: 220 }} keyboardShouldPersistTaps="handled">
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
                                    <View style={{ height: 6, borderRadius: 3, backgroundColor: theme.theme.text + '15', overflow: 'hidden' }}>
                                        <View style={{
                                            height: '100%',
                                            width: `${overallPercent}%`,
                                            borderRadius: 3,
                                            backgroundColor: theme.theme.primary,
                                        }} />
                                    </View>
                                    <ThemedText type="extraSmall" style={{ color: theme.theme.text + '60', textAlign: 'right' }}>
                                        {overallPercent}%
                                    </ThemedText>
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
                                        borderRadius: 8,
                                        borderWidth: 1,
                                        borderColor: theme.theme.text + '20',
                                        alignItems: 'center',
                                    }}
                                >
                                    <ThemedText type="medium" style={{ color: isUploading ? theme.theme.text + '40' : theme.theme.text + '99' }}>Cancel</ThemedText>
                                </Pressable>
                                <Pressable
                                    onPress={handleUpload}
                                    disabled={!selectedFile || isUploading}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 11,
                                        borderRadius: 8,
                                        backgroundColor: !selectedFile || isUploading ? theme.theme.text + '20' : theme.theme.primary,
                                        alignItems: 'center',
                                    }}
                                >
                                    {isUploading ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <ThemedText type="mediumBold" style={{ color: 'white' }}>Upload</ThemedText>
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
                    <Pressable onPress={() => {}}>
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
                                                borderRadius: 8,
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

            <AnimatedToast
                message={toastMessage}
                type={toastType}
                theme={theme}
                onFinish={() => setToastMessage('')}
            />
        </Modal>
    );
}
