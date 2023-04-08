import { Alert, ScrollView, StyleSheet, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Appbar,
  Avatar,
  Button,
  Card,
  IconButton,
  List,
  Text,
} from 'react-native-paper'
import { HomeStackParamList } from './HomeScreen'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useFocusEffect } from '@react-navigation/native'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { auth, db } from '../db/firebase'
import { EventChat, User } from '../util/types'
import EventDetailsCard from '../components/EventDetailsCard'

type Props = NativeStackScreenProps<HomeStackParamList, 'ChatDetails'>

const ChatDetailsScreen = ({ route, navigation }: Props) => {
  const { chatID } = route.params
  const [details, setDetails] = useState<EventChat | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [isCreator, setIsCreator] = useState(false)
  const [members, setMembers] = useState<User[]>([])

  useFocusEffect(
    useCallback(() => {
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
          const q = query(collection(db, 'users'), where('uid', 'in', data.members))
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

  const navigateEdit = () => {
    if (!details) {
      return
    }
    navigation.navigate('EditChat', { chat: details })
  }

  const handleDelete = () => {
    Alert.alert('Confirm delete?', 'All messages will be deleted!', [
      {
        text: 'OK',
        onPress: () =>
          deleteDoc(doc(db, 'chats', chatID))
            .then(() =>
              navigation.replace('HomeTabs', {
                screen: 'ChatsTab',
              })
            )
            .catch((error) => Alert.alert(error)),
      },
      {
        text: 'Cancel',
      },
    ])
  }

  const handleLeave = () => {
    if (!details || !auth.currentUser) {
      return
    }
    Alert.alert('Confirm leave?', '', [
      {
        text: 'OK',
        onPress: () => {
          // splicing returns new array containing removed elements;
          // original array has the elements removed
          details.members.splice(details.members.indexOf(auth.currentUser?.uid ?? ''), 1)
          updateDoc(doc(db, 'chats', chatID), {
            members: details.members,
          })
            .then(() =>
              navigation.replace('HomeTabs', {
                screen: 'ChatsTab',
              })
            )
            .catch((error) => Alert.alert(error))
        },
      },
      {
        text: 'Cancel',
      },
    ])
  }

  const handleRemove = (user: User) => {
    if (!details || !auth.currentUser) {
      return
    }
    Alert.alert(`Remvove ${user.displayName ?? user.email}?`, '', [
      {
        text: 'OK',
        onPress: () => {
          // splicing returns new array containing removed elements;
          // original array has the elements removed
          details.members.splice(details.members.indexOf(user.uid), 1)
          updateDoc(doc(db, 'chats', chatID), {
            members: details.members,
          })
            .then(() => setMembers(members.filter((member) => member.uid !== user.uid)))
            .catch((error) => Alert.alert(error))
        },
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
        {isCreator && <Appbar.Action icon="square-edit-outline" onPress={navigateEdit} />}
      </Appbar.Header>
      <ScrollView>
        {loading && <ActivityIndicator />}
        {!loading && details && <EventDetailsCard details={details} />}
        <View style={styles.details}>
          <View style={styles.memberHeader}>
            <Text variant="titleLarge">Members:</Text>
            {isCreator && (
              <Button
                icon="plus"
                onPress={() =>
                  navigation.navigate('AddMembers', { chatID, members: details?.members ?? [] })
                }
              >
                Add members
              </Button>
            )}
          </View>
          <Card style={styles.members} mode="outlined">
            <Card.Content>
              <List.Section>
                {members.map((member) => (
                  <List.Item
                    key={member.uid}
                    title={member.displayName.length > 0 ? member.displayName : member.email}
                    left={(props) => (
                      <Avatar.Image {...props} size={48} source={{ uri: member.photoURL }} />
                    )}
                    right={(props) =>
                      isCreator && member.uid !== details?.creator ? (
                        <IconButton
                          {...props}
                          icon="account-remove"
                          onPress={() => handleRemove(member)}
                        />
                      ) : (
                        <></>
                      )
                    }
                  />
                ))}
              </List.Section>
            </Card.Content>
          </Card>
        </View>
        <View style={styles.buttons}>
          {isCreator ? (
            <Button mode="contained" buttonColor="red" onPress={handleDelete}>
              Delete Chat
            </Button>
          ) : (
            <Button mode="contained" buttonColor="red" onPress={handleLeave}>
              Leave Chat
            </Button>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default ChatDetailsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  details: {
    margin: 10,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  members: {
    marginTop: 20,
  },
  buttons: {
    margin: 10,
    alignItems: 'center',
  },
})
