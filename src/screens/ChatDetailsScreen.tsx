import { Alert, StyleSheet, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { ActivityIndicator, Appbar, Card, Divider, Text } from 'react-native-paper'
import { HomeStackParamList } from './HomeScreen'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useFocusEffect } from '@react-navigation/native'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../db/firebase'
import { EventChat } from '../util/types'

type Props = NativeStackScreenProps<HomeStackParamList, 'ChatDetails'>

const ChatDetailsScreen = ({ route, navigation }: Props) => {
  const { chatID } = route.params
  const [details, setDetails] = useState<EventChat | null>(null)
  const [loading, setLoading] = useState(false)

  useFocusEffect(
    useCallback(() => {
      if (!chatID) {
        Alert.alert('Error: Event does not exist!')
        navigation.goBack()
        return
      }
      setLoading(true)
      const docRef = doc(db, 'chats', chatID)
      getDoc(docRef)
        .then((document) => {
          if (document.exists()) {
            const data = document.data()
            setDetails({
              id: chatID,
              ...data,
            } as EventChat)
            setLoading(false)
          } else {
            Alert.alert('Error: Event does not exist!')
            navigation.goBack()
            setLoading(false)
          }
        })
    }, [])
  )

  return (
    <View style={styles.container}>
      <Appbar.Header mode="center-aligned" elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`${details?.title ?? ''} Chat Details`} />
        <Appbar.Action
          icon="square-edit-outline"
          onPress={() => {}}
        />
      </Appbar.Header>
      {loading && <ActivityIndicator />}
      {!loading && (
        <Card style={styles.details}>
          <Card.Content>
            <Text variant='titleMedium' style={styles.text}>
              Description: {details?.description}
            </Text>
            <Divider />
            <Text variant='titleMedium' style={styles.text}>
              Start date: {details?.startDate.toDate().toLocaleDateString()} {details?.startDate.toDate().toLocaleTimeString()}
            </Text>
            <Divider />
            <Text variant='titleMedium' style={styles.text}>
              End date: {details?.endDate.toDate().toLocaleDateString()} {details?.endDate.toDate().toLocaleTimeString()}
            </Text>
          </Card.Content>
        </Card>
      )}
      <View style={styles.details}>
        <Text variant="titleLarge">Members:</Text>
        <Card style={styles.members}>
          <Card.Content>

          </Card.Content>
        </Card>
      </View>
    </View>
  )
}

export default ChatDetailsScreen

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
  members: {
    marginTop: 20,
  }
})
