import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, CreditCard, History, Settings, Bell } from 'lucide-react-native';

const TRANSACTIONS = [
  { id: '1', name: 'Apple Store', date: 'Today', amount: -1299.00, icon: <ArrowUpRight size={18} color="#ef4444" /> },
  { id: '2', name: 'Salary Deposit', date: 'Yesterday', amount: 8500.00, icon: <ArrowDownLeft size={18} color="#10b981" /> },
  { id: '3', name: 'Starbucks', date: 'Oct 21', amount: -6.50, icon: <ArrowUpRight size={18} color="#ef4444" /> },
  { id: '4', name: 'Amazon', date: 'Oct 20', amount: -14.99, icon: <ArrowUpRight size={18} color="#ef4444" /> },
];

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Good Morning,</Text>
            <Text style={styles.userName}>Marcus Holland</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Bell size={24} color="#f8fafc" />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
           <View style={styles.balanceHeader}>
              <View style={styles.balanceRow}>
                <Wallet size={16} color="#ffffff80" />
                <Text style={styles.balanceLabel}>Total Balance</Text>
              </View>
              <Text style={styles.premiumTag}>PREMIUM</Text>
           </View>
           <Text style={styles.balanceAmount}>₹ 4,32,150.00</Text>
           <View style={styles.balanceFooter}>
              <Text style={styles.accNumber}>**** 4432 0918</Text>
              <Text style={styles.accType}>Savings Account</Text>
           </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionBtn}>
             <View style={[styles.actionIcon, {backgroundColor: '#6366f120'}]}>
                <Plus size={24} color="#6366f1" />
             </View>
             <Text style={styles.actionText}>Deposit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
             <View style={[styles.actionIcon, {backgroundColor: '#10b98120'}]}>
                <ArrowUpRight size={24} color="#10b981" />
             </View>
             <Text style={styles.actionText}>Transfer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
             <View style={[styles.actionIcon, {backgroundColor: '#f59e0b20'}]}>
                <CreditCard size={24} color="#f59e0b" />
             </View>
             <Text style={styles.actionText}>Cards</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
             <View style={[styles.actionIcon, {backgroundColor: '#8b5cf620'}]}>
                <History size={24} color="#8b5cf6" />
             </View>
             <Text style={styles.actionText}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitle}>Recent Transactions</Text>
           <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
        </View>

        {TRANSACTIONS.map(item => (
          <View key={item.id} style={styles.txItem}>
             <View style={styles.txLeft}>
                <View style={styles.txIconBox}>{item.icon}</View>
                <View>
                   <Text style={styles.txName}>{item.name}</Text>
                   <Text style={styles.txDate}>{item.date}</Text>
                </View>
             </View>
             <Text style={[styles.txAmount, {color: item.amount > 0 ? '#10b981' : '#f8fafc'}]}>
               {item.amount > 0 ? `+₹${item.amount}` : `-₹${Math.abs(item.amount)}`}
             </Text>
          </View>
        ))}

        {/* Savings Goal Card */}
        <View style={styles.goalCard}>
           <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>Savings Goal</Text>
              <Text style={styles.goalPercent}>75%</Text>
           </View>
           <Text style={styles.goalTarget}>New Macbook Pro</Text>
           <View style={styles.progressBar}>
              <View style={[styles.progressFill, {width: '75%'}]} />
           </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  userName: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: 'bold',
  },
  notificationBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceCard: {
    backgroundColor: '#6366f1',
    borderRadius: 24,
    padding: 25,
    marginBottom: 30,
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#ffffff80',
    fontSize: 14,
    marginLeft: 6,
  },
  premiumTag: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: '#ffffff20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  balanceAmount: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accNumber: {
    color: '#ffffffcc',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  accType: {
    color: '#ffffffcc',
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  actionBtn: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  txItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txName: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: 15,
  },
  txDate: {
    color: '#64748b',
    fontSize: 12,
  },
  txAmount: {
    fontWeight: '700',
    fontSize: 15,
  },
  goalCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 24,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  goalTitle: {
    color: '#94a3b8',
    fontSize: 14,
  },
  goalPercent: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  goalTarget: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#0f172a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
});
