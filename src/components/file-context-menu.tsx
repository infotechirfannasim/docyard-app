import { ThemeContextType } from "@/context/theme-provider";
import { ScrollViewIndicator } from "@fanchenbao/react-native-scroll-indicator";
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
                        minWidth: 140,
                        elevation: 6,
                         maxHeight: 260
                    }}
                >
                    <ScrollViewIndicator indStyle={{backgroundColor : theme.theme.text + "20"}} {...(menuItems.length > 5 ? {scrollIndicatorContainerStyle: {height: 200}} : {})}>
                        {menuItems.map((menuItem) => (
                            <ModelDropDownItem
                                key={menuItem.itemKey}
                                itemKey={menuItem.itemKey}
                                text={menuItem.text}
                                iconName={menuItem.iconName}
                                iconImage={menuItem.iconImage}
                                onPress={menuItem.onPress}
                                theme={theme}
                                visible={menuItem.visible}
                            />
                        ))}
                    </ScrollViewIndicator>
                </View>
            </Pressable>
        </Modal>
    );
}
