import { useEffect } from "react";
import i18next, {defaultLanguage} from './components/i18next'
import { Platform, NativeModules, LogBox } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'expo-dev-client';

import Index from "./src";
import { UserProvider } from "./src/context/UserContext";
import { SavedCardsProvider } from "./src/context/SavedCardsContext";



export default function App() {
  LogBox.ignoreAllLogs();

  useEffect(() => {
    async function getUserLanguage() {
        const lang = await AsyncStorage.getItem('@language');
        return JSON.parse(lang);
    }

    getUserLanguage().then(language => {
        let deviceLanguage = language || defaultLanguage; 
        if (!deviceLanguage) {
            if (Platform.OS == 'ios') {
                deviceLanguage = NativeModules.SettingsManager.settings.AppleLocale || NativeModules.SettingsManager.settings.AppleLanguages[0];
            } else if (Platform.OS == 'android') {
                deviceLanguage = NativeModules.I18nManager.localeIdentifier;
            }
            deviceLanguage = deviceLanguage.split('_')[0];
      }
        i18next.changeLanguage(deviceLanguage);
    });
  }, []);


  return (
    <UserProvider>
      <SavedCardsProvider>
        <Index />
      </SavedCardsProvider>
    </UserProvider>
  );
}