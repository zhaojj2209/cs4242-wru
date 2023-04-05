import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import MapScreen from './MapScreen'
import EventDetailsScreen from './EventDetailsScreen'
import { EventChat } from '../util/types'

export type DiscoverStackParamList = {
  Map: undefined
  EventDetails: {
    event: EventChat
  }
}

const Stack = createNativeStackNavigator<DiscoverStackParamList>()

const DiscoverTab = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen options={{ headerShown: false }} name="Map" component={MapScreen} />
      <Stack.Screen
        options={{ headerShown: false }}
        name="EventDetails"
        component={EventDetailsScreen}
      />
    </Stack.Navigator>
  )
}

export default DiscoverTab
