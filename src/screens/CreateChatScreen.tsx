import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { Button, TextInput } from 'react-native-paper'
import { auth, db } from '../db/firebase'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ChatsStackParamList } from './ChatsTab'
import { addDoc, collection } from 'firebase/firestore'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'

type Props = NativeStackScreenProps<ChatsStackParamList, 'CreateChat'>

const CreateChatScreen = ({ navigation }: Props) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date())
  const [mode, setMode] = useState<'date' | 'time'>('date')
  const [openDatepicker, setOpenDatepicker] = useState(false)

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setOpenDatepicker(false)
    if (selectedDate) {
      setDate(selectedDate)
    }
  }

  const showMode = (currentMode: 'date' | 'time') => {
    if (Platform.OS === 'android') {
      setOpenDatepicker(false)
      // for iOS, add a button that closes the picker
    }
    setOpenDatepicker(true)
    setMode(currentMode)
  }

  const showDatepicker = () => {
    showMode('date')
  }

  const showTimepicker = () => {
    showMode('time')
  }

  const handleCreateChat = () => {
    if (!auth.currentUser) {
      return
    }
    const data = {
      title,
      description,
      date,
      creator: auth.currentUser.uid,
      members: [auth.currentUser.uid]
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
      <View style={styles.inputContainer}>
        <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
        />
        {Platform.OS === 'ios' && (
          <>
            <DateTimePicker
              value={date}
              mode={'datetime' as any}
              is24Hour={true}
              onChange={onChange}
            />
          </>
        )}
        {Platform.OS === 'android' && (
          <>
            <Button mode='contained-tonal' onPress={showDatepicker} style={styles.button}>
              {date.toDateString()}
            </Button>
            <Button mode='contained-tonal' onPress={showTimepicker} style={styles.button}>
              {date.getHours().toString().padStart(2, "0") + ':' + date.getMinutes().toString().padStart(2, "0")}
            </Button>
            {openDatepicker && (
              <DateTimePicker
                value={date}
                mode={mode}
                is24Hour={true}
                onChange={onChange}
              />
            )}
          </>
        )}
      </View>
      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={handleCreateChat} style={styles.button}>
          Create Chat
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
