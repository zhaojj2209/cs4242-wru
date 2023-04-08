import { StyleSheet, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { ActivityIndicator, Appbar, List } from 'react-native-paper'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { auth, db } from '../db/firebase'
import { EventChat } from '../util/types'
import { HomeStackParamList } from './HomeScreen'
import { HomeTabParamList } from './HomeTabs'

type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeTabParamList, 'ChatsTab'>,
  NativeStackScreenProps<HomeStackParamList>
>

const ChatsTab = ({ navigation }: Props) => {
  const [chats, setChats] = useState<EventChat[]>([])
  const [loading, setLoading] = useState(false)

  useFocusEffect(
    useCallback(() => {
      if (!auth.currentUser) {
        return
      }
      setLoading(true)
      const q = query(
        collection(db, 'chats'),
        where('members', 'array-contains', auth.currentUser.uid)
      )
      getDocs(q).then((docs) => {
        const data: EventChat[] = []
        docs.forEach((doc) => {
          data.push({
            id: doc.id,
            ...doc.data(),
          } as EventChat)
        })
        setChats(data)
        setLoading(false)
      })
    }, [])
  )

  const navigateChat = (chat: EventChat) => {
    if (!auth.currentUser) {
      return
    }
    navigation.navigate('Chat', {
      user: auth.currentUser.uid,
      chatID: chat.id,
      title: chat.title,
    })
  }

  return (
    <View style={styles.container}>
      <Appbar.Header mode="center-aligned" elevated>
        <Appbar.Content title="Chats" />
        <Appbar.Action
          icon="square-edit-outline"
          onPress={() => navigation.navigate('CreateChat')}
        />
      </Appbar.Header>
      <List.Section>
        {loading && <ActivityIndicator />}
        {chats.map((chat) => (
          <List.Item
            key={chat.id}
            title={chat.title}
            description={chat.description}
            left={(props) => <List.Icon {...props} icon="chat" />}
            onPress={() => navigateChat(chat)}
          />
        ))}
      </List.Section>
    </View>
  )
}

export default ChatsTab

const styles = StyleSheet.create({
  container: {},
})
