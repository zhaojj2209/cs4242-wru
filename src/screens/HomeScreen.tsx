import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import HomeTabs from './HomeTabs'
import ChatScreen from './ChatScreen'

export type HomeStackParamList = {
  HomeTabs: undefined
  Chat: {
    user: string | undefined
    chatID: string | undefined
    title: string | undefined
  }
}

const Stack = createNativeStackNavigator<HomeStackParamList>()

const HomeScreen = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen options={{ headerShown: false }} name="HomeTabs" component={HomeTabs} />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route, navigation }) => ({
          title: route.params.title,
          headerShown: false,
        })}
      />
    </Stack.Navigator>
  )
}

export default HomeScreen
