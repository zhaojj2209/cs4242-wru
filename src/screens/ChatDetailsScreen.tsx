import { Alert, StyleSheet, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Appbar,
  Avatar,
  Button,
  Card,
  Divider,
  List,
  Text,
} from 'react-native-paper'
import { HomeStackParamList } from './HomeScreen'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useFocusEffect } from '@react-navigation/native'
import { collection, deleteDoc, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { auth, db } from '../db/firebase'
import { EventChat, User } from '../util/types'

type Props = NativeStackScreenProps<HomeStackParamList, 'ChatDetails'>

const ChatDetailsScreen = ({ route, navigation }: Props) => {
  const { chatID } = route.params
  const [details, setDetails] = useState<EventChat | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [isCreator, setIsCreator] = useState(false)
  const [members, setMembers] = useState<User[]>([])

  useFocusEffect(
    useCallback(() => {
      if (!chatID) {
        Alert.alert('Error: Event does not exist!')
        navigation.goBack()
        return
      }
      setLoading(true)
      const docRef = doc(db, 'chats', chatID)
      getDoc(docRef).then((document) => {
        if (document.exists()) {
          const data = document.data()
          setDetails({
            id: chatID,
            ...data,
          } as EventChat)
          setIsCreator(data.creator === auth.currentUser?.uid)
          const q = query(
            collection(db, 'users'),
            where('uid', 'in', data.members)
          )
          getDocs(q).then((docs) => {
            const members: User[] = []
            docs.forEach((doc) => {
              members.push(doc.data() as User)
            })
            setMembers(members)
            setLoading(false)
          })
          setLoading(false)
        } else {
          Alert.alert('Error: Event does not exist!')
          navigation.goBack()
          setLoading(false)
        }
      })
    }, [])
  )

  const handleDelete = () => {
    if (!chatID) {
      return
    }
    Alert.alert('Confirm delete?', 'All messages will be deleted!', [
      {
        text: 'OK',
        onPress: () =>
          deleteDoc(doc(db, 'chats', chatID))
            .then(() =>
              Alert.alert('Chat deleted!', '', [
                {
                  text: 'OK',
                  onPress: () =>
                    navigation.replace('HomeTabs', {
                      screen: 'ChatsTab',
                    }),
                },
              ])
            )
            .catch((error) => Alert.alert(error)),
      },
      {
        text: 'Cancel',
      },
    ])
  }

  return (
    <View style={styles.container}>
      <Appbar.Header mode="center-aligned" elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`${details?.title ?? ''} Chat Details`} />
        {isCreator && (
          <Appbar.Action
            icon="square-edit-outline"
            onPress={() => navigation.navigate('EditChat', { chat: details })}
          />
        )}
      </Appbar.Header>
      {loading && <ActivityIndicator />}
      {!loading && (
        <Card style={styles.details}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.text}>
              Description: {details?.description}
            </Text>
            <Divider />
            <Text variant="titleMedium" style={styles.text}>
              Start date: {details?.startDate.toDate().toLocaleDateString()}{' '}
              {details?.startDate.toDate().toLocaleTimeString()}
            </Text>
            <Divider />
            <Text variant="titleMedium" style={styles.text}>
              End date: {details?.endDate.toDate().toLocaleDateString()}{' '}
              {details?.endDate.toDate().toLocaleTimeString()}
            </Text>
          </Card.Content>
        </Card>
      )}
      <View style={styles.details}>
        <View style={styles.memberHeader}>
          <Text variant="titleLarge">Members:</Text>
          <Button>Add members</Button>
        </View>
        <Card style={styles.members}>
          <Card.Content>
            <List.Section>
              {members.map((member, idx) => (
                <List.Item
                  key={idx}
                  title={member.displayName != "" ? member.displayName : member.email}
                  left={(props) => <Avatar.Image {...props} size={48} source={{ uri: member.photoURL }} />}
                />
              ))}
            </List.Section>
          </Card.Content>
        </Card>
      </View>
      <View style={styles.delete}>
        <Button mode="contained" buttonColor="red" onPress={handleDelete}>
          Delete Chat
        </Button>
      </View>
    </View>
  )
}

export default ChatDetailsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  details: {
    margin: 20,
  },
  text: {
    paddingVertical: 10,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  members: {
    marginTop: 20,
  },
  delete: {
    margin: 10,
    alignItems: 'center',
  },
})
