import { StyleSheet } from 'react-native'
import React from 'react'
import MapView, { Marker } from 'react-native-maps'
import { LocationData } from '../util/types'

interface Props {
  location: LocationData
}

const SmallMapWithMarker = ({ location }: Props) => {
  return (
    <MapView
      provider="google"
      style={styles.map}
      region={{
        latitude: location.location.lat,
        longitude: location.location.lng,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      }}
      showsUserLocation
      loadingEnabled
    >
      <Marker
        coordinate={{
          latitude: location.location.lat,
          longitude: location.location.lng,
        }}
      />
    </MapView>
  )
}

export default SmallMapWithMarker

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: 150,
  },
})
