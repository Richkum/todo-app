import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppTheme } from '../lib/ThemeContext';
import { useTasks } from '../lib/TaskContext';
import { CATEGORIES } from '../lib/theme';

export default function StatsScreen() {
  const { theme } = useAppTheme();
  const { tasks } = useTasks();
  const insets = useSafeAreaInsets();

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const active = total - completed;
    const rate = total ? Math.round((completed / total) * 100) : 0;

    const byCategory = CATEGORIES.map((c) => {
      const catTasks = tasks.filter((t) => t.category === c.id);
      const catCompleted = catTasks.filter((t) => t.completed).length;
      return { ...c, total: catTasks.length, completed: catCompleted };
    }).filter((c) => c.total > 0);

    const overdue = tasks.filter(
      (t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date(new Date().toDateString())
    ).length;

    // last 7 days completion count
    const days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2);
      const count = tasks.filter(
        (t) => t.completed && t.completedAt && new Date(t.completedAt).toDateString() === d.toDateString()
      ).length;
      days.push({ label, count });
    }
    const maxCount = Math.max(1, ...days.map((d) => d.count));

    return { total, completed, active, rate, byCategory, overdue, days, maxCount };
  }, [tasks]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 100 }}
    >
      <Text style={[styles.pageTitle, { color: theme.text }]}>Insights</Text>
      <Text style={[styles.pageSubtitle, { color: theme.subtext }]}>
        Track your productivity over time
      </Text>

      <View style={styles.statRow}>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statValue, { color: theme.accent }]}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: theme.subtext }]}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statValue, { color: theme.success }]}>{stats.completed}</Text>
          <Text style={[styles.statLabel, { color: theme.subtext }]}>Done</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statValue, { color: theme.danger }]}>{stats.overdue}</Text>
          <Text style={[styles.statLabel, { color: theme.subtext }]}>Overdue</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Completion Rate</Text>
          <Text style={[styles.cardTitle, { color: theme.accent }]}>{stats.rate}%</Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${stats.rate}%`, backgroundColor: theme.accent },
            ]}
          />
        </View>
        <Text style={[styles.cardSubtitle, { color: theme.subtext }]}>
          {stats.active} task{stats.active === 1 ? '' : 's'} remaining
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 16 }]}>
          Last 7 Days
        </Text>
        <View style={styles.chartRow}>
          {stats.days.map((d, i) => (
            <View key={i} style={styles.chartCol}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(6, (d.count / stats.maxCount) * 80),
                      backgroundColor: theme.accent,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { color: theme.subtext }]}>{d.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 14 }]}>
          By Category
        </Text>
        {stats.byCategory.length === 0 && (
          <Text style={[styles.cardSubtitle, { color: theme.subtext }]}>No tasks yet.</Text>
        )}
        {stats.byCategory.map((c) => {
          const pct = c.total ? Math.round((c.completed / c.total) * 100) : 0;
          return (
            <View key={c.id} style={styles.categoryRow}>
              <View style={[styles.catIconWrap, { backgroundColor: c.color + '22' }]}>
                <Ionicons name={c.icon} size={15} color={c.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.categoryRowTop}>
                  <Text style={[styles.categoryName, { color: theme.text }]}>{c.label}</Text>
                  <Text style={[styles.categoryCount, { color: theme.subtext }]}>
                    {c.completed}/{c.total}
                  </Text>
                </View>
                <View style={[styles.progressTrackSmall, { backgroundColor: theme.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${pct}%`, backgroundColor: c.color },
                    ]}
                  />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: 26, fontWeight: '800' },
  pageSubtitle: { fontSize: 13, marginTop: 4, marginBottom: 20 },
  statRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 4, fontWeight: '600' },
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardSubtitle: { fontSize: 12, marginTop: 8 },
  progressTrack: { height: 10, borderRadius: 5, overflow: 'hidden' },
  progressTrackSmall: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 6 },
  progressFill: { height: '100%', borderRadius: 5 },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  chartCol: { alignItems: 'center', gap: 8, flex: 1 },
  barTrack: { height: 80, justifyContent: 'flex-end' },
  bar: { width: 18, borderRadius: 6 },
  barLabel: { fontSize: 11, fontWeight: '600' },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  catIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryRowTop: { flexDirection: 'row', justifyContent: 'space-between' },
  categoryName: { fontSize: 13, fontWeight: '600' },
  categoryCount: { fontSize: 12, fontWeight: '600' },
});
