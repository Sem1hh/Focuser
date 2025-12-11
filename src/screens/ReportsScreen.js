import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // Sayfa odaklanınca çalışır
import { getAllSessions } from '../utils/storage'; // Dün yazdığımız okuma fonksiyonu
import { Ionicons } from '@expo/vector-icons';

export default function ReportsScreen() {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    todayTime: 0,
    totalTime: 0,
    totalDistractions: 0,
    completedSessions: 0,
  });

  // Verileri Hafızadan Çek ve Hesapla
  const loadData = async () => {
    const data = await getAllSessions();
    setSessions(data);
    calculateStats(data);
  };

  // Sayfa her açıldığında verileri yükle
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // İstatistik Hesaplama Mantığı
  const calculateStats = (data) => {
    let today = 0;
    let total = 0;
    let distractions = 0;
    const todayStr = new Date().toDateString(); // "Thu Dec 12 2025" gibi

    data.forEach(session => {
      // Toplam süre ve hata sayısı
      total += session.duration;
      distractions += session.distractions;

      // Eğer seansın tarihi bugünün tarihiyle aynıysa
      if (new Date(session.date).toDateString() === todayStr) {
        today += session.duration;
      }
    });

    setStats({
      todayTime: today,
      totalTime: total,
      totalDistractions: distractions,
      completedSessions: data.length,
    });
  };

  // Saniyeyi "1s 30dk" gibi okunabilir formata çevir
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) return `${hours} sa ${minutes} dk`;
    return `${minutes} dk`;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>İstatistikler</Text>

      {/* İstatistik Kartları */}
      <View style={styles.statsGrid}>
        
        {/* Kart 1: Bugün */}
        <View style={[styles.card, styles.cardBlue]}>
          <Ionicons name="today-outline" size={30} color="#1565c0" />
          <Text style={styles.cardLabel}>Bugün Odaklanma</Text>
          <Text style={styles.cardValue}>{formatTime(stats.todayTime)}</Text>
        </View>

        {/* Kart 2: Toplam Süre */}
        <View style={[styles.card, styles.cardGreen]}>
          <Ionicons name="time-outline" size={30} color="#2e7d32" />
          <Text style={styles.cardLabel}>Toplam Süre</Text>
          <Text style={styles.cardValue}>{formatTime(stats.totalTime)}</Text>
        </View>

        {/* Kart 3: Toplam Seans */}
        <View style={[styles.card, styles.cardPurple]}>
          <Ionicons name="checkmark-circle-outline" size={30} color="#6a1b9a" />
          <Text style={styles.cardLabel}>Tamamlanan</Text>
          <Text style={styles.cardValue}>{stats.completedSessions} Seans</Text>
        </View>

        {/* Kart 4: Dikkat Dağınıklığı */}
        <View style={[styles.card, styles.cardRed]}>
          <Ionicons name="alert-circle-outline" size={30} color="#c62828" />
          <Text style={styles.cardLabel}>Dikkat Kaybı</Text>
          <Text style={styles.cardValue}>{stats.totalDistractions}</Text>
        </View>

      </View>

      {/* Buraya Yarın (9. Gün) Grafikler Gelecek */}
      <View style={styles.placeholderChart}>
        <Text style={{color: 'gray'}}>Grafikler buraya yüklenecek (Gün 9)</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  card: {
    width: '47%', // İki kart yan yana sığsın diye
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3, // Android gölgesi
    shadowColor: '#000', // iOS gölgesi
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 5,
  },
  cardLabel: { fontSize: 14, color: '#666', marginTop: 10, textAlign: 'center' },
  cardValue: { fontSize: 22, fontWeight: 'bold', marginTop: 5, color: '#333' },

  // Renkli Kart Kenarlıkları (Opsiyonel şıklık)
  cardBlue: { borderTopWidth: 4, borderTopColor: '#42a5f5' },
  cardGreen: { borderTopWidth: 4, borderTopColor: '#66bb6a' },
  cardPurple: { borderTopWidth: 4, borderTopColor: '#ab47bc' },
  cardRed: { borderTopWidth: 4, borderTopColor: '#ef5350' },

  placeholderChart: {
    marginTop: 30,
    height: 200,
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#bdbdbd',
  }
});