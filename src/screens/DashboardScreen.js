// AlphaPulse — Dashboard Screen
// Shows watchlist cards with price, change %, and sparkline charts
// TODO: Implement UI components when designer mockups are available

import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { colors, typography, spacing } from '../theme';
import { useWatchlistStore, useAssetStore } from '../stores';
import { useEffect } from 'react';

export default function DashboardScreen() {
  const { watchlists, loadWatchlists, activeWatchlistId, getActiveWatchlist } = useWatchlistStore();
  const { assets, loadAssets, isLoading } = useAssetStore();

  useEffect(() => {
    loadAssets();
    loadWatchlists();
  }, []);

  const activeWatchlist = getActiveWatchlist();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Markets</Text>
        <Text style={styles.subtitle}>
          {isLoading ? 'Loading...' : `${assets.length} assets tracked`}
        </Text>
      </View>

      <FlatList
        data={assets.slice(0, 5)}
        keyExtractor={(item) => item.symbol}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {isLoading ? 'Loading market data...' : 'No assets yet. Add some to your watchlist!'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.symbol}>{item.symbol}</Text>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.price}>
                ${item.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text
                style={[
                  styles.change,
                  { color: (item.change ?? 0) >= 0 ? colors.bullish : colors.bearish },
                ]}
              >
                {(item.change ?? 0) >= 0 ? '+' : ''}
                {item.changePercent?.toFixed(2) ?? '0.00'}%
              </Text>
            </View>
          </View>
        )}
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
  greeting: {
    ...typography.presets.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  list: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['4xl'],
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  cardLeft: {
    flex: 1,
  },
  symbol: {
    ...typography.presets.bodyBold,
    color: colors.textPrimary,
  },
  name: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  price: {
    ...typography.presets.mono,
    color: colors.textPrimary,
    fontSize: 16,
  },
  change: {
    ...typography.presets.mono,
    fontSize: 13,
    marginTop: 2,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    ...typography.presets.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
});