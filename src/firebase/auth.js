import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from './config'

export const signUp = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password)
}

export const signIn = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password)
}

export const logout = () => {
  return signOut(auth)
}

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}

