import {
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import {
  Button,
  Chip,
  List,
  Modal,
  Portal,
  Switch,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper'
import DatePicker from '../components/DatePicker'
import { EventChat, EventChatFormParams, LocationData } from '../util/types'
import { auth } from '../db/firebase'

import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import SmallMapWithMarker from './SmallMapWithMarker'
import Tags from 'react-native-tags'

export interface EventChatFormProps {
  navigation: any
  onSubmit: (data: EventChatFormParams) => void
  data?: EventChat
}

const key = 'AIzaSyCDjmy606TvoOLTa6apk2uYtdX-sX4dI1w'

const EventChatForm = ({ navigation, data, onSubmit }: EventChatFormProps) => {
  const ONE_HOUR_IN_MILLISECONDS = 3600 * 1000

  const now = new Date()
  now.setMinutes(0)
  now.setSeconds(0)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState(new Date(now.getTime() + ONE_HOUR_IN_MILLISECONDS))
  const [endDate, setEndDate] = useState(new Date(startDate.getTime() + ONE_HOUR_IN_MILLISECONDS))
  const [isPublic, setIsPublic] = useState(false)
  const [tags, setTags] = useState<string[]>([])

  const theme = useTheme()

  const onToggleSwitch = () => setIsPublic(!isPublic)

  const [modalVisible, setModalVisible] = useState(false)
  const [location, setLocation] = useState<LocationData>({
    placeId: '',
    description: '',
    location: { lat: 0, lng: 0 },
  })

  useEffect(() => {
    if (data) {
      setTitle(data.title)
      setDescription(data.description)
      setStartDate(data.startDate.toDate())
      setEndDate(data.endDate.toDate())
      setLocation(data.location)
      setIsPublic(data.isPublic)
      setTags(data.tags)
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
        isPublic,
        tags,
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
        isPublic,
        tags,
      }
      onSubmit(newData)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.container}>
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
              title={
                location.location.lat !== 0 && location.location.lng !== 0
                  ? 'Change Location'
                  : 'Add Location'
              }
              left={(props) => <List.Icon {...props} icon="map-marker" />}
            />
          </TouchableHighlight>
          {location.location.lat !== 0 && location.location.lng !== 0 && (
            <View>
              <Text variant="bodyLarge" style={styles.dateLabel}>
                Selected: {location.description}
              </Text>
              <SmallMapWithMarker location={location} />
            </View>
          )}
          <Text variant="bodyLarge" style={styles.dateLabel}>
            Event start date:
          </Text>
          <DatePicker date={startDate} onChangeCallback={handleChangeStartDate} />
          <Text variant="bodyLarge" style={styles.dateLabel}>
            Event end date:
          </Text>
          <DatePicker date={endDate} onChangeCallback={setEndDate} />
          <Text variant="bodyLarge" style={styles.dateLabel}>
            Tags (optional):
          </Text>
          <Tags
            initialText=""
            textInputProps={{
              placeholder: 'Keywords to describe the event',
            }}
            initialTags={tags}
            onChangeTags={(tags) => setTags(tags)}
            inputStyle={{ backgroundColor: theme.colors.background }}
            renderTag={({ tag, index, onPress, deleteTagOnPress, readonly }) => (
              <Chip key={`${tag}-${index}`} onPress={onPress}>
                {tag}
              </Chip>
            )}
          />
          <View style={styles.switchContainer}>
            <Text variant="bodyLarge" style={styles.dateLabel}>
              Set event as public
            </Text>
            <Switch style={styles.switch} value={isPublic} onValueChange={onToggleSwitch} />
          </View>
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
              query={{ key }}
              fetchDetails={true}
              debounce={100}
              onPress={(data, details) => {
                setLocation({
                  placeId: data.place_id,
                  description: data.description,
                  location: details?.geometry.location ?? { lat: 0, lng: 0 },
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
          </Modal>
        </Portal>
      </ScrollView>
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
  },
  switch: {
    marginLeft: 10,
    marginTop: 10,
  },
})
