export type Priority = 'low' | 'medium' | 'high';

export const CATEGORIES = [
  { id: 'personal', label: 'Personal', color: '#7C6CF6', icon: 'person' as const },
  { id: 'work', label: 'Work', color: '#3B9EFF', icon: 'briefcase' as const },
  { id: 'shopping', label: 'Shopping', color: '#FF9F45', icon: 'cart' as const },
  { id: 'health', label: 'Health', color: '#3ECF8E', icon: 'fitness' as const },
  { id: 'other', label: 'Other', color: '#FF6584', icon: 'ellipsis-horizontal' as const },
];

export const PRIORITY_META: Record<Priority, { label: string; color: string }> = {
  low: { label: 'Low', color: '#3ECF8E' },
  medium: { label: 'Medium', color: '#FFB020' },
  high: { label: 'High', color: '#FF5A5F' },
};

export interface Theme {
  mode: 'light' | 'dark';
  bg: string;
  card: string;
  text: string;
  subtext: string;
  border: string;
  accent: string;
  accentSoft: string;
  danger: string;
  success: string;
  shadow: string;
  tabBar: string;
  inputBg: string;
}

export const lightTheme: Theme = {
  mode: 'light',
  bg: '#F7F7FB',
  card: '#FFFFFF',
  text: '#1C1B29',
  subtext: '#8A8A9A',
  border: '#ECECF4',
  accent: '#6C5CE7',
  accentSoft: '#EFECFE',
  danger: '#FF5A5F',
  success: '#3ECF8E',
  shadow: '#000000',
  tabBar: '#FFFFFF',
  inputBg: '#F1F1F7',
};

export const darkTheme: Theme = {
  mode: 'dark',
  bg: '#0F0E17',
  card: '#1A1926',
  text: '#F4F4F8',
  subtext: '#8A8896',
  border: '#28273A',
  accent: '#8B7CFB',
  accentSoft: '#2A2646',
  danger: '#FF6B6F',
  success: '#4EE2A0',
  shadow: '#000000',
  tabBar: '#161522',
  inputBg: '#232233',
};
