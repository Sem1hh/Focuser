import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@focus_sessions';
const SETTINGS_KEY = '@focus_settings'; // Ayarlar için yeni anahtar

// --- SEANS İŞLEMLERİ ---

export const saveCompletedSession = async (sessionData) => {
  try {
    const existingData = await AsyncStorage.getItem(SESSION_KEY);
    const history = existingData ? JSON.parse(existingData) : [];
    const newSession = {
      id: Date.now().toString(),
      // DÜZELTME: toISOString() yerine toString() kullanarak yerel saati kaydediyoruz.
      date: new Date().toString(), 
      ...sessionData,
    };
    history.push(newSession);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error("Kaydetme Hatası:", error);
    return false;
  }
};

export const getAllSessions = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(SESSION_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error("Okuma Hatası:", error);
    return [];
  }
};

export const clearAllSessions = async () => {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

// --- AYAR İŞLEMLERİ (YENİ) ---

// Varsayılan ayarlar
const defaultSettings = {
  focusTime: 25,    // Dakika
  vibration: true,  //  Titreşim açık mı?
  darkMode: false,  // Karanlık mod açık mı?
};
export const getSettings = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : defaultSettings;
  } catch (error) {
    return defaultSettings;
  }
};

export const saveSettings = async (newSettings) => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};