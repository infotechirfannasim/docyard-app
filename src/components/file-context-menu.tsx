import { ThemeContextType } from "@/context/theme-provider";
import { Modal, Pressable, View } from "react-native";
import ModelDropDownItem, { ModelDropDownItemProps } from "./modal-dropdown-item";

type FileContextMenuProps = {
    visible: boolean;
    position: { x: number; y: number };
    flipped: boolean;
    screenHeight: number;
    menuItems: ModelDropDownItemProps[];
    theme: ThemeContextType;
    onDismiss: () => void;
};

export function FileContextMenu({ visible, position, flipped, screenHeight, menuItems, theme, onDismiss }: FileContextMenuProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onDismiss}
        >
            <Pressable style={{ flex: 1 }} onPress={onDismiss}>
                <View
                    style={{
                        position: "absolute",
                        ...(flipped
                            ? { bottom: screenHeight - position.y }
                            : { top: position.y }),
                        right: position.x,
                        backgroundColor: theme.theme.background,
                        borderColor: theme.theme.text + "20",
                        paddingVertical: 2,
                        minWidth: 140,
                        elevation: 6,
                    }}
                >
                    {menuItems.map((menuItem) => (
                        <ModelDropDownItem
                            key={menuItem.itemKey}
                            itemKey={menuItem.itemKey}
                            text={menuItem.text}
                            iconName={menuItem.iconName}
                            onPress={menuItem.onPress}
                            theme={theme}
                            visible={menuItem.visible}
                        />
                    ))}
                </View>
            </Pressable>
        </Modal>
    );
}
