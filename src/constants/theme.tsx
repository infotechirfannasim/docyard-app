export const Colors = {
  light: {
    text: '#000000',
    background: '#f8fdff',
    primary: '#0d96c8',
    secondary: '#5fd4ff',
    backgroundElement: '#fbfeff',
    backgroundSelected: '#f6f6f6',
    textSecondary: '#60646C',
    progressIndicator: "#00000042",
    completedProgressIndicator: "#ffffffdd",
    drawerBackground: "#00629a",
    drawerActiveTintColor: "#7fdbff",
    drawerInactiveTintColor: "#d7e1e7",
    nativeTabBackground: "#f0f8fb",
    nativeTabIconColor: "#417689",
    nativeTabTintColor: '#006488',
    nativeTabIndicatorColor: '#b2eaff',
    cardItemGridColor: '#f9fdff',
    modalDropDownIconColor: "#417689",
    onSuccess: "#00d000",

    onError: "#f20000",

  },
  dark: {
    text: '#dedede',
    background: '#121212',
    primary: '#0d96c8',
    secondary: '#75daff',
    backgroundElement: '#161616',
    backgroundSelected: '#202124',
    textSecondary: '#B0B4BA',
    progressIndicator: "#00000042",
    completedProgressIndicator: "#ffffffdd",
    drawerBackground: "#141414",
    drawerActiveTintColor: "#00a5e6",
    drawerInactiveTintColor: "#b0b0b0",
    nativeTabBackground: "#171717",
    nativeTabIconColor: "#bfc6c9",
    nativeTabTintColor: '#daf5ff',
    nativeTabIndicatorColor: '#005371',
    cardItemGridColor: '#121a1d',
    modalDropDownIconColor: '#005371',
    onSuccess: "#00ae00",
    onError: "#a90000",


  },
} as const;


export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;