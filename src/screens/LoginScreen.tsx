import { Alert, Keyboard, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import React, { useEffect, useState } from 'react'
import { Button, Text, TextInput } from 'react-native-paper'
import { auth } from '../db/firebase'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { MainStackParamList } from '../main/Main'

type Props = NativeStackScreenProps<MainStackParamList, 'Login'>

const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.navigate('Home')
      }
    })

    return unsubscribe
  }, [])

  const formatError = (msg: string) => {
    const msgCode = msg.split('auth/')[1]
    return `Error: ${msgCode.replaceAll('-', ' ').replace(').', '!')}`
  }

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user
        console.log('Logged in with ' + user.email)
      })
      .catch((error) => Alert.alert(formatError(error.message)))
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text variant="headlineLarge" style={styles.titleText}>
          Log In
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button mode="contained" onPress={handleLogin} style={styles.button}>
            Log In
          </Button>
        </View>
        <View style={styles.navigateContainer}>
          <Text variant="bodyLarge">Don&apos;t have an account?</Text>
          <Button onPress={() => navigation.navigate('Register')}>Register</Button>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

export default LoginScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    width: '80%',
  },
  titleText: {
    width: '75%',
    marginBottom: 40,
  },
  input: {
    margin: 5,
  },
  buttonContainer: {
    width: '60%',
    marginTop: 40,
  },
  button: {
    margin: 5,
  },
  navigateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
})
