import { StyleSheet } from 'react-native'
import React, { useCallback, useState } from 'react'
import { Button, List } from 'react-native-paper'
import { ChatsStackParamList } from './ChatsTab'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useFocusEffect } from '@react-navigation/native'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { auth, db } from '../db/firebase'
import { EventChat } from '../util/types'
import { SafeAreaView } from 'react-native-safe-area-context'

type Props = NativeStackScreenProps<ChatsStackParamList, 'Chats'>

const ChatsScreen = ({ navigation }: Props) => {
  const [chats, setChats] = useState<EventChat[]>([])

  useFocusEffect(
    useCallback(() => {
      if (!auth.currentUser) {
        return
      }
      const q = query(collection(db, 'chats'), where('members', 'array-contains', auth.currentUser.uid))
      getDocs(q)
        .then((docs) => {
          const data: EventChat[] = []
          docs.forEach((doc) => {
            data.push({
              id: doc.id,
              ...doc.data()
            } as EventChat)
          })
          setChats(data)
        })

    }, [])
  )

  return (
    <SafeAreaView style={styles.container}>
      <Button onPress={() => navigation.navigate('CreateChat')}>Create Event Chat</Button>
      <List.Section>
        {chats.map((chat) => (
          <List.Item
            key={chat.id}
            title={chat.title}
            description={chat.description}
            left={props => <List.Icon {...props} icon="chat" />}
          />
        ))}
      </List.Section>
    </SafeAreaView>
  )
}

export default ChatsScreen

const styles = StyleSheet.create({
  container: {
  },
})
