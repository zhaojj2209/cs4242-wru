import { Alert, Keyboard, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import React, { useState } from 'react'
import { Button, Text, TextInput } from 'react-native-paper'
import { auth, db } from '../db/firebase'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { MainStackParamList } from '../main/Main'
import { doc, setDoc } from 'firebase/firestore'

type Props = NativeStackScreenProps<MainStackParamList, 'Register'>

const RegisterScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordRepeat, setPasswordRepeat] = useState('')
  const [displayName, setDisplayName] = useState('')

  const DEFAULT_PFP_URL =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/680px-Default_pfp.svg.png'

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
        setEmail('')
        setPassword('')
        setPasswordRepeat('')
        setDisplayName('')

        updateProfile(user, {
          displayName,
          photoURL: DEFAULT_PFP_URL,
        })

        setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName,
          photoURL: DEFAULT_PFP_URL,
        })
          .then(() => {
            Alert.alert('Account created!', '', [
              {
                text: 'OK',
                onPress: () => navigation.navigate('Home'),
              },
            ])
          })
          .catch((error) => Alert.alert(error))
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
            autoCapitalize="none"
            secureTextEntry
          />
          <TextInput
            placeholder="Re-enter Password"
            value={passwordRepeat}
            onChangeText={setPasswordRepeat}
            style={styles.input}
            autoCapitalize="none"
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
