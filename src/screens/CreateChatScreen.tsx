import { Alert, StyleSheet, View } from 'react-native'
import React from 'react'
import { Appbar } from 'react-native-paper'
import { db } from '../db/firebase'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ChatsStackParamList } from './ChatsTab'
import { addDoc, collection } from 'firebase/firestore'
import EventChatForm from '../components/EventChatForm'
import { EventChatFormParams } from '../util/types'

type Props = NativeStackScreenProps<ChatsStackParamList, 'CreateChat'>

const CreateChatScreen = ({ navigation }: Props) => {
  const handleCreateChat = (data: EventChatFormParams) => {
    addDoc(collection(db, 'chats'), data)
      .then(() => {
        Alert.alert('Chat created!', '', [
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
        <Appbar.Content title="Create Chat" />
      </Appbar.Header>
      <EventChatForm navigation={navigation} onSubmit={handleCreateChat} />
    </View>
  )
}

export default CreateChatScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
