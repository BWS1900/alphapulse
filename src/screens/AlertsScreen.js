// AlphaPulse — Alerts Screen
// Price alerts and news sentiment triggers
// TODO: Full UI polish when designer mockups are available

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Switch, Alert,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';
import { useAlertStore } from '../stores';

const ALERT_TYPES = [
  { key: 'price_above', label: 'Price Above' },
  { key: 'price_below', label: 'Price Below' },
  { key: 'percent_change', label: '% Change' },
  { key: 'news_sentiment', label: 'News Sentiment' },
] as const;

export default function AlertsScreen() {
  const { alerts, loadAlerts, deleteAlert, toggleAlert, isLoading } = useAlertStore();

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleToggle = (id: string, currentEnabled: boolean) => {
    toggleAlert(id, !currentEnabled);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Alert', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAlert(id) },
    ]);
  };

  const getTypeLabel = (type: string) => {
    const found = ALERT_TYPES.find((t) => t.key === type);
    return found?.label ?? type;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alerts</Text>
        <Text style={styles.headerSubtitle}>
          {alerts.filter((a) => a.enabled).length} active alerts
        </Text>
      </View>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <View style={styles.alertInfo}>
                <Text style={styles.alertSymbol}>{item.symbol}</Text>
                <Text style={styles.alertType}>{getTypeLabel(item.type)}</Text>
              </View>
              <Switch
                value={item.enabled}
                onValueChange={() => handleToggle(item.id, item.enabled)}
                trackColor={{ false: colors.border, true: colors.primaryDark }}
                thumbColor={item.enabled ? colors.primary : colors.textMuted}
              />
            </View>

            <View style={styles.alertBody}>
              <Text style={styles.alertValue}>
                {item.type === 'price_above' || item.type === 'price_below'
                  ? `$${item.value?.toLocaleString()}`
                  : item.type === 'percent_change'
                  ? `${item.value}%`
                  : `${item.value} score`}
              </Text>
              {item.triggered && (
                <View style={styles.triggeredBadge}>
                  <Text style={styles.triggeredText}>Triggered</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No alerts yet</Text>
            <Text style={styles.emptyText}>
              Create alerts for price movements or news sentiment changes
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.presets.h1,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  list: {
    padding: spacing.base,
    paddingBottom: spacing['4xl'],
  },
  alertCard: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.base,
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertInfo: {
    flex: 1,
  },
  alertSymbol: {
    ...typography.presets.bodyBold,
    color: colors.textPrimary,
  },
  alertType: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  alertBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  alertValue: {
    ...typography.presets.mono,
    fontSize: 18,
    color: colors.textPrimary,
  },
  triggeredBadge: {
    backgroundColor: colors.warning,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  triggeredText: {
    ...typography.presets.label,
    color: '#000',
    fontSize: 10,
  },
  deleteButton: {
    marginTop: spacing.sm,
    alignSelf: 'flex-end',
  },
  deleteText: {
    color: colors.error,
    ...typography.presets.caption,
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing['5xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.base,
  },
  emptyTitle: {
    ...typography.presets.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.presets.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing['2xl'],
  },
});