import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const ChatsScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Chats Screen</Text>
    </View>
  )
}

export default ChatsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
