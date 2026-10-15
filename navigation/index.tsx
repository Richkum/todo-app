import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppTheme } from '../lib/ThemeContext';
import HomeScreen from '../screens/HomeScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddEditTaskScreen from '../screens/AddEditTaskScreen';
import type { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function Tabs() {
  const { theme } = useAppTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.subtext,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          height: 84,
          paddingTop: 8,
          paddingBottom: 26,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }) => {
          let name: keyof typeof Ionicons.glyphMap = 'list';
          if (route.name === 'Tasks') name = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          if (route.name === 'Stats') name = focused ? 'stats-chart' : 'stats-chart-outline';
          if (route.name === 'Settings') name = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={name} size={size - 2} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Tasks" component={HomeScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { theme } = useAppTheme();
  return (
    <NavigationContainer
      theme={{
        dark: theme.mode === 'dark',
        colors: {
          primary: theme.accent,
          background: theme.bg,
          card: theme.card,
          text: theme.text,
          border: theme.border,
          notification: theme.accent,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '800' },
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen
          name="EditTask"
          component={AddEditTaskScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
