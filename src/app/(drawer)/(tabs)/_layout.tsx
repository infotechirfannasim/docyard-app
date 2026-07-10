import { useTheme } from '@/context/theme-provider';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
    const theme = useTheme();
    
  return (
    
    <NativeTabs rippleColor={"transparent"} backgroundColor={theme.theme.nativeTabBackground} tintColor={theme.theme.nativeTabTintColor} iconColor={theme.theme.nativeTabIconColor} indicatorColor={theme.theme.nativeTabIndicatorColor}  >
      <NativeTabs.Trigger name="home" >
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home_max" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="document-library" contentStyle={{ backgroundColor: theme.theme.background }}>
        <NativeTabs.Trigger.Icon sf="book" md="library_books" />
        <NativeTabs.Trigger.Label>Document Library</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="favourite">
        <NativeTabs.Trigger.Icon sf="star.fill" md="star_border" />
        <NativeTabs.Trigger.Label>Favourite</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="trash">
        <NativeTabs.Trigger.Icon sf="trash" md="delete" />
        <NativeTabs.Trigger.Label>Trash</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon sf="person" md="person" />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
