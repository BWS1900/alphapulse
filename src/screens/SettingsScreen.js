// AlphaPulse — Settings Screen
// Account management, subscription, preferences
// TODO: Full UI polish when designer mockups are available

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';
import { useAuthStore, useSettingsStore } from '../stores';

export default function SettingsScreen() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const {
    theme, setTheme,
    showChangePercent, setShowChangePercent,
    hapticFeedback, setHapticFeedback,
    notificationsEnabled, setNotificationsEnabled,
    subscription,
  } = useSettingsStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.profileCard}>
          {isAuthenticated && user ? (
            <>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.planBadge}>
                <Text style={styles.planText}>
                  {user.plan === 'premium' ? '⭐ Premium' : 'Free'}
                </Text>
              </View>
            </>
          ) : (
            <View>
              <Text style={styles.notSignedIn}>Not signed in</Text>
              <TouchableOpacity style={styles.signInButton}>
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Subscription */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <View style={styles.subscriptionCard}>
          <Text style={styles.subscriptionPlan}>
            Current Plan: {subscription?.plan === 'premium' ? 'Premium' : 'Free'}
          </Text>
          {subscription?.plan === 'free' && (
            <TouchableOpacity style={styles.upgradeButton}>
              <Text style={styles.upgradeText}>Upgrade to Premium</Text>
              <Text style={styles.upgradePrice}>$9.99/mo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Dark Theme</Text>
          <Switch
            value={theme === 'dark'}
            onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
            trackColor={{ false: colors.border, true: colors.primaryDark }}
            thumbColor={theme === 'dark' ? colors.primary : colors.textMuted}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Show % Change</Text>
          <Switch
            value={showChangePercent}
            onValueChange={setShowChangePercent}
            trackColor={{ false: colors.border, true: colors.primaryDark }}
            thumbColor={showChangePercent ? colors.primary : colors.textMuted}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Haptic Feedback</Text>
          <Switch
            value={hapticFeedback}
            onValueChange={setHapticFeedback}
            trackColor={{ false: colors.border, true: colors.primaryDark }}
            thumbColor={hapticFeedback ? colors.primary : colors.textMuted}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.border, true: colors.primaryDark }}
            thumbColor={notificationsEnabled ? colors.primary : colors.textMuted}
          />
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutText}>AlphaPulse v1.0.0</Text>
          <Text style={styles.aboutSubtext}>
            Real-time market data for retail traders
          </Text>
        </View>
      </View>

      {/* Sign Out */}
      {isAuthenticated && (
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.presets.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  profileCard: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.base,
    padding: spacing.base,
  },
  userName: {
    ...typography.presets.h3,
    color: colors.textPrimary,
  },
  userEmail: {
    ...typography.presets.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  planBadge: {
    backgroundColor: colors.primaryDark,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  planText: {
    ...typography.presets.caption,
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  notSignedIn: {
    ...typography.presets.body,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  signInButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.base,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    alignSelf: 'flex-start',
  },
  signInText: {
    ...typography.presets.bodyBold,
    color: colors.textOnPrimary,
  },
  subscriptionCard: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.base,
    padding: spacing.base,
  },
  subscriptionPlan: {
    ...typography.presets.body,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  upgradeButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.base,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  upgradeText: {
    ...typography.presets.bodyBold,
    color: '#FFFFFF',
  },
  upgradePrice: {
    ...typography.presets.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.base,
    padding: spacing.base,
    marginBottom: spacing.xs,
  },
  settingLabel: {
    ...typography.presets.body,
    color: colors.textPrimary,
  },
  aboutCard: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.base,
    padding: spacing.base,
  },
  aboutText: {
    ...typography.presets.bodyBold,
    color: colors.textPrimary,
  },
  aboutSubtext: {
    ...typography.presets.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.base,
    padding: spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    color: colors.error,
    ...typography.presets.bodyBold,
  },
});