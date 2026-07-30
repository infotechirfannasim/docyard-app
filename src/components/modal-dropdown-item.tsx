import { ThemeContextType } from "@/context/theme-provider";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageSourcePropType, Pressable, View } from "react-native";
import { ThemedText } from "./themed-text";

export type ModelDropDownItemProps = {
    itemKey: string;
    onPress: () => void;
    text: string;
    iconName: keyof typeof Ionicons.glyphMap;
    iconImage?: ImageSourcePropType;
    theme: ThemeContextType;
    visible?: boolean;
};

export default function ModelDropDownItem({ itemKey, onPress, iconName, iconImage, text, theme, visible }: ModelDropDownItemProps) {

    if(!visible) return null;
        return <Pressable
        key={itemKey}
            onPress={onPress }
            style={{ padding: 10, paddingRight: 20 , borderBottomWidth: 0.4, borderBottomColor: theme.theme.text + "20" }}
            android_ripple={{ color: theme.theme.text + "20" }}
        ><View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                {iconImage ? (
                    <Image source={iconImage} style={{ width: 16, height: 16, tintColor: theme.theme.modalDropDownIconColor }} />
                ) : (
                    <Ionicons name={iconName} size={16} color={theme.theme.modalDropDownIconColor} style={text === "Restore" ? {  transform: [{ rotate: "1200deg" }, { rotateX: "180deg" }]} :  text === "Upload Version" ? {  transform: [{ rotate: "180deg" }]} : undefined } />
                )}
                <ThemedText type="small">{text}</ThemedText>
            </View>
        </Pressable>;
    }