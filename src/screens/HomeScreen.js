import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Modal, FlatList, AppState, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { saveCompletedSession, getSettings } from '../utils/storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Daire boyutu (Ekranın %65'i)
const CIRCLE_SIZE = width * 0.65; 
const STROKE_WIDTH = 15;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function HomeScreen() {
  const [initialTime, setInitialTime] = useState(25 * 60); 
  const [timeLeft, setTimeLeft] = useState(25 * 60);       
  const [isActive, setIsActive] = useState(false);         
  const [selectedCategory, setSelectedCategory] = useState('Kodlama');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [distractionCount, setDistractionCount] = useState(0);
  const [appSettings, setAppSettings] = useState({ vibration: true, darkMode: false, focusTime: 25 });

  const appState = useRef(AppState.currentState);
  const didDistract = useRef(false);
  const isActiveRef = useRef(isActive);
  const initialTimeRef = useRef(initialTime);

  const categories = [
    { id: '1', name: 'Kodlama', icon: 'code-slash' },
    { id: '2', name: 'Ders Çalışma', icon: 'school' },
    { id: '3', name: 'Kitap Okuma', icon: 'book' },
    { id: '4', name: 'Proje', icon: 'briefcase' },
    { id: '5', name: 'Spor', icon: 'fitness' },
    { id: '6', name: 'Meditasyon', icon: 'leaf' },
  ];

  useEffect(() => { isActiveRef.current = isActive; }, [isActive]);
  useEffect(() => { initialTimeRef.current = initialTime; }, [initialTime]);

  useFocusEffect(
    React.useCallback(() => {
      const loadSettings = async () => {
        const settings = await getSettings();
        setAppSettings(settings);
        if (isActiveRef.current || didDistract.current) return;
        const newSettingsTime = settings.focusTime * 60;
        if (newSettingsTime !== initialTimeRef.current) {
             setInitialTime(newSettingsTime);
             setTimeLeft(newSettingsTime);
        }
      };
      loadSettings();
    }, []) 
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/) && isActive) {
        setIsActive(false);
        setDistractionCount(prev => prev + 1);
        didDistract.current = true;
      }
      if (appState.current.match(/inactive|background/) && nextAppState === 'active' && didDistract.current) {
        Alert.alert("Dikkat!", "Uygulamadan ayrıldığın için sayaç duraklatıldı.");
        setTimeout(() => { didDistract.current = false; }, 1000); 
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [isActive]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (appSettings.vibration) Vibration.vibrate([500, 500, 500]); 
      setSummaryVisible(true);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, appSettings]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const changeTime = (amount) => {
    let newTime = initialTime + (amount * 60);
    if (amount < 0 && newTime <= 0) newTime = 5; 
    if (newTime > 0 && newTime <= 120 * 60) { 
      setInitialTime(newTime);
      setTimeLeft(newTime);
    }
  };

  const handleStart = () => setIsActive(true);
  const handlePause = () => setIsActive(false);
  const handleReset = () => {
    if (timeLeft === initialTime) {
      setDistractionCount(0);
      return;
    }
    setIsActive(false);
    setSummaryVisible(true);
  };
  
  const handleSelectCategory = (categoryName) => { setSelectedCategory(categoryName); setModalVisible(false); };
  
  const saveSession = async () => {
    const sessionData = { category: selectedCategory, duration: initialTime - timeLeft, distractions: distractionCount };
    await saveCompletedSession(sessionData);
    Alert.alert("Başarılı", "Seans verileri kaydedildi!");
    closeSummary();
  };

  const discardSession = () => { closeSummary(); };
  const closeSummary = () => {
    setSummaryVisible(false);
    setInitialTime(appSettings.focusTime * 60);
    setTimeLeft(appSettings.focusTime * 60);
    setDistractionCount(0);
    didDistract.current = false;
  };

  const progress = timeLeft / initialTime; 
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const isDark = appSettings.darkMode;
  const containerStyle = isDark ? styles.darkContainer : styles.container;
  const textStyle = isDark ? styles.darkText : styles.headerTitle;
  const circleBg = isDark ? '#333' : '#e6e6e6';
  const badgeBg = isDark ? '#333' : '#e3f2fd';
  const badgeText = isDark ? '#fff' : '#1565c0';

  return (
    <View style={containerStyle}>
      {!isDark && (
        <View style={styles.backgroundShape} />
      )}

      <Text style={textStyle}>Focuser</Text>

      <View style={styles.infoRow}>
        <TouchableOpacity style={[styles.categoryBadge, { backgroundColor: badgeBg }]} onPress={() => setModalVisible(true)} disabled={isActive}>
          <Text style={[styles.categoryBadgeText, { color: badgeText }]}>{selectedCategory} ▼</Text>
        </TouchableOpacity>
        <View style={styles.distractionBadge}>
          <Ionicons name="alert-circle" size={16} color="#d32f2f" />
          <Text style={styles.distractionText}> {distractionCount}</Text>
        </View>
      </View>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark && styles.darkModal]}>
            <Text style={[styles.modalTitle, isDark && styles.darkText]}>Bir Kategori Seç</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => handleSelectCategory(item.name)}>
                  <Ionicons name={item.icon} size={24} color={isDark ? "#ccc" : "#555"} style={{ marginRight: 15 }} />
                  <Text style={[styles.modalItemText, isDark && styles.darkText]}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" transparent={true} visible={summaryVisible} onRequestClose={() => {}}>
        <View style={styles.modalOverlay}>
          <View style={[styles.summaryCard, isDark && styles.darkModal]}>
            <Ionicons name="trophy" size={50} color="#FFD700" style={{ marginBottom: 10 }} />
            <Text style={[styles.summaryTitle, isDark && styles.darkText]}>Seans Bitti!</Text>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Kategori:</Text><Text style={[styles.summaryValue, isDark && styles.darkText]}>{selectedCategory}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Odaklanma:</Text><Text style={[styles.summaryValue, isDark && styles.darkText]}>{formatTime(initialTime - timeLeft)} dk</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Dikkat Kaybı:</Text><Text style={[styles.summaryValue, isDark && styles.darkText]}>{distractionCount}</Text></View>
            <View style={styles.summaryButtons}>
              <TouchableOpacity style={styles.discardButton} onPress={discardSession}><Text style={styles.discardButtonText}>Sil</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveSession}><Text style={styles.saveButtonText}>Kaydet</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.timerWrapper}>
        <TouchableOpacity onPress={() => changeTime(-5)} disabled={isActive} style={[styles.adjustButton, { opacity: isActive ? 0 : 1 }]}>
          <Ionicons name="remove-circle-outline" size={40} color={isDark ? "#777" : "#ccc"} />
        </TouchableOpacity>

        <View style={styles.svgContainer}>
          <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
            <Circle stroke={circleBg} fill="none" cx={CIRCLE_SIZE / 2} cy={CIRCLE_SIZE / 2} r={RADIUS} strokeWidth={STROKE_WIDTH} />
            <Circle stroke="tomato" fill="none" cx={CIRCLE_SIZE / 2} cy={CIRCLE_SIZE / 2} r={RADIUS} strokeWidth={STROKE_WIDTH} strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`} strokeDashoffset={strokeDashoffset} strokeLinecap="round" rotation="-90" origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`} />
          </Svg>
          <View style={styles.textOverlay}>
            <Text style={[styles.timerText, isDark && { color: 'tomato' }]}>{formatTime(timeLeft)}</Text>
            <Text style={styles.statusText}>{isActive ? 'Odaklan!' : 'Hazır'}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => changeTime(5)} disabled={isActive} style={[styles.adjustButton, { opacity: isActive ? 0 : 1 }]}>
          <Ionicons name="add-circle-outline" size={40} color={isDark ? "#777" : "#ccc"} />
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        {!isActive ? (
          <TouchableOpacity onPress={handleStart}>
            <LinearGradient colors={['#4CAF50', '#2E7D32']} style={[styles.button, styles.shadowBtn]}>
              <Ionicons name="play" size={24} color="white" style={{ marginRight: 5 }} />
              <Text style={styles.buttonText}>Başlat</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handlePause}>
            <LinearGradient colors={['#FFC107', '#FFA000']} style={[styles.button, styles.shadowBtn]}>
              <Ionicons name="pause" size={24} color="white" style={{ marginRight: 5 }} />
              <Text style={styles.buttonText}>Duraklat</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleReset}>
          <LinearGradient colors={['#F44336', '#C62828']} style={[styles.button, styles.shadowBtn]}>
             <Ionicons name="refresh" size={24} color="white" style={{ marginRight: 5 }} />
             <Text style={styles.buttonText}>Sıfırla</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', alignItems: 'center', justifyContent: 'center' },
  darkContainer: { flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center' },
  
  backgroundShape: {
    position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(255, 99, 71, 0.05)',
  },

  headerTitle: { fontSize: 36, fontFamily: 'Poppins_700Bold', marginBottom: 20, color: '#333' },
  darkText: { color: '#fff', fontSize: 36, fontFamily: 'Poppins_700Bold', marginBottom: 20 },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 40 },
  categoryBadge: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  categoryBadgeText: { fontSize: 16, fontFamily: 'Poppins_600SemiBold' },
  distractionBadge: { backgroundColor: '#ffebee', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  distractionText: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: '#d32f2f' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 25, padding: 25, maxHeight: '60%', elevation: 10 },
  darkModal: { backgroundColor: '#1e1e1e' },
  modalTitle: { fontSize: 22, fontFamily: 'Poppins_700Bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalItemText: { fontSize: 18, fontFamily: 'Poppins_400Regular', color: '#333' },
  closeButton: { marginTop: 20, backgroundColor: 'tomato', padding: 12, borderRadius: 15, alignItems: 'center' },
  closeButtonText: { color: 'white', fontFamily: 'Poppins_700Bold', fontSize: 16 },

  summaryCard: { width: '85%', backgroundColor: 'white', borderRadius: 25, padding: 30, alignItems: 'center', elevation: 20 },
  summaryTitle: { fontSize: 26, fontFamily: 'Poppins_700Bold', color: '#333', marginBottom: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5', paddingBottom: 8 },
  summaryLabel: { fontSize: 16, color: '#888', fontFamily: 'Poppins_400Regular' },
  summaryValue: { fontSize: 18, fontFamily: 'Poppins_600SemiBold', color: '#333' },
  summaryButtons: { flexDirection: 'row', gap: 15, marginTop: 25, width: '100%' },
  saveButton: { flex: 1, backgroundColor: '#4CAF50', padding: 15, borderRadius: 15, alignItems: 'center' },
  saveButtonText: { color: 'white', fontFamily: 'Poppins_700Bold', fontSize: 16 },
  discardButton: { flex: 1, backgroundColor: '#F44336', padding: 15, borderRadius: 15, alignItems: 'center' },
  discardButtonText: { color: 'white', fontFamily: 'Poppins_700Bold', fontSize: 16 },

  timerWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', // 1. Her şeyi ortaya hizala
    marginBottom: 50,
    width: '100%',
    gap: 5 // 2. Butonlarla daire arasına sabit boşluk
  },
  adjustButton: { padding: 10, zIndex: 10 },
  svgContainer: { width: CIRCLE_SIZE, height: CIRCLE_SIZE, alignItems: 'center', justifyContent: 'center' },
  textOverlay: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  timerText: { fontSize: 60, fontFamily: 'Poppins_700Bold', color: 'tomato', letterSpacing: -1 },
  statusText: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: '#aaa', marginTop: 0, textTransform: 'uppercase', letterSpacing: 2 },

  buttonContainer: { flexDirection: 'row', gap: 20 },
  button: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 20, minWidth: 120, alignItems: 'center', justifyContent: 'center' },
  shadowBtn: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
  buttonText: { color: '#fff', fontSize: 18, fontFamily: 'Poppins_600SemiBold' },
});