import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDQTPICOlUqlsMc8c3VPZqMHtc3VDNiQxo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "whiteboardscratch.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://whiteboardscratch-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "whiteboardscratch",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "whiteboardscratch.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "280112077398",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:280112077398:web:7ab66362b7735b25b539f7",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-6EC30RDXF4"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Analytics (only in browser environment)
let analytics = null
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app)
}

export const auth = getAuth(app)
export const database = getDatabase(app)
export { analytics }

