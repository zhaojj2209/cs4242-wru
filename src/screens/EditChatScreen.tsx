import { Alert, StyleSheet, View } from 'react-native'
import React from 'react'
import { Appbar, Text } from 'react-native-paper'
import { db } from '../db/firebase'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { doc, updateDoc } from 'firebase/firestore'
import EventChatForm from '../components/EventChatForm'
import { EventChatFormParams } from '../util/types'
import { HomeStackParamList } from './HomeScreen'

type Props = NativeStackScreenProps<HomeStackParamList, 'EditChat'>

const EditChatScreen = ({ route, navigation }: Props) => {
  const { chat } = route.params
  const handleEditChat = (data: EventChatFormParams) => {
    if (!chat) {
      Alert.alert('Error: Chat does not exist!')
      return
    }
    const docRef = doc(db, 'chats', chat.id)
    updateDoc(docRef, {
      ...data,
    })
      .then(() => {
        Alert.alert('Update success!', '', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ])
      })
      .catch((error) => Alert.alert(error))
  }

  return (
    <View style={styles.container}>
      <Appbar.Header mode="center-aligned" elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Edit Chat" />
      </Appbar.Header>
      {!chat && <Text>Chat does not exist!</Text>}
      {chat && <EventChatForm navigation={navigation} onSubmit={handleEditChat} data={chat} />}
    </View>
  )
}

export default EditChatScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
