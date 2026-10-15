import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppTheme } from '../lib/ThemeContext';
import { useTasks } from '../lib/TaskContext';
import { CATEGORIES, PRIORITY_META, Priority } from '../lib/theme';
import type { RootStackParamList } from '../navigation/types';

type Route = RouteProp<RootStackParamList, 'EditTask'>;

const QUICK_DUE = [
  { label: 'None', value: null },
  { label: 'Today', value: 0 },
  { label: 'Tomorrow', value: 1 },
  { label: 'Next week', value: 7 },
];

export default function AddEditTaskScreen() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<Route>();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();

  const editingTask = useMemo(
    () => tasks.find((t) => t.id === route.params?.taskId),
    [tasks, route.params?.taskId]
  );
  const isEditing = !!editingTask;

  const [title, setTitle] = useState(editingTask?.title ?? '');
  const [notes, setNotes] = useState(editingTask?.notes ?? '');
  const [priority, setPriority] = useState<Priority>(editingTask?.priority ?? 'medium');
  const [category, setCategory] = useState(editingTask?.category ?? 'personal');
  const [dueDate, setDueDate] = useState<string | null>(editingTask?.dueDate ?? null);

  const setQuickDue = (days: number | null) => {
    if (days === null) {
      setDueDate(null);
      return;
    }
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(9, 0, 0, 0);
    setDueDate(d.toISOString());
  };

  const currentDueOffset = () => {
    if (!dueDate) return null;
    const d = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dd = new Date(d);
    dd.setHours(0, 0, 0, 0);
    const diff = Math.round((dd.getTime() - today.getTime()) / 86400000);
    return diff;
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a task title.');
      return;
    }
    if (isEditing && editingTask) {
      updateTask(editingTask.id, {
        title: title.trim(),
        notes: notes.trim(),
        priority,
        category,
        dueDate,
      });
    } else {
      addTask({
        title: title.trim(),
        notes: notes.trim(),
        priority,
        category,
        dueDate,
      });
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!editingTask) return;
    Alert.alert('Delete task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTask(editingTask.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const offset = currentDueOffset();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="close" size={26} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {isEditing ? 'Edit Task' : 'New Task'}
        </Text>
        <Pressable onPress={handleSave} hitSlop={10}>
          <Text style={[styles.saveText, { color: theme.accent }]}>Save</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="What do you need to do?"
          placeholderTextColor={theme.subtext}
          style={[styles.titleInput, { color: theme.text, backgroundColor: theme.card }]}
          autoFocus={!isEditing}
          returnKeyType="next"
        />

        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Add notes (optional)"
          placeholderTextColor={theme.subtext}
          style={[styles.notesInput, { color: theme.text, backgroundColor: theme.card }]}
          multiline
          textAlignVertical="top"
        />

        <Text style={[styles.sectionLabel, { color: theme.subtext }]}>CATEGORY</Text>
        <View style={styles.wrapRow}>
          {CATEGORIES.map((c) => {
            const active = category === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => setCategory(c.id)}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: active ? c.color : theme.card,
                    borderColor: c.color,
                  },
                ]}
              >
                <Ionicons name={c.icon} size={14} color={active ? '#fff' : c.color} />
                <Text style={[styles.optionChipText, { color: active ? '#fff' : c.color }]}>
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: theme.subtext }]}>PRIORITY</Text>
        <View style={styles.wrapRow}>
          {(Object.keys(PRIORITY_META) as Priority[]).map((p) => {
            const meta = PRIORITY_META[p];
            const active = priority === p;
            return (
              <Pressable
                key={p}
                onPress={() => setPriority(p)}
                style={[
                  styles.optionChip,
                  { backgroundColor: active ? meta.color : theme.card, borderColor: meta.color },
                ]}
              >
                <View style={[styles.dot, { backgroundColor: active ? '#fff' : meta.color }]} />
                <Text style={[styles.optionChipText, { color: active ? '#fff' : meta.color }]}>
                  {meta.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: theme.subtext }]}>DUE DATE</Text>
        <View style={styles.wrapRow}>
          {QUICK_DUE.map((q) => {
            const active =
              (q.value === null && offset === null) || (q.value !== null && offset === q.value);
            return (
              <Pressable
                key={q.label}
                onPress={() => setQuickDue(q.value)}
                style={[
                  styles.dueChip,
                  {
                    backgroundColor: active ? theme.accent : theme.card,
                    borderColor: active ? theme.accent : theme.border,
                  },
                ]}
              >
                <Text style={[styles.dueChipText, { color: active ? '#fff' : theme.text }]}>
                  {q.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isEditing && (
          <Pressable
            onPress={handleDelete}
            style={[styles.deleteBtn, { backgroundColor: theme.danger + '18' }]}
          >
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
            <Text style={[styles.deleteBtnText, { color: theme.danger }]}>Delete Task</Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  saveText: { fontSize: 16, fontWeight: '700' },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  notesInput: {
    fontSize: 15,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    minHeight: 90,
  },
  sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginTop: 24, marginBottom: 10 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  optionChipText: { fontSize: 13, fontWeight: '700' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dueChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  dueChipText: { fontSize: 13, fontWeight: '700' },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    marginTop: 36,
  },
  deleteBtnText: { fontSize: 15, fontWeight: '700' },
});
