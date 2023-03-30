import { StyleSheet, View } from 'react-native'
import React, { useCallback, useLayoutEffect, useState } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat'
import { auth, db } from '../db/firebase'
import { Appbar, IconButton, useTheme } from 'react-native-paper'
import { Message } from '../util/types'
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore'
import { HomeStackParamList } from './HomeScreen'

type Props = NativeStackScreenProps<HomeStackParamList, 'Chat'>

const ChatScreen = ({ route, navigation }: Props) => {
  const { user, chatID, title } = route.params
  const theme = useTheme()

  const [messages, setMessages] = useState<Message[]>([])

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
  container: {
    flex: 1,
    paddingBottom: 40,
  },
})
