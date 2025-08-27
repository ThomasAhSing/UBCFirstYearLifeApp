/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
  background: '#0C2A42',
  goldAccent: '#FFB915',
  lineSeperator: '#173E63',
  tabBarColor: "#24303B",
  confessions: {
  PlaceVanier: {
    background: "#FFDAD5",
    accent: "#D65A4E"
  },
  TotemPark: {
    background: "#B0E9E3",
    accent: "#009688"
  },
  OrchardCommons: {
    background: "#E8DFFB",
    accent: "#7A5CA0"
  }
}
};
