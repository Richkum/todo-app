import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Task } from '../lib/TaskContext';
import { CATEGORIES, PRIORITY_META, Theme } from '../lib/theme';

interface Props {
  task: Task;
  theme: Theme;
  onToggle: () => void;
  onDelete: () => void;
  onPress: () => void;
}

function formatDue(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  if (isToday) return 'Today';
  if (isTomorrow) return 'Tomorrow';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function DeleteAction({
  progress,
  theme,
  onPress,
}: {
  progress: SharedValue<number>;
  theme: Theme;
  onPress: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: Math.min(1, Math.max(0.6, progress.value)) }],
  }));
  return (
    <RectButton style={[styles.deleteAction, { backgroundColor: theme.danger }]} onPress={onPress}>
      <Animated.View style={animatedStyle}>
        <Ionicons name="trash" size={22} color="#fff" />
      </Animated.View>
    </RectButton>
  );
}

export default function TaskItem({ task, theme, onToggle, onDelete, onPress }: Props) {
  const swipeRef = useRef<SwipeableMethods>(null);
  const category = CATEGORIES.find((c) => c.id === task.category) ?? CATEGORIES[4];
  const priority = PRIORITY_META[task.priority];
  const due = formatDue(task.dueDate);
  const overdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date(new Date().toDateString());

  const renderRightActions = (progress: SharedValue<number>) => (
    <DeleteAction
      progress={progress}
      theme={theme}
      onPress={() => {
        (swipeRef.current as any)?.close?.();
        onDelete();
      }}
    />
  );

  return (
    <Swipeable ref={swipeRef as any} renderRightActions={renderRightActions} overshootRight={false}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: theme.card, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Pressable onPress={onToggle} hitSlop={10} style={styles.checkWrap}>
          <View
            style={[
              styles.checkbox,
              {
                borderColor: task.completed ? theme.success : theme.border,
                backgroundColor: task.completed ? theme.success : 'transparent',
              },
            ]}
          >
            {task.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
        </Pressable>

        <View style={styles.body}>
          <Text
            numberOfLines={1}
            style={[
              styles.title,
              {
                color: task.completed ? theme.subtext : theme.text,
                textDecorationLine: task.completed ? 'line-through' : 'none',
              },
            ]}
          >
            {task.title}
          </Text>
          <View style={styles.metaRow}>
            <View style={[styles.categoryPill, { backgroundColor: category.color + '22' }]}>
              <Ionicons name={category.icon} size={11} color={category.color} />
              <Text style={[styles.categoryText, { color: category.color }]}>{category.label}</Text>
            </View>
            {due && (
              <View style={styles.dueWrap}>
                <Ionicons
                  name="calendar-outline"
                  size={11}
                  color={overdue ? theme.danger : theme.subtext}
                />
                <Text style={[styles.dueText, { color: overdue ? theme.danger : theme.subtext }]}>
                  {due}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.priorityDot, { backgroundColor: priority.color }]} />
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  checkWrap: { marginRight: 12 },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 4,
  },
  categoryText: { fontSize: 11, fontWeight: '600' },
  dueWrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dueText: { fontSize: 11, fontWeight: '500' },
  priorityDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    marginVertical: 6,
    marginRight: 16,
    borderRadius: 16,
  },
});
