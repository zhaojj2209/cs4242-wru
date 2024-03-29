// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage, ref } from 'firebase/storage'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAX_zu3_Vrou276r0STVppSI5gPLH3HJuI',
  authDomain: 'cs4242-wru.firebaseapp.com',
  projectId: 'cs4242-wru',
  storageBucket: 'cs4242-wru.appspot.com',
  messagingSenderId: '991486708321',
  appId: '1:991486708321:web:e870a889508d35db853820',
  measurementId: 'G-QKCGJLMX8L',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth()
const db = getFirestore(app)
const storage = getStorage(app)

export { auth, db, storage }
