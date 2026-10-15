import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Priority } from './theme';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  completed: boolean;
  priority: Priority;
  category: string;
  dueDate: string | null; // ISO date string
  createdAt: string;
  completedAt: string | null;
}

interface TaskContextValue {
  tasks: Task[];
  loading: boolean;
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'completed' | 'completedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  clearCompleted: () => void;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

const STORAGE_KEY = '@todoapp/tasks_v1';

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const SEED: Task[] = [
  {
    id: uid(),
    title: 'Welcome to Tasko \u2728',
    notes: 'Swipe left on a task to delete it, or tap the circle to complete it.',
    completed: false,
    priority: 'medium',
    category: 'other',
    dueDate: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: uid(),
    title: 'Finish quarterly report',
    notes: 'Include Q3 metrics and forecasts',
    completed: false,
    priority: 'high',
    category: 'work',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: uid(),
    title: 'Buy groceries',
    notes: 'Milk, eggs, spinach, coffee',
    completed: false,
    priority: 'low',
    category: 'shopping',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: uid(),
    title: 'Morning run',
    completed: true,
    priority: 'medium',
    category: 'health',
    dueDate: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date().toISOString(),
  },
];

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setTasks(JSON.parse(raw));
        } catch {
          setTasks(SEED);
        }
      } else {
        setTasks(SEED);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, loading]);

  const addTask: TaskContextValue['addTask'] = useCallback((t) => {
    const newTask: Task = {
      ...t,
      id: uid(),
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  const updateTask: TaskContextValue['updateTask'] = useCallback((id, updates) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const deleteTask: TaskContextValue['deleteTask'] = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleComplete: TaskContextValue['toggleComplete'] = useCallback((id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : null,
            }
          : t
      )
    );
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  }, []);

  const value = useMemo(
    () => ({ tasks, loading, addTask, updateTask, deleteTask, toggleComplete, clearCompleted }),
    [tasks, loading, addTask, updateTask, deleteTask, toggleComplete, clearCompleted]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
}
