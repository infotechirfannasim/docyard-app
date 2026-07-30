import { ThemeContextType } from "@/context/theme-provider";
import { useCreateFileComment, useCreateFileTag, useDeleteComment, useDeleteFileTag, useFileComments, useFileTags, useMetaDataTemplateDetail, useSharedUserData, useUpdateComment, useWorkflowList } from "@/hooks/queries/use-files";
import { FileDto } from "@/types/api/file-dto";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { ThemedText } from "./themed-text";

type FilePropertiesModalProps = {
    visible: boolean;
    file: FileDto | null;
    userId?: number;
    theme: ThemeContextType;
    onClose: () => void;
    allowedTabs?: Tab[];
};

type Tab = 'properties' | 'comments' | 'sharing' | 'tags' | 'metadata' | 'workflow';

const TABS: { key: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'properties', label: 'Properties', icon: 'information-circle-outline' },
    { key: 'comments', label: 'Comments', icon: 'chatbubbles-outline' },
    { key: 'sharing', label: 'Sharing', icon: 'people-outline' },
    { key: 'tags', label: 'Tags', icon: 'pricetags-outline' },
    { key: 'metadata', label: 'MetaData', icon: 'list-outline' },
    { key: 'workflow', label: 'Workflow', icon: 'git-branch-outline' },
];

function formatRelativeTime(dateStr: string | null | undefined): string {
    if (!dateStr) return '-';
    let date: number;
    const aspNetMatch = dateStr.match(/\/Date\((\d+)\)\//);
    if (aspNetMatch) {
        date = parseInt(aspNetMatch[1], 10);
    } else {
        date = new Date(dateStr).getTime();
    }
    if (date !== 0 && !date) return '-';
    if (isNaN(date)) return '-';
    const now = Date.now();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return new Date(date).toLocaleDateString();
}

function PropertiesTab({ file, theme, bodyHeight }: { file: FileDto; theme: ThemeContextType; bodyHeight: number }) {
    const iconColor = theme.theme.textSecondary;
    const rows: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }[] = [
        { label: 'Title', value: file.title || file.name, icon: 'document-text-outline' },
        { label: 'Directory Path', value: file.location || '/', icon: 'folder-outline' },
        ...(!file.folder ? [
            { label: 'Size', value: file.size || '-', icon: 'scale-outline' as const },
            { label: 'Type', value: (file.extension || '').toUpperCase(), icon: 'document-outline' as const },
        ] : []),
        { label: 'Modified', value: file.updatedOnDetail || formatRelativeTime(file.updatedOn), icon: 'time-outline' },
        ...(!file.folder ? [
            { label: 'Version', value: file.currentVersion ? `v${file.currentVersion}` : (file.version ? `v${file.version}` : '-'), icon: 'layers-outline' as const },
        ] : []),
        ...(file.checkInOnDetail || file.checkInOn ? [{ label: 'Last Check-in' as const, value: file.checkInOnDetail || formatRelativeTime(file.checkInOn), icon: 'checkmark-circle-outline' as const }] : []),
        ...(file.checkOutOnDetail || file.checkOutOn ? [{ label: 'Last Check-out' as const, value: file.checkOutOnDetail || formatRelativeTime(file.checkOutOn), icon: 'lock-open-outline' as const }] : []),
        { label: 'Updated By', value: file.updatedByName || file.updatedByUsername || '-', icon: 'person-outline' },
        { label: 'Created By', value: file.createdByName || file.createdByUsername || '-', icon: 'person-add-outline' },
    ];
    return (
        <ScrollView style={{ paddingHorizontal: 20,  paddingBottom: 16, height: bodyHeight }}>
            {rows.map((row, i) => (
                <View key={i} style={{ flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: theme.theme.textSecondary + '15' }}>
                    <View style={{ width: 24, alignItems: 'center', marginRight: 12 }}>
                        <Ionicons name={row.icon} size={16} color={iconColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <ThemedText type="extraExtraSmall" style={{ color: iconColor, marginBottom: 2 }}>{row.label}</ThemedText>
                        <ThemedText type="small" style={{ color: theme.theme.text }}>{row.value}</ThemedText>
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}

function CommentsTab({ file, userId, theme, bodyHeight }: { file: FileDto; userId?: number; theme: ThemeContextType; bodyHeight: number }) {
    const { data: comments, isLoading } = useFileComments(file.id!);
    const createComment = useCreateFileComment();
    const updateComment = useUpdateComment();
    const deleteComment = useDeleteComment();
    const [newMsg, setNewMsg] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editMsg, setEditMsg] = useState('');

    const handleAdd = () => {
        if (!newMsg.trim() || !userId) return;
        createComment.mutate({ createdBy: userId, docId: file.id!, message: newMsg.trim(), updatedBy: userId, userId });
        setNewMsg('');
    };

    const handleUpdate = (id: number) => {
        if (!editMsg.trim() || !userId) return;
        updateComment.mutate({ id, docId: file.id!, message: editMsg.trim(), createdBy: userId, updatedBy: userId, userId });
        setEditingId(null);
        setEditMsg('');
    };

    const handleDelete = (id: number) => {
        deleteComment.mutate(id);
    };

    if (isLoading) {
        return <View style={{ height: bodyHeight, justifyContent: 'center', alignItems: 'center' }}><ThemedText type="extraSmall" style={{ color: theme.theme.textSecondary }}>Loading...</ThemedText></View>;
    }

    return (
        <View style={{ paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 16, height: bodyHeight }}>
            {userId && (
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                    <TextInput
                        value={newMsg}
                        onChangeText={setNewMsg}
                        placeholder="Add a comment..."
                        placeholderTextColor={theme.theme.textSecondary}
                        style={{ flex: 1, borderWidth: 1, borderColor: theme.theme.textSecondary + '40', borderRadius: 0, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: theme.theme.text }}
                    />
                    <Pressable onPress={handleAdd} style={{ backgroundColor: theme.theme.primary, borderRadius: 0, paddingHorizontal: 14, justifyContent: 'center' }}>
                        <Ionicons name="send-outline" size={18} color="white" />
                    </Pressable>
                </View>
            )}
            {!comments?.length ? (
                <ThemedText type="extraSmall" style={{ color: theme.theme.textSecondary, textAlign: 'center', paddingVertical: 20 }}>No comments</ThemedText>
            ) : (
                <ScrollView style={{ flex: 1 }}>
                    {comments.map((c) => (
                        <View key={c.id} style={{ paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: theme.theme.textSecondary + '15' }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                        <ThemedText type="extraExtraSmallBold" style={{ color: theme.theme.text }}>{c.nameOfUser}</ThemedText>
                                        <ThemedText type="extraExtraSmall" style={{ color: theme.theme.textSecondary }}>{formatRelativeTime(c.updatedOn || c.createdOn)}</ThemedText>
                                    </View>
                                    {editingId === c.id ? (
                                        <View style={{ flexDirection: 'row', gap: 6 }}>
                                            <TextInput
                                                value={editMsg}
                                                onChangeText={setEditMsg}
                                                style={{ flex: 1, borderWidth: 1, borderColor: theme.theme.textSecondary + '40', borderRadius: 0, paddingHorizontal: 8, paddingVertical: 4, fontSize: 13, color: theme.theme.text }}
                                            />
                                            <Pressable onPress={() => handleUpdate(c.id!)}><Ionicons name="checkmark-outline" size={20} color={theme.theme.primary} /></Pressable>
                                            <Pressable onPress={() => setEditingId(null)}><Ionicons name="close-outline" size={20} color={theme.theme.textSecondary} /></Pressable>
                                        </View>
                                    ) : (
                                        <ThemedText type="extraSmall" style={{ color: theme.theme.text }}>{c.message}</ThemedText>
                                    )}
                                </View>
                                <View style={{ flexDirection: 'row', gap: 10, marginLeft: 8 }}>
                                    {editingId !== c.id && (
                                        <>
                                            <Pressable onPress={() => { setEditingId(c.id!); setEditMsg(c.message); }} style={{ padding: 4 }}><Ionicons name="create-outline" size={18} color={theme.theme.textSecondary} /></Pressable>
                                            <Pressable onPress={() => handleDelete(c.id!)} style={{ padding: 4 }}><Ionicons name="trash-outline" size={18} color={theme.theme.onError} /></Pressable>
                                        </>
                                    )}
                                </View>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

function SharingTab({ file, theme, bodyHeight }: { file: FileDto; theme: ThemeContextType; bodyHeight: number }) {
    const { data: shares, isLoading } = useSharedUserData(file.id!);

    if (isLoading) {
        return <View style={{ height: bodyHeight, justifyContent: 'center', alignItems: 'center' }}><ThemedText type="extraSmall" style={{ color: theme.theme.textSecondary }}>Loading...</ThemedText></View>;
    }

    if (!shares?.length) {
        return <View style={{ height: bodyHeight, justifyContent: 'center', alignItems: 'center' }}><ThemedText type="extraSmall" style={{ color: theme.theme.textSecondary }}>Not shared</ThemedText></View>;
    }

    return (
        <ScrollView style={{ paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 16, height: bodyHeight }}>
            {shares.map((s, i) => (
                <View key={s.id ?? i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: theme.theme.textSecondary + '15' }}>
                    {s.dlCollPic ? (
                        <Image source={{ uri: `data:image/png;base64,${s.dlCollPic}` }} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 12 }} />
                    ) : (
                        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.theme.primary + '20', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                            <Ionicons name="person-outline" size={18} color={theme.theme.primary} />
                        </View>
                    )}
                    <View style={{ flex: 1 }}>
                        <ThemedText type="small" style={{ color: theme.theme.text }}>{s.dlCollName}</ThemedText>
                        <ThemedText type="extraExtraSmall" style={{ color: theme.theme.textSecondary }}>{s.dlCollEmail}</ThemedText>
                    </View>
                    <View style={{ backgroundColor: theme.theme.primary + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 }}>
                        <ThemedText type="extraExtraSmallBold" style={{ color: theme.theme.primary }}>{s.accessRight}</ThemedText>
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}

function TagsTab({ file, userId, theme, bodyHeight }: { file: FileDto; userId?: number; theme: ThemeContextType; bodyHeight: number }) {
    const { data: tags, isLoading } = useFileTags(file.id!);
    const createTag = useCreateFileTag();
    const deleteTag = useDeleteFileTag();
    const [newTag, setNewTag] = useState('');

    const handleAdd = () => {
        if (!newTag.trim() || !userId) return;
        createTag.mutate({ docId: file.id!, message: newTag.trim(), userId });
        setNewTag('');
    };

    if (isLoading) {
        return <View style={{ height: bodyHeight, justifyContent: 'center', alignItems: 'center' }}><ThemedText type="extraSmall" style={{ color: theme.theme.textSecondary }}>Loading...</ThemedText></View>;
    }

    return (
        <View style={{ paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 16, height: bodyHeight }}>
            {userId && (
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                    <TextInput
                        value={newTag}
                        onChangeText={setNewTag}
                        placeholder="Add a tag..."
                        placeholderTextColor={theme.theme.textSecondary}
                        style={{ flex: 1, borderWidth: 1, borderColor: theme.theme.textSecondary + '40', borderRadius: 0, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: theme.theme.text }}
                    />
                    <Pressable onPress={handleAdd} style={{ backgroundColor: theme.theme.primary, borderRadius: 0, paddingHorizontal: 14, justifyContent: 'center' }}>
                        <Ionicons name="add-outline" size={20} color="white" />
                    </Pressable>
                </View>
            )}
            {!tags?.length ? (
                <ThemedText type="extraSmall" style={{ color: theme.theme.textSecondary, textAlign: 'center', paddingVertical: 20 }}>No tags</ThemedText>
            ) : (
                <ScrollView style={{ flex: 1, flexDirection: 'column' }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {tags.map((t) => (
                            <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.theme.primary + '15', borderRadius: 0, paddingVertical: 5, paddingHorizontal: 12, gap: 6 }}>
                                <ThemedText type="extraSmall" style={{ color: theme.theme.primary }}>{t.message}</ThemedText>
                                {userId && (
                                    <Pressable onPress={() => deleteTag.mutate({ tagId: t.id!, userId })}>
                                        <Ionicons name="close-circle" size={16} color={theme.theme.primary} />
                                    </Pressable>
                                )}
                            </View>
                        ))}
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

function MetaDataTab({ file, theme, bodyHeight }: { file: FileDto; theme: ThemeContextType; bodyHeight: number }) {
    const { data: metaTemplates, isLoading } = useMetaDataTemplateDetail(file.templateId ?? null, !!file.templateId);
    const metaValues: Record<string, string> = {};
    if (file.metaJson) {
        try { Object.assign(metaValues, JSON.parse(file.metaJson)); } catch { }
    }

    if (!file.templateId) {
        return <ThemedText type="extraSmall" style={{ color: theme.theme.textSecondary, textAlign: 'center', paddingVertical: 30 }}>No metadata template assigned</ThemedText>;
    }

    if (isLoading) {
        return <View style={{ height: bodyHeight, justifyContent: 'center', alignItems: 'center' }}><ThemedText type="extraSmall" style={{ color: theme.theme.textSecondary }}>Loading...</ThemedText></View>;
    }

    if (!metaTemplates?.length) {
        return <View style={{ height: bodyHeight, justifyContent: 'center', alignItems: 'center' }}><ThemedText type="extraSmall" style={{ color: theme.theme.textSecondary }}>No metadata</ThemedText></View>;
    }

    return (
        <ScrollView
            style={{ paddingHorizontal: 16, paddingBottom: 16, height: bodyHeight }}
        >
            {metaTemplates.map((mt) => (
                <View key={mt.id}>
                    <ThemedText type="smallBold" style={{ color: theme.theme.text, marginBottom: 8 }}>{mt.title}</ThemedText>
                    <View style={{ marginBottom: 12, padding: 10, backgroundColor: theme.theme.textSecondary + '0a', borderRadius: 8 }}>
                        <ThemedText type="extraExtraSmall" style={{ color: theme.theme.textSecondary }}>Description</ThemedText>
                        <ThemedText type="small" style={{ color: theme.theme.text, marginTop: 2 }}>{mt.description || '-'}</ThemedText>
                    </View>
                    {mt.metaDataAttributeDTOList?.map((attr) => (
                        <View key={attr.id} style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: theme.theme.textSecondary + '15' }}>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <ThemedText type="extraExtraSmall" style={{ color: theme.theme.textSecondary }}>{attr.name}</ThemedText>
                                    <ThemedText type="extraExtraSmall" style={{ color: theme.theme.textSecondary + '60' }}>({attr.type})</ThemedText>
                                </View>
                                <ThemedText type="small" style={{ color: theme.theme.text, marginTop: 2 }}>{metaValues[attr.name] || attr.description || '-'}</ThemedText>
                            </View>
                        </View>
                    ))}
                </View>
            ))}
        </ScrollView>
    );
}

function WorkflowTab({ file, theme, bodyHeight }: { file: FileDto; theme: ThemeContextType; bodyHeight: number }) {
    const { data: workflows, isLoading } = useWorkflowList(file.id!);

    if (isLoading) {
        return <View style={{ height: bodyHeight, justifyContent: 'center', alignItems: 'center' }}><ThemedText type="extraSmall" style={{ color: theme.theme.textSecondary }}>Loading...</ThemedText></View>;
    }

    if (!workflows?.length) {
        return <View style={{ height: bodyHeight, justifyContent: 'center', alignItems: 'center' }}><ThemedText type="extraSmall" style={{ color: theme.theme.textSecondary }}>No workflow history</ThemedText></View>;
    }

    return (
        <ScrollView style={{ paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 16, height: bodyHeight }}>
            {workflows.map((w, i) => (
                <View key={w.id ?? i} style={{ paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: theme.theme.textSecondary + '15' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Ionicons name="git-branch-outline" size={16} color={theme.theme.primary} />
                        <ThemedText type="smallBold" style={{ color: theme.theme.text, flex: 1 }}>{w.wfName}</ThemedText>
                        <View style={{ backgroundColor: w.status === 'Completed' ? '#22c55e20' : '#f59e0b20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                            <ThemedText type="extraExtraSmallBold" style={{ color: w.status === 'Completed' ? '#22c55e' : '#f59e0b' }}>{w.status}</ThemedText>
                        </View>
                    </View>
                    <ThemedText type="extraExtraSmall" style={{ color: theme.theme.textSecondary }}>Level: {w.wfLevel}</ThemedText>
                    {w.remarks && <ThemedText type="extraExtraSmall" style={{ color: theme.theme.textSecondary, marginTop: 2 }}>{w.remarks}</ThemedText>}
                </View>
            ))}
        </ScrollView>
    );
}

export function FilePropertiesModal({ visible, file, userId, theme, onClose, allowedTabs }: FilePropertiesModalProps) {
    const tabs = allowedTabs ? TABS.filter(t => allowedTabs.includes(t.key)) : TABS;
    const [activeTab, setActiveTab] = useState<Tab>(tabs[0]?.key || 'properties');
    const [tabScrollX, setTabScrollX] = useState(0);
    const [tabScrollW, setTabScrollW] = useState(0);
    const [tabVisibleW, setTabVisibleW] = useState(0);
    const screenHeight = Dimensions.get('window').height;
    const modalHeight = screenHeight * 0.7;
    const bodyHeight = modalHeight - 53 - 44;

    if (!file) return null;

    const renderTab = () => {
        switch (activeTab) {
            case 'properties': return <PropertiesTab file={file} theme={theme} bodyHeight={bodyHeight} />;
            case 'comments': return <CommentsTab file={file} userId={userId} theme={theme} bodyHeight={bodyHeight} />;
            case 'sharing': return <SharingTab file={file} theme={theme} bodyHeight={bodyHeight} />;
            case 'tags': return <TagsTab file={file} userId={userId} theme={theme} bodyHeight={bodyHeight} />;
            case 'metadata': return <MetaDataTab file={file} theme={theme} bodyHeight={bodyHeight} />;
            case 'workflow': return <WorkflowTab file={file} theme={theme} bodyHeight={bodyHeight} />;
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <View style={{ flex: 1 }}>
                <Pressable onPress={onClose} style={StyleSheet.absoluteFill}>
                    <View style={{ flex: 1, backgroundColor: '#00000060' }} />
                </Pressable>
                <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
                    <View style={{ width: '88%', height: modalHeight, backgroundColor: theme.theme.background, borderRadius: 16, overflow: 'hidden' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: theme.theme.textSecondary + '30' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name={tabs.find(t => t.key === activeTab)?.icon || 'information-circle-outline'} size={20} color={theme.theme.primary} />
                                <ThemedText type="mediumBold">{tabs.find(t => t.key === activeTab)?.label || 'Properties'}</ThemedText>
                            </View>
                            <Pressable onPress={onClose}><Ionicons name="close-outline" size={22} color={theme.theme.textSecondary} /></Pressable>
                        </View>

                        <View style={{ height: 44 }}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} onScroll={(e) => setTabScrollX(e.nativeEvent.contentOffset.x)} onContentSizeChange={(w) => setTabScrollW(w)} onLayout={(e) => setTabVisibleW(e.nativeEvent.layout.width)} scrollEventThrottle={16} style={{ borderBottomWidth: 0.5, borderBottomColor: theme.theme.textSecondary + '15' }}>
                                {tabs.map((tab) => (
                                    <Pressable
                                        key={tab.key}
                                        onPress={() => setActiveTab(tab.key)}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 4,
                                            paddingHorizontal: 14,
                                            borderBottomWidth: 2,
                                            borderBottomColor: activeTab === tab.key ? theme.theme.primary : 'transparent',
                                        }}
                                    >
                                        <Ionicons name={tab.icon} size={15} color={activeTab === tab.key ? theme.theme.primary : theme.theme.textSecondary} />
                                        <ThemedText type="extraExtraSmallBold" style={{ color: activeTab === tab.key ? theme.theme.primary : theme.theme.textSecondary }}>{tab.label}</ThemedText>
                                    </Pressable>
                                ))}
                            </ScrollView>
                            {tabScrollW > tabVisibleW + 5 && tabScrollX + tabVisibleW < tabScrollW - 5 && (
                                <View pointerEvents="none" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 32, justifyContent: 'center', alignItems: 'flex-end', backgroundColor: theme.theme.background + 'cc' }}>
                                    <Ionicons name="chevron-forward" size={14} color={theme.theme.textSecondary} />
                                </View>
                            )}
                        </View>

                        {renderTab()}
                    </View>
                </View>
            </View>
        </Modal>
    );
}