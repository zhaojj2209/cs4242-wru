import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Button } from 'react-native-paper'
import { auth } from '../db/firebase'
import { MainStackParamList } from '../main/Main'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { signOut } from 'firebase/auth'

type Props = NativeStackScreenProps<MainStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigation.replace('Login')
      })
  }
  return (
    <View style={styles.container}>
      <Text>Email: {auth.currentUser?.email}</Text>
      <Button mode="outlined" onPress={handleLogout} style={styles.button}>
        Log out
      </Button>
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    margin: 5,
  },
})
