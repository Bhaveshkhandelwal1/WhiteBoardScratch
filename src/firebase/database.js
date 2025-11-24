import { ref, set, push, onValue, remove, update } from 'firebase/database'
import { database } from './config'

export const createRoom = (roomId, hostId) => {
  const roomRef = ref(database, `rooms/${roomId}`)
  return set(roomRef, {
    hostId,
    createdAt: Date.now(),
    strokes: {}
  })
}

export const joinRoom = (roomId, userId) => {
  const roomRef = ref(database, `rooms/${roomId}`)
  return new Promise((resolve, reject) => {
    onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        resolve(snapshot.val())
      } else {
        reject(new Error('Room not found'))
      }
    }, { onlyOnce: true })
  })
}

export const addStroke = (roomId, stroke) => {
  const strokesRef = ref(database, `rooms/${roomId}/strokes`)
  return push(strokesRef, stroke)
}

export const removeStroke = (roomId, strokeId) => {
  const strokeRef = ref(database, `rooms/${roomId}/strokes/${strokeId}`)
  return remove(strokeRef)
}

export const clearCanvas = (roomId) => {
  const strokesRef = ref(database, `rooms/${roomId}/strokes`)
  const textsRef = ref(database, `rooms/${roomId}/texts`)
  return Promise.all([
    set(strokesRef, {}),
    set(textsRef, {})
  ])
}

export const subscribeToRoom = (roomId, callback) => {
  const roomRef = ref(database, `rooms/${roomId}`)
  return onValue(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val())
    }
  })
}

export const addTextAnnotation = (roomId, textData) => {
  const textsRef = ref(database, `rooms/${roomId}/texts`)
  return push(textsRef, textData)
}

export const removeTextAnnotation = (roomId, textId) => {
  const textRef = ref(database, `rooms/${roomId}/texts/${textId}`)
  return remove(textRef)
}

export const subscribeToTexts = (roomId, callback) => {
  const textsRef = ref(database, `rooms/${roomId}/texts`)
  return onValue(textsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val())
    } else {
      callback({})
    }
  })
}

