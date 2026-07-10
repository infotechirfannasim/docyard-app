import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/context/theme-provider';
import { View, ViewProps } from 'react-native';
export type ThemedViewProps = ViewProps & {
    themeColor? :ThemeColor
}

export function ThemedView ({ style, themeColor, ...rest}: ThemedViewProps) {

    const { theme } = useTheme();


    return <View  style={[{ backgroundColor: theme[themeColor ?? 'background'] }, style]} {...rest} />

}