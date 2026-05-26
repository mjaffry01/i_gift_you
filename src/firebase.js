import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyC_ARA5butf4DGMFeENeZeyV7BLWOu3UR4",
  authDomain: "i-gift-you-cfc5a.firebaseapp.com",
  projectId: "i-gift-you-cfc5a",
  storageBucket: "i-gift-you-cfc5a.firebasestorage.app",
  messagingSenderId: "944787707852",
  appId: "1:944787707852:web:61ec602fc46a1b6b96af69",
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app)

export default app
