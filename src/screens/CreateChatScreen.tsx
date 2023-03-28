import { Alert, KeyboardAvoidingView, StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { Button, Text, TextInput } from 'react-native-paper'
import { auth, db } from '../db/firebase'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ChatsStackParamList } from './ChatsTab'
import { addDoc, collection } from 'firebase/firestore'
import DatePicker from '../components/DatePicker'

type Props = NativeStackScreenProps<ChatsStackParamList, 'CreateChat'>

const CreateChatScreen = ({ navigation }: Props) => {
  const ONE_HOUR_IN_MILLISECONDS = 3600 * 1000

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date(startDate.getTime() + ONE_HOUR_IN_MILLISECONDS))

  const handleChangeStartDate = (date: Date) => {
    setStartDate(date)
    if (date.getTime() > endDate.getTime()) {
      setEndDate(new Date(date.getTime() + ONE_HOUR_IN_MILLISECONDS))
    }
  }

  const handleCreateChat = () => {
    if (!auth.currentUser) {
      return
    }
    const data = {
      title,
      description,
      startDate,
      endDate,
      creator: auth.currentUser.uid,
      members: [auth.currentUser.uid],
    }
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
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <Text variant="headlineLarge" style={styles.titleText}>
        Create Event Chat
      </Text>
      <View style={styles.inputContainer}>
        <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
        />
        <Text variant="bodyLarge" style={styles.dateLabel}>
          Event start date:
        </Text>
        <DatePicker date={startDate} onChangeCallback={handleChangeStartDate} />
        <Text variant="bodyLarge" style={styles.dateLabel}>
          Event end date:
        </Text>
        <DatePicker date={endDate} onChangeCallback={setEndDate} />
      </View>
      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={handleCreateChat} style={styles.button}>
          Create Chat
        </Button>
        <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
          Cancel
        </Button>
      </View>
    </KeyboardAvoidingView>
  )
}

export default CreateChatScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    width: '75%',
    marginBottom: 40,
  },
  inputContainer: {
    width: '80%',
  },
  input: {
    margin: 5,
  },
  dateLabel: {
    marginLeft: 20,
    marginTop: 10,
  },
  buttonContainer: {
    width: '60%',
    marginTop: 40,
  },
  button: {
    margin: 5,
  },
  iosDatetime: {
    marginTop: 10,
    flexDirection: 'row',
  },
})
