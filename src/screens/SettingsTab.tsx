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

type Props = CompositeScreenProps<
  MaterialBottomTabScreenProps<HomeTabParamList, 'SettingsTab'>,
  NativeStackScreenProps<MainStackParamList>
>

const SettingsTab = ({ navigation }: Props) => {
  const theme = useTheme()

  const [displayName, setDisplayName] = useState('')
  const [photoURL, setPhotoURL] = useState('')
  const [isEditDisplayName, setIsEditDisplayName] = useState(false)

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigation.replace('Login')
    })
  }

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

  const handleEditDisplayName = () => {
    if (isEditDisplayName) {
      setIsEditDisplayName(false)
      if (auth.currentUser != null) {
        updateProfile(auth.currentUser, { displayName })
        updateDoc(doc(db, 'users', auth.currentUser.uid), { displayName })
      }
    } else {
      setIsEditDisplayName(true)
    }
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
        <Text variant="bodyLarge" style={styles.text}>
          Email:
        </Text>
        <Text variant="bodyLarge" style={styles.text}>
          {auth.currentUser?.email}
        </Text>
      </View>
      <View style={styles.setting}>
        <View style={styles.header}>
          <Text variant="bodyLarge" style={styles.text}>
            Display Name:
          </Text>
          <IconButton
            icon={isEditDisplayName ? 'content-save' : 'pencil'}
            onPress={handleEditDisplayName}
          />
        </View>
        {isEditDisplayName ? (
          <TextInput value={displayName} onChangeText={(text) => setDisplayName(text)} />
        ) : (
          <Text variant="bodyLarge" style={styles.text}>
            {displayName.length > 0 ? displayName : 'None'}
          </Text>
        )}
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
  },
  setting: {
    width: '80%',
  },
  text: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
