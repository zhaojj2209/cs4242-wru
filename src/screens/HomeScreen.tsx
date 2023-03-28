import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import HomeTabs from './HomeTabs'
import ChatScreen from './ChatScreen'
import ChatDetailsScreen from './ChatDetailsScreen'

export type HomeStackParamList = {
  HomeTabs: undefined
  Chat: {
    user?: string
    chatID?: string
    title?: string
  }
  ChatDetails: {
    user?: string
    chatID?: string
    title?: string
  }
}

const Stack = createNativeStackNavigator<HomeStackParamList>()

const HomeScreen = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen options={{ headerShown: false }} name="HomeTabs" component={HomeTabs} />
      <Stack.Screen options={{ headerShown: false }} name="Chat" component={ChatScreen} />
      <Stack.Screen
        options={{ headerShown: false }}
        name="ChatDetails"
        component={ChatDetailsScreen}
      />
    </Stack.Navigator>
  )
}

export default HomeScreen
