// AlphaPulse — Asset Detail Screen
// Per designer mockup: price header, timeframe selector, full chart,
// metric tiles grid, news sentiment, and top stories

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';
import { useAssetStore } from '../stores';
import { useRoute, RouteProp } from '@react-navigation/native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TIMEFRAMES = ['1H', '24H', '7D', '1M', '1Y', 'ALL'] as const;

type AssetDetailRoute = RouteProp<{ AssetDetail: { symbol: string } }, 'AssetDetail'>;

export default function AssetDetailScreen() {
  const route = useRoute<AssetDetailRoute>();
  const symbol = route.params?.symbol;
  const { selectedAsset, isLoading, selectAsset } = useAssetStore();
  const [timeframe, setTimeframe] = useState<string>('24H');
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [chartHeight] = useState(240);

  useEffect(() => {
    if (symbol) {
      selectAsset(symbol);
    }
  }, [symbol]);

  if (isLoading || !selectedAsset) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.skeletonHeader} />
          <View style={styles.skeletonPrice} />
          <View style={styles.skeletonChart} />
        </View>
      </View>
    );
  }

  const isPositive = (selectedAsset.change ?? 0) >= 0;
  const price = selectedAsset.price ?? 0;
  const change = selectedAsset.change ?? 0;
  const changePercent = selectedAsset.changePercent ?? 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.symbol}>{selectedAsset.symbol}</Text>
          <Text style={styles.assetName}>{selectedAsset.name}</Text>
          {selectedAsset.type && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {selectedAsset.type === 'crypto' ? 'Crypto' : 'Stock'}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setIsWatchlisted(!isWatchlisted)}>
            <Text style={styles.starIcon}>{isWatchlisted ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.moreIcon}>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Price Header */}
      <View style={styles.priceSection}>
        <Text style={styles.price}>
          ${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Text>
        <View style={styles.changeRow}>
          <Text style={[styles.changeArrow, { color: isPositive ? colors.bullish : colors.bearish }]}>
            {isPositive ? '▲' : '▼'}
          </Text>
          <Text style={[styles.changePercent, { color: isPositive ? colors.bullish : colors.bearish }]}>
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}% (${Math.abs(change).toFixed(2)})
          </Text>
          <Text style={styles.todayLabel}>Today</Text>
        </View>
      </View>

      {/* Timeframe Selector */}
      <View style={styles.timeframeRow}>
        {TIMEFRAMES.map((tf) => (
          <TouchableOpacity
            key={tf}
            style={[styles.timeframeChip, timeframe === tf && styles.timeframeChipActive]}
            onPress={() => setTimeframe(tf)}
          >
            <Text style={[styles.timeframeText, timeframe === tf && styles.timeframeTextActive]}>
              {tf}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart Area */}
      <View style={[styles.chartContainer, { height: chartHeight }]}>
        <View style={styles.chartGrid}>
          {[...Array(4)].map((_, i) => (
            <View key={i} style={[styles.gridLine, { top: `${(i + 1) * 20}%` }]} />
          ))}
        </View>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartIcon}>📈</Text>
          <Text style={styles.chartPlaceholderText}>Chart Coming Soon</Text>
          <Text style={styles.chartPlaceholderSub}>
            React Native chart integration pending
          </Text>
        </View>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        <MetricTile label="Market Cap" value={formatLargeNumber(selectedAsset.marketCap || 1320000000000)} />
        <MetricTile label="Volume 24H" value={formatLargeNumber(selectedAsset.volume24h || 34500000000)} />
        <MetricTile label="24H High" value={`$${formatLargeNumber(selectedAsset.high24h || 68000)}`} />
        <MetricTile label="24H Low" value={`$${formatLargeNumber(selectedAsset.low24h || 66000)}`} />
      </View>

      {/* News Sentiment */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>News Sentiment ›</Text>
        </View>
        <SentimentBar bullish={32} neutral={45} bearish={23} totalArticles={142} />
      </View>

      {/* Top Stories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Stories</Text>
        <StoryItem title="BTC ETF inflows surge to record highs" />
        <StoryItem title="Analyst: $100K next as institutional adoption grows" />
        <StoryItem title="Fed decision impact on crypto markets analyzed" />
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricTile}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function SentimentBar({
  bullish, neutral, bearish, totalArticles,
}: {
  bullish: number; neutral: number; bearish: number; totalArticles: number;
}) {
  const total = bullish + neutral + bearish;
  const bPercent = (bullish / total) * 100;
  const nPercent = (neutral / total) * 100;
  const bePercent = (bearish / total) * 100;

  return (
    <View style={styles.sentimentContainer}>
      <View style={styles.barLabels}>
        <Text style={styles.sentimentLabel}>Bearish {bearish}%</Text>
        <Text style={styles.sentimentLabel}>Neutral {neutral}%</Text>
        <Text style={styles.sentimentLabel}>Bullish {bullish}%</Text>
      </View>
      <View style={styles.sentimentBarTrack}>
        <View style={[styles.sentimentBarSegment, { width: `${bePercent}%`, backgroundColor: colors.bearish }]} />
        <View style={[styles.sentimentBarSegment, { width: `${nPercent}%`, backgroundColor: colors.neutral }]} />
        <View style={[styles.sentimentBarSegment, { width: `${bPercent}%`, backgroundColor: colors.bullish }]} />
      </View>
      <Text style={styles.sentimentArticles}>{totalArticles} articles analyzed</Text>
    </View>
  );
}

function StoryItem({ title }: { title: string }) {
  return (
    <TouchableOpacity style={styles.storyItem}>
      <Text style={styles.storyBullet}>•</Text>
      <Text style={styles.storyTitle} numberOfLines={2}>{title}</Text>
    </TouchableOpacity>
  );
}

function formatLargeNumber(num: number): string {
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingBottom: spacing[10],
  },
  loadingContainer: {
    flex: 1,
    padding: spacing[4],
    gap: spacing[4],
  },
  skeletonHeader: {
    height: 24,
    width: '40%',
    backgroundColor: colors.shimmer,
    borderRadius: borderRadius.sm,
  },
  skeletonPrice: {
    height: 36,
    width: '50%',
    backgroundColor: colors.shimmer,
    borderRadius: borderRadius.sm,
  },
  skeletonChart: {
    height: 240,
    backgroundColor: colors.shimmer,
    borderRadius: borderRadius.base,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
  },
  symbol: {
    ...typography.presets.h1,
    color: colors.textPrimary,
  },
  assetName: {
    ...typography.presets.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  typeBadge: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: spacing[2],
  },
  typeBadgeText: {
    ...typography.presets.label,
    color: colors.textMuted,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing[3],
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 24,
  },
  moreIcon: {
    fontSize: 24,
    color: colors.textSecondary,
  },

  // Price
  priceSection: {
    paddingHorizontal: spacing[4],
    marginTop: spacing[4],
  },
  price: {
    ...typography.presets.priceHero,
    color: colors.textPrimary,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[2],
    gap: 6,
  },
  changeArrow: {
    fontSize: 14,
  },
  changePercent: {
    ...typography.presets.changeMono,
  },
  todayLabel: {
    ...typography.presets.caption,
    color: colors.textMuted,
    marginLeft: spacing[2],
  },

  // Timeframe
  timeframeRow: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    marginTop: spacing[4],
    marginBottom: spacing[3],
  },
  timeframeChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    backgroundColor: colors.bgCard,
  },
  timeframeChipActive: {
    backgroundColor: colors.primary,
  },
  timeframeText: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  timeframeTextActive: {
    color: colors.textOnPrimary,
  },

  // Chart
  chartContainer: {
    marginHorizontal: spacing[4],
    backgroundColor: colors.bgSurface,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: spacing[4],
  },
  chartGrid: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.chartGrid,
  },
  chartPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartIcon: {
    fontSize: 48,
    marginBottom: spacing[3],
  },
  chartPlaceholderText: {
    ...typography.presets.bodyBold,
    color: colors.textMuted,
  },
  chartPlaceholderSub: {
    ...typography.presets.caption,
    color: colors.textMuted,
    marginTop: spacing[1],
  },

  // Metrics
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing[4],
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  metricTile: {
    backgroundColor: colors.bgSurface,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    width: (SCREEN_WIDTH - spacing[4] * 2 - spacing[2]) / 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricLabel: {
    ...typography.presets.caption,
    color: colors.textMuted,
    marginBottom: spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    ...typography.presets.bodyBold,
    color: colors.textPrimary,
  },

  // Sentiment
  section: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  sectionTitle: {
    ...typography.presets.h3,
    color: colors.textPrimary,
    marginBottom: spacing[3],
  },
  sentimentContainer: {
    backgroundColor: colors.bgSurface,
    borderRadius: borderRadius.base,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  sentimentLabel: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  sentimentBarTrack: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  sentimentBarSegment: {
    height: '100%',
  },
  sentimentArticles: {
    ...typography.presets.caption,
    color: colors.textMuted,
    marginTop: spacing[2],
    textAlign: 'center',
  },

  // Stories
  storyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  storyBullet: {
    fontSize: 14,
    color: colors.primary,
    marginRight: spacing[2],
    marginTop: 2,
  },
  storyTitle: {
    ...typography.presets.body,
    color: colors.textPrimary,
    flex: 1,
  },

  bottomSpacer: {
    height: 40,
  },
});