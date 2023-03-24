import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const DiscoverTab = () => {
  return (
    <View style={styles.container}>
      <Text>Discover Screen</Text>
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
})
