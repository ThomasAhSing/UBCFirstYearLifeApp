import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  owner: "ahsingthomas",
  name: "FirstYearLife",
  slug: "firstyearlife",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/ubcfyla_app_icon.png",
  scheme: "firstyearlife",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,

  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.ahsingthomas.firstyearlife",
    buildNumber: "3",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false
    }
  },

  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/ubcfyla_app_icon.png",
      backgroundColor: "#0C2A42"
    },
    edgeToEdgeEnabled: true,
    package: "com.ahsingthomas.firstyearlife",
    versionCode: 1 
  },

  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/ubcfyla_app_icon.png"
  },

  plugins: [
    "expo-notifications",
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/ubcfyla_splashscreen.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#0C2A42"
      }
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "The app accesses photos to let admin upload photos for posts. ADMIN USE ONLY. Permission to access photos will not be asked to user"
      }
    ],
    "expo-font",
    "expo-web-browser"
  ],

  experiments: {
    typedRoutes: true
  },

  extra: {
    eas: {
      projectId: "a4c5d400-288e-447f-9133-7065f74f1ef6"
    },
  }
});
