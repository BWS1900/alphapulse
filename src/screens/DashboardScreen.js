// AlphaPulse — Dashboard Screen
// Per designer mockup: Portfolio header, trending scroll, watchlist with sparklines

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ScrollView,
  TouchableOpacity, Dimensions, RefreshControl,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';
import { useAssetStore, useWatchlistStore, useSettingsStore } from '../stores';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function DashboardScreen() {
  const { assets, loadAssets, isLoading } = useAssetStore();
  const { watchlists, loadWatchlists } = useWatchlistStore();
  const { hasOnboarded, loadSettings } = useSettingsStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAssets();
    loadWatchlists();
    loadSettings();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAssets();
    await loadWatchlists();
    setRefreshing(false);
  }, []);

  const displayAssets = assets.length > 0 ? assets : mockAssets;
  const trendingAssets = displayAssets.slice(0, 4);
  const watchlistAssets = displayAssets.slice(0, 5);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🔥 AlphaPulse</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn}>
              <Text style={styles.iconText}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Text style={styles.iconText}>💰</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Portfolio Card */}
        <TouchableOpacity style={styles.portfolioCard}>
          <Text style={styles.portfolioLabel}>My Portfolio</Text>
          <View style={styles.portfolioRow}>
            <Text style={styles.portfolioValue}>$124,532.80</Text>
            <View style={styles.portfolioChange}>
              <Text style={styles.arrowUp}>▲</Text>
              <Text style={styles.changePositive}>+3.2%</Text>
            </View>
          </View>
          {/* Sparkline placeholder */}
          <View style={styles.sparklineBar}>
            <View style={[styles.sparkFill, { width: '72%' }]} />
          </View>
        </TouchableOpacity>

        {/* Trending Now */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 Trending Now</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendingContainer}
        >
          {trendingAssets.map((item, index) => (
            <TrendingCard key={item.symbol || index} asset={item} />
          ))}
        </ScrollView>

        {/* Watchlist */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Watchlist ›</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {watchlistAssets.map((item, index) => (
          <AssetCard key={item.symbol || index} asset={item} />
        ))}

        {/* Add Asset */}
        <TouchableOpacity style={styles.addAsset}>
          <Text style={styles.addAssetIcon}>+</Text>
          <Text style={styles.addAssetText}>Add Asset</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function TrendingCard({ asset }: { asset: any }) {
  const change = asset.change ?? asset.changePercent ?? 0;
  const isUp = change >= 0;
  const barWidth = Math.min(Math.abs(change) * 10, 80);

  return (
    <TouchableOpacity style={styles.trendingCard}>
      <Text style={styles.trendingSymbol}>{asset.symbol || 'N/A'}</Text>
      <Text style={[styles.trendingChange, { color: isUp ? colors.bullish : colors.bearish }]}>
        {isUp ? '+' : ''}{change.toFixed(1)}%
      </Text>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            {
              width: `${barWidth}%`,
              backgroundColor: isUp ? colors.bullish : colors.bearish,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

function AssetCard({ asset }: { asset: any }) {
  const change = asset.change ?? asset.changePercent ?? 0;
  const isUp = change >= 0;
  const price = asset.price ?? 0;

  return (
    <TouchableOpacity style={styles.assetCard}>
      <View style={styles.assetLeft}>
        <View style={styles.assetSymbolRow}>
          <Text style={styles.assetSymbol}>{asset.symbol || 'N/A'}</Text>
          <Text style={styles.assetName} numberOfLines={1}>
            {asset.name || ''}
          </Text>
        </View>
        <Text style={styles.assetName} numberOfLines={1}>
          {asset.type === 'crypto' ? 'Crypto' : 'Stock'}
        </Text>
      </View>
      <View style={styles.assetRight}>
        <Text style={styles.assetPrice}>
          ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <View style={styles.assetChangeRow}>
          <Text style={[styles.changeArrow, { color: isUp ? colors.bullish : colors.bearish }]}>
            {isUp ? '▲' : '▼'}
          </Text>
          <Text style={[styles.assetChange, { color: isUp ? colors.bullish : colors.bearish }]}>
            {isUp ? '+' : ''}{change.toFixed(2)}%
          </Text>
        </View>
      </View>
      {/* Mini sparkline bar */}
      <View style={styles.miniSparkline}>
        <View style={[styles.miniSparkFill, {
          width: '60%',
          backgroundColor: isUp ? colors.bullish : colors.bearish,
        }]} />
      </View>
    </TouchableOpacity>
  );
}

// Mock data for development
const mockAssets = [
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', price: 67432.50, change: 2.34, changePercent: 2.34 },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto', price: 3421.00, change: -1.23, changePercent: -1.23 },
  { symbol: 'SOL', name: 'Solana', type: 'crypto', price: 145.20, change: 5.67, changePercent: 5.67 },
  { symbol: 'AVAX', name: 'Avalanche', type: 'crypto', price: 38.15, change: 0.89, changePercent: 0.89 },
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', price: 218.50, change: 1.12, changePercent: 1.12 },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
  },
  logo: {
    ...typography.presets.h2,
    color: colors.textPrimary,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
  },

  // Portfolio
  portfolioCard: {
    marginHorizontal: spacing[4],
    backgroundColor: colors.bgSurface,
    borderRadius: borderRadius.base,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing[4],
  },
  portfolioLabel: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginBottom: spacing[2],
  },
  portfolioRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  portfolioValue: {
    ...typography.presets.priceHero,
    color: colors.textPrimary,
  },
  portfolioChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrowUp: {
    fontSize: 14,
    color: colors.bullish,
  },
  changePositive: {
    ...typography.presets.changeMono,
    color: colors.bullish,
  },
  sparklineBar: {
    height: 4,
    backgroundColor: colors.bgCard,
    borderRadius: 2,
    marginTop: spacing[3],
    overflow: 'hidden',
  },
  sparkFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
    opacity: 0.5,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    marginBottom: spacing[3],
    marginTop: spacing[2],
  },
  sectionTitle: {
    ...typography.presets.h3,
    color: colors.textPrimary,
  },
  viewAll: {
    ...typography.presets.caption,
    color: colors.primary,
  },

  // Trending
  trendingContainer: {
    paddingHorizontal: spacing[4],
    gap: spacing[3],
    paddingBottom: spacing[4],
  },
  trendingCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    width: 130,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trendingSymbol: {
    ...typography.presets.bodyBold,
    color: colors.textPrimary,
  },
  trendingChange: {
    ...typography.presets.changeMono,
    marginTop: 2,
  },
  barTrack: {
    height: 4,
    backgroundColor: colors.bgCard,
    borderRadius: 2,
    marginTop: spacing[2],
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Asset cards (watchlist)
  assetCard: {
    marginHorizontal: spacing[4],
    backgroundColor: colors.bgSurface,
    borderRadius: borderRadius.base,
    padding: spacing[4],
    marginBottom: spacing[2],
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  assetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  assetSymbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  assetSymbol: {
    ...typography.presets.bodyBold,
    color: colors.textPrimary,
  },
  assetName: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginLeft: spacing[2],
  },
  assetRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[1],
  },
  assetPrice: {
    ...typography.presets.mono,
    color: colors.textPrimary,
    fontSize: 16,
  },
  assetChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeArrow: {
    fontSize: 12,
  },
  assetChange: {
    ...typography.presets.changeMono,
  },
  miniSparkline: {
    height: 3,
    backgroundColor: colors.bgCard,
    borderRadius: 1.5,
    marginTop: spacing[2],
    overflow: 'hidden',
  },
  miniSparkFill: {
    height: '100%',
    borderRadius: 1.5,
  },

  // Add asset
  addAsset: {
    marginHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.base,
    borderStyle: 'dashed',
    marginTop: spacing[2],
  },
  addAssetIcon: {
    fontSize: 20,
    color: colors.primary,
    marginRight: spacing[2],
  },
  addAssetText: {
    ...typography.presets.body,
    color: colors.primary,
  },

  bottomSpacer: {
    height: 100,
  },
});