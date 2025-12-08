import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Modal, FlatList, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

// Ekran boyutları ve SVG Ayarları
const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.7;
const STROKE_WIDTH = 15;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function HomeScreen() {
  // --- STATE DEĞİŞKENLERİ ---
  const [initialTime, setInitialTime] = useState(25 * 60); 
  const [timeLeft, setTimeLeft] = useState(25 * 60);       
  const [isActive, setIsActive] = useState(false);         
  const [selectedCategory, setSelectedCategory] = useState('Kodlama');
  const [modalVisible, setModalVisible] = useState(false);
  
  // Dikkat Dağınıklığı Sayısı
  const [distractionCount, setDistractionCount] = useState(0);

  // AppState Referansı (Uygulamanın durumu)
  const appState = useRef(AppState.currentState);
  // "Kullanıcı az önce çıktı mı?" kontrolü için bayrak
  const didDistract = useRef(false);

  // Kategori Listesi
  const categories = [
    { id: '1', name: 'Kodlama', icon: 'code-slash' },
    { id: '2', name: 'Ders Çalışma', icon: 'school' },
    { id: '3', name: 'Kitap Okuma', icon: 'book' },
    { id: '4', name: 'Proje', icon: 'briefcase' },
    { id: '5', name: 'Spor', icon: 'fitness' },
    { id: '6', name: 'Meditasyon', icon: 'leaf' },
  ];

  // --- APP STATE (ODAKLANMA TAKİBİ) ---
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      
      // 1. SENARYO: Uygulamadan Çıkılıyor (Background'a geçiş)
      if (
        appState.current.match(/active/) && 
        nextAppState.match(/inactive|background/) && 
        isActive
      ) {
        setIsActive(false); // Sayacı durdur
        setDistractionCount(prev => prev + 1); // Hatayı 1 artır
        didDistract.current = true; // "Kaçtı" diye not al
      }

      // 2. SENARYO: Uygulamaya Geri Dönülüyor (Active'e geçiş)
      if (
        appState.current.match(/inactive|background/) && 
        nextAppState === 'active' &&
        didDistract.current // Eğer kaçtığı için not almışsak
      ) {
        Alert.alert("Dikkat!", "Uygulamadan ayrıldığın için sayaç duraklatıldı.");
        didDistract.current = false; // Notu sıfırla
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isActive]);

  // --- ZAMANLAYICI MANTIĞI ---
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      Alert.alert("Tebrikler!", "Odaklanma seansını başarıyla tamamladın.");
      setTimeLeft(initialTime); 
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, initialTime]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const changeTime = (amount) => {
    const newTime = initialTime + (amount * 60);
    if (newTime > 0 && newTime <= 120 * 60) { 
      setInitialTime(newTime);
      setTimeLeft(newTime);
    }
  };

  const handleStart = () => setIsActive(true);
  const handlePause = () => setIsActive(false);
  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(initialTime);
    setDistractionCount(0); // Sıfırlayınca hataları da temizle
  };

  const handleSelectCategory = (categoryName) => {
    setSelectedCategory(categoryName);
    setModalVisible(false);
  };

  const progress = timeLeft / initialTime; 
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <View style={styles.container}>
      
      <Text style={styles.headerTitle}>Focuser</Text>

      {/* --- ÜST BİLGİ ALANI --- */}
      <View style={styles.infoRow}>
        {/* Kategori Seçimi */}
        <TouchableOpacity 
          style={styles.categoryBadge} 
          onPress={() => setModalVisible(true)}
          disabled={isActive}
        >
          <Text style={styles.categoryBadgeText}>{selectedCategory} ▼</Text>
        </TouchableOpacity>

        {/* Dikkat Kaybı Sayacı */}
        <View style={styles.distractionBadge}>
          <Ionicons name="alert-circle" size={16} color="#d32f2f" />
          <Text style={styles.distractionText}> {distractionCount}</Text>
        </View>
      </View>

      {/* --- MODAL (KATEGORİ PENCERESİ) --- */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bir Kategori Seç</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => handleSelectCategory(item.name)}>
                  <Ionicons name={item.icon} size={24} color="#555" style={{ marginRight: 15 }} />
                  <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- SAYAÇ VE SVG --- */}
      <View style={styles.timerWrapper}>
        {!isActive && (
          <TouchableOpacity onPress={() => changeTime(-5)} style={styles.adjustButton}>
            <Ionicons name="remove-circle-outline" size={40} color="gray" />
          </TouchableOpacity>
        )}

        <View style={styles.svgContainer}>
          <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
            <Circle stroke="#e6e6e6" fill="none" cx={CIRCLE_SIZE / 2} cy={CIRCLE_SIZE / 2} r={RADIUS} strokeWidth={STROKE_WIDTH} />
            <Circle
              stroke="tomato"
              fill="none"
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
            />
          </Svg>
          <View style={styles.textOverlay}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            <Text style={styles.statusText}>{isActive ? 'Odaklan!' : 'Hazır'}</Text>
          </View>
        </View>

        {!isActive && (
          <TouchableOpacity onPress={() => changeTime(5)} style={styles.adjustButton}>
            <Ionicons name="add-circle-outline" size={40} color="gray" />
          </TouchableOpacity>
        )}
      </View>

      {/* --- KONTROL BUTONLARI --- */}
      <View style={styles.buttonContainer}>
        {!isActive ? (
          <TouchableOpacity style={[styles.button, styles.startButton]} onPress={handleStart}>
            <Text style={styles.buttonText}>Başlat</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.button, styles.pauseButton]} onPress={handlePause}>
            <Text style={styles.buttonText}>Duraklat</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={handleReset}>
          <Text style={styles.buttonText}>Sıfırla</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 32, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 30 },
  categoryBadge: { backgroundColor: '#e3f2fd', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#90caf9' },
  categoryBadgeText: { fontSize: 16, fontWeight: '600', color: '#1565c0' },
  distractionBadge: { backgroundColor: '#ffebee', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ef9a9a' },
  distractionText: { fontSize: 16, fontWeight: 'bold', color: '#d32f2f' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 20, padding: 20, maxHeight: '60%', elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#333' },
  modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalItemText: { fontSize: 18, color: '#333' },
  closeButton: { marginTop: 15, backgroundColor: 'tomato', padding: 10, borderRadius: 10, alignItems: 'center' },
  closeButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  timerWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  adjustButton: { padding: 10, zIndex: 10 },
  svgContainer: { width: CIRCLE_SIZE, height: CIRCLE_SIZE, alignItems: 'center', justifyContent: 'center' },
  textOverlay: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  timerText: { fontSize: 50, fontWeight: 'bold', color: 'tomato' },
  statusText: { fontSize: 14, color: '#666', marginTop: 5, textTransform: 'uppercase', letterSpacing: 1 },

  buttonContainer: { flexDirection: 'row', gap: 15 },
  button: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 15, minWidth: 100, alignItems: 'center' },
  startButton: { backgroundColor: '#4CAF50' },
  pauseButton: { backgroundColor: '#FFC107' },
  resetButton: { backgroundColor: '#F44336' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});