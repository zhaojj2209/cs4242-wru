import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Button } from 'react-native-paper'
import { auth } from '../db/firebase'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { signOut } from 'firebase/auth'
import { HomeTabParamList } from './HomeScreen'
import { CompositeScreenProps } from '@react-navigation/native'
import { MaterialBottomTabScreenProps } from '@react-navigation/material-bottom-tabs'
import { MainStackParamList } from '../main/Main'

type Props = CompositeScreenProps<
  MaterialBottomTabScreenProps<HomeTabParamList, 'Settings'>,
  NativeStackScreenProps<MainStackParamList>
>

const SettingsScreen = ({ navigation }: Props) => {
  const handleLogout = () => {
    signOut(auth).then(() => {
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

export default SettingsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    margin: 5,
  },
})
