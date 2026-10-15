import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppTheme } from '../lib/ThemeContext';
import { useTasks } from '../lib/TaskContext';

export default function SettingsScreen() {
  const { theme, pref, setPref } = useAppTheme();
  const { tasks, clearCompleted } = useTasks();
  const insets = useSafeAreaInsets();

  const completedCount = tasks.filter((t) => t.completed).length;

  const handleClearCompleted = () => {
    if (completedCount === 0) {
      Alert.alert('Nothing to clear', 'You have no completed tasks.');
      return;
    }
    Alert.alert(
      'Clear completed tasks',
      `This will permanently delete ${completedCount} completed task${completedCount === 1 ? '' : 's'}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearCompleted },
      ]
    );
  };

  const options: { key: 'system' | 'light' | 'dark'; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'system', label: 'System', icon: 'phone-portrait-outline' },
    { key: 'light', label: 'Light', icon: 'sunny-outline' },
    { key: 'dark', label: 'Dark', icon: 'moon-outline' },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 100 }}
    >
      <Text style={[styles.pageTitle, { color: theme.text }]}>Settings</Text>
      <Text style={[styles.pageSubtitle, { color: theme.subtext }]}>
        Customize your Tasko experience
      </Text>

      <Text style={[styles.sectionLabel, { color: theme.subtext }]}>APPEARANCE</Text>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.themeRow}>
          {options.map((o) => {
            const active = pref === o.key;
            return (
              <Pressable
                key={o.key}
                onPress={() => setPref(o.key)}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: active ? theme.accent : theme.inputBg,
                  },
                ]}
              >
                <Ionicons name={o.icon} size={20} color={active ? '#fff' : theme.text} />
                <Text style={[styles.themeLabel, { color: active ? '#fff' : theme.text }]}>
                  {o.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: theme.subtext }]}>DATA</Text>
      <View style={[styles.card, { backgroundColor: theme.card, padding: 0 }]}>
        <Pressable style={styles.row} onPress={handleClearCompleted}>
          <View style={styles.rowLeft}>
            <View style={[styles.rowIcon, { backgroundColor: theme.danger + '18' }]}>
              <Ionicons name="trash-outline" size={18} color={theme.danger} />
            </View>
            <Text style={[styles.rowText, { color: theme.text }]}>Clear completed tasks</Text>
          </View>
          <Text style={[styles.rowValue, { color: theme.subtext }]}>{completedCount}</Text>
        </Pressable>
      </View>

      <Text style={[styles.sectionLabel, { color: theme.subtext }]}>ABOUT</Text>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.aboutRow}>
          <View style={[styles.logoCircle, { backgroundColor: theme.accentSoft }]}>
            <Ionicons name="checkmark-done" size={24} color={theme.accent} />
          </View>
          <View>
            <Text style={[styles.rowText, { color: theme.text }]}>Tasko</Text>
            <Text style={[styles.rowValue, { color: theme.subtext }]}>Version 1.0.0</Text>
          </View>
        </View>
        <Text style={[styles.aboutText, { color: theme.subtext }]}>
          A clean, focused todo app to help you organize your day, track your progress, and stay
          on top of what matters.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: 26, fontWeight: '800' },
  pageSubtitle: { fontSize: 13, marginTop: 4, marginBottom: 24 },
  sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 10 },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  themeRow: { flexDirection: 'row', gap: 10 },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  themeLabel: { fontSize: 12, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowText: { fontSize: 15, fontWeight: '600' },
  rowValue: { fontSize: 13, fontWeight: '600' },
  aboutRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  logoCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  aboutText: { fontSize: 13, lineHeight: 19 },
});
