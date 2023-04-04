import { StyleSheet, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import MapView, { Marker } from 'react-native-maps'
import { getCurrentPositionAsync, requestForegroundPermissionsAsync } from 'expo-location'
import { ActivityIndicator } from 'react-native-paper'
import { EventChat } from '../util/types'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../db/firebase'

const DiscoverTab = () => {
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
        const data = doc.data() as EventChat
        events.push(data)
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
            />
          ))}
        </MapView>
      )}
    </View>
  )
}

export default DiscoverTab

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
