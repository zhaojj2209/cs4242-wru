import {
  Alert,
  Keyboard,
  StyleSheet,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { Button, List, Modal, Portal, Provider, Text, TextInput } from 'react-native-paper'
import DatePicker from '../components/DatePicker'
import { EventChat, EventChatFormParams, LocationData } from '../util/types'
import { auth } from '../db/firebase'
import MapView from 'react-native-maps'

import axios from 'axios'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'

export interface EventChatFormProps {
  navigation: any
  onSubmit: (data: EventChatFormParams) => void
  data?: EventChat
}

const key = 'AIzaSyCDjmy606TvoOLTa6apk2uYtdX-sX4dI1w'

const EventChatForm = ({ navigation, data, onSubmit }: EventChatFormProps) => {
  const ONE_HOUR_IN_MILLISECONDS = 3600 * 1000

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date(startDate.getTime() + ONE_HOUR_IN_MILLISECONDS))

  const [modalVisible, setModalVisible] = useState(false)
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState<LocationData>({
    placeId: '',
    description: '',
    location: undefined,
  })

  useEffect(() => {
    if (data) {
      setTitle(data.title)
      setDescription(data.description)
      setStartDate(data.startDate.toDate())
      setEndDate(data.endDate.toDate())
      setLocation(data.location)
    }
  }, [data])

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
        location,
      }
      onSubmit(data)
    } else {
      const newData = {
        ...data,
        title,
        description,
        startDate,
        endDate,
        location,
      }
      onSubmit(newData)
    }
  }

  const testmap = () => {
    const config = {
      method: 'get',
      url: 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Museum%20of%20Contemporary%20Art%20Australia&inputtype=textquery&fields=formatted_address%2Cname%2Crating%2Copening_hours%2Cgeometry&key=AIzaSyCDjmy606TvoOLTa6apk2uYtdX-sX4dI1w',
      headers: {},
    }

    axios(config)
      .then((response: { data: any }) => {
        console.log(JSON.stringify(response.data))
      })
      .catch((error: any) => {
        console.log(error)
      })
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
            Location:
          </Text>
          <TouchableHighlight underlayColor="#DDDDDD" onPress={() => setModalVisible(true)}>
            <List.Item
              title="Add Location"
              left={(props) => <List.Icon {...props} icon="map-marker" />}
            />
          </TouchableHighlight>
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
        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <Text style={styles.modalHeader}>Search Location</Text>
            <GooglePlacesAutocomplete
              placeholder="Type a place..."
              query={{ key: key }}
              fetchDetails={true}
              debounce={100}
              onPress={(data, details = null) => {
                setLocation({
                  placeId: data.place_id,
                  description: data.description,
                  location: details?.geometry.location,
                })
                setModalVisible(false)
              }}
              onFail={(error) => console.log(error)}
              onNotFound={() => console.log('no results')}
              listEmptyComponent={() => (
                <View style={{ flex: 1 }}>
                  <Text>No results were found</Text>
                </View>
              )}
              styles={{
                textInput: {
                  height: 38,
                  color: '#5d5d5d',
                  fontSize: 16,
                },
              }}
            />
            <Button
              mode="contained"
              onPress={() => {
                setModalVisible(false)
              }}
            >
              Cancel
            </Button>
            {/* <Button mode="outlined" onPress={() => testmap()}>Test</Button> */}
          </Modal>
        </Portal>
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
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    height: '90%',
    alignContent: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
  },
  modalHeader: {
    textAlign: 'center',
    margin: 5,
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
