import { StyleSheet, View } from 'react-native'
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat'
import { auth, db } from '../db/firebase'
import { Appbar, Button, Card, IconButton, Text, useTheme } from 'react-native-paper'
import { EventChat, Message, User } from '../util/types'
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  where,
  getDoc,
  getDocs,
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

  const [members, setMembers] = useState<User[]>([])

  useLayoutEffect(() => {
    const q = query(collection(db, 'chats', chatID, 'messages'), orderBy('createdAt', 'desc'))
    setLoading(true)
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docRef = doc(db, 'chats', chatID)
      getDoc(docRef).then((document) => {
        if (document.exists()) {
          const data = document.data()
          const memQ = query(collection(db, 'users'), where('uid', 'in', data.members))
          getDocs(memQ).then((docs) => {
            const membersArr: User[] = []
            docs.forEach((doc) => {
              membersArr.push(doc.data() as User)
            })
            setMembers(membersArr)
            // console.log(membersArr)

            setMessages(
              snapshot.docs.map((doc) => ({
                _id: doc.data()._id,
                createdAt: doc.data().createdAt.toDate(),
                text: doc.data().text,
                user: {
                  _id: doc.data().user._id,
                  name:
                    membersArr.find((user) => {
                      return user.uid == doc.data().user._id
                    })?.displayName ?? '',
                  avatar:
                    membersArr.find((user) => {
                      return user.uid == doc.data().user._id
                    })?.photoURL ?? '',
                },
              }))
            )
            setLoading(false)
          })
        }
      })
    })

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
        showUserAvatar={true}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: auth?.currentUser?.uid ?? 0,
          name:
            members.find((element) => {
              return element.uid == auth?.currentUser?.uid ?? 0
            })?.displayName ?? '',
          avatar:
            members.find((element) => {
              return element.uid == auth?.currentUser?.uid ?? 0
            })?.photoURL ?? '',
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
