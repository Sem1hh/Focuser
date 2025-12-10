import AsyncStorage from '@react-native-async-storage/async-storage';

// Verileri kaydedeceğimiz anahtar kelime
const SESSION_KEY = '@focus_sessions';

// 1. Yeni bir seans kaydetme fonksiyonu
export const saveCompletedSession = async (sessionData) => {
  try {
    // Önce mevcut kayıtları çek
    const existingData = await AsyncStorage.getItem(SESSION_KEY);
    const history = existingData ? JSON.parse(existingData) : [];

    // Yeni seansı listeye ekle
    // (Her kayda benzersiz bir ID ve o anki tarihi ekliyoruz)
    const newSession = {
      id: Date.now().toString(), // Benzersiz kimlik
      date: new Date().toISOString(), // Kayıt tarihi (2025-12-10...)
      ...sessionData, // Bize gelen veriler (süre, kategori, hata sayısı)
    };

    history.push(newSession);

    // Güncellenmiş listeyi tekrar telefona kaydet
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(history));
    console.log("Kayıt Başarılı:", newSession);
    return true;

  } catch (error) {
    console.error("Kaydetme Hatası:", error);
    return false;
  }
};

// 2. Tüm geçmişi okuma fonksiyonu (Raporlar sayfası için lazım olacak)
export const getAllSessions = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(SESSION_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error("Okuma Hatası:", error);
    return [];
  }
};

// 3. (Opsiyonel) Tüm verileri silme (Test ederken işine yarar)
export const clearAllSessions = async () => {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error(e);
  }
};