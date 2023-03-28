import { StyleSheet } from 'react-native'
import React, { useCallback, useLayoutEffect, useState } from 'react'
import { ChatsStackParamList } from './ChatsTab'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat'
import { auth, db } from '../db/firebase'
import { Button, useTheme } from 'react-native-paper'
import { Message } from '../util/types'
import { useFocusEffect } from '@react-navigation/native'
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore'

type Props = NativeStackScreenProps<ChatsStackParamList, 'Chat'>

const ChatScreen = ({ route, navigation }: Props) => {
  const { user, chatID, title } = route.params
  const theme = useTheme()

  const [messages, setMessages] = useState<Message[]>([])

  useFocusEffect(
    useCallback(() => {
      setMessages([
        {
          _id: 1,
          text: 'Hello developer',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
      ])
    }, [])
  )

  useLayoutEffect(() => {
    const q = query(
      collection(db, 'chats', chatID ? chatID : 'err', 'messages'),
      orderBy('createdAt', 'desc')
    )
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

    return () => {
      unsubscribe()
    }
  }, [navigation])

  const onSend = useCallback((messages: Message[]) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messages))

    const { _id, createdAt, text, user } = messages[0]
    addDoc(collection(db, 'chats', chatID ?? 'err', 'messages'), { _id, createdAt, text, user })
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
        <Button style={styles.button} mode="contained" icon="send" children={undefined} />
      </Send>
    )
  }

  return (
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
  )
}

export default ChatScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    width: '80%',
  },
  input: {
    margin: 5,
  },
  buttonContainer: {
    width: '60%',
    marginTop: 20,
  },
  button: {
    margin: 5,
  },
})
