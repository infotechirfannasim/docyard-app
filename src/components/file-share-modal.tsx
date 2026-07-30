import { useAuth } from "@/context/auth-context";
import { ThemeContextType } from "@/context/theme-provider";
import { useCreateShare, useDeleteShare, useDepartments, useSharedUserData } from "@/hooks/queries/use-files";
import { useAllUsers } from "@/hooks/queries/use-user";
import { SharePayloadDto, SharePermission, ShareType } from "@/types/api/file-dto";
import { UserDto } from "@/types/api/user-dto";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Buffer } from "buffer";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Keyboard, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";
import ThemedTextInput from "./themed-text-input";
import { ThemedView } from "./themed-view";

type FileShareModalProps = {
    visible: boolean;
    fileId: number;
    fileName: string;
    versionGUId?: string | null;
    isFolder: boolean;
    theme: ThemeContextType;
    showToast: (message: string, type?: 'success' | 'error') => void;
    onClose: () => void;
    onManageAccess?: () => void;
};

const PERMISSIONS = ['VIEW', 'EDITOR', 'COMMENT', 'TAG'] as const;

export function FileShareModal({ visible, fileId, fileName, versionGUId, isFolder, theme, showToast, onClose, onManageAccess }: FileShareModalProps) {
    const { username, user: currentUser } = useAuth();
    const { data: departments = [], isLoading: deptLoading } = useDepartments(visible);
    const { data: allUsers = [], isLoading: usersLoading } = useAllUsers(visible);
    const { data: existingShares } = useSharedUserData(fileId, visible);
    const shareMutation = useCreateShare();
    const deleteShareMutation = useDeleteShare();

    const [shareType, setShareType] = useState<ShareType>('ANYONE');
    const [selectedPermission, setSelectedPermission] = useState<string>('VIEW');
    const [selectedDeptIds, setSelectedDeptIds] = useState<number[]>([]);
    const [collaboratorSearch, setCollaboratorSearch] = useState('');
    const [selectedCollaborators, setSelectedCollaborators] = useState<{ userId: number; name: string; email: string }[]>([]);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [createLink, setCreateLink] = useState(false);
    const [linkExpiry, setLinkExpiry] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        const hideSub = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
        });
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    useEffect(() => {
        if (!visible) {
            setShareType('ANYONE');
            setSelectedPermission('VIEW');
            setSelectedDeptIds([]);
            setCollaboratorSearch('');
            setSelectedCollaborators([]);
            setPassword('');
            setConfirmPassword('');
            setCreateLink(false);
            setLinkExpiry(null);
            setShowDatePicker(false);
            setKeyboardHeight(0);
        }
    }, [visible]);

    const filteredUsers = useMemo(() => {
        if (!collaboratorSearch.trim()) return [];
        const q = collaboratorSearch.toLowerCase();
        return allUsers.filter(u =>
            (u.name?.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)) &&
            !selectedCollaborators.find(c => c.userId === u.id)
        ).slice(0, 10);
    }, [collaboratorSearch, allUsers, selectedCollaborators]);

    const toggleDepartment = (id: number) => {
        setSelectedDeptIds(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
    };

    const addCollaborator = (user: UserDto) => {
        if (selectedCollaborators.find(c => c.userId === user.id)) return;
        setSelectedCollaborators(prev => [...prev, { userId: user.id!, name: user.name || user.username, email: user.email }]);
        setCollaboratorSearch('');
    };

    const removeCollaborator = (userId: number) => {
        setSelectedCollaborators(prev => prev.filter(c => c.userId !== userId));
    };

    const generatePublicURL = () => {
        const origin = process.env.EXPO_PUBLIC_URL || '';
        let url: string;
        if (isFolder) {
            url = `${origin}/share/folder?id=${Buffer.from(String(fileId)).toString('base64')}&name=${Buffer.from(fileName).toString('base64')}&shareType=${Buffer.from('ANYONE').toString('base64')}`;
        } else {
            url = `${origin}/share/document-view?guid=${versionGUId || ''}&fromFolderShared=false&shareType=${Buffer.from('ANYONE').toString('base64')}`;
        }
        console.log('[ShareModal] generatePublicURL:', url);
        return url;
    };

    const handleShare = () => {
        console.log(`Collaborators: ${selectedCollaborators.length}`);
        if (!isAnyone && (selectedDeptIds.length === 0 && selectedCollaborators.length === 0)) {
            Alert.alert('Validation', 'Please select at least one department or add a collaborator for specific access.');
            return;
        }
        if (isAnyone && !createLink) {
            Alert.alert('Validation', 'Please create a shared link for anyone access.');
            return;
        }
        if (password && password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        var collabrators = selectedCollaborators.map(c => c.email);
        existingShares?.forEach(s => {
            if (!collabrators.includes(s.dlCollEmail)) {
                collabrators.push(s.dlCollEmail);
            }
        });
        console.log('[ShareModal] handleShare: collabrators:', collabrators);
        console.log(`Exisiting collaborators: ${existingShares?.map(s => s.dlCollEmail).join(',')}`);

        const payload: SharePayloadDto = {
            appContextPath: process.env.EXPO_PUBLIC_URL!,
            password: password || null,
            confirmPassword: confirmPassword || null,
            departmentIds: selectedDeptIds,
            dlCollaborators: collabrators,
            dlDocId: fileId,
            folder: isFolder,
            linkExpiredOn: linkExpiry?.toISOString() ?? null,
            shareLink: createLink ? generatePublicURL() : '',
            sharePermission: selectedPermission as SharePermission,
            shareType,
            userId: currentUser?.id ? String(currentUser.id) : '',
        };

        shareMutation.mutate(payload, {
            onSuccess: () => {
                showToast(`"${fileName}" shared successfully`);
                onClose();
            },
            onError: (error: any) => {
                showToast(error?.response?.data?.message || error?.message || 'Failed to share', 'error');
            },
        });
    };

    const handleRemoveShare = () => {
        Alert.alert(
            'Remove Sharing',
            `Are you sure you want to remove sharing for "${fileName}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        const payload: SharePayloadDto = {
                            appContextPath: '',
                            confirmPassword: '',
                            departmentIds: [],
                            dlCollaborators: [],
                            dlDocId: fileId,
                            externalUserShareLink: '',
                            folder: isFolder,
                            linkExpiredOn: null,
                            message: '',
                            password: '',
                            shareLink: '',
                            sharePermission: '' as SharePermission,
                            shareType: 'NO_SHARING' as ShareType,
                            userId: String(currentUser?.id ?? ''),
                        };
                        deleteShareMutation.mutate(payload, {
                            onSuccess: () => {
                                showToast(`Sharing removed for "${fileName}"`, 'success');
                                onClose();
                            },
                            onError: (error: any) => {
                                showToast(error?.response?.data?.message || error?.message || 'Failed to remove sharing', 'error');
                            },
                        });
                    },
                },
            ]
        );
    };

    const isAnyone = shareType === 'ANYONE';

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={shareMutation.isPending ? undefined : onClose}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000060', paddingBottom: keyboardHeight }}>
                <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={shareMutation.isPending ? undefined : onClose} />
                <ThemedView style={{ width: 380, maxHeight: '85%', borderRadius: 16, padding: 20, gap: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Ionicons name="share-outline" size={22} color={theme.theme.primary} />
                        <ThemedText type="mediumBold" style={{ flex: 1 }}>Share {fileName}</ThemedText>
                        <Pressable onPress={onClose}><Ionicons name="close" size={22} color={theme.theme.text + '80'} /></Pressable>
                    </View>

                    <ScrollView style={{ maxHeight: 500 }} keyboardShouldPersistTaps="handled">
                        <View style={{ gap: 14 }}>
                            {/* General Access */}
                            <View style={{ gap: 6 }}>
                                <ThemedText type="extraSmallBold" style={{ color: theme.theme.text + '80' }}>General Access</ThemedText>
                                <View style={{ flexDirection: 'row', borderRadius: 0, borderWidth: 1, borderColor: theme.theme.text + '20', overflow: 'hidden' }}>
                                    {(['ANYONE', 'RESTRICTED'] as ShareType[]).map(type => (
                                        <Pressable
                                            key={type}
                                            onPress={() => setShareType(type)}
                                            style={{
                                                flex: 1, paddingVertical: 10, alignItems: 'center',
                                                backgroundColor: shareType === type ? theme.theme.primary : 'transparent',
                                            }}
                                        >
                                            <ThemedText type="small" style={{ color: shareType === type ? 'white' : theme.theme.text + '99' }}>
                                                {type === 'RESTRICTED' ? 'Specific' : 'Anyone with the link'}
                                            </ThemedText>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>

                            {/* Permissions - only when Specific */}
                            {!isAnyone && (
                                <View style={{ gap: 6 }}>
                                    <ThemedText type="extraSmallBold" style={{ color: theme.theme.text + '80' }}>Permissions</ThemedText>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                        {PERMISSIONS.map(perm => (
                                            <Pressable
                                                key={perm}
                                                onPress={() => setSelectedPermission(perm)}
                                                style={{
                                                    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 0,
                                                    borderWidth: 1, borderColor: selectedPermission === perm ? theme.theme.primary : theme.theme.text + '20',
                                                    backgroundColor: selectedPermission === perm ? theme.theme.primary + '15' : 'transparent',
                                                }}
                                            >
                                                <ThemedText type="small" style={{ color: selectedPermission === perm ? theme.theme.primary : theme.theme.text + '99' }}>
                                                    {perm.charAt(0) + perm.slice(1).toLowerCase()}
                                                </ThemedText>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Departments - only when Specific */}
                            {!isAnyone && (
                                <View style={{ gap: 6 }}>
                                    <ThemedText type="extraSmallBold" style={{ color: theme.theme.text + '80' }}>Departments</ThemedText>
                                    {deptLoading ? (
                                        <ActivityIndicator size="small" />
                                    ) : departments.length === 0 ? (
                                        <ThemedText type="small" style={{ color: theme.theme.text + '60' }}>No departments available</ThemedText>
                                    ) : (
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                                            {departments.map(dept => {
                                                const selected = selectedDeptIds.includes(dept.id!);
                                                return (
                                                    <Pressable
                                                        key={dept.id}
                                                        onPress={() => toggleDepartment(dept.id!)}
                                                        style={{
                                                            paddingHorizontal: 12, paddingVertical: 6, borderRadius: 0,
                                                            borderWidth: 1, borderColor: selected ? theme.theme.primary : theme.theme.text + '20',
                                                            backgroundColor: selected ? theme.theme.primary + '15' : 'transparent',
                                                        }}
                                                    >
                                                        <ThemedText type="small" style={{ color: selected ? theme.theme.primary : theme.theme.text + '99' }}>
                                                            {dept.name}
                                                        </ThemedText>
                                                    </Pressable>
                                                );
                                            })}
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Collaborators - only when Specific */}
                            {!isAnyone && (
                                <View style={{ gap: 6 }}>
                                    <ThemedText type="extraSmallBold" style={{ color: theme.theme.text + '80' }}>Add Collaborators</ThemedText>
                                    <TextInput
                                        placeholder="Search users..."
                                        placeholderTextColor={theme.theme.text + '60'}
                                        value={collaboratorSearch}
                                        onChangeText={setCollaboratorSearch}
                                        style={{
                                            padding: 10, borderRadius: 0, borderWidth: 1, borderColor: theme.theme.text + '20',
                                            color: theme.theme.text, fontSize: 14,
                                        }}
                                    />
                                    {filteredUsers.length > 0 && (
                                        <View style={{ borderWidth: 1, borderColor: theme.theme.text + '15', borderRadius: 0, maxHeight: 150 }}>
                                            <ScrollView keyboardShouldPersistTaps="handled">
                                                {filteredUsers.map(user => (
                                                    <Pressable
                                                        key={user.id}
                                                        onPress={() => addCollaborator(user)}
                                                        style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: theme.theme.text + '10' }}
                                                    >
                                                        <ThemedText type="small">{user.name || user.username}</ThemedText>
                                                        <ThemedText type="extraSmall" style={{ color: theme.theme.text + '60' }}>{user.email}</ThemedText>
                                                    </Pressable>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    )}
                                    {selectedCollaborators.length > 0 && (
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                                            {selectedCollaborators.map(c => (
                                                <View key={c.userId} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 0, borderWidth: 1, borderColor: theme.theme.text + '20' }}>
                                                    <ThemedText type="small">{c.name}</ThemedText>
                                                    <Pressable onPress={() => removeCollaborator(c.userId)}>
                                                        <Ionicons name="close-circle" size={16} color={theme.theme.text + '60'} />
                                                    </Pressable>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Remove Sharing */}
                            {existingShares && existingShares.length > 0 && (
                                <View style={{ gap: 8, borderTopWidth: 1, borderTopColor: theme.theme.text + '15', paddingTop: 12 }}>
                                    <ThemedText type="extraSmallBold" style={{ color: theme.theme.danger }}>
                                        This file is currently shared
                                    </ThemedText>
                                    
                                    <Pressable
                                        onPress={handleRemoveShare}
                                        disabled={deleteShareMutation.isPending}
                                        style={{
                                            paddingVertical: 10, borderRadius: 0, borderWidth: 1,
                                            borderColor: theme.theme.danger,
                                            alignItems: 'center',
                                            opacity: deleteShareMutation.isPending ? 0.6 : 1,
                                        }}
                                    >
                                        {deleteShareMutation.isPending ? (
                                            <ActivityIndicator size="small" color={theme.theme.danger} />
                                        ) : (
                                            <ThemedText type="mediumBold" style={{ color: theme.theme.danger }}>
                                                Remove Sharing
                                            </ThemedText>
                                        )}
                                    </Pressable>
                                </View>
                            )}

                            {/* Password */}
                            <View style={{ gap: 8 }}>
                                <ThemedText type="extraSmallBold" style={{ color: theme.theme.text + '60' }}>Password (optional)</ThemedText>
                                <ThemedTextInput
                                    isPassword={true}
                                    placeholder="Password"
                                    placeholderTextColor={theme.theme.text + '60'}
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                    style={{ padding: 10, borderRadius: 0, borderWidth: 1, borderColor: theme.theme.text + '20', color: theme.theme.text, fontSize: 14 }}
                                />
                                <ThemedTextInput
                                    isPassword={true}
                                    placeholder="Confirm password"
                                    placeholderTextColor={theme.theme.text + '60'}
                                    secureTextEntry
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    style={{ padding: 10, borderRadius: 0, borderWidth: 1, borderColor: theme.theme.text + '20', color: theme.theme.text, fontSize: 14 }}
                                />
                            </View>

                            {/* Create Shared Link - only when Anyone */}
                            {isAnyone && (
                                <View style={{ gap: 8 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <ThemedText type="smallBold">Create shared link</ThemedText>
                                        <Pressable
                                            onPress={() => setCreateLink(!createLink)}
                                            style={{
                                                width: 44, height: 24, borderRadius: 20,
                                                backgroundColor: createLink ? theme.theme.primary : theme.theme.text + '20',
                                                padding: 2, justifyContent: 'center',
                                            }}
                                        >
                                            <View style={{
                                                width: 20, height: 20, borderRadius: 20, backgroundColor: 'white',
                                                alignSelf: createLink ? 'flex-end' : 'flex-start',
                                            }} />
                                        </Pressable>
                                    </View>
                                    {createLink && (
                                        <>
                                            <Pressable onPress={() => setShowDatePicker(true)} style={{ padding: 10, borderRadius: 0, borderWidth: 1, borderColor: theme.theme.text + '20' }}>
                                                <ThemedText type="small" style={{ color: linkExpiry ? theme.theme.text : theme.theme.text + '60' }}>
                                                    {linkExpiry ? linkExpiry.toLocaleDateString() : 'Link expiry date'}
                                                </ThemedText>
                                            </Pressable>
                                            {showDatePicker && (
                                                <DateTimePicker
                                                    value={linkExpiry ?? new Date()}
                                                    mode="date"
                                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                                    onChange={(_event: any, date?: Date) => {
                                                        setShowDatePicker(false);
                                                        if (date) setLinkExpiry(date);
                                                    }}
                                                />
                                            )}
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 0, borderWidth: 1, borderColor: theme.theme.text + '15', backgroundColor: theme.theme.text + '05' }}>
                                                <ThemedText type="small" style={{ flex: 1, color: theme.theme.text + '60' }} numberOfLines={4} selectable>
                                                    {generatePublicURL()}
                                                </ThemedText>
                                            </View>
                                        </>
                                    )}
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    {showDatePicker && Platform.OS === 'ios' && (
                        <DateTimePicker
                            value={linkExpiry ?? new Date()}
                            mode="date"
                            display="spinner"
                            onChange={(_event: any, date?: Date) => {
                                setShowDatePicker(false);
                                if (date) setLinkExpiry(date);
                            }}
                        />
                    )}

                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                        <Pressable
                            onPress={() => {
                                onClose();
                                onManageAccess?.();
                            }}
                            style={{ flex: 1, paddingVertical: 11, borderRadius: 0, borderWidth: 1, borderColor: theme.theme.text + '20', alignItems: 'center' }}
                        >
                            <ThemedText type="medium" style={{ color: theme.theme.text + '99' }}>Manage Access</ThemedText>
                        </Pressable>
                        <Pressable
                            onPress={handleShare}
                            disabled={shareMutation.isPending}
                            style={{
                                flex: 1, paddingVertical: 11, borderRadius: 0,
                                backgroundColor: shareMutation.isPending ? theme.theme.text + '20' : theme.theme.primary,
                                alignItems: 'center',
                            }}
                        >
                            {shareMutation.isPending ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <ThemedText type="mediumBold" style={{ color: 'white' }}>Share</ThemedText>
                            )}
                        </Pressable>
                    </View>
                </ThemedView>
            </View>
        </Modal>
    );
}