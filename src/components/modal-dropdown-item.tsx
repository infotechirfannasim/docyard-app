import { ThemeContextType } from "@/context/theme-provider";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { ThemedText } from "./themed-text";

export type ModelDropDownItemProps = {
    itemKey: string;
    onPress: () => void; // Optional prop for the selected file
    text: string;
    iconName: keyof typeof Ionicons.glyphMap;
    theme: ThemeContextType; // Optional prop for the selected file
    visible?: boolean;
    // isHidden?: boolean;
};

export default function ModelDropDownItem({ itemKey, onPress, iconName, text, theme, visible }: ModelDropDownItemProps) {

    if(!visible) return null;
        return <Pressable
        key={itemKey}
            onPress={onPress }
            style={{ padding: 10 }}
            android_ripple={{ color: theme.theme.text + "20" }}
        ><View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>

                <Ionicons name={iconName} size={20} color={theme.theme.modalDropDownIconColor} style={text === "Restore" ? {  transform: [{ rotate: "1200deg" }, { rotateX: "180deg" }]} : undefined } />
                <ThemedText type="small">{text}</ThemedText>
            </View>
        </Pressable>;
    }