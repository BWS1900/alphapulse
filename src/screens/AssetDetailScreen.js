// AlphaPulse — Asset Detail Screen
// Chart (candlestick/line), technical indicators, sentiment, on-chain data
// TODO: Implement charting and full detail when designer mockups are available

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors, typography, spacing } from '../theme';
import { useAssetStore } from '../stores';

export default function AssetDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const { selectedAsset, priceHistory, isLoading, selectAsset, loadPriceHistory } = useAssetStore();

  useEffect(() => {
    if (symbol) {
      selectAsset(symbol);
      loadPriceHistory(symbol);
    }
  }, [symbol]);

  if (isLoading || !selectedAsset) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading asset data...</Text>
        </View>
      </View>
    );
  }

  const isPositive = (selectedAsset.change ?? 0) >= 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Price Header */}
      <View style={styles.priceHeader}>
        <Text style={styles.symbol}>{selectedAsset.symbol}</Text>
        <Text style={styles.name}>{selectedAsset.name}</Text>
        <Text style={styles.price}>
          ${selectedAsset.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Text>
        <View style={styles.changeRow}>
          <Text style={[styles.change, { color: isPositive ? colors.bullish : colors.bearish }]}>
            {isPositive ? '+' : ''}
            {selectedAsset.change?.toFixed(2)} ({selectedAsset.changePercent?.toFixed(2)}%)
          </Text>
        </View>
      </View>

      {/* Chart Placeholder */}
      <View style={styles.chartPlaceholder}>
        <Text style={styles.placeholderText}>📈 Chart Coming Soon</Text>
        <Text style={styles.placeholderSubtext}>
          {priceHistory ? `${priceHistory.data.length} data points loaded` : 'Loading chart data...'}
        </Text>
      </View>

      {/* Details Grid */}
      <View style={styles.detailsGrid}>
        <DetailItem label="24h High" value={`$${selectedAsset.high24h?.toLocaleString() ?? '--'}`} />
        <DetailItem label="24h Low" value={`$${selectedAsset.low24h?.toLocaleString() ?? '--'}`} />
        <DetailItem label="24h Volume" value={selectedAsset.volume24h ? formatVolume(selectedAsset.volume24h) : '--'} />
        <DetailItem label="Type" value={selectedAsset.type?.toUpperCase() ?? '--'} />
      </View>
    </ScrollView>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) return `$${(volume / 1_000_000_000).toFixed(2)}B`;
  if (volume >= 1_000_000) return `$${(volume / 1_000_000).toFixed(2)}M`;
  if (volume >= 1_000) return `$${(volume / 1_000).toFixed(2)}K`;
  return `$${volume.toFixed(2)}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.base,
    paddingBottom: spacing['5xl'],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    ...typography.presets.body,
  },
  priceHeader: {
    marginBottom: spacing.xl,
  },
  symbol: {
    ...typography.presets.h2,
    color: colors.textPrimary,
  },
  name: {
    ...typography.presets.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  price: {
    ...typography.presets.priceLarge,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  change: {
    ...typography.presets.mono,
    fontSize: 16,
    fontWeight: '600',
  },
  chartPlaceholder: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  placeholderText: {
    ...typography.presets.h3,
    color: colors.textMuted,
  },
  placeholderSubtext: {
    ...typography.presets.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  detailItem: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: spacing.base,
    width: '48%',
  },
  detailLabel: {
    ...typography.presets.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    ...typography.presets.bodyBold,
    color: colors.textPrimary,
  },
});