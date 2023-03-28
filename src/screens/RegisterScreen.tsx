import { Alert, Keyboard, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import { createUserWithEmailAndPassword, onAuthStateChanged, updateProfile } from 'firebase/auth'
import React, { useEffect, useState } from 'react'
import { Button, Text, TextInput } from 'react-native-paper'
import { auth } from '../db/firebase'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { MainStackParamList } from '../main/Main'

type Props = NativeStackScreenProps<MainStackParamList, 'Register'>

const RegisterScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordRepeat, setPasswordRepeat] = useState('')
  const [displayName, setDisplayName] = useState('')

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

  const handleRegister = () => {
    if (passwordRepeat !== password) {
      Alert.alert('Error: Passwords do not match!')
      return
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user
        if (displayName.length > 0) {
          updateProfile(user, { displayName })
        }
        Alert.alert('Account created!')
      })
      .catch((error) => Alert.alert(formatError(error.message)))
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text variant="headlineLarge" style={styles.titleText}>
          Register
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
          <TextInput
            placeholder="Re-enter Password"
            value={passwordRepeat}
            onChangeText={setPasswordRepeat}
            style={styles.input}
            secureTextEntry
          />
          <TextInput
            placeholder="Display Name (Optional)"
            value={displayName}
            onChangeText={setDisplayName}
            style={styles.input}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button mode="contained" onPress={handleRegister} style={styles.button}>
            Register
          </Button>
        </View>
        <View style={styles.navigateContainer}>
          <Text variant="bodyLarge">Already have an account?</Text>
          <Button onPress={() => navigation.goBack()}>Log In</Button>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

export default RegisterScreen

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
