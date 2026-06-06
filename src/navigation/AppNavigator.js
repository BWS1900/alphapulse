// AlphaPulse — Root App Navigator
// Handles auth flow, onboarding, and main app routing

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

import TabNavigator from './TabNavigator';
import { colors, typography } from '../theme';
import { useAuthStore, useSettingsStore } from '../stores';

// Lazy-loaded screens (will be fully implemented when designer mockups are ready)
// import OnboardingScreen from '../screens/OnboardingScreen';
// import AuthScreen from '../screens/AuthScreen';
import AssetDetailScreen from '../screens/AssetDetailScreen';

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>AlphaPulse</Text>
    </View>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { hasOnboarded } = useSettingsStore();

  // Show loading while checking auth state
  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: colors.primary,
          background: colors.bg,
          card: colors.bgSurface,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.error,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '900' },
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.bgSurface },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { ...typography.presets.bodyBold },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        {/* TODO: Add Onboarding screen when designer mockups are ready */}
        {/* {!hasOnboarded && (
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
        )} */}

        {/* TODO: Add Auth screen */}
        {/* {!isAuthenticated && (
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: false }}
          />
        )} */}

        {/* Main App */}
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />

        {/* Asset Detail (modal-like push from any tab) */}
        <Stack.Screen
          name="AssetDetail"
          component={AssetDetailScreen}
          options={({ route }) => ({
            title: (route.params as any)?.symbol ?? 'Asset Detail',
            headerBackTitle: 'Back',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.presets.h2,
    color: colors.primary,
    marginTop: spacing?.md ?? 12,
  },
});