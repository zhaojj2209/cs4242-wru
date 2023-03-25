import { StyleSheet, View } from 'react-native'
import React from 'react'
import { Button, Text } from 'react-native-paper'
import { auth } from '../db/firebase'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { signOut } from 'firebase/auth'
import { HomeTabParamList } from './HomeScreen'
import { CompositeScreenProps } from '@react-navigation/native'
import { MaterialBottomTabScreenProps } from '@react-navigation/material-bottom-tabs'
import { MainStackParamList } from '../main/Main'

type Props = CompositeScreenProps<
  MaterialBottomTabScreenProps<HomeTabParamList, 'SettingsTab'>,
  NativeStackScreenProps<MainStackParamList>
>

const SettingsTab = ({ navigation }: Props) => {
  const handleLogout = () => {
    signOut(auth).then(() => {
      navigation.replace('Login')
    })
  }
  return (
    <View style={styles.container}>
      <Text>Display Name: {auth.currentUser?.displayName}</Text>
      <Text>Email: {auth.currentUser?.email}</Text>
      <Button mode="outlined" onPress={handleLogout} style={styles.button}>
        Log Out
      </Button>
    </View>
  )
}

export default SettingsTab

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
