import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { useSettingsStore, useAuthStore } from './src/stores';
import { colors } from './src/theme';

export default function App() {
  const { loadSettings, hasOnboarded } = useSettingsStore();
  const { loadProfile } = useAuthStore();

  useEffect(() => {
    loadSettings();
    loadProfile();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
