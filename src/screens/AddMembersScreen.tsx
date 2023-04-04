import { Alert, Keyboard, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Appbar, Avatar, Checkbox, List, Searchbar } from 'react-native-paper'
import { HomeStackParamList } from './HomeScreen'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore'
import { db } from '../db/firebase'
import { User } from '../util/types'

type Props = NativeStackScreenProps<HomeStackParamList, 'AddMembers'>

type CheckboxMap = { [key: string]: boolean }

const AddMembersScreen = ({ route, navigation }: Props) => {
  const { chatID, members } = route.params
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [checkboxMap, setCheckboxMap] = useState<CheckboxMap>({})
  const [searchedUsers, setSearchedUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')

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

  useEffect(() => {
    if (searchQuery.length === 0) {
      return
    }
    const usersToDisplay: User[] = []
    users.forEach((user) => {
      if (user.displayName.toLowerCase().includes(searchQuery.toLowerCase())) {
        usersToDisplay.push(user)
      } else if (user.email.toLowerCase().includes(searchQuery.toLowerCase())) {
        usersToDisplay.push(user)
      }
    })
    setSearchedUsers(usersToDisplay)
  }, [searchQuery])

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
            members: members.concat(usersToAdd),
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Appbar.Header mode="center-aligned" elevated>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Add Members" />
          <Appbar.Action icon="check" onPress={handleConfirm} />
        </Appbar.Header>
        <Searchbar
          placeholder="Search"
          mode="view"
          onChangeText={setSearchQuery}
          value={searchQuery}
        />
        {loading && <ActivityIndicator />}
        <List.Section>
          {searchedUsers.map((user) => (
            <List.Item
              key={user.uid}
              title={user.displayName.length > 0 ? user.displayName : user.email}
              description={user.displayName.length > 0 ? user.email : ''}
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
      </View>
    </TouchableWithoutFeedback>
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
