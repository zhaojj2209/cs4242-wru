import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import ChatsScreen from './ChatsScreen'
import CreateChatScreen from './CreateChatScreen'
import Chat from './Chat'

export type ChatsStackParamList = {
  Chats: undefined
  CreateChat: undefined
  Chat: { 
    user: string|undefined,
    chatID: string|undefined,
    title: string|undefined
  }
}

const Stack = createNativeStackNavigator<ChatsStackParamList>()

const ChatsTab = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen options={{ headerShown: false }} name="Chats" component={ChatsScreen} />
      <Stack.Screen options={{ headerShown: false }} name="CreateChat" component={CreateChatScreen} />
      <Stack.Screen name="Chat" component={Chat} options={({ route, navigation }) => ({
        title: route.params.title,
      })}
      />
    </Stack.Navigator>
  )
}

export default ChatsTab