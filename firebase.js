// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { connectDatabaseEmulator, getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyBOM4Sb3h6aPfXCYWoOIz3GK_yWeX31AaA',
  authDomain: 'eko-homework-assignment-5.firebaseapp.com',
  databaseURL: 'https://eko-homework-assignment-5-default-rtdb.firebaseio.com',
  projectId: 'eko-homework-assignment-5',
  storageBucket: 'eko-homework-assignment-5.firebasestorage.app',
  messagingSenderId: '188679171265',
  appId: '1:188679171265:web:590462f964a0f95fe07840',
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)

if (import.meta.env.NODE_ENV === 'test') {
  connectDatabaseEmulator(db, 'localhost', 9000)
}
