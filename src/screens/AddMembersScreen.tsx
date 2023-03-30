import { Alert, StyleSheet, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Appbar,
  Avatar,
  Checkbox,
  List,
} from 'react-native-paper'
import { HomeStackParamList } from './HomeScreen'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import {
  collection,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../db/firebase'
import { User } from '../util/types'

type Props = NativeStackScreenProps<HomeStackParamList, 'AddMembers'>

type CheckboxMap = { [key: string]: boolean }

const AddMembersScreen = ({ route, navigation }: Props) => {
  const { chatID, members } = route.params
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [checkboxMap, setCheckboxMap] = useState<CheckboxMap>({})

  const updateMap = (uid: string) => {
    setCheckboxMap({
      ...checkboxMap,
      [uid]: !checkboxMap[uid],
    })
  }

  useEffect(() => {
    setLoading(true)
    getDocs(collection(db, 'users')).then((docs) => {
      const users: User[] = []
      const map: CheckboxMap = {}
      docs.forEach((doc) => {
        const data = doc.data() as User
        if (!members.includes(data.uid)) {
          users.push(data)
          map[data.uid] = false
        }
      })
      setUsers(users)
      setCheckboxMap(map)
      setLoading(false)
    })
  }, [])

  const handleConfirm = () => {
    const usersToAdd: string[] = []
    Object.keys(checkboxMap).forEach((key) => {
      if (checkboxMap[key]) {
        usersToAdd.push(key)
      }
    })
    if (usersToAdd.length === 0) {
      Alert.alert('Please select one or more users to add!')
      return
    }
    Alert.alert('Confirm selection?', `Click "OK" to add ${usersToAdd.length} user(s).`, [
      {
        text: 'OK',
        onPress: () =>
          updateDoc(doc(db, 'chats', chatID), {
            members: members.concat(usersToAdd)
          })
            .then(() =>
              Alert.alert('Members added!', '', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ])
            )
            .catch((error) => Alert.alert(error)),
      },
      {
        text: 'Cancel',
      },
    ])
  }

  return (
    <View style={styles.container}>
      <Appbar.Header mode="center-aligned" elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Add Members" />
        <Appbar.Action icon="check" onPress={handleConfirm} />
      </Appbar.Header>
      {loading && <ActivityIndicator />}
      {!loading && (
        <List.Section>
          {users.map((user) => (
            <List.Item
              key={user.uid}
              title={user.displayName.length > 0 ? user.displayName : user.email}
              left={(props) => (
                <Avatar.Image {...props} size={48} source={{ uri: user.photoURL }} />
              )}
              right={(props) => (
                <Checkbox
                  {...props}
                  status={checkboxMap[user.uid] ? 'checked' : 'unchecked'}
                  onPress={() => updateMap(user.uid)}
                />
              )}
              onPress={() => updateMap(user.uid)}
            />
          ))}
        </List.Section>
      )}
    </View>
  )
}

export default AddMembersScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  details: {
    margin: 20,
  },
  text: {
    paddingVertical: 10,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  members: {
    marginTop: 20,
  },
  delete: {
    margin: 10,
    alignItems: 'center',
  },
})
