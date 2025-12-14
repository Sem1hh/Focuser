import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Switch, DeviceEventEmitter } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSettings, saveSettings, clearAllSessions } from '../utils/storage';

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    focusTime: 25,
    vibration: true,
    darkMode: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await getSettings();
    setSettings(savedSettings);
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
    
    // YENİ: Eğer değişen ayar 'darkMode' ise, App.js'e haber ver!
    if (key === 'darkMode') {
      DeviceEventEmitter.emit('theme_change', value);
    }
  };

  const handleClearHistory = () => {
    Alert.alert("Emin misin?", "Geçmiş silinecek!", [
      { text: "Vazgeç", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: async () => { await clearAllSessions(); Alert.alert("Temizlendi"); } }
    ]);
  };

  // Stiller
  const isDark = settings.darkMode;
  const bgStyle = isDark ? styles.darkContainer : styles.container;
  const textStyle = isDark ? styles.darkText : styles.lightText;
  const cardStyle = isDark ? styles.darkCard : styles.card;

  return (
    <ScrollView style={bgStyle}>
      <Text style={[styles.headerTitle, textStyle]}>Ayarlar</Text>

      {/* SÜRE SEÇİMİ - DÜZELTİLMİŞ RENKLER */}
      <View style={cardStyle}>
        <Text style={[styles.sectionTitle, textStyle]}>Varsayılan Süre</Text>
        <View style={styles.optionsContainer}>
          {[25, 45, 60].map((time) => (
            <TouchableOpacity 
              key={time} 
              style={[
                styles.optionButton, 
                // Karanlık modda bile seçiliyse arka plan TURUNCU olsun
                settings.focusTime === time ? styles.selectedOption : (isDark ? styles.darkUnselected : styles.lightUnselected)
              ]}
              onPress={() => updateSetting('focusTime', time)}
            >
              <Text style={[
                styles.optionText, 
                // Seçiliyse yazı BEYAZ, seçili değilse moda göre gri/siyah
                settings.focusTime === time ? styles.selectedText : (isDark ? styles.darkOptionText : styles.lightOptionText)
              ]}>
                {time} dk
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* TERCİHLER */}
      <View style={cardStyle}>
        <Text style={[styles.sectionTitle, textStyle]}>Tercihler</Text>
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, textStyle]}>Seans Sonu Titreşim</Text>
          <Switch
            trackColor={{ false: "#767577", true: "tomato" }}
            thumbColor={settings.vibration ? "#fff" : "#f4f3f4"}
            onValueChange={(value) => updateSetting('vibration', value)}
            value={settings.vibration}
          />
        </View>
        <View style={[styles.divider, isDark && { backgroundColor: '#444' }]} />
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, textStyle]}>Karanlık Mod</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#424242" }}
            thumbColor={settings.darkMode ? "#fff" : "#f4f3f4"}
            onValueChange={(value) => updateSetting('darkMode', value)}
            value={settings.darkMode}
          />
        </View>
      </View>

      <View style={cardStyle}>
        <Text style={[styles.sectionTitle, textStyle]}>Veri Yönetimi</Text>
        <TouchableOpacity style={styles.dangerButton} onPress={handleClearHistory}>
          <Ionicons name="trash-outline" size={24} color="white" style={{ marginRight: 10 }} />
          <Text style={styles.dangerButtonText}>Tüm Geçmişi Temizle</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  darkContainer: { flex: 1, backgroundColor: '#121212', padding: 20 },
  
  card: { backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 20 },
  darkCard: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 15, marginBottom: 20 },

  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  
  lightText: { color: '#333' },
  darkText: { color: '#fff' },

  optionsContainer: { flexDirection: 'row', gap: 10 },
  optionButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10, borderWidth: 1 },
  
  // DÜZELTME: Seçili buton her zaman turuncu (tomato)
  selectedOption: { backgroundColor: 'tomato', borderColor: 'tomato' },
  selectedText: { color: 'white', fontWeight: 'bold' },

  // Seçili DEĞİLSE renkler
  lightUnselected: { backgroundColor: '#fafafa', borderColor: '#ddd' },
  darkUnselected: { backgroundColor: '#333', borderColor: '#555' },
  
  lightOptionText: { color: '#555' },
  darkOptionText: { color: '#ccc' }, // Karanlık modda okunabilir gri
  optionText: { fontSize: 16, fontWeight: '600' },

  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  switchLabel: { fontSize: 16 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  
  dangerButton: { flexDirection: 'row', backgroundColor: '#ef5350', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dangerButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});