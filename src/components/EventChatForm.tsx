import { Alert, Keyboard, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import React, { useState } from 'react'
import { Button, Text, TextInput } from 'react-native-paper'
import DatePicker from '../components/DatePicker'
import { EventChat, EventChatFormParams } from '../util/types'
import { auth } from '../db/firebase'

export interface EventChatFormProps {
  navigation: any
  onSubmit: (data: EventChatFormParams) => void
  data?: EventChat
}

const EventChatForm = ({ navigation, data, onSubmit }: EventChatFormProps) => {
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

  const handleSubmit = () => {
    if (!data) {
      if (!auth.currentUser) {
        Alert.alert('Error: Not signed in!')
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
      onSubmit(data)
    } else {
      const newData = {
        ...data,
        title,
        description,
        startDate,
        endDate,
      }
      onSubmit(newData)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
          <TextInput
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            multiline
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
          <Button mode="contained" onPress={handleSubmit} style={styles.button}>
            Submit
          </Button>
          <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
            Cancel
          </Button>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

export default EventChatForm

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 40,
  },
  inputContainer: {
    width: '100%',
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
})
