import { StyleSheet, View, TouchableHighlight, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Avatar, Button, Text, useTheme } from 'react-native-paper'
import { auth, db, storage } from '../db/firebase'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth'
import { HomeTabParamList } from './HomeTabs'
import { CompositeScreenProps } from '@react-navigation/native'
import { MaterialBottomTabScreenProps } from '@react-navigation/material-bottom-tabs'
import { MainStackParamList } from '../main/Main'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import {
  launchImageLibraryAsync,
  MediaTypeOptions,
  requestMediaLibraryPermissionsAsync,
} from 'expo-image-picker'
import { doc, updateDoc } from 'firebase/firestore'

type Props = CompositeScreenProps<
  MaterialBottomTabScreenProps<HomeTabParamList, 'SettingsTab'>,
  NativeStackScreenProps<MainStackParamList>
>

const SettingsTab = ({ navigation }: Props) => {
  const theme = useTheme()

  const [displayName, setDisplayName] = useState('')
  const [photoURL, setPhotoURL] = useState('')
  const handleLogout = () => {
    signOut(auth).then(() => {
      navigation.replace('Login')
    })
  }

  useEffect(() => {
    if (auth.currentUser?.photoURL) {
      setPhotoURL(auth.currentUser.photoURL)
    }
  }, [auth.currentUser])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setDisplayName(user.displayName ?? '')
      }
    })

    return unsubscribe
  }, [])

  const upload = async (uid: string | undefined) => {
    if (uid != undefined) {
      const { status } = await requestMediaLibraryPermissionsAsync()

      if (status != 'granted') {
        return
      }

      const { canceled, assets } = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        allowsMultipleSelection: false,
      })

      if (canceled) {
        return
      }

      const res = await fetch(assets[0].uri)
      const pic = await res.blob()

      const fileRef = ref(storage, uid + '.png')

      const snapshot = await uploadBytes(fileRef, pic)

      const photoURL = await getDownloadURL(fileRef)

      if (auth.currentUser != null) {
        updateProfile(auth.currentUser, { photoURL })
        updateDoc(doc(db, 'users', uid), { photoURL })
        setPhotoURL(photoURL)
      }
    } else {
      Alert.alert('error')
    }
  }

  return (
    <View style={styles.container}>
      <>
        {auth.currentUser != null && photoURL == '' ? (
          <TouchableHighlight
            onPress={() => {
              upload(auth.currentUser?.uid)
            }}
            underlayColor={theme.colors.background}
          >
            <View>
              <Avatar.Text size={100} label={displayName} />
            </View>
          </TouchableHighlight>
        ) : (
          <TouchableHighlight
            onPress={() => {
              upload(auth.currentUser?.uid)
            }}
            underlayColor={theme.colors.background}
          >
            <View>
              <Avatar.Image size={100} source={{ uri: photoURL }} />
            </View>
          </TouchableHighlight>
        )}
      </>
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
