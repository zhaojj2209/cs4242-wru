import React from 'react'
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs'
import SettingsScreen from './SettingsScreen'
import DiscoverScreen from './DiscoverScreen'
import ChatsScreen from './ChatsScreen'

export type HomeTabParamList = {
  Discover: undefined
  Chats: undefined
  Settings: undefined
}

const Tab = createMaterialBottomTabNavigator<HomeTabParamList>()

const HomeScreen = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: 'map-search-outline',
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{
          tabBarLabel: 'Chats',
          tabBarIcon: 'chat-outline',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: 'cog-outline',
        }}
      />
    </Tab.Navigator>
  )
}

export default HomeScreen
