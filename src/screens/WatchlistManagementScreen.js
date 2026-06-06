// AlphaPulse — Watchlist Management Screen
// Create/edit watchlists, search and add assets
// TODO: Full UI polish when designer mockups are available

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Alert,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';
import { useWatchlistStore, useAssetStore } from '../stores';

export default function WatchlistManagementScreen() {
  const {
    watchlists, loadWatchlists, createWatchlist, deleteWatchlist,
    activeWatchlistId, setActiveWatchlist,
  } = useWatchlistStore();
  const { searchResults, searchAssets, clearSearch } = useAssetStore();

  const [newName, setNewName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    loadWatchlists();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createWatchlist(newName.trim());
    setNewName('');
    setShowCreate(false);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Watchlist', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteWatchlist(id) },
    ]);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    searchAssets(text);
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search assets..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => { clearSearch(); setSearchQuery(''); }}>
            <Text style={styles.clearButton}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <View style={styles.searchResults}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.symbol}
            renderItem={({ item }) => (
              <View style={styles.searchItem}>
                <View>
                  <Text style={styles.searchSymbol}>{item.symbol}</Text>
                  <Text style={styles.searchName}>{item.name}</Text>
                </View>
                <Text style={styles.searchPrice}>
                  ${item.price?.toFixed(2)}
                </Text>
              </View>
            )}
          />
        </View>
      )}

      {/* Watchlists */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Watchlists</Text>
        <TouchableOpacity onPress={() => setShowCreate(true)}>
          <Text style={styles.addButton}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Create Form */}
      {showCreate && (
        <View style={styles.createForm}>
          <TextInput
            style={styles.createInput}
            placeholder="Watchlist name"
            placeholderTextColor={colors.textMuted}
            value={newName}
            onChangeText={setNewName}
            autoFocus
          />
          <View style={styles.createActions}>
            <TouchableOpacity onPress={() => setShowCreate(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCreate}>
              <Text style={styles.createButton}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Watchlist List */}
      <FlatList
        data={watchlists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.watchlistItem,
              item.id === activeWatchlistId && styles.watchlistItemActive,
            ]}
            onPress={() => setActiveWatchlist(item.id)}
            onLongPress={() => handleDelete(item.id, item.name)}
          >
            <View style={styles.watchlistInfo}>
              <Text style={styles.watchlistName}>{item.name}</Text>
              <Text style={styles.watchlistCount}>
                {item.assets?.length ?? 0} assets
              </Text>
            </View>
            {item.id === activeWatchlistId && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No watchlists yet. Create one to get started!
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
    padding: spacing.base,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.lg,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    ...typography.presets.body,
  },
  clearButton: {
    color: colors.primary,
    ...typography.presets.bodyBold,
  },
  searchResults: {
    marginBottom: spacing.lg,
  },
  searchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.base,
    marginBottom: spacing.xs,
  },
  searchSymbol: {
    ...typography.presets.bodyBold,
    color: colors.textPrimary,
  },
  searchName: {
    ...typography.presets.caption,
    color: colors.textSecondary,
  },
  searchPrice: {
    ...typography.presets.mono,
    color: colors.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.presets.h3,
    color: colors.textPrimary,
  },
  addButton: {
    color: colors.primary,
    ...typography.presets.bodyBold,
  },
  createForm: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.base,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  createInput: {
    backgroundColor: colors.bg,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    color: colors.textPrimary,
    ...typography.presets.body,
    marginBottom: spacing.sm,
  },
  createActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  cancelButton: {
    color: colors.textSecondary,
    ...typography.presets.bodyBold,
  },
  createButton: {
    color: colors.primary,
    ...typography.presets.bodyBold,
  },
  watchlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.base,
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  watchlistItemActive: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  watchlistInfo: {
    flex: 1,
  },
  watchlistName: {
    ...typography.presets.bodyBold,
    color: colors.textPrimary,
  },
  watchlistCount: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  activeBadgeText: {
    ...typography.presets.label,
    color: colors.textOnPrimary,
    fontSize: 10,
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing['4xl'],
  },
  emptyText: {
    ...typography.presets.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
});