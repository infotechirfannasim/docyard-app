import { ThemedText } from '@/components/themed-text';
import ThemedTextInput from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/context/theme-provider';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function Profile() {
    const theme = useTheme();
    const [isShowModal, setIsShowModal] = useState(false);
    const [image, setImage] = useState<string | null>(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            allowsMultipleSelection: false,
            aspect: [4, 4],
            quality: 1,
        });
        console.log(result);

        if (!result.canceled) {
            setImage(result.assets[0].uri);
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
                            <Image style={styles.profileImage} source={{ uri: image ? image : "https://picsum.photos/seed/696/3000/2000" }}></Image>
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

                            <ThemedText style={styles.name} type={'largeBold'}>Irfan Nasim</ThemedText>
                            <ThemedText style={styles.email} type={'medium'}>irfan.nasim@example.com</ThemedText>
                        </View>

                        <ThemedView style={[styles.profileFields, { backgroundColor: theme.theme.backgroundElement  }]}>
                            <ProfileItem style={{ borderColor: theme.theme.text + "40" }} itemKey="Group Name" itemValue="Management" />
                            <ProfileItem style={{ borderColor: theme.theme.text + "40" }} itemKey="Username" itemValue="irfan.nasim" />
                            <ProfileItem style={{ borderColor: theme.theme.text + "40" }} itemKey="Mobile Number" itemValue="" />
                            <ProfileItem style={{ borderColor: theme.theme.text + "40" }} itemKey="Status" itemValue="Active" />
                            <ProfileItem style={{ borderColor: theme.theme.text + "40" }} itemKey="Address" itemValue="123 Main St, Anytown, USA" />
                            <ProfileItem style={{ borderColor: theme.theme.text + "40" }} itemKey="Member Since" itemValue="January 2022" />
                        </ThemedView>

                        <Pressable style={[{ backgroundColor: theme.theme.primary, alignSelf: "flex-end", padding: 10, marginTop: 10 }]} onPress={() => setIsShowModal(true)}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                                <Ionicons name="key-outline" size={18} color={"white"} />
                                <ThemedText type={'smallBold'} style={{ color: "white" }}>
                                    Change Password
                                </ThemedText>
                            </View>
                        </Pressable>






                    </View>
                </ScrollView>
            </ThemedView>

            <Modal statusBarTranslucent transparent={true} visible={isShowModal} animationType="slide" onRequestClose={() => setIsShowModal(false)}>

                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', }}>
<Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={() => setIsShowModal(false)}></Pressable>

                    <View style={{ width: "80%", padding: 25, backgroundColor: theme.theme.backgroundElement, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                        <Pressable style={{ position: 'absolute', top: 15, right: 15, backgroundColor: theme.theme.backgroundSelected , borderRadius: 20, padding: 5 }} onPress={() => setIsShowModal(false)}>
                                    <Ionicons name="close-outline" size={25} color={theme.theme.text} />
                        </Pressable>
                        <ThemedText type={'largeBold'} style={{ marginBottom: 25 }}>Change Password</ThemedText>

                        <ChangePasswordModalItem placeHolder="Enter current password" heading="Current Password" />
                        <ChangePasswordModalItem placeHolder="Enter new password" heading="New Password" />
                        <ChangePasswordModalItem placeHolder="Confirm new password" heading="Confirm New Password" />
                        <View style={{ flexDirection: 'row', alignContent: "flex-end", justifyContent: "flex-end", width: "100%", gap: 10, marginTop: 10 }}>

                           
                            <ChangePasswordModalOptions style={{ backgroundColor: theme.theme.primary }} title="Update" onPress={() => setIsShowModal(false)} />
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

    function ChangePasswordModalItem({ placeHolder, heading }: { placeHolder: string, heading: string }) {
        return <View style={{ width: "100%", marginBottom: 15 }} >
            <ThemedText type={'small'} style={{ alignSelf: 'flex-start', marginBottom: 5 }}>{heading}<Text style={{ color: 'red' }}> *</Text></ThemedText>
            <ThemedTextInput isPassword={true} placeholder={placeHolder} secureTextEntry={true} style={{ flexGrow: 1, width: "100%", alignItems: "stretch", padding: 10 }} />
        </View>;
    }

    function ProfileItem({ style, itemKey, itemValue }: { style?: ViewStyle, itemKey: string; itemValue: string }) {
        return <View style={[styles.profileItem, style]} >
            <ThemedText type={'mediumBold'}>{itemKey}</ThemedText>
            <ThemedText type={'small'}>{itemValue}</ThemedText>
        </View>;
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
        marginBottom: 10,
    },
    email: {
        opacity: 0.7,
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