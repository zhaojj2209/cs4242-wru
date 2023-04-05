import React from 'react'
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs'
import SettingsTab from './SettingsTab'
import ChatsTab from './ChatsTab'
import DiscoverTab from './DiscoverTab'

export type HomeTabParamList = {
  DiscoverTab: undefined
  ChatsTab: undefined
  SettingsTab: undefined
}

const Tab = createMaterialBottomTabNavigator<HomeTabParamList>()

const HomeTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="DiscoverTab"
        component={DiscoverTab}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: 'map-search-outline',
        }}
      />
      <Tab.Screen
        name="ChatsTab"
        component={ChatsTab}
        options={{
          tabBarLabel: 'Chats',
          tabBarIcon: 'chat-outline',
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsTab}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: 'cog-outline',
        }}
      />
    </Tab.Navigator>
  )
}

export default HomeTabs
