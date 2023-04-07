import { StyleSheet, View } from 'react-native'
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
  const [routeDuration, setRouteDuration] = useState()
  const [prefferedMode, setPrefferedMode] = useState('transit')
  const [useArrTime, setUseArrTime] = useState(false)
  const [openRouteDetails, setOpenRouteDetails] = useState(true)

  const mapRef = useRef<MapView>(null)

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
    setCoords({
      latitude: event.location.location.lat ?? 0,
      longitude: event.location.location.lng ?? 0,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })

    getCurrentPositionAsync().then((location) => {
      setLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      })
    })

    if (moment().isAfter(moment(event.startDate.toDate()).subtract(1, 'days'))) {
      setUpcoming(true)
    } else {
      setUpcoming(false)
    }

    return () => {}
  }, [])

  const getDirections = async (startLoc: { lat: number; lng: number }) => {
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
        setRouteDuration(resp.data.routes[0].legs[0].duration.text)
        // console.log(coordsArr)
        return coordsArr
      })
      .catch((error) => {
        console.log(error)
        return error
      })
  }

  const handleChange = (value: string) => {
    if (value !== null) {
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
              <Checkbox.Item
                style={styles.checkbox}
                label="Use Arrival Time"
                status={useArrTime ? 'checked' : 'unchecked'}
                onPress={() => {
                  setUseArrTime(!useArrTime)
                }}
              />
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
              <Text style={styles.title}>It will take {routeDuration} to get there!</Text>
            )}
            <View style={styles.container}>
              <Button
                mode="contained"
                style={styles.buttons}
                onPress={() => {
                  getDirections(location)
                }}
              >
                Calculate Route
              </Button>
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
