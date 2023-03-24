import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const CreateChatScreen = () => {
  return (
    <View style={styles.container}>
      <Text>CreateChatScreen</Text>
    </View>
  )
}

export default CreateChatScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})