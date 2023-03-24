import { Alert, KeyboardAvoidingView, StyleSheet, View } from 'react-native'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import React, { useEffect, useState } from 'react'
import { Button, TextInput } from 'react-native-paper'
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

  const handleRegister = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user
        console.log('Registered with ' + user.email)
      })
      .catch((error) => Alert.alert(error.message))
  }

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user
        console.log('Logged in with ' + user.email)
      })
      .catch((error) => Alert.alert(error.message))
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.inputContainer}>
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
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
        <Button mode="outlined" onPress={handleRegister} style={styles.button}>
          Register
        </Button>
      </View>
    </KeyboardAvoidingView>
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
  input: {
    margin: 5,
  },
  buttonContainer: {
    width: '60%',
    marginTop: 20,
  },
  button: {
    margin: 5,
  },
})
