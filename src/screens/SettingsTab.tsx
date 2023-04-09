import { StyleSheet, View, TouchableHighlight, Alert, SafeAreaView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Avatar, Button, IconButton, Text, TextInput, useTheme } from 'react-native-paper'
import { auth, db, storage } from '../db/firebase'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { signOut, updateProfile } from 'firebase/auth'
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
import { DEFAULT_PFP_URL } from '../util/const'
import { requestForegroundPermissionsAsync } from 'expo-location'
import * as Notifications from 'expo-notifications'

type Props = CompositeScreenProps<
  MaterialBottomTabScreenProps<HomeTabParamList, 'SettingsTab'>,
  NativeStackScreenProps<MainStackParamList>
>

const SettingsTab = ({ navigation }: Props) => {
  const theme = useTheme()

  const [displayName, setDisplayName] = useState('')
  const [photoURL, setPhotoURL] = useState(DEFAULT_PFP_URL)
  const [isEditDisplayName, setIsEditDisplayName] = useState(false)
  const [hasLocPerms, setHasLocPerms] = useState(false)
  const [hasNotifPerms, setHasNotifPerms] = useState(false)

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigation.replace('Login')
    })
  }

  useEffect(() => {
    requestForegroundPermissionsAsync().then(({ status }) => setHasLocPerms(status === 'granted'))
  }, [])

  useEffect(() => {
    Notifications.getPermissionsAsync().then(({ status }) => setHasNotifPerms(status === 'granted'))
  }, [])

  useEffect(() => {
    if (auth.currentUser?.photoURL) {
      setPhotoURL(auth.currentUser.photoURL)
    }
    if (auth.currentUser?.displayName) {
      setDisplayName(auth.currentUser.displayName)
    }
  }, [auth.currentUser])

  const upload = async (uid: string | undefined) => {
    if (uid != undefined) {
      const { status } = await requestMediaLibraryPermissionsAsync()

      if (status !== 'granted') {
        Alert.alert(
          'Unable to Access Photo Library',
          "Please enable photo library permissions via your device's Settings page."
        )
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

  const handleEditDisplayName = () => {
    if (isEditDisplayName) {
      setIsEditDisplayName(false)
      if (auth.currentUser != null && displayName !== auth.currentUser.displayName) {
        updateProfile(auth.currentUser, { displayName })
        updateDoc(doc(db, 'users', auth.currentUser.uid), { displayName })
      }
    } else {
      setIsEditDisplayName(true)
    }
  }

  const handleCancelEdit = () => {
    setIsEditDisplayName(false)
    setDisplayName(auth.currentUser?.displayName ?? '')
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableHighlight
        onPress={() => {
          upload(auth.currentUser?.uid)
        }}
        underlayColor={theme.colors.background}
      >
        <View style={styles.pfp}>
          <Avatar.Image size={100} source={{ uri: photoURL }} />
          <Text>Tap to change picture</Text>
        </View>
      </TouchableHighlight>
      <View style={styles.setting}>
        <View style={styles.header}>
          <Text variant="bodyLarge">Display Name:</Text>
          <IconButton
            icon={isEditDisplayName ? 'content-save' : 'pencil'}
            onPress={handleEditDisplayName}
          />
          {isEditDisplayName && (
            <IconButton
              icon="close-thick"
              onPress={handleCancelEdit}
            />
          )}
        </View>
        <TextInput
          value={displayName}
          onChangeText={(text) => setDisplayName(text)}
          disabled={!isEditDisplayName}
        />
      </View>
      <View style={styles.row}>
        <Text variant="bodyLarge">Email:</Text>
        <Text variant="bodyLarge">{auth.currentUser?.email}</Text>
      </View>
      <View style={styles.row}>
        <View style={styles.setting}>
          <Text variant="bodyLarge">Allow App to Use Location:</Text>
          <Text>(You may change this in your device&apos;s settings)</Text>
        </View>
        <Text variant="bodyLarge">{hasLocPerms ? 'Yes' : 'No'}</Text>
      </View>
      <View style={styles.row}>
        <View style={styles.setting}>
          <Text variant="bodyLarge">Allow Notifications:</Text>
          <Text>(You may change this in your device&apos;s settings)</Text>
        </View>
        <Text variant="bodyLarge">{hasNotifPerms ? 'Yes' : 'No'}</Text>
      </View>
      <Button mode="outlined" onPress={handleLogout} style={styles.button}>
        Log Out
      </Button>
    </SafeAreaView>
  )
}

export default SettingsTab

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  button: {
    margin: 5,
  },
  pfp: {
    alignItems: 'center',
    marginTop: 20,
  },
  setting: {
    width: '80%',
  },
  row: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
