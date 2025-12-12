import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllSessions } from '../utils/storage';
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

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const data = await getAllSessions();
    calculateStats(data);
    prepareBarChartData(data);
    preparePieChartData(data);
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

  // ÇUBUK GRAFİK VERİSİ
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
      const sessionDate = session.date.split('T')[0];
      const index = last7Days.findIndex(day => day.date === sessionDate);
      if (index !== -1) {
        values[index] += Math.ceil(session.duration / 60);
      }
    });

    setBarData({
      labels: last7Days.map(d => d.label),
      datasets: [{ data: values }]
    });
  };

  // PASTA GRAFİK VERİSİ
  const preparePieChartData = (data) => {
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
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      };
    });

    if (chartData.length === 0) {
      setPieData([{ name: 'Veri Yok', population: 1, color: '#e0e0e0', legendFontColor: '#7F7F7F', legendFontSize: 12 }]);
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Raporlar</Text>

      {/* Kartlar */}
      <View style={styles.statsGrid}>
        <View style={[styles.card, styles.cardBlue]}>
          <Ionicons name="today-outline" size={24} color="#1565c0" />
          <Text style={styles.cardLabel}>Bugün</Text>
          <Text style={styles.cardValue}>{formatTime(stats.todayTime)}</Text>
        </View>
        <View style={[styles.card, styles.cardGreen]}>
          <Ionicons name="time-outline" size={24} color="#2e7d32" />
          <Text style={styles.cardLabel}>Toplam</Text>
          <Text style={styles.cardValue}>{formatTime(stats.totalTime)}</Text>
        </View>
      </View>

      {/* Çubuk Grafik */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Son 7 Gün (Dakika)</Text>
        <BarChart
          data={barData}
          width={screenWidth - 60} 
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          fromZero={true}
          segments={3}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(66, 165, 245, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            propsForLabels: {
              fontSize: 10,
            },
            barPercentage: 0.7,
          }}
          style={{ 
            borderRadius: 16,
            paddingRight: 30,
            paddingLeft: 20, // DÜZELTME: Soldan taşmayı engellemek için boşluk eklendi
          }}
        />
      </View>

      {/* Pasta Grafik */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Kategori Dağılımı</Text>
        <PieChart
          data={pieData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
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
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  card: { width: '48%', backgroundColor: 'white', padding: 15, borderRadius: 15, alignItems: 'center', elevation: 3 },
  cardLabel: { fontSize: 14, color: '#666', marginTop: 5 },
  cardValue: { fontSize: 18, fontWeight: 'bold', marginTop: 5, color: '#333' },
  cardBlue: { borderTopWidth: 4, borderTopColor: '#42a5f5' },
  cardGreen: { borderTopWidth: 4, borderTopColor: '#66bb6a' },

  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    alignItems: 'center'
  },
  chartTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333', alignSelf: 'flex-start' },
});