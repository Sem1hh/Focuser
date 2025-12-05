import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  // Şimdilik görüntüyü test etmek için sabit değerler (State)
  const [timer, setTimer] = useState('25:00'); 
  const [selectedCategory, setSelectedCategory] = useState('Kodlama');

  return (
    <View style={styles.container}>
      
      {/* Üst Kısım: Başlık */}
      <Text style={styles.headerTitle}>Focuser</Text>

      {/* Kategori Seçim Alanı (Görüntü) */}
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryLabel}>Şu anki Hedef:</Text>
        <TouchableOpacity style={styles.categoryButton}>
          <Text style={styles.categoryButtonText}>{selectedCategory}</Text>
        </TouchableOpacity>
      </View>

      {/* Sayaç Dairesi */}
      <View style={styles.timerCircle}>
        <Text style={styles.timerText}>{timer}</Text>
      </View>

      {/* Kontrol Butonları */}
      <View style={styles.buttonContainer}>
        {/* Başlat Butonu */}
        <TouchableOpacity style={[styles.button, styles.startButton]}>
          <Text style={styles.buttonText}>Başlat</Text>
        </TouchableOpacity>

        {/* Duraklat Butonu */}
        <TouchableOpacity style={[styles.button, styles.pauseButton]}>
          <Text style={styles.buttonText}>Duraklat</Text>
        </TouchableOpacity>

        {/* Sıfırla Butonu */}
        <TouchableOpacity style={[styles.button, styles.resetButton]}>
          <Text style={styles.buttonText}>Sıfırla</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

// --- TASARIM (CSS) KISMI ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  // Kategori
  categoryContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  categoryButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryButtonText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  // Sayaç Dairesi
  timerCircle: {
    width: 260,
    height: 260,
    borderRadius: 130, // Tam daire olması için genişliğin yarısı
    borderWidth: 8,
    borderColor: 'tomato',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    backgroundColor: '#fff5f5', // Çok açık kırmızı arka plan
    elevation: 5, // Android için gölge
    shadowColor: '#000', // iOS için gölge
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  timerText: {
    fontSize: 65,
    fontWeight: 'bold',
    color: 'tomato',
  },
  // Butonlar
  buttonContainer: {
    flexDirection: 'row', // Butonları yan yana dizer
    gap: 15,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: { backgroundColor: '#4CAF50' }, // Yeşil
  pauseButton: { backgroundColor: '#FFC107' }, // Sarı
  resetButton: { backgroundColor: '#F44336' }, // Kırmızı
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});