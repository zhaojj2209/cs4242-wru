import { StyleSheet, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import MapView, { Callout, Marker } from 'react-native-maps'
import { getCurrentPositionAsync, requestForegroundPermissionsAsync } from 'expo-location'
import { ActivityIndicator, Text } from 'react-native-paper'
import { EventChat } from '../util/types'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../db/firebase'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { DiscoverStackParamList } from './DiscoverTab'

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
    getDocs(collection(db, 'chats')).then((docs) => {
      const events: EventChat[] = []
      docs.forEach((doc) => {
        events.push({
          id: doc.id,
          ...doc.data(),
        } as EventChat)
      })
      setEvents(events)
    })
  }, [])

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
})
