import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Theme } from '../lib/theme';

export default function EmptyState({
  theme,
  icon,
  title,
  subtitle,
}: {
  theme: Theme;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconCircle, { backgroundColor: theme.accentSoft }]}>
        <Ionicons name={icon} size={36} color={theme.accent} />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.subtext }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 40 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 17, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
});
