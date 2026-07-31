import { ThemedText } from '@/components/themed-text';
import ThemedTextInput from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { encryptUsingAES256, useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-provider';
import { useToast } from '@/context/toast-context';
import { useChangePassword, useDocumentActivity, useUploadProfilePicture } from '@/hooks/queries/use-files';

import { Ionicons } from '@expo/vector-icons';

import { AxiosError } from 'axios';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function Profile() {
    const theme = useTheme();
    const listRef = useRef<FlatList>(null);
    const { username, user, isLoading, reloadUser } = useAuth();
    const [isShowModal, setIsShowModal] = useState(false);
    const [isShowActivity, setIsShowActivity] = useState(false);
    const [pwdError, setPwdError] = useState('');
    const currentPwdRef = useRef('');
    const newPwdRef = useRef('');
    const confirmPwdRef = useRef('');
    const { mutateAsync: changePwd, isPending: isChangingPwd } = useChangePassword();
    const { activities, isLoading: isActivityLoading, isLoadingMore, loadMore, reset } = useDocumentActivity(user?.id ?? 0, isShowActivity);
    const { mutateAsync: uploadProfilePic, isPending: isUploading } = useUploadProfilePicture();
    const { setToast } = useToast();
    const handleOpenActivity = () => {
        reset();
        setIsShowActivity(true);
    };



    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            allowsMultipleSelection: false,
            aspect: [4, 4],
            quality: 1,
        });

        if (!result.canceled && user?.id) {
            const dataUri = FileSystem.cacheDirectory + 'reqObj.json';
            await FileSystem.writeAsStringAsync(dataUri, JSON.stringify({ id: String(user.id) }));

            const formData = new FormData();
            formData.append('data', { uri: dataUri, type: 'application/json', name: 'blob' } as any);
            formData.append('profilePicture', {
                uri: result.assets[0].uri,
                type: 'image/png',
                name: 'pfp.png',
            } as any);
            await uploadProfilePic(formData);
            reloadUser();
        }
    };



    return (
        <>
            <ThemedView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                    alignItems: 'stretch',
                }}>
                    <View style={styles.content}>
                        <View>
                            <Image style={styles.profileImage} source={{ uri: user?.profilePhoto ? `data:image/png;base64,${user?.profilePhoto}` : "https://picsum.photos/seed/696/3000/2000" }}></Image>
                            {isUploading && (
                                <View style={{ position: 'absolute', top: 0, left: 0, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }}>
                                    <ActivityIndicator size="small" color="white" />
                                </View>
                            )}
                            <Pressable
                                style={[
                                    styles.iconStyle,
                                    {
                                        backgroundColor: theme.theme.background,
                                        borderColor: theme.theme.text + "40",
                                    }]}
                                onPress={pickImage}
                            >

                                <Ionicons name="person-outline" size={23} color={theme.theme.text} />
                            </Pressable>
                        </View>
                        <View style={styles.nameAndEmail}>

                            <ThemedText style={styles.name} type={'largeBold'}>{user?.name || "User"}</ThemedText>
                            <ThemedText style={styles.email} type={'medium'}>{user?.email || "user@example.com"}</ThemedText>
                        </View>

                        <ThemedView style={[styles.profileFields, { backgroundColor: theme.theme.backgroundElement }]}>
                            <ProfileItem style={{ borderColor: theme.theme.text + "40" }} itemKey="Group Name" itemValue={user?.groupName || "N/A"} />
                            <ProfileItem style={{ borderColor: theme.theme.text + "40" }} itemKey="Username" itemValue={user?.username || "N/A"} />
                            <ProfileItem style={{ borderColor: theme.theme.text + "40" }} itemKey="Mobile Number" itemValue={user?.mobileNumber || "N/A"} />
                            <ProfileItem style={{ borderColor: theme.theme.text + "40" }} itemKey="Status" itemValue={user?.status || "N/A"} />
                            <ProfileItem style={{ borderColor: theme.theme.text + "40" }} itemKey="Address" itemValue={user?.address || "N/A"} />
                            <ProfileItem style={{ borderColor: theme.theme.text + "40" }} itemKey="Member Since" itemValue={new Date(user?.createdOn!).toLocaleDateString() || "N/A"} />
                        </ThemedView>

                        <ThemedView style={[styles.profileFields, { backgroundColor: theme.theme.backgroundElement, marginTop: 16 }]}>
                            <ActionItem
                                icon="key-outline"
                                label="Change Password"
                                onPress={() => setIsShowModal(true)}
                                style={{ borderColor: theme.theme.text + "40" }}
                            />
                            <ActionItem
                                icon="document-text-outline"
                                label="View Activity"
                                onPress={handleOpenActivity}
                                style={{ borderColor: theme.theme.text + "40", borderBottomWidth: 0 }}
                            />
                        </ThemedView>






                    </View>
                </ScrollView>
            </ThemedView>

            <Modal statusBarTranslucent transparent={true} visible={isShowModal} animationType="slide" onRequestClose={() => setIsShowModal(false)}>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : 'height'} style={{ flex: 1 }}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', }}>
                        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={() => setIsShowModal(false)}></Pressable>

                        <View style={{ width: "90%", padding: 25, backgroundColor: theme.theme.backgroundElement, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                            <Pressable style={{ position: 'absolute', top: 15, right: 15, backgroundColor: theme.theme.backgroundSelected, borderRadius: 0, padding: 5 }} onPress={() => setIsShowModal(false)}>
                                <Ionicons name="close-outline" size={25} color={theme.theme.text} />
                            </Pressable>
                            <ThemedText type={'largeBold'} style={{ marginBottom: 25 }}>Change Password</ThemedText>

                            <ChangePasswordModalItem placeHolder="Enter current password" heading="Current Password" onChangeText={(t) => { currentPwdRef.current = t; setPwdError(''); }} />
                            <ChangePasswordModalItem placeHolder="Enter new password" heading="New Password" onChangeText={(t) => { newPwdRef.current = t; setPwdError(''); }} />
                            <ChangePasswordModalItem placeHolder="Confirm new password" heading="Confirm New Password" onChangeText={(t) => { confirmPwdRef.current = t; setPwdError(''); }} />
                            {pwdError ? (
                                <ThemedText type={'small'} style={{ color: 'red', alignSelf: 'flex-start', marginTop: 4 }}>{pwdError}</ThemedText>
                            ) : null}
                            <View style={{ flexDirection: 'row', alignContent: "flex-end", justifyContent: "flex-end", width: "100%", gap: 10, marginTop: 10 }}>
                                {isChangingPwd ? (
                                    <ActivityIndicator size="small" color={theme.theme.primary} />
                                ) : (
                                    <ChangePasswordModalOptions style={{ backgroundColor: theme.theme.primary }} title="Update" onPress={async () => {
                                        if (!currentPwdRef.current || !newPwdRef.current || !confirmPwdRef.current) {
                                            setPwdError('All fields are required');
                                            return;
                                        }
                                        if (newPwdRef.current !== confirmPwdRef.current) {
                                            setPwdError('New passwords do not match');
                                            return;
                                        }
                                        setPwdError('');
                                        try {
                                            await changePwd({ currentPassword: encryptUsingAES256(currentPwdRef.current), newPassword: encryptUsingAES256(newPwdRef.current), userId: user?.id ?? 0 });
                                            setPwdError('');
                                            setIsShowModal(false);
                                            setToast('Password changed successfully', 'success');
                                        } catch (err: any) {
                                            var error = err as AxiosError;
                                            console.log("Error changing password:", error.status, error.response?.data);
                                            setPwdError(error.response?.data ? (error.response.data as any).message : err?.message || 'Failed to change password');
                                        }
                                    }} />
                                )}
                            </View>




                        </View>
                    </View>
                </KeyboardAvoidingView>


            </Modal>

            <Modal statusBarTranslucent transparent={true} visible={isShowActivity} animationType="slide" onRequestClose={() => setIsShowActivity(false)}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={() => setIsShowActivity(false)} />
                    <View style={{ width: "90%", height: "80%", backgroundColor: theme.theme.backgroundElement, borderRadius: 10, overflow: 'hidden' }}>
                        <View style={{ flex: 1, padding: 25 }}>
                            <Pressable style={{ position: 'absolute', top: 15, right: 15, backgroundColor: theme.theme.backgroundSelected, borderRadius: 0, padding: 5 }} onPress={() => setIsShowActivity(false)}>
                                <Ionicons name="close-outline" size={25} color={theme.theme.text} />
                            </Pressable>
                            <ThemedText type={'largeBold'} style={{ marginBottom: 15 }}>Activity</ThemedText>
                            {isLoadingMore && (
                                <View style={{ position: 'absolute', bottom: 5, left: 0, right: 0, alignItems: 'center', backgroundColor: theme.theme.backgroundElement, paddingVertical: 5 }}>
                                    <ActivityIndicator size="small" color={theme.theme.primary} />
                                </View>
                            )}
                            {isActivityLoading ? (
                                <ActivityIndicator size="large" color={theme.theme.primary} style={{ marginVertical: 40 }} />
                            ) : (
                                <FlatList
                                    ref={listRef}
                                    style={{ flex: 1 }}
                                    data={activities}

                                    keyExtractor={(item, index) => `${item.id}-${index}`}
                                    renderItem={({ item }) => {
                                        console.log("Rendering activity item:", item);
                                        return (
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'flex-start',
                                                    paddingVertical: 14,
                                                    paddingHorizontal: 4,
                                                    borderBottomWidth: 0.5,
                                                    borderBottomColor: theme.theme.text + "15",
                                                }}
                                            >
                                                {/* Avatar */}
                                                <View
                                                    style={{
                                                        width: 38,
                                                        height: 38,
                                                        borderRadius: 19,
                                                        backgroundColor: theme.theme.primary + "20",
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        marginRight: 12,
                                                    }}
                                                >
                                                    <ThemedText type={'smallBold'} style={{ color: theme.theme.primary }}>
                                                        {item.userName?.charAt(0)?.toUpperCase()}
                                                    </ThemedText>
                                                </View>

                                                {/* Content */}
                                                <View style={{ flex: 1 }}>
                                                    <ThemedText type={'small'} style={{ lineHeight: 18 }}>
                                                        <ThemedText type={'smallBold'}>{item.userName}</ThemedText>
                                                        <ThemedText type={'small'} style={{ opacity: 0.7 }}>
                                                            {` ${item.action} `}
                                                        </ThemedText>
                                                        <ThemedText type={'smallBold'} style={{ color: theme.theme.primary }}>
                                                            {item.docName}
                                                        </ThemedText>

                                                        {(item.activityType === 'COPIED' || item.activityType === 'MOVED') && item.toFolderName ? (
                                                            <>
                                                                <ThemedText type={'small'} style={{ opacity: 0.7 }}>
                                                                    {' to '}
                                                                </ThemedText>
                                                                <ThemedText type={'smallBold'} style={{ color: theme.theme.primary }}>
                                                                    {item.toFolderName}
                                                                </ThemedText>
                                                            </>
                                                        ) : undefined}
                                                    </ThemedText>

                                                    <ThemedText
                                                        type={'small'}
                                                        style={{
                                                            textAlign: 'right',
                                                            opacity: 0.5,
                                                            marginTop: 6,
                                                            fontSize: 11,
                                                        }}
                                                    >
                                                        {item.activityPerformedOn}
                                                    </ThemedText>
                                                </View>
                                            </View>
                                        )
                                    }}
                                    onEndReached={loadMore}
                                    onEndReachedThreshold={0.1}

                                />
                            )}

                        </View>
                    </View>
                </View>
            </Modal>


        </>
    )

    function ChangePasswordModalOptions({ style, title, onPress }: { style: ViewStyle, title?: string, onPress?: () => void }) {
        return <Pressable style={[{ backgroundColor: theme.theme.primary, alignSelf: "flex-end", paddingHorizontal: 20, paddingVertical: 10 }, style]} onPress={onPress}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ThemedText type={'smallBold'} style={{ color: "white", letterSpacing: 1.5 }}>
                    {title}
                </ThemedText>
            </View>
        </Pressable>;
    }

    function ChangePasswordModalItem({ placeHolder, heading, onChangeText }: { placeHolder: string, heading: string, onChangeText: (text: string) => void }) {
        return <View style={{ width: "100%", marginBottom: 15 }} >
            <ThemedText type={'small'} style={{ alignSelf: 'flex-start', marginBottom: 5 }}>{heading}<Text style={{ color: 'red' }}> *</Text></ThemedText>
            <ThemedTextInput isPassword={true} placeholder={placeHolder} secureTextEntry={true} onChangeText={onChangeText} style={{ flexGrow: 1, width: "100%", alignItems: "stretch", padding: 10 }} />
        </View>;
    }

    function ProfileItem({ style, itemKey, itemValue }: { style?: ViewStyle, itemKey: string; itemValue: string }) {
        return <View style={[styles.profileItem, style]} >
            <ThemedText type={'mediumBold'}>{itemKey}</ThemedText>
            <ThemedText type={'small'}>{itemValue}</ThemedText>
        </View>;
    }

    function ActionItem({ icon, label, onPress, style }: { icon: any; label: string; onPress: () => void; style?: ViewStyle }) {
        return (
            <Pressable
                onPress={onPress}
                style={ [
                    styles.profileItem,
                    style,
                ]}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            backgroundColor: theme.theme.primary + "18",
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Ionicons name={icon} size={17} color={theme.theme.primary} />
                    </View>
                    <ThemedText type={'mediumBold'}>{label}</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.theme.text + "50"} />
            </Pressable>
        );
    }
}
const styles = StyleSheet.create({
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: "4%"
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
    },
    name: {
        marginBottom: 5,
    },
    email: {
        opacity: 0.5,
        marginBottom: 20,
    },
    editProfile: {
        position: 'absolute',
        top: 10,
        right: 20,
        alignSelf: 'flex-start',
        marginBottom: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    iconStyle: {
        position: 'absolute',
        top: -10,
        right: -10,
        borderRadius: 20,
        padding: 8,
        borderWidth: 0.5,
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)"
    },
    profileFields: {
        width: "100%",
        alignSelf: 'stretch',
        flexDirection: 'column',
        // gap: 20,
        paddingBottom: 15,
        paddingHorizontal: 10,
        boxShadow: "0px 0px 3px rgba(0, 0, 0, 0.1)"

    },
    profileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 15,
        borderBottomWidth: 0.5,
    },
    nameAndEmail: {
        alignItems: 'center',
        justifyContent: 'center'
    }
});