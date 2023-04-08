import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import HomeTabs, { HomeTabParamList } from './HomeTabs'
import ChatScreen from './ChatScreen'
import ChatDetailsScreen from './ChatDetailsScreen'
import EditChatScreen from './EditChatScreen'
import { EventChat } from '../util/types'
import { NavigatorScreenParams } from '@react-navigation/native'
import AddMembersScreen from './AddMembersScreen'
import CreateChatScreen from './CreateChatScreen'

export type HomeStackParamList = {
  HomeTabs: NavigatorScreenParams<HomeTabParamList>
  Chat: {
    user: string
    chatID: string
    title: string
  }
  ChatDetails: {
    user: string
    chatID: string
    title: string
  }
  CreateChat: undefined
  EditChat: {
    chat: EventChat
  }
  AddMembers: {
    chatID: string
    members: string[]
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
      <Stack.Screen
        options={{ headerShown: false }}
        name="CreateChat"
        component={CreateChatScreen}
      />
      <Stack.Screen options={{ headerShown: false }} name="EditChat" component={EditChatScreen} />
      <Stack.Screen
        options={{ headerShown: false }}
        name="AddMembers"
        component={AddMembersScreen}
      />
    </Stack.Navigator>
  )
}

export default HomeScreen
