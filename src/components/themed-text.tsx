import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { useTheme } from '@/context/theme-provider';
import { ThemeColor } from '../constants/theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'extraSmall' | 'extraSmallBold' | 'extraExtraSmall' | 'extraExtraSmallBold' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code' | 'medium' | 'large' | 'mediumBold' | 'largeBold' | 'extraLarge' | 'extraLargeBold'  ;
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, children, ...rest }: ThemedTextProps): import("react").JSX.Element {
  const { theme } = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'extraSmall' && styles.extraSmall,
        type === 'extraSmallBold' && styles.extraSmallBold,
         type === 'extraExtraSmall' && styles.extraExtraSmall,
        type === 'extraExtraSmallBold' && styles.extraExtraSmallBold,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        type === 'medium' && styles.medium,
        type === 'large' && styles.large,
        type === 'mediumBold' && styles.mediumBold,
        type === 'largeBold' && styles.largeBold,
        type === 'extraLarge' && styles.extraLarge,
        type === 'extraLargeBold' && styles.extraLargeBold,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  extraSmall: {
    fontSize: 12,
    // lineHeight: 30,
    fontWeight: 300,
  },
  extraSmallBold: {
    fontSize: 12,
    // lineHeight: 30,
    fontWeight: 500,
  },
   extraExtraSmall: {
    fontSize: 11,
    // lineHeight: 30,
    fontWeight: 300,
  },
  extraExtraSmallBold: {
    fontSize: 11,
    // lineHeight: 30,
    fontWeight: 500,
  },
  small: {
    fontSize: 14,
    // lineHeight: 30,
    fontWeight: 300,
  },
   medium: {
    fontSize: 16,
    // lineHeight: 24,
    fontWeight: 300,
  },
  
   mediumBold: {
    fontSize: 16,
    // lineHeight: 24,
    fontWeight: 600,
  },
   large: {
    fontSize: 18,
    // lineHeight: 26,
    fontWeight: 300,
  },
  
   largeBold: {
    fontSize: 18,
    // lineHeight: 26,
    fontWeight: 600,
  },
    extraLarge: {
    fontSize: 22,
    // lineHeight: 30,
    fontWeight: 400,
  },
  
   extraLargeBold: {
    fontSize: 22,
    // lineHeight: 30,
    fontWeight: 600,
  },
  smallBold: {
    fontSize: 14,
    // lineHeight: 20,
    fontWeight: 700,
  },
  default: {
    fontSize: 16,
    // lineHeight: 24,
    fontWeight: 500,
  },
  title: {
    fontSize: 48,
    fontWeight: 600,
    // lineHeight: 52,
  },
  subtitle: {
    fontSize: 32,
    // lineHeight: 44,
    fontWeight: 600,
  },
  link: {
    // lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    // lineHeight: 30,
    fontSize: 14,
    color: '#3c87f7',
  },
  code: {
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
