import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  useNavigation,
  CompositeNavigationProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useAppTheme } from "../lib/ThemeContext";
import { useTasks } from "../lib/TaskContext";
import { CATEGORIES } from "../lib/theme";
import TaskItem from "../components/TaskItem";
import EmptyState from "../components/EmptyState";
import type { RootStackParamList, TabParamList } from "../navigation/types";

type HomeNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Tasks">,
  NativeStackNavigationProp<RootStackParamList>
>;

type Filter = "all" | "active" | "completed";

export default function HomeScreen() {
  const { theme } = useAppTheme();
  const { tasks, toggleComplete, deleteTask, loading } = useTasks();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<HomeNavProp>();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    let list = tasks;
    if (filter === "active") list = list.filter((t) => !t.completed);
    if (filter === "completed") list = list.filter((t) => t.completed);
    if (categoryFilter)
      list = list.filter((t) => t.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, filter, categoryFilter, search]);

  const activeCount = tasks.filter((t) => !t.completed).length;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.bg, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.subtext }]}>
            Your tasks
          </Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {activeCount} to do
          </Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate("Stats")}
          style={[styles.iconBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons name="stats-chart" size={20} color={theme.accent} />
        </Pressable>
      </View>

      <View style={[styles.searchBar, { backgroundColor: theme.inputBg }]}>
        <Ionicons name="search" size={18} color={theme.subtext} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search tasks..."
          placeholderTextColor={theme.subtext}
          style={[styles.searchInput, { color: theme.text }]}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={theme.subtext} />
          </Pressable>
        )}
      </View>

      <View style={styles.filterRow}>
        {(["all", "active", "completed"] as Filter[]).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === f ? theme.accent : theme.card,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === f ? "#fff" : theme.subtext },
              ]}
            >
              {f === "all" ? "All" : f === "active" ? "Active" : "Done"}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(c) => c.id}
        style={styles.categoryList}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        renderItem={({ item }) => {
          const active = categoryFilter === item.id;
          return (
            <Pressable
              onPress={() => setCategoryFilter(active ? null : item.id)}
              style={[
                styles.catChip,
                {
                  backgroundColor: active ? item.color : theme.card,
                  borderColor: item.color,
                },
              ]}
            >
              <Ionicons
                name={item.icon}
                size={13}
                color={active ? "#fff" : item.color}
              />
              <Text
                style={[
                  styles.catChipText,
                  { color: active ? "#fff" : item.color },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        }}
      />

      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent}
          />
        }
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            theme={theme}
            onToggle={() => toggleComplete(item.id)}
            onDelete={() => deleteTask(item.id)}
            onPress={() => navigation.navigate("EditTask", { taskId: item.id })}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              theme={theme}
              icon={search ? "search" : "checkmark-done-circle-outline"}
              title={search ? "No matching tasks" : "All clear!"}
              subtitle={
                search
                  ? "Try a different search term or clear filters."
                  : filter === "completed"
                  ? "No completed tasks yet."
                  : "Tap the + button to add your first task."
              }
            />
          ) : undefined
        }
      />

      <Pressable
        onPress={() => navigation.navigate("EditTask", { taskId: undefined })}
        style={[
          styles.fab,
          { backgroundColor: theme.accent, bottom: insets.bottom + 20 },
        ]}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  greeting: { fontSize: 13, fontWeight: "500" },
  headerTitle: { fontSize: 26, fontWeight: "800", marginTop: 2 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 8,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 14,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, height: "100%" },
  filterRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 14,
  },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filterText: { fontSize: 13, fontWeight: "700" },
  categoryList: { marginTop: 14, flexGrow: 0 },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
  },
  catChipText: { fontSize: 12, fontWeight: "700" },
  fab: {
    position: "absolute",
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
