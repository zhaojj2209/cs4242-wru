import { Platform, StyleSheet, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Button,
  Card,
  Checkbox,
  Divider,
  RadioButton,
  Text,
  ToggleButton,
} from 'react-native-paper'
import { EventChat } from '../util/types'
import MapView, { Marker, Polyline } from 'react-native-maps'
import { getCurrentPositionAsync } from 'expo-location'
import axios from 'axios'
import { decode } from '@mapbox/polyline'
import { createMapLink, createOpenLink } from 'react-native-open-maps'
import moment from 'moment'
import { api_key } from '../../config'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { Subscription } from 'expo-notifications/build/Notifications.types'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

interface Props {
  event: EventChat
}

const ChatDirectionsCard = ({ event }: Props) => {
  const [upcoming, setUpcoming] = useState(false)
  const [location, setLocation] = useState({
    lat: 0,
    lng: 0,
  })
  const [directions, setDirections] = useState([
    {
      latitude: 0,
      longitude: 0,
    },
  ])
  const [loading, setLoading] = useState(true)
  const [routeLoaded, setRouteLoaded] = useState(false)
  const [routeReload, setRouteReload] = useState(false)
  const [routeDuration, setRouteDuration] = useState({
    text: '',
    value: 0,
  })
  const [prefferedMode, setPrefferedMode] = useState('transit')
  const [useArrTime, setUseArrTime] = useState(true)
  const [openRouteDetails, setOpenRouteDetails] = useState(true)

  const mapRef = useRef<MapView>(null)

  //Notifications
  const [expoPushToken, setExpoPushToken] = useState('')
  const [notification, setNotification] = useState<Notifications.Notification>()
  const notificationListener = useRef<Subscription>()
  const responseListener = useRef<Subscription>()

  const sgCoords = {
    // Taken from google
    latitude: 1.3521,
    longitude: 103.8198,
    // Rough estimate to fit entire Sg map
    latitudeDelta: 0.8,
    longitudeDelta: 0.1,
  }

  const [coords, setCoords] = useState(sgCoords)

  useEffect(() => {
    //Notifications
    registerForPushNotificationsAsync().then((token) => setExpoPushToken(token ?? ''))

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification)
    })

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response)
    })

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current)
      }

      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current)
      }
    }
  }, [])

  useEffect(() => {
    setCoords({
      latitude: event.location.location.lat ?? 0,
      longitude: event.location.location.lng ?? 0,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })

    //Route and Event Details
    getCurrentPositionAsync().then((location) => {
      setLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      })
      setLoading(false)
    })

    if (moment().isAfter(moment(event.startDate.toDate()).subtract(1, 'days'))) {
      if (!loading && !routeLoaded) {
        getDirections(location)
        setRouteLoaded(true)
      }
      setUpcoming(true)
    } else {
      setUpcoming(false)
    }

    if (routeReload) {
      getDirections(location)
      setRouteReload(false)
    }

    //Notifications
    return () => {}
  }, [location, routeReload])

  const getDirections = async (startLoc: { lat: number; lng: number }) => {
    var arrTimeStr = useArrTime ? '&arrival_time=' + event.startDate.seconds : ''
    const confg = {
      method: 'get',
      url:
        'https://maps.googleapis.com/maps/api/directions/json?origin=' +
        startLoc.lat +
        ',' +
        startLoc.lng +
        '&destination=place_id:' +
        event.location.placeId +
        '&mode=' +
        prefferedMode +
        arrTimeStr +
        '&key=' +
        api_key,
      headers: {},
    }

    axios(confg)
      .then((resp) => {
        // let respJson = JSON.stringify(resp.data)
        let points = decode(resp.data.routes[0].overview_polyline.points)
        let coordsArr = points.map((point, index) => {
          return {
            latitude: point[0],
            longitude: point[1],
          }
        })

        setDirections(coordsArr)
        // console.log('duration: ' + resp.data.routes[0].legs[0].duration.text)
        setRouteDuration({
          text: resp.data.routes[0].legs[0].duration.text,
          value: resp.data.routes[0].legs[0].duration.value,
        })
        // console.log(coordsArr)
        if (mapRef.current) {
          mapRef.current.fitToCoordinates(
            [
              { latitude: location.lat, longitude: location.lng },
              { latitude: coords.latitude, longitude: coords.longitude },
            ],
            {
              animated: true,
            }
          )
        }

        //Notification
        const timeToLeave = moment(event.startDate.toDate()).subtract(
          resp.data.routes[0].legs[0].duration.value,
          'seconds'
        )
        const timeToNotify = timeToLeave.subtract(10, 'minutes')
        const triggerAt = timeToNotify.diff(moment(), 'seconds')
        console.log(resp.data.routes[0].legs[0].duration.value)
        console.log(timeToNotify.toLocaleString())
        console.log(triggerAt)

        //if already scheduled, update
        Notifications.getAllScheduledNotificationsAsync().then((ntfArr) => {
          const filteredNtfArr = ntfArr.filter((ele) => {
            return ele.content.data.eventID == event.id
          })
          filteredNtfArr.forEach((ele) => {
            Notifications.cancelScheduledNotificationAsync(ele.identifier)
          })
        })
        if (triggerAt > 0) {
          schedulePushNotification(
            event.title,
            event.startDate.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            event.id,
            triggerAt
          ).then(() => {
            return coordsArr
          })
        }
      })
      .catch((error) => {
        console.log(error)
        return error
      })
  }

  const handleChange = (value: string) => {
    if (value !== null) {
      setRouteReload(true)
      setPrefferedMode(value)
    }
  }

  const calculateTimeToEvent = () => {
    var eventTime = moment(event.startDate.toDate())
    return eventTime.fromNow()
  }

  return (
    <Card mode="elevated" style={styles.card}>
      <Card.Title
        title={event.title + ' starts ' + calculateTimeToEvent()}
        titleVariant="titleLarge"
        style={styles.title}
      />
      <Card.Content>
        {!upcoming && <Text style={styles.text}>Rest easy!</Text>}
        {upcoming && openRouteDetails && (
          <View>
            <Text style={styles.text} variant="bodyMedium">
              Start planning your trip:
            </Text>
            <View style={styles.container}>
              <Text variant="bodyMedium">Mode:</Text>
              <ToggleButton.Row
                onValueChange={(value) => handleChange(value)}
                value={prefferedMode}
                style={styles.buttons}
              >
                <ToggleButton icon="car" value="driving" />
                <ToggleButton icon="bus" value="transit" />
              </ToggleButton.Row>
              {/* <Checkbox.Item
                style={styles.checkbox}
                label="Use Arrival Time"
                status={useArrTime ? 'checked' : 'unchecked'}
                onPress={() => {
                  setUseArrTime(!useArrTime)
                }}
              /> */}
              <Button
                mode="contained-tonal"
                style={styles.buttons}
                onPress={createOpenLink({
                  provider: 'google',
                  start: location.lat + ',' + location.lng,
                  end: event.location.description,
                  travelType: prefferedMode === 'transit' ? 'public_transport' : 'drive',
                })}
              >
                Open Route
              </Button>
            </View>
            <MapView
              ref={mapRef}
              provider="google"
              style={styles.map}
              initialRegion={coords}
              showsUserLocation
              onLayout={() => {
                if (mapRef.current) {
                  mapRef.current.fitToCoordinates(
                    [
                      { latitude: location.lat, longitude: location.lng },
                      { latitude: coords.latitude, longitude: coords.longitude },
                    ],
                    {
                      animated: true,
                    }
                  )
                }
              }}
            >
              <Polyline coordinates={directions} strokeWidth={2} strokeColor="red" />
              <Marker
                coordinate={{
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                }}
                title={event.title}
              ></Marker>
            </MapView>
            {routeDuration == undefined && (
              <Text style={styles.title}>
                Calculate your route and how long it will take you to get there!
              </Text>
            )}
            {routeDuration != undefined && (
              <Text style={styles.title}>It will take {routeDuration.text} to get there!</Text>
            )}
            <View style={styles.container}>
              {/* <Button
                mode="contained"
                style={styles.buttons}
                onPress={() => {
                  getDirections(location)
                }}
              >
                Calculate Route
              </Button>
              <Button
                onPress={
                  async () => {
                    const timeToLeave = moment(event.startDate.toDate()).subtract(routeDuration.value, 'seconds')
                    const timeToNotify = timeToLeave.subtract(10, 'minutes')
                    const triggerAt = timeToNotify.diff(moment(), 'seconds')
                    console.log(timeToNotify.toLocaleString())
                    console.log(triggerAt)

                    //if already scheduled, update
                    Notifications.getAllScheduledNotificationsAsync().then((ntfArr) => {
                      const filteredNtfArr = ntfArr.filter(ele => { return (ele.content.data.eventID == event.id)})
                      filteredNtfArr.forEach((ele) => { Notifications.cancelScheduledNotificationAsync(ele.identifier) })
                    })
                    await schedulePushNotification(
                      event.title, 
                      event.startDate.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                      event.id,
                      triggerAt
                    );
                  }
                }
              >Press to schedule a notification</Button> */}
              <Button
                onPress={() => {
                  Notifications.cancelAllScheduledNotificationsAsync()
                }}
              >
                Cancel All Notifications
              </Button>
              <Button
                onPress={() => {
                  Notifications.getAllScheduledNotificationsAsync().then((res) => {
                    console.log(res)
                  })
                }}
              >
                Get All Notifications
              </Button>
            </View>

            <Button icon="menu-up" onPress={() => setOpenRouteDetails(false)}>
              Close
            </Button>
          </View>
        )}

        {upcoming && !openRouteDetails && (
          <Button icon="menu-down" onPress={() => setOpenRouteDetails(true)}>
            Open Route Panner
          </Button>
        )}
      </Card.Content>
    </Card>
  )
}

async function schedulePushNotification(
  eventTitle: String,
  eventStart: String,
  eventID: string,
  triggerAt: number
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Get Ready to Head Off! 🏃‍♂️',
      body: 'Leave in about 10 mins to reach on time! ' + eventTitle + ' starts at ' + eventStart,
      data: {
        eventID: eventID,
      },
    },
    trigger: {
      seconds: triggerAt,
    },
  })
}

async function registerForPushNotificationsAsync() {
  let token
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!')
      return
    }
    token = (await Notifications.getExpoPushTokenAsync()).data
    console.log(token)
  } else {
    alert('Must use physical device for Push Notifications')
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      // sound: true,
      lightColor: '#FF231F7C',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
    })
  }

  return token
}

export default ChatDirectionsCard

const styles = StyleSheet.create({
  card: {
    margin: 10,
  },
  title: {
    marginTop: 10,
  },
  map: {
    width: '100%',
    height: 150,
  },
  text: {
    marginBottom: 10,
  },
  buttons: {
    margin: 10,
    alignItems: 'center',
  },
  checkbox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
