import { StyleSheet, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import MapView from 'react-native-maps'
import { getCurrentPositionAsync, requestForegroundPermissionsAsync } from 'expo-location'
import { ActivityIndicator } from 'react-native-paper'

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

  useEffect(() => {
    (async () => {
      
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
        />
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
