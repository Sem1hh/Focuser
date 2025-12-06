import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

// Ekran genişliğine göre boyut ayarlama
const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.7; // Ekranın %70'i kadar
const STROKE_WIDTH = 15;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function HomeScreen() {
  const [initialTime, setInitialTime] = useState(25 * 60); 
  const [timeLeft, setTimeLeft] = useState(25 * 60);       
  const [isActive, setIsActive] = useState(false);         
  const [selectedCategory, setSelectedCategory] = useState('Kodlama');

  // --- SADECE ZAMANLAYICI MANTIĞI ---
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

  // Yardımcılar
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
  };

  // İlerleme Hesabı
  const progress = timeLeft / initialTime; 
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <View style={styles.container}>
      
      <Text style={styles.headerTitle}>Focuser</Text>

      <View style={styles.categoryContainer}>
        <Text style={styles.categoryLabel}>Şu anki Hedef:</Text>
        <TouchableOpacity style={styles.categoryButton}>
          <Text style={styles.categoryButtonText}>{selectedCategory}</Text>
        </TouchableOpacity>
      </View>

      {/* Sayaç ve Halka */}
      <View style={styles.timerWrapper}>
        
        {/* Azaltma Butonu */}
        {!isActive && (
          <TouchableOpacity onPress={() => changeTime(-5)} style={styles.adjustButton}>
            <Ionicons name="remove-circle-outline" size={40} color="gray" />
          </TouchableOpacity>
        )}

        <View style={styles.svgContainer}>
          <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
            {/* Gri Arka Plan */}
            <Circle
              stroke="#e6e6e6"
              fill="none"
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              strokeWidth={STROKE_WIDTH}
            />
            {/* Kırmızı İlerleme */}
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
          </View>
        </View>

        {/* Artırma Butonu */}
        {!isActive && (
          <TouchableOpacity onPress={() => changeTime(5)} style={styles.adjustButton}>
            <Ionicons name="add-circle-outline" size={40} color="gray" />
          </TouchableOpacity>
        )}
      </View>

      {/* Kontrol Butonları */}
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
  categoryContainer: { marginBottom: 20, alignItems: 'center' },
  categoryLabel: { fontSize: 14, color: '#666', marginBottom: 5 },
  categoryButton: { backgroundColor: '#f0f0f0', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  categoryButtonText: { fontSize: 16, fontWeight: '600', color: '#333' },

  timerWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  adjustButton: { padding: 10, zIndex: 10 },

  svgContainer: { width: CIRCLE_SIZE, height: CIRCLE_SIZE, alignItems: 'center', justifyContent: 'center' },
  textOverlay: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  timerText: { fontSize: 50, fontWeight: 'bold', color: 'tomato' },

  buttonContainer: { flexDirection: 'row', gap: 15 },
  button: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 15, minWidth: 100, alignItems: 'center' },
  startButton: { backgroundColor: '#4CAF50' },
  pauseButton: { backgroundColor: '#FFC107' },
  resetButton: { backgroundColor: '#F44336' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});