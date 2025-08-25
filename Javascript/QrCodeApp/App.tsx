import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

// Import screens
import ContainersScreen from './screens/ContainersScreen';
import ContainerDetailScreen from './screens/ContainerDetailScreen';
import CreateContainerScreen from './screens/CreateContainerScreen';
import EditContainerScreen from './screens/EditContainerScreen';
import AddItemScreen from './screens/AddItemScreen';
import EditItemScreen from './screens/EditItemScreen';
import QRScannerScreen from './screens/QRScannerScreen';
import TransactionHistoryScreen from './screens/TransactionHistoryScreen';
import PrintQRScreen from './screens/PrintQRScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';

import { RootStackParamList, TabParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Container Stack Navigator
function ContainerStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={ContainersScreen} 
        options={{ title: 'My Containers' }}
      />
      <Stack.Screen 
        name="ContainerDetail" 
        component={ContainerDetailScreen} 
        options={{ title: 'Container Details' }}
      />
      <Stack.Screen 
        name="CreateContainer" 
        component={CreateContainerScreen} 
        options={{ title: 'Create Container' }}
      />
      <Stack.Screen 
        name="EditContainer" 
        component={EditContainerScreen} 
        options={{ title: 'Edit Container' }}
      />
      <Stack.Screen 
        name="AddItem" 
        component={AddItemScreen} 
        options={{ title: 'Add Item' }}
      />
      <Stack.Screen 
        name="EditItem" 
        component={EditItemScreen} 
        options={{ title: 'Edit Item' }}
      />
      <Stack.Screen 
        name="TransactionHistory" 
        component={TransactionHistoryScreen} 
        options={{ title: 'Transaction History' }}
      />
      <Stack.Screen 
        name="PrintQR" 
        component={PrintQRScreen} 
        options={{ title: 'QR Code' }}
      />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: styles.tabBar,
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Containers" 
        component={ContainerStack} 
        options={{
          tabBarLabel: 'Containers',
          tabBarIcon: ({ color, size }) => (
            <View style={[styles.tabIcon, { backgroundColor: color }]} />
          ),
        }}
      />
      <Tab.Screen 
        name="Scanner" 
        component={QRScannerScreen} 
        options={{
          tabBarLabel: 'Scan QR',
          tabBarIcon: ({ color, size }) => (
            <View style={[styles.tabIcon, { backgroundColor: color }]} />
          ),
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <View style={[styles.tabIcon, { backgroundColor: color }]} />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <View style={[styles.tabIcon, { backgroundColor: color }]} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <TabNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#f8f9fa',
    borderTopColor: '#e9ecef',
    borderTopWidth: 1,
    paddingVertical: 5,
  },
  tabIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
});