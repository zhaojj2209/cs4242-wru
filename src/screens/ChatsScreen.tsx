import { View, StyleSheet } from 'react-native'
import React from 'react'
import { Button } from 'react-native-paper'
import { ChatsStackParamList } from './ChatsTab'
import { NativeStackScreenProps } from '@react-navigation/native-stack'

type Props = NativeStackScreenProps<ChatsStackParamList, 'Chats'>

const ChatsScreen = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      <Button onPress={() => navigation.navigate('CreateChat')}>Create Event Chat</Button>
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
