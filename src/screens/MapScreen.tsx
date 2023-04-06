import { ScrollView, StyleSheet, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import MapView, { Callout, Marker } from 'react-native-maps'
import { getCurrentPositionAsync, requestForegroundPermissionsAsync } from 'expo-location'
import {
  ActivityIndicator,
  Button,
  FAB,
  List,
  Modal,
  Portal,
  Searchbar,
  Text,
} from 'react-native-paper'
import { EventChat } from '../util/types'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../db/firebase'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { DiscoverStackParamList } from './DiscoverTab'
import { getSearchedEventsInOrder, sortInRecommendedOrder } from '../util/eventRecommendation'

type Props = NativeStackScreenProps<DiscoverStackParamList, 'Map'>

const MapScreen = ({ navigation }: Props) => {
  const sgCoords = {
    // Taken from google
    latitude: 1.3521,
    longitude: 103.8198,
    // Rough estimate to fit entire Sg map
    latitudeDelta: 0.8,
    longitudeDelta: 0.1,
  }
  const [coords, setCoords] = useState(sgCoords)
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<EventChat[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchedEvents, setSearchedEvents] = useState<EventChat[]>([])
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { status } = await requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setLoading(false)
        return
      }

      const location = await getCurrentPositionAsync({})
      setCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      })
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'chats'), where('isPublic', '==', true))
    getDocs(q).then((docs) => {
      const events: EventChat[] = []
      docs.forEach((doc) => {
        events.push({
          id: doc.id,
          ...doc.data(),
        } as EventChat)
      })
      setEvents(sortInRecommendedOrder(events))
    })
  }, [])

  useEffect(() => {
    if (searchQuery.length === 0) {
      setSearchedEvents([])
      return
    }
    setSearchedEvents(getSearchedEventsInOrder(events, searchQuery))
  }, [searchQuery])

  const getEventsList = (events: EventChat[]) => (
    <List.Section>
      {events.map((event) => (
        <List.Item
          key={event.id}
          title={event.title}
          description={event.description}
          onPress={() => {
            setSearchQuery('')
            setModalVisible(false)
            navigation.navigate('EventDetails', { event })
          }}
        />
      ))}
    </List.Section>
  )

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <MapView
          provider="google"
          style={styles.map}
          initialRegion={coords}
          showsUserLocation
          loadingEnabled
        >
          {events.map((event, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: event.location.location.lat,
                longitude: event.location.location.lng,
              }}
              title={event.title}
              description={event.description}
              tappable
            >
              <Callout onPress={() => navigation.navigate('EventDetails', { event })}>
                <Text variant="bodyLarge">{event.title}</Text>
                <Text>
                  {event.startDate.toDate().toLocaleDateString()}{' '}
                  {event.startDate.toDate().toLocaleTimeString()} -{' '}
                </Text>
                <Text>
                  {event.endDate.toDate().toLocaleDateString()}{' '}
                  {event.endDate.toDate().toLocaleTimeString()}
                </Text>
                <Text>Tap for more details</Text>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}
      <FAB icon="magnify" mode="flat" style={styles.fab} onPress={() => setModalVisible(true)} />
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Searchbar
            placeholder="Search events..."
            onChangeText={(query) => setSearchQuery(query)}
            value={searchQuery}
          />
          <ScrollView>
            {searchQuery.length === 0 && (
              <Text variant="bodyLarge" style={styles.recommendedLabel}>
                Recommended for You
              </Text>
            )}
            {getEventsList(searchQuery.length > 0 ? searchedEvents : events)}
          </ScrollView>
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
    </View>
  )
}

export default MapScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    top: 50,
  },
  recommendedLabel: {
    marginTop: 20,
    fontWeight: 'bold',
  },
})
