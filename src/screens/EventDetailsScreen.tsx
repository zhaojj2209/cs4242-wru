import { Alert, ScrollView, StyleSheet, View } from 'react-native'
import React from 'react'
import { Appbar, Button } from 'react-native-paper'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../db/firebase'
import EventDetailsCard from '../components/EventDetailsCard'
import { DiscoverStackParamList } from './DiscoverTab'
import { CompositeScreenProps } from '@react-navigation/native'
import { HomeStackParamList } from './HomeScreen'

type Props = CompositeScreenProps<
  NativeStackScreenProps<DiscoverStackParamList, 'EventDetails'>,
  NativeStackScreenProps<HomeStackParamList>
>

const EventDetailsScreen = ({ route, navigation }: Props) => {
  const { event } = route.params

  const navigateChat = () =>
    navigation.push('Chat', {
      user: auth.currentUser?.uid ?? '',
      chatID: event.id,
      title: event.title,
    })

  const handleJoin = () => {
    Alert.alert('Confirm join?', 'You will be redirected to the chat after joining!', [
      {
        text: 'OK',
        onPress: () => {
          if (auth.currentUser) {
            event.members.push(auth.currentUser.uid)
            updateDoc(doc(db, 'chats', event.id), {
              members: event.members,
            })
              .then(navigateChat)
              .catch((error) => Alert.alert(error))
          }
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
        <Appbar.Content title={event.title} />
      </Appbar.Header>
      <ScrollView>
        <EventDetailsCard details={event} />
        <View style={styles.buttons}>
          {auth.currentUser && event.members.includes(auth.currentUser.uid) ? (
            <Button mode="contained" buttonColor="red" onPress={navigateChat}>
              Go to Chat
            </Button>
          ) : (
            <Button mode="contained" buttonColor="red" onPress={handleJoin}>
              Join Chat
            </Button>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default EventDetailsScreen

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
