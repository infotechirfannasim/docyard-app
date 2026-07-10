import { ThemeContextType } from "@/context/theme-provider";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { ThemedText } from "./themed-text";

type ModelDropDownItemProps = {
    onPress: ()=>void; // Optional prop for the selected file
    text: string;
    iconName: keyof typeof Ionicons.glyphMap;
    theme: ThemeContextType; // Optional prop for the selected file
    // isHidden?: boolean;
};

export default function ModelDropDownItem({ onPress, iconName, text, theme }: ModelDropDownItemProps) {
        return <Pressable
            onPress={onPress }
            style={{ padding: 10 }}
            android_ripple={{ color: theme.theme.text + "20" }}
        ><View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>

                <Ionicons name={iconName} size={20} color={theme.theme.modalDropDownIconColor} />
                <ThemedText type="small">{text}</ThemedText>
            </View>
        </Pressable>;
    }