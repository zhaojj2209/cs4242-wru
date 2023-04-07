import { StyleSheet, View } from 'react-native'
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat'
import { auth, db } from '../db/firebase'
import { Appbar, Button, Card, IconButton, Text, useTheme } from 'react-native-paper'
import { EventChat, Message } from '../util/types'
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  where,
  getDoc,
} from 'firebase/firestore'
import { HomeStackParamList } from './HomeScreen'
import ChatDirectionsCard from '../components/ChatDirectionsCard'

type Props = NativeStackScreenProps<HomeStackParamList, 'Chat'>

const ChatScreen = ({ route, navigation }: Props) => {
  const { user, chatID, title } = route.params
  const theme = useTheme()

  const [messages, setMessages] = useState<Message[]>([])

  const [loading, setLoading] = useState(false)
  const [details, setDetails] = useState<EventChat | undefined>(undefined)

  useLayoutEffect(() => {
    const q = query(collection(db, 'chats', chatID, 'messages'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) =>
      setMessages(
        snapshot.docs.map((doc) => ({
          _id: doc.data()._id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user,
        }))
      )
    )

    const docRef = doc(db, 'chats', chatID)
    getDoc(docRef).then((document) => {
      if (document.exists()) {
        const data = document.data()
        setDetails({
          id: chatID,
          ...data,
        } as EventChat)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [navigation])

  const onSend = useCallback((messages: Message[]) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messages))

    const { _id, createdAt, text, user } = messages[0]
    addDoc(collection(db, 'chats', chatID, 'messages'), { _id, createdAt, text, user })
  }, [])

  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        textStyle={{
          right: {
            color: 'white',
          },
          left: {
            color: 'black',
          },
        }}
        wrapperStyle={{
          right: {
            backgroundColor: theme.colors.onPrimaryContainer,
          },
          left: {
            backgroundColor: theme.colors.primaryContainer,
          },
        }}
      />
    )
  }

  const renderSend = (props: any) => {
    return (
      <Send {...props}>
        <IconButton mode="contained" icon="send" size={18} />
      </Send>
    )
  }

  return (
    <View style={styles.container}>
      <Appbar.Header mode="center-aligned" elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={title} />
        <Appbar.Action
          icon="dots-horizontal"
          onPress={() => navigation.navigate('ChatDetails', route.params)}
        />
      </Appbar.Header>
      {!loading && details && <ChatDirectionsCard event={details} />}

      <GiftedChat
        messages={messages}
        // showAvatarForEveryMessage={true}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: auth?.currentUser?.uid ?? 0,
          name: auth?.currentUser?.displayName ?? 'try',
          // avatar: auth?.currentUser?.photoURL
        }}
        renderBubble={renderBubble}
        renderSend={renderSend}
        alwaysShowSend={true}
        renderUsernameOnMessage={true}
      />
    </View>
  )
}

export default ChatScreen

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: 150,
  },
  container: {
    flex: 1,
    paddingBottom: 40,
  },
})
