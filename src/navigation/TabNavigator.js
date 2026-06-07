// AlphaPulse — Tab Navigator
// Per designer spec: 5 tabs (Home, Markets, Watchlist, Alerts, Profile)
// Height: 64px + safe area, dark bg with top border

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

import DashboardScreen from '../screens/DashboardScreen';
import AlertsScreen from '../screens/AlertsScreen';
import WatchlistManagementScreen from '../screens/WatchlistManagementScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    home: '🔥',
    markets: '📊',
    watchlist: '⭐',
    alerts: '🔔',
    profile: '⚙️',
  };

  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>
        {icons[name] || '●'}
      </Text>
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Markets"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Markets',
          tabBarIcon: ({ focused }) => <TabIcon name="markets" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Watchlist"
        component={WatchlistManagementScreen}
        options={{
          tabBarLabel: 'Watchlist',
          tabBarIcon: ({ focused }) => <TabIcon name="watchlist" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ focused }) => <TabIcon name="alerts" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bgSurface,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    borderTopWidth: 1,
    paddingTop: 4,
    height: 64,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 4,
  },
  tabItem: {
    paddingVertical: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  iconContainerActive: {},
  icon: {
    fontSize: 20,
    opacity: 0.5,
  },
  iconFocused: {
    opacity: 1,
  },
});