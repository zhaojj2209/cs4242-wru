import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import ChatsScreen from './ChatsScreen'
import CreateChatScreen from './CreateChatScreen'

export type ChatsStackParamList = {
  Chats: undefined
  CreateChat: undefined
}

const Stack = createNativeStackNavigator<ChatsStackParamList>()

const ChatsTab = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen options={{ headerShown: false }} name="Chats" component={ChatsScreen} />
      <Stack.Screen
        options={{ headerShown: false }}
        name="CreateChat"
        component={CreateChatScreen}
      />
    </Stack.Navigator>
  )
}

export default ChatsTab
