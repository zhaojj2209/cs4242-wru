import { StyleSheet } from 'react-native'
import React from 'react'
import { Card, Divider, Text } from 'react-native-paper'
import { EventChat } from '../util/types'
import SmallMapWithMarker from './SmallMapWithMarker'

interface Props {
  details: EventChat
}

const EventDetailsCard = ({ details }: Props) => {
  return (
    <Card style={styles.details} mode="outlined">
      <Card.Content>
        <Text variant="titleMedium" style={styles.text}>
          Description: {details.description}
        </Text>
        <Divider />
        <Text variant="titleMedium" style={styles.text}>
          Start date: {details.startDate.toDate().toLocaleDateString()}{' '}
          {details.startDate.toDate().toLocaleTimeString()}
        </Text>
        <Divider />
        <Text variant="titleMedium" style={styles.text}>
          End date: {details.endDate.toDate().toLocaleDateString()}{' '}
          {details.endDate.toDate().toLocaleTimeString()}
        </Text>
        <Divider />
        <Text variant="titleMedium" style={styles.text}>
          Location: {details.location.description}
        </Text>
        <SmallMapWithMarker location={details.location} />
      </Card.Content>
    </Card>
  )
}

export default EventDetailsCard

const styles = StyleSheet.create({
  details: {
    margin: 10,
  },
  text: {
    paddingVertical: 10,
  },
})
