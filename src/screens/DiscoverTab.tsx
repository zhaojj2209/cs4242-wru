import { StyleSheet, View } from 'react-native'
import React from 'react'
import MapView from 'react-native-maps'

const DiscoverTab = () => {
  return (
    <View style={styles.container}>
      <MapView provider="google" style={styles.map} />
    </View>
  )
}

export default DiscoverTab

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
})
