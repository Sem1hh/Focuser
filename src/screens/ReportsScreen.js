import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllSessions, getSettings } from '../utils/storage'; // getSettings eklendi
import { Ionicons } from '@expo/vector-icons';
import { BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function ReportsScreen() {
  const [stats, setStats] = useState({
    todayTime: 0,
    totalTime: 0,
    totalDistractions: 0,
    completedSessions: 0,
  });

  const [barData, setBarData] = useState({
    labels: [],
    datasets: [{ data: [0] }]
  });
  
  const [pieData, setPieData] = useState([]);
  const [isDark, setIsDark] = useState(false); // Karanlık Mod Durumu

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    // 1. Önce Ayarları Kontrol Et (Karanlık Mod Açık mı?)
    const settings = await getSettings();
    setIsDark(settings.darkMode);

    // 2. Verileri Çek
    const data = await getAllSessions();
    calculateStats(data);
    prepareBarChartData(data);
    preparePieChartData(data, settings.darkMode); // Pie chart renkleri için modu gönderiyoruz
  };

  const calculateStats = (data) => {
    let today = 0;
    let total = 0;
    let distractions = 0;
    const todayStr = new Date().toDateString();

    data.forEach(session => {
      total += session.duration;
      distractions += session.distractions;
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

  const prepareBarChartData = (data) => {
    const last7Days = [];
    const values = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = `${d.getDate()}/${d.getMonth() + 1}`;
      last7Days.push({ date: dateStr, label: label });
      values.push(0);
    }

    data.forEach(session => {
      const sessionDate = session.date.split('T')[0]; // Tarih formatına dikkat (ISO string kullanıyorsak)
      // Eğer storage.js'de toString() yaptıysak buradaki eşleştirme mantığını değiştirmek gerekebilir.
      // Ama şimdilik ISO formatı varsayıyoruz veya tarih eşleşmesini basit tutuyoruz.
      // Not: Önceki adımda storage.js'i toString() yaptık. Burada tarih karşılaştırması için
      // basit bir yöntem kullanalım:
      
      const sessDateObj = new Date(session.date);
      const sessDateStr = sessDateObj.toISOString().split('T')[0];
      
      const index = last7Days.findIndex(day => day.date === sessDateStr);
      if (index !== -1) {
        values[index] += Math.ceil(session.duration / 60);
      }
    });

    setBarData({
      labels: last7Days.map(d => d.label),
      datasets: [{ data: values }]
    });
  };

  const preparePieChartData = (data, isDarkMode) => {
    const categoryMap = {};

    data.forEach(session => {
      if (!categoryMap[session.category]) {
        categoryMap[session.category] = 0;
      }
      categoryMap[session.category] += Math.ceil(session.duration / 60);
    });

    const colors = ['#e57373', '#ba68c8', '#64b5f6', '#4db6ac', '#ffb74d', '#90a4ae'];
    let colorIndex = 0;

    const chartData = Object.keys(categoryMap).map(category => {
      return {
        name: category,
        population: categoryMap[category],
        color: colors[colorIndex++ % colors.length],
        legendFontColor: isDarkMode ? '#ccc' : '#7F7F7F', // Yazı rengini moda göre ayarla
        legendFontSize: 12,
      };
    });

    if (chartData.length === 0) {
      setPieData([{ name: 'Veri Yok', population: 1, color: '#e0e0e0', legendFontColor: isDarkMode ? '#ccc' : '#7F7F7F', legendFontSize: 12 }]);
    } else {
      setPieData(chartData);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours} sa ${minutes} dk`;
    return `${minutes} dk`;
  };

  // --- STİL DEĞİŞKENLERİ ---
  const containerStyle = isDark ? styles.darkContainer : styles.container;
  const titleStyle = isDark ? styles.darkTitle : styles.headerTitle;
  const cardStyle = isDark ? styles.darkCard : styles.card;
  const labelStyle = isDark ? styles.darkLabel : styles.cardLabel;
  const valueStyle = isDark ? styles.darkValue : styles.cardValue;
  const chartBg = isDark ? '#1e1e1e' : '#fff';
  const chartLabelColor = (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`;

  return (
    <ScrollView style={containerStyle}>
      <Text style={titleStyle}>Raporlar</Text>

      {/* Kartlar */}
      <View style={styles.statsGrid}>
        <View style={[cardStyle, styles.cardBlue]}>
          <Ionicons name="today-outline" size={24} color="#42a5f5" />
          <Text style={labelStyle}>Bugün</Text>
          <Text style={valueStyle}>{formatTime(stats.todayTime)}</Text>
        </View>
        <View style={[cardStyle, styles.cardGreen]}>
          <Ionicons name="time-outline" size={24} color="#66bb6a" />
          <Text style={labelStyle}>Toplam</Text>
          <Text style={valueStyle}>{formatTime(stats.totalTime)}</Text>
        </View>
      </View>

      {/* Çubuk Grafik */}
      <View style={[styles.chartContainer, { backgroundColor: chartBg }]}>
        <Text style={[styles.chartTitle, isDark && styles.darkText]}>Son 7 Gün (Dakika)</Text>
        <BarChart
          data={barData}
          width={screenWidth - 60} 
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          fromZero={true}
          segments={3}
          chartConfig={{
            backgroundColor: chartBg,
            backgroundGradientFrom: chartBg,
            backgroundGradientTo: chartBg,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(66, 165, 245, ${opacity})`,
            labelColor: chartLabelColor, // Dinamik yazı rengi
            propsForLabels: {
              fontSize: 10,
            },
            barPercentage: 0.7,
          }}
          style={{ 
            borderRadius: 16,
            paddingRight: 30,
            paddingLeft: 20,
          }}
        />
      </View>

      {/* Pasta Grafik */}
      <View style={[styles.chartContainer, { backgroundColor: chartBg }]}>
        <Text style={[styles.chartTitle, isDark && styles.darkText]}>Kategori Dağılımı</Text>
        <PieChart
          data={pieData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            color: chartLabelColor,
          }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />
      </View>
      
      <View style={{height: 50}} /> 
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // LIGHT MODE
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  card: { width: '48%', backgroundColor: 'white', padding: 15, borderRadius: 15, alignItems: 'center', elevation: 3 },
  cardLabel: { fontSize: 14, color: '#666', marginTop: 5 },
  cardValue: { fontSize: 18, fontWeight: 'bold', marginTop: 5, color: '#333' },
  
  // DARK MODE
  darkContainer: { flex: 1, backgroundColor: '#121212', padding: 20 },
  darkTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#fff' },
  darkCard: { width: '48%', backgroundColor: '#1e1e1e', padding: 15, borderRadius: 15, alignItems: 'center' },
  darkLabel: { fontSize: 14, color: '#ccc', marginTop: 5 },
  darkValue: { fontSize: 18, fontWeight: 'bold', marginTop: 5, color: '#fff' },
  darkText: { color: '#fff' },

  // ORTAK
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  cardBlue: { borderTopWidth: 4, borderTopColor: '#42a5f5' },
  cardGreen: { borderTopWidth: 4, borderTopColor: '#66bb6a' },

  chartContainer: {
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    alignItems: 'center'
  },
  chartTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333', alignSelf: 'flex-start' },
});